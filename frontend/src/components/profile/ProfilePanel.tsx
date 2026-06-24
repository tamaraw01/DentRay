"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Glyph } from "@/components/ui/Glyph";
import { IconBadge, type BadgeTone } from "@/components/ui/IconBadge";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { signOut } from "@/lib/auth";
import { listScanSessions } from "@/lib/scan-storage";

export function ProfilePanel() {
  const user = useDentRayUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<{ total_images?: number }[]>([]);
  const { isStandalone, showPrompt } = useInstallPrompt();

  useEffect(() => {
    void listScanSessions(user)
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [user]);

  const displayName = user.fullName || "Pengguna DentRay";
  const initial = displayName.charAt(0).toUpperCase();

  const stats = useMemo(() => {
    const totalImages = sessions.reduce((sum, session) => sum + (session.total_images ?? 0), 0);
    return [
      { icon: "scan", tone: "blue" as BadgeTone, label: "Total Skrining", value: String(sessions.length) },
      { icon: "photo", tone: "green" as BadgeTone, label: "Foto Dianalisis", value: String(totalImages) }
    ] as const;
  }, [sessions]);

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-[1.7rem]">Profil</h1>
        <p className="mt-1 text-sm text-slate-500">Akun dan aktivitas Anda.</p>
      </header>

      {/* Identity card */}
      <div className="glass-card flex items-center gap-4 rounded-[1.75rem] p-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-clinical-500 to-clinical-700 text-2xl font-bold text-white shadow-[0_8px_20px_rgba(11,124,255,0.25)]">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">{displayName}</p>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div className="glass-card rounded-[1.5rem] p-4 sm:p-5" key={stat.label}>
            <IconBadge tone={stat.tone}>
              <Glyph name={stat.icon} />
            </IconBadge>
            <p className="mt-3.5 text-xs text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Install — only shown while the app is not yet installed */}
      {!isStandalone && (
        <div className="glass-card flex items-center gap-4 rounded-[1.75rem] p-5">
          <IconBadge tone="violet">
            <Glyph name="spark" />
          </IconBadge>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">Pasang Aplikasi</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Akses DentRay lebih cepat dari layar utama.
            </p>
          </div>
          <Button className="shrink-0" onClick={showPrompt} type="button">
            Pasang
          </Button>
        </div>
      )}

      {/* Medical note */}
      <div className="glass-card flex items-start gap-4 rounded-[1.75rem] p-5">
        <IconBadge tone="red">
          <Glyph name="shield" />
        </IconBadge>
        <div>
          <p className="text-sm font-bold text-slate-900">Catatan Medis</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            Skrining awal, bukan pengganti dokter gigi.
          </p>
        </div>
      </div>

      <Button className="w-full" onClick={handleLogout} type="button" variant="danger">
        Keluar dari Akun
      </Button>
    </div>
  );
}
