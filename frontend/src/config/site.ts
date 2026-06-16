import { brandConfig } from "@/config/brand";

export const siteConfig = {
  name: brandConfig.appName,
  tagline: brandConfig.tagline,
  description: "Skrining visual gigi berbasis AI dari satu foto.",
  configuredApiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  aiBackendUrl: process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  navItems: [
    { href: "/", label: "Beranda" },
    { href: "/app/scan", label: "Skrining" },
    { href: "/how-it-works", label: "Cara kerja" },
    { href: "/about", label: "Tentang" },
    { href: "/disclaimer", label: "Catatan" }
  ]
};
