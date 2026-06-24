import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { AppChrome } from "@/components/shared/AppChrome";
import { brandConfig } from "@/config/brand";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"]
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  applicationName: brandConfig.appName,
  title: {
    default: brandConfig.appName,
    template: `%s | ${brandConfig.appName}`
  },
  description: "Skrining gigi cerdas, cukup dari satu foto.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brandConfig.appName
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: [{ url: brandConfig.icon192Path, sizes: "192x192", type: "image/png" }],
    icon: [
      { url: brandConfig.icon192Path, sizes: "192x192", type: "image/png" },
      { url: brandConfig.icon512Path, sizes: "512x512", type: "image/png" }
    ],
    shortcut: brandConfig.icon192Path
  }
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${plusJakarta.variable} ${inter.variable}`} lang="id">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
