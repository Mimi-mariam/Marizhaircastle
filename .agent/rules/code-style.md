---
trigger: always_on
---

# Code Style Rules — Marizhaircastle

> **Relationship to AGENTS.md:** This file operationalizes AGENTS.md for code-style concerns (naming, server/client, validation, component structure). **Keep it in sync with AGENTS.md whenever either changes**; AGENTS.md is the source of truth and governs *how* to build.

## General Principles

- Prefer the simplest solution that satisfies the requirement. Do not over-engineer.
- Reuse existing project patterns and utilities before writing new ones.
- Do not duplicate logic when an existing reusable solution is available.
- Keep components, functions, and modules focused on a single responsibility.
- Avoid unnecessary abstraction — don't build for hypothetical future requirements that haven't been requested.

---

## TypeScript

- Use strong typing throughout — avoid `any` unless there is no reasonable alternative, and comment why if used.
- Define shared types in `types/` when used across more than one module; keep local types colocated with their component/function otherwise.
- Use Zod schemas as the single source of truth for runtime validation, and infer TypeScript types from them (`z.infer<typeof schema>`) rather than maintaining separate parallel types.
- Prefer explicit return types on exported functions, especially in `lib/` business logic.

---

## Naming Conventions

- **Files:** `kebab-case` for files (`order-summary.tsx`, `verify-payment.ts`).
- **Components:** `PascalCase` for component names and their files when the file exports a single component (`ProductCard.tsx`).
- **Functions & variables:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE` for true constants (e.g. `MAX_CART_QUANTITY`).
- **Booleans:** prefix with `is`, `has`, `should` (`isOutOfStock`, `hasVerifiedPayment`).
- **Route handlers / API files:** follow Next.js App Router conventions (`route.ts` inside the relevant `app/api/.../` folder).
- Name things for what they represent in the business domain (`orderStatus`, `deliveryWindowStart`), not generic names (`data`, `temp`, `val`).

---

## Component Structure

- One primary component per file, matching the filename.
- Keep components presentational where possible; push business logic (order calculations, payment verification, inventory checks) into `lib/`.
- Co-locate a component's CSS Module with the component (`ProductCard.tsx` + `ProductCard.module.css`).
- Extract a sub-component when a component exceeds ~150–200 lines or handles more than one clear concern.

---

## Server vs Client

- Default to Server Components; only mark a component `"use client"` when it needs interactivity, state, or browser-only APIs.
- Keep data-fetching and business logic (Prisma queries, Flutterwave calls, order/inventory logic) on the server — never call these directly from client components.
- Route handlers and Server Actions are the only entry points that *may* perform server-side work, but they should orchestrate: validate → authorize → call a function in `lib/<domain>/` → shape the response. Prisma queries and Flutterwave calls belong inside `lib/` (or their domain module), not written inline in a `route.ts`/action body — this keeps logic testable and reusable (see `.agent/rules/architecture.md` and the api-route scaffolder skill).
- Client components must not import server-only modules or run server-only logic; keep the client/server boundary explicit per file.

---

## Validation

- Every external input (form submission, API request body, query param, webhook payload) must be validated with a Zod schema before use.
- Validate on the server, even if the same validation exists on the client. Client-side validation is UX only, never the security boundary.
- Fail closed: if validation fails, reject the operation with a clear error — do not attempt to "fix" or coerce invalid input silently.

---

## Error Handling in Code

- Use try/catch around external calls (Flutterwave, database, network) and handle failure explicitly — don't let unhandled rejections propagate silently.
- Throw or return typed, descriptive errors (not generic `Error("something went wrong")`) so calling code and logs can distinguish failure types.
- Never swallow an error with an empty catch block.
- User-facing error messages must be clear and actionable; internal error detail (stack traces, raw database errors) must never reach the client response.

---

## Comments & Documentation

- Comment *why*, not *what* — the code should already show what it does.
- Document non-obvious business logic inline (e.g. why the 24-hour delivery window is calculated from `confirmedAt` rather than `createdAt`).
- Keep comments up to date — remove or update stale comments when the related code changes.

---

## Testing Conventions

- Unit test business logic in `lib/` (order calculations, inventory checks, payment verification logic) in isolation.
- Integration test flows that cross boundaries (checkout → payment → order creation).
- Test names should describe the scenario and expected outcome (`"rejects checkout when cart is empty"`, not `"test1"`).
- Do not remove or weaken existing tests just to make a change pass — fix the underlying issue instead.

---

## Formatting

- Follow the project's configured linter/formatter (ESLint/Prettier once configured) rather than personal preference.
- Use TypeScript `strict` mode; treat new `any` and `@ts-ignore` as the exceptions that need a stated reason, not the default.
- Keep diffs minimal and scoped to the task — do not reformat unrelated code in the same change.
- Order imports predictably (external packages first, then internal modules) and keep them grouped; this is a linting target once ESLint import rules are configured.

---

## CSS Module Naming

- Use `kebab-case` for class names inside `.module.css` files (e.g. `product-card`, `checkout-summary`).
- Access them in the component with `styles["product-card"]` (or the camelCase key if present, e.g. `styles.productCard`) — be consistent across a file.
- Name classes by what they style, not markup structure; separate presentational classes for layout.
- Use design tokens (`.agent/rules/design-system.md`) for colors/spacing/radius rather than hardcoded values.
