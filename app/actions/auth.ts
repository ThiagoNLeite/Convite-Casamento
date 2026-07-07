"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import {
  buscarConvidadoPorNome,
  possuiTelefone,
  telefoneConfere,
} from "@/services/guests.service";
import { criarSessaoConvidado, encerrarSessaoConvidado } from "@/lib/session";
import type { ActionResult } from "@/types";

const nomeSchema = z.string().trim().min(3, "Informe seu nome completo.");
const digitosSchema = z.string().regex(/^\d{4}$/, "Informe os 4 últimos dígitos do telefone.");

const MENSAGEM_NAO_ENCONTRADO =
  "Não encontramos seu nome na lista de convidados. Verifique se digitou o nome completo, exatamente como no convite.";

export async function verificarConvidado(
  nome: string,
): Promise<ActionResult<{ nome: string; exigeTelefone: boolean }>> {
  const parsed = nomeSchema.safeParse(nome);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const convidado = await buscarConvidadoPorNome(parsed.data);
  if (!convidado) return { ok: false, message: MENSAGEM_NAO_ENCONTRADO };

  return { ok: true, data: { nome: convidado.nome, exigeTelefone: possuiTelefone(convidado) } };
}

export async function entrarComTelefone(nome: string, digitos: string): Promise<ActionResult> {
  const parsedDigitos = digitosSchema.safeParse(digitos);
  if (!parsedDigitos.success) return { ok: false, message: parsedDigitos.error.issues[0].message };

  const convidado = await buscarConvidadoPorNome(nome);
  if (!convidado) return { ok: false, message: "Convidado não encontrado." };

  if (!telefoneConfere(convidado, parsedDigitos.data)) {
    return { ok: false, message: "Os dígitos não conferem. Tente novamente." };
  }

  await criarSessaoConvidado({ id: convidado.id, nome: convidado.nome });
  return { ok: true };
}

/** Entrada direta permitida apenas quando o convidado não possui telefone cadastrado. */
export async function entrarSemTelefone(nome: string): Promise<ActionResult> {
  const convidado = await buscarConvidadoPorNome(nome);
  if (!convidado) return { ok: false, message: MENSAGEM_NAO_ENCONTRADO };
  if (possuiTelefone(convidado)) {
    return { ok: false, message: "Confirme os dígitos do seu telefone para entrar." };
  }

  await criarSessaoConvidado({ id: convidado.id, nome: convidado.nome });
  return { ok: true };
}

export async function sair(): Promise<void> {
  await encerrarSessaoConvidado();
  redirect("/");
}
