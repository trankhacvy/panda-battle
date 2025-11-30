"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Button3D } from "@/components/ui/button-3d";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Typography } from "@/components/ui/typography";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatAddress } from "@/lib/utils";
import { Copy, Share2, X, Info } from "lucide-react";

interface ReceiveFundsDrawerProps {
  address: string;
  trigger: React.ReactNode;
}

export function ReceiveFundsDrawer({
  address,
  trigger,
}: ReceiveFundsDrawerProps) {
  const [copy, isCopied] = useCopyToClipboard();
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Solana Wallet Address",
          text: address,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to copy
      copy(address);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="bg-[#1a3a5c] border-t-2 border-[#4a9eff]/30">
        <DrawerHeader className="px-6 pt-6 pb-6">
          <div className="flex items-center justify-between mb-8">
            <DrawerTitle className="text-white text-xl font-semibold">
              Receive Funds
            </DrawerTitle>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="size-5 text-white" />
              </button>
            </DrawerClose>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-6 rounded-2xl mb-4 shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${address}`}
                alt="Wallet QR Code"
                className="w-64 h-64"
              />
            </div>
            <Typography variant="muted" className="text-white/60 text-xs">
              (Scan with any Solana wallet)
            </Typography>
          </div>

          {/* Network Info - Centered */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Typography variant="small" className="text-white/60 text-sm">
              Send only
            </Typography>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a9eff]/20 rounded-lg">
              <Typography
                variant="small"
                className="text-white text-sm font-medium"
              >
                USDC
              </Typography>
            </div>
            <Typography variant="small" className="text-white/60 text-sm">
              on
            </Typography>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
              <Typography
                variant="small"
                className="text-white text-sm font-medium"
              >
                Solana
              </Typography>
            </div>
          </div>

          {/* Address - Centered */}
          <div className="mb-6 text-center">
            <Typography
              variant="small"
              className="text-white font-mono text-sm break-all"
            >
              {address}
            </Typography>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <Button3D
              variant="3d-blue"
              className="flex flex-1 gap-2 h-10"
              onClick={() => copy(address)}
            >
              Copy
            </Button3D>
            <Button3D
              variant="3d-blue"
              className="flex flex-1 gap-2 h-10"
              onClick={handleShare}
            >
              Share
            </Button3D>
          </div>

          {/* Warning - Centered */}
          <div className="flex items-start justify-center gap-2 pt-4 border-t border-white/10">
            <Info className="size-4 text-white/60 mt-0.5 shrink-0" />
            <Typography
              variant="muted"
              className="text-white/60 text-xs text-center max-w-sm"
            >
              Items sent to the wrong address cannot be recovered.
            </Typography>
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
