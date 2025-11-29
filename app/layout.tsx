import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { SolanaProvider } from "@/components/providers/solana-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppBackground } from "@/components/background/app-background";
import { Navigation } from "@/components/navigation";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    <html
      lang="en"
      suppressHydrationWarning
      className="flex h-full flex-col items-center overscroll-none"
    >
      <body
        className={`flex h-full min-h-0 w-full max-w-(--max-layout-width) flex-col ${geistSans.variable} ${geistMono.variable}  antialiased`}
      >
        <SolanaProvider>
          <AppBackground />
          <Header />
          <main className="h-full min-h-0 grow overflow-auto overscroll-contain bg-background">
            {children}
          </main>
          <Navigation />
          <Toaster className="z-100" position="top-center" />
        </SolanaProvider>
      </body>
    </html>
  );
}
