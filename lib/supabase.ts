import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase (SDK oficial), singleton.
 *
 * Usa a CHAVE SECRETA (`SUPABASE_SECRET_KEY`) quando disponível — ela ignora
 * as políticas de RLS e só existe no servidor (nunca chega ao navegador,
 * pois todos os services/actions rodam no servidor).
 * Sem ela, cai na chave publicável, que está SUJEITA ao RLS: se o RLS estiver
 * ativado sem políticas de leitura, as consultas voltam vazias (ex.: "convidado
 * não encontrado" mesmo com o nome certo).
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  return client;
}
