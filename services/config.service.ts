import "server-only";
import { getSupabase } from "@/lib/supabase";
import { CONFIG_PADRAO } from "@/lib/constants";
import type { Configuracao } from "@/types";

/**
 * Busca a configuração do evento (linha única da tabela `configuracoes`).
 * Faz merge com os valores padrão para tolerar colunas ausentes.
 */
export async function obterConfiguracao(): Promise<Configuracao> {
  const { data } = await getSupabase()
    .from("configuracoes")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!data) return CONFIG_PADRAO;

  const config = { ...CONFIG_PADRAO };
  for (const chave of Object.keys(config) as (keyof Configuracao)[]) {
    const valor = (data as Record<string, unknown>)[chave];
    if (valor !== null && valor !== undefined && valor !== "") {
      config[chave] = valor as never;
    }
  }
  return config;
}
