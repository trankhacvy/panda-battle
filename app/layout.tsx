import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GameLayout } from "@/components/game-layout";
import { ToastProvider } from "@/lib/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { SolanaProvider } from "@/components/providers/solana-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProvider>
          <ToastProvider>
            <GameLayout>{children}</GameLayout>
            <Toaster />
          </ToastProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
