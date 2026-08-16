"use client";

import React, { useState, useEffect } from "react";
import styles from "./OrderTracker.module.css";

type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_FAILED";

interface OrderTrackerProps {
  status: OrderStatus;
  confirmedAt?: string | Date | null;
  orderNumber: string;
}

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  {
    status: "PAYMENT_CONFIRMED",
    label: "Payment Confirmed",
    description: "Verified server-side via Flutterwave",
  },
  {
    status: "PROCESSING",
    label: "Quality Inspection & Packing",
    description: "Density check, lace prep & luxury boxing",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Dispatched",
    description: "Handed over to priority dispatch rider",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    description: "Safely delivered to customer",
  },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  status,
  confirmedAt,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!confirmedAt || status === "DELIVERED" || status === "CANCELLED" || status === "PAYMENT_FAILED") {
      return;
    }

    const confirmedDate = new Date(confirmedAt).getTime();
    const targetTime = confirmedDate + 24 * 60 * 60 * 1000; // 24 Hours SLA

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, expired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [confirmedAt, status]);

  // Determine current active step index
  const getStepIndex = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case "PAYMENT_CONFIRMED":
        return 0;
      case "PROCESSING":
        return 1;
      case "OUT_FOR_DELIVERY":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return -1;
    }
  };

  const activeIndex = getStepIndex(status);

  if (status === "CANCELLED" || status === "PAYMENT_FAILED" || status === "PENDING_PAYMENT") {
    return null;
  }

  return (
    <div className={styles.trackerContainer}>
      {/* 24-Hour SLA Timer Banner */}
      {confirmedAt && status !== "DELIVERED" && timeLeft && (
        <div className={styles.timerBanner}>
          <div className={styles.timerHeader}>
            <span className={styles.timerBadge}>⚡ 24-Hour Delivery Guarantee</span>
            <span className={styles.timerSub}>Window started upon payment verification</span>
          </div>
          <div className={styles.timerCountdown}>
            {timeLeft.expired ? (
              <span className={styles.expiredNotice}>Fulfillment in final dispatch stage</span>
            ) : (
              <>
                <div className={styles.timeBox}>
                  <span className={styles.timeVal}>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className={styles.timeUnit}>HRS</span>
                </div>
                <span className={styles.colon}>:</span>
                <div className={styles.timeBox}>
                  <span className={styles.timeVal}>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className={styles.timeUnit}>MIN</span>
                </div>
                <span className={styles.colon}>:</span>
                <div className={styles.timeBox}>
                  <span className={styles.timeVal}>{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className={styles.timeUnit}>SEC</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Visual Timeline Steps */}
      <div className={styles.timeline}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.status}
              className={`${styles.stepItem} ${
                isCompleted ? styles.completedStep : ""
              } ${isCurrent ? styles.currentStep : ""}`}
            >
              <div className={styles.stepConnectorLine} />
              <div className={styles.stepIconWrapper}>
                {isCompleted ? "✓" : idx + 1}
              </div>
              <div className={styles.stepInfo}>
                <h4 className={styles.stepTitle}>{step.label}</h4>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
