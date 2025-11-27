use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CompleteBreeding<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [BREEDING_SESSION_SEED.as_bytes(), breeding_session.breeding_id.as_ref()],
        bump = breeding_session.bump
    )]
    pub breeding_session: Account<'info, BreedingSession>,

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
        space = 8 + std::mem::size_of::<PandaNFT>(),
        seeds = [PANDA_METADATA_SEED.as_bytes(), offspring_mint.key().as_ref()],
        bump
    )]
    pub offspring: Account<'info, PandaNFT>,

    pub offspring_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub player_token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault_token_account: UncheckedAccount<'info>,

    pub token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<CompleteBreeding>,
    offspring_name: String,
    offspring_rarity_boost: u8,
) -> Result<()> {
    let breeding_session = &mut ctx.accounts.breeding_session;
    let parent_male = &mut ctx.accounts.parent_male;
    let parent_female = &mut ctx.accounts.parent_female;
    let offspring = &mut ctx.accounts.offspring;
    let clock = &ctx.accounts.clock;
    let current_time = clock.unix_timestamp;

    // Validation checks
    require!(
        breeding_session.status == BreedingStatus::Active,
        ErrorCode::BreedingSessionComplete
    );

    require!(
        !breeding_session.is_expired(current_time),
        ErrorCode::BreedingSessionExpired
    );

    require!(
        breeding_session.parent_male_mint == parent_male.panda_mint,
        ErrorCode::ParentMintMismatch
    );

    require!(
        breeding_session.parent_female_mint == parent_female.panda_mint,
        ErrorCode::ParentMintMismatch
    );

    require!(
        breeding_session.player_pubkey == ctx.accounts.player.key(),
        ErrorCode::AccountMismatch
    );

    validate_panda_name(&offspring_name)?;

    // Inherit traits from parents
    let (offspring_attack, offspring_defense, offspring_speed, offspring_intellect) =
        inherit_traits(
            parent_male.attack,
            parent_male.defense,
            parent_male.speed,
            parent_male.intellect,
            parent_female.attack,
            parent_female.defense,
            parent_female.speed,
            parent_female.intellect,
        )?;

    // Apply rarity boost (capped at 10%)
    let boost_factor = ((offspring_rarity_boost.min(10) as u16) * 100 + 1000) as u16;
    let boosted_attack = ((offspring_attack as u16 * boost_factor) / 1000).min(100) as u8;
    let boosted_defense = ((offspring_defense as u16 * boost_factor) / 1000).min(100) as u8;
    let boosted_speed = ((offspring_speed as u16 * boost_factor) / 1000).min(100) as u8;
    let boosted_intellect = ((offspring_intellect as u16 * boost_factor) / 1000).min(100) as u8;

    validate_stats(boosted_attack, boosted_defense, boosted_speed, boosted_intellect)?;

    // Create offspring
    offspring.panda_mint = ctx.accounts.offspring_mint.key();
    offspring.owner = ctx.accounts.player.key();
    offspring.bump = ctx.bumps.offspring;

    offspring.panda_type = parent_male.panda_type;
    offspring.name = offspring_name;
    offspring.attack = boosted_attack;
    offspring.defense = boosted_defense;
    offspring.speed = boosted_speed;
    offspring.intellect = boosted_intellect;
    offspring.base_hp = calculate_base_hp(boosted_attack, boosted_defense);

    // Blend colors from parents
    offspring.primary_color = blend_colors(&parent_male.primary_color, &parent_female.primary_color);
    offspring.secondary_color = blend_colors(&parent_male.secondary_color, &parent_female.secondary_color);
    offspring.accent_color = blend_colors(&parent_male.accent_color, &parent_female.accent_color);

    offspring.rarity = PandaNFT::calculate_rarity(&[
        boosted_attack,
        boosted_defense,
        boosted_speed,
        boosted_intellect,
    ]);
    offspring.level = 1;
    offspring.total_wins = 0;
    offspring.total_losses = 0;
    offspring.total_damage_dealt = 0;
    offspring.total_damage_taken = 0;
    offspring.highest_hp_reached = 0;

    // Set lineage
    offspring.parent_male = Some(parent_male.panda_mint);
    offspring.parent_female = Some(parent_female.panda_mint);
    offspring.generation = (parent_male.generation.max(parent_female.generation)) + 1;
    offspring.breed_count = 0;

    offspring.last_bred_at = 0;
    offspring.breeding_cooldown_ends = current_time;

    offspring.created_at = current_time;
    offspring.last_battle_at = 0;
    offspring.uri = String::new();

    offspring.is_locked = false;
    offspring.version = 1;

    // Update parent stats
    parent_male.breed_count += 1;
    parent_male.last_bred_at = current_time;
    parent_male.breeding_cooldown_ends = current_time + PANDA_BREEDING_COOLDOWN;
    parent_male.is_locked = false;

    parent_female.breed_count += 1;
    parent_female.last_bred_at = current_time;
    parent_female.breeding_cooldown_ends = current_time + PANDA_BREEDING_COOLDOWN;
    parent_female.is_locked = false;

    // Update breeding session
    breeding_session.offspring_mint = Some(ctx.accounts.offspring_mint.key());
    breeding_session.offspring_created_at = Some(current_time);
    breeding_session.status = BreedingStatus::Complete;
    breeding_session.completed_at = Some(current_time);

    emit!(OffspringCreated {
        breeding_id: breeding_session.breeding_id,
        offspring_mint: ctx.accounts.offspring_mint.key(),
        offspring_name: offspring.name.clone(),
        parent_male_mint: parent_male.panda_mint,
        parent_female_mint: parent_female.panda_mint,
        offspring_generation: offspring.generation,
        owner: ctx.accounts.player.key(),
        timestamp: current_time,
    });

    Ok(())
}

fn blend_colors(color1: &[u8; 3], color2: &[u8; 3]) -> [u8; 3] {
    [
        ((color1[0] as u16 + color2[0] as u16) / 2) as u8,
        ((color1[1] as u16 + color2[1] as u16) / 2) as u8,
        ((color1[2] as u16 + color2[2] as u16) / 2) as u8,
    ]
}

#[event]
pub struct OffspringCreated {
    pub breeding_id: [u8; 32],
    pub offspring_mint: Pubkey,
    pub offspring_name: String,
    pub parent_male_mint: Pubkey,
    pub parent_female_mint: Pubkey,
    pub offspring_generation: u8,
    pub owner: Pubkey,
    pub timestamp: i64,
}
