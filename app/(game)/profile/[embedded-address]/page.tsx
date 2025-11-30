"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  getPlayerByWallet,
  mockCurrentPlayer,
  generateAttributes,
  type Player,
} from "@/lib/mock/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReceiveFundsDrawer } from "@/components/drawers/receive-funds-drawer";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  Trophy,
  Brain,
  Dumbbell,
  Flame,
  Zap,
  Copy,
  Wallet,
  Check,
} from "lucide-react";
import { formatAddress } from "@/lib/utils";

export default function ProfilePage() {
  const params = useParams();
  const embeddedAddress = params["embedded-address"] as string;
  const [copy, isCopied] = useCopyToClipboard();

  const player = useMemo(() => {
    if (!embeddedAddress) return mockCurrentPlayer;

    const foundPlayer = getPlayerByWallet(embeddedAddress);
    if (foundPlayer) return foundPlayer;

    const attributes = generateAttributes();
    const defaultPlayer: Player = {
      wallet: embeddedAddress,
      attributes,
      turns: 5,
      lastBattleTime: new Date(Date.now() - 30 * 60 * 1000),
      lastActivityTime: new Date(Date.now() - 5 * 60 * 1000),
      battleCount: 0,
      winCount: 0,
      lossCount: 0,
      entryTime: new Date(),
      shields: [],
      buffs: [],
      rank: 0,
      inTop20: false,
      pandaName: `Panda ${embeddedAddress.slice(0, 4)}`,
      earnings: 0,
    };

    return defaultPlayer;
  }, [embeddedAddress]);

  const winRate =
    player.battleCount > 0
      ? ((player.winCount / player.battleCount) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Profile Header - Simple */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="size-20 border-4 border-[#4a9eff]">
          <AvatarImage src="/images/sample-panda.png" alt={player.pandaName} />
          <AvatarFallback className="bg-linear-to-b from-[#87ceeb] to-[#4a9eff] text-white text-xl font-bold">
            {player.pandaName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Typography variant="h2" className="text-white">
              {player.pandaName}
            </Typography>
            {player.inTop20 && (
              <Badge variant="rank">
                <Trophy className="size-3 mr-1" />
                Top 20
              </Badge>
            )}
            {player.rank > 0 && (
              <Badge variant="default">Rank #{player.rank}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Typography
              variant="muted"
              className="text-white/60 font-mono text-sm"
            >
              {formatAddress(player.wallet, 4)}
            </Typography>
            <button
              onClick={() => copy(player.wallet)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Copy address"
            >
              {isCopied ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4 text-white/60" />
              )}
            </button>
          </div>
        </div>
        <div className="text-right">
          <Typography variant="small" className="text-white/60 mb-1">
            Earnings
          </Typography>
          <Typography variant="h3" className="text-[#ffd700] font-bold mb-3">
            {player.earnings.toFixed(2)} SOL
          </Typography>
          <ReceiveFundsDrawer
            address={player.wallet}
            trigger={
              <Button className="bg-[#4a9eff] hover:bg-[#3a8eef] text-white">
                <Wallet className="size-4 mr-2" />
                Deposit
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Grid - Same as home */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatBadge
          icon={<Flame className="w-5 h-5" />}
          label="STA"
          value={player.attributes.endurance}
          color="bg-[#ff6b35]"
        />
        <StatBadge
          icon={<Dumbbell className="w-5 h-5" />}
          label="STR"
          value={player.attributes.strength}
          color="bg-[#ff9500]"
        />
        <StatBadge
          icon={<Zap className="w-5 h-5" />}
          label="AGI"
          value={player.attributes.speed}
          color="bg-[#34c759]"
        />
        <StatBadge
          icon={<Brain className="w-5 h-5" />}
          label="INT"
          value={player.attributes.luck}
          color="bg-[#007aff]"
        />
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white/95 rounded-xl px-2 py-1.5 flex items-center gap-2 shadow-md">
      <div className={`${color} text-white p-1.5 rounded-lg`}>{icon}</div>
      <span className="font-bold text-gray-800 text-sm">
        {label}: {value}
      </span>
    </div>
  );
}
