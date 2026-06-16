import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { AppChrome } from "@/components/shared/AppChrome";
import { SplashScreen } from "@/components/shared/SplashScreen";
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
  description: "Skrining awal area visual dari foto gigi.",
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
        <div aria-hidden="true" className="dentray-splash" id="dentray-splash">
          <div className="dentray-splash__card-wrapper">
            <div className="dentray-splash__card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="dentray-splash__icon"
                height={88}
                src="/brand/dentray-icon-512.png"
                width={88}
              />
              <div className="dentray-splash__scan" />
            </div>
          </div>
          <p className="dentray-splash__wordmark">DentRay</p>
          <div aria-hidden="true" className="dentray-splash__dots">
            <span />
            <span />
            <span />
          </div>
        </div>
        <AppChrome>{children}</AppChrome>
        <SplashScreen />
      </body>
    </html>
  );
}
