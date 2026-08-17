"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CartLink } from "@/components/storefront/CartLink";
import styles from "./Header.module.css";

export function Header() {
  const { data: session, status } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerOpenedAtRef = useRef(0);
  const pathname = usePathname();

  // Close drawer automatically when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const user = session?.user;
  const isAuthenticated = status === "authenticated";

  const openDrawer = () => {
    drawerOpenedAtRef.current = performance.now();
    setDrawerOpen(true);
  };

  // Prevent the mobile "ghost click" that fires on the just-mounted backdrop
  // right after opening the drawer, which would close it instantly.
  const closeFromBackdrop = (e: React.MouseEvent) => {
    if (performance.now() - drawerOpenedAtRef.current < 350) {
      e.preventDefault();
      return;
    }
    setDrawerOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.leftGroup}>
            {/* Menu Trigger Button */}
            <button
              type="button"
              className={styles.menuButton}
              onClick={openDrawer}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link href="/" className={styles.brand}>
              Marizhaircastle
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className={styles.desktopNav} aria-label="Store navigation">
            <Link href="/products" className={styles.navLink}>
              Shop
            </Link>
            <Link href="/collections" className={styles.navLink}>
              Collections
            </Link>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link href="/faq" className={styles.navLink}>
              FAQ
            </Link>
          </nav>

          <div className={styles.rightGroup}>
            <CartLink />

            {/* Desktop Account Shortcut */}
            <div className={styles.desktopAccount}>
              {isAuthenticated ? (
                <>
                  <Link href="/account" className={styles.authLink}>
                    Account
                  </Link>
                  <button
                    type="button"
                    className={styles.authLink}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" className={styles.authLink}>
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Drawer Overlay Backdrop */}
      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu Drawer */}
      {drawerOpen && (
        <aside
          id="mobile-drawer"
          className={styles.drawer}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          <div className={styles.drawerHeader}>
            <Link
              href="/"
              className={styles.drawerBrand}
              onClick={() => setDrawerOpen(false)}
            >
              Marizhaircastle
            </Link>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className={styles.drawerBody}>
            <span className={styles.drawerSectionTitle}>Explore</span>

            <Link
              href="/products"
              className={styles.drawerItem}
              onClick={() => setDrawerOpen(false)}
            >
              <span>Shop All</span>
              <span className={styles.drawerItemArrow} aria-hidden="true">→</span>
            </Link>

            <Link
              href="/collections"
              className={styles.drawerItem}
              onClick={() => setDrawerOpen(false)}
            >
              <span>Collections</span>
              <span className={styles.drawerItemArrow} aria-hidden="true">→</span>
            </Link>

            <Link
              href="/custom-wig"
              className={styles.drawerItem}
              onClick={() => setDrawerOpen(false)}
            >
              <span>Design Custom Wig</span>
              <span className={styles.drawerItemArrow} aria-hidden="true">→</span>
            </Link>

            <div className={styles.drawerDivider} />
            <span className={styles.drawerSectionTitle}>Company</span>

            <Link
              href="/about"
              className={styles.drawerItem}
              onClick={() => setDrawerOpen(false)}
            >
              <span>About Marizhaircastle</span>
              <span className={styles.drawerItemArrow} aria-hidden="true">→</span>
            </Link>

            <Link
              href="/faq"
              className={styles.drawerItem}
              onClick={() => setDrawerOpen(false)}
            >
              <span>Help & FAQs</span>
              <span className={styles.drawerItemArrow} aria-hidden="true">→</span>
            </Link>

            {isAuthenticated && (
              <>
                <div className={styles.drawerDivider} />
                <span className={styles.drawerSectionTitle}>My Crown</span>
                <Link
                  href="/account"
                  className={styles.drawerItem}
onClick={closeFromBackdrop}
                >
                  <span>My Account & Orders</span>
                  <span className={styles.drawerItemArrow} aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>

          {/* Drawer Footer with Sign out or Sign in */}
          <div className={styles.drawerFooter}>
            {isAuthenticated ? (
              <button
                type="button"
                className={styles.signOutButton}
                onClick={() => {
                  setDrawerOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out ({user?.name || "Customer"})</span>
              </button>
            ) : (
              <Link
                href="/login"
                className={styles.signInLink}
                onClick={() => setDrawerOpen(false)}
              >
                Sign In to Your Account
              </Link>
            )}
          </div>
        </aside>
      )}
    </>
  );
}