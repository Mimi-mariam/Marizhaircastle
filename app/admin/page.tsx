import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./admin-overview.module.css";

export default async function AdminDashboardPage() {
  // Fetch overview metrics
  const [paidOrders, totalProducts, lowStockItems, recentOrders] =
    await Promise.all([
      prisma.order.count({
        where: {
          status: {
            in: ["PAYMENT_CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED"],
          },
        },
      }),
      prisma.product.count({ where: { archived: false } }),
      prisma.inventory.findMany({
        where: { stock: { lte: 3 } },
        include: {
          variant: {
            include: { product: true },
          },
        },
        take: 5,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: true,
          items: {
            include: { variant: { include: { product: true } } },
          },
          delivery: true,
        },
      }),
    ]);

  // Aggregate total revenue from paid orders
  const revenueAgg = await prisma.order.aggregate({
    _sum: { paidAmount: true },
    where: {
      status: {
        in: ["PAYMENT_CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED"],
      },
    },
  });

  const totalRevenue = revenueAgg._sum.paidAmount
    ? Number(revenueAgg._sum.paidAmount)
    : 0;

  // Active delivery count (paid, but not yet marked delivered)
  const activeSlaDeliveries = await prisma.order.count({
    where: {
      status: { in: ["PAYMENT_CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY"] },
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.title}>Store Performance & SLA</h1>
          <p className={styles.subtitle}>
            Monitor verified payments, inventory levels, and 24-hour fulfillment.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/products/new" className={styles["cta-link"]}>
            + Add New Hair Product
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={styles["metrics-grid"]}>
        <Card className={styles["metric-card"]}>
          <span className={styles["metric-label"]}>Total Verified Revenue</span>
          <span className={styles["metric-value"]}>
            ₦{totalRevenue.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </span>
          <span className={styles["metric-hint"]}>
            From {paidOrders} verified transactions
          </span>
        </Card>

        <Card className={styles["metric-card"]}>
          <span className={styles["metric-label"]}>24h Delivery Queue</span>
          <span className={`${styles["metric-value"]} ${styles.highlight}`}>
            {activeSlaDeliveries} Orders
          </span>
          <span className={styles["metric-hint"]}>Awaiting fulfillment/dispatch</span>
        </Card>

        <Card className={styles["metric-card"]}>
          <span className={styles["metric-label"]}>Active Products</span>
          <span className={styles["metric-value"]}>{totalProducts}</span>
          <span className={styles["metric-hint"]}>Catalog styles available</span>
        </Card>

        <Card className={styles["metric-card"]}>
          <span className={styles["metric-label"]}>Low Stock Alerts</span>
          <span
            className={`${styles["metric-value"]} ${
              lowStockItems.length > 0 ? styles.warning : ""
            }`}
          >
            {lowStockItems.length} Variants
          </span>
          <span className={styles["metric-hint"]}>Stock ≤ 3 units</span>
        </Card>
      </div>

      <div className={styles["sections-grid"]}>
        {/* Recent Orders Section */}
        <Card className={styles.section}>
          <div className={styles["section-header"]}>
            <h2 className={styles["section-title"]}>Recent Orders</h2>
            <Link href="/admin/orders" className={styles["section-link"]}>
              View all orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className={styles.empty}>No orders recorded yet.</p>
          ) : (
            <div className={styles["orders-list"]}>
              {recentOrders.map((order) => (
                <div key={order.id} className={styles["order-row"]}>
                  <div className={styles["order-info"]}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={styles["order-number"]}
                    >
                      {order.orderNumber}
                    </Link>
                    <span className={styles["order-customer"]}>
                      {order.delivery?.fullName || order.user.name}
                    </span>
                    <span className={styles["order-date"]}>
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className={styles["order-status"]}>
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "success"
                          : order.status === "PAYMENT_CONFIRMED" ||
                            order.status === "PROCESSING" ||
                            order.status === "OUT_FOR_DELIVERY"
                          ? "info"
                          : order.status === "PAYMENT_FAILED" ||
                            order.status === "CANCELLED"
                          ? "error"
                          : "warning"
                      }
                    >
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <span className={styles["order-amount"]}>
                      ₦{Number(order.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Low Stock Alerts */}
        <Card className={styles.section}>
          <div className={styles["section-header"]}>
            <h2 className={styles["section-title"]}>Low Stock Items</h2>
            <Link href="/admin/inventory" className={styles["section-link"]}>
              Manage inventory →
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p className={styles.empty}>All inventory levels are healthy.</p>
          ) : (
            <div className={styles["stock-list"]}>
              {lowStockItems.map((inv) => (
                <div key={inv.id} className={styles["stock-row"]}>
                  <div>
                    <strong className={styles["stock-product"]}>
                      {inv.variant.product.name}
                    </strong>
                    <span className={styles["stock-variant"]}>
                      Variant: {inv.variant.name} ({inv.variant.sku})
                    </span>
                  </div>
                  <Badge variant={inv.stock === 0 ? "error" : "warning"}>
                    {inv.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
