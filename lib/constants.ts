import type { Configuracao } from "@/types";

/** Valores de fallback usados caso a tabela `configuracoes` esteja vazia. */
export const CONFIG_PADRAO: Configuracao = {
  id: "padrao",
  nome_noivo: "Thiago",
  nome_noiva: "Geovana",
  data_casamento: "2026-10-24",
  horario: "19:00:00",
  local_nome: "Local a definir",
  endereco: "Endereço",
  google_maps: null,
  versiculo:
    '"Assim, eles já não são dois, mas uma só carne. Portanto, o que Deus uniu, ninguém separa". — Matheus 19:06',
  chave_pix: null,
  favorecido_pix: "Thiago e Geovana",
  banco_pix: null,
  qr_code_pix: null,
  instagram: null,
};

/** Cidade usada no payload Pix (não existe coluna própria no banco). */
export const CIDADE_PIX = "TRES LAGOAS";

export const COOKIE_CONVIDADO = "convidado_session";
export const COOKIE_ADMIN = "admin_session";
