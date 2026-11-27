# DCIMS

**Davao Construction Inventory Management System** — a frontend-only portfolio
demonstration of construction inventory, warehouse, procurement, and equipment
workflows, built with fictional data and running entirely in the browser.

> This is a demonstration, not a product. Data lives in the browser's
> LocalStorage, is not synchronised across devices, is not tamper-proof, and
> access control is simulated. Do not enter real business information.

## Features

| Module | What it does |
|---|---|
| Dashboard | KPIs, movement/valuation charts, low-stock and activity feeds — all derived from records |
| Materials | Catalogue with weighted-average costing, filters, CSV export, archive guard |
| Categories | Grouping with derived material counts and inventory value |
| Warehouses | Per-warehouse stock, transfer workflow, deactivation guard |
| Stock movements | Stock-in, stock-out, transfer, adjustment, and return history |
| Projects | Budgets, progress, on-site allocations, consumption recording, six-tab detail view |
| Material requests | Multi-line requests, approval, rejection with reason, cancellation, partial fulfilment |
| Equipment | Register, assign, return, maintenance, retirement, with assignment history |
| Suppliers | Derived supply history and purchase-order timeline |
| Purchase orders | Draft, approve, dispatch, partial receiving, cancellation rules |
| Reports | 18 reports across four groups with filters, CSV export, and print layouts |
| Activity logs | Searchable audit trail with module and action filters |
| Global search | Command palette (Ctrl/Cmd+K) across eight modules |
| Settings | Company profile, appearance, inventory defaults, notification preferences, JSON export/import, demo reset |

## Technology stack

- **Next.js 16** (App Router, Turbopack) and **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** with shadcn/ui primitives (Radix)
- **Zustand** with `persist` middleware over LocalStorage
- **React Hook Form** + **Zod**
- **Recharts** for analytics, **Sonner** for toasts, **next-themes** for theming
- **Vitest** for business-logic tests

## Architecture: frontend only

There is no server, database, or API route for business operations. Domain rules
live in `src/services/*` as pure functions over an in-memory dataset; the Zustand
store persists the result. A React Server Component shell renders the layout,
and all data screens are client components.

```
Route (UI)  ->  Domain service (rules)  ->  Store (persist)  ->  LocalStorage
```

Consequences: refreshing keeps your data, clearing browser storage loses it, and
two browsers never see the same records.

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000); the root redirects to
`/dashboard`.

No environment variables are required.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check (run `npm run build` first for route types) |
| `npm test` | Business-logic tests (Vitest, 48 tests) |

## Seed data

The demo dataset is deterministic — a fixed PRNG seed means the same records on
every load: 10 categories, 55 materials, 3 warehouses, 6 projects, 12 suppliers,
20 equipment assets, 124 stock movements, 15 requests, 10 purchase orders, and
34 activity records.

Balances are never hand-written; they are replayed from the movement ledger, and
`findSeedIntegrityProblems()` verifies references, uniqueness, purchase-order
totals, and ledger reconciliation. `src/instrumentation.ts` re-runs that check
whenever the dev server starts.

Reset from **Settings → Demo data**, which requires confirmation.

## Repository layout

```
src/
├── app/            routes (App Router), providers, global styles
├── components/     ui primitives, layout shell, shared components
├── features/       one folder per module (dashboard, materials, reports, ...)
├── services/       pure domain rules + tests
├── stores/         Zustand stores, persistence, selectors
├── schemas/        Zod validation for forms and imports
├── data/           deterministic seed dataset
├── types/          domain models
├── lib/            currency, dates, CSV, inventory, procurement helpers
└── hooks/          shared hooks
docs/               project specification, theme, typography, task tracker
```

## Known limitations

- Single-user and offline-by-design; no accounts, roles, or sharing.
- Access control is simulated and grants nothing.
- Inventory costing uses one weighted-average cost per warehouse, not per batch.
- Activity logs and notifications are local records, not an audit system.
- Reports derive from current in-memory state; there is no historical snapshot.
- Charts summarise transaction counts and money, never summed quantities across
  different units.

## Documentation

- [Project specification](docs/PROJECT.MD)
- [Design system](docs/THEME.MD)
- [Typography](docs/TYPOGRAPHY.MD)
- [Task tracker](docs/TASK.MD)

## Deployment

The application builds as a static/SSR Next.js app and needs no backend. **It is
not deployed yet** — no Vercel project has been configured and no deployment URL
exists. Deployment requires explicit authorisation of the target account.
