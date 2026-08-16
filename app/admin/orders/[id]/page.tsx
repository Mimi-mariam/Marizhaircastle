import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { hoursRemainingInDeliveryWindow } from "@/lib/orders/sla";
import styles from "./order-detail.module.css";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      delivery: true,
      payment: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // 24h SLA Calculation
  let slaRemainingText = "Awaiting Payment Confirmation";
  let slaBadgeVariant: "default" | "success" | "warning" | "error" | "info" = "default";

  if (order.confirmedAt && order.status !== "DELIVERED" && order.status !== "CANCELLED") {
    const hoursLeft = hoursRemainingInDeliveryWindow(order.confirmedAt);
    if (hoursLeft > 0) {
      slaRemainingText = `${hoursLeft} hours remaining to deliver within 24h SLA`;
      slaBadgeVariant = hoursLeft < 6 ? "warning" : "info";
    } else {
      slaRemainingText = `${Math.abs(hoursLeft)} hours past the 24h delivery promise`;
      slaBadgeVariant = "error";
    }
  } else if (order.status === "DELIVERED") {
    slaRemainingText = "Order fulfilled and delivered to customer";
    slaBadgeVariant = "success";
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/orders" className={styles["back-link"]}>
            ← Back to Orders
          </Link>
          <h1 className={styles.title}>Order {order.orderNumber}</h1>
          <span className={styles.timestamp}>
            Placed on {new Date(order.createdAt).toLocaleString("en-NG")}
          </span>
        </div>
        <div>
          <Badge
            variant={
              order.status === "DELIVERED"
                ? "success"
                : order.status === "PAYMENT_CONFIRMED" ||
                  order.status === "PROCESSING" ||
                  order.status === "OUT_FOR_DELIVERY"
                ? "info"
                : "warning"
            }
            size="md"
          >
            {order.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* 24h SLA Card */}
      <Card className={styles["sla-card"]}>
        <div className={styles["sla-content"]}>
          <div>
            <strong className={styles["sla-title"]}>24-Hour Delivery Promise</strong>
            <p className={styles["sla-desc"]}>
              {order.confirmedAt
                ? `Verified at: ${new Date(order.confirmedAt).toLocaleString("en-NG")}`
                : "Payment has not been verified yet."}
            </p>
          </div>
          <Badge variant={slaBadgeVariant}>{slaRemainingText}</Badge>
        </div>
      </Card>

      {/* Status control */}
      <OrderStatusControl
        orderId={order.id}
        currentStatus={order.status}
      />

      <div className={styles.grid}>
        {/* Order Items */}
        <Card className={styles.section}>
          <h2 className={styles["section-title"]}>Order Items</h2>
          <div className={styles["items-list"]}>
            {order.items.map((item) => (
              <div key={item.id} className={styles["item-row"]}>
                <div>
                  <strong className={styles["item-name"]}>
                    {item.variant.product.name}
                  </strong>
                  <span className={styles["item-variant"]}>
                    Variant: {item.variant.name} ({item.variant.sku})
                  </span>
                  <span className={styles["item-qty"]}>
                    Qty: {item.quantity} × ₦{Number(item.unitPrice).toLocaleString()}
                  </span>
                </div>
                <strong className={styles["item-total"]}>
                  ₦{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                </strong>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles["summary-row"]}>
              <span>Subtotal</span>
              <span>₦{Number(order.totalAmount).toLocaleString()}</span>
            </div>
            <div className={`${styles["summary-row"]} ${styles.total}`}>
              <strong>Total</strong>
              <strong>₦{Number(order.totalAmount).toLocaleString()}</strong>
            </div>
          </div>
        </Card>

        {/* Customer & Delivery Information */}
        <div className={styles.sidebar}>
          <Card className={styles.section}>
            <h2 className={styles["section-title"]}>Customer Information</h2>
            <div className={styles["info-group"]}>
              <span className={styles["info-label"]}>Name</span>
              <span className={styles["info-val"]}>{order.user.name}</span>
            </div>
            <div className={styles["info-group"]}>
              <span className={styles["info-label"]}>Email</span>
              <span className={styles["info-val"]}>{order.user.email}</span>
            </div>
          </Card>

          <Card className={styles.section}>
            <h2 className={styles["section-title"]}>Delivery Address</h2>
            {order.delivery ? (
              <div className={styles["delivery-info"]}>
                <p className={styles["info-val"]}>
                  <strong>Recipient:</strong> {order.delivery.fullName}
                </p>
                <p className={styles["info-val"]}>
                  <strong>Phone:</strong> {order.delivery.phone}
                </p>
                <p className={styles["info-val"]}>
                  <strong>Address:</strong> {order.delivery.address}
                </p>
                {order.delivery.location && (
                  <p className={styles["info-val"]}>
                    <strong>Location:</strong> {order.delivery.location}
                  </p>
                )}
              </div>
            ) : (
              <p className={styles.empty}>No delivery details attached.</p>
            )}
          </Card>

          <Card className={styles.section}>
            <h2 className={styles["section-title"]}>Payment Verification (Flutterwave)</h2>
            <div className={styles["info-group"]}>
              <span className={styles["info-label"]}>Payment Ref</span>
              <code className={styles.code}>{order.paymentReference || "N/A"}</code>
            </div>
            <div className={styles["info-group"]}>
              <span className={styles["info-label"]}>Verified Amount</span>
              <span className={styles["info-val"]}>
                {order.paidAmount ? `₦${Number(order.paidAmount).toLocaleString()}` : "Not paid"}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
