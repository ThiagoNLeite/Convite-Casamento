import Link from "next/link";
import { Brasao } from "@/components/shared/Brasao";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Brasao className="w-28" />
      <h1 className="mt-8 font-serif text-xl uppercase tracking-widest2">Página não encontrada</h1>
      <p className="mt-3 font-sans text-sm font-light text-moss">
        O caminho que você procurava não existe. Volte para o convite.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-8")}>
        Voltar ao início
      </Link>
    </main>
  );
}
