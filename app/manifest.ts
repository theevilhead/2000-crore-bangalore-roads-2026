import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fix Bengaluru Roads",
    short_name: "BLR Roads",
    description:
      "Map the bad road stretches in Bengaluru so the relaying work reaches the roads that need it most.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#84cc16",
    orientation: "portrait-primary",
    categories: ["navigation", "utilities", "government"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
