import type { Metadata } from "next";
import Link from "next/link";
import { BrandStory } from "@/components/storefront/BrandStory";
import { WhyChooseUs } from "@/components/storefront/WhyChooseUs";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Us | Marizhaircastle — Luxury Wigs & Human Hair",
  description:
    "Learn about Marizhaircastle's heritage, ethical raw human hair sourcing, bespoke wig craftsmanship, and 24-hour delivery promise in Nigeria.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>The Heritage</span>
        <h1 className={styles.title}>About Marizhaircastle</h1>
        <p className={styles.subtitle}>
          Crafting pure virgin hair crowns for modern royalty. Designed with luxury, longevity, and natural texture in mind.
        </p>
      </div>

      <BrandStory />

      <WhyChooseUs />

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Experience The Crown Standard</h2>
          <p className={styles.ctaText}>
            Explore our curated ready-to-ship wigs and virgin raw bundles today.
          </p>
          <Link href="/products" className={styles.ctaButton}>
            Shop All Collections →
          </Link>
        </div>
      </section>
    </div>
  );
}
