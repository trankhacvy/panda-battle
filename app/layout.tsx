import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppBackground } from "@/components/background/app-background";
import { GameBackground } from "@/components/background/game-background";
import { AppProviders } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";
import { InstallAppDrawer } from "@/components/global/install-app-drawer";
import { NotificationPermissionDrawer } from "@/components/global/notification-permission-drawer";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bamboo Panda Battles",
  description: "Strategic turn-based panda battles on the blockchain",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex items-center justify-center h-dvh w-full flex-col antialiased",
          rubik.variable
        )}
      >
        <AppBackground />
        <AppProviders>
          <main className="relative w-full h-full max-w-(--max-layout-width) flex-1 overflow-hidden">
            <GameBackground />
            {children}
          </main>
          <InstallAppDrawer />
          <NotificationPermissionDrawer />
          <Toaster className="z-100" position="top-center" />
        </AppProviders>
      </body>
    </html>
  );
}
