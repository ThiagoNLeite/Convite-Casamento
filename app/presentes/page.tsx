import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirConvidado } from "@/lib/session";
import { listarPresentes } from "@/services/gifts.service";
import { obterConfiguracao } from "@/services/config.service";
import { Ornaments } from "@/components/shared/Ornaments";
import { BackButton } from "@/components/layout/BackButton";
import { Footer } from "@/components/layout/Footer";
import { GiftGrid } from "@/components/gifts/GiftGrid";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Skeleton } from "@/components/ui/skeleton";
import type { Configuracao } from "@/types";

export const metadata: Metadata = { title: "Lista de presentes" };

function GiftsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4]" />
      ))}
    </div>
  );
}

async function Gifts({ config }: { config: Configuracao }) {
  const presentes = await listarPresentes();
  if (presentes.length === 0) {
    return (
      <p className="text-center font-sans text-sm font-light text-moss">
        A lista de presentes ainda está sendo preparada com carinho. Volte em breve!
      </p>
    );
  }
  return <GiftGrid presentes={presentes} config={config} />;
}

export default async function PresentesPage() {
  await exigirConvidado();
  const config = await obterConfiguracao();

  return (
    <>
      <BackButton />
      <main className="relative min-h-dvh overflow-x-clip">
        <Ornaments />
        <div className="relative z-10 mx-auto max-w-5xl px-5 pt-14">
          <AnimatedSection className="text-center">
            <h1 className="font-serif text-2xl font-light uppercase tracking-widest2">
              Lista de presentes
            </h1>
            <GoldDivider className="mt-5" />
            <p className="mx-auto mt-5 max-w-md font-sans text-sm font-light leading-relaxed text-moss">
              Sua presença é o nosso maior presente. Mas, se quiser nos mimar, escolha algo da lista
              ou contribua via Pix.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <Suspense fallback={<GiftsSkeleton />}>
              <Gifts config={config} />
            </Suspense>
          </div>
          <Footer config={config} />
        </div>
      </main>
    </>
  );
}
