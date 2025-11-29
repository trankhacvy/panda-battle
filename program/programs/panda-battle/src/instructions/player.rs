use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

use crate::constants::*;
use crate::errors::PandaBattleError;
use crate::state::*;

/// Request to join the current round (Step 1: Request VRF)
pub fn request_join_round(ctx: Context<RequestJoinRound>, client_seed: u8) -> Result<()> {
    {
        let game_round = &mut ctx.accounts.game_round;
        let clock = Clock::get()?;

        require!(game_round.is_active, PandaBattleError::RoundNotActive);

        // Calculate continuous entry fee: entry_fee * (1 + inc_pct/100 * hours_since_start).ceil()
        let hours_since_start = (clock.unix_timestamp - game_round.start_time) / 3600;
        let fee_multiplier = 100 + (game_round.entry_hourly_inc_pct as i64 * hours_since_start);
        let entry_fee = ((game_round.entry_fee as u128 * fee_multiplier as u128 + 99) / 100) as u64; // Ceiling division

        // Transfer entry fee to vault (SPL token)
        let cpi_accounts = Transfer {
            from: ctx.accounts.player_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        transfer(cpi_ctx, entry_fee)?;

        // Update prize pool
        game_round.prize_pool = game_round
            .prize_pool
            .checked_add(entry_fee)
            .ok_or(PandaBattleError::Overflow)?;
        game_round.player_count += 1;

        // Initialize player state with placeholder values (will be set by VRF callback)
        let player_state = &mut ctx.accounts.player_state;
        player_state.player = ctx.accounts.player.key();
        player_state.round = game_round.key();
        player_state.entry_fee_paid = entry_fee;
        player_state.bump = ctx.bumps.player_state;
        player_state.max_turns = 50; // Set max turns to 50
        player_state.last_pack_hour = -1; // Initialize to -1
                                          // Attributes will be set by VRF callback
    }

    {
        msg!("Requesting randomness for player attributes...");

        // Request randomness from VRF
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.player.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: crate::ID,
            callback_discriminator: crate::instruction::CallbackJoinRound::DISCRIMINATOR.to_vec(),
            caller_seed: [client_seed; 32],
            accounts_metas: Some(vec![
                SerializableAccountMeta {
                    pubkey: ctx.accounts.player_state.key(),
                    is_signer: false,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: ctx.accounts.game_round.key(),
                    is_signer: false,
                    is_writable: false,
                },
            ]),
            ..Default::default()
        });

        ctx.accounts
            .invoke_signed_vrf(&ctx.accounts.player.to_account_info(), &ix)?;

        msg!(
            "Player {} requested to join round {}. Waiting for VRF callback...",
            ctx.accounts.player.key(),
            ctx.accounts.game_round.round_number
        );
    }

    Ok(())
}

/// Callback to complete join round (Step 2: Consume VRF randomness)
pub fn callback_join_round(ctx: Context<CallbackJoinRound>, randomness: [u8; 32]) -> Result<()> {
    let player_state = &mut ctx.accounts.player_state;
    let game_round = &ctx.accounts.game_round;
    let clock = Clock::get()?;

    // Generate attributes using VRF randomness (3 * u8 % 11 + 5 = range 5-15)
    let str_val = (randomness[0] % 11) + 5;
    let agi_val = (randomness[1] % 11) + 5;
    let int_val = (randomness[2] % 11) + 5;

    // Initialize player state
    player_state.str = str_val;
    player_state.agi = agi_val;
    player_state.int = int_val;
    player_state.level = 0;
    player_state.xp = 0;
    player_state.points = 0;
    player_state.turns = STARTING_TURNS;
    player_state.last_turn_regen = clock.unix_timestamp;
    player_state.rerolls_used = 0;
    player_state.packs_bought_hour = 0;
    player_state.last_battle = clock.unix_timestamp;
    player_state.battles_fought = 0;
    player_state.wins = 0;
    player_state.losses = 0;
    player_state.prize_share = 0;
    player_state.prize_claimed = false;
    player_state.joined_at = clock.unix_timestamp;

    // Early bird bonus: +2 turns if joined within first 6 hours
    let hours_since_start = (clock.unix_timestamp - game_round.start_time) / 3600;
    if hours_since_start < 6 {
        player_state.turns = player_state.turns.saturating_add(2);
        if player_state.turns > player_state.max_turns {
            player_state.turns = player_state.max_turns;
        }
    }

    msg!(
        "Player {} joined round {} with VRF attributes: STR:{} AGI:{} INT:{}",
        player_state.player,
        game_round.round_number,
        str_val,
        agi_val,
        int_val
    );

    Ok(())
}

