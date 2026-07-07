"use client";

import { useEffect, useState } from "react";

export interface TempoRestante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  encerrado: boolean;
}

function calcular(alvo: number): TempoRestante {
  const diferenca = alvo - Date.now();
  if (diferenca <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, encerrado: true };
  return {
    dias: Math.floor(diferenca / 86_400_000),
    horas: Math.floor(diferenca / 3_600_000) % 24,
    minutos: Math.floor(diferenca / 60_000) % 60,
    segundos: Math.floor(diferenca / 1_000) % 60,
    encerrado: false,
  };
}

/** Contagem regressiva reativa até a data alvo (ISO). */
export function useCountdown(dataAlvo: string): TempoRestante | null {
  const [tempo, setTempo] = useState<TempoRestante | null>(null);

  useEffect(() => {
    const alvo = new Date(dataAlvo).getTime();
    setTempo(calcular(alvo));
    const intervalo = setInterval(() => setTempo(calcular(alvo)), 1_000);
    return () => clearInterval(intervalo);
  }, [dataAlvo]);

  return tempo;
}
