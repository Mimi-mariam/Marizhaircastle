import { PaymentError } from "@/lib/payments/flutterwave";

export type VerifiedTransaction = {
  id: number;
  status: string;
  amount: number;
  currency: string;
};

/**
 * Re-verifies a Flutterwave transaction by its ID. Every code path that could
 * confirm a payment (webhook, redirect handler) must call this same function —
 * never trust a webhook body or redirect query string on its own.
 */
export async function verifyTransaction(
  transactionId: number
): Promise<VerifiedTransaction> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    throw new PaymentError(503, "Payment is not configured.");
  }

  let res: Response;
  try {
    res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
  } catch {
    throw new PaymentError(502, "Payment verification is unreachable.");
  }

  const data = (await res.json().catch(() => null)) as {
    status?: string;
    message?: string;
    data?: { id?: number; status?: string; amount?: number; currency?: string };
  } | null;

  if (!res.ok || data?.status !== "success") {
    console.error(
      "Flutterwave verification failed:",
      res.status,
      data?.message ?? res.statusText
    );
    throw new PaymentError(502, "Payment could not be verified.");
  }

  const tx = data.data;
  if (!tx || typeof tx.id !== "number" || typeof tx.amount !== "number") {
    throw new PaymentError(502, "Payment could not be verified.");
  }

  return {
    id: tx.id,
    status: tx.status ?? "unknown",
    amount: tx.amount,
    currency: tx.currency ?? "",
  };
}
