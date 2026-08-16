"use client";

import { useState } from "react";
import styles from "./FaqSection.module.css";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does the 24-hour delivery promise work?",
    answer:
      "Once your payment is successfully verified via Flutterwave, our fulfillment team immediately packages and dispatches your order. Deliveries in Lagos and major metro areas arrive within 24 hours of payment verification.",
  },
  {
    question: "Is your hair 100% human hair? Can it be bleached or dyed?",
    answer:
      "Yes, absolutely. All Marizhaircastle units, frontals, and bundles are 100% raw or virgin human hair with intact cuticles. They can be safely bleached to blonde (613), dyed, hot-comb straightened, and curled without shedding or matting.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We process all payments securely through Flutterwave. You can pay seamlessly using Nigerian debit/credit cards, instant Bank Transfer, USSD, or Barter.",
  },
  {
    question: "What is the difference between Frontals and Closures?",
    answer:
      "A 13x4 or 13x6 Frontal spans from ear to ear across your entire hairline, giving you unlimited parting versatility (half-up, middle, side parts). A 4x4 or 5x5 Closure covers the middle crown area and offers a low-maintenance, glueless experience.",
  },
  {
    question: "How do I choose my wig cap size?",
    answer:
      "Our ready-to-wear wigs come in standard Medium Cap Size (22–22.5 inches circumference) with adjustable elastic bands and combs. If you require a Small (21.5\") or Large (23\") cap, message our concierge on WhatsApp after placing your order.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggleFaq(idx: number) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Got Questions?</span>
          <h2 id="faq-title" className={styles.title}>
            Frequently Asked Questions
          </h2>
          <p className={styles.subtitle}>
            Everything you need to know about our luxury hair, payment, and verified delivery.
          </p>
        </div>

        <div className={styles.accordion}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
              >
                <button
                  type="button"
                  className={styles.trigger}
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.questionText}>{faq.question}</span>
                  <span className={styles.icon} aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className={styles.answerBody}>
                    <p className={styles.answerText}>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
