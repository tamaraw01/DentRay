import type { Metadata, Viewport } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { AppChrome } from "@/components/shared/AppChrome";
import { brandConfig } from "@/config/brand";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"]
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: brandConfig.appName,
    template: `%s | ${brandConfig.appName}`
  },
  description: "Skrining awal indikasi karies dari foto gigi.",
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
    apple: brandConfig.iconPath,
    icon: brandConfig.iconPath,
    shortcut: brandConfig.iconPath
  }
};

export const viewport: Viewport = {
  themeColor: "#f7faff",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${plusJakarta.variable} ${manrope.variable}`} lang="id">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
