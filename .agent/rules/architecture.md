---
trigger: always_on
---

# Architecture Rules — Marizhaircastle

> **Relationship to AGENTS.md:** This file operationalizes AGENTS.md for architecture concerns. The Stack table, Development Workflow, Tooling & Commands, and technical guidance mirror AGENTS.md — **keep them in sync with AGENTS.md whenever either changes**; AGENTS.md is the source of truth and governs *how* to build.

## Stack (required — do not substitute without justification)

| Layer | Technology |
|---|---|
| Framework | Next.js |
| UI | React |
| Runtime | Node.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Payment | Flutterwave |
| Authentication | Simple credential auth — `name`, `email`, `password`. Implement via NextAuth/Auth.js `Credentials` provider; else confirm before substituting. |

**Current state:** Early design phase. No app scaffold yet — no `package.json`, Next.js app, or Prisma schema exists yet. Confirm before assuming a baseline exists.

**Environments (default assumption — confirm before production infra work):** `NODE_ENV` selects `development`/`production`; secrets via `.env.development` / `.env.production` (never committed, mirror in `.env.example`); a dedicated `staging` deployment uses explicit env vars on the host.

---

## Folder Structure

Follow this structure. Do not introduce new top-level folders without justification.

```text
marizhaircastle/
├── app/                         # Next.js routes, layouts, pages, and route handlers
│   ├── (storefront)/            # Customer-facing storefront routes
│   ├── (auth)/                  # Authentication-related routes
│   ├── admin/                   # Admin dashboard routes
│   └── api/                     # Server-side API/route handlers
│
├── components/                  # Reusable UI components
│   ├── ui/                      # Generic design-system components
│   ├── storefront/              # Customer storefront components
│   ├── admin/                   # Admin dashboard components
│   └── shared/                  # Components shared across experiences
│
├── lib/                         # Shared application logic and utilities
│   ├── auth/                    # Authentication utilities
│   ├── db/                      # Prisma/database utilities
│   ├── payments/                # Flutterwave integration
│   ├── validation/              # Zod schemas
│   ├── orders/                  # Order business logic
│   ├── inventory/                # Inventory business logic
│   └── utils/                   # General utilities
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Prisma migrations
│
├── tokens/                      # Design tokens (source JSON + generated CSS)
│   ├── color-token.json
│   ├── design-tokens.tokens.json
│   ├── convert-tokens.js        # Regenerates design-tokens.css
│   └── design-tokens.css        # Consumed CSS variables (import globally)
│
├── public/                      # Public static assets
│   ├── images/
│   └── icons/
│
├── types/                       # Shared TypeScript types where needed
│
├── tests/                       # Automated tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .agent/rules/                 # This rule set
├── AGENTS.md
├── PRD.md
├── README.md
├── package.json
└── ...
```

---

## Technical Guidelines

- Follow the project's existing conventions and architecture before introducing new frameworks, libraries, or architectural patterns. Any deviation needs stated justification.
- Prefer: reusable components, modular architecture, strong typing, clear separation of concerns, validated inputs (Zod), efficient Prisma queries, accessible UI components.
- Maintain clear boundaries between UI/presentation, business logic, API/server operations, data access, authentication, and external services (payments).
- Before any schema change: inspect existing models, consider backward compatibility, use safe Prisma migrations, avoid destructive changes unless explicitly required.
- Prefer archiving/deactivating records (e.g. products) over destructive deletion when historical orders depend on them.
- Use transactions where multiple related database operations must succeed or fail together (e.g. payment confirmation + inventory deduction + order status update).

---

## Development Workflow

Before implementing anything non-trivial:

1. Inspect the existing project structure.
2. Understand current architecture and conventions.
3. Identify related components, routes, services, models, and database structures.
4. Reuse existing functionality where appropriate — do not duplicate logic.
5. Plan the smallest safe implementation.
6. Implement the change.
7. Run relevant validation/tests (see Tooling & Commands below).
8. Check for regressions across affected user flows.
9. Clean up unnecessary code or duplication.
10. Report what changed and what was verified.

Do not rewrite existing functionality unnecessarily. Do not refactor, redesign, or "improve" unrelated code without being asked.

---

## Tooling & Commands

Run the correct validation for each change and report what actually ran. These are defaults for the confirmed stack — once `package.json` scripts exist, use those exact scripts instead, and ask if unsure which script to run.

**Install & run**
- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`

**Validation** (verify each applicable one; report which passed/failed)
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Tests: `npm run test`
- Single test file: `npm run test -- <path>`

**Database (Prisma)**
- Generate client after schema changes: `npx prisma generate`
- Create/apply a migration in dev: `npx prisma migrate dev`
- Apply committed migrations: `npx prisma migrate deploy`
- Seed DB: `npm run db:seed` — *(assumption: add `prisma/seed.ts` exposing this script the first time seeding is needed)*

**Git & version control**
- Commit only when explicitly asked. Use concise, imperative commit messages describing *why*.
- Never commit `.env` files, secrets, or credentials.
- Branch per feature/fix; do not push to `main`/`master` without confirmation.

---

## Definition of Done (architecture-level)

A task is architecturally complete only when:

- It follows the folder structure and existing conventions above.
- No unjustified new dependencies or architectural patterns were introduced.
- Database changes are safe (proper migrations, no unexplained destructive changes).
- Related business logic lives in `lib/`, not duplicated inline across routes/components.
- Relevant validation commands were run and results reported.
