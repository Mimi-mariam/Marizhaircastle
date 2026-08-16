import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import {
  getExtensionTypeBySlug,
  type ExtensionType,
} from "@/lib/extensions/extensionTypes";
import { BackLink } from "@/components/storefront/BackLink";
import styles from "./extension-type.module.css";

export const dynamic = "force-dynamic";

interface ExtensionTypePageProps {
  params: Promise<{ type: string }>;
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

export async function generateMetadata({
  params,
}: ExtensionTypePageProps): Promise<Metadata> {
  const { type } = await params;
  const extensionType = getExtensionTypeBySlug(type);
  if (!extensionType) return { title: "Extensions | Marizhaircastle" };
  return {
    title: `${extensionType.name} by Type | Marizhaircastle`,
    description: `Shop every ${extensionType.name.toLowerCase()} we carry at Marizhaircastle — ${extensionType.desc}. Fast 24-hour delivery in Nigeria.`,
  };
}

async function getSubTypes(extensionType: ExtensionType) {
  // If curated subTypes are defined on the extension type (e.g. Bundles), use them and enrich with product count
  if (extensionType.subTypes && extensionType.subTypes.length > 0) {
    const counts = await Promise.all(
      extensionType.subTypes.map(async (sub) => {
        const count = await prisma.product.count({
          where: {
            active: true,
            archived: false,
            type: extensionType.slug,
            OR: [
              { texture: { contains: sub.texture, mode: "insensitive" } },
              { name: { contains: sub.texture, mode: "insensitive" } },
            ],
          },
        });
        return {
          name: sub.name,
          texture: sub.texture,
          desc: sub.desc,
          image: sub.image,
          tag: sub.tag,
          count,
        };
      })
    );
    return counts;
  }

  // Fallback to grouping by DB textures
  const grouped = await prisma.product.groupBy({
    by: ["texture"],
    where: {
      active: true,
      archived: false,
      type: extensionType.slug,
      texture: { not: null },
    },
    _count: { id: true },
  });

  return grouped
    .filter((g) => typeof g.texture === "string" && g.texture.trim().length > 0)
    .map((g) => {
      const texture = (g.texture as string).trim();
      const visual = textureVisuals[texture.toLowerCase()];
      return {
        name: `${texture} ${extensionType.name}`,
        texture,
        desc: visual?.desc || `Premium ${texture} in ${extensionType.name.toLowerCase()} finishes.`,
        image: visual?.image || extensionType.image,
        tag: extensionType.tag,
        count: g._count.id,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function ExtensionTypePage({
  params,
}: ExtensionTypePageProps) {
  const { type } = await params;
  const extensionType = getExtensionTypeBySlug(type);
  if (!extensionType) notFound();

  const subTypes = await getSubTypes(extensionType);

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <BackLink
          label="Back to Extensions by Type"
          fallbackHref="/extensions"
        />
      </div>

      <div className={styles.hero}>
        <span className={styles.eyebrow}>{extensionType.tag}</span>
        <h1 className={styles.title}>{extensionType.name} by Type</h1>
        <p className={styles.subtitle}>
          {extensionType.desc}. Choose a style below to browse every{" "}
          {extensionType.name.toLowerCase()} option we carry in that type.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Types of {extensionType.name}</h2>
          <p className={styles.sectionDesc}>
            {extensionType.name} come in different textures, lengths, and finishes. Tap a
            type to explore it.
          </p>
        </div>

        {subTypes.length > 0 ? (
          <div className={styles.typeGrid}>
            {subTypes.map((sub) => (
              <Link
                key={sub.name}
                href={`/products?type=${encodeURIComponent(
                  extensionType.slug
                )}&texture=${encodeURIComponent(sub.texture)}`}
                className={styles.typeCard}
              >
                <div className={styles.typeImageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sub.image}
                    alt={`Marizhaircastle ${sub.name}`}
                    className={styles.typeImage}
                  />
                </div>
                <div className={styles.typeBody}>
                  <span className={styles.typeTag}>{sub.tag}</span>
                  <h3 className={styles.typeName}>{sub.name}</h3>
                  <p className={styles.typeDesc}>{sub.desc}</p>
                  <span className={styles.typeAction}>
                    {sub.count > 0
                      ? `Shop ${sub.count} item${sub.count === 1 ? "" : "s"} →`
                      : `Explore ${sub.name} →`}
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href={`/products?type=${encodeURIComponent(extensionType.slug)}`}
              className={`${styles.typeCard} ${styles.allCard}`}
            >
              <div className={styles.typeImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={extensionType.image}
                  alt={`All ${extensionType.name}`}
                  className={styles.typeImage}
                />
              </div>
              <div className={styles.typeBody}>
                <span className={styles.typeTag}>Everything</span>
                <h3 className={styles.typeName}>Shop All {extensionType.name}</h3>
                <p className={styles.typeDesc}>
                  Browse the complete range of {extensionType.name.toLowerCase()}{" "}
                  across every texture and finish.
                </p>
                <span className={styles.typeAction}>
                  View All {extensionType.name} →
                </span>
              </div>
            </Link>
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden="true">
              📦
            </div>
            <h2 className={styles.emptyTitle}>
              New {extensionType.name} arriving soon
            </h2>
            <p className={styles.emptyDescription}>
              We don&apos;t have stock listed under{" "}
              {extensionType.name.toLowerCase()} just yet. Check back shortly or
              browse our other extension types.
            </p>
            <Link href="/extensions" className={styles.emptyLink}>
              Explore other extension types
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}