import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { serializeProducts } from "@/lib/catalog/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BackLink } from "@/components/storefront/BackLink";
import styles from "./ready-to-ship.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ready To Ship Luxury Wigs | Marizhaircastle",
  description:
    "Pre-styled, pre-plucked luxury virgin wigs ready for same-day dispatch and 24-hour delivery across Nigeria following payment verification.",
};

const BENEFITS = [
  {
    icon: "⚡",
    title: "24-Hour Express Delivery",
    desc: "Dispatched immediately upon verified payment with priority courier handling across Nigeria.",
  },
  {
    icon: "✨",
    title: "Pre-Plucked & Pre-Styled",
    desc: "Bleached knots, customized hairlines, and salon-styled finish ready to wear straight out of the luxury box.",
  },
  {
    icon: "👑",
    title: "100% Raw Virgin Hair",
    desc: "Single-donor virgin hair units with natural full ends, thick double wefts, and long-lasting lustre.",
  },
  {
    icon: "🛡️",
    title: "Melted HD Lace",
    desc: "Ultra-thin Swiss HD lace closures and frontals designed to blend seamlessly into all skin tones.",
  },
];

export default async function ReadyToShipPage() {
  // Fetch active in-stock wigs and ready-to-wear units
  const products = await prisma.product.findMany({
    where: {
      active: true,
      archived: false,
      category: {
        slug: "wigs",
      },
      variants: {
        some: {
          inventory: {
            stock: { gt: 0 },
          },
        },
      },
    },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
      variants: {
        include: { inventory: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedProducts = serializeProducts(products);

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <BackLink label="Back to Home" fallbackHref="/" />
      </div>

      {/* 1. HERO BANNER */}
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Instant Elegance</span>
        <h1 className={styles.title}>Ready To Ship Luxury</h1>
        <p className={styles.subtitle}>
          No waiting, no delays. Explore our in-stock, masterfully pre-styled
          luxury lace wigs ready for immediate dispatch and guaranteed delivery
          within 24 hours after verified payment.
        </p>
      </section>

      {/* 2. VALUE PROPS */}
      <section className={styles.benefitsGrid}>
        {BENEFITS.map((b) => (
          <div key={b.title} className={styles.benefitCard}>
            <span className={styles.benefitIcon}>{b.icon}</span>
            <h3 className={styles.benefitTitle}>{b.title}</h3>
            <p className={styles.benefitDesc}>{b.desc}</p>
          </div>
        ))}
      </section>

      {/* 3. PRODUCT CATALOG GRID */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>In-Stock Ready to Wear Units</h2>
            <p className={styles.sectionDesc}>
              Showing {serializedProducts.length} premium units available for instant dispatch.
            </p>
          </div>
        </div>

        {serializedProducts.length > 0 ? (
          <div className={styles.grid}>
            {serializedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>New units are being styled!</p>
            <p className={styles.emptyDesc}>
              Our current ready-to-ship batch has sold out. Explore all catalog
              units or design a bespoke custom crown.
            </p>
            <Link href="/products" className={styles.emptyButton}>
              Explore Full Catalog →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
