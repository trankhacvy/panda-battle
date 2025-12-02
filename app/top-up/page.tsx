"use client";

import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { useSolBalance, useSplTokenBalance } from "@/hooks/use-balance";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button3D } from "@/components/ui/button-3d";
import Link from "next/link";

// Fake USDC address for now - replace with actual USDC mint address
const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export default function TopUpPage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  const { balanceInSol, isLoading: isLoadingSol } = useSolBalance(
    wallet?.address
  );
  const { balanceInToken: usdcBalance, isLoading: isLoadingUsdc } =
    useSplTokenBalance(wallet?.address, USDC_MINT_ADDRESS);

  const shortAddress = wallet?.address
    ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-4)}`
    : "";
  const fullAddress = wallet?.address || "";

  const copyToClipboard = (text: string, type: "short" | "full") => {
    navigator.clipboard.writeText(text);
    if (type === "short") {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    } else {
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    }
  };

  const handleAddFunds = () => {
    // TODO: Implement actual funding logic from connected wallet
    router.push("/create");
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1e3a5f] to-[#1a2744] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">No Wallet Found</h1>
          <p className="text-gray-300">
            Unable to find your embedded wallet. Please try logging in again.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-cyan-400 hover:bg-cyan-300 text-[#1a2744] font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-[#1a2744] via-[#1e3a5f] to-[#1a2744] flex flex-col">
      <div className="flex-1 px-4 py-6 pb-24">
        {/* Header */}
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Your New App Wallet
        </h1>

        {/* Wallet intro section */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 shrink-0">
            <WalletIcon />
          </div>
          <p className="text-white text-base leading-relaxed">
            {
              "We've set up a new wallet just for you! This lets you play games in the app smoothly without extra hassle. It's empty right now, so let's add some funds to get started."
            }
          </p>
        </div>

        {/* Current Balances */}
        <div className="space-y-3 mb-4">
          <div className="bg-[#2a4066]/80 rounded-lg p-4 border border-[#3a5080]/50">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">SOL Balance</span>
              <span className="text-white font-bold">
                {isLoadingSol ? "Loading..." : `${balanceInSol.toFixed(4)} SOL`}
              </span>
            </div>
          </div>

          <div className="bg-[#2a4066]/80 rounded-lg p-4 border border-[#3a5080]/50">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">USDC Balance</span>
              <span className="text-white font-bold">
                {isLoadingUsdc
                  ? "Loading..."
                  : `${usdcBalance.toFixed(2)} USDC`}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Address Card */}
        {/* <div className="bg-[#2a4066]/80 rounded-lg p-4 mb-4 border border-[#3a5080]/50">
          <p className="text-gray-300 text-sm mb-2">Your Wallet Address</p>
          <div className="flex items-center justify-between bg-[#1e3050] rounded-lg px-4 py-3">
            <span className="text-white text-lg font-mono">{shortAddress}</span>
            <button
              onClick={() => copyToClipboard(fullAddress, "short")}
              className="p-2 hover:bg-[#3a5080] rounded-md transition-colors"
            >
              {copiedShort ? (
                <Check className="w-5 h-5 text-cyan-400" />
              ) : (
                <Copy className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div> */}

        {/* Add Funds Button */}
        {/* <button
          onClick={handleAddFunds}
          className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#1a2744] font-bold py-4 rounded-lg mb-4 transition-colors text-lg"
        >
          Add Funds from Your Connected Wallet
        </button> */}

        {/* QR Code Section */}
        <div className="bg-[#2a4066]/80 rounded-lg p-4 border border-cyan-400/50 relative mb-6">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

          <div className="flex justify-center py-4">
            <div className="bg-white p-3 rounded-lg">
              <QRCodeSVG value={fullAddress} size={140} />
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#1e3050] rounded-lg px-4 py-3 mb-3">
            <span className="text-white text-sm font-mono truncate pr-2">
              {fullAddress}
            </span>
            <button
              onClick={() => copyToClipboard(fullAddress, "full")}
              className="p-2 hover:bg-[#3a5080] rounded-md transition-colors shrink-0"
            >
              {copiedFull ? (
                <Check className="w-5 h-5 text-cyan-400" />
              ) : (
                <Copy className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>

          <p className="text-gray-300 text-center text-sm">
            Scan this QR or copy the address to send funds from another app.
          </p>
        </div>

        <Link href="/create">
          <Button3D className="w-full">Play Now</Button3D>
        </Link>
      </div>
    </div>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {/* Wallet body */}
      <defs>
        <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="20"
        width="48"
        height="36"
        rx="4"
        fill="url(#walletGrad)"
      />
      {/* Money */}
      <rect x="14" y="12" width="24" height="16" rx="2" fill="#4ade80" />
      <rect x="18" y="8" width="24" height="16" rx="2" fill="#22c55e" />
      {/* Clasp */}
      <circle
        cx="52"
        cy="38"
        r="6"
        fill="#1e3a5f"
        stroke="#60a5fa"
        strokeWidth="2"
      />
      <circle cx="52" cy="38" r="3" fill="white" />
    </svg>
  );
}
