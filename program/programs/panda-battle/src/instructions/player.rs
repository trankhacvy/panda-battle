use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

use crate::constants::*;
use crate::errors::PandaBattleError;
use crate::state::*;

#[vrf]
#[derive(Accounts)]
pub struct GeneratePandaAttributes<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
        bump = global_config.bump
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    /// CHECK: game authority PDA - only required for paid games
    #[account(
        seeds = [
            GAME_AUTHORITY_SEED.as_ref(),
        ],
        bump,
    )]
    pub game_authority: UncheckedAccount<'info>,

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
    pub game_round: Box<Account<'info, GameRound>>,

    #[account(
        init_if_needed,
        payer = player,
        space = 8 + PlayerState::INIT_SPACE,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player.key().as_ref()
        ],
        bump
    )]
    pub player_state: Box<Account<'info, PlayerState>>,

    #[account(
        mut,
        associated_token::mint = game_round.token_mint,
        associated_token::authority = player,
        associated_token::token_program = token_program
    )]
    pub player_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = game_round.token_mint,
        token::authority = game_authority,
        token::token_program = token_program,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    /// CHECK: The oracle queue for VRF
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn generate_panda_attributes(
    ctx: Context<GeneratePandaAttributes>,
    client_seed: u8,
) -> Result<()> {
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

        // Request randomness from VRF (only need player_state account)
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.player.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: crate::ID,
            callback_discriminator: crate::instruction::CallbackGenerateAttributes::DISCRIMINATOR
                .to_vec(),
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
            "Player {} requested panda generation for round {}. Waiting for VRF callback...",
            ctx.accounts.player.key(),
            ctx.accounts.game_round.round_number
        );
    }

    Ok(())
}

#[derive(Accounts)]
pub struct CallbackGenerateAttributes<'info> {
    /// VRF program identity ensures callback is from VRF program
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub player_state: Account<'info, PlayerState>,

    pub game_round: Account<'info, GameRound>,
}

pub fn callback_generate_attributes(
    ctx: Context<CallbackGenerateAttributes>,
    randomness: [u8; 32],
) -> Result<()> {
    msg!(
        "VRF callback received for panda attribute generation.{:?}",
        randomness
    );
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
        "Panda attributes generated for player {}: STR:{} AGI:{} INT:{} - Player can now confirm to join or regenerate",
        player_state.player,
        str_val,
        agi_val,
        int_val
    );

    Ok(())
}

