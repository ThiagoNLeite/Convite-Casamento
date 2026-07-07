import "server-only";
import { getSupabase } from "@/lib/supabase";
import type { Presente, ReservaPresente } from "@/types";

export async function listarPresentes(): Promise<Presente[]> {
  const { data } = await getSupabase()
    .from("presentes")
    .select("*")
    .order("valor", { ascending: true, nullsFirst: false });
  return (data as Presente[] | null) ?? [];
}

export async function reservarPresente(presenteId: string, convidadoId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error: erroReserva } = await supabase.from("reservas_presentes").insert({
    presente_id: presenteId,
    convidado_id: convidadoId,
    forma: "presente",
    confirmado: true,
  });
  if (erroReserva) return false;

  const { error } = await supabase
    .from("presentes")
    .update({ status: "reservado", updated_at: new Date().toISOString() })
    .eq("id", presenteId)
    .eq("status", "disponivel");
  return !error;
}

export async function registrarContribuicaoPix(
  presenteId: string,
  convidadoId: string,
  valor: number,
): Promise<boolean> {
  const { error } = await getSupabase().from("reservas_presentes").insert({
    presente_id: presenteId,
    convidado_id: convidadoId,
    forma: "pix",
    valor_pix: valor,
    confirmado: false,
  });
  return !error;
}

export async function listarReservas(): Promise<ReservaPresente[]> {
  const { data } = await getSupabase()
    .from("reservas_presentes")
    .select("*")
    .order("data_reserva", { ascending: false });
  return (data as ReservaPresente[] | null) ?? [];
}

export async function atualizarPresente(
  id: string,
  dados: Partial<Omit<Presente, "id" | "created_at" | "updated_at">>,
): Promise<boolean> {
  const { error } = await getSupabase()
    .from("presentes")
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export interface NovoPresente {
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  valor?: number | null;
  imagem?: string | null;
}

export async function criarPresente(dados: NovoPresente): Promise<Presente | null> {
  const { data, error } = await getSupabase()
    .from("presentes")
    .insert({
      nome: dados.nome,
      descricao: dados.descricao || null,
      categoria: dados.categoria || null,
      valor: dados.valor ?? null,
      imagem: dados.imagem || null,
      status: "disponivel",
    })
    .select()
    .single();
  if (error) {
    console.error("[presentes] erro ao criar:", error.message);
    return null;
  }
  return data as Presente;
}

/** Exclui um presente removendo antes as reservas que apontam para ele. */
export async function excluirPresente(id: string): Promise<boolean> {
  const supabase = getSupabase();
  await supabase.from("reservas_presentes").delete().eq("presente_id", id);
  const { error } = await supabase.from("presentes").delete().eq("id", id);
  if (error) console.error("[presentes] erro ao excluir:", error.message);
  return !error;
}

/** Sobe a imagem para o bucket público `images` e retorna a URL pública. */
export async function enviarImagemPresente(arquivo: File): Promise<string | null> {
  const supabase = getSupabase();
  const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const caminho = `presentes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

  const { error } = await supabase.storage.from("images").upload(caminho, arquivo, {
    contentType: arquivo.type,
    upsert: false,
  });
  if (error) {
    console.error("[storage] erro no upload:", error.message);
    return null;
  }
  return supabase.storage.from("images").getPublicUrl(caminho).data.publicUrl;
}
