import type { Metadata } from "next";
import { BackLink } from "@/components/storefront/BackLink";
import { CustomWigForm } from "@/components/storefront/CustomWigForm";
import styles from "../custom-wig/custom-wig.module.css";

export const metadata: Metadata = {
  title: "Custom Colored Perfection | Marizhaircastle",
  description:
    "Curate your signature custom color — from balayage and ombré to rich copper, blonde, and burgundy tones. Hand-colored on 100% raw virgin hair.",
};

const COLOR_PROCESS_GUIDE = [
  {
    title: "1. Select Base & Length",
    desc: "Choose your base lace wig type, cap size, and virgin hair length.",
  },
  {
    title: "2. Upload Color Inspiration",
    desc: "Share your dream shade, balayage highlights, ombré tones, or exact reference photos.",
  },
  {
    title: "3. Custom Formulation & Quote",
    desc: "Our master colorists review your tones and send your tailored quote and invoice.",
  },
  {
    title: "4. Handcrafted & Dispatched",
    desc: "Artisan colored with salon-grade bond protectors for radiant shine and hair health.",
  },
];

export default function CustomColorPage() {
  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <BackLink label="Back to Home" fallbackHref="/" />
      </div>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>Signature Hues</span>
        <h1 className={styles.title}>Custom Colored Perfection</h1>
        <p className={styles.intro}>
          Elevate your crown with our signature bespoke coloring service. Whether you crave
          warm caramel balayage, platinum icy blonde, rich chocolate browns, or vibrant auburn
          copper tones, our master colorists formulate each shade by hand on 100% raw human hair.
        </p>
        <p className={styles.intro}>
          Submit your desired color reference and wig specifications below. We&apos;ll review
          your inspiration photos, confirm color tone formulation, and send your invoice to begin
          crafting your bespoke colored crown.
        </p>

        <div className={styles.notes}>
          <h2 className={styles.notesTitle}>Color Service Guidelines:</h2>
          <ul className={styles.notesList}>
            <li>
              Each custom color unit uses salon-grade Olaplex / bond-protecting formulas to preserve 100% hair cuticle integrity and elasticity.
            </li>
            <li>
              Custom color pricing includes your chosen base wig plus the bespoke multi-step coloring process, itemized in your invoice.
            </li>
            <li>
              Turnaround times will be confirmed upon reviewing your specific color depth and multi-tonal placement.
            </li>
          </ul>
        </div>

        <p className={styles.closing}>
          We guarantee vibrant, multi-tonal shine with seamless lace preservation and zero damage to delicate hairline knots.
        </p>
        <p className={styles.closingEmphasis}>
          Let&apos;s create your signature custom shade!
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How Custom Coloring Works</h2>
        <div className={styles.guideGrid}>
          {COLOR_PROCESS_GUIDE.map((item) => (
            <div key={item.title} className={styles.guideCard}>
              <strong className={styles.guideSize}>{item.title}</strong>
              <span className={styles.guideDesc}>{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <CustomWigForm />
      </section>
    </div>
  );
}
