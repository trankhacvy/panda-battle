"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Swords, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/home",
    icon: "/images/home-icon.png",
  },
  {
    id: "battle",
    label: "Battle",
    path: "/battle",
    icon: "/images/battle-icon.png",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    path: "/leaderboard",
    icon: "/images/leaderboard-icon.png",
  },
  // {
  //   id: "profile",
  //   label: "Profile",
  //   path: "/profile",
  //   icon: <User className="size-15" />,
  //   variant: "3d-purple",
  // },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { play, SOUNDS } = useSound();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleNavClick = (path: string) => {
    play(SOUNDS.BUTTON_CLICK);
    router.push(path);
  };

  if (pathname === "/") {
    return null;
  }

  return (
    <nav
      className="h-20 flex items-center justify-center border-t-2 border-[#030911] bg-[#030911]"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const active = isActive(item.path);

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.path)}
            className={cn(
              "transition-all duration-200 flex flex-col items-center justify-center w-full h-full flex-1",
              active && "bg-[#1a3a5c]"
            )}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <img
              src={item.icon}
              width={32}
              height={32}
              alt={item.label}
              className="object-cover"
            />
            <span
              className={cn(
                "transition-colors duration-200 text-sm font-bold",
                active ? "text-white" : "text-white/90"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
