use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::constants::*;
use crate::errors::PandaBattleError;
use crate::state::*;

/// Join the current round by paying entry fee
pub fn join_round(ctx: Context<JoinRound>) -> Result<()> {
    let game_config = &ctx.accounts.game_config;
    let game_round = &mut ctx.accounts.game_round;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);

    // Calculate late join penalty
    let time_since_start = clock.unix_timestamp - game_round.start_time;
    let (fee_multiplier, attr_penalty) = if time_since_start >= LATE_JOIN_TIER2 {
        (LATE_JOIN_FEE_TIER2, LATE_JOIN_ATTR_PENALTY_TIER2)
    } else if time_since_start >= LATE_JOIN_TIER1 {
        (LATE_JOIN_FEE_TIER1, LATE_JOIN_ATTR_PENALTY_TIER1)
    } else {
        (10000u64, 0u16) // 100%, no penalty
    };

    // Calculate actual entry fee
    let entry_fee = game_config
        .entry_fee
        .checked_mul(fee_multiplier)
        .ok_or(PandaBattleError::Overflow)?
        .checked_div(10000)
        .ok_or(PandaBattleError::Overflow)?;

    // Transfer entry fee to vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        entry_fee,
    )?;

    // Update prize pool
    game_round.prize_pool = game_round
        .prize_pool
        .checked_add(entry_fee)
        .ok_or(PandaBattleError::Overflow)?;
    game_round.player_count += 1;

    // Generate randomized attributes
    let (strength, speed, endurance, luck) = generate_random_attributes(
        &ctx.accounts.player.key(),
        clock.unix_timestamp,
        attr_penalty,
    );

    // Initialize player state
    player_state.player = ctx.accounts.player.key();
    player_state.round = game_round.key();
    player_state.strength = strength;
    player_state.speed = speed;
    player_state.endurance = endurance;
    player_state.luck = luck;
    player_state.turns = STARTING_TURNS;
    player_state.max_turns = MAX_TURNS;
    player_state.last_turn_regen = clock.unix_timestamp;
    player_state.last_battle = clock.unix_timestamp;
    player_state.battles_fought = 0;
    player_state.wins = 0;
    player_state.losses = 0;
    player_state.rewards_earned = 0;
    player_state.rewards_claimed = false;
    player_state.joined_at = clock.unix_timestamp;
    player_state.last_decay = clock.unix_timestamp;
    player_state.entry_fee_paid = entry_fee;
    player_state.bump = ctx.bumps.player_state;

    // Early bird bonus: extra turns
    if time_since_start < LATE_JOIN_TIER1 {
        player_state.turns = player_state.turns.saturating_add(2);
        if player_state.turns > player_state.max_turns {
            player_state.turns = player_state.max_turns;
        }
    }

    msg!(
        "Player {} joined round {}. Attributes: S:{} Sp:{} E:{} L:{}",
        ctx.accounts.player.key(),
        game_round.round_number,
        strength,
        speed,
        endurance,
        luck
    );

    Ok(())
}

/// Purchase additional turns
pub fn purchase_turns(ctx: Context<PurchaseTurns>, amount: u8) -> Result<()> {
    require!(amount > 0 && amount <= 5, PandaBattleError::TooManyTurns);

    let game_config = &ctx.accounts.game_config;
    let game_round = &mut ctx.accounts.game_round;
    let player_state = &mut ctx.accounts.player_state;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);

    // Check turn storage capacity
    let new_turns = player_state.turns.saturating_add(amount);
    require!(
        new_turns <= player_state.max_turns,
        PandaBattleError::TurnStorageFull
    );

    // Calculate progressive pricing
    let mut total_cost: u64 = 0;
    for i in 0..amount {
        let turn_number = player_state.turns + i + 1;
        let multiplier = match turn_number {
            1..=3 => 10000, // Base price
            4..=5 => TURN_PRICE_MULTIPLIER_2,
            _ => TURN_PRICE_MULTIPLIER_3,
        };

        let turn_cost = game_config
            .turn_base_price
            .checked_mul(multiplier)
            .ok_or(PandaBattleError::Overflow)?
            .checked_div(10000)
            .ok_or(PandaBattleError::Overflow)?;

        total_cost = total_cost
            .checked_add(turn_cost)
            .ok_or(PandaBattleError::Overflow)?;
    }

    // Transfer payment to vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        total_cost,
    )?;

    // Update state
    game_round.prize_pool = game_round
        .prize_pool
        .checked_add(total_cost)
        .ok_or(PandaBattleError::Overflow)?;
    player_state.turns = new_turns;

    msg!(
        "Player {} purchased {} turns for {} lamports",
        ctx.accounts.player.key(),
        amount,
        total_cost
    );

    Ok(())
}

