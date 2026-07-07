import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { COOKIE_ADMIN, COOKIE_CONVIDADO } from "./constants";
import type { SessaoConvidado } from "@/types";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret";
const UM_ANO = 60 * 60 * 24 * 365;

function assinar(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function selar(dados: object): string {
  const payload = Buffer.from(JSON.stringify(dados)).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

function abrir<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;
  const esperada = assinar(payload);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

export async function criarSessaoConvidado(sessao: SessaoConvidado) {
  (await cookies()).set(COOKIE_CONVIDADO, selar(sessao), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: UM_ANO,
    path: "/",
  });
}

export async function obterSessaoConvidado(): Promise<SessaoConvidado | null> {
  return abrir<SessaoConvidado>((await cookies()).get(COOKIE_CONVIDADO)?.value);
}

/** Redireciona para a home caso não exista sessão de convidado. */
export async function exigirConvidado(): Promise<SessaoConvidado> {
  const sessao = await obterSessaoConvidado();
  if (!sessao) redirect("/");
  return sessao;
}

export async function encerrarSessaoConvidado() {
  (await cookies()).delete(COOKIE_CONVIDADO);
}

export async function criarSessaoAdmin() {
  (await cookies()).set(COOKIE_ADMIN, selar({ admin: true }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
}

export async function ehAdmin(): Promise<boolean> {
  return abrir<{ admin: boolean }>((await cookies()).get(COOKIE_ADMIN)?.value)?.admin === true;
}

export async function exigirAdmin() {
  if (!(await ehAdmin())) redirect("/admin");
}

export async function encerrarSessaoAdmin() {
  (await cookies()).delete(COOKIE_ADMIN);
}
