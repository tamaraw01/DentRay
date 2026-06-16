"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { signUpWithEmail } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type SignUpFormProps = {
  onSwitchToSignIn: () => void;
};

const inputClass =
  "mt-2 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-clinical-400 focus:bg-white focus:ring-4 focus:ring-clinical-100";

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const result = await signUpWithEmail(email, password, fullName);
      if (result.needsEmailConfirmation) {
        setMessage("Tautan verifikasi telah dikirim ke email Anda.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Daftar gagal. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!isSupabaseConfigured() && <p className="rounded-[1.1rem] bg-amber-50 p-3 text-sm text-amber-900">Supabase belum diisi.</p>}
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Nama</span>
        <input className={inputClass} onChange={(event) => setFullName(event.target.value)} placeholder="Nama Anda" required value={fullName} />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Email</span>
        <input className={inputClass} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required type="email" value={email} />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Password</span>
        <input className={inputClass} minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" required type="password" value={password} />
      </label>
      {error && <p className="rounded-[1.1rem] bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-[1.1rem] bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <Button className="min-h-[3.2rem] w-full rounded-[1.4rem]" disabled={isSubmitting || !isSupabaseConfigured()} type="submit">
        {isSubmitting ? "Mendaftar..." : "Daftar"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <button className="font-extrabold text-clinical-700" onClick={onSwitchToSignIn} type="button">
          Masuk
        </button>
      </p>
    </form>
  );
}
