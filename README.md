# Rift Payload Demo

Et lille, kørbart eksempel på den stak, vi bygger på: **Payload CMS 3** oven på **Next.js 16** og **React 19**, med SQLite som database.

Demoen viser fire ting:

1. Hvordan en redaktør opdaterer tekster og billeder i admin-panelet
2. Hvordan en redaktør styrer SEO: meta-tags, Open Graph, sitemap og structured data (JSON-LD)
3. Hvordan en udvikler tilføjer en ny tabel til databasen
4. Hvordan en udvikler laver et API-endpoint, der henter og filtrerer rækker fra den tabel

Punkt 1 og 2 foregår i admin-panelet. Punkt 3 og 4 er kode, og de ligger samlet i det seneste commit. Kør `git show HEAD` for at se hele ændringen.

## Kom i gang

**Krav:** Node.js 22 eller nyere (24 anbefales) og pnpm 10. Har du ikke pnpm, så kør `corepack enable` (følger med Node) eller `npm install -g pnpm`.

```bash
git clone https://github.com/Rift-IT/rift-payload-demo.git
cd rift-payload-demo
pnpm install
pnpm dev
```

Åbn derefter:

| Hvad          | URL                                                       |
| ------------- | --------------------------------------------------------- |
| Hjemmesiden   | http://localhost:3000                                     |
| Admin-panelet | http://localhost:3000/admin                               |
| REST API      | http://localhost:3000/api/pages                           |
| Sitemap       | http://localhost:3000/sitemap.xml                         |
| Produkt-API   | http://localhost:3000/api/products/search?category=coffee |

**Login til admin:** `demo@therift.dev` / `demo1234`. Felterne er udfyldt på forhånd, så du skal bare klikke **Login**.

Der er ingen `.env`-fil eller database at sætte op. Ved første start opretter projektet selv SQLite-filen `demo.db`, demo-brugeren, et par sider og nogle produkter. Første sidevisning tager et par sekunder, fordi Next.js kompilerer.

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

## 3. En ny tabel

En tabel i Payload er en **collection**: én TypeScript-fil, der beskriver felterne. Ud fra den laver Payload selv databasetabellen, admin-skærmene, validering, adgangskontrol og et REST- og GraphQL-API.

Eksemplet er tabellen `products`. Det er tre trin:

**1. Beskriv tabellen** i [`src/collections/Products/index.ts`](src/collections/Products/index.ts):

```ts
export const Products: CollectionConfig = {
  slug: 'products', // tabelnavn og API-sti: /api/products
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'category', type: 'select', options: [/* coffee, tea, equipment */], index: true },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'inStock', type: 'checkbox', defaultValue: true },
    { name: 'description', type: 'textarea' },
  ],
}
```

**2. Registrer den** i [`src/payload.config.ts`](src/payload.config.ts):

```ts
collections: [Pages, Media, Categories, Products, ...],
```

**3. Generer TypeScript-typer**, så resten af koden kender `Product`:

```bash
pnpm generate:types
```

Når `pnpm dev` kører, opretter Payload selv tabellen i databasen. **Shop → Products** dukker op i admin-panelet, og API'et virker med det samme. Demo-produkterne i [`src/seed/products.ts`](src/seed/products.ts) oprettes, næste gang serveren starter.

Payload har også felttyper til relationer (`relationship`), uploads, arrays, rich text, datoer, JSON og meget mere.

## 4. Et API-endpoint, der henter og filtrerer

**Det automatiske API.** Alle collections får et REST API med filtrering (`where`), sortering, paginering og feltudvalg. Adgangsreglerne fra collectionen gælder også her:

```bash
# Produkter under 100 kr., sorteret efter pris, kun navn og pris
curl -g "http://localhost:3000/api/products?where[price][less_than]=100&sort=price&select[name]=true&select[price]=true"

# Kaffe på lager
curl -g "http://localhost:3000/api/products?where[category][equals]=coffee&where[inStock][equals]=true"
```

**Et custom endpoint.** Vil man have sine egne parametre, sin egen validering eller sit eget svarformat, lægger man et endpoint på collectionen. Se [`src/collections/Products/searchEndpoint.ts`](src/collections/Products/searchEndpoint.ts):

```ts
export const searchEndpoint: Endpoint = {
  path: '/search', // bliver til GET /api/products/search
  method: 'get',
  handler: async (req) => {
    const { category, maxPrice, inStock } = req.query
    const where: Where = {}
    if (category) where.category = { equals: category }
    if (inStock === 'true') where.inStock = { equals: true }
    if (maxPrice) where.price = { less_than_equal: Number(maxPrice) }

    const result = await req.payload.find({
      collection: 'products',
      where,
      sort: 'price',
      req,
      overrideAccess: false,
    })

    return Response.json({
      count: result.totalDocs,
      products: result.docs.map(({ id, name, category, price, inStock }) => ({
        id,
        name,
        category,
        price,
        inStock,
      })),
    })
  },
}
```

```bash
curl "http://localhost:3000/api/products/search?category=coffee&maxPrice=120&inStock=true"
# {"count":2,"products":[{"id":1,"name":"Espresso, hele bønner","category":"coffee","price":89,"inStock":true}, ...]}
```

`req.payload.find()` er Payloads **Local API**: samme forespørgsler som REST, men direkte i koden og uden HTTP. Det samme kald kan bruges fra en server-komponent i Next.js, et cron-job eller et hook.

**Skal data sendes videre til et andet system**, f.eks. et webhook eller en ekstern tjeneste, hver gang en række ændres, bruger man et `afterChange`-hook på collectionen:

```ts
hooks: {
  afterChange: [async ({ doc }) => {
    await fetch('https://example.com/webhook', { method: 'POST', body: JSON.stringify(doc) })
  }],
},
```

## Projektstruktur

```
src/
  payload.config.ts   Hele CMS'et: collections, database, admin, seed
  env.ts              Konfiguration med demo-standardværdier (kan overskrives via .env)
  db.ts               Database-adapteren (SQLite), med en lille rettelse til en drizzle-kit-fejl
  collections/        Tabeller i databasen: Pages, Media, Products, SeoEntries, Redirects, Users ...
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

1. **Udgangspunktet:** CMS'et med sider, medier og SEO
2. **Ny tabel og API-endpoint:** præcis de ændringer, der skal til for punkt 3 og 4

Kør `git show HEAD` for at se, hvor lidt kode der skal til.
