"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/lib/store/sound-store";
import { Settings } from "lucide-react";

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
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const playSound = useSoundStore((state) => state.playSound);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleNavClick = (path: string) => {
    playSound("button-click");
    router.push(path);
  };

  if (pathname === "/") {
    return null;
  }

  return (
    <nav
      className="relative h-20 flex items-stretch px-2 bg-[#0a1628]/95 backdrop-blur-lg border-t border-white/10"
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
              "relative transition-all duration-300 flex flex-col items-center justify-center flex-1",
              "hover:bg-white/5 active:scale-95"
            )}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            {/* Active indicator line */}
            {active && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-cyan-400 rounded-b-full" />
            )}

            {/* Icon container */}
            <div className={cn(
              "mb-1 transition-all duration-300",
              active ? "-translate-y-1" : "translate-y-0"
            )}>
              <img
                src={item.icon}
                width={40}
                height={40}
                alt={item.label}
                className={cn(
                  "object-cover transition-all duration-300",
                  active ? "brightness-125 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "brightness-75 opacity-70"
                )}
              />
            </div>
            
            {/* Label */}
            <span
              className={cn(
                "transition-all duration-300 text-xs font-bold tracking-wide",
                active 
                  ? "text-cyan-400" 
                  : "text-white/50"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Settings Button */}
      <button
        onClick={() => handleNavClick("/settings")}
        className={cn(
          "relative transition-all duration-300 flex flex-col items-center justify-center flex-1",
          "hover:bg-white/5 active:scale-95"
        )}
        aria-label="Settings"
        aria-current={isActive("/settings") ? "page" : undefined}
      >
        {/* Active indicator line */}
        {isActive("/settings") && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-cyan-400 rounded-b-full" />
        )}

        <div className={cn(
          "mb-1 transition-all duration-300",
          isActive("/settings") ? "-translate-y-1" : "translate-y-0"
        )}>
          <Settings className={cn(
            "w-10 h-10 transition-all duration-300",
            isActive("/settings")
              ? "text-cyan-400 brightness-125 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" 
              : "text-white/50 brightness-75"
          )} />
        </div>
        <span
          className={cn(
            "transition-all duration-300 text-xs font-bold tracking-wide",
            isActive("/settings")
              ? "text-cyan-400" 
              : "text-white/50"
          )}
        >
          Settings
        </span>
      </button>
    </nav>
  );
}
