---
name: flutterwave-integration
description: Use this skill any time payment, checkout, transaction verification, or webhook logic touches Flutterwave in the Marizhaircastle codebase. This includes initiating a payment, verifying a transaction, writing or editing the payment webhook/callback handler, reconciling order/payment state, or debugging a failed/duplicate/pending payment. Trigger this even if the user just says "hook up payments," "checkout isn't confirming," "add the webhook," or "the order didn't update after payment" — any payment-adjacent task in this project should consult this skill before writing code.
---

# Flutterwave Integration

Governs how Marizhaircastle integrates with Flutterwave for payment initiation, verification, and webhook handling. Read `security.md` in `.agent/rules/` first — this skill implements those rules, it doesn't override them.

## Core Rule

**Payment status is only ever true after server-side verification against Flutterwave.** Never mark an order paid based on:
- A frontend redirect/query param alone
- A webhook payload without signature verification
- An unverified `status: successful` string anywhere in a client-controlled request

## Payment Flow

```
Checkout submitted
      ↓
Order created with status = PENDING_PAYMENT
      ↓
Client redirected to Flutterwave (or inline modal via Flutterwave's SDK)
      ↓
Customer completes payment on Flutterwave
      ↓
TWO independent confirmation paths (handle both, use whichever arrives first,
but never trust either without verification):
      ├── (a) Client redirected back to a return URL
      └── (b) Flutterwave sends a webhook to your webhook endpoint
      ↓
On either path: call Flutterwave's "Verify Transaction" endpoint
using the transaction ID/reference — never trust the redirect
or webhook payload's stated status directly
      ↓
Verification confirms: status === "successful"
   AND amount === expected order amount
   AND currency === "NGN"
      ↓
Only then: mark order PAYMENT_CONFIRMED, deduct inventory,
record payment.confirmedAt (this timestamp starts the 24h delivery window)
```

## Implementation Steps

1. **Environment setup** — `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH` in `.env` (never commit; add names-only to `.env.example`). Confirm with the user before assuming test vs live keys.
2. **Initiate payment** — server-side route/action in `lib/payments/` that creates the pending order first, then calls Flutterwave's payment initiation with the order's amount, currency (`NGN`), and a `tx_ref` tied to the internal order ID.
3. **Verification utility** — a single reusable function in `lib/payments/verify-transaction.ts` that calls Flutterwave's verify-by-ID endpoint and returns a normalized result. Every code path that could confirm a payment (redirect handler, webhook handler) must call this same function — don't duplicate verification logic.
4. **Webhook handler** — see `resources/webhook-handler.ts` for the reference implementation. Must:
   - Validate the `verif-hash` header against `FLUTTERWAVE_WEBHOOK_SECRET_HASH` before processing anything.
   - Re-verify the transaction via the API (don't trust the webhook body's status field even after hash validation — hash proves origin, not correctness).
   - Be idempotent: if the order is already `PAYMENT_CONFIRMED`, return success without reprocessing.
   - Respond quickly (Flutterwave expects a fast 200) — do heavy work after acknowledging, or keep the handler lean.
5. **Redirect/return handler** — on the customer's return from Flutterwave, re-verify server-side using the same utility from step 3. Never read payment success from the URL query string directly.
6. **Reconciliation** — since webhook and redirect can both fire, guard order updates with a transaction and a status check (`if order.status !== 'PENDING_PAYMENT', skip`) to avoid double-processing.

## Edge Cases to Handle

Reference `.agent/rules/security.md` and the Payments section of `AGENT.md` §17 for the full list. Minimum required here:
- Duplicate webhook delivery → idempotent, no double order confirmation.
- Webhook arrives before redirect, or vice versa → whichever arrives first verifies and confirms; the second is a no-op.
- Payment amount mismatch → do not confirm the order; flag for manual review, log the discrepancy.
- Payment fails/cancelled → set order status to `PAYMENT_FAILED` or `CANCELLED`, release any soft-held inventory, allow the customer to retry checkout.
- Verification API call times out or errors → do not assume success or failure; retry verification, keep order in `PENDING_PAYMENT`, do not silently drop the order.

## What NOT to Do

- Don't build a "test mode" that skips verification, even temporarily — use Flutterwave's test/sandbox keys instead.
- Don't store full card details, even encrypted — Flutterwave handles the card; store only transaction reference, status, and amount.
- Don't confirm an order from a scheduled job that "checks in" on pending payments as the primary mechanism — it can be a safety-net fallback, but redirect + webhook + verification is the primary path.

## Resources

- `resources/webhook-handler.ts` — reference implementation of the webhook route handler (signature validation, re-verification, idempotent order update). Adapt to the project's actual route conventions once `app/api/` exists.
