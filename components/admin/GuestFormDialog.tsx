"use client";

import { useState } from "react";
import { toast } from "sonner";
import { criarConvidadoAdmin, salvarConvidadoAdmin } from "@/app/actions/admin";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Convidado, StatusConvidado } from "@/types";

interface GuestFormDialogProps {
  open: boolean;
  /** `null` = cadastro de um novo convidado; preenchido = edição. */
  convidado: Convidado | null;
  aoFechar: () => void;
}

/** Formulário único de convidado, usado tanto para criar quanto para editar. */
export function GuestFormDialog({ open, convidado, aoFechar }: GuestFormDialogProps) {
  const [salvando, setSalvando] = useState(false);
  const editando = !!convidado;

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    setSalvando(true);

    const base = {
      nome: String(dados.get("nome")),
      telefone: String(dados.get("telefone")) || null,
      email: String(dados.get("email")) || null,
      grupo: String(dados.get("grupo")) || null,
      quantidade_convites: Number(dados.get("quantidade_convites")) || 1,
    };

    const res = editando
      ? await salvarConvidadoAdmin(convidado.id, {
          ...base,
          codigo_convite: String(dados.get("codigo_convite")) || undefined,
          status: String(dados.get("status")) as StatusConvidado,
          quantidade_confirmada: Number(dados.get("quantidade_confirmada")) || null,
          restricao_alimentar: String(dados.get("restricao_alimentar")) || null,
          observacoes: String(dados.get("observacoes")) || null,
        })
      : await criarConvidadoAdmin({
          ...base,
          codigo_convite: String(dados.get("codigo_convite")) || null,
        });

    setSalvando(false);
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível salvar.");
      return;
    }
    toast.success(res.message ?? (editando ? "Convidado atualizado." : "Convidado adicionado."));
    aoFechar();
  }

  return (
    <Dialog open={open} onClose={aoFechar} title={editando ? "Editar convidado" : "Novo convidado"}>
      <form onSubmit={enviar} className="text-left">
        <h2 className="mb-6 text-center font-serif text-lg uppercase tracking-widest2">
          {editando ? "Editar convidado" : "Novo convidado"}
        </h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="g-nome">Nome completo</Label>
            <Input id="g-nome" name="nome" defaultValue={convidado?.nome ?? ""} className="text-left text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="g-telefone">Telefone</Label>
              <Input
                id="g-telefone"
                name="telefone"
                inputMode="tel"
                placeholder="Com DDD"
                defaultValue={convidado?.telefone ?? ""}
                className="text-left text-sm"
              />
            </div>
            <div>
              <Label htmlFor="g-grupo">Grupo</Label>
              <Input
                id="g-grupo"
                name="grupo"
                placeholder="Família, amigos…"
                defaultValue={convidado?.grupo ?? ""}
                className="text-left text-sm"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="g-email">E-mail</Label>
            <Input id="g-email" name="email" type="email" defaultValue={convidado?.email ?? ""} className="text-left text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="g-convites">Convites</Label>
              <Input
                id="g-convites"
                name="quantidade_convites"
                type="number"
                min={1}
                defaultValue={convidado?.quantidade_convites ?? 1}
                className="text-left text-sm"
                required
              />
            </div>
            <div>
              <Label htmlFor="g-codigo">Código do convite</Label>
              <Input
                id="g-codigo"
                name="codigo_convite"
                placeholder={editando ? "" : "Vazio = gerar sozinho"}
                defaultValue={convidado?.codigo_convite ?? ""}
                className="text-left text-sm uppercase"
              />
            </div>
          </div>

          {editando && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="g-status">Status</Label>
                  <select
                    id="g-status"
                    name="status"
                    defaultValue={convidado.status ?? "pendente"}
                    className="w-full rounded-xl border border-ink/15 bg-white px-3 py-3 font-sans text-sm focus:border-gold"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="recusado">Recusado</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="g-confirmada">Confirmados</Label>
                  <Input
                    id="g-confirmada"
                    name="quantidade_confirmada"
                    type="number"
                    min={0}
                    defaultValue={convidado.quantidade_confirmada ?? ""}
                    className="text-left text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="g-restricao">Restrição alimentar</Label>
                <Textarea id="g-restricao" name="restricao_alimentar" defaultValue={convidado.restricao_alimentar ?? ""} />
              </div>
              <div>
                <Label htmlFor="g-obs">Observações</Label>
                <Textarea id="g-obs" name="observacoes" defaultValue={convidado.observacoes ?? ""} />
              </div>
            </>
          )}
        </div>
        <Button type="submit" loading={salvando} className="mt-6 w-full">
          {editando ? "Salvar alterações" : "Adicionar convidado"}
        </Button>
      </form>
    </Dialog>
  );
}
