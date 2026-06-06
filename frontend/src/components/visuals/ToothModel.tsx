"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

type Tuple3 = [number, number, number];

export type ToothModelProps = {
  className?: string;
  floating?: boolean;
  position?: Tuple3;
  rotation?: Tuple3;
  scale?: number | Tuple3;
  variant?: "hero" | "small" | "background";
};

export function ToothModelFallback() {
  return (
    <div className="flex h-full min-h-48 items-center justify-center rounded-[2rem] border border-slate-200/70 bg-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
      <div className="relative h-28 w-24 rounded-[52%_52%_42%_42%] bg-gradient-to-br from-white via-[#fff6e7] to-clinical-100 shadow-[0_24px_60px_rgba(37,99,235,0.14)]">
        <div className="absolute bottom-[-18%] left-[12%] h-20 w-10 rounded-[45%] bg-gradient-to-b from-white to-[#eef7ff]" />
        <div className="absolute bottom-[-18%] right-[12%] h-20 w-10 rounded-[45%] bg-gradient-to-b from-white to-[#eef7ff]" />
      </div>
    </div>
  );
}

const ToothModelCanvas = dynamic(
  () => import("@/components/visuals/ToothModelCanvas").then((module) => module.ToothModelCanvas),
  {
    loading: () => <ToothModelFallback />,
    ssr: false
  }
);

export function ToothModel({
  className,
  floating = true,
  position = [0, 0, 0],
  rotation = [0.08, -0.34, 0.02],
  scale = 2.2,
  variant = "hero"
}: ToothModelProps) {
  return (
    <div
      className={cn(
        "relative overflow-visible rounded-[2rem]",
        variant === "hero" && "min-h-[320px] sm:min-h-[440px]",
        variant === "small" && "min-h-[220px]",
        variant === "background" && "min-h-[180px]",
        className
      )}
    >
      <ToothModelCanvas floating={floating} position={position} rotation={rotation} scale={scale} variant={variant} />
    </div>
  );
}