/// Buy attack packs (replaces purchase_turns)
/// Each pack gives 10 turns, price increases by 50% per pack bought in current hour
pub fn buy_attack_packs(ctx: Context<BuyAttackPacks>, num_packs: u8) -> Result<()> {
    require!(
        num_packs > 0 && num_packs <= 5,
        PandaBattleError::TooManyTurns
    );

    let game_round = &mut ctx.accounts.game_round;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);

    // Calculate turns to add (10 per pack)
    let turns_to_add = num_packs.saturating_mul(10);
    let new_turns = player_state.turns.saturating_add(turns_to_add);

    // Check turn storage capacity (max 50)
    require!(
        new_turns <= player_state.max_turns,
        PandaBattleError::TurnStorageFull
    );

    // Calculate price: pack_price * (1 + 0.5 * packs_bought_hour)
    // Using basis points: 10000 = 100%, 5000 = 50%
    let price_multiplier = 10000 + (5000 * player_state.packs_bought_hour as u64);
    let total_cost =
        (game_round.attack_pack_price as u128 * price_multiplier as u128 * num_packs as u128
            / 10000) as u64;

    // Transfer payment to vault (SPL token)
    let cpi_accounts = Transfer {
        from: ctx.accounts.player_token_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.player.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, total_cost)?;

    // Update state
    game_round.prize_pool = game_round
        .prize_pool
        .checked_add(total_cost)
        .ok_or(PandaBattleError::Overflow)?;

    player_state.turns = new_turns;
    player_state.packs_bought_hour = player_state.packs_bought_hour.saturating_add(num_packs);
    player_state.last_pack_hour = clock.unix_timestamp;

    msg!(
        "Player {} bought {} attack packs ({} turns) for {} tokens",
        ctx.accounts.player.key(),
        num_packs,
        turns_to_add,
        total_cost
    );

    Ok(())
}

/// Reroll attributes (costs $1 fixed, max 3 times)
pub fn reroll_attributes(ctx: Context<RerollAttributes>, client_seed: u8) -> Result<()> {
    {
        let player_state = &mut ctx.accounts.player_state;
        let game_round = &ctx.accounts.game_round;

        require!(game_round.is_active, PandaBattleError::RoundNotActive);
        require!(
            player_state.rerolls_used < 3,
            PandaBattleError::MaxRerollsReached
        );

        // Fixed $1 fee (hardcoded - could be in config, but spec says fixed)
        // Assuming token has same decimals as USDC (6 decimals), $1 = 1_000_000
        let reroll_fee: u64 = 1_000_000;

        // Transfer reroll fee to vault (SPL token)
        let cpi_accounts = Transfer {
            from: ctx.accounts.player_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        transfer(cpi_ctx, reroll_fee)?;

        // Update prize pool
        let game_round = &mut ctx.accounts.game_round;
        game_round.prize_pool = game_round
            .prize_pool
            .checked_add(reroll_fee)
            .ok_or(PandaBattleError::Overflow)?;

        // Increment rerolls used
        player_state.rerolls_used = player_state.rerolls_used.saturating_add(1);
    }

    {
        msg!("Requesting randomness for attribute reroll...");

        // Request randomness from VRF
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.player.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: crate::ID,
            callback_discriminator: crate::instruction::CallbackRerollAttributes::DISCRIMINATOR
                .to_vec(),
            caller_seed: [client_seed; 32],
            accounts_metas: Some(vec![SerializableAccountMeta {
                pubkey: ctx.accounts.player_state.key(),
                is_signer: false,
                is_writable: true,
            }]),
            ..Default::default()
        });

        ctx.accounts
            .invoke_signed_vrf(&ctx.accounts.player.to_account_info(), &ix)?;

        msg!(
            "Player {} requested attribute reroll (reroll #{}/3)",
            ctx.accounts.player.key(),
            ctx.accounts.player_state.rerolls_used
        );
    }

    Ok(())
}

