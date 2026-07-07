"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Gift, QrCode } from "lucide-react";
import { reservar } from "@/app/actions/gifts";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { PixPanel } from "./PixPanel";
import { formatarMoeda } from "@/utils/format";
import type { Configuracao, Presente } from "@/types";

interface GiftModalProps {
  presente: Presente | null;
  config: Configuracao;
  aoFechar: () => void;
}

export function GiftModal({ presente, config, aoFechar }: GiftModalProps) {
  const [modo, setModo] = useState<"detalhes" | "pix">("detalhes");
  const [reservando, setReservando] = useState(false);

  function fechar() {
    setModo("detalhes");
    aoFechar();
  }

  async function reservarPresente() {
    if (!presente) return;
    setReservando(true);
    const res = await reservar(presente.id);
    setReservando(false);
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível reservar.");
      return;
    }
    toast.success("Presente reservado. Muito obrigado!");
    fechar();
  }

  const indisponivel = !!presente && presente.status !== "disponivel";

  return (
    <Dialog open={!!presente} onClose={fechar} title={presente?.nome ?? "Presente"}>
      {presente && (
        <div className="text-center">
          <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-2xl bg-mist">
            {presente.imagem ? (
              <Image
                src={presente.imagem}
                alt={presente.nome}
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Gift className="h-10 w-10 text-sage" aria-hidden />
              </div>
            )}
          </div>

          <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-sage">
            {presente.categoria ?? "Presente"}
          </p>
          <h2 className="mt-1 font-serif text-xl text-ink">{presente.nome}</h2>
          {presente.descricao && (
            <p className="mt-2 font-sans text-sm font-light leading-relaxed text-moss">
              {presente.descricao}
            </p>
          )}
          {presente.valor !== null && (
            <p className="mt-2 font-serif text-2xl text-gold">{formatarMoeda(presente.valor)}</p>
          )}
          <GoldDivider className="mt-4" />

          {indisponivel ? (
            <div className="mt-6">
              <Badge tone="gold">Este presente já foi escolhido</Badge>
              <p className="mt-3 font-sans text-sm font-light text-moss">
                Que tal escolher outro da lista?
              </p>
            </div>
          ) : modo === "detalhes" ? (
            <div className="mt-6 grid gap-3">
              <Button loading={reservando} onClick={reservarPresente}>
                <Gift className="h-4 w-4" aria-hidden /> Reservar presente
              </Button>
              <Button variant="outline" onClick={() => setModo("pix")}>
                <QrCode className="h-4 w-4" aria-hidden /> Contribuir via Pix
              </Button>
              <p className="mt-1 font-sans text-xs font-light text-moss">
                Ao reservar, você se compromete a presentear este item. Pelo Pix, o valor vai direto
                para os noivos.
              </p>
            </div>
          ) : (
            <PixPanel presente={presente} config={config} aoConcluir={fechar} />
          )}
        </div>
      )}
    </Dialog>
  );
}
