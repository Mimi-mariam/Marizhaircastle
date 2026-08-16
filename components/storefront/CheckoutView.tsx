"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/format";
import { useCart } from "@/lib/catalog/CartContext";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { DELIVERY_ZONES, DeliveryZoneId, DEFAULT_DELIVERY_ZONE } from "@/lib/orders/delivery-zones";
import styles from "./checkout.module.css";

type Row = {
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
};

export function CheckoutView({
  user,
  initialServerRows,
}: {
  user: { name: string; email: string } | null;
  initialServerRows: Row[];
}) {
  const { isGuest, guestItems, buyNowItem } = useCart();
  const [selectedZone, setSelectedZone] = useState<DeliveryZoneId>(DEFAULT_DELIVERY_ZONE);
  const [guestRows, setGuestRows] = useState<Row[]>([]);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [buyNowRow, setBuyNowRow] = useState<Row | null>(null);
  const [buyNowResolved, setBuyNowResolved] = useState(false);

  useEffect(() => {
    if (!isGuest || guestItems.length === 0) {
      setGuestRows([]);
      return;
    }

    let cancelled = false;
    setLoadingGuest(true);

    const variantIds = Array.from(new Set(guestItems.map((i) => i.variantId)));

    fetch("/api/cart/guest-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantIds }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.variants) {
          const map = new Map<string, { productName: string; variantName: string; unitPrice: number }>(
            data.variants.map((v: any) => [
              v.variantId,
              { productName: v.productName, variantName: v.variantName, unitPrice: v.unitPrice },
            ])
          );
          const computed = guestItems
            .map((item) => {
              const d = map.get(item.variantId);
              if (!d) return null;
              return {
                variantId: item.variantId,
                productName: d.productName,
                variantName: d.variantName,
                quantity: item.quantity,
                unitPrice: d.unitPrice,
              };
            })
            .filter((r): r is Row => r !== null);
          setGuestRows(computed);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingGuest(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isGuest, guestItems]);

  useEffect(() => {
    if (!buyNowItem) return;

    let cancelled = false;

    fetch("/api/cart/guest-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantIds: [buyNowItem.variantId] }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const v = data?.variants?.[0];
        if (v && !v.unavailable) {
          setBuyNowRow({
            variantId: v.variantId,
            productName: v.productName,
            variantName: v.variantName,
            quantity: buyNowItem.quantity,
            unitPrice: v.unitPrice,
          });
        } else {
          setBuyNowRow(null);
        }
      })
      .catch(() => {
        if (!cancelled) setBuyNowRow(null);
      })
      .finally(() => {
        if (!cancelled) setBuyNowResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [buyNowItem]);

  const rows = buyNowItem
    ? buyNowRow
      ? [buyNowRow]
      : []
    : user
    ? initialServerRows
    : guestRows;
  const subtotal = rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);
  const deliveryFee = DELIVERY_ZONES[selectedZone].fee;
  const total = subtotal + deliveryFee;

  const buyNowLoading = Boolean(buyNowItem && !buyNowResolved);

  if (!loadingGuest && !buyNowLoading && rows.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <h1 className={styles.title}>Checkout</h1>
        <div className={styles.empty}>
          <p>{buyNowItem ? "This item is no longer available." : "Your cart is empty — add items before checking out."}</p>
          <Link href={buyNowItem ? "/products" : "/products"} className={styles.emptyLink}>
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <CheckoutForm
            user={user}
            summary={{
              rows,
              subtotal,
            }}
            onZoneChange={(zone) => setSelectedZone(zone)}
          />
        </div>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <ul className={styles.summaryItems}>
            {rows.map((r) => (
              <li key={r.variantId} className={styles.summaryItem}>
                <div className={styles.summaryItemInfo}>
                  <strong className={styles.summaryName}>{r.productName}</strong>
                  <span className={styles.summaryVariant}>{r.variantName}</span>
                  <span className={styles.summaryQty}>Qty: {r.quantity}</span>
                </div>
                <span className={styles.summaryPrice}>
                  {formatNaira(r.unitPrice * r.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery ({DELIVERY_ZONES[selectedZone].name.split("(")[0].trim()})</span>
            <span>{formatNaira(deliveryFee)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
          <p className={styles.promise}>
            ⚡ Guaranteed delivery within 24 hours after payment verification.
          </p>
        </aside>
      </div>
    </div>
  );
}
