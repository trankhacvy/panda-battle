use anchor_lang::prelude::*;

#[account]
pub struct TreasuryConfig {
    pub vault_ata: Pubkey,
    pub authority: Pubkey,
    pub bump: u8,
    pub total_distributed: u64,
    pub total_deposited: u64,
    pub version: u8,
}

impl TreasuryConfig {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 8 + 8 + 1;
}

#[event]
pub struct TreasuryInitialized {
    pub vault_ata: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryDeposited {
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryTransferred {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub reason: String,
    pub timestamp: i64,
}
