"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, HeartCrack, PartyPopper } from "lucide-react";
import { confirmarPresenca } from "@/app/actions/rsvp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { primeiroNome } from "@/utils/format";
import type { Convidado } from "@/types";

function criarSchema(limite: number) {
  return z.object({
    quantidade_confirmada: z.coerce
      .number()
      .int()
      .min(1, "Mínimo 1 pessoa.")
      .max(limite, `Seu convite dá direito a até ${limite} pessoa(s).`),
    restricao_alimentar: z.string().max(500).optional(),
    observacoes: z.string().max(500).optional(),
  });
}
const schema = criarSchema(1);
type FormData = z.infer<typeof schema>;

type Resultado = "confirmado" | "recusado" | null;

export function RsvpForm({ convidado }: { convidado: Convidado }) {
  const [resposta, setResposta] = useState<"sim" | "nao" | null>(null);
  const [resultado, setResultado] = useState<Resultado>(
    convidado.status === "confirmado" || convidado.status === "recusado" ? convidado.status : null,
  );
  const [recusando, setRecusando] = useState(false);

  const limite = Math.max(1, convidado.quantidade_convites ?? 1);
  const form = useForm<FormData>({
    resolver: zodResolver(criarSchema(limite)),
    defaultValues: {
      quantidade_confirmada: Math.min(convidado.quantidade_confirmada ?? limite, limite),
      restricao_alimentar: convidado.restricao_alimentar ?? "",
      observacoes: convidado.observacoes ?? "",
    },
  });

  async function confirmar(dados: FormData) {
    const res = await confirmarPresenca({ status: "confirmado", ...dados });
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível confirmar.");
      return;
    }
    toast.success("Presença confirmada!");
    setResultado("confirmado");
  }

  async function recusar() {
    setRecusando(true);
    const res = await confirmarPresenca({ status: "recusado" });
    setRecusando(false);
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível salvar.");
      return;
    }
    setResultado("recusado");
  }

  const nome = primeiroNome(convidado.nome);

  if (resultado === "confirmado") {
    return (
      <TelaFinal
        icone={<PartyPopper className="h-8 w-8 text-gold" aria-hidden />}
        titulo={`Obrigado, ${nome}!`}
        mensagem="Sua presença foi confirmada. Estamos ansiosos para celebrar este momento com você."
        aoRefazer={() => setResultado(null)}
      />
    );
  }

  if (resultado === "recusado") {
    return (
      <TelaFinal
        icone={<HeartCrack className="h-8 w-8 text-moss" aria-hidden />}
        titulo={`Sentiremos sua falta, ${nome}.`}
        mensagem="Obrigado por nos avisar. Você continuará em nossos corações neste dia tão especial."
        aoRefazer={() => setResultado(null)}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <h1 className="font-serif text-2xl font-light uppercase tracking-widest2">
        Você poderá
        <br />
        comparecer?
      </h1>
      <GoldDivider className="mt-6" />

      <div className="mt-8 flex justify-center gap-3" role="group" aria-label="Resposta de presença">
        <Button
          variant={resposta === "sim" ? "gold" : "outline"}
          onClick={() => setResposta("sim")}
          aria-pressed={resposta === "sim"}
        >
          <Check className="h-4 w-4" aria-hidden /> Sim
        </Button>
        <Button
          variant={resposta === "nao" ? "primary" : "outline"}
          onClick={() => setResposta("nao")}
          aria-pressed={resposta === "nao"}
          loading={recusando}
        >
          Não
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {resposta === "sim" && (
          <motion.form
            key="form-sim"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={form.handleSubmit(confirmar)}
            className="overflow-hidden text-left"
            noValidate
          >
            <div className="mt-10">
              <Label htmlFor="quantidade">Quantidade de pessoas</Label>
              <Input
                id="quantidade"
                type="number"
                inputMode="numeric"
                min={1}
                max={limite}
                aria-invalid={!!form.formState.errors.quantidade_confirmada}
                aria-describedby="limite-convite"
                {...form.register("quantidade_confirmada")}
              />
              <p id="limite-convite" className="mt-2 text-center font-sans text-xs text-moss">
                Seu convite dá direito a até {limite} pessoa(s).
              </p>
              {form.formState.errors.quantidade_confirmada && (
                <p role="alert" className="mt-2 text-xs text-red-700">
                  {form.formState.errors.quantidade_confirmada.message}
                </p>
              )}
            </div>
            <div className="mt-6">
              <Label htmlFor="restricoes">Restrições alimentares</Label>
              <Textarea
                id="restricoes"
                placeholder="Alergias, vegetarianismo… (opcional)"
                {...form.register("restricao_alimentar")}
              />
            </div>
            <div className="mt-6">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Algo que gostaria de nos contar? (opcional)"
                {...form.register("observacoes")}
              />
            </div>
            <Button type="submit" loading={form.formState.isSubmitting} className="mt-8 w-full">
              Confirmar presença
            </Button>
          </motion.form>
        )}

        {resposta === "nao" && (
          <motion.div
            key="confirmar-nao"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            <p className="font-sans text-sm font-light text-moss">
              Tem certeza? Para confirmar que não poderá comparecer, toque novamente em{" "}
              <button
                type="button"
                onClick={recusar}
                className="font-medium text-ink underline decoration-gold underline-offset-4"
              >
                não poderei ir
              </button>
              .
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TelaFinal({
  icone,
  titulo,
  mensagem,
  aoRefazer,
}: {
  icone: React.ReactNode;
  titulo: string;
  mensagem: string;
  aoRefazer: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-md flex-col items-center text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-pale/60">
        {icone}
      </div>
      <h1 className="mt-6 font-script text-4xl text-ink">{titulo}</h1>
      <GoldDivider className="mt-5" />
      <p className="mt-5 max-w-xs font-sans text-sm font-light leading-relaxed text-moss">
        {mensagem}
      </p>
      <Button variant="ghost" size="sm" className="mt-8" onClick={aoRefazer}>
        Alterar minha resposta
      </Button>
    </motion.div>
  );
}
