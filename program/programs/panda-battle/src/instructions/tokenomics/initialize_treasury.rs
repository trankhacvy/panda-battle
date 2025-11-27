use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = TreasuryConfig::LEN,
        seeds = [TREASURY_SEED.as_bytes()],
        bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = treasury_config,
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(
    ctx: Context<InitializeTreasury>,
) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury_config;

    treasury.vault_ata = ctx.accounts.vault_ata.key();
    treasury.authority = ctx.accounts.authority.key();
    treasury.bump = ctx.bumps.treasury_config;
    treasury.total_distributed = 0;
    treasury.total_deposited = 0;
    treasury.version = 1;

    emit!(TreasuryInitialized {
        vault_ata: treasury.vault_ata,
        authority: treasury.authority,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Treasury initialized with ATA: {} for mint: {}", 
        ctx.accounts.vault_ata.key(),
        ctx.accounts.mint.key()
    );

    Ok(())
}
