import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script" });
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
});
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Thiago & Geovana · 24 de Outubro de 2026",
    template: "%s · Thiago & Geovana",
  },
  description:
    "Você recebeu um convite especial. Celebre conosco a união de Thiago e Geovana em 24 de outubro de 2026.",
  openGraph: {
    title: "Thiago & Geovana",
    description: "Você recebeu um convite especial para o nosso casamento.",
    url: SITE_URL,
    siteName: "Casamento Thiago & Geovana",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/brasao.png", width: 515, height: 485, alt: "Brasão G&T" }],
  },
  twitter: {
    card: "summary",
    title: "Thiago & Geovana",
    description: "Você recebeu um convite especial para o nosso casamento.",
    images: ["/brasao.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FCFCFA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${script.variable} ${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FCFCFA",
              border: "1px solid #EFE6D2",
              color: "#2F342B",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
