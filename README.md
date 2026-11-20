# Rift Payload Demo

Et lille, kørbart eksempel på den stak, vi bygger på: **Payload CMS 3** oven på **Next.js 16** og **React 19**, med SQLite som database.

Demoen viser fire ting:

1. Hvordan en redaktør opdaterer tekster og billeder i admin-panelet
2. Hvordan en redaktør styrer SEO: meta-tags, Open Graph, sitemap og structured data (JSON-LD)
3. Hvordan en udvikler tilføjer en ny tabel til databasen
4. Hvordan en udvikler laver et API-endpoint, der henter og filtrerer rækker fra den tabel

Punkt 1 og 2 kan du prøve med det samme i admin-panelet. Punkt 3 og 4 kommer i næste commit, se [git-historikken](#git-historikken).

## Kom i gang

**Krav:** Node.js 22 eller nyere (24 anbefales) og pnpm 10. Har du ikke pnpm, så kør `corepack enable` (følger med Node) eller `npm install -g pnpm`.

```bash
git clone https://github.com/Rift-IT/rift-payload-demo.git
cd rift-payload-demo
pnpm install
pnpm dev
```

Åbn derefter:

| Hvad          | URL                               |
| ------------- | --------------------------------- |
| Hjemmesiden   | http://localhost:3000             |
| Admin-panelet | http://localhost:3000/admin       |
| REST API      | http://localhost:3000/api/pages   |
| Sitemap       | http://localhost:3000/sitemap.xml |

**Login til admin:** `demo@therift.dev` / `demo1234`. Felterne er udfyldt på forhånd, så du skal bare klikke **Login**.

Der er ingen `.env`-fil eller database at sætte op. Ved første start opretter projektet selv SQLite-filen `demo.db`, demo-brugeren og et par sider med indhold. Første sidevisning tager et par sekunder, fordi Next.js kompilerer.

Vil du starte forfra med frisk demo-data, så stop serveren og kør `pnpm reset`.

## 1. Tekster og billeder

Gå til **Content → Pages** og åbn **Forside** eller **Om os**.

- Sider bygges af blokke: **Hero**, **Content** (rich text) og **Media block** (billede). Blokkene kan tilføjes, flyttes og slettes.
- Billeder uploades direkte i blokken eller under **Content → Media**. Payload laver automatisk thumbnails og OG-størrelser og respekterer det valgte fokuspunkt.
- Ændringer gemmes som kladde (autosave). Med øje-ikonet kan du se et live preview. Når du klikker **Publish changes**, opdateres hjemmesiden med det samme.
- Under **Versions** ligger historikken, og du kan rulle tilbage til en tidligere version.

## 2. SEO

Gå til **Marketing → SEO**. Hver side får automatisk en SEO-entry, første gang den publiceres.

| Felt                      | Ender som                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| URL                       | Sidens adresse. Ændres den, oprettes der automatisk et 301-redirect fra den gamle URL.           |
| Meta title / description  | `<title>` og `<meta name="description">`                                                         |
| OG image                  | Open Graph-billedet, der vises ved deling på sociale medier                                      |
| Structured data (JSON-LD) | `<script type="application/ld+json">` på siden, f.eks. Schema.org `Organization` eller `Product` |
| noindex / nofollow        | `<meta name="robots">`. noindex fjerner også siden fra sitemap.xml.                              |

Forsiden har allerede meta-data og et JSON-LD-eksempel. Se kildekoden på http://localhost:3000 for at se resultatet. Redirects kan også oprettes manuelt under **Marketing → Redirects**.

## API

Payload laver automatisk et REST API (og GraphQL på `/api/graphql`) for alle collections, med filtrering, sortering, paginering og adgangskontrol. Prøv f.eks.:

```bash
# Alle publicerede sider, kun titel og slug
curl -g "http://localhost:3000/api/pages?select[title]=true&select[slug]=true"

# Filtrering med where
curl -g "http://localhost:3000/api/pages?where[slug][equals]=om-os&depth=0"
```

## Projektstruktur

```
src/
  payload.config.ts   Hele CMS'et: collections, database, admin, seed
  env.ts              Konfiguration med demo-standardværdier (kan overskrives via .env)
  db.ts               Database-adapteren (SQLite), med en lille rettelse til en drizzle-kit-fejl
  collections/        Tabeller i databasen: Pages, Media, Categories, SeoEntries, Redirects, Users ...
  blocks/             Side-blokke (config + React-komponent) og RenderBlocks
  access/             Adgangsregler (admin/editor-roller)
  seed/               Demo-data, der oprettes ved første start
  app/(frontend)/     Hjemmesiden: sider, sitemap.xml, preview
  app/(payload)/      Admin-panel og API-routes (genereret af Payload)
  components/admin/   Branding og dashboard-widget til admin-panelet
  utilities/          Opslag af sider, SEO-data og redirects
```

## Scripts

| Kommando                    | Hvad den gør                                                        |
| --------------------------- | ------------------------------------------------------------------- |
| `pnpm dev`                  | Starter Next.js og Payload i udviklingstilstand                     |
| `pnpm build` / `pnpm start` | Produktions-build og -server                                        |
| `pnpm reset`                | Sletter den lokale database og uploads, så næste start seeder på ny |
| `pnpm typecheck`            | TypeScript-tjek                                                     |
| `pnpm generate:types`       | Genererer `src/payload-types.ts` ud fra collections                 |
| `pnpm generate:importmap`   | Genererer admin-panelets import map (efter nye custom-komponenter)  |

## Fra demo til drift

Demoen er sat op til at køre lokalt uden konfiguration. Før den kører på en server, skal du:

- **Sætte rigtige secrets:** `PAYLOAD_SECRET` og `PREVIEW_SECRET` (se `.env.example`). Demo-brugeren oprettes kun, hvis databasen er tom. Fjern den, eller skift password.
- **Bruge migrationer:** I udvikling synkroniserer Payload selv databaseskemaet. I produktion bruger man `pnpm payload migrate:create` og `pnpm payload migrate`.
- **Vælge hosting:** Koden (collections, hooks, endpoints) er den samme, uanset hvor den kører. Det eneste, der skifter, er database-adapteren i `payload.config.ts`:
  - **VPS / Docker:** SQLite som her, eller Postgres via `@payloadcms/db-postgres`.
  - **Cloudflare Workers:** D1 via `@payloadcms/db-d1-sqlite` og R2 til uploads.

## Git-historikken

Repoet har med vilje kun to commits:

1. **Udgangspunktet:** hele CMS'et, som det ser ud nu
2. **Ny tabel og API-endpoint:** præcis de ændringer, der skal til for punkt 3 og 4

Kør `git show HEAD` for at se, hvor lidt kode der skal til.
