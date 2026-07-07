export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/** Formata uma coluna DATE (YYYY-MM-DD) sem deslocamento de fuso. */
export function formatarDataLonga(data: string): string {
  const [ano, mes, dia] = data.split("T")[0].split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mes - 1, dia)));
}

/** Formata uma coluna TIME (HH:MM:SS) como HH:MM. */
export function formatarHora(hora: string): string {
  return hora.slice(0, 5);
}

/** Combina DATE + TIME em um ISO no fuso de Mato Grosso do Sul (UTC-4). */
export function combinarDataHora(data: string, hora: string): string {
  return `${data.split("T")[0]}T${hora || "00:00:00"}-04:00`;
}

export function primeiroNome(nomeCompleto: string): string {
  const nome = nomeCompleto.trim().split(/\s+/)[0] ?? "";
  return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
}

export function ultimosDigitos(telefone: string, quantidade = 4): string {
  return telefone.replace(/\D/g, "").slice(-quantidade);
}
