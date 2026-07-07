/**
 * Gera o payload "Pix copia e cola" (BR Code / EMV-MPM)
 * conforme especificação do Banco Central.
 */

function campo(id: string, valor: string): string {
  return `${id}${valor.length.toString().padStart(2, "0")}${valor}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function normalizar(texto: string, max: number): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim()
    .slice(0, max)
    .toUpperCase();
}

export interface DadosPix {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number;
  identificador?: string;
}

export function gerarPayloadPix({ chave, nome, cidade, valor, identificador }: DadosPix): string {
  const contaMerchant = campo("00", "br.gov.bcb.pix") + campo("01", chave);
  let payload =
    campo("00", "01") +
    campo("26", contaMerchant) +
    campo("52", "0000") +
    campo("53", "986") +
    (valor ? campo("54", valor.toFixed(2)) : "") +
    campo("58", "BR") +
    campo("59", normalizar(nome, 25)) +
    campo("60", normalizar(cidade, 15)) +
    campo("62", campo("05", (identificador ?? "***").slice(0, 25)));
  payload += "6304";
  return payload + crc16(payload);
}
