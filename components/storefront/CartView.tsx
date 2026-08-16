"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/catalog/CartContext";
import { formatNaira } from "@/lib/utils/format";
import { CartItemRow, CartRow } from "@/components/storefront/CartItemRow";
import styles from "./cart.module.css";

interface ServerCartRow extends CartRow {}

export function CartView({ initialServerRows }: { initialServerRows: ServerCartRow[] }) {
  const { data: session, status } = useSession();
  const { isGuest, guestItems, updateGuestItemQuantity, removeGuestItem } = useCart();
  const [guestDetails, setGuestDetails] = useState<
    Array<{
      variantId: string;
      productId: string;
      productName: string;
      productSlug: string;
      variantName: string;
      image: { url: string; alt: string } | null;
      unitPrice: number;
      stock: number;
      unavailable: boolean;
    }>
  >([]);
  const [loadingGuest, setLoadingGuest] = useState(false);

  const isAuthenticated = status === "authenticated";

  // When guest, fetch product/variant info for variantIds in guestItems
  useEffect(() => {
    if (!isGuest || guestItems.length === 0) {
      setGuestDetails([]);
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
          setGuestDetails(data.variants);
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

  let rows: CartRow[] = [];

  if (isAuthenticated) {
    rows = initialServerRows;
  } else {
    rows = guestItems
      .map((item) => {
        const detail = guestDetails.find((d) => d.variantId === item.variantId);
        if (!detail) return null;
        return {
          id: item.variantId,
          variantId: item.variantId,
          productName: detail.productName,
          productSlug: detail.productSlug,
          variantName: detail.variantName,
          image: detail.image,
          unitPrice: detail.unitPrice,
          quantity: item.quantity,
          stock: detail.stock,
          unavailable: detail.unavailable,
        };
      })
      .filter((r): r is CartRow => r !== null);
  }

  const subtotal = rows.reduce((sum, row) => sum + row.unitPrice * row.quantity, 0);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your cart</h1>

      {loadingGuest && rows.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Loading your cart…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Your cart is empty.</p>
          <Link href="/products" className={styles.emptyLink}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <ul className={styles.items}>
            {rows.map((row) => (
              <CartItemRow
                key={row.variantId}
                row={row}
                onGuestUpdate={
                  isGuest
                    ? (qty) => updateGuestItemQuantity(row.variantId, qty)
                    : undefined
                }
                onGuestRemove={
                  isGuest
                    ? () => removeGuestItem(row.variantId)
                    : undefined
                }
              />
            ))}
          </ul>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order summary</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>{formatNaira(subtotal)}</span>
            </div>

            <Link href="/checkout" className={styles.checkoutLink}>
              Proceed to checkout
            </Link>

            <p className={styles.promise}>
              ⚡ Guaranteed 24-hour delivery after payment verification.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
