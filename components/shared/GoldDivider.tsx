import { cn } from "@/lib/utils";

/** Divisor fino dourado com losango central — assinatura visual do convite. */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-soft" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-soft" />
    </div>
  );
}
