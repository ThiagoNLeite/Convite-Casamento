import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Botão flutuante de voltar ao convite, exibido nas páginas internas
 * (Presença e Presentes). Substitui a antiga barra de navegação.
 */
export function BackButton() {
  return (
    <Link
      href="/convite"
      aria-label="Voltar ao convite"
      className="fixed right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-ivory/85 text-moss shadow-sm backdrop-blur-md transition-colors hover:bg-mist hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
    </Link>
  );
}
