"use client";

import { useEmbeddedAddress } from "@/hooks/use-embedded-address";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft, EllipsisVertical } from "lucide-react";
import { Typography } from "./ui/typography";
import { SettingsDropdown } from "./settings-dropdown";
import { RoundButton } from "./ui/round-button";
import { CardFrame } from "./ui/card-frame";

export default function Header() {
  const embeddedAddress = useEmbeddedAddress();
  const pathname = usePathname();
  const router = useRouter();

  const renderLeft = () => {
    switch (true) {
      case pathname?.includes("profile"):
        return (
          <RoundButton
            variant="blue"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4 text-white" />
          </RoundButton>
        );
      default:
        return (
          <div className="flex items-center gap-3">
            <Link href={`/profile/${embeddedAddress}`}>
              <CardFrame size="tiny">
                <div className="size-12 overflow-hidden flex items-center justify-center relative">
                  <img
                    src="/images/reated-panda-bg"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <img
                    src="/images/sample-panda.png"
                    alt="Panda Avatar"
                    className="relative z-10 w-full h-full object-cover"
                  />
                </div>
              </CardFrame>
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
          <RoundButton variant="purple" size="sm">
            <EllipsisVertical className="size-4 text-white" />
          </RoundButton>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            {/* <div className="bg-[#1a3a5c]/80 border-2 border-[#2a5a8c] rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-linear-to-b from-[#ffd700] to-[#daa520] flex items-center justify-center">
                <span className="text-[#8b6914] font-bold text-lg">C</span>
              </div>
              <div className="text-white">
                <p className="text-xl font-bold text-[#ffd700]">500</p>
              </div>
            </div> */}
            <SettingsDropdown />
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-4 h-20 bg-cover bg-center relative z-50">
      <div className="relative z-10 flex items-center justify-between w-full">
        {renderLeft()}

        {renderMiddle()}

        {renderRight()}
      </div>
    </div>
  );
}
