import type { Metadata } from "next";
import styles from "./auth.module.css";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Marizhaircastle",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>{children}</div>
    </div>
  );
}