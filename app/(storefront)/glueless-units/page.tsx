import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { gluelessUnitType } from "@/lib/glueless/glueless";
import { BackLink } from "@/components/storefront/BackLink";
import styles from "./glueless.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Glueless Units | Marizhaircastle",
  description:
    "Shop ready-to-wear glueless wigs and full lace units at Marizhaircastle — install effortlessly with no adhesive, no mess. Fast 24-hour delivery in Nigeria.",
};

async function getGluelessTextures() {
  const grouped = await prisma.product.groupBy({
    by: ["texture"],
    where: {
      active: true,
      archived: false,
      type: gluelessUnitType.slug,
      texture: { not: null },
    },
    _count: { id: true },
  });

  return grouped
    .filter((g) => typeof g.texture === "string" && g.texture.trim().length > 0)
    .map((g) => ({
      texture: (g.texture as string).trim(),
      count: g._count.id,
    }))
    .sort((a, b) => a.texture.localeCompare(b.texture));
}

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

export default async function GluelessUnitsPage() {
  const textures = await getGluelessTextures();
  const { name, slug, desc, image, tag } = gluelessUnitType;

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <BackLink label="Back to Collections" fallbackHref="/collections" />
      </div>

      <div className={styles.hero}>
        <span className={styles.eyebrow}>{tag}</span>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.subtitle}>
          {desc}. Choose a texture below to browse every {name.toLowerCase()}{" "}
          option we carry.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>By Texture</h2>
          <p className={styles.sectionDesc}>
            {name} come in different textures and finishes. Tap a texture to
            explore it.
          </p>
        </div>

        {textures.length > 0 ? (
          <div className={styles.typeGrid}>
            {textures.map((tex) => {
              const visual = textureVisuals[tex.texture.toLowerCase()];
              const cardImage = visual?.image || image;
              return (
                <Link
                  key={tex.texture}
                  href={`/products?type=${encodeURIComponent(
                    slug
                  )}&texture=${encodeURIComponent(tex.texture)}`}
                  className={styles.typeCard}
                >
                  <div className={styles.typeImageWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cardImage}
                      alt={`Marizhaircastle ${tex.texture} ${name.toLowerCase()}`}
                      className={styles.typeImage}
                    />
                  </div>
                  <div className={styles.typeBody}>
                    <span className={styles.typeTag}>{tag}</span>
                    <h3 className={styles.typeName}>
                      {tex.texture} {name.toLowerCase()}
                    </h3>
                    <p className={styles.typeDesc}>
                      {visual?.desc ||
                        `Premium ${tex.texture} in a ${name.toLowerCase()} finish.`}
                    </p>
                    <span className={styles.typeAction}>
                      Shop {tex.count} item{tex.count === 1 ? "" : "s"} →
                    </span>
                  </div>
                </Link>
              );
            })}

            <Link
              href={`/products?type=${encodeURIComponent(slug)}`}
              className={`${styles.typeCard} ${styles.allCard}`}
            >
              <div className={styles.typeImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`All ${name}`}
                  className={styles.typeImage}
                />
              </div>
              <div className={styles.typeBody}>
                <span className={styles.typeTag}>Everything</span>
                <h3 className={styles.typeName}>Shop All {name}</h3>
                <p className={styles.typeDesc}>
                  Browse the complete range of {name.toLowerCase()} across every
                  texture and finish.
                </p>
                <span className={styles.typeAction}>View All {name} →</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden="true">
              📦
            </div>
            <h2 className={styles.emptyTitle}>
              New {name} arriving soon
            </h2>
            <p className={styles.emptyDescription}>
              We don&apos;t have stock listed under {name.toLowerCase()} just
              yet. Check back shortly or browse our other collections.
            </p>
            <Link href="/collections" className={styles.emptyLink}>
              Explore other collections
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}