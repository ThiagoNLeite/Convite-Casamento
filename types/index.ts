export * from "./database";

export interface SessaoConvidado {
  id: string;
  nome: string;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  data?: T;
}

export interface EstatisticasAdmin {
  totalConvidados: number;
  confirmados: number;
  pendentes: number;
  recusados: number;
  totalPresentes: number;
  presentesReservados: number;
  valorPix: number;
}
