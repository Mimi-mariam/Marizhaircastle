import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts } from "@/lib/catalog/catalog";
import { gluelessUnitType } from "@/lib/glueless/glueless";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductCardProduct } from "@/components/storefront/ProductCard";
import { BackLink } from "@/components/storefront/BackLink";
import styles from "./glueless.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Glueless Units | Marizhaircastle",
  description:
    "Shop ready-to-wear glueless wigs and full lace units at Marizhaircastle — install effortlessly with no adhesive, no mess. Fast 24-hour delivery in Nigeria.",
};

const textureVisuals: Record<string, { desc: string; image: string }> = {
  "bone straight": {
    desc: "Ultra-silky, mirror-like flat ironed sleek finish",
    image: "/images/style-bone-straight.jpg",
  },
  "body wave": {
    desc: "Effortless flowing S-curl pattern with natural volume and bounce",
    image: "/images/style-body-wave.jpg",
  },
  "deep wave": {
    desc: "Deeply defined vacation curls with radiant wet-look sheen",
    image: "/images/style-deep-wave.jpg",
  },
  "pixie curls": {
    desc: "Chic, low-maintenance short curls with bouncy volume",
    image: "/images/style-pixie-curls.jpg",
  },
};

interface TextureGroup {
  key: string;
  label: string;
  count: number;
  products: ProductCardProduct[];
}

export default async function GluelessUnitsPage() {
  const products = await getActiveProducts({ type: gluelessUnitType.slug });
  const { name, slug, desc, tag } = gluelessUnitType;

  const groups: TextureGroup[] = [];
  const groupByKey = new Map<string, TextureGroup>();

  for (const p of products) {
    const rawTex = p.texture?.trim() || "Premium";
    const key = rawTex.toLowerCase();
    let group = groupByKey.get(key);
    if (!group) {
      group = { key, label: rawTex, count: 0, products: [] };
      groupByKey.set(key, group);
      groups.push(group);
    }
    group.count += 1;
    group.products.push(p as ProductCardProduct);
  }

  const sortedGroups = [...groups].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const totalProducts = products.length;

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <BackLink label="Back to Collections" fallbackHref="/collections" />
      </div>

      <div className={styles.hero}>
        <span className={styles.eyebrow}>{tag}</span>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.subtitle}>
          {desc}. Browse every {name.toLowerCase()} we carry below — tap any
          item to view details or add it straight to your cart.
        </p>
      </div>

      {/* Quick texture jump links */}
      {sortedGroups.length > 0 && (
        <nav className={styles.chipRow} aria-label="Jump to a glueless texture">
          {sortedGroups.map((g) => (
            <a key={g.key} href={`#texture-${g.key.replace(/\s+/g, "-")}`} className={styles.chip}>
              {g.label} ({g.count})
            </a>
          ))}
          <Link href={`/products?type=${encodeURIComponent(slug)}`} className={styles.chip}>
            Shop All {name} →
          </Link>
        </nav>
      )}

      {products.length > 0 ? (
        <>
          {sortedGroups.map((g) => {
            const visual = textureVisuals[g.key];
            return (
              <section
                key={g.key}
                id={`texture-${g.key.replace(/\s+/g, "-")}`}
                className={styles.section}
              >
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{g.label}</h2>
                  <p className={styles.sectionDesc}>
                    {visual?.desc ||
                      `Premium ${g.label} in a ${name.toLowerCase()} finish.`}{" "}
                    {g.count} unit{g.count === 1 ? "" : "s"} available.
                  </p>
                </div>

                <div className={styles.productGrid}>
                  {g.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}

          <div className={styles.allFooter}>
            <Link
              href={`/products?type=${encodeURIComponent(slug)}`}
              className={styles.allButton}
            >
              Browse All {totalProducts} {name.toLowerCase()} →
            </Link>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            📦
          </div>
          <h2 className={styles.emptyTitle}>New {name} arriving soon</h2>
          <p className={styles.emptyDescription}>
            We don&apos;t have stock listed under {name.toLowerCase()} just
            yet. Check back shortly or browse our other collections.
          </p>
          <Link href="/collections" className={styles.emptyLink}>
            Explore other collections
          </Link>
        </div>
      )}
    </div>
  );
}