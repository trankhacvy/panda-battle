"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";

export default function DepositPage() {
  const walletAddress = "AbCdEfGh1234IJKLMnOpQrStUvWxYz567890";

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Header Title */}
      <div className="text-center shrink-0 px-4 pt-4">
        <h1 className="text-2xl font-black text-white drop-shadow-lg">
          Your New App Wallet
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto scrollbar-hide ">
        {/* Card 1: Icon + Description */}
        <div className="flex items-center gap-4 p-4 bg-linear-to-r from-[#2d4a6f] to-[#1a2942] flex-shrink-0 z-1000">
          <img
            src="/images/panda-wallet.png"
            alt="Panda Wallet"
            className="size-25 hrink-0 object-contain"
          />
          <p className="text-white text-sm leading-relaxed flex-1">
            We&apos;ve set up a new wallet just for you! This lets you play
            games in the app smoothly without extra hassle. It&apos;s empty
            right now, so let&apos;s add some funds to get started.
          </p>
        </div>

        {/* Card 2: Wallet Address */}
        <Card size="sm" className=" mx-4 my-2">
          <div className="p-3 bg-[#2d4a6f] space-y-2">
            <label className="text-white font-semibold text-sm">
              Your Wallet Address
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0a1628] rounded-lg px-3 py-2 flex items-center min-w-0">
                <p className="text-white font-mono text-[14px] truncate">
                  {walletAddress}
                </p>
              </div>
              <CopyButton content={walletAddress} size="md" />
            </div>
          </div>
        </Card>

        {/* Button: Add Funds */}
        <div className="px-4">
          <Button size="md" variant="primary" className="w-full">
            Add Funds from Connected Wallet
          </Button>
        </div>

        {/* Card 3: QR Code + Address + Text */}
        <Card size="sm" className="shrink-0 mx-4">
          <div className="p-3 bg-[#2d4a6f] space-y-3">
            {/* QR Code */}
            <div className="bg-white rounded-xl p-3 flex items-center justify-center">
              <div className="w-32 h-32 rounded-lg flex items-center justify-center">
                <img
                  src="/images/panda-qr.png"
                  alt="Panda QR"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Address with Copy Button */}
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0a1628] rounded-lg px-3 py-2 flex items-center min-w-0">
                <p className="text-white font-mono text-[14px] truncate">
                  {walletAddress}
                </p>
              </div>
              <CopyButton content={walletAddress} size="md" />
            </div>

            {/* Description Text */}
            <p className="text-white/90 text-sm text-center leading-relaxed">
              Scan this QR or copy the address to send funds from another app.
            </p>
          </div>
        </Card>

        <div className="pb-3"></div>
      </div>
    </div>
  );
}
