import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/storefront/BackLink";
import { extensionTypes } from "@/lib/extensions/extensionTypes";
import styles from "./extensions.module.css";

export const metadata: Metadata = {
  title: "Hair Extensions by Type | Marizhaircastle",
  description:
    "Explore luxury human hair extensions by type — bundles, closures, frontals, ponytails, and clip-ins & tape-ins. Fast delivery across Nigeria.",
};

export default function ExtensionsPage() {
  return (
    <div className={styles.page}>
      {/* 0. NAVIGATION */}
      <div className={styles.nav}>
        <BackLink label="Back to Collections" fallbackHref="/collections" />
      </div>

      {/* 1. HEADER */}
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Luxury Extensions</span>
        <h1 className={styles.title}>Extensions by Type</h1>
        <p className={styles.subtitle}>
          Discover the perfect extension style for your crown — from raw bundles and
          lace frontals to ready-to-wear ponytails. Fast 24-hour delivery across Nigeria.
        </p>
      </div>

      {/* 2. EXTENSION TYPES GRID */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Choose Your Extension Type</h2>
          <p className={styles.sectionDesc}>
            Tap a type to explore every option we carry in that category.
          </p>
        </div>

        <div className={styles.typeGrid}>
          {extensionTypes.map((type) => (
            <Link
              key={type.slug}
              href={`/extensions/${encodeURIComponent(type.slug)}`}
              className={styles.typeCard}
            >
              <div className={styles.typeImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={type.image}
                  alt={`Marizhaircastle ${type.name}`}
                  className={styles.typeImage}
                />
              </div>
              <div className={styles.typeBody}>
                <span className={styles.typeTag}>{type.tag}</span>
                <h3 className={styles.typeName}>{type.name}</h3>
                <p className={styles.typeDesc}>{type.desc}</p>
                <span className={styles.typeAction}>Shop {type.name} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Can&apos;t decide? Shop everything.</h2>
        <p className={styles.ctaSub}>
          Browse the full Marizhaircastle catalog and filter by texture, length, and price.
        </p>
        <Link href="/products?category=extensions" className={styles.ctaButton}>
          Shop All Extensions →
        </Link>
      </section>
    </div>
  );
}
