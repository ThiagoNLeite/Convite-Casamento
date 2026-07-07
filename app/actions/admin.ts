"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarSessaoAdmin, encerrarSessaoAdmin, exigirAdmin } from "@/lib/session";
import {
  atualizarConvidado,
  criarConvidado,
  excluirConvidado,
} from "@/services/guests.service";
import {
  atualizarPresente,
  criarPresente,
  enviarImagemPresente,
  excluirPresente,
} from "@/services/gifts.service";
import type { ActionResult, Convidado, StatusPresente } from "@/types";

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5 MB

function revalidarTudo() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/presentes");
  revalidatePath("/convite");
}

/* ─────────────────────────── Sessão ─────────────────────────── */

export async function entrarAdmin(senha: string): Promise<ActionResult> {
  if (!process.env.ADMIN_PASSWORD || senha !== process.env.ADMIN_PASSWORD) {
    return { ok: false, message: "Senha incorreta." };
  }
  await criarSessaoAdmin();
  return { ok: true };
}

export async function sairAdmin(): Promise<void> {
  await encerrarSessaoAdmin();
  redirect("/admin");
}

/* ────────────────────────── Convidados ───────────────────────── */

const convidadoBaseSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  telefone: z.string().trim().nullable().optional(),
  email: z
    .string()
    .trim()
    .email("E-mail inválido.")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  grupo: z.string().trim().nullable().optional(),
  quantidade_convites: z.coerce.number().int().min(1, "Mínimo 1 convite."),
  codigo_convite: z.string().trim().nullable().optional(),
});

const convidadoEdicaoSchema = convidadoBaseSchema.omit({ codigo_convite: true }).extend({
  codigo_convite: z.string().trim().min(3, "Código muito curto.").optional(),
  status: z.enum(["pendente", "confirmado", "recusado"]),
  quantidade_confirmada: z.coerce.number().int().min(0).nullable(),
  restricao_alimentar: z.string().max(500).nullable(),
  observacoes: z.string().max(500).nullable(),
});

export async function criarConvidadoAdmin(
  input: z.input<typeof convidadoBaseSchema>,
): Promise<ActionResult> {
  await exigirAdmin();
  const parsed = convidadoBaseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const criado = await criarConvidado(parsed.data);
  if (!criado) {
    return { ok: false, message: "Não foi possível criar. O código do convite já existe?" };
  }

  revalidarTudo();
  return { ok: true, message: `Convite ${criado.codigo_convite} criado.` };
}

export async function salvarConvidadoAdmin(
  id: string,
  dados: Partial<Omit<Convidado, "id" | "created_at" | "updated_at">>,
): Promise<ActionResult> {
  await exigirAdmin();
  const parsed = convidadoEdicaoSchema.partial().safeParse(dados);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const ok = await atualizarConvidado(id, parsed.data);
  if (!ok) return { ok: false, message: "Não foi possível salvar." };

  revalidarTudo();
  return { ok: true };
}

export async function excluirConvidadoAdmin(id: string): Promise<ActionResult> {
  await exigirAdmin();
  if (!id) return { ok: false, message: "Convidado inválido." };

  const ok = await excluirConvidado(id);
  if (!ok) return { ok: false, message: "Não foi possível excluir." };

  revalidarTudo();
  return { ok: true };
}

/* ────────────────────────── Presentes ────────────────────────── */

const presenteSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do presente."),
  descricao: z.string().max(500).optional(),
  categoria: z.string().trim().max(80).optional(),
  valor: z.coerce.number().min(0).optional(),
  status: z.enum(["disponivel", "reservado", "entregue"]).optional(),
});

/** Lê os campos do FormData e sobe a imagem (se enviada), retornando a URL. */
async function processarFormPresente(form: FormData): Promise<
  | { ok: true; campos: z.infer<typeof presenteSchema>; imagem: string | null }
  | { ok: false; message: string }
> {
  const parsed = presenteSchema.safeParse({
    nome: form.get("nome"),
    descricao: String(form.get("descricao") ?? ""),
    categoria: String(form.get("categoria") ?? ""),
    valor: form.get("valor") || undefined,
    status: form.get("status") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const arquivo = form.get("imagem");
  let imagem: string | null = null;

  if (arquivo instanceof File && arquivo.size > 0) {
    if (!arquivo.type.startsWith("image/")) {
      return { ok: false, message: "O arquivo precisa ser uma imagem." };
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      return { ok: false, message: "Imagem muito grande (máximo 5 MB)." };
    }
    imagem = await enviarImagemPresente(arquivo);
    if (!imagem) {
      return {
        ok: false,
        message: "Falha no upload. O bucket 'images' existe e é público no Storage?",
      };
    }
  }

  return { ok: true, campos: parsed.data, imagem };
}

export async function criarPresenteAdmin(form: FormData): Promise<ActionResult> {
  await exigirAdmin();
  const resultado = await processarFormPresente(form);
  if (!resultado.ok) return { ok: false, message: resultado.message };

  const criado = await criarPresente({ ...resultado.campos, imagem: resultado.imagem });
  if (!criado) return { ok: false, message: "Não foi possível criar o presente." };

  revalidarTudo();
  return { ok: true };
}

export async function salvarPresenteAdmin(id: string, form: FormData): Promise<ActionResult> {
  await exigirAdmin();
  if (!id) return { ok: false, message: "Presente inválido." };

  const resultado = await processarFormPresente(form);
  if (!resultado.ok) return { ok: false, message: resultado.message };

  const ok = await atualizarPresente(id, {
    nome: resultado.campos.nome,
    descricao: resultado.campos.descricao || null,
    categoria: resultado.campos.categoria || null,
    valor: resultado.campos.valor ?? null,
    status: (resultado.campos.status as StatusPresente | undefined) ?? undefined,
    // Só troca a imagem se um novo arquivo foi enviado.
    ...(resultado.imagem ? { imagem: resultado.imagem } : {}),
  });
  if (!ok) return { ok: false, message: "Não foi possível salvar." };

  revalidarTudo();
  return { ok: true };
}

export async function excluirPresenteAdmin(id: string): Promise<ActionResult> {
  await exigirAdmin();
  if (!id) return { ok: false, message: "Presente inválido." };

  const ok = await excluirPresente(id);
  if (!ok) return { ok: false, message: "Não foi possível excluir." };

  revalidarTudo();
  return { ok: true };
}
