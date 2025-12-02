import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppBackground } from "@/components/background/app-background";
import { AppProviders } from "@/components/providers/app-provider";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bamboo Panda Battles",
  description: "Strategic turn-based panda battles on the blockchain",
};

// Preload critical images
const preloadImages = [
  <link key="app-bg" rel="preload" as="image" href="/images/app-bg.png" />,
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overscroll-none">
      <head>{preloadImages}</head>
      <body
        className={`flex h-full min-h-screen w-full max-w-(--max-layout-width) mx-auto flex-col ${rubik.variable}  antialiased`}
      >
        <AppProviders>
          <AppBackground />
          <main
            className="h-full min-h-0 grow overflow-auto overscroll-contain"
            style={{
              backgroundImage: "url(/images/game-bg.png)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {children}
          </main>
          <Toaster className="z-100" position="top-center" />
        </AppProviders>
      </body>
    </html>
  );
}
