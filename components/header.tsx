"use client";

import { useEmbeddedAddress } from "@/hooks/use-embedded-address";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button3D } from "./ui/button-3d";
import { ArrowLeft, EllipsisVertical } from "lucide-react";
import { Typography } from "./ui/typography";

export default function Header() {
  const embeddedAddress = useEmbeddedAddress();
  const pathname = usePathname();
  const router = useRouter();

  const renderLeft = () => {
    switch (true) {
      case pathname?.includes("profile"):
        return (
          <Button3D
            variant="header-action"
            size="3d-tiny"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
          </Button3D>
        );
      default:
        return (
          <div className="flex items-center gap-3">
            <Link href={`/profile/${embeddedAddress}`}>
              <div className="size-12 rounded-full border-4 border-[#4a9eff] bg-linear-to-b from-[#87ceeb] to-[#4a9eff] overflow-hidden flex items-center justify-center">
                <img
                  src="/images/sample-panda.png"
                  alt="Panda Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <div className="text-white">
              <p className="text-sm font-medium opacity-90">Points:</p>
              <p className="text-xl font-bold text-[#ffd700]">1,250</p>
            </div>
          </div>
        );
    }
  };

  const renderMiddle = () => {
    switch (true) {
      case pathname?.includes("profile"):
        return (
          <div className="flex-1 flex items-center justify-center">
            <Typography variant="page-title" className="text-[#A855F7]">
              Profile
            </Typography>
          </div>
        );
      default:
        return <div className="flex-1" />;
    }
  };

  const renderRight = () => {
    switch (true) {
      case pathname?.includes("profile"):
        return (
          <Button3D variant="header-action" size="3d-tiny">
            <EllipsisVertical className="size-4" />
          </Button3D>
        );
      default:
        return (
          <div className="bg-[#1a3a5c]/80 border-2 border-[#2a5a8c] rounded-xl px-4 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-b from-[#ffd700] to-[#daa520] flex items-center justify-center">
              <span className="text-[#8b6914] font-bold text-lg">C</span>
            </div>
            <div className="text-white">
              <p className="text-xl font-bold text-[#ffd700]">500</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-4 h-20">
      {/* Left */}
      {renderLeft()}

      {/* Middle */}
      {renderMiddle()}

      {/* Right */}
      {renderRight()}
    </div>
  );
}
