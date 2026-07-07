import "server-only";
import { getSupabase } from "@/lib/supabase";
import { ultimosDigitos } from "@/utils/format";
import type { Convidado } from "@/types";

/** Escapa curingas do ILIKE para o texto digitado não virar padrão de busca. */
function escaparIlike(texto: string): string {
  return texto.replace(/[%_\\]/g, "\\$&");
}

export async function buscarConvidadoPorNome(nome: string): Promise<Convidado | null> {
  const supabase = getSupabase();
  const nomeLimpo = nome.trim().replace(/\s+/g, " ");

  // 1ª tentativa: nome completo exato (sem diferenciar maiúsculas/minúsculas).
  const exato = await supabase
    .from("convidados")
    .select("*")
    .ilike("nome", escaparIlike(nomeLimpo))
    .limit(1)
    .maybeSingle();

  if (exato.error) {
    console.error("[convidados] erro ao buscar por nome:", exato.error.message);
    return null;
  }
  if (exato.data) return exato.data as Convidado;

  // 2ª tentativa: busca parcial — só aceita se houver exatamente 1 correspondência,
  // para tolerar pequenas diferenças (espaços extras, parte do nome).
  const parcial = await supabase
    .from("convidados")
    .select("*")
    .ilike("nome", `%${escaparIlike(nomeLimpo)}%`)
    .limit(2);

  if (parcial.error) {
    console.error("[convidados] erro na busca parcial:", parcial.error.message);
    return null;
  }
  if (parcial.data?.length === 1) return parcial.data[0] as Convidado;

  return null;
}

export async function buscarConvidadoPorId(id: string): Promise<Convidado | null> {
  const { data } = await getSupabase()
    .from("convidados")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Convidado | null) ?? null;
}

/** Telefone é opcional no banco; sem telefone cadastrado não há o que conferir. */
export function possuiTelefone(convidado: Convidado): boolean {
  return !!convidado.telefone && ultimosDigitos(convidado.telefone).length === 4;
}

export function telefoneConfere(convidado: Convidado, digitos: string): boolean {
  if (!convidado.telefone) return false;
  return ultimosDigitos(convidado.telefone) === digitos.replace(/\D/g, "");
}

export interface DadosRsvp {
  status: "confirmado" | "recusado";
  quantidade_confirmada?: number;
  restricao_alimentar?: string;
  observacoes?: string;
}

export async function salvarRsvp(id: string, dados: DadosRsvp): Promise<boolean> {
  const { error } = await getSupabase()
    .from("convidados")
    .update({
      status: dados.status,
      quantidade_confirmada:
        dados.status === "confirmado" ? dados.quantidade_confirmada ?? 1 : null,
      restricao_alimentar: dados.restricao_alimentar || null,
      observacoes: dados.observacoes || null,
      confirmado_em: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}

export async function listarConvidados(): Promise<Convidado[]> {
  const { data } = await getSupabase()
    .from("convidados")
    .select("*")
    .order("nome", { ascending: true });
  return (data as Convidado[] | null) ?? [];
}

export async function atualizarConvidado(
  id: string,
  dados: Partial<Omit<Convidado, "id" | "created_at" | "updated_at">>,
): Promise<boolean> {
  const { error } = await getSupabase()
    .from("convidados")
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

/** Gera um código de convite legível (3 letras do nome + 3 números). */
function gerarCodigoConvite(nome: string): string {
  const letras = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const numeros = Math.floor(100 + Math.random() * 900);
  return `${letras}${numeros}`;
}

export interface NovoConvidado {
  nome: string;
  telefone?: string | null;
  email?: string | null;
  grupo?: string | null;
  quantidade_convites?: number;
  codigo_convite?: string | null;
}

export async function criarConvidado(dados: NovoConvidado): Promise<Convidado | null> {
  const supabase = getSupabase();

  // Até 5 tentativas para o caso raro de o código gerado já existir (coluna UNIQUE).
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = dados.codigo_convite?.trim() || gerarCodigoConvite(dados.nome);
    const { data, error } = await supabase
      .from("convidados")
      .insert({
        nome: dados.nome,
        telefone: dados.telefone || null,
        email: dados.email || null,
        grupo: dados.grupo || null,
        quantidade_convites: dados.quantidade_convites ?? 1,
        codigo_convite: codigo,
        status: "pendente",
      })
      .select()
      .single();

    if (!error) return data as Convidado;
    if (error.code !== "23505" || dados.codigo_convite) {
      console.error("[convidados] erro ao criar:", error.message);
      return null;
    }
  }
  return null;
}

/**
 * Exclui um convidado, tratando as referências primeiro:
 * mensagens ficam sem autor (convidado_id = null) e as reservas dele são removidas.
 */
export async function excluirConvidado(id: string): Promise<boolean> {
  const supabase = getSupabase();
  await supabase.from("mensagens").update({ convidado_id: null }).eq("convidado_id", id);
  await supabase.from("reservas_presentes").delete().eq("convidado_id", id);
  const { error } = await supabase.from("convidados").delete().eq("id", id);
  if (error) console.error("[convidados] erro ao excluir:", error.message);
  return !error;
}
