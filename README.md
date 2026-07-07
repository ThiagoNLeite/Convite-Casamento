# Casamento Thiago & Geovana 💍

Aplicação web do casamento: convite personalizado por convidado, confirmação de presença (RSVP), lista de presentes com Pix e painel administrativo.

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · Framer Motion · Supabase · React Hook Form · Zod · Sonner.

---

## 1. Como rodar na sua máquina

```bash
npm install     # instala as dependências (só na primeira vez)
npm run dev     # inicia em modo desenvolvimento
```

Abra **http://localhost:3000**. Qualquer arquivo que você salvar recarrega a página automaticamente.

Outros comandos:

```bash
npm run build   # gera a versão de produção (bom para checar erros antes do deploy)
npm start       # roda a versão de produção gerada pelo build
```

---

## 2. Variáveis de ambiente (arquivo `.env.local`)

O `.env.local` fica na raiz do projeto e **não vai para o Git** (está no `.gitignore`). Sempre que alterá-lo, **pare e rode `npm run dev` de novo**.

| Variável | O que é | Onde conseguir |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Endereço do seu projeto Supabase | Já preenchida |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública (respeita o RLS) | Já preenchida |
| `SUPABASE_SECRET_KEY` | **Chave secreta — preencha!** Usada só no servidor, ignora o RLS | Supabase → ⚙️ Project Settings → **API Keys** → aba *Secret keys* |
| `SESSION_SECRET` | Assina os cookies de sessão. Troque por qualquer texto longo e aleatório | Você inventa |
| `ADMIN_PASSWORD` | Senha da página `/admin` | Você escolhe |
| `NEXT_PUBLIC_SITE_URL` | Endereço final do site (usado no SEO) | A URL da Vercel após o deploy |

> ⚠️ **Importante**: o problema de "convidado não encontrado" mesmo com o nome certo quase sempre é o **RLS** do Supabase bloqueando a leitura com a chave pública. Preencher a `SUPABASE_SECRET_KEY` resolve (veja a seção 6).

---

## 3. Mapa da estrutura de pastas — "onde fica cada coisa?"

```
casamento/
│
├── app/                        ← AS PÁGINAS DO SITE (cada pasta = uma URL)
│   ├── layout.tsx              ← "moldura" de todas as páginas: fontes, SEO, toasts
│   ├── page.tsx                ← URL "/"           → tela "Você recebeu um convite especial"
│   ├── convite/page.tsx        ← URL "/convite"    → convite personalizado (hero, countdown)
│   ├── confirmar/page.tsx      ← URL "/confirmar"  → confirmação de presença
│   ├── presentes/page.tsx      ← URL "/presentes"  → lista de presentes
│   ├── admin/page.tsx          ← URL "/admin"      → login do painel
│   ├── admin/dashboard/page.tsx← URL "/admin/dashboard" → painel dos noivos
│   │
│   ├── actions/                ← SERVER ACTIONS: funções que GRAVAM no banco.
│   │   ├── auth.ts             ←   entrada do convidado (nome + 4 dígitos)
│   │   ├── rsvp.ts             ←   salvar confirmação de presença
│   │   ├── gifts.ts            ←   reservar presente / registrar Pix
│   │   └── admin.ts            ←   login do admin e edições do painel
│   │
│   ├── api/diagnostico/route.ts← 🩺 TESTE DE CONEXÃO COM O BANCO (seção 5)
│   ├── manifest.ts / robots.ts / sitemap.ts / icon.png  ← SEO e PWA
│   └── not-found.tsx           ← página 404
│
├── components/                 ← PEDAÇOS VISUAIS REUTILIZÁVEIS
│   ├── ui/                     ←   básicos: Button, Input, Dialog, Badge, Skeleton…
│   ├── shared/                 ←   Brasão, ornamentos dos cantos, divisor dourado, animação
│   ├── layout/                 ←   Footer e menu do convidado
│   ├── auth/WelcomeGate.tsx    ←   fluxo de entrada (boas-vindas → nome → 4 dígitos)
│   ├── home/                   ←   Hero (convite) e Countdown
│   ├── rsvp/RsvpForm.tsx       ←   formulário "Você poderá comparecer?"
│   ├── gifts/                  ←   GiftGrid (grade), GiftCard, GiftModal, PixPanel (QR Code)
│   └── admin/                  ←   login, cards de estatísticas, tabelas de edição
│
├── services/                   ← CONSULTAS AO BANCO (só leitura/escrita, sem visual)
│   ├── config.service.ts       ←   lê a tabela `configuracoes`
│   ├── guests.service.ts       ←   tudo de `convidados` (buscar, salvar RSVP, listar)
│   ├── gifts.service.ts        ←   tudo de `presentes` e `reservas_presentes`
│   └── admin.service.ts        ←   estatísticas do dashboard
│
├── lib/                        ← INFRAESTRUTURA
│   ├── supabase.ts             ←   ⭐ A CONEXÃO COM O BANCO (cliente do SDK oficial)
│   ├── session.ts              ←   cookies de sessão assinados (convidado e admin)
│   ├── constants.ts            ←   valores padrão (data, versículo) e nomes dos cookies
│   └── utils.ts                ←   helper `cn()` de classes do Tailwind
│
├── hooks/useCountdown.ts       ← contagem regressiva (atualiza a cada segundo)
├── types/database.ts           ← os TIPOS de cada tabela do banco (espelho do schema)
├── utils/format.ts             ← formatação de moeda, data, hora, primeiro nome
├── utils/pix.ts                ← gera o "Pix copia e cola" (padrão BR Code do Bacen)
├── styles/globals.css          ← estilos globais e tokens do Tailwind
├── public/                     ← imagens: brasao.png, folhas.png, ornamento.png
├── .env.local                  ← suas variáveis de ambiente (seção 2)
└── SCHEMA-ESPERADO.sql         ← anotações de como o código usa cada tabela
```

