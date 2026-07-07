import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "gold";

const tones: Record<Tone, string> = {
  neutral: "bg-mist text-moss",
  success: "bg-sage/20 text-moss",
  warning: "bg-gold-pale text-gold",
  danger: "bg-red-50 text-red-700",
  gold: "bg-gold text-ivory",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-sans uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
