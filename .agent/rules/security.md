---
trigger: always_on
---

# Security Rules — Marizhaircastle

> **Relationship to AGENTS.md:** This file operationalizes AGENTS.md §4/§7 for security concerns. **Keep it in sync with AGENTS.md whenever either changes**; AGENTS.md is the source of truth and governs *how* to build.

## Critical Business Rules (security-relevant)

1. **Flutterwave is the only payment provider.** No alternative or mock payment paths in production code.
2. **An order is never "paid" without server-side payment verification.** Never trust frontend-reported payment success.
3. Payment, order, and inventory states must always remain consistent. Prevent duplicate orders and duplicate payment processing.
4. Customers can only access their own account, order, and profile data.
5. Admin routes and actions must be authorized **server-side** — frontend UI restrictions are never sufficient authorization on their own.
6. Do not invent business policy (pricing rules, discount logic, delivery coverage) that hasn't been explicitly defined — ambiguity here is a security/business risk, not just a UX gap.

---

## Authentication

- Auth: simple credential auth (`name`, `email`, `password`) via NextAuth/Auth.js `Credentials` provider (or confirmed alternative).
- **Never store passwords in plain text or with reversible/unsalted hashing.** Always hash with a slow, salted algorithm (bcrypt or argon2).
- Sessions must be securely managed (httpOnly, secure cookies in production; appropriate expiry).
- Handle explicitly: invalid credentials, expired sessions, expired password-reset links, invalid or reused verification tokens, repeated failed login attempts.
- Repeated failed login attempts must be rate-limited or throttled — do not leave login endpoints uncapped. If a specific threshold/strategy isn't defined, flag it and confirm rather than inventing one silently.
- Never reveal whether an email exists in the system through differing error messages on login/reset flows (avoid user enumeration).
- On password change or reset, invalidate existing sessions for that user (and revoke/reissue any outstanding reset tokens) — don't leave old sessions alive after credentials change.

---

## CSRF & Session Integrity

- Keep the framework's built-in CSRF protections (NextAuth/Auth.js credentials flow, Next.js Server Actions) enabled — never disable them to "simplify" a form.
- Treat tokens and session cookies as secrets: `httpOnly`, `Secure` in production, and `SameSite` appropriate to the flow (e.g. `Lax` for session cookies, `Strict` or tighter for CSRF-sensitive endpoints where supported).
- Never accept a session/CSRF token from a query string or client body when a cookie mechanism exists.

---

## Transport & Security Headers

- Serve all traffic over HTTPS; never downgrade to HTTP in any environment.
- Configure HTTP security headers globally (CSP, `X-Frame-Options` / `frame-ancestors` against clickjacking, `X-Content-Type-Options: nosniff`, `Referrer-Policy`) via `next.config`/server headers — don't leave the Next.js defaults unmodified and call it done.
- CSP should allow only what the app actually needs; update it deliberately when adding new client-side origins/scripts, not reactively after a reported issue.

---

## Uploads

- Validate any file upload server-side: allowlist file types, enforce size limits, and store uploads outside web-root paths (e.g. object storage) rather than serving user-controlled files directly with executable content.
- Never trust a user-supplied filename or extension as the security boundary — derive safe names and content types server-side.
- Scrub or reject files that are really executable content disguised with an image extension.

---

## Authorization

- Enforce authorization **server-side** on every protected operation — API route, Server Action, and page-level data fetch alike.
- Never rely on hiding a UI element as the only access control.
- A user must not be able to gain access to another user's data by manipulating URLs, IDs, API request bodies, or client-side state.
- Admin actions must check the acting user's role/permission server-side before executing, not just before rendering the admin UI.

---

## Input Validation

- Validate all input server-side with Zod, regardless of client-side validation.
- Treat every external input as untrusted: form submissions, API bodies, query params, and especially **payment webhook/callback payloads**.
- Reject invalid input explicitly — do not attempt to silently coerce or "fix" bad input.

---

## Payments (Flutterwave)

- Never store raw card data. Flutterwave handles card data directly; the app stores only necessary references (transaction ID, status, amount, reference) and results.
- Verify every payment server-side against Flutterwave before marking an order paid — never trust a redirect/query param alone.
- Payment webhook/callback endpoints must validate the request's authenticity (signature/hash per Flutterwave's verification mechanism) before acting on it.
- Handle idempotently: duplicate webhook deliveries, late-arriving callbacks, and duplicate payment references must not create duplicate orders or double-apply payment state.
- Verify the payment amount received matches the expected order amount before confirming — don't confirm on transaction success alone if amount could differ.

---

## Secrets & Credentials

- Never hardcode secrets, API keys, or credentials anywhere in source — use environment variables.
- Flag immediately if a required environment variable is missing rather than silently defaulting to an insecure fallback.
- Never commit `.env` files or any file containing real secrets. Keep `.env.example` in sync with required variable *names* only, never real values.
- Never expose server-side secrets (database URL, Flutterwave secret key, auth secret) to client-side code or bundles.

---

## Logging & Observability

- Never log: passwords, payment credentials/card data, auth tokens/session secrets, or unnecessary personal data.
- Logs should be useful for diagnosing auth failures, payment failures, order failures, inventory issues, and external service failures — without leaking sensitive data in the process.
- Internal error detail (stack traces, raw database errors, third-party error bodies) must never be returned directly in a client-facing response — log it, return a generic safe message to the user.

---

## Data Protection & Compliance

- Handle customer PII (name, email, phone, address, order history) in line with **NDPR (Nigeria Data Protection Regulation)** principles:
  - Collect only what's needed for the transaction/relationship.
  - Store it securely (encrypted at rest where the infra supports it, access-controlled).
  - Don't retain it longer than necessary or share it beyond what the business function requires.
- Admins should not have unnecessary access to sensitive customer information — scope admin views to what's needed for order/customer management, not raw account credentials or full payment detail.

---

## Environment Safety

- Never act against production data or the production environment without explicit confirmation from the person requesting the change.
- Treat `development`, `staging`, and `production` as distinct — never assume one when the other is intended, and confirm which environment a task targets if it's ambiguous.

---

## When Security Is Ambiguous

- Never guess at security-critical logic (auth rules, authorization boundaries, payment verification, data retention).
- If a requirement touches payments, security, customer data, or financial correctness and the right behavior isn't clearly defined, **stop and ask** — do not proceed on an assumption. Getting this wrong is costly and hard to reverse.
