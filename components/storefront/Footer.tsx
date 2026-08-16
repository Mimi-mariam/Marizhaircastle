"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* 1. Brand & Contact Information */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              Marizhaircastle
            </Link>
            <p className={styles.tagline}>
              Premium virgin and raw human hair extensions and wigs — ethically sourced,
              carefully inspected, and made to blend with natural texture. Guaranteed 24-hour delivery after payment verification.
            </p>
            
            <div className={styles.addressInfo}>
              <p className={styles.addressLine}>Lagos, Nigeria</p>
              <a href="mailto:concierge@marizhaircastle.com" className={styles.emailLink}>
                concierge@marizhaircastle.com
              </a>
            </div>

            {/* Social Links */}
            <div className={styles.socialRow}>
              <a
                href="https://www.instagram.com/marizhaircastle"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                Instagram
              </a>
              <span className={styles.socialDot}>•</span>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                TikTok
              </a>
              <span className={styles.socialDot}>•</span>
              <a
                href="https://wa.me/2349045464299"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* 2. Help Column */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Help</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/faq" className={styles.link}>
                  Shipping & delivery
                </Link>
              </li>
              <li>
                <Link href="/faq" className={styles.link}>
                  FAQs & care tips
                </Link>
              </li>
              <li>
                <a href="https://wa.me/2349045464299" target="_blank" rel="noopener noreferrer" className={styles.link}>
                  WhatsApp Concierge
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Company Column */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Company</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/about" className={styles.link}>
                  About Marizhaircastle
                </Link>
              </li>
              <li>
                <Link href="/products" className={styles.link}>
                  Shop all
                </Link>
              </li>
              <li>
                <Link href="/login" className={styles.link}>
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Shop Column */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Shop</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/products?category=extensions" className={styles.link}>
                  Bundles
                </Link>
              </li>
              <li>
                <Link href="/products?texture=Body+Wave" className={styles.link}>
                  Wavy
                </Link>
              </li>
              <li>
                <Link href="/products?category=wigs" className={styles.link}>
                  Wigs
                </Link>
              </li>
            </ul>
          </div>

          {/* 5. Sign up & save Newsletter Column */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>Sign up & save</h4>
            <p className={styles.newsletterDesc}>
              Offers, restocks, and styling tips — no spam.
            </p>

            {subscribed ? (
              <p className={styles.subscribeSuccess}>
                ✓ Thank you for subscribing to Marizhaircastle!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.newsletterInput}
                  aria-label="Email address for newsletter"
                />
                <button type="submit" className={styles.newsletterBtn}>
                  Subscribe
                </button>
              </form>
            )}

            <div className={styles.flutterwaveBadge}>
              <span className={styles.shieldIcon} aria-hidden="true">🔒</span>
              <div>
                <strong>Secure Payments</strong>
                <span>Powered by Flutterwave</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & badges */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Marizhaircastle. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <span className={styles.badge}>100% Virgin Hair</span>
            <span className={styles.badge}>24-Hour Verified Dispatch</span>
          </div>
        </div>
      </div>
    </footer>
  );
}