"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { exigirConvidado } from "@/lib/session";
import { registrarContribuicaoPix, reservarPresente } from "@/services/gifts.service";
import type { ActionResult } from "@/types";

const idSchema = z.string().min(1);
const valorSchema = z.coerce.number().positive("Informe um valor válido.");

export async function reservar(presenteId: string): Promise<ActionResult> {
  const sessao = await exigirConvidado();
  const parsed = idSchema.safeParse(presenteId);
  if (!parsed.success) return { ok: false, message: "Presente inválido." };

  const ok = await reservarPresente(parsed.data, sessao.id);
  if (!ok) return { ok: false, message: "Não foi possível reservar. Tente novamente." };

  revalidatePath("/presentes");
  return { ok: true };
}

export async function confirmarPix(presenteId: string, valor: number): Promise<ActionResult> {
  const sessao = await exigirConvidado();
  const parsedId = idSchema.safeParse(presenteId);
  const parsedValor = valorSchema.safeParse(valor);
  if (!parsedId.success || !parsedValor.success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const ok = await registrarContribuicaoPix(parsedId.data, sessao.id, parsedValor.data);
  if (!ok) return { ok: false, message: "Não foi possível registrar. Tente novamente." };

  revalidatePath("/presentes");
  return { ok: true };
}
