import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirConvidado } from "@/lib/session";
import { buscarConvidadoPorId } from "@/services/guests.service";
import { obterConfiguracao } from "@/services/config.service";
import { encerrarSessaoConvidado } from "@/lib/session";
import { Ornaments } from "@/components/shared/Ornaments";
import { BackButton } from "@/components/layout/BackButton";
import { Footer } from "@/components/layout/Footer";
import { RsvpForm } from "@/components/rsvp/RsvpForm";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export const metadata: Metadata = { title: "Confirmar presença" };

export default async function ConfirmarPage() {
  const sessao = await exigirConvidado();
  const [convidado, config] = await Promise.all([
    buscarConvidadoPorId(sessao.id),
    obterConfiguracao(),
  ]);
  if (!convidado) {
    await encerrarSessaoConvidado();
    redirect("/");
  }

  return (
    <>
      <BackButton />
      <main className="relative min-h-dvh overflow-x-clip">
        <Ornaments />
        <div className="relative z-10 mx-auto max-w-3xl px-6 pt-16">
          <AnimatedSection>
            <RsvpForm convidado={convidado} />
          </AnimatedSection>
          <Footer config={config} />
        </div>
      </main>
    </>
  );
}
