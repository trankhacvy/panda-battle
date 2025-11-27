"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Hammer,
  Swords,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/forge", label: "Forge", icon: Hammer },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/hub", label: "Hub", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 border-t border-border",
          "bg-background/95 backdrop-blur-sm",
          "md:hidden",
          "app-bottom-nav"
        )}
      >
        <div className="flex items-center justify-around h-16 safe-area-inset-bottom">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full",
                  "tap-scale transition-colors duration-200",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={label}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-0.5">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Rail */}
      <nav
        className={cn(
          "hidden md:flex flex-col items-center justify-start",
          "fixed left-0 top-0 bottom-0 w-20",
          "border-r border-border",
          "bg-background/95 backdrop-blur-sm",
          "pt-8 gap-4 lg:gap-6"
        )}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-center w-12 h-12",
                "rounded-lg spring-scale transition-all duration-200",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              title={label}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
