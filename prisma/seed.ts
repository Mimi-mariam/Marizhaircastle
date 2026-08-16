import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/marizhaircastle?schema=public",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@marizhaircastle.com";
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Marizhaircastle Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  const wigs = await prisma.category.upsert({
    where: { slug: "wigs" },
    update: {},
    create: { name: "Wigs", slug: "wigs" },
  });

  const extensions = await prisma.category.upsert({
    where: { slug: "extensions" },
    update: {},
    create: { name: "Extensions", slug: "extensions" },
  });

  const product = await prisma.product.upsert({
    where: { slug: "signature-lace-front-wig" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "/images/style-bone-straight.jpg", alt: "Signature Bone Straight Lace Front Wig", position: 0 },
          { url: "/images/hero-wavy-hair.jpg", alt: "Signature Lace Front Wig Detail", position: 1 },
        ],
      },
    },
    create: {
      name: "Signature Bone Straight Lace Front Wig",
      slug: "signature-lace-front-wig",
      description:
        "Premium 100% human hair bone straight HD lace front wig. Ultra-glossy, soft, and pre-plucked for a seamless natural hairline.",
      price: 450000,
      previousPrice: 520000,
      type: "Wig",
      length: "24 inch",
      texture: "Bone Straight",
      color: "Natural Black (1B)",
      careInfo: "Wash every 2-3 weeks with sulfate-free shampoo. Apply heat protectant serum prior to flat ironing.",
      categoryId: wigs.id,
      images: {
        create: [
          { url: "/images/style-bone-straight.jpg", alt: "Signature Bone Straight Lace Front Wig", position: 0 },
          { url: "/images/hero-wavy-hair.jpg", alt: "Signature Lace Front Wig Detail", position: 1 },
        ],
      },
      variants: {
        create: [
          {
            name: "24 inch — Natural Black",
            sku: "SLFW-24-NB",
            inventory: { create: { stock: 12 } },
          },
        ],
      },
    },
  });

  const extensionsProduct = await prisma.product.upsert({
    where: { slug: "premium-ombre-extensions" },
    update: {
      type: "Bundles",
      images: {
        deleteMany: {},
        create: [
          { url: "/images/ext-bundles.jpg", alt: "Premium Body Wave Raw Hair Bundles", position: 0 },
        ],
      },
    },
    create: {
      name: "Premium Body Wave Bundles",
      slug: "premium-ombre-extensions",
      description: "Silky 100% raw human hair body wave bundles with authentic luster and natural wave pattern retention.",
      price: 280000,
      previousPrice: 320000,
      type: "Bundles",
      length: "20 inch",
      texture: "Body Wave",
      color: "Natural Black / Ombré",
      careInfo: "Finger detangle gently with leave-in conditioner. Air dry for defined bouncy waves.",
      categoryId: extensions.id,
      images: {
        create: [
          { url: "/images/ext-bundles.jpg", alt: "Premium Body Wave Raw Hair Bundles", position: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: "20 inch — Body Wave",
            sku: "PBW-20-NAT",
            inventory: { create: { stock: 15 } },
          },
        ],
      },
    },
  });

  const deepWaveBundles = await prisma.product.upsert({
    where: { slug: "luxury-raw-deep-wave-bundles" },
    update: {
      name: "Luxury Raw Deep Wave Bundles",
      description: "100% Virgin Single Donor Deep Wave raw bundles. Defined luxury wet-look curls, full double-weft construction, zero shedding, and authentic luster.",
      price: 295000,
      previousPrice: 340000,
      type: "Bundles",
      length: "22 inch",
      texture: "Deep Wave",
      color: "Natural Black (1B)",
      careInfo: "Moisturize with water and light curl mousse. Never dry comb to preserve tight curl integrity.",
      categoryId: extensions.id,
      images: {
        deleteMany: {},
        create: [
          { url: "/images/extensions-collection.jpg", alt: "Luxury Raw Deep Wave Bundles", position: 0 },
          { url: "/images/ext-bundles.jpg", alt: "Deep Wave Raw Weft Construction Detail", position: 1 },
        ],
      },
    },
    create: {
      name: "Luxury Raw Deep Wave Bundles",
      slug: "luxury-raw-deep-wave-bundles",
      description: "100% Virgin Single Donor Deep Wave raw bundles. Defined luxury wet-look curls, full double-weft construction, zero shedding, and authentic luster.",
      price: 295000,
      previousPrice: 340000,
      type: "Bundles",
      length: "22 inch",
      texture: "Deep Wave",
      color: "Natural Black (1B)",
      careInfo: "Moisturize with water and light curl mousse. Never dry comb to preserve tight curl integrity.",
      categoryId: extensions.id,
      images: {
        create: [
          { url: "/images/extensions-collection.jpg", alt: "Luxury Raw Deep Wave Bundles", position: 0 },
          { url: "/images/ext-bundles.jpg", alt: "Deep Wave Raw Weft Construction Detail", position: 1 },
        ],
      },
      variants: {
        create: [
          {
            name: "22 inch — Deep Wave (100g)",
            sku: "LDWB-22-NB",
            inventory: { create: { stock: 18 } },
          },
          {
            name: "26 inch — Deep Wave (100g)",
            sku: "LDWB-26-NB",
            inventory: { create: { stock: 12 } },
          },
        ],
      },
    },
  });

  const boneStraightBundles = await prisma.product.upsert({
    where: { slug: "raw-vietnamese-bone-straight-bundles" },
    update: {
      type: "Bundles",
      images: {
        deleteMany: {},
        create: [
          { url: "/images/ext-bundles.jpg", alt: "Raw Vietnamese Bone Straight Bundles", position: 0 },
        ],
      },
    },
    create: {
      name: "Raw Vietnamese Bone Straight Bundles",
      slug: "raw-vietnamese-bone-straight-bundles",
      description: "Super double drawn raw bone straight hair bundles. Ultra-silky flat-ironed finish with blunt ends and long-lasting glass shine.",
      price: 310000,
      previousPrice: 360000,
      type: "Bundles",
      length: "24 inch",
      texture: "Bone Straight",
      color: "Natural Black (1B)",
      careInfo: "Apply 1 drop of argan serum before heat styling. Guaranteed 24-hour delivery after payment verification.",
      categoryId: extensions.id,
      images: {
        create: [
          { url: "/images/ext-bundles.jpg", alt: "Raw Vietnamese Bone Straight Bundles", position: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: "24 inch — Bone Straight (100g)",
            sku: "RVBS-24-NB",
            inventory: { create: { stock: 14 } },
          },
        ],
      },
    },
  });

  const deepWaveWig = await prisma.product.upsert({
    where: { slug: "luxury-deep-wave-frontal-wig" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "/images/style-deep-wave.jpg", alt: "Luxury Deep Wave Frontal Wig", position: 0 },
        ],
      },
    },
    create: {
      name: "Luxury Deep Wave HD Frontal Wig",
      slug: "luxury-deep-wave-frontal-wig",
      description: "Lush, defined vacation curls crafted with thin Swiss HD lace for effortless melt and voluminous luxury.",
      price: 385000,
      previousPrice: 420000,
      type: "Wig",
      length: "22 inch",
      texture: "Deep Wave",
      color: "Natural Black (1B)",
      careInfo: "Spray with water and curl defining mousse. Avoid dry brushing to maintain tight wave pattern.",
      categoryId: wigs.id,
      images: {
        create: [
          { url: "/images/style-deep-wave.jpg", alt: "Luxury Deep Wave Frontal Wig", position: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: "22 inch — Deep Wave",
            sku: "LDW-22-NB",
            inventory: { create: { stock: 8 } },
          },
        ],
      },
    },
  });

  const pixieCurls = await prisma.product.upsert({
    where: { slug: "bouncy-pixie-curl-wig" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "/images/style-pixie-curls.jpg", alt: "Bouncy Pixie Curl Short Wig", position: 0 },
        ],
      },
    },
    create: {
      name: "Bouncy Pixie Curls Glueless Wig",
      slug: "bouncy-pixie-curl-wig",
      description: "Chic, low-maintenance short bouncy curls. Ready to wear glueless cap design with pre-styled defined volume.",
      price: 210000,
      previousPrice: null,
      type: "Wig",
      length: "10 inch",
      texture: "Pixie Curls",
      color: "Natural Black",
      careInfo: "Mist with water and light hair oil. Shake and wear for instant volume.",
      categoryId: wigs.id,
      images: {
        create: [
          { url: "/images/style-pixie-curls.jpg", alt: "Bouncy Pixie Curl Short Wig", position: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: "10 inch — Pixie Curls",
            sku: "BPC-10-NB",
            inventory: { create: { stock: 10 } },
          },
        ],
      },
    },
  });

  const singleDonorBoneStraight = await prisma.product.upsert({
    where: { slug: "single-donor-lux-super-double-drawn-bone-straight-32" },
    update: {
      videoUrl: "https://www.instagram.com/reel/CnE2PhrItGF/",
      images: {
        deleteMany: {},
        create: [
          { url: "/images/style-bone-straight.jpg", alt: "Single Donor Lux Super Double Drawn Bone Straight Frontal Wig", position: 0 },
          { url: "/images/hero-wavy-hair.jpg", alt: "Bone Straight 13x4 Frontal Melt Detail", position: 1 },
        ],
      },
    },
    create: {
      name: "Single Donor Lux Super Double Drawn Bone Straight Frontal Wig",
      slug: "single-donor-lux-super-double-drawn-bone-straight-32",
      description: "100% Single Donor Luxury Super Double Drawn Bone Straight hair paired with a melted 13x4 HD frontal (300g fullness). Ultra-sleek, luxurious sheen, zero tangles, and authentic raw longevity.",
      price: 440000,
      previousPrice: 480000,
      type: "Wig",
      length: "32 inch",
      texture: "Bone Straight",
      color: "Natural Black (1B)",
      careInfo: "Use lightweight serum before heat styling. Comb gently from ends to roots with a wide-tooth comb. Guaranteed 24-hour dispatch after payment verification.",
      videoUrl: "https://www.instagram.com/reel/CnE2PhrItGF/",
      categoryId: wigs.id,
      images: {
        create: [
          { url: "/images/style-bone-straight.jpg", alt: "Single Donor Lux Super Double Drawn Bone Straight Frontal Wig", position: 0 },
          { url: "/images/hero-wavy-hair.jpg", alt: "Bone Straight 13x4 Frontal Melt Detail", position: 1 },
        ],
      },
      variants: {
        create: [
          {
            name: "32 inch / 300g (13x4 Frontal) — Natural Black",
            sku: "SDL-SDD-BS-32",
            inventory: { create: { stock: 6 } },
          },
        ],
      },
    },
  });

  const layeredVirginWig = await prisma.product.upsert({
    where: { slug: "luxury-layered-cut-virgin-hair-wig-20" },
    update: {
      videoUrl: "https://www.instagram.com/reel/C9WyBikOC4j/",
      images: {
        deleteMany: {},
        create: [
          { url: "/images/mannequin-layered-wig.jpg", alt: "Luxury Layered Cut Virgin Hair Wig 20 Inch", position: 0 },
          { url: "/images/custom-wig-banner.jpg", alt: "Layered Cut Bounce and Volume Detail", position: 1 },
        ],
      },
    },
    create: {
      name: "Luxury Layered Cut Virgin Hair Wig (20\")",
      slug: "luxury-layered-cut-virgin-hair-wig-20",
      description: "Take your hair from basic to classy. Handcrafted 100% luxury virgin hair with cascading voluminous layers paired with a seamless 5x5 HD closure (300g density). Full, bouncy, and ready for immediate dispatch.",
      price: 600000,
      previousPrice: 650000,
      type: "Wig",
      length: "20 inch",
      texture: "Layered Straight / Body",
      color: "Natural Black",
      careInfo: "Use a round thermal brush or rollers to maintain bounce. Wash gently with sulfate-free hair cleansers. Guaranteed 24-hour delivery after payment verification.",
      videoUrl: "https://www.instagram.com/reel/C9WyBikOC4j/",
      categoryId: wigs.id,
      images: {
        create: [
          { url: "/images/mannequin-layered-wig.jpg", alt: "Luxury Layered Cut Virgin Hair Wig 20 Inch", position: 0 },
          { url: "/images/custom-wig-banner.jpg", alt: "Layered Cut Bounce and Volume Detail", position: 1 },
        ],
      },
      variants: {
        create: [
          {
            name: "20 inch / 300g (5x5 Closure) — Natural Black",
            sku: "LLC-20-5X5",
            inventory: { create: { stock: 5 } },
          },
        ],
      },
    },
  });

  const rawDonorBabyThinBoneStraight = await prisma.product.upsert({
    where: { slug: "raw-donor-baby-thin-bone-straight-26" },
    update: {
      videoUrl: "https://www.instagram.com/reel/C3YSsaOsMpX/",
      images: {
        deleteMany: {},
        create: [
          { url: "/images/style-bone-straight.jpg", alt: "Raw Donor Baby Thin Bone Straight Wig 26 Inch", position: 0 },
          { url: "/images/mannequin-bob-wig.jpg", alt: "Baby Thin Bone Straight Sleek Sheen Detail", position: 1 },
        ],
      },
    },
    create: {
      name: "Raw Donor Baby Thin Bone Straight Wig (26\")",
      slug: "raw-donor-baby-thin-bone-straight-26",
      description: "The ultimate upgrade to royal bone straight quality. 100% Raw Single Donor hair in ultra-sleek 'Baby Thin' texture paired with a melted 2x6 closure (300g density). Zero shedding, glass-like reflection, and authentic lifetime raw hair quality.",
      price: 770000,
      previousPrice: 820000,
      type: "Wig",
      length: "26 inch",
      texture: "Baby Thin Bone Straight",
      color: "Natural Black (1B)",
      careInfo: "Wash gently with sulfate-free shampoo every 2-3 weeks. Apply 1-2 drops of lightweight argan serum before heat pressing. Guaranteed 24-hour delivery after payment verification.",
      videoUrl: "https://www.instagram.com/reel/C3YSsaOsMpX/",
      categoryId: wigs.id,
      images: {
        create: [
          { url: "/images/style-bone-straight.jpg", alt: "Raw Donor Baby Thin Bone Straight Wig 26 Inch", position: 0 },
          { url: "/images/mannequin-bob-wig.jpg", alt: "Baby Thin Bone Straight Sleek Sheen Detail", position: 1 },
        ],
      },
      variants: {
        create: [
          {
            name: "26 inch / 300g (2x6 Closure) — Natural Black",
            sku: "RDBT-BS-26-2X6",
            inventory: { create: { stock: 4 } },
          },
        ],
      },
    },
  });

  console.log({
    admin,
    wigs,
    extensions,
    product,
    extensionsProduct,
    singleDonorBoneStraight,
    layeredVirginWig,
    rawDonorBabyThinBoneStraight,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