/// Callback to complete attribute reroll (Step 2: Consume VRF randomness)
pub fn callback_reroll_attributes(
    ctx: Context<CallbackRerollAttributes>,
    randomness: [u8; 32],
) -> Result<()> {
    let player_state = &mut ctx.accounts.player_state;

    // Generate new attributes using VRF randomness (3 * u8 % 11 + 5 = range 5-15)
    let str_val = (randomness[0] % 11) + 5;
    let agi_val = (randomness[1] % 11) + 5;
    let int_val = (randomness[2] % 11) + 5;

    // Overwrite attributes
    player_state.str = str_val;
    player_state.agi = agi_val;
    player_state.int = int_val;

    msg!(
        "Player {} rerolled attributes: STR:{} AGI:{} INT:{}",
        player_state.player,
        str_val,
        agi_val,
        int_val
    );

    Ok(())
}

/// Initiate a battle against another player (Step 1: Request VRF for battle resolution)
pub fn initiate_battle(ctx: Context<InitiateBattle>, client_seed: u8) -> Result<()> {
    {
        let game_round = &ctx.accounts.game_round;
        let attacker = &mut ctx.accounts.attacker_state;
        let defender = &ctx.accounts.defender_state;

        require!(game_round.is_active, PandaBattleError::RoundNotActive);
        require!(attacker.turns > 0, PandaBattleError::InsufficientTurns);
        require!(
            attacker.player != defender.player,
            PandaBattleError::CannotBattleSelf
        );

        // Consume turn immediately (prevents reentrancy)
        attacker.turns = attacker.turns.saturating_sub(1);
    }

    {
        msg!("Requesting randomness for battle resolution...");

        // Request randomness from VRF for battle simulation
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.player.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: crate::ID,
            callback_discriminator: crate::instruction::CallbackResolveBattle::DISCRIMINATOR
                .to_vec(),
            caller_seed: [client_seed; 32],
            accounts_metas: Some(vec![
                SerializableAccountMeta {
                    pubkey: ctx.accounts.attacker_state.key(),
                    is_signer: false,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: ctx.accounts.defender_state.key(),
                    is_signer: false,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: ctx.accounts.game_round.key(),
                    is_signer: false,
                    is_writable: true,
                },
            ]),
            ..Default::default()
        });

        ctx.accounts
            .invoke_signed_vrf(&ctx.accounts.player.to_account_info(), &ix)?;

        msg!(
            "Player {} initiated battle against {}. Waiting for VRF callback...",
            ctx.accounts.attacker_state.player,
            ctx.accounts.defender_state.player
        );
    }

    Ok(())
}

