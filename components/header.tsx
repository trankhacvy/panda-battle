"use client";

import { useEmbeddedAddress } from "@/hooks/use-embedded-address";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft, EllipsisVertical } from "lucide-react";
import { Typography } from "./ui/typography";
import { SettingsDropdown } from "./settings-dropdown";
import { IconButton } from "./ui/icon-button";
import { Card, CardContent } from "./ui/card";

export default function Header() {
  const embeddedAddress = useEmbeddedAddress();
  const pathname = usePathname();
  const router = useRouter();

  const renderLeft = () => {
    switch (true) {
      case pathname?.includes("profile"):
        return (
          <IconButton
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4 text-white" strokeWidth={3} />
          </IconButton>
        );
      default:
        return (
          <div className="flex items-center gap-3">
            <Link href={`/profile/${embeddedAddress}`}>
              <div className="size-12 rounded-xl overflow-hidden flex items-center justify-center relative">
                <img
                  src="/images/fighter-frame.png"
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <img
                  src="/images/sample-panda.png"
                  alt="Panda Avatar"
                  className="relative z-10 w-full h-full object-cover"
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
            <Typography
              variant="page-title"
              className="text-white drop-shadow-lg"
            >
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
          <IconButton variant="secondary" size="sm">
            <EllipsisVertical className="size-4 text-white" strokeWidth={3} />
          </IconButton>
        );
      default:
        return (
          <div className="flex items-center gap-2">
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
