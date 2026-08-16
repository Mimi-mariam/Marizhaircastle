import { prisma } from "@/lib/db/prisma";
import { PaymentError } from "@/lib/payments/flutterwave";
import { verifyTransaction } from "@/lib/payments/verify-transaction";

const EXPECTED_CURRENCY = "NGN";

export type ConfirmResult =
  | "confirmed"
  | "already_confirmed"
  | "not_found"
  | "not_successful"
  | "mismatch"
  | "verification_error"
  | "config_error";

/**
 * The single confirmation path for a payment. Verifies the transaction with
 * Flutterwave, checks currency + amount against the stored order, then marks
 * the order PAYMENT_CONFIRMED and deducts inventory atomically and idempotently.
 *
 * `confirmedAt` is recorded here — it starts the 24-hour delivery window.
 */
export async function confirmOrderForPayment(params: {
  txRef: string;
  transactionId: number;
  webhookAmount?: number;
}): Promise<{ result: ConfirmResult }> {
  const { txRef, transactionId, webhookAmount } = params;

  let verified;
  try {
    verified = await verifyTransaction(transactionId);
  } catch (error) {
    if (error instanceof PaymentError && error.status === 503) {
      return { result: "config_error" };
    }
    return { result: "verification_error" };
  }

  // Only successful transactions confirm anything.
  if (verified.status !== "successful") {
    await prisma.order.updateMany({
      where: { paymentReference: txRef, status: "PENDING_PAYMENT" },
      data: { status: "PAYMENT_FAILED" },
    });
    return { result: "not_successful" };
  }

  // Cross-check the webhook's stated amount against the verification result.
  if (webhookAmount != null && verified.amount !== webhookAmount) {
    return { result: "mismatch" };
  }

  if (verified.currency !== EXPECTED_CURRENCY) {
    return { result: "mismatch" };
  }

  const order = await prisma.order.findFirst({
    where: { paymentReference: txRef },
    include: { items: true },
  });
  if (!order) {
    return { result: "not_found" };
  }

  // The amount Flutterwave collected must equal the expected order amount.
  if (verified.amount !== order.totalAmount.toNumber()) {
    return { result: "mismatch" };
  }

  const confirmed = await confirmOrderAndDeductInventory({
    orderId: order.id,
    txRef,
    transactionId,
    paidAmount: verified.amount,
  });

  return { result: confirmed ? "confirmed" : "already_confirmed" };
}

/**
 * Marks the order confirmed and deducts inventory in a single transaction.
 * Idempotent via a status guard on the order update; inventory is never
 * decremented below zero.
 */
async function confirmOrderAndDeductInventory(params: {
  orderId: string;
  txRef: string;
  transactionId: number;
  paidAmount: number;
}): Promise<boolean> {
  const { orderId, txRef, transactionId, paidAmount } = params;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING_PAYMENT" },
      data: {
        status: "PAYMENT_CONFIRMED",
        paidAmount,
        confirmedAt: new Date(),
      },
    });

    // Nothing matched → already confirmed, not found, or not pending. No-op.
    if (updated.count === 0) {
      return false;
    }

    const order = await tx.order.findFirst({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      throw new Error(`Order ${orderId} disappeared during confirmation`);
    }

    for (const item of order.items) {
      const result = await tx.inventory.updateMany({
        where: { variantId: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        console.error(
          `Insufficient stock to fulfill order ${order.orderNumber} for variant ${item.variantId}`
        );
      }
    }

    await tx.payment.create({
      data: {
        orderId,
        flutterwaveTxnId: BigInt(transactionId),
        reference: txRef,
        status: "SUCCESSFUL",
        amount: paidAmount,
        currency: EXPECTED_CURRENCY,
      },
    });

    return true;
  });
}
