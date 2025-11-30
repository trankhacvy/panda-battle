import type { Metadata } from "next";
import { Space_Grotesk, Chakra_Petch } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppBackground } from "@/components/background/app-background";
import { AppProviders } from "@/components/providers/app-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chakra-petch',
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
        className={`flex h-full min-h-0 w-full max-w-(--max-layout-width) flex-col ${rubik.variable}  antialiased`}
      >
        <AppProviders>
          <AppBackground />
          {/* <Header /> */}
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
          {/* <Navigation /> */}
          <Toaster className="z-100" position="top-center" />
        </AppProviders>
      </body>
    </html>
  );
}
