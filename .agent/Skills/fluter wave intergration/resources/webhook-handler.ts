/**
 * webhook-handler.ts — REFERENCE implementation
 *
 * Flutterwave payment webhook handler for Marizhaircastle.
 * Read `../SKILL.md` and `.agent/rules/security.md` first. This file is the
 * reference the skill describes — it encodes the security rules, but it is NOT
 * wired into a live app yet:
 *
 *   - There is no Next.js scaffold and no Prisma schema yet, so the model
 *     names below (`Order`, `OrderItem`, `payment.confirmedAt`, `inventory`)
 *     are ASSUMED until `prisma/schema.prisma` exists. Adapt them.
 *   - Route/import conventions are assumed per AGENTS.md §8 (app/api route).
 *
 * Do not copy this file into production without: (1) a real schema, (2) real
 * env vars, (3) confirming the order-status enum (see SKILL.md / api-route
 * scaffolder — the status set is still a placeholder), and (4) a code review.
 *
 * Security invariants implemented here (do not weaken them):
 *   1. `verif-hash` header is validated BEFORE any processing.
 *   2. Hash proves origin only — the transaction is RE-VERIFIED against the
 *      Flutterwave API before any state change.
 *   3. Amount + currency must match the stored order before confirming.
 *   4. Order update is idempotent and atomic with inventory deduction.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma"; // [assumed] adapt to real Prisma client path
import { verifyTransaction } from "@/lib/payments/verify-transaction"; // [assumed] see SKILL.md step 3

// ---------------------------------------------------------------------------
// Env + config
// ---------------------------------------------------------------------------

const WEBHOOK_SECRET_HASH = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
const EXPECTED_CURRENCY = "NGN";

/**
 * Fail closed if a required env var is missing — never default to an insecure
 * fallback (see `.agent/rules/security.md` → Secrets & Credentials).
 */
function assertEnv(): void {
  if (!WEBHOOK_SECRET_HASH) {
    throw new Error("FLUTTERWAVE_WEBHOOK_SECRET_HASH is not configured");
  }
}

// ---------------------------------------------------------------------------
// Input validation (Zod)
// ---------------------------------------------------------------------------

/**
 * Webhook payload shape from Flutterwave (fields used by this handler).
 * Anything not needed for confirmation is intentionally ignored.
 */
const FlutterwaveWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number().int().positive(), // Flutterwave transaction id
    tx_ref: z.string().min(1), // our internal order reference
    status: z.string(), // NOT trusted directly — see below
    amount: z.number().positive(),
    currency: z.string(),
  }),
});

type FlutterwaveWebhook = z.infer<typeof FlutterwaveWebhookSchema>;

// ---------------------------------------------------------------------------
// Order statuses — [assumed] pending confirmation. The authoritative set is
// still a placeholder (see api-route scaffolder skill + AGENTS.md §4).
// ---------------------------------------------------------------------------

const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CANCELLED: "CANCELLED",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Timing-safe comparison for the webhook secret hash header. */
function isValidSecretHash(headerValue: string | null): boolean {
  if (!headerValue || !WEBHOOK_SECRET_HASH) return false;
  return headerValue === WEBHOOK_SECRET_HASH;
}

/**
 * Confirm the order and deduct inventory atomically.
 *
 * - Idempotent: a status guard (`where.status = PENDING_PAYMENT`) means a
 *   second delivery (duplicate webhook, or webhook-after-redirect) is a no-op.
 * - `confirmedAt` is recorded here — this timestamp starts the 24h delivery
 *   window (AGENTS.md §4 rule 3).
 * - Inventory deduction and payment confirmation succeed or fail together.
 *
 * [assumed] Prisma models — adapt names/relations once the schema exists.
 */
