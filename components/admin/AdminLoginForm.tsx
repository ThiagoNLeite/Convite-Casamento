"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { entrarAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brasao } from "@/components/shared/Brasao";

export function AdminLoginForm() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const res = await entrarAdmin(senha);
    setCarregando(false);
    if (!res.ok) {
      toast.error(res.message ?? "Senha incorreta.");
      return;
    }
    router.replace("/admin/dashboard");
  }

  return (
    <form
      onSubmit={entrar}
      className="mx-auto flex min-h-dvh w-full max-w-xs flex-col items-center justify-center px-6 text-center"
    >
      <Brasao className="w-24" />
      <h1 className="mt-6 font-serif text-lg uppercase tracking-widest2">Painel dos noivos</h1>
      <div className="mt-8 w-full text-left">
        <Label htmlFor="senha" className="text-center">
          Senha de acesso
        </Label>
        <Input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </div>
      <Button type="submit" loading={carregando} className="mt-6 w-full">
        <Lock className="h-4 w-4" aria-hidden /> Entrar
      </Button>
    </form>
  );
}
