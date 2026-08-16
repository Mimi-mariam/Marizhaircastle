export interface ExtensionSubType {
  name: string;
  texture: string;
  desc: string;
  image: string;
  tag: string;
}

export interface ExtensionType {
  name: string;
  slug: string;
  desc: string;
  image: string;
  tag: string;
  subTypes?: ExtensionSubType[];
}

export const extensionTypes: ExtensionType[] = [
  {
    name: "Bundles",
    slug: "Bundles",
    desc: "100% virgin raw wefts for fullness, length, and seamless installs",
    image: "/images/ext-bundles.jpg",
    tag: "Raw Wefts",
    subTypes: [
      {
        name: "Bone Straight Weft",
        texture: "Bone Straight",
        desc: "Ultra-sleek, mirror-gloss flat-ironed raw wefts with zero tangles",
        image: "/images/ext-bundles.jpg",
        tag: "Silky Sleek",
      },
      {
        name: "Body Wave Weft",
        texture: "Body Wave",
        desc: "Lush, effortless S-curl pattern with natural volume, bounce, and luster",
        image: "/images/extensions-collection.jpg",
        tag: "Bouncy S-Pattern",
      },
      {
        name: "Deep Wave Weft",
        texture: "Deep Wave",
        desc: "Defined, luxurious vacation wave with a radiant, natural wet-look sheen",
        image: "/images/extensions-collection.jpg",
        tag: "Defined Curls",
      },
      {
        name: "Pixie Curls",
        texture: "Pixie Curls",
        desc: "Chic, voluminous short bouncy curls with maximum fullness and bounce",
        image: "/images/ext-bundles.jpg",
        tag: "Bouncy Volume",
      },
      {
        name: "Short Straight Bone Straight",
        texture: "Straight",
        desc: "Blunt, precision flat straight bundles perfect for chic bob and shoulder styles",
        image: "/images/ext-bundles.jpg",
        tag: "Blunt Cut",
      },
      {
        name: "Different Color / Custom Hues",
        texture: "Custom Color",
        desc: "Ombré, honey blonde, and custom-toned balayage human hair bundles",
        image: "/images/ext-clipins.jpg",
        tag: "Signature Hues",
      },
    ],
  },
  {
    name: "Closures",
    slug: "Closures",
    desc: "Flawless lace closures that melt into a natural-looking crown",
    image: "/images/ext-closures.jpg",
    tag: "Lace Closures",
  },
  {
    name: "Frontals",
    slug: "Frontals",
    desc: "HD lace frontals for a seamless, undetectable hairline",
    image: "/images/ext-frontals.jpg",
    tag: "HD Lace Frontals",
  },
  {
    name: "Ponytails",
    slug: "Ponytails",
    desc: "Instant, elegant ponytails with natural movement and volume",
    image: "/images/ext-ponytails.jpg",
    tag: "Insta-Ponytails",
  },
  {
    name: "Clip-ins & Tape-ins",
    slug: "Clip-ins & Tape-ins",
    desc: "Quick, damage-free volume and length for everyday wear",
    image: "/images/ext-clipins.jpg",
    tag: "Everyday Wear",
  },
];

export function getExtensionTypeBySlug(slug: string) {
  return extensionTypes.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
}