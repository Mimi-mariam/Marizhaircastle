"use client";

import Link from "next/link";
import { useCart } from "@/lib/catalog/CartContext";
import styles from "./CartLink.module.css";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className={styles.cartLink} aria-label="Your cart">
      <svg
        className={styles.cartIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {itemCount > 0 ? (
        <span className={styles.badge} aria-label={`${itemCount} items in cart`}>
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}