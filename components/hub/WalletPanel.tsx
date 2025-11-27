'use client';

import { useState } from 'react';
import { Copy, LogOut, Send, TrendingUp } from 'lucide-react';
import {
  mockWalletProfile,
  mockAllBadges,
  getRarityColor,
  getRarityBgColor,
} from '@/lib/mock/wallet';
import { cn } from '@/lib/utils';

interface WalletPanelProps {
  className?: string;
}

type ModalType = null | 'deposit' | 'withdraw' | 'badges';

export default function WalletPanel({ className }: WalletPanelProps) {
  const [isConnected, setIsConnected] = useState(mockWalletProfile.isConnected);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockWalletProfile.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleToggleWallet = () => {
    setIsConnected(!isConnected);
  };

  const handleDepositClick = () => {
    setActiveModal('deposit');
  };

  const handleWithdrawClick = () => {
    setActiveModal('withdraw');
  };

  const handleViewBadges = () => {
    setActiveModal('badges');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  if (!isConnected) {
    return (
      <div
        className={cn(
          'space-y-6 p-6 md:p-8 bg-gradient-to-br from-muted/50 to-muted rounded-lg border border-border',
          className
        )}
      >
        <div className="space-y-4 text-center">
          <div className="text-5xl">🔗</div>
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <p className="text-muted-foreground">
            Connect your Solana wallet to manage your account, view balance, and trade pandas.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleToggleWallet}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors active:scale-95"
          >
            Connect Wallet
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Supports Phantom, Magic Eden, and other Solana wallets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Wallet Header */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-semibold">{mockWalletProfile.address}</code>
              <button
                onClick={handleCopyAddress}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  copiedAddress
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mockWalletProfile.verified && (
              <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs font-semibold">
                ✓ Verified
              </span>
            )}
            <button
              onClick={handleToggleWallet}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Disconnect wallet"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SOL Balance */}
        <div className="p-6 rounded-lg bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">SOL Balance</p>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold">{mockWalletProfile.balance.solAmount}</p>
          <p className="text-xs text-muted-foreground">
            ≈ ${(mockWalletProfile.balance.solAmount * 62).toFixed(2)} USD
          </p>
        </div>

        {/* Staked Pandas */}
        <div className="p-6 rounded-lg bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Staked Pandas</p>
            <span className="text-2xl">🐼</span>
          </div>
          <p className="text-3xl font-bold">{mockWalletProfile.balance.stakedPandas}</p>
          <p className="text-xs text-muted-foreground">
            Earning 0.12 SOL / day
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleDepositClick}
          className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Deposit
        </button>
        <button
          onClick={handleWithdrawClick}
          className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4 rotate-180" />
          Withdraw
        </button>
      </div>

      {/* Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Equipped Badges ({mockWalletProfile.equippedBadges.length})</h3>
          <button
            onClick={handleViewBadges}
            className="text-xs text-primary hover:underline font-semibold"
          >
            View All ({mockWalletProfile.totalBadges})
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {mockWalletProfile.equippedBadges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                'p-3 rounded-lg border border-border text-center space-y-1 cursor-pointer hover:border-primary/50 transition-colors',
                getRarityBgColor(badge.rarity)
              )}
              title={badge.description}
            >
              <p className="text-3xl">{badge.icon}</p>
              <p
                className={cn('text-xs font-semibold line-clamp-1', getRarityColor(badge.rarity))}
              >
                {badge.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-2 text-sm">
        <p className="text-muted-foreground">
          Member since{' '}
          <span className="font-semibold text-foreground">
            {new Date(mockWalletProfile.joinedDate).toLocaleDateString()}
          </span>
        </p>
        <p className="text-muted-foreground">
          Total Portfolio Value:{' '}
          <span className="font-semibold text-foreground">
            ${mockWalletProfile.balance.totalValue.toFixed(2)} USD
          </span>
        </p>
      </div>

      {/* Modals/Sheets */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-background rounded-t-lg md:rounded-lg border border-border w-full md:max-w-md p-6 space-y-4 animate-in slide-in-from-bottom md:slide-in-from-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Deposit Modal */}
            {activeModal === 'deposit' && (
              <>
                <h2 className="text-xl font-bold">Deposit SOL</h2>
                <p className="text-sm text-muted-foreground">
                  Send SOL from your external wallet to this address to deposit funds.
                </p>

                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                  <p className="text-xs text-muted-foreground">Your Deposit Address</p>
                  <code className="text-sm font-mono font-semibold break-all">
                    {mockWalletProfile.address}
                  </code>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (SOL)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum deposit: 0.1 SOL
                  </p>
                </div>

                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Confirm Deposit
                </button>
              </>
            )}

            {/* Withdraw Modal */}
            {activeModal === 'withdraw' && (
              <>
                <h2 className="text-xl font-bold">Withdraw SOL</h2>
                <p className="text-sm text-muted-foreground">
                  Withdraw SOL from your account to an external wallet.
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="Paste recipient address..."
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (SOL)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                    max={mockWalletProfile.balance.solAmount}
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {mockWalletProfile.balance.solAmount} SOL
                  </p>
                </div>

                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Confirm Withdrawal
                </button>
              </>
            )}

            {/* View All Badges Modal */}
            {activeModal === 'badges' && (
              <>
                <h2 className="text-xl font-bold">
                  All Badges ({mockWalletProfile.totalBadges})
                </h2>
                <p className="text-sm text-muted-foreground">
                  Click to equip/unequip badges
                </p>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {mockAllBadges.map((badge) => {
                    const isEquipped = mockWalletProfile.equippedBadges.some(
                      (b) => b.id === badge.id
                    );
                    return (
                      <div
                        key={badge.id}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors',
                          isEquipped
                            ? 'bg-primary/10 border-primary/50'
                            : 'bg-card border-border/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">{badge.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {badge.description}
                            </p>
                            <p
                              className={cn(
                                'text-xs font-semibold mt-1 inline-block',
                                getRarityColor(badge.rarity)
                              )}
                            >
                              {badge.rarity.toUpperCase()}
                            </p>
                          </div>
                          {isEquipped && (
                            <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded">
                              EQUIPPED
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Modal Footer */}
            <button
              onClick={handleCloseModal}
              className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
