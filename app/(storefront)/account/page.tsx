import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { hoursRemainingInDeliveryWindow } from "@/lib/orders/sla";
import styles from "./account-page.module.css";

export const dynamic = "force-dynamic";

export default async function CustomerAccountPage() {
  const user = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      delivery: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>
            {user.role === "ADMIN" ? "Administrator Account" : "Customer Portal"}
          </span>
          <h1 className={styles.title}>Welcome back, {user.name}</h1>
          <p className={styles.subtitle}>{user.email}</p>
        </div>

        {user.role === "ADMIN" && (
          <div className={styles.adminBanner}>
            <div className={styles.adminBannerContent}>
              <span className={styles.adminBannerTitle}>👑 Store Management</span>
              <p className={styles.adminBannerText}>
                You have administrative access to manage products, inventory, orders, and 24h delivery dispatch.
              </p>
            </div>
            <Link href="/admin" className={styles.adminPortalButton}>
              Open Admin Dashboard →
            </Link>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {/* Orders Overview */}
        <div className={styles["orders-section"]}>
          <div className={styles["section-header"]}>
            <h2 className={styles["section-title"]}>Your Orders & Tracking</h2>
            <span className={styles["orders-count"]}>{orders.length} orders</span>
          </div>

          {orders.length === 0 ? (
            <Card className={styles.empty}>
              <p>You haven&apos;t placed any hair orders yet.</p>
              <Link href="/products" className={styles["browse-btn"]}>
                Discover Hair Collections →
              </Link>
            </Card>
          ) : (
            <div className={styles["orders-list"]}>
              {orders.map((order) => {
                // 24h SLA text
                let slaText = "Payment Pending";

                if (order.confirmedAt && order.status !== "DELIVERED" && order.status !== "CANCELLED") {
                  const hoursLeft = hoursRemainingInDeliveryWindow(order.confirmedAt);
                  slaText =
                    hoursLeft > 0
                      ? `Estimated delivery within ~${hoursLeft}h`
                      : "Delivery dispatch in progress";
                } else if (order.status === "DELIVERED") {
                  slaText = "Delivered";
                }

                return (
                  <Card key={order.id} className={styles["order-card"]}>
                    <div className={styles["order-card-header"]}>
                      <div>
                        <span className={styles["order-number"]}>
                          Order #{order.orderNumber}
                        </span>
                        <span className={styles["order-date"]}>
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className={styles["badges-group"]}>
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
                        >
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>

                    {/* 24-hour guarantee badge */}
                    <div className={styles["sla-banner"]}>
                      <span className={styles["sla-icon"]}>⚡</span>
                      <span className={styles["sla-text"]}>{slaText}</span>
                    </div>

                    <div className={styles["order-items"]}>
                      {order.items.map((item) => (
                        <div key={item.id} className={styles["item-row"]}>
                          <span>
                            {item.quantity}x {item.variant.product.name} ({item.variant.name})
                          </span>
                          <strong>
                            ₦{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className={styles["order-footer"]}>
                      <div className={styles["total-block"]}>
                        <span className={styles["total-label"]}>Total Paid</span>
                        <span className={styles["total-amount"]}>
                          ₦{Number(order.totalAmount).toLocaleString()}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${order.orderNumber}/confirmation`}
                        className={styles["track-link"]}
                      >
                        View Live Tracking →
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Profile & Guarantee Sidebar */}
        <div className={styles.sidebar}>
          <Card className={styles["promise-card"]}>
            <h3 className={styles["promise-title"]}>Our 24-Hour Delivery Promise</h3>
            <p className={styles["promise-desc"]}>
              For all verified payments in Nigeria, your premium hair bundles and lace
              wigs are packaged, quality-checked, and dispatched within 24 hours.
            </p>
          </Card>

          <Card className={styles["support-card"]}>
            <h3 className={styles["promise-title"]}>Need Assistance?</h3>
            <p className={styles["promise-desc"]}>
              Our concierge team is available to assist with hair styling advice,
              custom lace fitting, or delivery inquiries.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
