import Image from "next/image";

import { cn } from "@/lib/utils";

type DentRayMascotProps = {
  animated?: boolean;
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "hero";
  sizeClassName?: string;
};

const sizeClasses = {
  hero: "h-[min(52svh,29rem)] w-[min(78vw,22rem)]",
  lg: "h-64 w-48 sm:h-72 sm:w-56",
  md: "h-40 w-28",
  sm: "h-24 w-16"
} as const;

const responsiveSizes = {
  hero: "(max-width: 640px) 78vw, 352px",
  lg: "(max-width: 640px) 192px, 224px",
  md: "112px",
  sm: "64px"
} as const;

export function DentRayMascot({
  animated = false,
  className,
  priority = false,
  size = "md",
  sizeClassName
}: DentRayMascotProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative shrink-0",
        sizeClassName ?? sizeClasses[size],
        animated && "dentray-mascot-float",
        className
      )}
    >
      <Image
        alt=""
        className="object-contain"
        fill
        priority={priority}
        sizes={responsiveSizes[size]}
        src="/mascot/dentray-mascot.png"
      />
    </div>
  );
}
