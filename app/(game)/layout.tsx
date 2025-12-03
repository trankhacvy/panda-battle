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
    <div className="size-full flex flex-col">
      <BackgroundMusicPlayer />
      <Header />
      <div className="max-h-[calc(100dvh-160px)] min-h-0 flex-1 grow overflow-auto overscroll-contain">
        {children}
      </div>
      <Navigation />
    </div>
  );
}
