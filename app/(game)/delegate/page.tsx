"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function DelegatePage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelegate = async () => {
    setIsProcessing(true);
    // Simulate delegation process
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col pt-3 gap-4">
      {/* Header Title */}
      <div className="text-center flex-shrink-0 px-4 pt-4">
        <h1 className="text-3xl font-black text-[#FFD700] drop-shadow-[0_2px_8px_rgba(255,215,0,0.5)]" style={{ textShadow: '3px 3px 0px #8B6914, -1px -1px 0px #8B6914, 1px -1px 0px #8B6914, -1px 1px 0px #8B6914, 1px 1px 0px #8B6914' }}>
          Delegate Your Wallet
        </h1>
        <p className="text-white text-base mt-2">
          A new in-game wallet has been created for you!
        </p>
      </div>

      {/* Main Content Card */}
      <Card size="lg" className="flex-1 flex flex-col  mx-4">
        <div className="flex-1 flex flex-col  justify-between p-6 bg-gradient-to-b from-[#1a2942] to-[#0a1628]">
          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-center gap-6 min-h-0 overflow-y-auto">
            <p className="text-white text-center text-base leading-relaxed font-medium">
              To make gameplay smooth and hassle-free, we need your permission to manage transactions on your behalf.
            </p>
            
            <p className="text-white text-center text-base leading-relaxed">
              This means you won&apos;t have to manually approve every small action in the game!
            </p>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 pt-4">
            <Button
              size="lg"
              variant="primary"
              className="w-full"
              onClick={handleDelegate}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "🔗 Delegate Wallet to Game"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
