import { randomUUID } from "crypto";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type AttemptRecord = {
  failedCount: number;
  lockedUntil: number | null;
  lastSeen: number;
  token: string;
};

// In-memory store. Suitable for a single-instance deployment; for a
// horizontally-scaled production deployment move this to a shared store
// (e.g. Redis) before enabling multiple app instances.
const store = new Map<string, AttemptRecord>();

function key(email: string): string {
  return email.trim().toLowerCase();
}

export function isLockedOut(email: string): { locked: boolean; retryAfterMs: number | null } {
  const record = store.get(key(email));
  if (!record?.lockedUntil) return { locked: false, retryAfterMs: null };
  const remaining = record.lockedUntil - Date.now();
  if (remaining <= 0) {
    record.lockedUntil = null;
    record.failedCount = 0;
    return { locked: false, retryAfterMs: null };
  }
  return { locked: true, retryAfterMs: remaining };
}

export function registerFailure(email: string): {
  attemptsLeft: number;
  locked: boolean;
  retryAfterMs: number | null;
} {
  const k = key(email);
  const record = store.get(k) ?? {
    failedCount: 0,
    lockedUntil: null,
    lastSeen: Date.now(),
    token: randomUUID(),
  };
  record.failedCount += 1;
  record.lastSeen = Date.now();

  if (record.failedCount >= MAX_ATTEMPTS) {
    record.failedCount = 0;
    record.lockedUntil = Date.now() + LOCKOUT_MS;
    store.set(k, record);
    return { attemptsLeft: 0, locked: true, retryAfterMs: LOCKOUT_MS };
  }

  store.set(k, record);
  return {
    attemptsLeft: MAX_ATTEMPTS - record.failedCount,
    locked: false,
    retryAfterMs: null,
  };
}

export function getStatus(email: string): {
  locked: boolean;
  retryAfterMs: number | null;
  attemptsLeft: number;
} {
  const lockout = isLockedOut(email);
  const record = store.get(key(email));
  return {
    locked: lockout.locked,
    retryAfterMs: lockout.retryAfterMs,
    attemptsLeft: record?.lockedUntil ? 0 : Math.max(0, MAX_ATTEMPTS - (record?.failedCount ?? 0)),
  };
}

export function clearFailures(email: string): void {
  store.delete(key(email));
}

// Evict stale records (idle > 30 minutes) to bound memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [k, record] of store.entries()) {
    if (now - record.lastSeen > 30 * 60 * 1000) {
      store.delete(k);
    }
  }
}, 30 * 60 * 1000).unref();

export const RATE_LIMIT_CONSTANTS = { MAX_ATTEMPTS, LOCKOUT_MS };