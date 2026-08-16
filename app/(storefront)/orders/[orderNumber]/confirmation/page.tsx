import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForUser, getOrderByNumber } from "@/lib/orders/orders";
import { confirmOrderForPayment } from "@/lib/payments/confirm-order";
import { formatNaira } from "@/lib/utils/format";
import { OrderTracker } from "@/components/storefront/OrderTracker";
import styles from "./confirmation.module.css";

export const metadata: Metadata = {
  title: "Order Confirmation | Marizhaircastle",
};

const STATUS_TEXT: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment pending — your order has not been paid yet.",
  PAYMENT_CONFIRMED: "Payment confirmed — we're preparing your luxury order.",
  PROCESSING: "Your order is currently undergoing density inspection & preparation.",
  OUT_FOR_DELIVERY: "Your order has been handed to our priority dispatch rider.",
  DELIVERED: "Your order has been successfully delivered.",
  CANCELLED: "This order was cancelled.",
  PAYMENT_FAILED: "Payment failed — please contact support to complete your order.",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ transaction_id?: string; tx_ref?: string }>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  let order = user
    ? await getOrderForUser(user.id, orderNumber)
    : await getOrderByNumber(orderNumber);

  if (!order) notFound();

  // Secondary confirmation path: the customer returned from Flutterwave's
  // hosted checkout. Verify server-side using the same utility as the webhook
  // (never trust the redirect query string on its own). Idempotent — if the
  // webhook already confirmed this order, this is a no-op.
  if (order.status === "PENDING_PAYMENT") {
    const query = await searchParams;
    const transactionId = Number(query.transaction_id);
    const txRef = query.tx_ref || order.paymentReference || undefined;
    if (txRef && Number.isInteger(transactionId) && transactionId > 0) {
      await confirmOrderForPayment({ txRef, transactionId });
      order = user
        ? await getOrderForUser(user.id, orderNumber)
        : await getOrderByNumber(orderNumber);
      if (!order) notFound();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Order #{order.orderNumber}</h1>
        <span className={styles.dateTag}>
          {new Date(order.createdAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className={styles.status}>
        <p className={styles.statusText}>{STATUS_TEXT[order.status]}</p>
        <p className={styles.promise}>
          Delivery promise: within 24 hours after successful payment verification.
        </p>
      </div>

      {/* Interactive 24h SLA Countdown & Order Stage Tracker */}
      <OrderTracker
        status={order.status}
        confirmedAt={order.confirmedAt}
        orderNumber={order.orderNumber}
      />

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Items</h2>
        <ul className={styles.items}>
          {order.items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.itemName}>
                {item.variant.product.name} — {item.variant.name} × {item.quantity}
              </span>
              <span>{formatNaira(item.unitPrice.toNumber() * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.totalRow}>
          <span>Total paid</span>
          <span>{formatNaira(order.totalAmount.toNumber())}</span>
        </div>
      </div>

      {order.delivery ? (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Delivery details</h2>
          <p className={styles.deliveryLine}>{order.delivery.fullName}</p>
          <p className={styles.deliveryLine}>{order.delivery.address}</p>
          {order.delivery.location ? (
            <p className={styles.deliveryLine}>{order.delivery.location}</p>
          ) : null}
          <p className={styles.deliveryLine}>{order.delivery.phone}</p>
          <p className={styles.deliveryLine}>{order.delivery.email}</p>
        </div>
      ) : null}

      <div className={styles.actions}>
        <Link href="/" className={styles.homeLink}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}