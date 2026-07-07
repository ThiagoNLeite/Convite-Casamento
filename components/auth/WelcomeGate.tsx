"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { entrarComTelefone, entrarSemTelefone, verificarConvidado } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brasao } from "@/components/shared/Brasao";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { primeiroNome } from "@/utils/format";

type Etapa = "boas-vindas" | "nome" | "telefone";

const nomeSchema = z.object({ nome: z.string().trim().min(3, "Informe seu nome completo.") });
const telefoneSchema = z.object({
  digitos: z.string().regex(/^\d{4}$/, "Digite exatamente 4 números."),
});

const transicao = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function WelcomeGate() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("boas-vindas");
  const [nomeConfirmado, setNomeConfirmado] = useState("");
  const [erroBusca, setErroBusca] = useState<string | null>(null);

  const formNome = useForm<z.infer<typeof nomeSchema>>({ resolver: zodResolver(nomeSchema) });
  const formTelefone = useForm<z.infer<typeof telefoneSchema>>({
    resolver: zodResolver(telefoneSchema),
  });

  async function buscarNome({ nome }: z.infer<typeof nomeSchema>) {
    setErroBusca(null);
    const resultado = await verificarConvidado(nome);
    if (!resultado.ok || !resultado.data) {
      setErroBusca(resultado.message ?? "Convidado não encontrado.");
      return;
    }
    setNomeConfirmado(resultado.data.nome);

    // Convidado sem telefone cadastrado entra direto após o nome.
    if (!resultado.data.exigeTelefone) {
      const entrada = await entrarSemTelefone(resultado.data.nome);
      if (!entrada.ok) {
        setErroBusca(entrada.message ?? "Não foi possível entrar.");
        return;
      }
      toast.success(`Bem-vindo(a), ${primeiroNome(resultado.data.nome)}!`);
      router.replace("/convite");
      return;
    }

    setEtapa("telefone");
  }

  async function validarTelefone({ digitos }: z.infer<typeof telefoneSchema>) {
    const resultado = await entrarComTelefone(nomeConfirmado, digitos);
    if (!resultado.ok) {
      toast.error(resultado.message ?? "Não foi possível entrar.");
      return;
    }
    toast.success(`Bem-vindo(a), ${primeiroNome(nomeConfirmado)}!`);
    router.replace("/convite");
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <AnimatePresence mode="wait">
        {etapa === "boas-vindas" && (
          <motion.div key="boas-vindas" {...transicao} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Brasao priority />
            </motion.div>
            <GoldDivider className="mt-8" />
            <h1 className="mt-8 font-serif text-2xl font-light uppercase tracking-widest2 text-ink sm:text-3xl">
              Você recebeu
              <br />
              um convite especial
            </h1>
            <p className="mt-4 max-w-xs font-sans text-sm font-light text-moss">
              Identifique-se para abrir seu convite personalizado.
            </p>
            <Button className="mt-10" onClick={() => setEtapa("nome")}>
              Entrar
            </Button>
          </motion.div>
        )}

        {etapa === "nome" && (
          <motion.form
            key="nome"
            {...transicao}
            onSubmit={formNome.handleSubmit(buscarNome)}
            className="w-full max-w-sm"
            noValidate
          >
            <Brasao className="mx-auto w-28 sm:w-32" />
            <h2 className="mt-8 font-serif text-xl font-light uppercase tracking-widest2">
              Quem é você?
            </h2>
            <div className="mt-8 text-left">
              <Label htmlFor="nome" className="text-center">
                Nome completo
              </Label>
              <Input
                id="nome"
                autoComplete="name"
                autoFocus
                placeholder="Como está no convite"
                aria-invalid={!!formNome.formState.errors.nome || !!erroBusca}
                {...formNome.register("nome")}
              />
              {formNome.formState.errors.nome && (
                <p role="alert" className="mt-2 text-center text-xs text-red-700">
                  {formNome.formState.errors.nome.message}
                </p>
              )}
              {erroBusca && (
                <p role="alert" className="mt-3 rounded-xl bg-gold-pale/60 px-4 py-3 text-center font-sans text-xs leading-relaxed text-ink/80">
                  {erroBusca}
                </p>
              )}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button type="submit" loading={formNome.formState.isSubmitting} className="w-full">
                Continuar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEtapa("boas-vindas")}>
                Voltar
              </Button>
            </div>
          </motion.form>
        )}

        {etapa === "telefone" && (
          <motion.form
            key="telefone"
            {...transicao}
            onSubmit={formTelefone.handleSubmit(validarTelefone)}
            className="w-full max-w-sm"
            noValidate
          >
            <Brasao className="mx-auto w-28 sm:w-32" />
            <h2 className="mt-8 font-script text-4xl text-ink">
              Olá, {primeiroNome(nomeConfirmado)}!
            </h2>
            <p className="mt-3 font-sans text-sm font-light text-moss">
              Para sua segurança, confirme os últimos quatro dígitos do seu telefone.
            </p>
            <div className="mt-8 text-left">
              <Label htmlFor="digitos" className="text-center">
                Últimos 4 dígitos
              </Label>
              <Input
                id="digitos"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                placeholder="••••"
                className="tracking-[0.5em]"
                aria-invalid={!!formTelefone.formState.errors.digitos}
                {...formTelefone.register("digitos")}
              />
              {formTelefone.formState.errors.digitos && (
                <p role="alert" className="mt-2 text-center text-xs text-red-700">
                  {formTelefone.formState.errors.digitos.message}
                </p>
              )}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button type="submit" loading={formTelefone.formState.isSubmitting} className="w-full">
                Abrir meu convite
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEtapa("nome")}>
                Voltar
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
