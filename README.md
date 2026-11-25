# DCIMS

Davao Construction Inventory Management System is a frontend-only portfolio project for demonstrating construction inventory workflows with fictional data. Phase 1 sets up the application foundation; the inventory workflows are not implemented yet.

## Run locally

With Node.js and npm installed:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The starter route is in `src/app/page.tsx`. Its Documentation link uses the shadcn/ui Button primitive.

## Verify changes

```bash
npm run lint
npm run build
npx --no-install tsc --noEmit
```

The build generates Next.js route types used by the standalone TypeScript check.

See the [project specification](docs/PROJECT.MD), [design system](docs/THEME.MD), [typography guide](docs/TYPOGRAPHY.MD), and [task tracker](docs/TASK.MD) for requirements and progress.
