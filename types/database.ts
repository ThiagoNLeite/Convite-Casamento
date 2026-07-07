/**
 * Tipos espelhando o schema real do Supabase
 * (enums: status_confirmacao, status_presente, forma_pagamento).
 */

export type StatusConvidado = "pendente" | "confirmado" | "recusado";
export type StatusPresente = "disponivel" | "reservado" | "entregue";
export type FormaPagamento = "pix" | "presente";

export interface Convidado {
  id: string;
  codigo_convite: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  grupo: string | null;
  quantidade_convites: number;
  quantidade_confirmada: number | null;
  status: StatusConvidado;
  restricao_alimentar: string | null;
  observacoes: string | null;
  confirmado_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface Presente {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  valor: number | null;
  imagem: string | null;
  status: StatusPresente;
  created_at: string;
  updated_at: string;
}

export interface ReservaPresente {
  id: string;
  presente_id: string;
  convidado_id: string;
  forma: FormaPagamento;
  valor_pix: number | null;
  comprovante: string | null;
  confirmado: boolean;
  data_reserva: string;
}

export interface Configuracao {
  id: string;
  nome_noivo: string;
  nome_noiva: string;
  data_casamento: string; // DATE (YYYY-MM-DD)
  horario: string; // TIME (HH:MM:SS)
  local_nome: string | null;
  endereco: string | null;
  google_maps: string | null;
  versiculo: string | null;
  chave_pix: string | null;
  favorecido_pix: string | null;
  banco_pix: string | null;
  qr_code_pix: string | null;
  instagram: string | null;
}
