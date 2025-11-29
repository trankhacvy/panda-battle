"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button3D } from "@/components/ui/button-3d";
import { Home, Swords, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  variant:
    | "3d-green"
    | "3d-blue"
    | "3d-red"
    | "3d-purple"
    | "3d-orange"
    | "3d-yellow";
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/home",
    icon: <Home className="size-15" />,
    variant: "3d-blue",
  },
  {
    id: "battle",
    label: "Battle",
    path: "/battle",
    icon: <Swords className="size-15" />,
    variant: "3d-red",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    path: "/leaderboard",
    icon: <Trophy className="size-15" />,
    variant: "3d-orange",
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

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <nav
      className="flex items-center justify-center gap-4 px-4 pb-3 pt-2"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const active = isActive(item.path);

        return (
          <Button3D
            key={item.id}
            variant={item.variant}
            size="3d-sm"
            onClick={() => router.push(item.path)}
            className={cn(
              "transition-all duration-200 size-14 rounded-lg flex-1",
              active && "scale-105"
            )}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={cn(
                "transition-colors duration-200",
                active ? "text-white" : "text-white/90"
              )}
            >
              {item.icon}
            </span>
          </Button3D>
        );
      })}
    </nav>
  );
}
