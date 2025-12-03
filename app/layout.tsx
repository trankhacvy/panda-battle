import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppBackground } from "@/components/background/app-background";
import { AppProviders } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";
import { InstallAppDrawer } from "@/components/global/install-app-drawer";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bamboo Panda Battles",
  description: "Strategic turn-based panda battles on the blockchain",
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
        <AppProviders>
          <AppBackground />
          <main
            className="w-full h-full max-w-(--max-layout-width) flex-1 overflow-hidden"
            style={{
              backgroundImage: "url(/images/game-bg.png)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {children}
          </main>
          <InstallAppDrawer />
          <Toaster className="z-100" position="top-center" />
        </AppProviders>
      </body>
    </html>
  );
}
