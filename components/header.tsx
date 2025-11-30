"use client";

// import Image from "next/image";
import React from "react";
// import { usePathname } from "next/navigation";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Button3D } from "./ui/button-3d";
// import Link from "next/link";
// import { CircleUserRound, Menu } from "lucide-react";
// import { Typography } from "./ui/typography";

export default function Header() {
  // const pathname = usePathname();

  // const getHeaderText = () => {
  //   switch (pathname) {
  //     case "/":
  //       return "Bamboo Panda Battles";
  //     case "/home":
  //       return "Home";
  //     case "/battle":
  //       return "Battle";
  //     case "/leaderboard":
  //       return "Leaderboard";
  //     case "/profile":
  //       return "Profile";
  //     default:
  //       return "Bamboo Panda Battles";
  //   }
  // };

  // if (pathname === "/") {
  //   return null;
  // }

  return (
    <div className="flex items-center justify-between p-4 h-20">
      {/* Avatar and Points */}
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full border-4 border-[#4a9eff] bg-gradient-to-b from-[#87ceeb] to-[#4a9eff] overflow-hidden flex items-center justify-center">
          <img
            src="/images/sample-panda.png"
            alt="Panda Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-white">
          <p className="text-sm font-medium opacity-90">Points:</p>
          <p className="text-xl font-bold text-[#ffd700]">1,250</p>
        </div>
      </div>

      {/* Gold */}
      <div className="bg-[#1a3a5c]/80 border-2 border-[#2a5a8c] rounded-xl px-4 py-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#ffd700] to-[#daa520] flex items-center justify-center">
          <span className="text-[#8b6914] font-bold text-lg">C</span>
        </div>
        <div className="text-white">
          <p className="text-xl font-bold text-[#ffd700]">500</p>
        </div>
      </div>
    </div>
  );
}
