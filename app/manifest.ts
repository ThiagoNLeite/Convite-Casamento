import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Casamento Thiago & Geovana",
    short_name: "T & G",
    description: "Convite para o casamento de Thiago e Geovana — 24 de outubro de 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFCFA",
    theme_color: "#FCFCFA",
    icons: [{ src: "/brasao.png", sizes: "515x485", type: "image/png" }],
  };
}