/// Initiate a battle against another player
pub fn initiate_battle(ctx: Context<InitiateBattle>, steal_attribute: AttributeType) -> Result<()> {
    let game_config = &ctx.accounts.game_config;
    let game_round = &mut ctx.accounts.game_round;
    let attacker = &mut ctx.accounts.attacker_state;
    let defender = &mut ctx.accounts.defender_state;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);
    require!(attacker.turns > 0, PandaBattleError::InsufficientTurns);
    require!(
        attacker.player != defender.player,
        PandaBattleError::CannotBattleSelf
    );

    // Consume turn
    attacker.turns = attacker.turns.saturating_sub(1);

    // Calculate battle scores with randomness
    let attacker_score = calculate_battle_score(
        attacker,
        &ctx.accounts.player.key(),
        clock.unix_timestamp,
        true,
    );
    let defender_score =
        calculate_battle_score(defender, &defender.player, clock.unix_timestamp, false);

    // Determine winner
    let attacker_wins = if attacker_score == defender_score {
        // Speed breaks ties
        attacker.speed >= defender.speed
    } else {
        attacker_score > defender_score
    };

    // Execute steal
    let steal_amount = if attacker_wins {
        execute_steal(
            attacker,
            defender,
            &steal_attribute,
            game_config.steal_percentage,
        )?
    } else {
        // Defender counter-steals on win
        execute_steal(
            defender,
            attacker,
            &steal_attribute,
            game_config.steal_percentage / 2,
        )?
    };

    // Update battle stats
    attacker.battles_fought += 1;
    defender.battles_fought += 1;
    attacker.last_battle = clock.unix_timestamp;
    defender.last_battle = clock.unix_timestamp;

    if attacker_wins {
        attacker.wins += 1;
        defender.losses += 1;
        msg!(
            "Battle: {} defeated {}. Stole {} {:?}",
            attacker.player,
            defender.player,
            steal_amount,
            steal_attribute
        );
    } else {
        attacker.losses += 1;
        defender.wins += 1;
        msg!(
            "Battle: {} was defeated by {}. Lost {} {:?}",
            attacker.player,
            defender.player,
            steal_amount,
            steal_attribute
        );
    }

    game_round.total_battles += 1;

    Ok(())
}

/// Claim rewards after round ends
pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
    let game_round = &ctx.accounts.game_round;
    let player_state = &mut ctx.accounts.player_state;
    let game_config = &ctx.accounts.game_config;

    require!(!game_round.is_active, PandaBattleError::RoundNotEnded);
    require!(
        !player_state.rewards_claimed,
        PandaBattleError::AlreadyClaimed
    );
    require!(
        player_state.battles_fought >= MIN_BATTLES_FOR_PAYOUT,
        PandaBattleError::NotEligibleForRewards
    );

    // Calculate reward based on performance
    // Simple MVP formula: proportional to wins and total attributes
    let reward = calculate_reward(player_state, game_round.prize_pool, game_round.player_count)?;

    require!(reward > 0, PandaBattleError::NoRewardsAvailable);

    // Transfer reward from vault
    let game_config_key = game_config.key();
    let vault_seeds = &[
        VAULT_SEED,
        game_config_key.as_ref(),
        &[game_config.vault_bump],
    ];

    **ctx.accounts.vault.try_borrow_mut_lamports()? = ctx
        .accounts
        .vault
        .lamports()
        .checked_sub(reward)
        .ok_or(PandaBattleError::Underflow)?;

    **ctx.accounts.player.try_borrow_mut_lamports()? = ctx
        .accounts
        .player
        .lamports()
        .checked_add(reward)
        .ok_or(PandaBattleError::Overflow)?;

    player_state.rewards_earned = reward;
    player_state.rewards_claimed = true;

    msg!(
        "Player {} claimed {} lamports reward",
        ctx.accounts.player.key(),
        reward
    );

    Ok(())
}

// ============== HELPER FUNCTIONS ==============

/// Generate randomized attributes for a new player
fn generate_random_attributes(
    player_key: &Pubkey,
    timestamp: i64,
    penalty_bps: u16,
) -> (u16, u16, u16, u16) {
    // Use player key and timestamp for pseudo-randomness
    let seed_bytes = player_key.to_bytes();
    let timestamp_bytes = timestamp.to_le_bytes();

    let mut hash_input = [0u8; 40];
    hash_input[..32].copy_from_slice(&seed_bytes);
    hash_input[32..40].copy_from_slice(&timestamp_bytes);

    // Simple hash-based randomization
    let strength = generate_attribute(seed_bytes[0], seed_bytes[1], penalty_bps);
    let speed = generate_attribute(seed_bytes[2], seed_bytes[3], penalty_bps);
    let endurance = generate_attribute(seed_bytes[4], seed_bytes[5], penalty_bps);
    let luck = generate_attribute(seed_bytes[6], seed_bytes[7], penalty_bps);

    (strength, speed, endurance, luck)
}

