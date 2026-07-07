import { redirect } from "next/navigation";
import { obterSessaoConvidado } from "@/lib/session";
import { WelcomeGate } from "@/components/auth/WelcomeGate";
import { Ornaments } from "@/components/shared/Ornaments";

export default async function HomePage() {
  const sessao = await obterSessaoConvidado();
  if (sessao) redirect("/convite");

  return (
    <main className="relative min-h-dvh">
      <Ornaments />
      <WelcomeGate />
    </main>
  );
}
