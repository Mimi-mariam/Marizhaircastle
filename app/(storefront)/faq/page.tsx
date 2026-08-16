import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "@/components/storefront/FaqSection";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Marizhaircastle",
  description:
    "Got questions about orders, 24-hour delivery in Nigeria, virgin hair care, cap sizing, or Flutterwave payments? Find answers here.",
};

export default function FaqPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Help Center</span>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Find quick answers to common questions about hair quality, delivery timelines, cap sizing, and secure checkout.
        </p>
      </div>

      <FaqSection />

      <section className={styles.contactSupport}>
        <div className={styles.supportCard}>
          <h2 className={styles.supportTitle}>Still have questions?</h2>
          <p className={styles.supportDesc}>
            Our hair concierge is available on WhatsApp to assist with custom styling, color recommendations, and order queries.
          </p>
          <a
            href="https://wa.me/2349045464299?text=Hello%20Marizhaircastle%2C%20I%20have%20a%20question%20about%20your%20hair%20products."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            Chat with Concierge on WhatsApp →
          </a>
        </div>
      </section>
    </div>
  );
}
