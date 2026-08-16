import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";
import styles from "./admin-layout.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className={styles.container}>
      <AdminNav />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles["user-info"]}>
            <span className={styles.greeting}>Admin Portal</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
