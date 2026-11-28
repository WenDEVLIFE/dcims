# DCIMS

**Davao Construction Inventory Management System** — a frontend-only application
for construction inventory, warehouse, procurement, project, and equipment
workflows, built with Next.js 16 and storing all data in the browser.

`en-PH` · `PHP` · `Asia/Manila` · v0.1.0

---

## What it does

| Module | Highlights |
|---|---|
| Sign-in | Four role-based accounts, role switching, sign-out |
| Dashboard | 8 KPIs, 5 charts, low-stock and activity feeds, date-range filter |
| Materials | Catalogue with weighted-average costing, filters, CSV export, archive guard |
| Categories | Grouping with derived material counts and inventory value |
| Warehouses | Per-warehouse balances, transfer workflow, deactivation guard |
| Stock movements | Stock-in, stock-out, transfer, adjustment, return, full history |
| Projects | Budgets, progress, on-site allocations, consumption, six-tab detail view |
| Material requests | Multi-line requests, approval, rejection with reason, cancellation, partial fulfilment |
| Equipment | Register, assign, return, maintenance, retirement, assignment history |
| Suppliers | Supply history and purchase-order timeline derived from orders |
| Purchase orders | Draft, approve, dispatch, partial receiving, cancellation rules |
| Reports | 18 reports in four groups, filters, CSV export, print layouts |
| Activity logs | Audit trail with module, action, and period filters |
| Global search | Command palette (Ctrl/Cmd+K) across eight modules |
| Settings | Company, appearance, inventory defaults, notifications, JSON export/import, data reset |

---

## Demo accounts

Sign-in is a role switch for exploring the modules; it is not authentication and
enforces no permissions. Every account uses the password `dcims2026`.

| Role | Email |
|---|---|
| Warehouse supervisor | `warehouse@dcims.example` |
| Procurement officer | `procurement@dcims.example` |
| Project engineer | `engineer@dcims.example` |
| Inventory clerk | `clerk@dcims.example` |

The active account is shown in the rail and header, and it is the name recorded
on new activity entries. Sign out from the account menu.

---

## Technology stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack) |
| UI runtime | React 19.3 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| State | Zustand 5 with `persist` middleware over LocalStorage |
| Forms | React Hook Form + Zod resolvers |
| Charts | Recharts 3 |
| Feedback | Sonner toasts, next-themes |
| Icons | Lucide |
| Tests | Vitest 3 |

No backend, database, API route, or external service is used for business
operations.

---

## Getting started

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. The root redirects to `/dashboard`, which sends you
to `/login` when no session exists.

No environment variables are required.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Business-logic tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npx tsc --noEmit` | Type check (run `npm run build` first for route types) |

---

## Architecture

```
Route (client component)
        │
        ▼
Domain service  (src/services/*)   pure functions: validate, compute, return new data
        │
        ▼
Zustand store   (src/stores/*)     commits only successful results, persists to
        │                          LocalStorage under dcims-domain-v1
        ▼
LocalStorage
```

**Rules live in services, not components.** Each service takes the current
dataset and returns either the next dataset or a failure, so a rejected operation
leaves state untouched — there is no partial write to roll back.

**Derived values are computed, never stored.** Balances are replayed from the
movement ledger; dashboard figures come from `src/stores/selectors.ts`; status
labels from `src/lib/status-labels.ts`.

**Persistence is versioned.** The store is at schema version 3 with a migration
path, and rehydrated data is validated before use. Invalid payloads fall back to
the seeded dataset.

### Project structure

```
src/
├── app/            routes: (dashboard) group, /login, layout, global styles
├── components/     ui primitives, layout shell, shared components
├── features/       one folder per module
├── services/       pure domain rules + tests
├── stores/         domain store, session store, UI store, selectors
├── schemas/        Zod schemas for forms, imports, and persisted data
├── data/           deterministic seed dataset + integrity checks
├── types/          domain models and store state types
├── lib/            currency, dates, CSV, inventory, procurement, labels
└── hooks/          shared hooks
docs/               PROJECT, THEME, TYPOGRAPHY, TASK
```

---

## Data model notes

- **Money is integer centavos.** Every monetary field ends in `Centavos`; totals
  are rounded once per line and summed.
- **Costing is per warehouse.** Each balance carries its own weighted-average
  cost, recalculated on stock-in.
- **Transactions are all-or-nothing.** Multi-record operations validate
  everything before applying anything.
- **References are deterministic.** `MAT-0001`, `TXN-2026-0001`, `PO-2026-001`,
  `REQ-2026-015` are generated from a sequence, so the seed reproduces exactly.
- **Statuses are string unions**, not enums, so persisted JSON stays readable.

### Seeded dataset

Deterministic, generated from a fixed PRNG seed:

10 categories · 55 materials · 3 warehouses · 6 projects · 12 suppliers ·
20 equipment · 126 stock movements · 98 balances · 15 requests · 10 purchase
orders · 34 activity records · 5 notifications.

Integrity is enforced by `findSeedIntegrityProblems()` — references, unique
codes, purchase-order totals, and ledger-vs-balance reconciliation. It runs at
dev-server start via `src/instrumentation.ts`.

Reset from **Settings → Data**, which requires confirmation.

---

## Branding and theming

- `public/dcims-icon-light.png` — transparent mark for light surfaces
- `public/dcims-icon-dark.png` — transparent mark with light artwork for dark surfaces
- `public/dcims.png`, `public/dcims-icon.png` — original assets, still used for icons

`LogoMark` swaps the transparent exports by theme. Surfaces that stay dark in
both themes (navigation rail, login hero) pass `onDark` so navy artwork never
lands on navy.

Typography: Manrope for interface text, JetBrains Mono for codes and references.

---

## Testing

```bash
npm test
```

51 tests across seven files:

| Suite | Focus |
|---|---|
| `services/__tests__/inventory` | stock-in/out, negative and insufficient rejection, weighted average, transfers, adjustments, returns |
| `services/__tests__/material-request` | creation, approval without deduction, rejection, partial and full fulfilment, over-fulfilment |
| `services/__tests__/procurement` | line/subtotal/total maths, inactive supplier, approve → order, receiving rules |
| `services/__tests__/projects` | allocations, consumption, negative-stock prevention, budget floor |
| `services/__tests__/equipment` | assignment, return, duplicate and damaged restrictions, maintenance, retirement |
| `data/__tests__/seed` | integrity, seed minimums, export/import round-trip, invalid imports |
| `constants/__tests__/demo-accounts` | one account per role, unique credentials, sign-in matching |

Services are pure, so each test starts from a fresh clone of the seed.

---

## Deployment

The app builds as a standard Next.js project and needs no environment variables
or database.

**Current status:** a Vercel project exists at `dcims.vercel.app`, but it is
building the `master` branch, which still points at an early milestone. The
current application lives on `typography/manrope-default`. To publish it:

1. Merge `typography/manrope-default` into `master` and push, **or**
2. Change Production Branch in Vercel → Settings → Git to
   `typography/manrope-default`.

Either triggers a redeploy; no build configuration is required.

---

## Limitations

- Data is stored in the browser and is not synchronised across devices.
- Clearing site data removes all records.
- Sign-in is simulated; roles do not restrict anything.
- Activity logs and notifications are local records, not an audit system.
- Costing uses one weighted average per warehouse rather than per batch.
- Reports reflect current state; there are no historical snapshots.

---

## Documentation

- [Project specification](docs/PROJECT.MD)
- [Design system](docs/THEME.MD)
- [Typography](docs/TYPOGRAPHY.MD)
- [Task tracker](docs/TASK.MD)
