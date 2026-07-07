"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { Skeleton } from "@/components/ui/skeleton";

const unidades = [
  ["dias", "Dias"],
  ["horas", "Horas"],
  ["minutos", "Min"],
  ["segundos", "Seg"],
] as const;

export function Countdown({ dataEvento }: { dataEvento: string }) {
  const tempo = useCountdown(dataEvento);

  if (!tempo) {
    return (
      <div className="flex justify-center gap-3" aria-hidden>
        {unidades.map(([chave]) => (
          <Skeleton key={chave} className="h-20 w-16 sm:h-24 sm:w-20" />
        ))}
      </div>
    );
  }

  if (tempo.encerrado) {
    return <p className="font-script text-3xl text-gold">O grande dia chegou!</p>;
  }

  return (
    <div
      className="flex justify-center gap-3 sm:gap-5"
      role="timer"
      aria-label="Contagem regressiva para o casamento"
    >
      {unidades.map(([chave, rotulo]) => (
        <div
          key={chave}
          className="flex h-20 w-16 flex-col items-center justify-center rounded-2xl border border-gold-pale bg-white/70 sm:h-24 sm:w-20"
        >
          <span className="font-serif text-2xl text-ink tabular-nums sm:text-3xl">
            {String(tempo[chave]).padStart(2, "0")}
          </span>
          <span className="mt-1 font-sans text-[10px] uppercase tracking-widest text-moss">
            {rotulo}
          </span>
        </div>
      ))}
    </div>
  );
}
