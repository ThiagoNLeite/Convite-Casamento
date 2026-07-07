"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { confirmarPix } from "@/app/actions/gifts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gerarPayloadPix } from "@/utils/pix";
import { formatarMoeda } from "@/utils/format";
import { CIDADE_PIX } from "@/lib/constants";
import type { Configuracao, Presente } from "@/types";

interface PixPanelProps {
  presente: Presente;
  config: Configuracao;
  aoConcluir: () => void;
}

export function PixPanel({ presente, config, aoConcluir }: PixPanelProps) {
  const [valor, setValor] = useState<number>(presente.valor ?? 0);
  const [enviando, setEnviando] = useState(false);

  /**
   * Prioridade: payload pronto em `qr_code_pix` (quando não for URL de imagem);
   * caso contrário, gera o BR Code a partir da chave, com o valor escolhido.
   */
  const payload = useMemo(() => {
    if (config.qr_code_pix && !config.qr_code_pix.startsWith("http")) {
      return config.qr_code_pix;
    }
    if (!config.chave_pix) return null;
    return gerarPayloadPix({
      chave: config.chave_pix,
      nome: config.favorecido_pix ?? `${config.nome_noiva} e ${config.nome_noivo}`,
      cidade: CIDADE_PIX,
      valor: valor > 0 ? valor : undefined,
      identificador: "CASAMENTOGT",
    });
  }, [config, valor]);

  async function copiar(texto: string, rotulo: string) {
    await navigator.clipboard.writeText(texto);
    toast.success(`${rotulo} copiado!`);
  }

  async function jaPaguei() {
    if (!valor || valor <= 0) {
      toast.error("Informe o valor da contribuição.");
      return;
    }
    setEnviando(true);
    const res = await confirmarPix(presente.id, valor);
    setEnviando(false);
    if (!res.ok) {
      toast.error(res.message ?? "Não foi possível registrar.");
      return;
    }
    toast.success("Contribuição registrada. Muito obrigado!");
    aoConcluir();
  }

  if (!payload) {
    return (
      <p className="mt-6 rounded-xl bg-mist px-4 py-3 text-center font-sans text-sm text-moss">
        A chave Pix ainda não foi configurada. Fale com os noivos.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="w-full max-w-[180px]">
        <Label htmlFor="valor-pix" className="text-center">
          Valor da contribuição
        </Label>
        <Input
          id="valor-pix"
          type="number"
          inputMode="decimal"
          min={1}
          step="0.01"
          value={valor || ""}
          onChange={(e) => setValor(Number(e.target.value))}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gold-pale bg-white p-4" aria-label="QR Code Pix">
        <QRCodeSVG value={payload} size={180} bgColor="#FFFFFF" fgColor="#2F342B" />
      </div>
      <p className="mt-3 font-sans text-xs text-moss">
        Escaneie para contribuir com {formatarMoeda(valor || 0)}
        {config.banco_pix ? ` · ${config.banco_pix}` : ""}
      </p>

      <div className="mt-5 grid w-full gap-2">
        <Button variant="outline" size="sm" onClick={() => copiar(payload, "Código Pix")}>
          <Copy className="h-3.5 w-3.5" aria-hidden /> Copiar Pix copia e cola
        </Button>
        {config.chave_pix && (
          <Button variant="ghost" size="sm" onClick={() => copiar(config.chave_pix!, "Chave Pix")}>
            Chave: {config.chave_pix}
          </Button>
        )}
      </div>

      <Button variant="gold" className="mt-6 w-full" loading={enviando} onClick={jaPaguei}>
        Já realizei o pagamento
      </Button>
    </div>
  );
}