### Como o dado viaja (exemplo: confirmar presença)

```
Convidado clica "Confirmar presença"
   → components/rsvp/RsvpForm.tsx        (formulário, validação visual)
   → app/actions/rsvp.ts                 (roda NO SERVIDOR, valida com Zod)
   → services/guests.service.ts          (monta o UPDATE)
   → lib/supabase.ts                     (envia para o Supabase)
```

Regra do projeto: **componentes nunca falam direto com o banco**. Eles chamam uma *action*, que chama um *service*. Assim o navegador nunca grava nada diretamente.

### "Quero mudar X, onde mexo?"

| Quero mudar… | Arquivo |
|---|---|
| Textos/elementos do convite | `components/home/Hero.tsx` |
| Data, local, versículo, chave Pix | Tabela `configuracoes` no Supabase (o site lê de lá) |
| Cores (dourado, verde, fundo) | `tailwind.config.ts` → `theme.extend.colors` |
| Fontes | `app/layout.tsx` (imports do `next/font/google`) |
| Posição das folhas/arabescos | `components/shared/Ornaments.tsx` |
| Perguntas do RSVP | `components/rsvp/RsvpForm.tsx` + `app/actions/rsvp.ts` |
| Uma consulta ao banco | O service correspondente em `services/` |

---

## 4. As telas e o fluxo do convidado

1. **`/`** — "Você recebeu um convite especial" → botão **Entrar** → digita o **nome completo** (igual ao cadastrado na tabela `convidados`) → digita os **4 últimos dígitos do telefone**. Se o convidado não tiver telefone cadastrado (coluna vazia), entra só com o nome.
2. **`/convite`** — convite personalizado: "Olá, Fulano!", brasão, versículo, data/hora/local (com link do Google Maps se preenchido), countdown e botões.
3. **`/confirmar`** — Sim/Não; se sim: quantidade de pessoas (limitada ao `quantidade_convites` do convidado), restrição alimentar e observações.
4. **`/presentes`** — cards com busca e filtro por categoria; ao clicar: **Reservar** ou **Contribuir via Pix** (QR Code + copia e cola + "Já realizei o pagamento").
5. **`/admin`** — senha do `.env.local` → **`/admin/dashboard`** com estatísticas, listas, filtros, busca, **adicionar/editar/excluir** convidados e presentes, e **upload de imagem** do presente direto para o Storage (bucket `images`).

### Segurança do painel

O `/admin/dashboard` tem **duas camadas** de proteção:
1. `middleware.ts` (raiz do projeto) — verifica a assinatura do cookie de admin **antes** de qualquer renderização e redireciona para `/admin` se inválido.
2. `exigirAdmin()` dentro da própria página e de todas as actions do admin.

O login vale por **12 horas** (cookie assinado). Se você acessa a URL direto e o painel abre, é porque logou nas últimas 12h nesse navegador — teste numa janela anônima para ver o bloqueio. Na Vercel, **defina um `SESSION_SECRET` forte**: é ele que assina o cookie.

### Upload de imagens dos presentes

Ao cadastrar/editar um presente, escolha um arquivo (até 5 MB). Ele é enviado pelo servidor para o bucket **`images`** do Supabase Storage, na pasta `presentes/`. Requisitos:
- O bucket `images` precisa **existir** e estar marcado como **Public** (Storage → images → ⚙️ → *Public bucket*), senão as fotos não aparecem para os convidados.
- O upload usa a `SUPABASE_SECRET_KEY`, então não precisa de política de Storage.

---

## 5. 🩺 Como testar a conexão com o banco

### Teste rápido (recomendado)

Com o site rodando (`npm run dev`), abra no navegador:

```
http://localhost:3000/api/diagnostico
```

Você verá um JSON como este:

```json
{
  "url": "https://hgfmwqxzlxgupmcypsdg.supabase.co",
  "chave_em_uso": "secreta (ignora RLS — recomendada)",
  "configuracoes":      { "ok": true, "registros": 1 },
  "convidados":         { "ok": true, "registros": 3 },
  "presentes":          { "ok": true, "registros": 12 },
  "reservas_presentes": { "ok": true, "registros": 0 }
}
```

