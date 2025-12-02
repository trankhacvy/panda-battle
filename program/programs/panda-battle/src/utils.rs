

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        transfer_checked, Mint, TokenAccount, TokenInterface, Transfer, TransferChecked,
    },
};

pub fn transfer_to_vault<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    mint: &InterfaceAccount<'info, Mint>,
    authority: &Signer<'info>,
    token_program: &Program<'info, Interface<'info, TokenInterface>>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(token_program.to_account_info(), cpi_accounts);

    transfer_checked(cpi_ctx, amount, mint.decimals)?;

    msg!("Transferred {} tokens to vault", amount);
    Ok(())
}

// pub fn transfer_from_vault<'info>(
//     from: &Account<'info, TokenAccount>,
//     to: &Account<'info, TokenAccount>,
//     authority: &AccountInfo<'info>,
//     token_program: &Program<'info, Interface<'info, TokenInterface>>,
//     amount: u64,
//     signer_seeds: &[&[&[u8]]],
// ) -> Result<()> {
//     let cpi_accounts = Transfer {
//         from: from.to_account_info(),
//         to: to.to_account_info(),
//         authority: authority.to_account_info(),
//     };

//     let cpi_ctx =
//         CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, signer_seeds);
//     transfer(cpi_ctx, amount)?;

//     msg!("Transferred {} tokens from vault", amount);
//     Ok(())
// }

pub fn transfer_from_vault<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    mint: &InterfaceAccount<'info, Mint>,
    authority: &Signer<'info>,
    token_program: &Program<'info, Interface<'info, TokenInterface>>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_ctx =
        CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, signer_seeds);

    transfer_checked(cpi_ctx, amount, mint.decimals)?;

    msg!("Transferred {} tokens to vault", amount);
    Ok(())
}
