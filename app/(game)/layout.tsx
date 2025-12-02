import "@/styles/globals.css";
import { Navigation } from "@/components/navigation";
import Header from "@/components/header";
import { BackgroundMusicPlayer } from "@/components/background-music-player";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full w-full flex flex-col">
      <BackgroundMusicPlayer />
      <Header />
      <main className="h-full max-h-[calc(100dvh-80px-64px)] min-h-0 flex-1 grow overflow-auto overscroll-contain">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
