export class PaymentError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type PaymentCustomer = {
  email: string;
  name: string;
  phoneNumber?: string;
};

type PaymentRequest = {
  txRef: string;
  amount: number;
  currency: string;
  customer: PaymentCustomer;
  redirectUrl: string;
};

/**
 * Initializes a Flutterwave Standard payment and returns the hosted
 * checkout link the customer is redirected to.
 */
export async function initializePayment(request: PaymentRequest): Promise<string> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    throw new PaymentError(503, "Payment is not configured. Please try again later.");
  }

  let res: Response;
  try {
    res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: request.txRef,
        amount: request.amount,
        currency: request.currency,
        customer: {
          email: request.customer.email,
          name: request.customer.name,
          phone_number: request.customer.phoneNumber,
        },
        redirect_url: request.redirectUrl,
      }),
    });
  } catch {
    throw new PaymentError(502, "Payment service is unreachable. Please try again later.");
  }

  const data = (await res.json().catch(() => null)) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  } | null;

  if (!res.ok || data?.status !== "success") {
    console.error(
      "Flutterwave payment init failed:",
      res.status,
      data?.message ?? res.statusText
    );
    throw new PaymentError(
      502,
      data?.message === "A transaction with this reference already exists."
        ? "A payment for this order was already started."
        : "Payment could not be initialized. Please try again."
    );
  }

  const link = data.data?.link;
  if (!link) {
    throw new PaymentError(502, "Payment could not be initialized. Please try again.");
  }

  return link;
}
