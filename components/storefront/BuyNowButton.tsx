"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/catalog/CartContext";
import styles from "./AddToCart.module.css";
import buyStyles from "./BuyNowButton.module.css";

type CartVariant = {
  id: string;
  name: string;
  stock: number;
};

export function BuyNowButton({ variants }: { variants: CartVariant[] }) {
  const router = useRouter();
  const { setBuyNowItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? null,
    [variants, selectedVariantId]
  );

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const outOfStock = totalStock === 0;
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 99) : 0;

  function handleBuy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (outOfStock || !selectedVariant) return;
    setBuyNowItem({ variantId: selectedVariant.id, quantity });
    router.push("/checkout");
  }

  if (variants.length === 0 || outOfStock) {
    return (
      <p className={styles.unavailable}>This item is not currently available.</p>
    );
  }

  return (
    <form className={buyStyles.form} onSubmit={handleBuy}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Choose option</legend>
        <div className={styles.options}>
          {variants.map((variant) => (
            <label key={variant.id} className={styles.option}>
              <input
                type="radio"
                name="buyNowVariant"
                value={variant.id}
                checked={selectedVariantId === variant.id}
                onChange={() => {
                  setSelectedVariantId(variant.id);
                  setQuantity(1);
                }}
                className={styles.radio}
              />
              <span className={styles.optionLabel}>{variant.name}</span>
              <span
                className={`${styles.optionStock} ${
                  variant.stock === 0 ? styles.optionStockEmpty : ""
                }`}
              >
                {variant.stock === 0
                  ? "Out of stock"
                  : `${variant.stock} available`}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={buyStyles.buyControls}>
        <label htmlFor="buyNowQuantity" className={styles.legend}>
          Quantity
        </label>
        <div className={buyStyles.quantityRow}>
          <select
            id="buyNowQuantity"
            className={styles.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={!selectedVariant || maxQuantity === 0}
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
            type="submit"
            className={buyStyles.buyNowButton}
            disabled={outOfStock || !selectedVariant}
          >
            Buy Now
          </button>
        </div>
      </div>
    </form>
  );
}