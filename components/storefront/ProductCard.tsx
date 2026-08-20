"use client";

import type { Decimal } from "@prisma/client/runtime/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/utils/format";
import { useCart } from "@/lib/catalog/CartContext";
import styles from "./ProductCard.module.css";

export type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  price: Decimal | number;
  previousPrice: Decimal | number | null;
  category: { name: string } | null;
  images: { url: string; alt: string }[];
  videoUrl?: string | null;
  variants?: {
    id: string;
    name: string;
    inventory?: { stock: number } | null;
  }[];
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const router = useRouter();
  const { addGuestItem, refreshCartCount } = useCart();
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const image = product.images[0];

  // Calculate total stock across variants
  const variants = product.variants || [];
  const totalStock = variants.reduce(
    (sum, v) => sum + (v.inventory?.stock ?? 0),
    0
  );
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 3;
  const defaultVariant = variants.find((v) => (v.inventory?.stock ?? 0) > 0) || variants[0];

  async function handleQuickAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultVariant || isOutOfStock || adding) return;

    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: defaultVariant.id,
          quantity: 1,
        }),
      });

      if (res.status === 401) {
        // Unauthenticated guest user: store locally in guest cart
        addGuestItem(defaultVariant.id, 1);
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
        return;
      }

      if (res.ok) {
        setAddSuccess(true);
        await refreshCartCount();
        setTimeout(() => setAddSuccess(false), 2000);
      }
    } catch {
      // Gracefully fallback to guest cart on network error
      addGuestItem(defaultVariant.id, 1);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.mediaContainer}>
        <Link
          href={`/products/${product.slug}`}
          className={styles.mediaLink}
          aria-label={product.name}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt || product.name}
              className={styles.image}
            />
          ) : (
            <div className={styles.imageFallback} aria-hidden="true">
              {product.name.charAt(0)}
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className={styles.badgeContainer}>
          {product.videoUrl && (
            <span className={`${styles.badge} ${styles.badgeVideo}`}>
              ▶ Video
            </span>
          )}
          {isOutOfStock ? (
            <span className={`${styles.badge} ${styles.badgeOutOfStock}`}>
              Not Available
            </span>
          ) : isLowStock ? (
            <span className={`${styles.badge} ${styles.badgeLowStock}`}>
              Low-in-stock
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeInStock}`}>
              In-stock
            </span>
          )}
        </div>

        {/* Quick Add to Cart Icon Button */}
        {!isOutOfStock && defaultVariant ? (
          <button
            type="button"
            className={`${styles.cartButton} ${addSuccess ? styles.cartButtonSuccess : ""}`}
            onClick={handleQuickAddToCart}
            disabled={adding}
            title={addSuccess ? "Added to cart!" : "Quick add to cart"}
            aria-label={addSuccess ? "Added to cart" : `Add ${product.name} to cart`}
          >
            {adding ? (
              <span className={styles.loadingSpinner} aria-hidden="true" />
            ) : addSuccess ? (
              <svg
                className={styles.cartIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                className={styles.cartIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                <path d="M12 9v6m-3-3h6" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      <div className={styles.body}>
        {product.category ? (
          <p className={styles.category}>{product.category.name}</p>
        ) : null}
        <h2 className={styles.title}>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h2>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatNaira(product.price)}</span>
          {product.previousPrice ? (
            <span className={styles.previousPrice}>
              {formatNaira(product.previousPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}