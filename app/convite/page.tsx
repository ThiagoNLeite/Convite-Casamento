import type { Metadata } from "next";
import { exigirConvidado } from "@/lib/session";
import { obterConfiguracao } from "@/services/config.service";
import { Ornaments } from "@/components/shared/Ornaments";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";

export const metadata: Metadata = { title: "Seu convite" };

export default async function ConvitePage() {
  const sessao = await exigirConvidado();
  const config = await obterConfiguracao();

  return (
    <>
      <main className="relative min-h-dvh overflow-x-clip">
        <Ornaments />
        <div className="relative z-10 mx-auto max-w-3xl pb-6">
          <Hero config={config} nomeConvidado={sessao.nome} />
          <Footer config={config} />
        </div>
      </main>
    </>
  );
}