/// Callback to resolve battle (Step 2: Full battle simulation with VRF randomness)
pub fn callback_resolve_battle(
    ctx: Context<CallbackResolveBattle>,
    randomness: [u8; 32],
) -> Result<()> {
    let attacker = &mut ctx.accounts.attacker_state;
    let defender = &mut ctx.accounts.defender_state;
    let game_round = &mut ctx.accounts.game_round;
    let clock = Clock::get()?;

    // Calculate HP for both fighters: 100 + (STR + INT) * 2
    let mut attacker_hp = attacker.calculate_hp();
    let mut defender_hp = defender.calculate_hp();

    let attacker_str = attacker.str;
    let attacker_agi = attacker.agi;
    let attacker_int = attacker.int;
    let defender_str = defender.str;
    let defender_agi = defender.agi;
    let defender_int = defender.int;

    msg!(
        "Battle Start: Attacker HP:{} (STR:{} AGI:{} INT:{}) vs Defender HP:{} (STR:{} AGI:{} INT:{})",
        attacker_hp,
        attacker_str,
        attacker_agi,
        attacker_int,
        defender_hp,
        defender_str,
        defender_agi,
        defender_int
    );

    let mut random_index = 0;
    let mut attacker_wins = false;

    // Battle simulation: max 10 turns
    for turn in 0..MAX_BATTLE_TURNS {
        // Determine turn order: higher AGI goes first, tie uses VRF
        let attacker_goes_first = if attacker_agi == defender_agi {
            randomness[random_index % 32] == 0 // VRF tie-breaker
        } else {
            attacker_agi > defender_agi
        };
        random_index += 1;

        // Process both attacks in order
        for attack_num in 0..2 {
            let is_attacker_turn = if attacker_goes_first {
                attack_num == 0
            } else {
                attack_num == 1
            };

            if is_attacker_turn {
                // Attacker's turn
                let agi_diff = if attacker_agi > defender_agi {
                    attacker_agi - defender_agi
                } else {
                    0
                };
                let dodge_chance = (agi_diff as u16 * 10).min(100); // AGI_diff * 10%, cap 100%
                let dodge_roll = (randomness[random_index % 32] as u16 * 100) / 255;
                random_index += 1;

                if dodge_roll < dodge_chance {
                    msg!("Turn {}: Defender dodged!", turn + 1);
                    continue;
                }

                // Check for crit: AGI * 5%, cap 100%
                let crit_chance = (attacker_agi as u16 * 5).min(100);
                let crit_roll = (randomness[random_index % 32] as u16 * 100) / 255;
                random_index += 1;
                let is_crit = crit_roll < crit_chance;

                // Calculate damage: STR * (1 + 0.5 * crit) - INT/2
                let base_damage = attacker_str as u16;
                let crit_multiplier = if is_crit { 15000 } else { 10000 }; // 1.5x or 1.0x (basis points)
                let damage_before_mitigation = (base_damage * crit_multiplier) / 10000;
                let mitigation = (defender_int as u16) / 2;
                let final_damage = damage_before_mitigation.saturating_sub(mitigation);

                defender_hp = defender_hp.saturating_sub(final_damage);
                msg!(
                    "Turn {}: Attacker deals {} damage{} (HP: {})",
                    turn + 1,
                    final_damage,
                    if is_crit { " (CRIT!)" } else { "" },
                    defender_hp
                );

                if defender_hp == 0 {
                    attacker_wins = true;
                    break;
                }
            } else {
                // Defender's turn
                let agi_diff = if defender_agi > attacker_agi {
                    defender_agi - attacker_agi
                } else {
                    0
                };
                let dodge_chance = (agi_diff as u16 * 10).min(100);
                let dodge_roll = (randomness[random_index % 32] as u16 * 100) / 255;
                random_index += 1;

                if dodge_roll < dodge_chance {
                    msg!("Turn {}: Attacker dodged!", turn + 1);
                    continue;
                }

                // Check for crit
                let crit_chance = (defender_agi as u16 * 5).min(100);
                let crit_roll = (randomness[random_index % 32] as u16 * 100) / 255;
                random_index += 1;
                let is_crit = crit_roll < crit_chance;

                // Calculate damage
                let base_damage = defender_str as u16;
                let crit_multiplier = if is_crit { 15000 } else { 10000 };
                let damage_before_mitigation = (base_damage * crit_multiplier) / 10000;
                let mitigation = (attacker_int as u16) / 2;
                let final_damage = damage_before_mitigation.saturating_sub(mitigation);

                attacker_hp = attacker_hp.saturating_sub(final_damage);
                msg!(
                    "Turn {}: Defender deals {} damage{} (HP: {})",
                    turn + 1,
                    final_damage,
                    if is_crit { " (CRIT!)" } else { "" },
                    attacker_hp
                );

                if attacker_hp == 0 {
                    attacker_wins = false;
                    break;
                }
            }
        }

        // Check if battle ended
        if attacker_hp == 0 || defender_hp == 0 {
            break;
        }
    }

    // If both still alive after max turns, determine winner by remaining HP or power
    if attacker_hp > 0 && defender_hp > 0 {
        if attacker_hp == defender_hp {
            // Tie on HP, use total power
            let attacker_power = attacker.total_power();
            let defender_power = defender.total_power();
            attacker_wins = attacker_power >= defender_power;
        } else {
            attacker_wins = attacker_hp > defender_hp;
        }
        msg!(
            "Battle timeout! Winner determined by HP: Attacker {} vs Defender {}",
            attacker_hp,
            defender_hp
        );
    }

    // Update battle stats
    attacker.battles_fought += 1;
    defender.battles_fought += 1;
    attacker.last_battle = clock.unix_timestamp;
    defender.last_battle = clock.unix_timestamp;

    if attacker_wins {
        attacker.wins += 1;
        attacker.points += 1; // +1 point for leaderboard
        attacker.xp += XP_PER_WIN; // +3 XP
        defender.losses += 1;

        msg!("Battle Result: {} WINS! (+1 point, +3 XP)", attacker.player);

        // Check for level up
        check_and_apply_levelup(attacker)?;
    } else {
        attacker.losses += 1;
        defender.wins += 1;
        defender.points += 1;
        defender.xp += XP_PER_WIN;

        msg!("Battle Result: {} WINS! (+1 point, +3 XP)", defender.player);

        // Check for level up
        check_and_apply_levelup(defender)?;
    }

    game_round.total_battles += 1;

    Ok(())
}

