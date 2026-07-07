"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  descricao: string;
  carregando?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

/** Confirmação genérica para ações destrutivas (excluir convidado/presente). */
export function ConfirmDialog({
  open,
  titulo,
  descricao,
  carregando,
  aoConfirmar,
  aoCancelar,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={aoCancelar} title={titulo}>
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <TriangleAlert className="h-6 w-6 text-red-600" aria-hidden />
        </div>
        <h2 className="mt-5 font-serif text-lg uppercase tracking-widest2">{titulo}</h2>
        <p className="mx-auto mt-3 max-w-xs font-sans text-sm font-light leading-relaxed text-moss">
          {descricao}
        </p>
        <div className="mt-7 grid gap-2">
          <Button
            className="w-full bg-red-700 hover:bg-red-800"
            loading={carregando}
            onClick={aoConfirmar}
          >
            Sim, excluir
          </Button>
          <Button variant="ghost" size="sm" onClick={aoCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
