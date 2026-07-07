import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/diagnostico — SOMENTE em `npm run dev`.
 * Testa a conexão com o Supabase e a leitura de cada tabela usada pela aplicação.
 * Abra http://localhost:3000/api/diagnostico no navegador para ver o resultado.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ erro: "Disponível apenas em desenvolvimento." }, { status: 404 });
  }

  const supabase = getSupabase();
  const tabelas = ["configuracoes", "convidados", "presentes", "reservas_presentes"] as const;

  const resultado: Record<string, unknown> = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    chave_em_uso: process.env.SUPABASE_SECRET_KEY
      ? "secreta (ignora RLS — recomendada)"
      : "publicável (sujeita a RLS: se o RLS estiver ativo sem políticas, as leituras voltam vazias)",
  };

  for (const tabela of tabelas) {
    const { count, error } = await supabase
      .from(tabela)
      .select("*", { count: "exact", head: true });
    resultado[tabela] = error
      ? { ok: false, erro: error.message, codigo: error.code }
      : { ok: true, registros: count };
  }

  return NextResponse.json(resultado, { status: 200 });
}
