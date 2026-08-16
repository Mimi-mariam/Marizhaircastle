import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getCatalogFilterOptions } from "@/lib/catalog/catalog";
import { prisma } from "@/lib/db/prisma";
import styles from "./collections.module.css";

export const metadata: Metadata = {
  title: "Collections & Hair Textures | Marizhaircastle",
  description:
    "Explore luxury human hair collections and shop by signature textures including Bone Straight, Body Wave, Deep Wave, and Pixie Curls.",
};

export default async function CollectionsPage() {
  const [categories, filterOptions] = await Promise.all([
    getCategories(),
    getCatalogFilterOptions(),
  ]);

  // Texture definitions with curated luxury aesthetics
  const textureDetails = [
    {
      name: "Bone Straight",
      desc: "Ultra-silky, mirror-like flat ironed sleek finish",
      image: "/images/style-bone-straight.jpg",
      tag: "Bone Straight",
    },
    {
      name: "Body Wave",
      desc: "Effortless flowing S-curl pattern with natural volume and bounce",
      image: "/images/style-body-wave.jpg",
      tag: "Body Wave",
    },
    {
      name: "Deep Wave",
      desc: "Deeply defined vacation curls with radiant wet-look sheen",
      image: "/images/style-deep-wave.jpg",
      tag: "Deep Wave",
    },
    {
      name: "Pixie Curls",
      desc: "Chic, low-maintenance short curls with bouncy volume",
      image: "/images/style-pixie-curls.jpg",
      tag: "Pixie Curls",
    },
  ];

  // Category visual metadata mapping
  const categoryVisuals: Record<string, { image: string; tag: string }> = {
    wigs: {
      image: "/images/hero-wavy-hair.jpg",
      tag: "Lace Frontals & Closures",
    },
    extensions: {
      image: "/images/extensions-collection.jpg",
      tag: "100% Virgin Raw Bundles & Wefts",
    },
  };

  // Categories that open a dedicated landing page instead of the raw catalog.
  const categoryLandingPages: Record<string, string> = {
    extensions: "/extensions",
  };

  // Get count per category
  const categoryCounts = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { active: true, archived: false, categoryId: { not: null } },
    _count: { id: true },
  });

  const countMap = new Map(
    categoryCounts.map((c) => [c.categoryId, c._count.id])
  );

  return (
    <div className={styles.page}>
      {/* 1. HEADER */}
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Curated Luxury</span>
        <h1 className={styles.title}>Collections & Textures</h1>
        <p className={styles.subtitle}>
          Discover our handcrafted luxury lace wigs, raw bundles, and signature hair
          textures. Fast 24-hour delivery guaranteed across Nigeria.
        </p>
      </div>

      {/* 2. MAIN CATEGORIES */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <p className={styles.sectionDesc}>
            Browse our core hair categories crafted for elegance and longevity.
          </p>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((cat) => {
            const visual = categoryVisuals[cat.slug] || {
              image: "/images/style-bone-straight.jpg",
              tag: "Luxury Human Hair",
            };
            const productCount = countMap.get(cat.id) || 0;
            const landingHref = categoryLandingPages[cat.slug];

            return (
              <Link
                key={cat.id}
                href={landingHref || `/products?category=${cat.slug}`}
                className={styles.categoryCard}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visual.image}
                  alt={`Marizhaircastle ${cat.name}`}
                  className={styles.categoryImage}
                />
                <div className={styles.categoryOverlay} />
                <div className={styles.categoryContent}>
                  <span className={styles.categoryCount}>{visual.tag}</span>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <span className={styles.categoryCta}>
                    {landingHref
                      ? `Explore ${cat.name} Types →`
                      : `Explore Collection (${productCount} items) →`}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            href="/glueless-units"
            className={styles.categoryCard}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ready-to-ship-wig.jpg"
              alt="Marizhaircastle Glueless Units"
              className={styles.categoryImage}
            />
            <div className={styles.categoryOverlay} />
            <div className={styles.categoryContent}>
              <span className={styles.categoryCount}>
                Ready-to-Wear Wigs
              </span>
              <h3 className={styles.categoryName}>Glueless Units</h3>
              <span className={styles.categoryCta}>
                Explore Glueless Unit Types →
              </span>
            </div>
          </Link>

          <Link
            href="/products"
            className={styles.categoryCard}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mannequin-layered-wig.jpg"
              alt="Marizhaircastle Best Sellers"
              className={styles.categoryImage}
            />
            <div className={styles.categoryOverlay} />
            <div className={styles.categoryContent}>
              <span className={styles.categoryCount}>
                Top-Rated Styles
              </span>
              <h3 className={styles.categoryName}>Best Sellers</h3>
              <span className={styles.categoryCta}>
                Shop Best Sellers →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. SIGNATURE TEXTURES */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Hair Texture</h2>
          <p className={styles.sectionDesc}>
            Find the exact wave pattern and texture that matches your vibe and crown.
          </p>
        </div>

        <div className={styles.textureGrid}>
          {textureDetails.map((tex) => (
            <Link
              key={tex.tag}
              href={`/products?texture=${encodeURIComponent(tex.tag)}`}
              className={styles.textureCard}
            >
              <div className={styles.textureImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tex.image}
                  alt={`Marizhaircastle ${tex.name}`}
                  className={styles.textureImage}
                />
              </div>
              <div className={styles.textureBody}>
                <h3 className={styles.textureName}>{tex.name}</h3>
                <p className={styles.textureDesc}>{tex.desc}</p>
                <span className={styles.textureAction}>Shop Texture →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
