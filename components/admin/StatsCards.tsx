import { Card } from "@/components/ui/card";
import { formatarMoeda } from "@/utils/format";
import type { EstatisticasAdmin } from "@/types";

export function StatsCards({ estatisticas }: { estatisticas: EstatisticasAdmin }) {
  const itens = [
    { rotulo: "Convidados", valor: estatisticas.totalConvidados },
    { rotulo: "Confirmados", valor: estatisticas.confirmados, cor: "text-moss" },
    { rotulo: "Pendentes", valor: estatisticas.pendentes, cor: "text-gold" },
    { rotulo: "Recusados", valor: estatisticas.recusados, cor: "text-red-700" },
    { rotulo: "Presentes", valor: estatisticas.totalPresentes },
    { rotulo: "Reservados", valor: estatisticas.presentesReservados, cor: "text-moss" },
    { rotulo: "Recebido via Pix", valor: formatarMoeda(estatisticas.valorPix), cor: "text-gold", largo: true },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {itens.map((item) => (
        <Card key={item.rotulo} className={`p-4 ${item.largo ? "col-span-2" : ""}`}>
          <dt className="font-sans text-[10px] uppercase tracking-widest text-sage">{item.rotulo}</dt>
          <dd className={`mt-1 font-serif text-2xl tabular-nums ${item.cor ?? "text-ink"}`}>
            {item.valor}
          </dd>
        </Card>
      ))}
    </dl>
  );
}
