---
name: db-migration-runner
description: Use this skill whenever the Prisma schema needs to change for Marizhaircastle — adding/editing/removing a model or field, changing a relation, adding an index or constraint, or running/reviewing a migration. Trigger on requests like "add a discountCode field to Order," "create the Inventory model," "the schema needs updating for variants," or "run the migration." Also trigger any time a task's implementation would require touching prisma/schema.prisma, even if the user didn't explicitly mention Prisma or migrations. Prevents destructive or unsafe migrations from being run without review.
---

# DB Migration Runner


## Core Rule

**Never run a destructive migration against data that matters without explicit confirmation.** A destructive migration is one that could drop a column, drop a table, change a column type incompatibly, or remove a constraint that data depends on. In development against empty/seed data this is low-risk; against any populated database (staging or production) it is not.

## Step-by-Step

### 1. Inspect before changing

- Read the current `prisma/schema.prisma` in full — don't guess at existing models/fields/relations.
- Identify what depends on the thing you're changing: other models with relations to it, application code querying the field, seed scripts.

### 2. Plan the schema change

- Prefer **additive** changes (new optional field, new model, new relation) over changes that alter or remove existing structure.
- If a field must be removed or its type changed, check whether existing code or data depends on it. If it does, plan a safe path: e.g. add the new field, backfill data, migrate code to use it, only then remove the old field in a later migration — don't do it in one destructive step against real data.
- If historical orders/records depend on a model that's being changed (e.g. Product), prefer soft-delete/deactivation fields over structural removal — see `.agent/rules/architecture.md`.

### 3. Edit the schema

- Follow existing naming conventions in the schema (check casing, pluralization, existing relation naming patterns before adding new ones).
- Add appropriate indexes for fields that will be queried/filtered/sorted on frequently (e.g. `orderStatus`, `productId` foreign keys, `email` on User).
- Add database-level constraints (`@unique`, required vs optional, foreign key `onDelete` behavior) deliberately — e.g. decide explicitly whether deleting a Product should cascade, restrict, or set-null on related OrderItems (likely `Restrict` or keep the product archived instead of deleted, per the architecture rule against destructive deletion).

### 4. Generate the migration

```bash
npx prisma migrate dev --name <descriptive-name>
```

- Use a descriptive migration name (`add-inventory-model`, `add-order-payment-reference`) — not `update` or `fix`.
- Review the generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql` before considering the task done. Confirm it does what you expect, especially for anything involving `DROP`, `ALTER COLUMN ... TYPE`, or removing a `NOT NULL` default without a backfill.

### 5. Flag destructive operations

If the generated SQL contains `DROP TABLE`, `DROP COLUMN`, or a type change that could lose data, and the target isn't a fresh empty dev database:
- Stop and explicitly flag this to the user before running it.
- Propose a non-destructive alternative if one exists (e.g. keep the old column temporarily, or a two-step migration).

### 6. Confirm the target environment

- Before running anything, confirm which environment the migration targets (`development`, `staging`, or `production`) — never assume one when another is intended (see `.agent/rules/security.md` → Environment Safety).
- `npx prisma migrate dev` is for **local development only**; `npx prisma migrate deploy` applies committed migrations in staging/production.
- Never act against production data or the production environment without explicit confirmation.

### 7. Regenerate the Prisma client

```bash
npx prisma generate
```

Run this after every schema change so TypeScript types stay in sync — a stale client is a common source of confusing type errors.

### 8. Update seed data if relevant

If `prisma/seed.ts` exists and references the changed model, update it to match — don't leave seed scripts broken by a schema change. Seed runs via `npm run db:seed` (per AGENTS.md §11).

### 9. Verify

- Run `npx prisma migrate status` to confirm the migration applied cleanly and the schema history has no drift.
- Confirm the app still typechecks (`npx tsc --noEmit`) — schema changes often ripple into query code elsewhere.
- Confirm any code querying the changed model/field still compiles and behaves correctly.
- Commit the generated migration (the `migration.sql`, `schema.prisma`, and updated `package.json`/lockfile if applicable) together as one unit — don't leave a schema change uncommitted while the migration history moves ahead.

## Common Mistakes to Avoid

- Editing the schema and hand-writing SQL migrations instead of letting Prisma generate them — this causes drift between schema and migration history.
- Removing a field because it "looks unused" without actually checking application code and seed data.
- Running `prisma migrate reset` (which drops the whole database) without confirming that's actually intended — this is destructive by design and only appropriate for local dev resets.
- Forgetting to run `prisma generate` after a schema change, leading to stale/incorrect TypeScript types.
- Adding a required field to a model that already has rows, without a default value or backfill plan.
- Running a migration without first confirming the target environment, or using `migrate dev` against staging/production.
