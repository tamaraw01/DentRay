"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { AuthBottomSheet } from "@/components/auth/AuthBottomSheet";
import { AuthSegmentedSwitch } from "@/components/auth/AuthSegmentedSwitch";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { DentRayMascot } from "@/components/mascot/DentRayMascot";
import { BrandLogo } from "@/components/shared/BrandLogo";
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
      subtitle: "Simpan setiap hasil skrining Anda.",
      title: "Buat Akun"
    };
  }

  return {
    subtitle: "Lanjutkan menjaga senyum Anda.",
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
    <section className="relative min-h-screen overflow-hidden bg-[#eef2f8] px-3 py-3 text-slate-950 sm:px-5 sm:py-5">
      <div className="relative mx-auto h-[calc(100svh-1.5rem)] max-h-[880px] min-h-[680px] max-w-[520px] overflow-hidden rounded-[2.2rem] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08),0_2px_12px_rgba(15,23,42,0.05)] sm:h-[calc(100svh-2.5rem)]">
        <div
          className={`absolute right-[-7%] top-[7%] z-[2] flex h-[44%] w-[74%] items-center justify-center rounded-[42%_0_0_42%] bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(226,241,255,0.82))] shadow-[0_18px_50px_rgba(37,99,235,0.08)] transition duration-300 sm:right-[-3%] ${
            isSheetOpen ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_130deg,#7dd3fc,#a5b4fc,#f0abfc,#fde68a,#86efac,#7dd3fc)] opacity-45 blur-2xl"
          />
          <DentRayMascot animated className="relative z-10 max-h-full max-w-full" priority size="hero" />
        </div>

        <div className="relative z-10 flex h-full flex-col px-6 pb-6 pt-7">
          <header className="flex items-center justify-between">
            <BrandLogo showText size="md" />
          </header>

          <div className="flex flex-1 flex-col justify-end pb-28">
            <div className={`max-w-[17rem] transition duration-300 ${isSheetOpen ? "-translate-y-6 opacity-55" : "translate-y-0 opacity-100"}`}>
              <h1 className="text-[3.05rem] font-bold leading-[1] tracking-[-0.055em] text-slate-950">
                Deteksi dini, senyum terjaga.
              </h1>
              <p className="mt-4 text-base font-medium leading-7 text-slate-600">Skrining visual gigi berbasis AI, cukup dari satu foto.</p>
              <p className="mt-3 text-sm font-semibold text-slate-500">Skrining awal, bukan pengganti dokter gigi.</p>
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
