"use client";

import Image from "next/image";
import { useState } from "react";

import { brandConfig } from "@/config/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeStyles = {
  sm: {
    image: 30,
    mark: "h-9 w-9 rounded-[1.05rem]",
    text: "text-sm"
  },
  md: {
    image: 38,
    mark: "h-11 w-11 rounded-[1.35rem]",
    text: "text-base"
  },
  lg: {
    image: 50,
    mark: "h-14 w-14 rounded-[1.55rem]",
    text: "text-lg"
  }
};

export function BrandLogo({ className, showText = false, size = "md" }: BrandLogoProps) {
  const [hasLogoError, setHasLogoError] = useState(false);
  const styles = sizeStyles[size];

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-[0_12px_28px_rgba(37,99,235,0.12)] ring-1 ring-slate-200/70",
          styles.mark
        )}
      >
        {hasLogoError ? (
          <span className="text-[0.7rem] font-extrabold tracking-[-0.02em] text-clinical-700">DR</span>
        ) : (
          <Image
            alt={`${brandConfig.appName} logo`}
            className="h-[82%] w-[82%] object-contain"
            height={styles.image}
            onError={() => setHasLogoError(true)}
            priority={size === "lg"}
            src={brandConfig.logoPath}
            width={styles.image}
          />
        )}
      </span>
      {showText && (
        <span className={cn("font-extrabold tracking-[-0.02em] text-slate-950", styles.text)}>
          {brandConfig.appName}
        </span>
      )}
    </span>
  );
}
