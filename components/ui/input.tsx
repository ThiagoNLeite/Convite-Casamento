"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-center font-serif text-lg text-ink placeholder:text-ink/30 transition-colors focus:border-gold",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
