import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN } from "@/lib/constants";

const encoder = new TextEncoder();

function base64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Valida assinatura HMAC-SHA256 e o conteúdo `{ admin: true }` do cookie. */
async function sessaoAdminValida(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return false;

  const chave = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.SESSION_SECRET ?? "dev-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const esperada = base64url(await crypto.subtle.sign("HMAC", chave, encoder.encode(payload)));
  if (esperada !== assinatura) return false;

  try {
    const dados = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return dados?.admin === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const valida = await sessaoAdminValida(request.cookies.get(COOKIE_ADMIN)?.value);
  if (!valida) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/dashboard/:path*"] };
