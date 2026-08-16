"use client";

import { useRouter } from "next/navigation";
import styles from "./BackLink.module.css";

export function BackLink({
  fallbackHref = "/products",
  label = "Back",
}: {
  fallbackHref?: string;
  label?: string;
}) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  }

  return (
    <button type="button" className={styles.button} onClick={handleBack}>
      <svg
        aria-hidden="true"
        className={styles.icon}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
