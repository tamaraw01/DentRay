import { cn } from "@/lib/utils";

type DentRayLoadingProps = {
  className?: string;
  fullScreen?: boolean;
  message?: string;
  variant?: "page" | "auth" | "scan" | "inline";
};

const defaultMessages = {
  auth: "Menyiapkan akun",
  inline: "Sebentar…",
  page: "Menyiapkan DentRay",
  scan: "Membaca citra"
} as const;

function ToothLoader() {
  return (
    <div aria-hidden="true" className="dentray-tooth-float relative h-[4.75rem] w-[4.75rem]">
      <div className="dentray-tooth-glow absolute inset-2 rounded-full bg-clinical-200/55" />
      <svg
        className="relative z-10 h-full w-full"
        fill="none"
        viewBox="0 0 80 80"
      >
        <path
          d="M19.4 14.8C24.8 9.9 31 10.2 40 14.1c9-3.9 15.2-4.2 20.6.7 6.3 5.7 5.1 16.7 1.8 25.3-2 5.2-3.4 11.2-4.6 17.3-1.2 6.3-3.2 11.8-7.5 11.8-4 0-5-4.6-6-9.8-1.1-5.8-2.1-9.1-4.3-9.1s-3.2 3.3-4.3 9.1c-1 5.2-2 9.8-6 9.8-4.3 0-6.3-5.5-7.5-11.8-1.2-6.1-2.6-12.1-4.6-17.3-3.3-8.6-4.5-19.6 1.8-25.3Z"
          fill="rgba(255,255,255,0.96)"
          stroke="#60A5FA"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        <path
          d="M31 17.5c3.1 1.8 5.8 2.5 9 2.5s5.9-.7 9-2.5"
          stroke="#BFDBFE"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute inset-x-2 inset-y-3 z-20 overflow-hidden rounded-[1.4rem]">
        <span className="dentray-scan-line absolute left-0 top-1/2 block h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90" />
      </div>
    </div>
  );
}

export function DentRayLoading({
  className,
  fullScreen,
  message,
  variant = "page"
}: DentRayLoadingProps) {
  const isInline = variant === "inline";
  const isScan = variant === "scan";
  const shouldFillScreen = fullScreen ?? (variant === "page" || variant === "auth");

  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-center justify-center",
        shouldFillScreen
          ? "min-h-screen px-4 py-10"
          : isInline
            ? "min-h-20 py-3"
            : "min-h-48 py-5",
        className
      )}
      role="status"
    >
      <div className="text-center">
        <div
          className={cn(
            "relative mx-auto flex items-center justify-center rounded-[1.8rem] border border-clinical-100 bg-[linear-gradient(145deg,#ffffff,#eff8ff)] shadow-[0_12px_30px_rgba(37,99,235,0.08)]",
            isInline ? "h-20 w-20" : isScan ? "h-28 w-28" : "h-32 w-32"
          )}
        >
          <ToothLoader />
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
          <span className="dentray-loading-dot h-1.5 w-1.5 rounded-full bg-clinical-500" />
          <span className="dentray-loading-dot h-1.5 w-1.5 rounded-full bg-clinical-500 [animation-delay:140ms]" />
          <span className="dentray-loading-dot h-1.5 w-1.5 rounded-full bg-clinical-500 [animation-delay:280ms]" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-600">{message ?? defaultMessages[variant]}</p>
      </div>
    </div>
  );
}
