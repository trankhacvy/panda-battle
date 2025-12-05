"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSound } from "@/hooks/use-sound";
import { IconButton, type IconButtonProps } from "./ui/icon-button";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  variant: IconButtonProps["variant"];
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/home",
    icon: "/images/home-icon.png",
    variant: "primary",
  },
  {
    id: "battle",
    label: "Battle",
    path: "/battle",
    icon: "/images/battle-icon.png",
    variant: "secondary",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    path: "/leaderboard",
    icon: "/images/leaderboard-icon.png",
    variant: "warning",
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

  if (pathname === "/" || pathname?.includes("/deposit") || pathname?.includes("/delegate")) {
    return null;
  }

  return (
    <nav
      className=" flex items-center justify-center gap-3 p-3  bborder-t-4"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const active = isActive(item.path);

        return (
          <IconButton
            key={item.id}
            className="size-20 cursor-pointer p-2"
            onClick={() => handleNavClick(item.path)}
            variant={item.variant}
          >
            <img
              src={item.icon}
              width={36}
              height={36}
              alt={item.label}
              className="object-cover"
            />
          </IconButton>
        );
      })}
    </nav>
  );
}
