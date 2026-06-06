"use client";

import { cn } from "@/lib/utils";

type AuthSegmentedSwitchProps = {
  mode: "signin" | "signup" | null;
  onSelectSignin: () => void;
  onSelectSignup: () => void;
};

const optionClass =
  "relative z-10 flex h-full flex-1 items-center justify-center text-sm font-bold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-clinical-300";

export function AuthSegmentedSwitch({ mode, onSelectSignin, onSelectSignup }: AuthSegmentedSwitchProps) {
  const isSignin = mode === "signin";
  const isSignup = mode === "signup";

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
      <div className="relative mx-auto grid h-[76px] max-w-[488px] grid-cols-2 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/68 shadow-[0_18px_45px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl">
        <div
          className={cn(
            "absolute inset-y-0 w-1/2 bg-white shadow-[0_12px_28px_rgba(37,99,235,0.10)] transition duration-300 ease-out ring-1 ring-slate-200/80",
            isSignup ? "translate-x-full rounded-l-[1.8rem] rounded-r-[2rem]" : "translate-x-0 rounded-l-[2rem] rounded-r-[1.8rem]",
            !mode && "opacity-100"
          )}
        />
        <button
          aria-pressed={isSignin}
          className={cn(optionClass, isSignin || !mode ? "text-slate-950" : "text-slate-500 hover:text-slate-950")}
          onClick={onSelectSignin}
          type="button"
        >
          Masuk
        </button>
        <button
          aria-pressed={isSignup}
          className={cn(optionClass, isSignup ? "text-slate-950" : "text-slate-500 hover:text-slate-950")}
          onClick={onSelectSignup}
          type="button"
        >
          Daftar
        </button>
      </div>
    </div>
  );
}
