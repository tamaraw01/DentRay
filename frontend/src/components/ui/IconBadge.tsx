import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  blue: "bg-blue-50 text-clinical-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-500",
  red: "bg-rose-50 text-rose-500",
  violet: "bg-violet-50 text-violet-500"
} as const;

export type BadgeTone = keyof typeof tones;

const sizes = {
  sm: "h-9 w-9 rounded-[0.7rem]",
  md: "h-11 w-11 rounded-[0.85rem]"
} as const;

type IconBadgeProps = {
  tone?: BadgeTone;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

export function IconBadge({ tone = "blue", size = "md", className, children }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center [&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]",
        sizes[size],
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
