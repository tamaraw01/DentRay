"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { DentRayUser } from "@/types/user";

type SignUpResult = {
  needsEmailConfirmation: boolean;
};

function requireSupabaseClient() {
  return createClient();
}

function normalizeAuthError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email atau password salah.";
  }

  if (lower.includes("email not confirmed")) {
    return "Periksa email Anda untuk verifikasi.";
  }

  if (lower.includes("password should be at least")) {
    return "Password minimal 6 karakter.";
  }

  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "Email sudah terdaftar.";
  }

  return message;
}

export async function getCurrentUser(): Promise<DentRayUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = requireSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined
  };
}

export async function signInWithEmail(email: string, password: string) {
  const client = requireSupabaseClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(normalizeAuthError(error.message));
  }
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<SignUpResult> {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  if (error) {
    throw new Error(normalizeAuthError(error.message));
  }

  return {
    needsEmailConfirmation: !data.session
  };
}

export async function sendPasswordReset(email: string) {
  const client = requireSupabaseClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/?mode=signin`
  });
  if (error) {
    throw new Error(normalizeAuthError(error.message));
  }
}

export async function signOut() {
  const client = requireSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(normalizeAuthError(error.message));
  }
}
