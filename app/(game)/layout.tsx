import "@/styles/globals.css";
import { Navigation } from "@/components/navigation";
import Header from "@/components/header";
import { SoundInitializer } from "@/components/sound-initializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-dvh w-full flex flex-col">
      <Header />
      <main className="h-full max-h-[calc(100dvh-160px)] min-h-0 flex-1 grow overflow-auto overscroll-contain">
        {children}
      </main>
      <Navigation />
      <SoundInitializer />
    </div>
  );
}
