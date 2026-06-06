import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { siteConfig } from "@/config/site";

export async function createClient() {
  if (!siteConfig.supabaseUrl || !siteConfig.supabaseKey) {
    throw new Error("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  const cookieStore = await cookies();

  return createServerClient(siteConfig.supabaseUrl, siteConfig.supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies. Proxy refresh handles that path.
        }
      }
    }
  });
}