Como interpretar:

- **`"ok": true` com o nº de registros certo** → conexão e leitura funcionando. 🎉
- **`"ok": true` mas `"registros": 0`** em uma tabela que TEM dados → é o **RLS** bloqueando a chave pública (seção 6).
- **`"ok": false` com uma mensagem de erro** → a mensagem diz o problema (chave inválida, tabela inexistente etc.).

O código dessa rota está em `app/api/diagnostico/route.ts` — ela **só funciona em desenvolvimento** (em produção retorna 404, de propósito).

### Testar uma consulta específica

Os erros do Supabase agora aparecem no **terminal onde o `npm run dev` está rodando** (ex.: `[convidados] erro ao buscar por nome: ...`). Fique de olho nele enquanto usa o site.

Quer experimentar uma consulta sua? Edite temporariamente a rota de diagnóstico, por exemplo:

```ts
// dentro do GET em app/api/diagnostico/route.ts
const teste = await supabase
  .from("convidados")
  .select("*")
  .ilike("nome", "Thiago Leite");
resultado["teste_busca"] = teste.error ?? teste.data;
```

Salve, recarregue `http://localhost:3000/api/diagnostico` e veja o resultado.

---

## 6. RLS — por que "convidado não encontrado" com o nome certo?

O Supabase tem o **RLS (Row Level Security)**: quando ativado numa tabela, **nenhuma linha é retornada** para a chave pública até você criar políticas de acesso. O código não recebe um erro — recebe uma **lista vazia**, e por isso a tela dizia que o convidado não existe.

Duas formas de resolver (escolha UMA):

**Opção A — chave secreta (recomendada, já suportada pelo código)**
1. Supabase → ⚙️ **Project Settings** → **API Keys** → copie a **secret key**.
2. Cole no `.env.local`: `SUPABASE_SECRET_KEY=sb_secret_...`
3. Reinicie o `npm run dev`. Na Vercel, cadastre a mesma variável.

Como todas as consultas rodam no servidor (`lib/supabase.ts` nunca é enviado ao navegador), a chave fica protegida e ignora o RLS.

**Opção B — políticas de RLS** (se preferir manter só a chave pública), rode no SQL Editor:

```sql
ALTER TABLE configuracoes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE convidados         ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas_presentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura publica"  ON configuracoes      FOR SELECT USING (true);
CREATE POLICY "leitura publica"  ON convidados         FOR SELECT USING (true);
CREATE POLICY "edicao publica"   ON convidados         FOR UPDATE USING (true);
CREATE POLICY "leitura publica"  ON presentes          FOR SELECT USING (true);
CREATE POLICY "edicao publica"   ON presentes          FOR UPDATE USING (true);
CREATE POLICY "leitura publica"  ON reservas_presentes FOR SELECT USING (true);
CREATE POLICY "insercao publica" ON reservas_presentes FOR INSERT WITH CHECK (true);
```

> A opção A é mais segura na prática: com a B, qualquer pessoa com a chave pública (que é visível no navegador) conseguiria ler/alterar essas tabelas por fora do site.

---

## 7. Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| "Convidado não encontrado" com nome certo | RLS bloqueando a leitura | Seção 6 (preencher `SUPABASE_SECRET_KEY`) |
| Upload de imagem falha | Bucket ausente/privado | Crie o bucket `images` no Storage e marque como público |
| Consigo abrir /admin/dashboard "sem logar" | Cookie de 12h de um login anterior | Teste em janela anônima; o middleware bloqueia sem cookie válido |
| Erro de *hydration* no console citando `data-lt-installed` | **Extensão do navegador** (LanguageTool, Grammarly…) altera a página antes do React carregar | Já tratado com `suppressHydrationWarning` no `app/layout.tsx`. Para confirmar, teste numa janela anônima sem extensões |
| Imagem de presente não aparece | URL fora do bucket liberado | A URL deve ser do Storage do seu projeto (bucket `images`, público). Outros domínios: adicionar em `next.config.ts` → `images.remotePatterns` |
| Mudei o `.env.local` e nada aconteceu | Env só é lido na inicialização | Pare (Ctrl+C) e rode `npm run dev` de novo |
| Countdown com hora errada | Fuso do evento | O alvo é montado em UTC-4 (MS) em `utils/format.ts` → `combinarDataHora()` |

---

## 8. Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em https://vercel.com → **Add New Project** → importe o repositório (a Vercel detecta Next.js sozinha).
3. Em **Settings → Environment Variables**, cadastre TODAS as variáveis da seção 2 (inclusive `SUPABASE_SECRET_KEY`).
4. Deploy. Depois, atualize `NEXT_PUBLIC_SITE_URL` com a URL final e faça um *redeploy*.

---

## 9. Tabelas não utilizadas

`mensagens` (mural de recados) e `galeria` (fotos) existem no banco mas não têm tela — essas funcionalidades não foram solicitadas. O schema já suporta caso queira adicioná-las depois.