/// Check if player should level up and apply stat boosts
fn check_and_apply_levelup(player: &mut PlayerState) -> Result<()> {
    let current_level = player.level as usize;

    // Check if player can level up (max level 10)
    if current_level >= MAX_LEVEL as usize {
        return Ok(());
    }

    // Check if player has enough XP for next level
    while player.level < MAX_LEVEL && player.xp >= LEVEL_XP_THRESHOLDS[(player.level + 1) as usize]
    {
        player.level += 1;

        // Apply round-robin stat boost: +1 to STR/AGI/INT based on level % 3
        // This gives +0.5 effective boost per level (since we alternate)
        // Level 1: STR, Level 2: AGI, Level 3: INT, Level 4: STR, etc.
        match player.level % 3 {
            1 => {
                if player.str < MAX_ATTRIBUTE {
                    player.str += 1;
                    msg!(
                        "Level Up! {} reached level {} (STR +1)",
                        player.player,
                        player.level
                    );
                }
            }
            2 => {
                if player.agi < MAX_ATTRIBUTE {
                    player.agi += 1;
                    msg!(
                        "Level Up! {} reached level {} (AGI +1)",
                        player.player,
                        player.level
                    );
                }
            }
            0 => {
                if player.int < MAX_ATTRIBUTE {
                    player.int += 1;
                    msg!(
                        "Level Up! {} reached level {} (INT +1)",
                        player.player,
                        player.level
                    );
                }
            }
            _ => {}
        }

        // Emit level up event (will be added in Phase 7)
    }

    Ok(())
}

/// Claim prize after round ends
pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
    let game_round = &ctx.accounts.game_round;
    let player_state = &mut ctx.accounts.player_state;
    let global_config = &ctx.accounts.global_config;

    require!(!game_round.is_active, PandaBattleError::RoundNotEnded);
    require!(
        game_round.payouts_processed,
        PandaBattleError::NoRewardsAvailable
    );
    require!(
        !player_state.prize_claimed,
        PandaBattleError::AlreadyClaimed
    );

    // Use pre-calculated prize share
    let prize = player_state.prize_share;
    require!(prize > 0, PandaBattleError::NoRewardsAvailable);

    // Transfer prize from vault (SPL token with PDA signer - game_round is the authority)
    let global_config_key = global_config.key();
    let round_number_bytes = game_round.round_number.to_le_bytes();
    let signer_seeds: &[&[&[u8]]] = &[&[
        GAME_ROUND_SEED,
        global_config_key.as_ref(),
        round_number_bytes.as_ref(),
        &[game_round.bump],
    ]];

