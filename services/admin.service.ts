import "server-only";
import { listarConvidados } from "./guests.service";
import { listarPresentes, listarReservas } from "./gifts.service";
import type { Convidado, EstatisticasAdmin, Presente, ReservaPresente } from "@/types";

export interface DadosAdmin {
  estatisticas: EstatisticasAdmin;
  convidados: Convidado[];
  presentes: Presente[];
  reservas: ReservaPresente[];
}

export async function obterDadosAdmin(): Promise<DadosAdmin> {
  const [convidados, presentes, reservas] = await Promise.all([
    listarConvidados(),
    listarPresentes(),
    listarReservas(),
  ]);

  const estatisticas: EstatisticasAdmin = {
    totalConvidados: convidados.length,
    confirmados: convidados.filter((c) => c.status === "confirmado").length,
    pendentes: convidados.filter((c) => c.status === "pendente" || !c.status).length,
    recusados: convidados.filter((c) => c.status === "recusado").length,
    totalPresentes: presentes.length,
    presentesReservados: presentes.filter((p) => p.status !== "disponivel").length,
    valorPix: reservas
      .filter((r) => r.forma === "pix")
      .reduce((total, r) => total + Number(r.valor_pix ?? 0), 0),
  };

  return { estatisticas, convidados, presentes, reservas };
}
