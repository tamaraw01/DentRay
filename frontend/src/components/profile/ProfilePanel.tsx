"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { signOut } from "@/lib/auth";
import { listScanSessions } from "@/lib/scan-storage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function ProfilePanel() {
  const user = useDentRayUser();
  const router = useRouter();
  const [scanCount, setScanCount] = useState(0);
  const { isStandalone, showPrompt } = useInstallPrompt();

  useEffect(() => {
    void listScanSessions(user).then((sessions) => setScanCount(sessions.length)).catch(() => setScanCount(0));
  }, [user]);

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-[1.9rem]">
        <div className="flex items-start justify-between gap-4">
          <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Akun Saya</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">Profil Pengguna</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Informasi akun DentRay Anda.</p>
          <p className="mt-4 text-sm font-bold text-slate-800">{user.fullName || "Pengguna DentRay"}</p>
          <p className="text-sm leading-6 text-slate-600">{user.email}</p>
          </div>
          <BrandLogo size="sm" />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm font-bold text-slate-500">Total Skrining</p>
          <p className="mt-2 text-4xl font-bold tracking-[-0.04em] text-clinical-700">{scanCount}</p>
        </Card>
        <Card>
          <p className="text-lg font-extrabold text-slate-950">Catatan Medis</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">DentRay hanya untuk skrining visual awal, bukan diagnosis.</p>
        </Card>
      </div>
      <Card>
        <p className="text-lg font-extrabold text-slate-950">Pasang Aplikasi</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isStandalone ? "DentRay sudah terpasang di perangkat Anda." : "Pasang DentRay ke layar utama untuk akses lebih cepat."}
        </p>
        <Button
          className="mt-4"
          disabled={isStandalone}
          onClick={showPrompt}
          type="button"
          variant={isStandalone ? "secondary" : "primary"}
        >
          {isStandalone ? "Sudah Terpasang" : "Pasang ke Layar Utama"}
        </Button>
      </Card>
      <Button onClick={handleLogout} type="button" variant="secondary">
        Keluar dari Akun
      </Button>
    </div>
  );
}
