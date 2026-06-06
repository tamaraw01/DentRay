"use client";

import type { ReactNode } from "react";

import { BrandLogo } from "@/components/shared/BrandLogo";

type AuthBottomSheetProps = {
  children: ReactNode;
  isOpen: boolean;
  onBack: () => void;
  subtitle: string;
  title: string;
};

export function AuthBottomSheet({ children, isOpen, onBack, subtitle, title }: AuthBottomSheetProps) {
  return (
    <div className={`absolute inset-x-0 bottom-0 z-50 transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`mx-auto max-h-[76svh] w-full max-w-[520px] transform overflow-y-auto rounded-t-[2.25rem] border border-slate-200/80 bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_54px_rgba(15,23,42,0.12)] transition duration-300 ease-out ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-slate-200" />
        <button className="mb-5 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-bold text-clinical-700 transition hover:bg-clinical-50" onClick={onBack} type="button">
          Kembali
        </button>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-950">{title}</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p>
          </div>
          <BrandLogo size="sm" />
        </div>
        {children}
      </div>
    </div>
  );
}
