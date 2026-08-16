import React from "react";
import Link from "next/link";
import styles from "./BrandStory.module.css";

export function BrandStory() {
  return (
    <section id="brand-story" className={styles.section} aria-labelledby="brand-story-title">
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Editorial Visual Column */}
          <div className={styles.visualColumn}>
            <div className={styles.imageWrapper}>
              <img
                src="/images/custom-wig-banner.jpg"
                alt="Marizhaircastle Luxury Hair Craftsmanship"
                className={styles.image}
                loading="lazy"
              />
              <div className={styles.accentBadge}>
                <span className={styles.accentNumber}>100%</span>
                <span className={styles.accentText}>Virgin Hair Guarantee</span>
              </div>
            </div>
          </div>

          {/* Narrative Content Column */}
          <div className={styles.contentColumn}>
            <span className={styles.eyebrow}>Our Heritage & Ethos</span>
            <h2 id="brand-story-title" className={styles.title}>
              Your Crown Deserves Pure Perfection
            </h2>
            <p className={styles.lead}>
              At Marizhaircastle, we believe luxury hair is not merely an accessory — it is an embodiment of confidence, elegance, and personal power.
            </p>
            <p className={styles.paragraph}>
              Every bundle, closure, and custom frontal wig in our collection is carefully hand-selected from pure virgin single-donor hair. We obsess over cuticle alignment, natural density, and knot ventilation so your unit blends seamlessly into your natural hairline from day one.
            </p>
            <p className={styles.paragraph}>
              Based in Lagos, Nigeria, our dedicated concierge ensures every order undergoes rigorous quality verification and dispatches within 24 hours of verified payment.
            </p>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>24h</span>
                <span className={styles.statLabel}>Fast Dispatch</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>5,000+</span>
                <span className={styles.statLabel}>Happy Queens</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>HD</span>
                <span className={styles.statLabel}>Invisible Lace</span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Link href="/products" className={styles.primaryButton}>
                Explore The Collection →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
