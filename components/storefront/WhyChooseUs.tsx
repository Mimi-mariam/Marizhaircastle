import React from "react";
import styles from "./WhyChooseUs.module.css";

interface Pillar {
  icon: string;
  title: string;
  description: string;
}

const PILLARS: Pillar[] = [
  {
    icon: "✨",
    title: "100% Raw & Virgin Hair",
    description:
      "Ethically sourced, single-donor human hair with intact cuticles. Zero shedding, fully bleach-safe and long-lasting.",
  },
  {
    icon: "⚡",
    title: "24-Hour Verified Dispatch",
    description:
      "Prompt delivery across major Nigerian cities within 24 hours of verified payment confirmation.",
  },
  {
    icon: "💎",
    title: "HD Melt & Invisible Lace",
    description:
      "Ultra-thin real HD lace that seamlessly melts into all skin tones with pre-plucked, natural hairlines.",
  },
  {
    icon: "🔒",
    title: "Verified Secure Checkout",
    description:
      "Seamless instant payments powered by Flutterwave with bank transfer, card, and USSD support.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className={styles.section} aria-labelledby="why-us-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>The Marizhaircastle Standard</span>
          <h2 id="why-us-heading" className={styles.title}>
            Why Nigerian Queens Trust Us
          </h2>
          <p className={styles.subtitle}>
            Uncompromising luxury, authentic human hair quality, and rapid 24-hour fulfillment across Nigeria.
          </p>
        </div>

        <div className={styles.grid}>
          {PILLARS.map((pillar, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconWrapper} aria-hidden="true">
                <span className={styles.icon}>{pillar.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardDesc}>{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
