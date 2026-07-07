"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda } from "@/utils/format";
import type { Presente } from "@/types";

interface GiftCardProps {
  presente: Presente;
  aoSelecionar: (presente: Presente) => void;
  indice: number;
}

export function GiftCard({ presente, aoSelecionar, indice }: GiftCardProps) {
  const indisponivel = presente.status !== "disponivel";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.6, delay: (indice % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => aoSelecionar(presente)}
        aria-label={`Ver detalhes de ${presente.nome}`}
        className="group block w-full text-left"
      >
        <Card className="overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
          <div className="relative aspect-square bg-mist">
            {presente.imagem ? (
              <Image
                src={presente.imagem}
                alt={presente.nome}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Gift className="h-10 w-10 text-sage" aria-hidden />
              </div>
            )}
            {indisponivel && (
              <div className="absolute inset-0 flex items-center justify-center bg-ivory/70 backdrop-blur-[2px]">
                <Badge tone="gold">Presenteado</Badge>
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="font-sans text-[10px] uppercase tracking-widest text-sage">
              {presente.categoria ?? "Presente"}
            </p>
            <h3 className="mt-1 line-clamp-2 font-serif text-base leading-snug text-ink">
              {presente.nome}
            </h3>
            {presente.valor !== null && (
              <p className="mt-2 font-serif text-lg text-gold">{formatarMoeda(presente.valor)}</p>
            )}
          </div>
        </Card>
      </button>
    </motion.div>
  );
}
