import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { createOrder, OrderError } from "@/lib/orders/orders";
import { initializePayment, PaymentError } from "@/lib/payments/flutterwave";
import { deliveryInfoSchema } from "@/lib/validation/checkout";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = deliveryInfoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  let order;
  let totalAmount;
  try {
    ({ order, totalAmount } = await createOrder({
      userId: session?.user?.id ?? null,
      delivery: parsed.data,
      items: parsed.data.items,
    }));
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Checkout order creation failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const paymentLink = await initializePayment({
      txRef: order.orderNumber,
      amount: totalAmount,
      currency: "NGN",
      customer: {
        email: parsed.data.email,
        name: parsed.data.fullName,
        phoneNumber: parsed.data.phone,
      },
      redirectUrl: `${origin}/orders/${order.orderNumber}/confirmation`,
    });

    return NextResponse.json({ orderNumber: order.orderNumber, paymentLink });
  } catch (error) {
    const message =
      error instanceof PaymentError
        ? error.message
        : "Payment could not be initialized. Please try again.";
    console.error("Checkout payment init failed for order", order.orderNumber, error);
    return NextResponse.json(
      { error: message, orderNumber: order.orderNumber },
      { status: error instanceof PaymentError ? error.status : 502 }
    );
  }
}