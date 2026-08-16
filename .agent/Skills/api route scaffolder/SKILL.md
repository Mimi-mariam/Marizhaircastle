---
name: api-route-scaffolder
description: Use this skill whenever creating a new API route, route handler, or Server Action for Marizhaircastle — e.g. "add an endpoint for updating order status," "create the checkout API route," "add a Server Action for adding to cart." Also use when asked to follow the "new-api-route" workflow, or when a task involves the app/api/ folder or any server-side data-mutating endpoint. Ensures every route has input validation, authorization, and error handling wired in from the start rather than bolted on later.
---

# API Route Scaffolder

Standardizes how new server-side endpoints (Next.js route handlers and Server Actions) are built so validation, authorization, and error handling are never skipped. Read `.agent/rules/security.md` and `.agent/rules/code-style.md` first — this skill operationalizes those rules for a specific new route. Consult `.agent/rules/architecture.md` for folder placement conventions referenced in Step 2.

## When to Use

- New route handler under `app/api/.../route.ts`.
- New Server Action (a function marked `"use server"`) that mutates data.
- Not for read-only data fetching inside a Server Component that doesn't need its own endpoint — only for something callable independently (client-invoked mutation, webhook, external-facing API).

## Step-by-Step

### 1. Determine the route's purpose and risk level

Classify before writing anything:
- **Public, unauthenticated** (e.g. product listing, search) → still validate input, but no auth check needed.
- **Authenticated, customer-scoped** (e.g. cart, checkout, own orders) → requires session check + ownership check (the customer can only act on their own data).
- **Admin-only** (e.g. product management, order status updates) → requires session check + role check, server-side, every time.
- **Webhook/external callback** (e.g. Flutterwave) → requires signature/hash verification instead of session auth. See the `flutterwave-integration` skill for payment webhooks specifically.

### 2. Place the file correctly

Follow `.agent/rules/architecture.md`'s folder structure:
- Route handlers: `app/api/<resource>/route.ts` (or nested for sub-resources, e.g. `app/api/orders/[id]/status/route.ts`).
- Server Actions: co-located in `lib/<domain>/actions.ts` (e.g. `lib/orders/actions.ts`) rather than inline in a component file, unless trivially simple and used in exactly one place.

### 3. Define the Zod schema first

Before writing the handler body, define what valid input looks like:

```ts
const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
});
```

> **Placeholder — don't hardwire these values.** The order-status enum above is illustrative only, not confirmed. AGENTS.md's business workflow is *Receive → Verify Payment → Process → Dispatch → Deliver*, and no authoritative status enum exists yet. Before locking an enum, confirm the exact status set with the project owner — don't assert statuses that may be missing (e.g. a paid/confirmed state) or that conflate unrelated stages.

Parse and validate the request body against this schema as the first thing the handler does. Reject with a 400 and a clear error if validation fails — don't proceed with partially-valid data.

### 4. Enforce authorization

Order of operations inside the handler:
1. Parse/validate input (schema).
2. Check authentication (is there a valid session?).
3. Check authorization (can *this* user perform *this* action on *this* resource?).
4. Only then perform the operation.

Never perform the mutation first and check permissions after. Never rely on the client having only shown the button to authorized users — always re-check server-side.

### 5. Implement the operation

- Keep the actual business logic (order status transition rules, inventory checks, etc.) in `lib/<domain>/`, not inline in the route handler — the handler should mostly: validate → authorize → call the lib function → shape the response.
- Wrap multi-step database operations that must succeed or fail together in a Prisma `$transaction`.
- Use try/catch around the operation; on error, log details server-side and return a generic, safe error message to the client.

### 6. Shape the response

- Success: return only what the client needs — don't leak full database records with internal fields (e.g. don't return a full `User` record including password hash, even if it's `null` on the object).
- Error: consistent shape across the project, e.g. `{ error: string }`, with an appropriate HTTP status code (400 validation, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict/duplicate, 500 unexpected).

### 7. Handle concurrency and idempotency where relevant

For any route that creates or mutates something that could be double-submitted (checkout, order creation, payment-adjacent actions):
- Consider what happens if the same request arrives twice (double-click, network retry).
- Use unique constraints or existence checks to prevent duplicate records where appropriate.
- Specifically guard the flows AGENTS.md calls out as duplicate-prone: duplicate order creation, duplicate payment processing/reference, duplicate webhook delivery, and duplicate inventory deduction. Prefer idempotency keys or database-level unique constraints over a "check then insert" that can race under concurrency.

### 8. Verify

- Run typecheck and lint (`npx tsc --noEmit`, `npm run lint`).
- Confirm: does an unauthenticated request get rejected? Does a request from the wrong user get rejected? Does invalid input get rejected with a clear message? Does a valid request succeed and return the expected shape?
- Add/extend a test in `tests/integration/` for the route if the project's test setup exists yet.

## Common Mistakes to Avoid

- Validating on the client only and trusting the server doesn't need to re-check.
- Checking authorization after the database write instead of before.
- Returning raw Prisma errors or stack traces in the API response.
- Building a "temporary" route without auth "just to test it," then forgetting to lock it down.
- Putting business logic directly in the route handler instead of `lib/`, making it untestable and undiscoverable for reuse (e.g. by a Server Action needing the same logic).
