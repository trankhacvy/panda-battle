use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token};

use crate::state::*;
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct SpendBambooForAction<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [TREASURY_SEED.as_bytes()],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        mut,
        address = treasury_config.vault_ata @ ErrorCode::InvalidTokenAccount
    )]
    pub treasury_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::owner = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<SpendBambooForAction>,
    amount: u64,
    action: String,
) -> Result<()> {
    let player_account = &ctx.accounts.player_token_account;

    require!(
        player_account.amount >= amount,
        ErrorCode::InsufficientBalance
    );

    // Transfer tokens from player to treasury
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.player_token_account.to_account_info(),
                to: ctx.accounts.treasury_ata.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        ),
        amount,
    )?;

    let treasury = &mut ctx.accounts.treasury_config;
    treasury.total_deposited = treasury.total_deposited
        .checked_add(amount)
        .ok_or(ErrorCode::CustomError)?;

    emit!(TokensSpent {
        player: ctx.accounts.player.key(),
        amount,
        action: action.clone(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    emit!(TreasuryTransferred {
        from: ctx.accounts.player_token_account.key(),
        to: ctx.accounts.treasury_ata.key(),
        amount,
        reason: format!("spend_{}", action),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Player spent {} tokens for action: {}", amount, action);

    Ok(())
}
