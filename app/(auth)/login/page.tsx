"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const lockoutRes = await fetch(
        `/api/auth/login-state?email=${encodeURIComponent(email)}`
      );
      if (lockoutRes.ok) {
        const status = (await lockoutRes.json()) as {
          locked: boolean;
          retryAfterMs: number | null;
        };
        if (status.locked) {
          const minutes = Math.ceil((status.retryAfterMs ?? 0) / 60000);
          setError(
            `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`
          );
          return;
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        const statusRes = await fetch(
          `/api/auth/login-state?email=${encodeURIComponent(email)}`
        );
        let message = "Invalid email or password.";
        if (statusRes.ok) {
          const status = (await statusRes.json()) as {
            locked: boolean;
            retryAfterMs: number | null;
            attemptsLeft: number;
          };
          if (status.locked) {
            const minutes = Math.ceil((status.retryAfterMs ?? 0) / 60000);
            message = `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
          } else if (status.attemptsLeft > 0) {
            message = `Invalid email or password. ${status.attemptsLeft} attempt${status.attemptsLeft === 1 ? "" : "s"} remaining.`;
          }
        }
        setError(message);
        return;
      }

      // Check active session to see if the user is an ADMIN
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json().catch(() => null);

      if (callbackUrl && callbackUrl !== "/") {
        router.push(callbackUrl);
      } else if (sessionData?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.brand}>
        <h1>Marizhaircastle</h1>
        <p>Sign in to your account</p>
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className={styles.helper}>
        Don&apos;t have an account? <Link href="/register">Create one</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.brand}><p>Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
