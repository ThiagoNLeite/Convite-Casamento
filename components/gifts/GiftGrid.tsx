"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GiftCard } from "./GiftCard";
import { GiftModal } from "./GiftModal";
import { cn } from "@/lib/utils";
import type { Configuracao, Presente } from "@/types";

export function GiftGrid({ presentes, config }: { presentes: Presente[]; config: Configuracao }) {
  const [selecionado, setSelecionado] = useState<Presente | null>(null);
  const [categoria, setCategoria] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const categorias = useMemo(
    () => ["todos", ...Array.from(new Set(presentes.map((p) => p.categoria).filter((c): c is string => !!c)))],
    [presentes],
  );

  const filtrados = useMemo(
    () =>
      presentes.filter(
        (p) =>
          (categoria === "todos" || p.categoria === categoria) &&
          p.nome.toLowerCase().includes(busca.toLowerCase()),
      ),
    [presentes, categoria, busca],
  );

  return (
    <div>
      <div className="relative mx-auto max-w-sm">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" aria-hidden />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar presente…"
          aria-label="Buscar presente"
          className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-11 pr-4 font-sans text-sm placeholder:text-ink/30 focus:border-gold"
        />
      </div>

      {categorias.length > 2 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorias">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={categoria === cat}
              onClick={() => setCategoria(cat)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors",
                categoria === cat
                  ? "border-gold bg-gold text-ivory"
                  : "border-ink/15 text-moss hover:border-gold hover:text-gold",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className="mt-14 text-center font-sans text-sm font-light text-moss">
          Nenhum presente encontrado. Limpe a busca para ver a lista completa.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtrados.map((presente, i) => (
            <GiftCard key={presente.id} presente={presente} indice={i} aoSelecionar={setSelecionado} />
          ))}
        </div>
      )}

      <GiftModal presente={selecionado} config={config} aoFechar={() => setSelecionado(null)} />
    </div>
  );
}
