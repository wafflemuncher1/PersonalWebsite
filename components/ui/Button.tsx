"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "amber";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "btn-sheen bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-glow hover:shadow-glow-lg hover:from-violet-500 hover:to-violet-400",
  amber:
    "btn-sheen bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-glow-amber hover:from-amber-500 hover:to-amber-400",
  secondary:
    "border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08] hover:border-white/20",
  ghost: "text-zinc-400 hover:text-white hover:bg-white/[0.06]",
  danger: "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-200 ease-premium active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
