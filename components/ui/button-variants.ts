import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-serif uppercase tracking-[0.2em] text-sm transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-ivory hover:bg-moss px-8 py-3.5 rounded-full shadow-sm hover:shadow-md",
        gold: "bg-gold text-ivory hover:bg-gold-soft px-8 py-3.5 rounded-full shadow-sm hover:shadow-md",
        outline:
          "border border-ink/30 text-ink hover:border-gold hover:text-gold px-8 py-3.5 rounded-full",
        ghost: "text-moss hover:text-ink px-4 py-2 rounded-full hover:bg-mist",
      },
      size: {
        default: "",
        sm: "px-5 py-2 text-xs",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);
