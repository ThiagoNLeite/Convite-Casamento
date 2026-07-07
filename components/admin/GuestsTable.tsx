"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { excluirConvidadoAdmin } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuestFormDialog } from "./GuestFormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn } from "@/lib/utils";
import type { Convidado, StatusConvidado } from "@/types";

const tons: Record<StatusConvidado, "success" | "warning" | "danger"> = {
  confirmado: "success",
  pendente: "warning",
  recusado: "danger",
};

const filtros: Array<{ valor: StatusConvidado | "todos"; rotulo: string }> = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "confirmado", rotulo: "Confirmados" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "recusado", rotulo: "Recusados" },
];

export function GuestsTable({ convidados }: { convidados: Convidado[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<StatusConvidado | "todos">("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Convidado | null>(null);
  const [excluindo, setExcluindo] = useState<Convidado | null>(null);
  const [removendo, setRemovendo] = useState(false);

  const filtrados = useMemo(
    () =>
      convidados.filter(
        (c) =>
          (filtro === "todos" || (c.status ?? "pendente") === filtro) &&
          c.nome.toLowerCase().includes(busca.toLowerCase()),
      ),
    [convidados, busca, filtro],
  );

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(convidado: Convidado) {
    setEditando(convidado);
    setFormAberto(true);
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setRemovendo(true);
    const res = await excluirConvidadoAdmin(excluindo.id);
    setRemovendo(false);
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível excluir.");
      return;
    }
    toast.success(`${excluindo.nome} removido(a) da lista.`);
    setExcluindo(null);
  }

  return (
    <section aria-label="Convidados">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" aria-hidden />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar convidado…"
            aria-label="Buscar convidado"
            className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-11 pr-4 font-sans text-sm placeholder:text-ink/30 focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto" role="group" aria-label="Filtrar por status">
          {filtros.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              aria-pressed={filtro === f.valor}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 font-sans text-xs transition-colors",
                filtro === f.valor
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/15 text-moss hover:border-ink",
              )}
            >
              {f.rotulo}
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
            Nenhum convidado encontrado com esses filtros.
          </li>
        )}
        {filtrados.map((c) => (
          <li key={c.id} className="flex items-center gap-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base text-ink">{c.nome}</p>
              <p className="font-sans text-xs text-moss">
                {c.codigo_convite}
                {c.telefone ? ` · ${c.telefone}` : ""}
                {c.grupo ? ` · ${c.grupo}` : ""}
                {c.status === "confirmado"
                  ? ` · ${c.quantidade_confirmada ?? "?"}/${c.quantidade_convites} pessoa(s)`
                  : ` · ${c.quantidade_convites} convite(s)`}
                {c.restricao_alimentar ? ` · ${c.restricao_alimentar}` : ""}
              </p>
            </div>
            <Badge tone={tons[(c.status ?? "pendente") as StatusConvidado]}>
              {c.status ?? "pendente"}
            </Badge>
            <Button variant="ghost" size="icon" aria-label={`Editar ${c.nome}`} onClick={() => abrirEdicao(c)}>
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Excluir ${c.nome}`}
              className="text-red-700/70 hover:bg-red-50 hover:text-red-700"
              onClick={() => setExcluindo(c)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <GuestFormDialog open={formAberto} convidado={editando} aoFechar={() => setFormAberto(false)} />

      <ConfirmDialog
        open={!!excluindo}
        titulo="Excluir convidado"
        descricao={`Remover "${excluindo?.nome}" da lista? As reservas de presente feitas por essa pessoa também serão removidas. Essa ação não pode ser desfeita.`}
        carregando={removendo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setExcluindo(null)}
      />
    </section>
  );
}
