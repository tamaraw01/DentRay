import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variants = {
  primary:
    "bg-clinical-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.18)] hover:bg-clinical-700 focus-visible:outline-clinical-500",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-[0_8px_22px_rgba(15,23,42,0.04)] hover:border-clinical-200 hover:bg-clinical-50 focus-visible:outline-clinical-500",
  ghost: "text-slate-700 hover:bg-white/70 focus-visible:outline-clinical-500",
  danger:
    "bg-rose-600 text-white shadow-[0_14px_30px_rgba(225,29,72,0.20)] hover:bg-rose-700 focus-visible:outline-rose-500"
};

const baseClass =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0";

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ children, className, variant = "primary", href, ...props }: LinkButtonProps) {
  return (
    <Link className={cn(baseClass, variants[variant], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
