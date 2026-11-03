# freitty-front

Client cabinet of **Freitty**, a logistics platform — the web app where a client company tracks
its cross-dock and consolidation orders across hubs. Three screens are implemented from the
design mockup: **Dashboard**, **Order list** and **Order detail**. Every number on screen comes
from the [`freitty-api`](../freitty-api) (NestJS + PostgreSQL); nothing is hardcoded in the UI
besides labels and colours.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 6 (strict) · Tailwind CSS 4 (`@theme`
tokens) · motion 14 (`motion/react`) · TanStack Query 5 (+ devtools in dev) · zod 4 · lucide-react
· Inter via `next/font` · Vitest + Testing Library · ESLint (flat, `next/core-web-vitals` +
`typescript-eslint`) · Prettier (+ Tailwind plugin).

## Quick start

The front talks only to its own origin: `/api/*` is proxied to the API by a Next rewrite. So start
the API first.

```bash
# 1. API — http://localhost:3001 (details: freitty-api/README.md → Quick start)
cd ../freitty-api && npm install
cp .env.example .env          # set DATABASE_URL (keep DB_SCHEMA=freitty)
npm run db:migrate && npm run db:seed && npm run start:dev

# 2. Front — http://localhost:3000 (in a second terminal)
cd ../freitty-front
nvm use                       # Node 24 (.nvmrc)
cp .env.example .env.local    # API_PROXY_TARGET=http://localhost:3001
npm install
npm run dev                   # → redirects to /dashboard
```

## Scripts

| command                           | what it does                                         |
| --------------------------------- | ---------------------------------------------------- |
| `npm run dev` / `build` / `start` | Next dev server / production build / serve the build |
| `npm run typecheck`               | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`)  |
| `npm run lint`                    | ESLint                                               |
| `npm run format` / `format:check` | Prettier write / check                               |
| `npm test`                        | Vitest unit + component tests                        |
| `npm run check`                   | typecheck + lint + format check + tests              |

## Screens

| route              | what's there                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`       | Welcome, KPI cards (active orders, completed 30 d, need attention → `/orders?segment=attention&period=all`), recent orders as full cards with live countdowns, "Your activity" charts (completed orders + spend per day / ISO week / month / quarter) with insights.                                                                          |
| `/orders`          | Segment tabs with counts (+ "Need attention" while selected), Hub / Date / Status filters, search chip, Cards / Table / Pipeline views, pagination, CSV export of the current filters.                                                                                                                                                        |
| `/orders/[number]` | Order header, badges, action bar, alerts / the client's pending action / read-only banners, meta card with status flow, dock schematic, BOL vs warehouse quantity reconciliation, sub-orders (consolidation), operations, supplies, totals. Actions follow the lifecycle (no BOL for drafts, nothing editable once closed); styled 404 state. |
| `/settings`        | Placeholder.                                                                                                                                                                                                                                                                                                                                  |

Unimplemented actions (New Order, Top up, BOL PDF, Edit, + Operation, card toolbar icons, …) show a
"Not part of this demo yet" toast (clicking again restarts it rather than stacking copies). "Share
QR" copies the page link.

## Architecture

```
src/
  app/
    tokens.css            ← every colour / font size / radius (Tailwind @theme) — the only place with hex
    globals.css           base layer, focus rings, stretched-link, skeleton shimmer, scroll-edge fades
    layout.tsx            Inter font, metadata ("%s · Freitty"), providers
    providers.tsx         QueryClient + MotionConfig(reducedMotion="user") + toasts + devtools (dev)
    page.tsx              / → /dashboard
    not-found.tsx         styled 404 inside the cabinet chrome
    (cabinet)/            route group with the shell layout + error boundary
      dashboard/ orders/ orders/[number]/ settings/
  components/
    ui/                   design-system primitives: button, icon-button, badge, card, table, select,
                          tabs, segmented, popover, toast, avatar, skeleton, empty/error states,
                          breadcrumbs, notice, count-up
    layout/               app shell, sidebar, topbar (search, balance, bell), mobile drawer
    orders/               order card (full/compact), refs popover, next-step line, list screen,
                          toolbar, table, pipeline board, pagination
    dashboard/            KPI cards, recent orders, activity panel, SVG charts
    order-detail/         every section of the detail page
  lib/
    api/                  client.ts (fetch + ApiError) · types.ts (mirror of the API contract)
                          query-keys.ts (key factory) · hooks.ts (one typed hook per endpoint)
    domain/               labels & tones · next-step resolver · status flow · URL filters (zod)
                          · order display helpers · activity bucket labels
    format/               money · dates (America/Toronto) · quantity · carrier
    hooks/                use-order-filters (URL state) · use-now (shared clock) · …
  test/                   fixtures modelled on the seed data + render helper
```

