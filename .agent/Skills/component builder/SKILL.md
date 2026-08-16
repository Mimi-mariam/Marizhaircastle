---
name: component-builder
description: Use this skill whenever creating a new React component for Marizhaircastle — storefront, admin, or shared/ui components. Trigger on requests like "build a ProductCard component," "create the cart drawer," "add a new admin table," or any UI element that doesn't exist yet. Also use when asked to follow the "new-component" workflow. Ensures every component follows the project's design system, folder placement, styling method (CSS Modules only), mobile-first responsiveness, and accessibility rules without needing to be told each one individually.
---

# Component Builder

Standardizes how new React components are created for Marizhaircastle so every component is consistent regardless of who or what builds it. Read `.agent/rules/design-system.md` and `.agent/rules/code-style.md` first — this skill is the applied checklist for those rules specifically for new components.

## When to Use

- Any net-new component: product cards, forms, modals, admin tables, layout pieces, buttons, badges, etc.
- Not for one-line prop tweaks to an existing component — only for scaffolding something new.

## Step-by-Step

### 1. Determine placement

Decide which folder the component belongs in, per `.agent/rules/architecture.md`:

| Component is... | Goes in |
|---|---|
| Generic, reusable, no business context (Button, Input, Badge) | `components/ui/` |
| Specific to customer-facing storefront | `components/storefront/` |
| Specific to admin dashboard | `components/admin/` |
| Used by both storefront and admin | `components/shared/` |

If unsure which bucket fits, default to the most specific one now — it's easy to promote a component to `shared/` later if reuse emerges, harder to guess reuse in advance.

### 2. Name the files

- Component file: `PascalCase.tsx` matching the component name (e.g. `ProductCard.tsx`).
- Co-located style file: `PascalCase.module.css` (e.g. `ProductCard.module.css`).
- If the component has meaningfully complex local logic, a co-located `PascalCase.helpers.ts` is fine — don't push trivial logic into `lib/` just for the sake of separation.

### 3. Decide server vs client

- Default to a Server Component (no `"use client"` directive).
- Add `"use client"` only if the component needs: `useState`/`useEffect`/hooks, event handlers, browser APIs, or third-party client-only libraries.
- If the component needs both static content and interactivity, split it: a Server Component wrapper that renders a small Client Component for just the interactive part.

### 4. Build the component

- Single default export matching the filename.
- Props typed explicitly with an interface (`ProductCardProps`), not inline object types for anything with more than 1–2 props.
- Destructure props in the function signature.
- Keep the component focused — if it's handling more than one clear concern (e.g. rendering AND fetching AND business logic), split it or push logic to `lib/`.

### 5. Style with CSS Modules

- Import as `import styles from "./ComponentName.module.css"`.
- Apply classes via `className={styles.foo}`.
- Use design tokens (CSS variables) for colors/spacing/radius — never hardcode hex values, arbitrary px spacing, or unlisted radius values. Tokens are defined in `tokens/design-tokens.css` (import it once globally). See `.agent/rules/design-system.md` for the exact allowed spacing (`4/8/12/16/24/32/48/64px`) and radius (`4/8/12px`) scales.
- Mobile-first: base styles unprefixed, desktop overrides inside `@media (min-width: 768px)`.

### 6. Handle interaction states

For any component involving data fetching, form submission, or async action, explicitly account for:
- Loading state
- Empty state (if it renders a list/collection)
- Error state
- Success/confirmation state (if it triggers an action)
- Disabled state (if it has an actionable control)

Don't skip these because "it probably won't fail" — see `.agent/rules/design-system.md`.

### 7. Accessibility pass

- Semantic HTML elements over generic `div`/`span` with click handlers.
- Interactive elements are real `<button>`/`<a>` elements, keyboard-operable, with visible focus states.
- Images have meaningful `alt` text (or empty `alt=""` if purely decorative).
- Form inputs have associated `<label>` elements.
- Touch targets ≥ 44px tall (mobile-first requirement).

### 8. Verify

- Run typecheck and lint (`npx tsc --noEmit`, `npm run lint`).
- Manually confirm the component renders correctly at a 375px viewport width if it's customer-facing.
- If the component is used in more than one place, check that changes didn't break the other usages.

## Common Mistakes to Avoid

- Reaching for Tailwind or inline styles instead of CSS Modules — not allowed in this project.
- Fetching data or calling Prisma directly inside a component — that belongs in `lib/` or a Server Action, the component should receive data as props or call a typed function.
- Using an unlisted spacing/radius value "just this once" instead of confirming with `.agent/rules/design-system.md`.
- Skipping the empty/error state because "the happy path is what was asked for."
