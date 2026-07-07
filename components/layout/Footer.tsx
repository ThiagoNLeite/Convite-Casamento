import { GoldDivider } from "@/components/shared/GoldDivider";
import type { Configuracao } from "@/types";

function dataCurta(data: string): string {
  const [ano, mes, dia] = data.split("T")[0].split("-");
  return `${dia} · ${mes} · ${ano}`;
}

export function Footer({ config }: { config: Configuracao }) {
  return (
    <footer className="relative z-10 mt-24 pb-10 text-center">
      <GoldDivider className="mb-6" />
      <p className="font-script text-3xl text-ink">
        {config.nome_noiva} <span className="text-gold">&amp;</span> {config.nome_noivo}
      </p>
      <p className="mt-2 font-serif text-xs uppercase tracking-widest2 text-moss">
        {dataCurta(config.data_casamento)}
      </p>
    </footer>
  );
}
