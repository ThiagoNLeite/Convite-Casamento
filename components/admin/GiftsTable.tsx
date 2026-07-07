"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Gift, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { excluirPresenteAdmin } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GiftFormDialog } from "./GiftFormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { formatarMoeda } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { Presente, StatusPresente } from "@/types";

export function GiftsTable({ presentes }: { presentes: Presente[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<StatusPresente | "todos">("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Presente | null>(null);
  const [excluindo, setExcluindo] = useState<Presente | null>(null);
  const [removendo, setRemovendo] = useState(false);

  const filtrados = useMemo(
    () =>
      presentes.filter(
        (p) =>
          (filtro === "todos" || p.status === filtro) &&
          p.nome.toLowerCase().includes(busca.toLowerCase()),
      ),
    [presentes, busca, filtro],
  );

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(presente: Presente) {
    setEditando(presente);
    setFormAberto(true);
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setRemovendo(true);
    const res = await excluirPresenteAdmin(excluindo.id);
    setRemovendo(false);
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível excluir.");
      return;
    }
    toast.success(`"${excluindo.nome}" removido da lista.`);
    setExcluindo(null);
  }

  return (
    <section aria-label="Presentes">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
        <div className="flex items-center gap-2 overflow-x-auto" role="group" aria-label="Filtrar por status">
          {(["todos", "disponivel", "reservado", "entregue"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 font-sans text-xs transition-colors",
                filtro === f ? "border-ink bg-ink text-ivory" : "border-ink/15 text-moss hover:border-ink",
              )}
            >
              {f === "disponivel" ? "Disponíveis" : f === "reservado" ? "Reservados" : f === "entregue" ? "Entregues" : "Todos"}
            </button>
          ))}
          <Button variant="gold" size="sm" className="shrink-0" onClick={abrirNovo}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Adicionar
          </Button>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
        {filtrados.length === 0 && (
          <li className="px-5 py-8 text-center font-sans text-sm text-moss">
            Nenhum presente encontrado com esses filtros.
          </li>
        )}
        {filtrados.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-mist">
              {p.imagem ? (
                <Image src={p.imagem} alt="" fill sizes="44px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Gift className="h-4 w-4 text-sage" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base text-ink">{p.nome}</p>
              <p className="font-sans text-xs text-moss">
                {p.categoria ?? "Sem categoria"}
                {p.valor !== null ? ` · ${formatarMoeda(p.valor)}` : ""}
              </p>
            </div>
            <Badge tone={p.status === "disponivel" ? "neutral" : p.status === "reservado" ? "gold" : "success"}>
              {p.status === "disponivel" ? "Disponível" : p.status === "reservado" ? "Reservado" : "Entregue"}
            </Badge>
            <Button variant="ghost" size="icon" aria-label={`Editar ${p.nome}`} onClick={() => abrirEdicao(p)}>
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Excluir ${p.nome}`}
              className="text-red-700/70 hover:bg-red-50 hover:text-red-700"
              onClick={() => setExcluindo(p)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <GiftFormDialog open={formAberto} presente={editando} aoFechar={() => setFormAberto(false)} />

      <ConfirmDialog
        open={!!excluindo}
        titulo="Excluir presente"
        descricao={`Remover "${excluindo?.nome}" da lista? As reservas e contribuições ligadas a ele também serão removidas. Essa ação não pode ser desfeita.`}
        carregando={removendo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setExcluindo(null)}
      />
    </section>
  );
}
