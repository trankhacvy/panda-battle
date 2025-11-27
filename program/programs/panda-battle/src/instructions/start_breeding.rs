use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct StartBreeding<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [PANDA_METADATA_SEED.as_bytes(), parent_male_mint.key().as_ref()],
        bump
    )]
    pub parent_male: Account<'info, PandaNFT>,

    #[account(
        mut,
        seeds = [PANDA_METADATA_SEED.as_bytes(), parent_female_mint.key().as_ref()],
        bump
    )]
    pub parent_female: Account<'info, PandaNFT>,

    pub parent_male_mint: UncheckedAccount<'info>,
    pub parent_female_mint: UncheckedAccount<'info>,

    #[account(
        init,
        payer = player,
        space = 8 + std::mem::size_of::<BreedingSession>(),
        seeds = [BREEDING_SESSION_SEED.as_bytes(), breeding_id.as_ref()],
        bump
    )]
    pub breeding_session: Account<'info, BreedingSession>,

    #[account(mut)]
    pub player_token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault_token_account: UncheckedAccount<'info>,

    pub token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<StartBreeding>,
    breeding_id: [u8; 32],
) -> Result<()> {
    let parent_male = &mut ctx.accounts.parent_male;
    let parent_female = &mut ctx.accounts.parent_female;
    let breeding_session = &mut ctx.accounts.breeding_session;
    let clock = &ctx.accounts.clock;
    let current_time = clock.unix_timestamp;

    // Validation checks
    require!(
        parent_male.owner == ctx.accounts.player.key(),
        ErrorCode::NotPandaOwner
    );
    require!(
        parent_female.owner == ctx.accounts.player.key(),
        ErrorCode::NotPandaOwner
    );

    require!(
        parent_male.panda_mint != parent_female.panda_mint,
        ErrorCode::SamePandaBreeding
    );

    require!(
        !parent_male.is_locked,
        ErrorCode::PandaLocked
    );
    require!(
        !parent_female.is_locked,
        ErrorCode::PandaLocked
    );

    require!(
        parent_male.is_breeding_ready(current_time),
        ErrorCode::CooldownViolation
    );
    require!(
        parent_female.is_breeding_ready(current_time),
        ErrorCode::CooldownViolation
    );

    require!(
        parent_male.breed_count < MAX_BREED_COUNT,
        ErrorCode::MaxBreedCountReached
    );
    require!(
        parent_female.breed_count < MAX_BREED_COUNT,
        ErrorCode::MaxBreedCountReached
    );

    require!(
        parent_male.generation < MAX_GENERATIONS,
        ErrorCode::MaxGenerationReached
    );
    require!(
        parent_female.generation < MAX_GENERATIONS,
        ErrorCode::MaxGenerationReached
    );

    // Initialize breeding session
    breeding_session.breeding_id = breeding_id;
    breeding_session.bump = ctx.bumps.breeding_session;
    breeding_session.player_pubkey = ctx.accounts.player.key();
    breeding_session.parent_male_mint = parent_male.panda_mint;
    breeding_session.parent_female_mint = parent_female.panda_mint;
    breeding_session.offspring_mint = None;
    breeding_session.offspring_created_at = None;
    breeding_session.status = BreedingStatus::Active;
    breeding_session.started_at = current_time;
    breeding_session.expires_at = current_time + BREEDING_SESSION_TIMEOUT;
    breeding_session.completed_at = None;
    breeding_session.bamboo_cost = BREEDING_COST;
    breeding_session.bamboo_paid = false;
    breeding_session.version = 1;

    // Lock both pandas during breeding
    parent_male.is_locked = true;
    parent_female.is_locked = true;

    emit!(BreedingStarted {
        breeding_id,
        parent_male_mint: parent_male.panda_mint,
        parent_female_mint: parent_female.panda_mint,
        player: ctx.accounts.player.key(),
        timestamp: current_time,
    });

    Ok(())
}

#[event]
pub struct BreedingStarted {
    pub breeding_id: [u8; 32],
    pub parent_male_mint: Pubkey,
    pub parent_female_mint: Pubkey,
    pub player: Pubkey,
    pub timestamp: i64,
}
