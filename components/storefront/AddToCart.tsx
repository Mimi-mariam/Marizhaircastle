"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/catalog/CartContext";
import styles from "./AddToCart.module.css";

type CartVariant = {
  id: string;
  name: string;
  stock: number;
};

type Status = "idle" | "loading" | "success" | "error";

export function AddToCart({ variants }: { variants: CartVariant[] }) {
  const { addGuestItem, refreshCartCount } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? null,
    [variants, selectedVariantId]
  );

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const outOfStock = totalStock === 0;
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 99) : 0;

  function handleVariantChange(variantId: string) {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setStatus("idle");
    setMessage(null);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || outOfStock || !selectedVariant) return;
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
        }),
      });

      if (res.status === 401) {
        // Guest user: save locally to guest cart
        addGuestItem(selectedVariant.id, quantity);
        setStatus("success");
        setMessage(
          `Added ${quantity} × ${selectedVariant.name} to your cart.`
        );
        return;
      }

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        itemCount?: number;
      } | null;

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(
        `Added ${quantity} × ${selectedVariant.name} to your cart.`
      );
      await refreshCartCount();
    } catch {
      addGuestItem(selectedVariant.id, quantity);
      setStatus("success");
      setMessage(
        `Added ${quantity} × ${selectedVariant.name} to your cart.`
      );
    }
  }

  if (variants.length === 0) {
    return (
      <p className={styles.unavailable}>This product is not available yet.</p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleAdd}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Choose option</legend>
        <div className={styles.options}>
          {variants.map((variant) => (
            <label key={variant.id} className={styles.option}>
              <input
                type="radio"
                name="variant"
                value={variant.id}
                checked={selectedVariantId === variant.id}
                onChange={() => handleVariantChange(variant.id)}
                className={styles.radio}
              />
              <span className={styles.optionLabel}>{variant.name}</span>
              <span
                className={`${styles.optionStock} ${
                  variant.stock === 0 ? styles.optionStockEmpty : ""
                }`}
              >
                {variant.stock === 0 ? "Out of stock" : `${variant.stock} available`}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.controls}>
        <div className={styles.quantityWrap}>
          <label htmlFor="quantity" className={styles.legend}>
            Quantity
          </label>
          <select
            id="quantity"
            className={styles.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={outOfStock || !selectedVariant || maxQuantity === 0}
          >
            {Array.from({ length: Math.max(1, maxQuantity) }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={outOfStock || status === "loading" || !selectedVariant}
        >
          {outOfStock
            ? "Out of stock"
            : status === "loading"
            ? "Adding…"
            : "Add to cart"}
        </button>
      </div>

      {status === "success" ? (
        <p className={styles.success} role="status">
          {message}
        </p>
      ) : null}
      {status === "error" ? (
        <p className={styles.error} role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
