"use client";

import dynamic from "next/dynamic";

function ToothBackgroundFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-[8%] top-[12%] h-32 w-32 rounded-[2.4rem] bg-white/28 blur-sm" />
      <div className="absolute right-[12%] top-[8%] h-44 w-44 rounded-[3rem] bg-clinical-300/20 blur-xl" />
      <div className="absolute left-[28%] top-[36%] h-52 w-52 rounded-full bg-white/24 blur-2xl" />
      <div className="absolute bottom-[18%] right-[22%] h-28 w-28 rounded-[2rem] bg-clinical-100/34 blur-sm" />
    </div>
  );
}

const ToothBackgroundCanvas = dynamic(
  () => import("@/components/visuals/ToothBackgroundCanvas").then((module) => module.ToothBackgroundCanvas),
  {
    loading: () => <ToothBackgroundFallback />,
    ssr: false
  }
);

export function ToothBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <ToothBackgroundCanvas />
    </div>
  );
}