Data flow: **component → typed hook (`lib/api/hooks.ts`) → `api.get('/orders')` → same-origin
`/api/orders` → Next rewrite → Nest API**. Components never call `fetch` directly and never build
query keys by hand.

## Decisions

- **Same-origin proxy instead of CORS.** `next.config.ts` rewrites `/api/:path*` to
  `${API_PROXY_TARGET}/api/:path*`. The browser never sees the API origin, there is no CORS
  configuration to keep in sync, and the CSV export is a plain `<a href download>`.
- **Server state = TanStack Query.** A query-key factory keeps keys consistent; lists, the board
  and the activity chart use `keepPreviousData` (the old result stays on screen, dimmed, while the
  next one loads); 4xx responses are never retried; order details are prefetched when a card is
  hovered or focused, so opening an order is instant.
- **The order list lives in the URL.** `segment`, `hub`, `period`, `status`, `q`, `page`, `view`
  are parsed with zod (invalid values fall back to defaults), serialized without defaults, and any
  filter change resets the page. Filtered lists are shareable and Back/Forward walk through them;
  the detail page's "←" returns to the exact list you came from (Navigation API), or to `/orders`
  when the order was opened directly. UI-only params (`view`) are never sent to the API, which
  rejects unknown params. The list defaults to the last 30 days, but links behind all-time counts
  (Need attention card, bell) and topbar searches started on another page use `period=all`; a
  search on the list keeps the filters on screen.
- **Design tokens only.** Tailwind's default palette is disabled (`--color-*: initial`), so
  components can only use the mockup's tokens (`bg-surface`, `text-ink-muted`,
  `bg-tone-purple text-tone-purple-ink`, …). Re-theming is a one-file edit. Text that carries
  information meets WCAG AA (`ink-muted` at the lightest, `success-ink` / `attention` for green and
  orange text); the faint greys are left to separators and decoration.
- **Business time zone.** All dates render in `America/Toronto` with day-month order
  ("12 Apr, 09:00"), independent of the viewer's zone; it must match the API's `APP_TIMEZONE`.
  Parts come from `Intl` and are assembled by hand, avoiding locale quirks (en-GB "Sept").
  Countdowns ("2h 14m", "overdue 3h") tick from one shared clock.
- **Pure domain logic, tested.** Labels, quantity wording, the next-step resolver, status flow,
  URL filters, activity labels and formatters are pure functions with unit tests; components stay
  thin.
- **Accessible by default.** Landmarks and a skip link, semantic tables with captions, `aria-label`
  on every icon button, visible focus rings, roving-tabindex tabs, radio-group view toggle,
  keyboard-explorable charts with a hidden data table, Escape/outside-click popovers rendered in a
  portal (never clipped by tables or covered by neighbouring cards), modal mobile drawer (focus
  stays inside, the page behind is `inert`, it closes when the window grows to the desktop layout).
- **No nested interactive elements.** A card is one stretched link; its refs popover and toolbar
  buttons sit above it. Table rows open the order on click, and in a new tab on Ctrl/Cmd-click or
  middle-click, like links.
- **Motion with restraint.** 150–300 ms fades, shared-layout tab underline and toggle pill, layout
  animations when filters change, KPI count-up, growing bars and a self-drawing spend line (its last
  segment is dashed: that period is still in progress). Every animation honours the OS "reduce
  motion" setting.
- **Responsive, without jumps.** Below `lg` the sidebar becomes a drawer and grids drop to two or
  one columns; order cards are size containers (`@container`), so their header adapts to the
  card's own width; tabs, tables and the pipeline scroll sideways with faded edges (the active tab
  is kept in view). Skeletons mirror the final layout, so content doesn't shift when data arrives.

## Tests

`npm test` runs Vitest in jsdom: formatters (money, Toronto dates, countdowns, quantities, carrier),
domain logic (labels, next step, status flow, URL filter parse/serialize, activity buckets, ISO
weeks), the API client, the "←" back hook, and component tests for the order card, refs popover,
orders table rows, tabs, segmented control, toasts, topbar search, the mobile drawer, and the order
detail's notices and lifecycle rules.

CI (`.github/workflows/ci.yml`, GitHub Actions on pushes and pull requests to `main`): `npm ci`,
typecheck, lint, format check, tests and a production build.

## Deploying to Vercel

1. Deploy `freitty-api` first and note its URL (e.g. `https://freitty-api.vercel.app`).
2. Import this repo in Vercel (framework preset: Next.js, Node 24 — `engines.node` is `24.x`).
3. Set the environment variable **`API_PROXY_TARGET`** to the API origin (no trailing slash) for
   **both Production and Preview**: every Vercel build fails without it (`next.config.ts` refuses
   to proxy to localhost). Rewrites are resolved at build time, so redeploy after changing it.
4. Deploy. The app is served from the Vercel domain and proxies `/api/*` to the API.
