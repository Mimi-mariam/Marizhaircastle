import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Prisma, OrderStatus } from "@prisma/client";
import { hoursRemainingInDeliveryWindow } from "@/lib/orders/sla";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import styles from "./orders-page.module.css";

interface OrdersPageProps {
  searchParams?: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminOrdersPage(props: OrdersPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const statusFilter = searchParams.status;
  const searchQuery = searchParams.q?.trim();

  const ORDER_STATUS_VALUES = new Set<string>(Object.values(OrderStatus));

  function isOrderStatus(value: string | undefined): value is OrderStatus {
    return value !== undefined && ORDER_STATUS_VALUES.has(value);
  }

  const whereClause: Prisma.OrderWhereInput = {};
  if (statusFilter && isOrderStatus(statusFilter)) {
    whereClause.status = statusFilter;
  }

  if (searchQuery) {
    whereClause.OR = [
      { orderNumber: { contains: searchQuery, mode: "insensitive" } },
      { paymentReference: { contains: searchQuery, mode: "insensitive" } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
      { delivery: { fullName: { contains: searchQuery, mode: "insensitive" } } },
      { delivery: { email: { contains: searchQuery, mode: "insensitive" } } },
      { delivery: { phone: { contains: searchQuery, mode: "insensitive" } } },
      { delivery: { address: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      delivery: true,
      items: {
        include: { variant: { include: { product: true } } },
      },
      payment: true,
    },
  });

  const filterTabs = [
    { label: "All Orders", value: "" },
    { label: "Payment Confirmed", value: "PAYMENT_CONFIRMED" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Payment Pending/Failed", value: "PENDING_PAYMENT" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Orders & 24h SLA Fulfillment</h1>
          <p className={styles.subtitle}>
            Track delivery dispatch times starting strictly after payment verification.
          </p>
        </div>
      </div>

      <div className={styles.searchBarWrapper}>
        <form className={styles.searchForm} method="GET" action="/admin/orders">
          {statusFilter && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <div className={styles.searchInputWrapper}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery || ""}
              placeholder="Search by Order #, Customer, Phone, or Ref..."
              className={styles.searchInput}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
          {searchQuery && (
            <Link
              href={statusFilter ? `/admin/orders?status=${statusFilter}` : "/admin/orders"}
              className={styles.clearSearchBtn}
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabs}>
        {filterTabs.map((tab) => {
          const tabHref = tab.value
            ? searchQuery
              ? `/admin/orders?status=${tab.value}&q=${encodeURIComponent(searchQuery)}`
              : `/admin/orders?status=${tab.value}`
            : searchQuery
            ? `/admin/orders?q=${encodeURIComponent(searchQuery)}`
            : "/admin/orders";

          return (
            <Link
              key={tab.value}
              href={tabHref}
              className={`${styles.tab} ${
                (statusFilter || "") === tab.value ? styles["tab-active"] : ""
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>No orders found matching the selected filter.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment & Status</TableHead>
              <TableHead>24h Delivery SLA</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              // Calculate 24h SLA remaining if payment is confirmed
              let slaText = "Awaiting verified payment";
              let slaVariant: "default" | "success" | "warning" | "error" | "info" = "default";

              if (order.confirmedAt && order.status !== "DELIVERED" && order.status !== "CANCELLED") {
                const hoursLeft = hoursRemainingInDeliveryWindow(order.confirmedAt);

                if (hoursLeft > 0) {
                  slaText = `${hoursLeft}h left in window`;
                  slaVariant = hoursLeft < 6 ? "warning" : "info";
                } else {
                  slaText = `${Math.abs(hoursLeft)}h overdue`;
                  slaVariant = "error";
                }
              } else if (order.status === "DELIVERED") {
                slaText = "Delivered";
                slaVariant = "success";
              }

              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={styles["order-link"]}
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className={styles["customer-cell"]}>
                      <strong>{order.delivery?.fullName || order.user.name}</strong>
                      <span className={styles["customer-phone"]}>
                        {order.delivery?.phone || order.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={styles["items-count"]}>
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </TableCell>
                  <TableCell>
                    <strong>₦{Number(order.totalAmount).toLocaleString()}</strong>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Badge variant={slaVariant} size="sm">
                      {slaText}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={styles["view-btn"]}
                    >
                      Process →
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
