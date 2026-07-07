"use client";

import { useState } from "react";
import { GuestsTable } from "./GuestsTable";
import { GiftsTable } from "./GiftsTable";
import { cn } from "@/lib/utils";
import type { Convidado, Presente } from "@/types";

export function AdminTabs({ convidados, presentes }: { convidados: Convidado[]; presentes: Presente[] }) {
  const [aba, setAba] = useState<"convidados" | "presentes">("convidados");

  return (
    <div>
      <div className="flex gap-2 border-b border-ink/10" role="tablist" aria-label="Seções do painel">
        {(
          [
            ["convidados", `Convidados (${convidados.length})`],
            ["presentes", `Presentes (${presentes.length})`],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={aba === valor}
            onClick={() => setAba(valor)}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 font-serif text-sm uppercase tracking-widest transition-colors",
              aba === valor ? "border-gold text-ink" : "border-transparent text-moss hover:text-ink",
            )}
          >
            {rotulo}
          </button>
        ))}
      </div>
      <div className="mt-6" role="tabpanel">
        {aba === "convidados" ? (
          <GuestsTable convidados={convidados} />
        ) : (
          <GiftsTable presentes={presentes} />
        )}
      </div>
    </div>
  );
}
