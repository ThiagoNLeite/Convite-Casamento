"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { exigirConvidado } from "@/lib/session";
import { buscarConvidadoPorId, salvarRsvp } from "@/services/guests.service";
import type { ActionResult } from "@/types";

const rsvpSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("confirmado"),
    quantidade_confirmada: z.coerce.number().int().min(1, "Mínimo 1 pessoa."),
    restricao_alimentar: z.string().max(500).optional(),
    observacoes: z.string().max(500).optional(),
  }),
  z.object({ status: z.literal("recusado") }),
]);

export type RsvpInput = z.input<typeof rsvpSchema>;

export async function confirmarPresenca(input: RsvpInput): Promise<ActionResult> {
  const sessao = await exigirConvidado();
  const parsed = rsvpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  if (parsed.data.status === "confirmado") {
    const convidado = await buscarConvidadoPorId(sessao.id);
    const limite = convidado?.quantidade_convites ?? 1;
    if (parsed.data.quantidade_confirmada > limite) {
      return {
        ok: false,
        message: `Seu convite dá direito a até ${limite} pessoa(s).`,
      };
    }
  }

  const salvo = await salvarRsvp(sessao.id, parsed.data);
  if (!salvo) return { ok: false, message: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/convite");
  revalidatePath("/confirmar");
  return { ok: true };
}
