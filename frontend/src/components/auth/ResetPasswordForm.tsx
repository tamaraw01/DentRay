"use client";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { DentRayMascot } from "@/components/mascot/DentRayMascot";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updatePassword } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type RecoveryState = "checking" | "ready" | "invalid";

const inputClass =
  "mt-2 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-clinical-400 focus:bg-white focus:ring-4 focus:ring-clinical-100";

export function ResetPasswordForm() {
  const router = useRouter();
  const [recovery, setRecovery] = useState<RecoveryState>(() =>
    isSupabaseConfigured() ? "checking" : "invalid"
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();

    // Supabase fires PASSWORD_RECOVERY once the link's session is processed.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setRecovery("ready");
      }
    });

    // Fallback in case the session is already established when we mount.
    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (data.session) {
        setRecovery("ready");
        return;
      }
      // Give detectSessionInUrl a moment to process the link, then decide.
      window.setTimeout(() => {
        void supabase.auth
          .getSession()
          .then(({ data: latest }: { data: { session: Session | null } }) => {
            setRecovery((current) =>
              current === "ready" ? current : latest.session ? "ready" : "invalid"
            );
          });
      }, 1600);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setMessage("Password berhasil diperbarui. Mengalihkan...");
      window.setTimeout(() => {
        router.replace("/app");
        router.refresh();
      }, 1200);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Gagal memperbarui password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto grid w-full max-w-4xl gap-6 rounded-[2rem] p-4 md:grid-cols-[0.9fr_1.1fr] md:p-5">
      <div className="relative min-h-72 overflow-hidden rounded-[1.7rem] bg-slate-50/80 p-5">
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <BrandLogo showText size="sm" />
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">Password Baru</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Buat password baru untuk akun Anda.</p>
          </div>
          <div className="mt-5 flex items-end justify-center">
            <DentRayMascot animated priority size="lg" sizeClassName="h-40 w-28" />
          </div>
        </div>
      </div>

      <div>
        {recovery === "checking" && (
          <p className="rounded-[1rem] bg-slate-50 p-3 text-sm text-slate-600">Memeriksa tautan...</p>
        )}

        {recovery === "invalid" && (
          <div className="space-y-4">
            <p className="rounded-[1rem] bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.
            </p>
            <Link className="inline-block text-sm font-bold text-clinical-700" href="/forgot-password">
              Minta Tautan Baru
            </Link>
          </div>
        )}

        {recovery === "ready" && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password Baru</span>
              <input
                autoComplete="new-password"
                className={inputClass}
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                required
                type="password"
                value={password}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Ulangi Password</span>
              <input
                autoComplete="new-password"
                className={inputClass}
                minLength={6}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ketik ulang password"
                required
                type="password"
                value={confirmPassword}
              />
            </label>
            {error && <p className="rounded-[1rem] bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-[1rem] bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Ingat password?{" "}
          <Link className="font-bold text-clinical-700" href="/login">
            Masuk
          </Link>
        </p>
      </div>
    </Card>
  );
}
