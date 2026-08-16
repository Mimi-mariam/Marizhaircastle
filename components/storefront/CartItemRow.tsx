"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/format";
import styles from "./CartItemRow.module.css";

export type CartRow = {
  id: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  image: { url: string; alt: string } | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  unavailable: boolean;
};

export function CartItemRow({
  row,
  onGuestUpdate,
  onGuestRemove,
}: {
  row: CartRow;
  onGuestUpdate?: (quantity: number) => void;
  onGuestRemove?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxQuantity = Math.min(row.stock, 99);

  async function updateQuantity(quantity: number) {
    if (pending) return;
    if (onGuestUpdate) {
      onGuestUpdate(quantity);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/cart/item/${row.variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Could not update quantity.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (pending) return;
    if (onGuestRemove) {
      onGuestRemove();
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/cart/item/${row.variantId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Could not remove this item.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles.media}>
        {row.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.image.url}
            alt={row.image.alt || row.productName}
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            {row.productName.charAt(0)}
          </div>
        )}
      </div>

      <div className={styles.details}>
        <p className={styles.productName}>
          <Link href={`/products/${row.productSlug}`}>{row.productName}</Link>
        </p>
        <p className={styles.variantName}>{row.variantName}</p>

        {row.unavailable ? (
          <p className={styles.unavailable}>
            No longer available — please remove this item.
          </p>
        ) : null}

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.controls}>
          <label htmlFor={`qty-${row.variantId}`} className={styles.quantityLabel}>
            Qty
          </label>
          <select
            id={`qty-${row.variantId}`}
            className={styles.quantity}
            value={row.quantity}
            disabled={pending || row.unavailable || maxQuantity === 0}
            onChange={(e) => updateQuantity(Number(e.target.value))}
          >
            {Array.from({ length: Math.max(1, maxQuantity) }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
          <button
            type="button"
            className={styles.remove}
            onClick={remove}
            disabled={pending}
          >
            {pending ? "Updating…" : "Remove"}
          </button>
        </div>
      </div>

      <div className={styles.price}>
        <p className={styles.lineTotal}>
          {formatNaira(row.unitPrice * row.quantity)}
        </p>
        <p className={styles.unitPrice}>{formatNaira(row.unitPrice)} each</p>
      </div>
    </li>
  );
}
