import { ReactNode } from "react";

interface GameLayoutProps {
  children: ReactNode;
}

/**
 * GameLayout - Mobile-first responsive container
 *
 * This component provides:
 * - Mobile-first design (320px+)
 * - Centered layout on desktop with max-width constraint (448px)
 * - Proper spacing and padding
 * - Styled empty space for desktop views with decorative elements
 * - Shadow and border effects on desktop for better visual separation
 */
export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Desktop empty space styling with decorative elements */}
      <div className="fixed inset-0 -z-10 hidden lg:block">
        {/* Gradient overlays for visual interest */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent dark:from-emerald-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent dark:from-amber-900/10" />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main container - centered on desktop with shadow */}
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col lg:shadow-2xl lg:border-x lg:border-border/50 relative">
        {/* Subtle inner glow on desktop */}
        <div className="absolute inset-0 -z-10 hidden lg:block bg-background/95 backdrop-blur-sm" />

        {/* Game viewport wrapper */}
        <GameViewport>{children}</GameViewport>
      </div>
    </div>
  );
}

interface GameViewportProps {
  children: ReactNode;
}

/**
 * GameViewport - Constrains content to mobile dimensions
 *
 * Provides:
 * - Mobile-optimized dimensions (320px+ support)
 * - Proper padding and spacing
 * - Safe area handling for mobile devices
 * - Touch-friendly spacing
 */
export function GameViewport({ children }: GameViewportProps) {
  return (
    <main className="flex flex-1 flex-col">
      {/* Content wrapper with responsive padding - smaller on mobile */}
      <div className="flex flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6">
        {children}
      </div>
    </main>
  );
}
