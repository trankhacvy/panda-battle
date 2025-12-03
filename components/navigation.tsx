"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Swords, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";
import { CardFrame } from "./ui/card-frame";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/home",
    icon: "/images/home-icon.png",
    color: "bg-[#00D9FF]",
  },
  {
    id: "battle",
    label: "Battle",
    path: "/battle",
    icon: "/images/battle-icon.png",
    color: "bg-[#FF6B9D]",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    path: "/leaderboard",
    icon: "/images/leaderboard-icon.png",
    color: "bg-[#FFD700]",
  },
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
      className=" flex items-center justify-center gap-3 p-3  border-t-4"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const active = isActive(item.path);

        return (
          <CardFrame
            key={item.id}
            size="sm"
            className="flex-1 max-w-[120px] cursor-pointer"
            onClick={() => handleNavClick(item.path)}
          >
            <div
              className={cn(
                "relative rounded-[0.875rem] overflow-hidden transition-all duration-200 flex flex-col items-center justify-center py-3 px-2",
                item.color,
                active && "scale-95"
              )}
            >
              <img
                src={item.icon}
                width={36}
                height={36}
                alt={item.label}
                className="object-cover mb-1"
              />
              <span className="text-white text-xs font-black tracking-wide uppercase">
                {item.label}
              </span>
            </div>
          </CardFrame>
        );
      })}
    </nav>
  );
}
