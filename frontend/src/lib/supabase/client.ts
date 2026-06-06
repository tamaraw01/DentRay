"use client";

import { createBrowserClient } from "@supabase/ssr";

import { siteConfig } from "@/config/site";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

let browserClient: SupabaseBrowserClient | null = null;

export function getSupabaseConfig() {
  return {
    key: siteConfig.supabaseKey,
    url: siteConfig.supabaseUrl
  };
}

export function isSupabaseConfigured() {
  const { key, url } = getSupabaseConfig();
  return Boolean(url && key);
}

export function createClient() {
  const { key, url } = getSupabaseConfig();

  if (!url || !key) {
    throw new Error("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
}

export const getSupabaseBrowserClient = createClient;

