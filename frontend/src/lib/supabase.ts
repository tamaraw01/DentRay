"use client";

import { createClient, getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export { createClient, getSupabaseBrowserClient, isSupabaseConfigured };

export const supabase = isSupabaseConfigured() ? createClient() : null;

export function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return supabase;
}
