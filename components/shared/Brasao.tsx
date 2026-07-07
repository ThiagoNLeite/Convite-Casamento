import Image from "next/image";
import { cn } from "@/lib/utils";

export function Brasao({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brasao.png"
      alt="Brasão do casal: monograma G e T em coroa de folhas"
      width={515}
      height={485}
      priority={priority}
      className={cn("h-auto w-40 sm:w-52", className)}
    />
  );
}
