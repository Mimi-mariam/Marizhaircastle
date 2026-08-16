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

  function handleBack(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      // Check if there is an in-app referrer or history entry
      const hasReferrer =
        document.referrer &&
        document.referrer.startsWith(window.location.origin);

      if (hasReferrer || window.history.length > 2) {
        router.back();
      } else {
        router.push(fallbackHref);
      }
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleBack}
      aria-label={label}
    >
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
