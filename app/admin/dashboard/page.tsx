import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { exigirAdmin } from "@/lib/session";
import { sairAdmin } from "@/app/actions/admin";
import { obterDadosAdmin } from "@/services/admin.service";
import { StatsCards } from "@/components/admin/StatsCards";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { obterConfiguracao } from "@/services/config.service";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await exigirAdmin();
  const [{ estatisticas, convidados, presentes }, config] = await Promise.all([
    obterDadosAdmin(),
    obterConfiguracao(),
  ]);

  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Painel do casamento</p>
          <h1 className="mt-1 font-script text-4xl text-ink">
            {config.nome_noiva} <span className="text-gold">&amp;</span> {config.nome_noivo}
          </h1>
        </div>
        <form action={sairAdmin}>
          <button
            type="submit"
            aria-label="Sair do painel"
            className="rounded-full p-2.5 text-moss transition-colors hover:bg-mist hover:text-ink"
          >
            <LogOut className="h-5 w-5" aria-hidden />
          </button>
        </form>
      </header>

      <div className="mt-8">
        <StatsCards estatisticas={estatisticas} />
      </div>

      <div className="mt-10">
        <AdminTabs convidados={convidados} presentes={presentes} />
      </div>
    </main>
  );
}