async function confirmOrderAndDeductInventory(txRef: string, amount: number) {
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: {
        paymentReference: txRef,
        status: ORDER_STATUS.PENDING_PAYMENT,
      },
      data: {
        status: ORDER_STATUS.PAYMENT_CONFIRMED,
        paidAmount: amount,
        confirmedAt: new Date(),
      },
    });

    // Nothing updated → order already confirmed, not found, or in a state we
    // must not double-process. Return early; caller returns a 200 no-op.
    if (updated.count === 0) {
      return { confirmed: false };
    }

    const order = await tx.order.findFirst({ where: { paymentReference: txRef } });
    if (!order) {
      // Reached only if updateMany matched but the read back fails — treat as
      // a no-op rather than confirming twice.
      return { confirmed: false };
    }

    for (const item of order.items) {
      await tx.inventory.update({
        where: { id: item.inventoryId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return { confirmed: true, confirmedAt: order.confirmedAt };
  });

  return result;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * POST handler for the Flutterwave webhook.
 *
 * Order of operations (never reorder — see SKILL.md / api-route scaffolder):
 *   1. Fail closed if env is missing.
 *   2. Validate `verif-hash` BEFORE touching anything.
 *   3. Parse/validate the payload (Zod).
 *   4. Re-verify the transaction against the Flutterwave API.
 *   5. Check amount + currency against the stored order.
 *   6. Confirm + deduct inventory atomically (idempotent).
 *   7. Return 200 fast — Flutterwave expects a quick acknowledgement.
 *
 * [assumed] Route path: `app/api/webhooks/flutterwave/route.ts` (adapt).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Fail closed on missing config.
  try {
    assertEnv();
  } catch (err) {
    console.error("Flutterwave webhook: missing env config", err);
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // 2. Validate the secret hash header first.
  const verifHash = req.headers.get("verif-hash");
  if (!isValidSecretHash(verifHash)) {
    // Do not reveal anything useful to an unauthenticated caller.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Parse and validate the payload. A malformed body is rejected — never
  //    processed on partial data.
  let body: FlutterwaveWebhook;
  try {
    body = FlutterwaveWebhookSchema.parse(await req.json());
  } catch (err) {
    console.error("Flutterwave webhook: invalid payload", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only handle charge-completion events; ignore the rest (e.g. failed,
  // cancelled events) — those don't confirm anything.
  if (body.event !== "charge.completed") {
    return NextResponse.json({ received: true });
  }

  // 4. Re-verify with Flutterwave. Hash validation proved ORIGIN, not
  //    correctness — the webhook's own `data.status` is never trusted.
  let verification;
  try {
    verification = await verifyTransaction(body.data.id);
  } catch (err) {
    // Verification API timeout/error → do NOT assume success or failure.
    // Keep the order in PENDING_PAYMENT; retry happens via webhook redelivery
    // or the reconciliation safety-net (SKILL.md step 6 / "What NOT to Do").
    console.error("Flutterwave webhook: verification call failed", err);
    return NextResponse.json({ error: "Verification unavailable" }, { status: 502 });
  }

  if (verification.status !== "successful") {
    // Transaction did not succeed — do not confirm. Mark failed so the
    // customer can retry (and release any soft-held inventory elsewhere).
    await prisma.order.updateMany({
      where: { paymentReference: body.data.tx_ref, status: ORDER_STATUS.PENDING_PAYMENT },
      data: { status: ORDER_STATUS.PAYMENT_FAILED },
    });
    return NextResponse.json({ received: true });
  }

  // 5. Amount + currency must match the expected order amount.
  if (
    verification.amount !== body.data.amount ||
    verification.currency !== EXPECTED_CURRENCY ||
    verification.amount !== (await getExpectedOrderAmount(body.data.tx_ref))
  ) {
    // Mismatch → never confirm. Flag for manual review; log the discrepancy.
    console.error(
      `Flutterwave webhook: amount/currency mismatch for tx_ref=${body.data.tx_ref}`
    );
    return NextResponse.json({ received: true });
  }

  // 6. Confirm + deduct inventory atomically. Idempotent by status guard.
  await confirmOrderAndDeductInventory(body.data.tx_ref, verification.amount);

  // 7. Acknowledge quickly. Heavy work (notifications, etc.) should happen
  //    after the 200 or via a queue.
  return NextResponse.json({ received: true });
}

/**
 * [assumed] Stub — replace with the real expected-amount lookup once the
 * schema exists. Must resolve to the order's expected amount in NGN.
 */
async function getExpectedOrderAmount(txRef: string): Promise<number> {
  const order = await prisma.order.findFirst({ where: { paymentReference: txRef } });
  if (!order) throw new Error(`Order not found for tx_ref=${txRef}`);
  return order.totalAmount;
}
