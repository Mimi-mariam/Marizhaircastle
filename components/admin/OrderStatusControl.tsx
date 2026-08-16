"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import styles from "./OrderStatusControl.module.css";

interface OrderStatusControlProps {
  orderId: string;
  currentStatus: string;
}

export const OrderStatusControl: React.FC<OrderStatusControlProps> = ({
  orderId,
  currentStatus,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const allowedTransitions = [
    { label: "Payment Confirmed", value: "PAYMENT_CONFIRMED" },
    { label: "Processing (Packaging & Quality Check)", value: "PROCESSING" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered (Fulfilled)", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  const handleUpdate = async () => {
    if (status === currentStatus) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      setFeedback({ type: "success", text: "Order status updated successfully!" });
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update order status";
      setFeedback({ type: "error", text: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <label htmlFor="order-status-select" className={styles.label}>
        Update Fulfillment Progress
      </label>
      <div className={styles.row}>
        <select
          id="order-status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isLoading}
          className={styles.select}
        >
          {allowedTransitions.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <Button
          onClick={handleUpdate}
          disabled={status === currentStatus || isLoading}
          isLoading={isLoading}
        >
          Save Status
        </Button>
      </div>

      {feedback && (
        <p
          className={`${styles.feedback} ${
            feedback.type === "success" ? styles.success : styles.error
          }`}
        >
          {feedback.text}
        </p>
      )}

      <p className={styles.note}>
        * Per business rule: 24h delivery window starts only upon verified payment.
        Orders are never auto-marked delivered.
      </p>
    </div>
  );
};
