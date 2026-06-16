"use client";

import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallPrompt() {
  const pathname = usePathname();
  const { isUpdateAvailable } = useAppUpdate();
  const {
    canAutoInstall,
    dismissPrompt,
    installApp,
    isIOSSafari,
    isVisible
  } = useInstallPrompt();

  if (!isVisible || isUpdateAvailable) {
    return null;
  }

  const isAppRoute = pathname.startsWith("/app");
  const needsRaisedPosition = isAppRoute || pathname === "/";
  const usesManualInstructions = isIOSSafari || !canAutoInstall;
  const title = isIOSSafari ? "Tambahkan ke Layar Utama" : "Pasang DentRay";
  let subtitle = "Buka menu browser, lalu pilih 'Tambahkan ke layar utama'.";

  if (isIOSSafari) {
    subtitle = "Ketuk ikon Bagikan di Safari, lalu pilih 'Tambahkan ke Layar Utama'.";
  } else if (canAutoInstall) {
    subtitle = "Akses DentRay lebih cepat langsung dari layar utama perangkat.";
  }

  return (
    <aside
      aria-label="Pasang aplikasi DentRay"
      aria-live="polite"
      role="status"
      className={`fixed inset-x-3 z-50 mx-auto max-w-md rounded-[1.7rem] border border-white/80 bg-white/92 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl ${
        needsRaisedPosition ? "bottom-24 lg:bottom-6" : "bottom-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <BrandLogo className="shrink-0" size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {usesManualInstructions ? (
          <Button className="w-full" onClick={dismissPrompt} type="button">
            Saya mengerti
          </Button>
        ) : (
          <>
            <Button className="flex-1" onClick={() => void installApp()} type="button">
              Pasang
            </Button>
            <Button className="flex-1" onClick={dismissPrompt} type="button" variant="secondary">
              Nanti
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
