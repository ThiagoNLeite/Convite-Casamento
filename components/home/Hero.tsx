"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Gift, MailCheck, MapPin } from "lucide-react";
import { Brasao } from "@/components/shared/Brasao";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { buttonVariants } from "@/components/ui/button-variants";
import { Countdown } from "./Countdown";
import { cn } from "@/lib/utils";
import {
  combinarDataHora,
  formatarDataLonga,
  formatarHora,
  primeiroNome,
} from "@/utils/format";
import type { Configuracao } from "@/types";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero({ config, nomeConvidado }: { config: Configuracao; nomeConvidado: string }) {
  const dataHoraEvento = combinarDataHora(config.data_casamento, config.horario);

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.18 } } }}
      className="flex flex-col items-center px-6 pt-14 text-center sm:pt-20"
    >
      <motion.div variants={item}>
        <Brasao priority />
      </motion.div>

      {config.versiculo && (
        <motion.blockquote variants={item} className="mt-10 max-w-md">
          <p className="font-sans text-sm font-light leading-relaxed text-ink/75">
            {config.versiculo}
          </p>
        </motion.blockquote>
      )}

      <motion.p variants={item} className="eyebrow mt-12">
        Olá, {primeiroNome(nomeConvidado)}! Estamos muito felizes em
        <br />
        compartilhar esse momento com você.
      </motion.p>

      <motion.h1 variants={item} className="mt-8 font-script text-6xl leading-tight text-ink sm:text-7xl">
        {config.nome_noiva} <span className="text-gold">&amp;</span> {config.nome_noivo}
      </motion.h1>

      <motion.div variants={item} className="mt-8 w-full max-w-sm">
        <GoldDivider />
        <dl className="mt-6 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <dt className="sr-only">Data</dt>
            <CalendarDays className="h-4 w-4 text-gold" aria-hidden />
            <dd className="font-serif text-base uppercase tracking-[0.18em]">
              {formatarDataLonga(config.data_casamento)}
            </dd>
          </div>
          <div className="flex items-center justify-center gap-2">
            <dt className="sr-only">Horário</dt>
            <Clock className="h-4 w-4 text-gold" aria-hidden />
            <dd className="font-serif text-base uppercase tracking-[0.18em]">
              às {formatarHora(config.horario)}
            </dd>
          </div>
          <div className="flex items-center justify-center gap-2">
            <dt className="sr-only">Local</dt>
            <MapPin className="h-4 w-4 text-gold" aria-hidden />
            <dd className="font-sans text-sm font-light text-moss">
              {config.google_maps ? (
                <a
                  href={config.google_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-gold/60 underline-offset-4 transition-colors hover:text-gold"
                >
                  {config.local_nome ?? "Local"} · {config.endereco ?? "ver no mapa"}
                </a>
              ) : (
                <>
                  {config.local_nome ?? "Local a definir"}
                  {config.endereco ? ` · ${config.endereco}` : ""}
                </>
              )}
            </dd>
          </div>
        </dl>
        <GoldDivider className="mt-6" />
      </motion.div>

      <motion.div variants={item} className="mt-12 w-full">
        <Countdown dataEvento={dataHoraEvento} />
      </motion.div>

      <motion.div variants={item} className="mt-12 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link href="/confirmar" className={cn(buttonVariants({ variant: "primary" }), "w-full sm:w-auto")}>
          <MailCheck className="h-4 w-4" aria-hidden />
          Confirmar presença
        </Link>
        <Link href="/presentes" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
          <Gift className="h-4 w-4" aria-hidden />
          Lista de presentes
        </Link>
      </motion.div>
    </motion.section>
  );
}
