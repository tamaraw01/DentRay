import type { MetadataRoute } from "next";

import { brandConfig } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brandConfig.appName,
    short_name: brandConfig.appName,
    description: "Skrining visual gigi berbasis AI, cukup dari satu foto.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#FFFFFF",
    theme_color: "#2563EB",
    icons: [
      {
        src: brandConfig.icon192Path,
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: brandConfig.icon512Path,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
