"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { sendPasswordReset, signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MascotCard } from "@/components/mascot/MascotCard";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AuthMode = "login" | "signup" | "forgot";

type AuthCardProps = {
  mode: AuthMode;
};

const content = {
  login: {
    title: "Masuk",
    subtitle: "Lanjutkan skrining awal.",
    button: "Masuk",
    footer: "Belum punya akun?",
    footerLink: "/signup",
    footerLabel: "Daftar"
  },
  signup: {
    title: "Daftar",
    subtitle: "Simpan riwayat skrining.",
    button: "Daftar",
    footer: "Sudah punya akun?",
    footerLink: "/login",
    footerLabel: "Masuk"
  },
  forgot: {
    title: "Reset password",
    subtitle: "Masukkan email Anda.",
    button: "Kirim tautan",
    footer: "Ingat password?",
    footerLink: "/login",
    footerLabel: "Masuk"
  }
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const active = content[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        router.push("/app");
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const result = await signUpWithEmail(email, password, fullName);
        if (result.needsEmailConfirmation) {
          setMessage("Periksa email Anda untuk verifikasi.");
          return;
        }
        router.push("/app");
        router.refresh();
        return;
      }

      await sendPasswordReset(email);
      setMessage("Tautan reset password sudah dikirim jika email terdaftar.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto grid w-full max-w-4xl gap-6 rounded-[2rem] p-4 md:grid-cols-[0.9fr_1.1fr] md:p-5">
      <div className="relative min-h-72 overflow-hidden rounded-[1.7rem] border border-slate-200 bg-gradient-to-br from-white via-clinical-50 to-blue-50 p-5">
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <BrandLogo showText size="sm" />
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">{active.title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{active.subtitle}</p>
          </div>
          <MascotCard className="mt-5 min-h-[180px]" variant="compact" />
        </div>
      </div>

      <div>
        {!isSupabaseConfigured() && (
          <p className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            Supabase belum diisi.
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Nama</span>
              <input
                className="mt-2 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-clinical-400 focus:bg-white focus:ring-4 focus:ring-clinical-100"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nama Anda"
                required
                value={fullName}
              />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              className="mt-2 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-clinical-400 focus:bg-white focus:ring-4 focus:ring-clinical-100"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              required
              type="email"
              value={email}
            />
          </label>
          {mode !== "forgot" && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                className="mt-2 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-clinical-400 focus:bg-white focus:ring-4 focus:ring-clinical-100"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                required
                type="password"
                value={password}
              />
            </label>
          )}
          {mode === "login" && (
            <Link className="block text-sm font-semibold text-clinical-700" href="/forgot-password">
              Lupa password?
            </Link>
          )}
          {error && <p className="rounded-[1rem] bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-[1rem] bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          <Button className="w-full" disabled={isSubmitting || !isSupabaseConfigured()} type="submit">
            {isSubmitting ? "Memproses..." : active.button}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {active.footer}{" "}
          <Link className="font-bold text-clinical-700" href={active.footerLink}>
            {active.footerLabel}
          </Link>
        </p>
      </div>
    </Card>
  );
}
