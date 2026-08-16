import type { Metadata } from "next";
import { BackLink } from "@/components/storefront/BackLink";
import { CustomWigForm } from "@/components/storefront/CustomWigForm";
import styles from "./custom-wig.module.css";

export const metadata: Metadata = {
  title: "Design Your Custom Wig | Marizhaircastle",
  description:
    "Tell us exactly what you dream of — style, lace size, bundles, cap size, length, and upload inspiration photos. We'll review your details, confirm and invoice, then create your custom unit.",
};

const CAP_SIZE_GUIDE = [
  { size: "Small", desc: "Petite fit for a comfortable, snug crown." },
  { size: "Medium", desc: "The standard average head fit." },
  { size: "Large", desc: "For a fuller, roomier cap fit." },
  {
    size: "Custom Measurement",
    desc: "Precision cap made to your exact measurements for the ultimate fit.",
  },
];

export default function CustomWigPage() {
  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <BackLink label="Back to Home" fallbackHref="/" />
      </div>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>Bespoke Craftsmanship</span>
        <h1 className={styles.title}>Design Your Custom Wig</h1>
        <p className={styles.intro}>
          Thank you for choosing Marizhaircastle for your custom unit. This
          form is where you&apos;ll provide all the details for your dream
          wig, including style, lace size, bundles, cap size, length, color,
          and any special requests.
        </p>
        <p className={styles.intro}>
          Once your form is submitted, we&apos;ll review your details, confirm
          your order, and send your invoice so we can begin creating your unit.
        </p>

        <div className={styles.notes}>
          <h2 className={styles.notesTitle}>Please note:</h2>
          <ul className={styles.notesList}>
            <li>
              Turnaround time is confirmed after we review your request and
              share your quote.
            </li>
            <li>
              Custom color pricing includes your chosen base plus a color
              service, quoted in your invoice.
            </li>
            <li>
              Please refer to our shipping policy for full processing details.
            </li>
          </ul>
        </div>

        <p className={styles.closing}>
          This process helps us ensure your unit is customized to your vision
          with the highest level of care and attention to detail.
        </p>
        <p className={styles.closingEmphasis}>
          We can&apos;t wait to create something beautiful for you!
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Wig Cap Size Guide</h2>
        <div className={styles.guideGrid}>
          {CAP_SIZE_GUIDE.map((item) => (
            <div key={item.size} className={styles.guideCard}>
              <strong className={styles.guideSize}>{item.size}</strong>
              <span className={styles.guideDesc}>{item.desc}</span>
            </div>
          ))}
        </div>
        <p className={styles.guideHint}>
          Choose your cap size above. For the most precise fit, choose{" "}
          <strong>Custom Measurement</strong> and we&apos;ll take your
          measurements on review.
        </p>
      </section>

      <section className={styles.section}>
        <CustomWigForm />
      </section>
    </div>
  );
}