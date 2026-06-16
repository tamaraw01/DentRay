"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { signInWithEmail } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type SignInFormProps = {
  onSwitchToSignUp: () => void;
};

const inputClass =
  "mt-2 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-clinical-400 focus:bg-white focus:ring-4 focus:ring-clinical-100";

export function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password);
      router.push("/app");
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Masuk gagal. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!isSupabaseConfigured() && <p className="rounded-[1.1rem] bg-amber-50 p-3 text-sm text-amber-900">Supabase belum diisi.</p>}
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Email</span>
        <input className={inputClass} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required type="email" value={email} />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Password</span>
        <input className={inputClass} minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" required type="password" value={password} />
      </label>
      <Link className="inline-block text-sm font-bold text-clinical-700" href="/forgot-password">
        Lupa password?
      </Link>
      {error && <p className="rounded-[1.1rem] bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button className="min-h-[3.2rem] w-full rounded-[1.4rem]" disabled={isSubmitting || !isSupabaseConfigured()} type="submit">
        {isSubmitting ? "Masuk..." : "Masuk"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <button className="font-extrabold text-clinical-700" onClick={onSwitchToSignUp} type="button">
          Daftar
        </button>
      </p>
    </form>
  );
}