#[derive(Accounts)]
pub struct ConfirmJoinRound<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
        bump = global_config.bump
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        constraint = game_round.is_active @ PandaBattleError::RoundNotActive
    )]
    pub game_round: Box<Account<'info, GameRound>>,

    #[account(
        mut,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player.key().as_ref()
        ],
        bump = player_state.bump,
        constraint = player_state.player == player.key() @ PandaBattleError::Unauthorized
    )]
    pub player_state: Box<Account<'info, PlayerState>>,

    /// CHECK: The buffer account for delegation
    #[account(
        mut,
        seeds = [ephemeral_rollups_sdk::consts::BUFFER, player_state.key().as_ref()],
        bump,
        seeds::program = crate::id()
    )]
    pub buffer: UncheckedAccount<'info>,

    /// CHECK: The delegation record account
    #[account(
        mut,
        seeds = [ephemeral_rollups_sdk::consts::DELEGATION_RECORD, player_state.key().as_ref()],
        bump,
        seeds::program = delegation_program.key()
    )]
    pub delegation_record: UncheckedAccount<'info>,

    /// CHECK: The delegation metadata account
    #[account(
        mut,
        seeds = [ephemeral_rollups_sdk::consts::DELEGATION_METADATA, player_state.key().as_ref()],
        bump,
        seeds::program = delegation_program.key()
    )]
    pub delegation_metadata: UncheckedAccount<'info>,

    /// CHECK: The owner program of the pda
    #[account(address = crate::id())]
    pub owner_program: UncheckedAccount<'info>,

    /// CHECK: The delegation program
    #[account(address = ::ephemeral_rollups_sdk::id())]
    pub delegation_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn confirm_join_round(ctx: Context<ConfirmJoinRound>) -> Result<()> {
    msg!("Delegating player_state to Ephemeral Rollups...");

    let player_state = &ctx.accounts.player_state;
    let game_round = &ctx.accounts.game_round;
    let player_key = player_state.player;
    let game_round_key = game_round.key();

    // Verify that attributes have been set (str should not be 0)
    // require!(player_state.str > 0, PandaBattleError::RoundNotActive); // Reusing error for now

    let del_accounts = ephemeral_rollups_sdk::cpi::DelegateAccounts {
        payer: &ctx.accounts.player.to_account_info(),
        pda: &player_state.to_account_info(),
        owner_program: &ctx.accounts.owner_program.to_account_info(),
        buffer: &ctx.accounts.buffer.to_account_info(),
        delegation_record: &ctx.accounts.delegation_record.to_account_info(),
        delegation_metadata: &ctx.accounts.delegation_metadata.to_account_info(),
        delegation_program: &ctx.accounts.delegation_program.to_account_info(),
        system_program: &ctx.accounts.system_program.to_account_info(),
    };

    let seeds = &[
        PLAYER_STATE_SEED,
        game_round_key.as_ref(),
        player_key.as_ref(),
    ];

    let config = DelegateConfig {
        commit_frequency_ms: 30_000,
        validator: Some(pubkey!("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57")),
    };

    player_state.exit(&crate::ID)?;
    ephemeral_rollups_sdk::cpi::delegate_account(del_accounts, seeds, config)?;

    msg!(
        "Player {} successfully joined round {} with panda STR:{} AGI:{} INT:{}",
        player_state.player,
        game_round.round_number,
        player_state.str,
        player_state.agi,
        player_state.int
    );

    Ok(())
}

#[derive(Accounts)]
pub struct BuyAttackPacks<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
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
        constraint = player_token_account.mint == game_round.token_mint @ PandaBattleError::InvalidMint
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    /// Vault token account for this round (ATA owned by game_round)
    #[account(
        mut,
        constraint = vault.owner == game_round.key() @ PandaBattleError::Unauthorized,
        constraint = vault.mint == game_round.token_mint @ PandaBattleError::InvalidMint
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

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

#[vrf]
#[derive(Accounts)]
pub struct RerollAttributes<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    // #[account(
    //     seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
    //     bump = global_config.bump
    // )]
    // pub global_config: Account<'info, GlobalConfig>,
    /// CHECK: game authority PDA - only required for paid games
    #[account(
        seeds = [
            GAME_AUTHORITY_SEED.as_ref(),
        ],
        bump,
    )]
    pub game_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            game_round.global_config.as_ref(),
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

    #[account(
        mut,
        associated_token::mint = game_round.token_mint,
        associated_token::authority = player,
        associated_token::token_program = token_program
    )]
    pub player_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = game_round.token_mint,
        token::authority = game_authority,
        token::token_program = token_program,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    /// CHECK: The oracle queue for VRF
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

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

#[derive(Accounts)]
pub struct CallbackRerollAttributes<'info> {
    /// VRF program identity ensures callback is from VRF program
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub player_state: Account<'info, PlayerState>,
}

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

#[vrf]
#[derive(Accounts)]
pub struct InitiateBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
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

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
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
        constraint = player_token_account.mint == game_round.token_mint @ PandaBattleError::InvalidMint
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    /// Vault token account for this round (ATA owned by game_round)
    #[account(
        mut,
        constraint = vault.owner == game_round.key() @ PandaBattleError::Unauthorized,
        constraint = vault.mint == game_round.token_mint @ PandaBattleError::InvalidMint
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

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
        ctx.accounts.player.key(),
        prize
    );

    Ok(())
}
