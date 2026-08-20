import type { Metadata } from "next";
import Link from "next/link";
import {
  getFeaturedProducts,
  getCategories,
  getActiveProducts,
} from "@/lib/catalog/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Card } from "@/components/ui/Card";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { StyleCarousel } from "@/components/storefront/StyleCarousel";
import { TrustBar } from "@/components/storefront/TrustBar";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marizhaircastle — Your Hair. Your Crown | Luxury Wigs & Extensions",
  description:
    "Discover 100% virgin human hair wigs, frontal lace units, and premium hair extensions delivered across Nigeria within 24 hours of payment verification.",
};

export default async function HomePage() {
  const [featured, categories, allProducts] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
    getActiveProducts(),
  ]);

  const hairStyles = [
    {
      name: "Bone Straight",
      desc: "Silky smooth, ultra glossy flat-ironed perfection",
      image: "/images/style-bone-straight.jpg",
      tag: "Bone Straight",
    },
    {
      name: "Body Wave",
      desc: "Effortless flowing S-curl volume and natural bounce",
      image: "/images/style-body-wave.jpg",
      tag: "Body Wave",
    },
    {
      name: "Deep Wave",
      desc: "Defined luxury vacation curls with wet-look sheen",
      image: "/images/style-deep-wave.jpg",
      tag: "Deep Wave",
    },
    {
      name: "Pixie Curls",
      desc: "Bouncy, chic short curls with full volume",
      image: "/images/style-pixie-curls.jpg",
      tag: "Pixie Curls",
    },
  ];

  const testimonials = [
    {
      quote:
        "The hair quality is unreal! Zero shedding, pure raw hair sheen, and it arrived in Ikeja exactly 18 hours after my payment confirmed.",
      author: "Adanna O.",
      city: "Lagos, Nigeria",
      rating: "★★★★★",
      style: "Bone Straight 30\" Frontal Wig",
    },
    {
      quote:
        "I was skeptical about the 24-hour promise until the dispatch rider called me the very next morning. The lace is so thin and melted effortlessly!",
      author: "Chioma E.",
      city: "Abuja, Nigeria",
      rating: "★★★★★",
      style: "Deep Wave HD Lace Unit",
    },
    {
      quote:
        "Marizhaircastle is my go-to forever. Customer service answered all my questions, and the hair bundles took bleach so well without losing fullness.",
      author: "Blessing A.",
      city: "Port Harcourt, Nigeria",
      rating: "★★★★★",
      style: "Raw Vietnamese Bundles",
    },
  ];

  return (
    <div className={styles.page}>
      {/* 1. HERO SLIDER SHOWCASE */}
      <HeroSlider />

      {/* 2. MINIMAL TRUST BAR */}
      <TrustBar />

      {/* 3. FEATURED COLLECTION */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>

            <h2 className={styles.sectionTitle}>Find Your Perfect Hair</h2>
          </div>
          <Link href="/collections" className={styles.sectionLink}>
            Shop All Collections →
          </Link>
        </div>

        {/* Categories Bar */}
        <div className={styles.categoryPills}>
          <Link href="/products" className={`${styles.pill} ${styles.pillActive}`}>
            All Units
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={styles.pill}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {featured.length > 0 ? (
          <div className={styles.grid}>
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Products are being added. Check back soon.</p>
        )}
      </section>

      {/* 4. SHOP BY STYLE CAROUSEL */}
      <section className={styles.section}>
        <StyleCarousel products={allProducts.length > 0 ? allProducts : featured} />
      </section>

      {/* 5. EDITORIAL FEATURE SPLIT 1: CUSTOMIZE YOUR WIG */}
      <section className={styles.customWigSection}>
        <div className={styles.customWigContainer}>
          <div className={styles.customWigVisual}>
            <img
              src="/images/mannequin-layered-wig.jpg"
              alt="Marizhaircastle Long Layered Custom Wig on Mannequin"
              className={styles.customWigImage}
            />
          </div>
          <div className={styles.customWigContent}>
            <span className={styles.sectionEyebrow}>Bespoke Craftsmanship</span>
            <h2 className={styles.customWigTitle}>
              Design Your Custom Wig
            </h2>
            <div>
              <Link href="/custom-wig" className={styles.curateButton}>
                Design Your Crown →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL FEATURE SPLIT 2: SIGNATURE CUSTOM HUES */}
      <section className={`${styles.customWigSection} ${styles.customWigSectionAlt}`}>
        <div className={`${styles.customWigContainer} ${styles.customWigContainerReverse}`}>
          <div className={styles.customWigVisual}>
            <img
              src="/images/mannequin-blonde-brown-wig.jpg"
              alt="Marizhaircastle 30-inch Blonde and Brown Balayage Custom Wig on Mannequin"
              className={styles.customWigImage}
            />
          </div>
          <div className={styles.customWigContent}>
            <span className={styles.sectionEyebrow}>Signature Hues</span>
            <h2 className={styles.customWigTitle}>
              Custom Colored Perfection
            </h2>
            <div>
              <Link href="/custom-color" className={styles.curateButton}>
                Curate Your Color →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EDITORIAL FEATURE SPLIT 3: READY TO SHIP UNITS */}
      <section className={styles.customWigSection}>
        <div className={styles.customWigContainer}>
          <div className={styles.customWigVisual}>
            <img
              src="/images/mannequin-bob-wig.jpg"
              alt="Marizhaircastle Ready To Ship Blunt Bob Wig on Mannequin"
              className={styles.customWigImage}
            />
          </div>
          <div className={styles.customWigContent}>
            <span className={styles.sectionEyebrow}>Instant Elegance</span>
            <h2 className={styles.customWigTitle}>
              Ready To Ship Luxury
            </h2>
            <div>
              <Link href="/ready-to-ship" className={styles.curateButton}>
                Shop Ready To Ship →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SOCIAL PROOF / REVIEWS */}
      <section className={styles.reviewsSection}>
        <div className={styles.centerHeader}>
          <span className={styles.sectionEyebrow}>Loved by Nigerian Queens</span>
          <h2 className={styles.sectionTitle}>Client Love & Reviews</h2>
        </div>

        <div className={styles.reviewsGrid}>
          {testimonials.map((t, idx) => (
            <Card key={idx} className={styles.reviewCard}>
              <div className={styles.reviewRating}>{t.rating}</div>
              <p className={styles.reviewQuote}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.reviewAuthor}>
                <strong>{t.author}</strong>
                <span>{t.city}</span>
                <span className={styles.reviewStyleTag}>{t.style}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <span className={styles.ctaEyebrow}>Elevate Your Everyday Look</span>
          <h2 className={styles.ctaTitle}>
            Ready to find your signature look?
          </h2>
          <p className={styles.ctaSub}>
            Discover luxury units tailored to your style. Verified delivery within 24 hours.
          </p>
          <Link href="/products" className={styles.ctaButton}>
            Shop Now →
          </Link>
        </div>
      </section>
    </div>
  );
}