<<<<<<< HEAD
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.player_token_account.to_account_info(),
        authority: game_round.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    transfer(cpi_ctx, prize)?;

    player_state.prize_claimed = true;

    msg!(
        "Player {} claimed {} tokens prize",
=======
    // Transfer reward from vault (SPL token with PDA signer - game_round is the authority)
    let game_config_key = game_config.key();
    let round_number_bytes = game_round.round_number.to_le_bytes();
    let signer_seeds: &[&[&[u8]]] = &[&[
        GAME_ROUND_SEED,
        game_config_key.as_ref(),
        round_number_bytes.as_ref(),
        &[game_round.bump],
    ]];

<<<<<<< HEAD
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
=======
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.player_token_account.to_account_info(),
        authority: game_round.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    transfer(cpi_ctx, reward)?;
>>>>>>> 6594ddf (program)

    player_state.rewards_earned = reward;
    player_state.rewards_claimed = true;

    msg!(
        "Player {} claimed {} tokens reward",
>>>>>>> 15227bc (program)
        ctx.accounts.player.key(),
        prize
    );

    Ok(())
}

<<<<<<< HEAD
=======
// ============== HELPER FUNCTIONS ==============

<<<<<<< HEAD
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
=======
/// Generate attributes from VRF randomness
fn generate_attributes_from_vrf(randomness: &[u8; 32], penalty_bps: u16) -> (u16, u16, u16, u16) {
    // Use VRF utility to generate 4 random values in attribute range
    let attributes = random_u16_four_values(randomness, BASE_ATTRIBUTE_MIN, BASE_ATTRIBUTE_MAX);

    // Apply penalty to each attribute
    let apply_penalty = |value: u16| -> u16 {
        if penalty_bps > 0 {
            let penalty = (value as u32 * penalty_bps as u32 / 10000) as u16;
            value.saturating_sub(penalty)
        } else {
            value
        }
    };

    (
        apply_penalty(attributes[0]), // strength
        apply_penalty(attributes[1]), // speed
        apply_penalty(attributes[2]), // endurance
        apply_penalty(attributes[3]), // luck
    )
}

/// Generates 4 random u16 values within a specified range from a 32-byte random seed
///
/// # Arguments
///
/// * `bytes` - A 32-byte array containing random data from the VRF
/// * `min_value` - The minimum value (inclusive) of the desired range
/// * `max_value` - The maximum value (inclusive) of the desired range
///
/// # Returns
///
/// An array of 4 random u16 values uniformly distributed in the range [min_value, max_value]
///
/// # Algorithm
///
/// Divides the 32 bytes into 4 segments of 8 bytes each. For each segment,
/// converts to u64 and maps to the desired range to avoid modulo bias.
/// This approach provides better distribution than simple modulo operations.
fn random_u16_four_values(bytes: &[u8; 32], min_value: u16, max_value: u16) -> [u16; 4] {
    let range = (max_value - min_value + 1) as u64;
    let mut results = [0u16; 4];

    // Process each 8-byte segment for better randomness distribution
    for i in 0..4 {
        let start = i * 8;
        let end = start + 8;

        // Convert 8 bytes to u64
        let mut segment_bytes = [0u8; 8];
        segment_bytes.copy_from_slice(&bytes[start..end]);
        let random_u64 = u64::from_le_bytes(segment_bytes);

        // Map to range [min_value, max_value]
        results[i] = min_value + ((random_u64 % range) as u16);
>>>>>>> 6594ddf (program)
    }

    results
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

>>>>>>> 15227bc (program)
// ============== CONTEXTS ==============

#[vrf]
#[derive(Accounts)]
pub struct RequestJoinRound<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
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

    /// Player's token account
    #[account(
        mut,
        constraint = player_token_account.owner == player.key() @ PandaBattleError::Unauthorized,
<<<<<<< HEAD
        constraint = player_token_account.mint == global_config.token_mint @ PandaBattleError::InvalidMint
=======
        constraint = player_token_account.mint == game_round.mint @ PandaBattleError::InvalidMint
>>>>>>> 15227bc (program)
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    /// Vault token account for this round (ATA owned by game_round)
    #[account(
        mut,
        constraint = vault.owner == game_round.key() @ PandaBattleError::Unauthorized,
<<<<<<< HEAD
        constraint = vault.mint == global_config.token_mint @ PandaBattleError::InvalidMint
=======
        constraint = vault.mint == game_round.mint @ PandaBattleError::InvalidMint
>>>>>>> 15227bc (program)
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: The oracle queue for VRF
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
<<<<<<< HEAD
=======
}

