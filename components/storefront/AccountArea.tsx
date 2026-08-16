"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import styles from "./Header.module.css";

type AccountUser = {
  name: string;
  email: string;
  role: string;
} | null;

export function AccountArea({ user }: { user: AccountUser }) {
  if (!user) {
    return (
      <Link href="/login" className={styles.authLink}>
        Sign in
      </Link>
    );
  }

  return (
    <div className={styles.account}>
      <Link href="/account" className={styles.authLink} title="Customer Account">
        Account
      </Link>
      <button
        type="button"
        className={styles.authLink}
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </button>
    </div>
  );
}