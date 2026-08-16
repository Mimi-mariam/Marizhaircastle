import type { Metadata } from "next";
import Link from "next/link";
import {
  getActiveProducts,
  getCategories,
  getCatalogFilterOptions,
} from "@/lib/catalog/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductFilters } from "@/components/storefront/ProductFilters";
import { BackLink } from "@/components/storefront/BackLink";
import styles from "./catalog.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Hair Collections | Marizhaircastle",
  description:
    "Explore luxury human hair wigs, raw bundles, frontals, closures, and custom units. Fast delivery in Nigeria.",
};

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    by?: string;
    q?: string;
    texture?: string;
    type?: string;
    length?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: "newest" | "price-asc" | "price-desc" | "name-asc";
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const categorySlug = typeof params.category === "string" ? params.category : undefined;
  const browseByTexture = params.by === "texture";
  const search = typeof params.q === "string" ? params.q : undefined;
  const texture = typeof params.texture === "string" ? params.texture : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const length = typeof params.length === "string" ? params.length : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const inStockOnly = params.inStock === "true";
  const sortBy = params.sort;

  const [products, categories, filterOptions] = await Promise.all([
    getActiveProducts({
      categorySlug,
      search,
      texture,
      type,
      length,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
    }),
    getCategories(),
    getCatalogFilterOptions(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <BackLink label="Back to Collections" fallbackHref="/collections" />
        <h1 className={styles.title}>
          {activeCategory
            ? activeCategory.name
            : texture && type
            ? `${texture} ${type}`
            : type
            ? `${type} Extensions`
            : search
            ? `Results for "${search}"`
            : browseByTexture
            ? "Shop By Texture"
            : texture
            ? `${texture} Hair`
            : "Shop All Collections"}
        </h1>
        <p className={styles.subtitle}>
          Premium 100% human hair wigs and extensions. Guaranteed 24-hour dispatch
          following payment verification.
        </p>
      </div>

      <ProductFilters
        categories={categories}
        availableTextures={filterOptions.textures}
        availableLengths={filterOptions.lengths}
        totalResults={products.length}
      />

      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            🔍
          </div>
          <h2 className={styles.emptyTitle}>No matching hair products found</h2>
          <p className={styles.emptyDescription}>
            We couldn&apos;t find any items matching your selected search or filter
            criteria. Try clearing some filters or searching with different terms.
          </p>
          <Link href="/products" className={styles.emptyLink}>
            Clear all filters & browse catalog
          </Link>
        </div>
      )}
    </div>
  );
}