#[derive(Accounts)]
pub struct CallbackJoinRound<'info> {
    /// VRF program identity ensures callback is from VRF program
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub player_state: Account<'info, PlayerState>,

    pub game_round: Account<'info, GameRound>,
>>>>>>> 15227bc (program)
}

#[derive(Accounts)]
pub struct CallbackJoinRound<'info> {
    /// VRF program identity ensures callback is from VRF program
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub player_state: Account<'info, PlayerState>,

    pub game_round: Account<'info, GameRound>,
}

#[derive(Accounts)]
pub struct BuyAttackPacks<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
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

    /// Player's token account
    #[account(
        mut,
        constraint = player_token_account.owner == player.key() @ PandaBattleError::Unauthorized,
<<<<<<< HEAD
        constraint = player_token_account.mint == global_config.token_mint @ PandaBattleError::InvalidMint
=======
        constraint = player_token_account.mint == game_round.mint @ PandaBattleError::InvalidMint
>>>>>>> 15227bc (program)
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    /// Vault token account for this round (ATA owned by game_round)
    #[account(
        mut,
        constraint = vault.owner == game_round.key() @ PandaBattleError::Unauthorized,
<<<<<<< HEAD
        constraint = vault.mint == global_config.token_mint @ PandaBattleError::InvalidMint
=======
        constraint = vault.mint == game_round.mint @ PandaBattleError::InvalidMint
>>>>>>> 15227bc (program)
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[vrf]
#[derive(Accounts)]
pub struct RerollAttributes<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        constraint = game_round.is_active @ PandaBattleError::RoundNotActive
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

    /// Player's token account
    #[account(
        mut,
        constraint = player_token_account.owner == player.key() @ PandaBattleError::Unauthorized,
        constraint = player_token_account.mint == global_config.token_mint @ PandaBattleError::InvalidMint
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    /// Vault token account for this round (ATA owned by game_round)
    #[account(
        mut,
        constraint = vault.owner == game_round.key() @ PandaBattleError::Unauthorized,
        constraint = vault.mint == global_config.token_mint @ PandaBattleError::InvalidMint
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: The oracle queue for VRF
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CallbackRerollAttributes<'info> {
    /// VRF program identity ensures callback is from VRF program
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub player_state: Account<'info, PlayerState>,
}

#[vrf]
#[derive(Accounts)]
pub struct InitiateBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
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

    /// CHECK: The oracle queue for VRF
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CallbackResolveBattle<'info> {
    /// VRF program identity ensures callback is from VRF program
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub attacker_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub defender_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub game_round: Account<'info, GameRound>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        constraint = !game_round.is_active @ PandaBattleError::RoundNotEnded,
        constraint = game_round.payouts_processed @ PandaBattleError::NoRewardsAvailable
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

    /// Player's token account
    #[account(
        mut,
        constraint = player_token_account.owner == player.key() @ PandaBattleError::Unauthorized,
<<<<<<< HEAD
        constraint = player_token_account.mint == global_config.token_mint @ PandaBattleError::InvalidMint
=======
        constraint = player_token_account.mint == game_round.mint @ PandaBattleError::InvalidMint
>>>>>>> 15227bc (program)
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    /// Vault token account for this round (ATA owned by game_round)
    #[account(
        mut,
        constraint = vault.owner == game_round.key() @ PandaBattleError::Unauthorized,
<<<<<<< HEAD
        constraint = vault.mint == global_config.token_mint @ PandaBattleError::InvalidMint
=======
        constraint = vault.mint == game_round.mint @ PandaBattleError::InvalidMint
>>>>>>> 15227bc (program)
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
