import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { confirmOrderForPayment } from "@/lib/payments/confirm-order";

const FlutterwaveWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number().int().positive(),
    tx_ref: z.string().min(1),
    status: z.string(),
    amount: z.number().positive(),
    currency: z.string(),
  }),
});

type FlutterwaveWebhook = z.infer<typeof FlutterwaveWebhookSchema>;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;

  // 1. Fail closed on missing config — never default to an insecure fallback.
  if (!secretHash) {
    console.error("Flutterwave webhook: FLUTTERWAVE_WEBHOOK_SECRET_HASH is not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // 2. Validate the signature hash before touching anything.
  if (req.headers.get("verif-hash") !== secretHash) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Validate the payload — never process partial data.
  let payload: FlutterwaveWebhook;
  try {
    payload = FlutterwaveWebhookSchema.parse(await req.json());
  } catch (error) {
    console.error("Flutterwave webhook: invalid payload", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only charge completion events confirm anything; ignore the rest.
  if (payload.event !== "charge.completed") {
    return NextResponse.json({ received: true });
  }

  // 4. Re-verify against Flutterwave and confirm atomically. The webhook's
  //    own status field is never trusted directly.
  const { result } = await confirmOrderForPayment({
    txRef: payload.data.tx_ref,
    transactionId: payload.data.id,
    webhookAmount: payload.data.amount,
  });

  switch (result) {
    case "confirmed":
      break;
    case "already_confirmed":
      break;
    case "not_found":
      console.error(`Flutterwave webhook: no order for tx_ref=${payload.data.tx_ref}`);
      break;
    case "not_successful":
      console.warn(`Flutterwave webhook: transaction ${payload.data.id} not successful`);
      break;
    case "mismatch":
      console.error(
        `Flutterwave webhook: amount/currency mismatch for tx_ref=${payload.data.tx_ref}`
      );
      break;
    case "verification_error":
    case "config_error":
      // Verification could not run — keep the order PENDING_PAYMENT and ask
      // Flutterwave to retry rather than guessing at the outcome.
      return NextResponse.json(
        { error: "Verification unavailable" },
        { status: 502 }
      );
  }

  // Acknowledge quickly; all other outcomes are idempotent from here.
  return NextResponse.json({ received: true });
}
