"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

type Tuple3 = [number, number, number];

export type HeroToothModelProps = {
  className?: string;
  position?: Tuple3;
  rotation?: Tuple3;
  scale?: number | Tuple3;
};

function HeroToothFallback() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute right-[-18%] top-[14%] h-[68%] w-[62%] rounded-[48%_52%_40%_44%] bg-gradient-to-br from-[#fffdf7] via-[#f8f3e8] to-[#edf4fb] opacity-95 shadow-[0_28px_70px_rgba(37,99,235,0.14)]" />
    </div>
  );
}

const HeroToothModelCanvas = dynamic(
  () => import("@/components/visuals/HeroToothModelCanvas").then((module) => module.HeroToothModelCanvas),
  {
    loading: () => <HeroToothFallback />,
    ssr: false
  }
);

export function HeroToothModel({
  className,
  position = [0.18, -0.02, 0],
  rotation = [0.08, -0.34, 0.02],
  scale = 2.72
}: HeroToothModelProps) {
  return (
    <div className={cn("pointer-events-auto absolute inset-0", className)}>
      <HeroToothModelCanvas position={position} rotation={rotation} scale={scale} />
    </div>
  );
}
