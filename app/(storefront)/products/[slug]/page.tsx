import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/catalog/catalog";
import { formatNaira } from "@/lib/utils/format";
import { AddToCart } from "@/components/storefront/AddToCart";
import { ProductMediaGallery } from "@/components/storefront/ProductMediaGallery";
import { BackLink } from "@/components/storefront/BackLink";
import styles from "./product.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const variants = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    stock: variant.inventory?.stock ?? 0,
  }));

  const attributes = [
    { label: "Type", value: product.type },
    { label: "Length", value: product.length },
    { label: "Texture", value: product.texture },
    { label: "Color", value: product.color },
  ].filter((a): a is { label: string; value: string } => Boolean(a.value));

  const isWig = product.category?.slug === "wigs";

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <BackLink label="Back" />
      </div>

      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/products">Shop</Link>
        {product.category ? (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/products?category=${product.category.slug}`}>
              {product.category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className={styles.layout}>
        <div className={styles.media}>
          <ProductMediaGallery
            productName={product.name}
            images={product.images}
            videoUrl={product.videoUrl}
          />
        </div>

        <div className={styles.info}>
          {product.category ? (
            <p className={styles.category}>{product.category.name}</p>
          ) : null}
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatNaira(product.price)}</span>
            {product.previousPrice ? (
              <span className={styles.previousPrice}>
                {formatNaira(product.previousPrice)}
              </span>
            ) : null}
          </div>

          <p className={styles.description}>{product.description}</p>

          {attributes.length > 0 ? (
            <dl className={styles.attributes}>
              {attributes.map((attr) => (
                <div key={attr.label} className={styles.attribute}>
                  <dt className={styles.attributeLabel}>{attr.label}</dt>
                  <dd className={styles.attributeValue}>{attr.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {product.careInfo ? (
            <div className={styles.careInfo}>
              <h2 className={styles.careTitle}>Care instructions</h2>
              <p>{product.careInfo}</p>
            </div>
          ) : null}

          <div className={styles.buyBox}>
            <AddToCart variants={variants} />
          </div>

          <p className={styles.promise}>
            Delivery promise: within 24 hours after successful payment
            verification.
          </p>
        </div>
      </div>
    </div>
  );
}
