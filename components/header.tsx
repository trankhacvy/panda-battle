"use client";

import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button3D } from "./ui/button-3d";
import Link from "next/link";
import { CircleUserRound, Menu } from "lucide-react";
import { Typography } from "./ui/typography";

export default function Header() {
  const pathname = usePathname();

  const getHeaderText = () => {
    switch (pathname) {
      case "/":
        return "Bamboo Panda Battles";
      case "/home":
        return "Home";
      case "/battle":
        return "Battle";
      case "/leaderboard":
        return "Leaderboard";
      case "/profile":
        return "Profile";
      default:
        return "Bamboo Panda Battles";
    }
  };

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-2 w-full bg-background">
      <Button3D
        variant="3d-green"
        size="3d-sm"
        className="size-10 overflow-hidden"
        asChild
      >
        <Link href="/">
          <CircleUserRound />
        </Link>
      </Button3D>
      <Typography variant="h2" weight="bold" align="center">
        {getHeaderText()}
      </Typography>
      <Button3D variant="3d-green" size="3d-sm" className="size-10">
        <Menu />
      </Button3D>
    </div>
  );
}