/// Generate a single attribute value with penalty
fn generate_attribute(byte1: u8, byte2: u8, penalty_bps: u16) -> u16 {
    let range = BASE_ATTRIBUTE_MAX - BASE_ATTRIBUTE_MIN;
    let combined = ((byte1 as u16) << 8) | (byte2 as u16);
    let value = BASE_ATTRIBUTE_MIN + (combined % range);

    // Apply penalty
    if penalty_bps > 0 {
        let penalty = (value as u32 * penalty_bps as u32 / 10000) as u16;
        value.saturating_sub(penalty)
    } else {
        value
    }
}

/// Calculate battle score with some randomness
fn calculate_battle_score(
    player: &PlayerState,
    player_key: &Pubkey,
    timestamp: i64,
    is_attacker: bool,
) -> u64 {
    let base_score = player.battle_score();

    // Add luck-based variance (up to ±10%)
    let seed_bytes = player_key.to_bytes();
    let time_factor = (timestamp % 256) as u8;
    let luck_roll = ((seed_bytes[if is_attacker { 0 } else { 16 }] ^ time_factor) % 21) as i64 - 10;

    let variance = (base_score as i64 * luck_roll / 100) as i64;
    let luck_bonus = (player.luck as i64 * luck_roll / 200) as i64;

    ((base_score as i64) + variance + luck_bonus).max(1) as u64
}

/// Execute attribute steal from loser to winner
fn execute_steal(
    winner: &mut PlayerState,
    loser: &mut PlayerState,
    attribute: &AttributeType,
    steal_percentage: u8,
) -> Result<u16> {
    let (winner_attr, loser_attr) = match attribute {
        AttributeType::Strength => (&mut winner.strength, &mut loser.strength),
        AttributeType::Speed => (&mut winner.speed, &mut loser.speed),
        AttributeType::Endurance => (&mut winner.endurance, &mut loser.endurance),
        AttributeType::Luck => (&mut winner.luck, &mut loser.luck),
    };

    // Calculate steal amount
    let steal_amount = (*loser_attr as u32 * steal_percentage as u32 / 100) as u16;
    let steal_amount = steal_amount.max(1); // Minimum 1

    // Execute transfer
    *loser_attr = loser_attr.saturating_sub(steal_amount);
    *winner_attr = winner_attr.saturating_add(steal_amount);

    // Ensure minimum attribute value of 10
    if *loser_attr < 10 {
        *loser_attr = 10;
    }

    Ok(steal_amount)
}

/// Calculate reward for a player
fn calculate_reward(player: &PlayerState, prize_pool: u64, player_count: u32) -> Result<u64> {
    if player_count == 0 || prize_pool == 0 {
        return Ok(0);
    }

    // MVP formula: base share + performance bonus
    let base_share = prize_pool / player_count as u64;

    // Performance multiplier based on win rate
    let win_rate = if player.battles_fought > 0 {
        (player.wins as u64 * 100) / player.battles_fought as u64
    } else {
        50
    };

    // Scale from 0.5x to 1.5x based on win rate
    let multiplier = 50 + win_rate; // 50-150%

    let reward = base_share
        .checked_mul(multiplier)
        .ok_or(PandaBattleError::Overflow)?
        .checked_div(100)
        .ok_or(PandaBattleError::Overflow)?;

    Ok(reward)
}

// ============== CONTEXTS ==============

#[derive(Accounts)]
pub struct JoinRound<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        constraint = game_round.is_active @ PandaBattleError::RoundNotActive
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        init,
        payer = player,
        space = 8 + PlayerState::INIT_SPACE,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player.key().as_ref()
        ],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [VAULT_SEED, game_config.key().as_ref()],
        bump = game_config.vault_bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseTurns<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        mut,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player.key().as_ref()
        ],
        bump = player_state.bump,
        constraint = player_state.player == player.key() @ PandaBattleError::NotJoined
    )]
    pub player_state: Account<'info, PlayerState>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [VAULT_SEED, game_config.key().as_ref()],
        bump = game_config.vault_bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitiateBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        mut,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player.key().as_ref()
        ],
        bump = attacker_state.bump,
        constraint = attacker_state.player == player.key() @ PandaBattleError::NotJoined
    )]
    pub attacker_state: Account<'info, PlayerState>,

    #[account(
        mut,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            defender_state.player.as_ref()
        ],
        bump = defender_state.bump
    )]
    pub defender_state: Account<'info, PlayerState>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        constraint = !game_round.is_active @ PandaBattleError::RoundNotEnded
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        mut,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player.key().as_ref()
        ],
        bump = player_state.bump,
        constraint = player_state.player == player.key() @ PandaBattleError::NotJoined
    )]
    pub player_state: Account<'info, PlayerState>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [VAULT_SEED, game_config.key().as_ref()],
        bump = game_config.vault_bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
