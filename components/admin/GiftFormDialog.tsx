"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { criarPresenteAdmin, salvarPresenteAdmin } from "@/app/actions/admin";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Presente } from "@/types";

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

interface GiftFormDialogProps {
  open: boolean;
  /** `null` = cadastro de um novo presente; preenchido = edição. */
  presente: Presente | null;
  aoFechar: () => void;
}

/** Formulário único de presente (criar/editar) com upload de imagem para o Storage. */
export function GiftFormDialog({ open, presente, aoFechar }: GiftFormDialogProps) {
  const [salvando, setSalvando] = useState(false);
  const [previa, setPrevia] = useState<string | null>(null);
  const inputArquivo = useRef<HTMLInputElement>(null);
  const editando = !!presente;

  // Limpa a prévia ao abrir/fechar ou trocar de presente.
  useEffect(() => {
    setPrevia(null);
  }, [open, presente?.id]);

  function aoEscolherImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) {
      setPrevia(null);
      return;
    }
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem.");
      e.target.value = "";
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      toast.error("Imagem muito grande (máximo 5 MB).");
      e.target.value = "";
      return;
    }
    setPrevia(URL.createObjectURL(arquivo));
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSalvando(true);

    const res = editando
      ? await salvarPresenteAdmin(presente.id, form)
      : await criarPresenteAdmin(form);

    setSalvando(false);
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível salvar.");
      return;
    }
    toast.success(editando ? "Presente atualizado." : "Presente adicionado.");
    aoFechar();
  }

  const imagemAtual = previa ?? presente?.imagem ?? null;

  return (
    <Dialog open={open} onClose={aoFechar} title={editando ? "Editar presente" : "Novo presente"}>
      <form onSubmit={enviar} className="text-left">
        <h2 className="mb-6 text-center font-serif text-lg uppercase tracking-widest2">
          {editando ? "Editar presente" : "Novo presente"}
        </h2>

        {/* Upload com prévia */}
        <button
          type="button"
          onClick={() => inputArquivo.current?.click()}
          aria-label="Escolher imagem do presente"
          className="relative mx-auto flex aspect-square w-36 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink/25 bg-mist transition-colors hover:border-gold"
        >
          {imagemAtual ? (
            <Image src={imagemAtual} alt="Prévia da imagem" fill sizes="144px" className="object-cover" unoptimized={!!previa} />
          ) : (
            <span className="flex flex-col items-center gap-2 font-sans text-xs text-moss">
              <ImagePlus className="h-6 w-6" aria-hidden />
              Escolher imagem
            </span>
          )}
        </button>
        <input
          ref={inputArquivo}
          type="file"
          name="imagem"
          accept="image/*"
          onChange={aoEscolherImagem}
          className="sr-only"
          aria-hidden
          tabIndex={-1}
        />
        <p className="mt-2 text-center font-sans text-[11px] text-moss">
          {editando ? "Toque para trocar a imagem (opcional) · até 5 MB" : "Opcional · até 5 MB"}
        </p>

        <div className="mt-5 grid gap-4">
          <div>
            <Label htmlFor="p-nome">Nome</Label>
            <Input id="p-nome" name="nome" defaultValue={presente?.nome ?? ""} className="text-left text-sm" required />
          </div>
          <div>
            <Label htmlFor="p-descricao">Descrição</Label>
            <Textarea id="p-descricao" name="descricao" defaultValue={presente?.descricao ?? ""} placeholder="Opcional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="p-categoria">Categoria</Label>
              <Input id="p-categoria" name="categoria" placeholder="Cozinha, casa…" defaultValue={presente?.categoria ?? ""} className="text-left text-sm" />
            </div>
            <div>
              <Label htmlFor="p-valor">Valor (R$)</Label>
              <Input id="p-valor" name="valor" type="number" min={0} step="0.01" defaultValue={presente?.valor ?? ""} className="text-left text-sm" />
            </div>
          </div>
          {editando && (
            <div>
              <Label htmlFor="p-status">Status</Label>
              <select
                id="p-status"
                name="status"
                defaultValue={presente.status}
                className="w-full rounded-xl border border-ink/15 bg-white px-3 py-3 font-sans text-sm focus:border-gold"
              >
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>
          )}
        </div>
        <Button type="submit" loading={salvando} className="mt-6 w-full">
          {editando ? "Salvar alterações" : "Adicionar presente"}
        </Button>
      </form>
    </Dialog>
  );
}
