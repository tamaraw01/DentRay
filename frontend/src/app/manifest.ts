import type { MetadataRoute } from "next";

import { brandConfig } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brandConfig.appName,
    short_name: brandConfig.appName,
    description: "Skrining awal indikasi karies dari foto gigi.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faff",
    theme_color: "#f7faff",
    icons: [
      {
        src: brandConfig.iconPath,
        sizes: "any",
        type: "image/png",
        purpose: "any"
      },
      {
        src: brandConfig.iconPath,
        sizes: "any",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
