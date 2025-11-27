use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ForgePanda<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        init,
        payer = player,
        space = 8 + std::mem::size_of::<PandaNFT>(),
        seeds = [PANDA_METADATA_SEED.as_bytes(), panda_mint.key().as_ref()],
        bump
    )]
    pub panda_metadata: Account<'info, PandaNFT>,

    pub panda_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub player_token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault_token_account: UncheckedAccount<'info>,

    pub token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<ForgePanda>,
    name: String,
    panda_type: PandaType,
    attack: u8,
    defense: u8,
    speed: u8,
    intellect: u8,
    primary_color: [u8; 3],
    secondary_color: [u8; 3],
    accent_color: [u8; 3],
) -> Result<()> {
    validate_panda_name(&name)?;
    validate_stats(attack, defense, speed, intellect)?;

    let panda_metadata = &mut ctx.accounts.panda_metadata;
    let clock = &ctx.accounts.clock;
    let current_time = clock.unix_timestamp;

    panda_metadata.panda_mint = ctx.accounts.panda_mint.key();
    panda_metadata.owner = ctx.accounts.player.key();
    panda_metadata.bump = ctx.bumps.panda_metadata;

    panda_metadata.panda_type = panda_type;
    panda_metadata.name = name;
    panda_metadata.attack = attack;
    panda_metadata.defense = defense;
    panda_metadata.speed = speed;
    panda_metadata.intellect = intellect;
    panda_metadata.base_hp = calculate_base_hp(attack, defense);

    panda_metadata.primary_color = primary_color;
    panda_metadata.secondary_color = secondary_color;
    panda_metadata.accent_color = accent_color;

    panda_metadata.rarity = PandaNFT::calculate_rarity(&[attack, defense, speed, intellect]);
    panda_metadata.level = 1;
    panda_metadata.total_wins = 0;
    panda_metadata.total_losses = 0;
    panda_metadata.total_damage_dealt = 0;
    panda_metadata.total_damage_taken = 0;
    panda_metadata.highest_hp_reached = 0;

    panda_metadata.parent_male = None;
    panda_metadata.parent_female = None;
    panda_metadata.generation = 0;
    panda_metadata.breed_count = 0;

    panda_metadata.last_bred_at = 0;
    panda_metadata.breeding_cooldown_ends = current_time;

    panda_metadata.created_at = current_time;
    panda_metadata.last_battle_at = 0;
    panda_metadata.uri = String::new();

    panda_metadata.is_locked = false;
    panda_metadata.version = 1;

    // Emit PandaForged event
    emit!(PandaForged {
        panda_mint: ctx.accounts.panda_mint.key(),
        owner: ctx.accounts.player.key(),
        name: panda_metadata.name.clone(),
        panda_type,
        rarity: panda_metadata.rarity,
        timestamp: current_time,
    });

    Ok(())
}

#[event]
pub struct PandaForged {
    pub panda_mint: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub panda_type: PandaType,
    pub rarity: Rarity,
    pub timestamp: i64,
}
