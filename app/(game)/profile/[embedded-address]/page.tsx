"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  getPlayerByWallet,
  mockCurrentPlayer,
  generateAttributes,
  type Player,
} from "@/lib/mock/data";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReceiveFundsDrawer } from "@/components/drawers/receive-funds-drawer";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  Trophy,
  Brain,
  Dumbbell,
  Zap,
  Copy,
  Wallet,
  Check,
} from "lucide-react";
import { formatAddress } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
    <div className="p-4 pb-24 space-y-4">
      {/* Panda Avatar Card */}
      <Card size="lg">
        <div className="aspect-video flex items-center justify-center relative overflow-hidden">
          <picture className="absolute inset-0 w-full h-full">
            <source srcSet="/images/fighter-frame.avif" type="image/avif" />
            <source srcSet="/images/fighter-frame.webp" type="image/webp" />
            <img
              src="/images/fighter-frame.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </picture>
          <img
            src="/images/sample-panda.png"
            alt={player.pandaName}
            className="relative z-10 w-auto h-full object-cover"
          />
        </div>
      </Card>

      {/* Player Info Card */}
      <div className="w-full relative z-10">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Typography
                  variant="h2"
                  className="text-white font-black text-3xl"
                  style={{
                    textShadow:
                      "3px 3px 0px rgba(0,0,0,0.3), 5px 5px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {player.pandaName}
                </Typography>
                {player.inTop20 && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Trophy className="size-3" />
                    Top 20
                  </Badge>
                )}
              </div>
              {player.rank > 0 && (
                <Badge variant="secondary" className="mb-2">
                  Rank #{player.rank}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Typography variant="small" className="text-white font-mono">
                  {formatAddress(player.wallet, 6)}
                </Typography>
                <button
                  onClick={() => copy(player.wallet)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Copy address"
                >
                  {isCopied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="bg-gradient-to-br bg-white shadow-[0_7px_0_#d0d0d0,0_8px_16px_-7px_rgba(0,0,0,0.2)] rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  Total Earnings
                </Typography>
                <Typography variant="h3" className="text-[#ffd700] font-bold">
                  {player.earnings.toFixed(2)} SOL
                </Typography>
              </div>
              {/* <Trophy className="size-8 text-[#ffd700]" /> */}
            </div>
          </div>

          {/* Deposit Button */}
          <ReceiveFundsDrawer
            address={player.wallet}
            trigger={
              <Button className="w-full" variant="primary" size="lg">
                <Wallet className="size-5 mr-2" />
                Deposit Funds
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Card */}
      <div className="w-full relative z-10">
        <Typography variant="h3" className="text-white mb-3 font-bold px-1">
          Attributes
        </Typography>
        <div className="flex gap-3">
          <StatBadge
            icon={<Dumbbell className="w-6 h-6" />}
            label="Strength"
            value={player.attributes.strength}
            color="bg-[#ff9500]"
          />
          <StatBadge
            icon={<Zap className="w-6 h-6" />}
            label="Agility"
            value={player.attributes.speed}
            color="bg-[#34c759]"
          />
          <StatBadge
            icon={<Brain className="w-6 h-6" />}
            label="Intelligence"
            value={player.attributes.luck}
            color="bg-[#007aff]"
          />
        </div>
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
    <div className="flex-1 bg-white rounded-2xl p-4 shadow-[0_7px_0_#d0d0d0,0_8px_16px_-7px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col items-center gap-2">
        <div className={`${color} text-white p-3 rounded-xl`}>{icon}</div>
        <Typography variant="small" className="text-gray-700 font-semibold">
          {label}
        </Typography>
        <Typography variant="h2" className="text-gray-900 font-bold">
          {value}
        </Typography>
      </div>
    </div>
  );
}

function BattleStatBadge({
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
    <div className="flex-1 bg-white rounded-2xl p-4 shadow-[0_7px_0_#d0d0d0,0_8px_16px_-7px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col items-center gap-2">
        <div className={`${color} text-white p-3 rounded-xl`}>{icon}</div>
        <Typography variant="small" className="text-gray-700 font-semibold">
          {label}
        </Typography>
        <Typography variant="h2" className="text-gray-900 font-bold">
          {value}
        </Typography>
      </div>
    </div>
  );
}
