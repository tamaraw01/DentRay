"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { AuthBottomSheet } from "@/components/auth/AuthBottomSheet";
import { AuthSegmentedSwitch } from "@/components/auth/AuthSegmentedSwitch";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { HeroToothModel } from "@/components/visuals/HeroToothModel";
import { getCurrentUser } from "@/lib/auth";

type AuthMode = "welcome" | "signin" | "signup";

function modeFromUrl(): AuthMode {
  if (typeof window === "undefined") {
    return "welcome";
  }

  const mode = new URLSearchParams(window.location.search).get("mode");
  if (mode === "signin" || mode === "signup") {
    return mode;
  }
  return "welcome";
}

function emitUrlModeChange() {
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function useUrlAuthMode() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("popstate", onStoreChange);
      return () => window.removeEventListener("popstate", onStoreChange);
    },
    modeFromUrl,
    () => "welcome" as AuthMode
  );
}

function sheetContent(mode: AuthMode) {
  if (mode === "signup") {
    return {
      subtitle: "Simpan riwayat skrining.",
      title: "Buat akun"
    };
  }

  return {
    subtitle: "Lanjutkan skrining.",
    title: "Masuk"
  };
}

export function AuthWelcome() {
  const router = useRouter();
  const mode = useUrlAuthMode();

  useEffect(() => {
    let isMounted = true;
    void getCurrentUser().then((user) => {
      if (isMounted && user) {
        router.replace("/app");
      }
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  function openSheet(nextMode: Exclude<AuthMode, "welcome">) {
    window.history.pushState({ authMode: nextMode }, "", `/?mode=${nextMode}`);
    emitUrlModeChange();
  }

  function closeSheet() {
    window.history.pushState({ authMode: "welcome" }, "", "/");
    emitUrlModeChange();
  }

  function switchSheet(nextMode: Exclude<AuthMode, "welcome">) {
    window.history.replaceState({ authMode: nextMode }, "", `/?mode=${nextMode}`);
    emitUrlModeChange();
  }

  const isSheetOpen = mode === "signin" || mode === "signup";
  const activeSheet = sheetContent(mode);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F7FAFF] px-3 py-3 text-slate-950 sm:px-5 sm:py-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_10%,rgba(186,230,253,0.74),transparent_18rem),radial-gradient(circle_at_8%_78%,rgba(219,234,254,0.72),transparent_19rem),linear-gradient(180deg,#F7FAFF_0%,#F4F8FF_52%,#FFFFFF_100%)]" />

      <div className="relative mx-auto h-[calc(100svh-1.5rem)] max-h-[880px] min-h-[680px] max-w-[520px] overflow-hidden rounded-[2.4rem] border border-slate-200/70 bg-white/72 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:h-[calc(100svh-2.5rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.32)_45%,rgba(255,255,255,0.82)_100%)]" />
        <div className="pointer-events-none absolute right-[-2%] top-[7%] z-[1] h-[38%] w-[42%] rounded-[54%_46%_42%_44%] bg-[linear-gradient(145deg,rgba(186,230,253,0.24),rgba(219,234,254,0.34)_48%,rgba(255,255,255,0.05))] blur-xl" />
        <div className="pointer-events-none absolute right-[3%] top-[34%] z-[1] h-[22%] w-[13%] rounded-[45%] bg-[linear-gradient(180deg,rgba(219,234,254,0.28),rgba(255,255,255,0.03))] blur-lg" />
        <div className="pointer-events-none absolute right-[19%] top-[34%] z-[1] h-[20%] w-[12%] rounded-[45%] bg-[linear-gradient(180deg,rgba(219,234,254,0.22),rgba(255,255,255,0.03))] blur-lg" />
        <HeroToothModel className="z-[2] left-auto right-[-23%] top-[4%] h-[63%] w-[92%] opacity-100 sm:right-[-20%] sm:top-[4%]" position={[0, -0.05, 0]} rotation={[0.06, -0.32, 0.03]} scale={1.92} />

        <div className="relative z-10 flex h-full flex-col px-6 pb-6 pt-7">
          <header className="flex items-center justify-between">
            <BrandLogo showText size="md" />
          </header>

          <div className="flex flex-1 flex-col justify-end pb-28">
            <div className={`max-w-[17rem] transition duration-300 ${isSheetOpen ? "-translate-y-6 opacity-55" : "translate-y-0 opacity-100"}`}>
              <p className="text-sm font-semibold tracking-[0.12em] text-clinical-700/70">ꦫꦶꦏ꧀ꦱ</p>
              <h1 className="mt-3 text-[3.05rem] font-bold leading-[1] tracking-[-0.055em] text-slate-950">
                Riksa awal, dari satu citra.
              </h1>
              <p className="mt-4 text-base font-medium leading-7 text-slate-600">Temukan indikasi visual lebih dini.</p>
              <p className="mt-3 text-sm font-semibold text-slate-500">Bukan pengganti pemeriksaan dokter.</p>
            </div>
          </div>
        </div>

        {!isSheetOpen && (
          <AuthSegmentedSwitch
            mode={null}
            onSelectSignin={() => openSheet("signin")}
            onSelectSignup={() => openSheet("signup")}
          />
        )}

        <AuthBottomSheet isOpen={isSheetOpen} onBack={closeSheet} subtitle={activeSheet.subtitle} title={activeSheet.title}>
          {mode === "signup" ? (
            <SignUpForm onSwitchToSignIn={() => switchSheet("signin")} />
          ) : (
            <SignInForm onSwitchToSignUp={() => switchSheet("signup")} />
          )}
        </AuthBottomSheet>
      </div>
    </section>
  );
}
