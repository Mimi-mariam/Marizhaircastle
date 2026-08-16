import React from "react";
import Link from "next/link";
import styles from "./AdminNav.module.css";

interface AdminNavProps {
  currentPath?: string;
}

export const AdminNav: React.FC<AdminNavProps> = ({ currentPath = "" }) => {
  const links = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/orders", label: "Orders & 24h SLA", icon: "📦" },
    { href: "/admin/products", label: "Products & Hair", icon: "✨" },
    { href: "/admin/inventory", label: "Inventory", icon: "🏷️" },
    { href: "/admin/custom-wigs", label: "Custom Wigs", icon: "✂️" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles["brand-icon"]}>👑</span>
        <div>
          <h2 className={styles["brand-title"]}>Marizhaircastle</h2>
          <span className={styles["brand-badge"]}>Admin Ops</span>
        </div>
      </div>

      <ul className={styles["nav-list"]}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`${styles["nav-link"]} ${
                currentPath === link.href ? styles.active : ""
              }`}
            >
              <span className={styles.icon}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <Link href="/" className={styles["store-link"]}>
          ← Back to Storefront
        </Link>
      </div>
    </nav>
  );
};
