import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Panda Battle",
    short_name: "Panda Battle",
    description: "Strategic turn-based panda battles on the blockchain",
    start_url: "/",
    display: "standalone",
    background_color: "#75E536",
    theme_color: "#75E536",
    orientation: "portrait",
    lang: "en-US",
    scope: "/",
    icons: [
      {
        src: "/pwa/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
