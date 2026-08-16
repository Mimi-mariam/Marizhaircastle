import React from "react";
import styles from "./TrustBar.module.css";

const BADGES = [
  { icon: "✨", text: "100% Virgin Human Hair" },
  { icon: "⚡", text: "24-Hour Verified Dispatch" },
  { icon: "💎", text: "HD Melt Invisible Lace" },
  { icon: "🔒", text: "Secure Flutterwave Payments" },
];

export function TrustBar() {
  return (
    <section className={styles.wrapper} aria-label="Brand guarantees">
      <div className={styles.container}>
        {BADGES.map((b, idx) => (
          <div key={idx} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              {b.icon}
            </span>
            <span className={styles.text}>{b.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
