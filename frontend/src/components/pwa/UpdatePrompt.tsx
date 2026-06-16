"use client";

import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAppUpdate } from "@/hooks/useAppUpdate";

export function UpdatePrompt() {
  const pathname = usePathname();
  const { dismissUpdate, isUpdateAvailable, reloadWithUpdate } = useAppUpdate();

  if (!isUpdateAvailable) {
    return null;
  }

  const needsRaisedPosition = pathname === "/" || pathname.startsWith("/app");

  return (
    <aside
      aria-label="Pembaruan DentRay tersedia"
      aria-live="polite"
      className={`fixed inset-x-3 z-[60] mx-auto max-w-md rounded-[1.7rem] border border-white/80 bg-white/94 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl ${
        needsRaisedPosition ? "bottom-24 lg:bottom-6" : "bottom-4"
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <BrandLogo className="shrink-0" size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-950">Versi Baru Tersedia</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Versi terbaru tersedia.</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={() => void reloadWithUpdate()} type="button">
          Perbarui Sekarang
        </Button>
        <Button className="flex-1" onClick={dismissUpdate} type="button" variant="secondary">
          Nanti
        </Button>
      </div>
    </aside>
  );
}
