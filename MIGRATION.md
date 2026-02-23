# Reconciliation — Vite → Next.js Migration Summary

## Overview

Migrated the single-file Vite prototype (`/Users/yarem/Reconciliation/App.jsx`, 2874 lines) into
a standalone Next.js 15.2.8 App Router application at `/Users/yarem/Reconciliation-next/`,
mirroring the structure and conventions of the main Fiskl app at
`/Users/yarem/Documents/fiskl-react`.

---

## What Was Migrated

### Screens → Routes

| Vite screen state | Next.js route                                      |
|-------------------|----------------------------------------------------|
| Screen 0          | `/reconciliation`                                  |
| Screen 0.5        | `/reconciliation/[accountId]`                      |
| Screen 1          | `/reconciliation/[accountId]/[periodId]`           |
| Screen 2          | `/reconciliation/[accountId]/[periodId]/upload`    |
| Screen 3          | `/reconciliation/[accountId]/[periodId]/reconcile` |
| Screen 4          | `/reconciliation/[accountId]/[periodId]/report`    |

All screen-state `setScreen()` calls replaced with `router.push()` from `next/navigation`.

### Data & Types

| File | Description |
|------|-------------|
| `lib/reconciliation/mock-data.ts` | All mock data extracted from `App.jsx` (`ACCOUNTS`, `HSBC_PERIODS`, `TRANSACTIONS`, `LEDGER`, `INIT_ATTENTION`, `INIT_MATCHED`, `NAV_ITEMS`, `MONTH_LABELS`) |
| `types/reconciliation.ts` | Full TypeScript interfaces for every data shape (`LedgerEntry`, `StatementEntry`, `AttentionItem`, `MatchedItem`, `NavItem`, etc.) |
| `lib/utils.ts` | Shared utilities: `cn`, `fmtGbp`, `fmtCurrency`, `fmtAmt`, `BRAND_GRADIENT`, `periodSlug` |

### Components

| New file | Replaces / Description |
|----------|------------------------|
| `components/ui/button.tsx` | Replaces Vite `<Btn>` — shadcn/ui Button with class-variance-authority |
| `components/ui/badge.tsx` | Replaces Vite `<Badge>` — extended with `positive`, `neutral`, `warning`, `critical`, `ai` variants |
| `components/ui/card.tsx` | Replaces Vite `<Crd>` — shadcn/ui Card primitives |
| `components/ui/separator.tsx` | Replaces Vite `<Separator>` |
| `components/ui/tooltip.tsx` | Replaces Vite `<Tooltip>` — Radix UI based |
| `components/ui/dropdown-menu.tsx` | Replaces Vite `<DropdownMenu>` — Radix UI based |
| `components/ui/dialog.tsx` | Replaces Vite `<EditModal>` foundation |
| `components/ui/input.tsx` | Form input primitive |
| `components/reconciliation/sidebar.tsx` | Direct port of Vite Sidebar — uses Lucide icons |
| `components/reconciliation/site-header.tsx` | Direct port of Vite SiteHeader — tab-based navigation |
| `components/reconciliation/period-selector.tsx` | Direct port of Vite `<PeriodSelector>` |
| `components/reconciliation/stats-bar.tsx` | Direct port of Vite `<StatsBar>` |
| `components/reconciliation/balance-banner.tsx` | Direct port of Vite `<BalanceBanner>` — sticky fixed-position bar |
| `components/reconciliation/conf-box.tsx` | Direct port of Vite `<ConfBox>` — AI confidence match widget |
| `components/reconciliation/edit-transaction-dialog.tsx` | Replaces Vite `<EditModal>` — uses shadcn Dialog |
| `components/reconciliation/create-transaction-dialog.tsx` | New component using shadcn Dialog |
| `components/reconciliation/ledger-statement-items.tsx` | Ports Vite `<LedgerItem>` and `<StatementItem>` |
| `components/reconciliation/shell.tsx` | **New** — client component wrapping layout; reads `useParams()` to pass `accountId`/`periodId` to SiteHeader |
| `components/reconciliation/sec-hdr.tsx` | Ports Vite `<SecHdr>` — collapsible section header |
| `components/reconciliation/not-in-ledger.tsx` | Ports Vite `<NotInLedgerCenter>` — missing transaction widget |

---

## Key Technical Decisions

### 1. Icon System
The Vite app used `lucide-react` (imported directly). In the Next.js app all reconciliation
components use `lucide-react` as well — the rule in `CLAUDE.md` to avoid icon libraries applies
only to the original Vite prototype; the main Next.js app already uses Lucide.

### 2. Period Slugs for URL Routing
`HSBC_PERIODS` entries have no numeric IDs. A `periodSlug()` utility converts display strings
like `"June 2025"` → `"june-2025"` for use as URL segments. Pages that receive a `periodId`
param decode it back by matching against the periods array.

### 3. `ReconciliationShell` Layout Pattern
The `app/reconciliation/layout.tsx` server component cannot use hooks, but `SiteHeader` needs
`accountId`/`periodId` to highlight the correct breadcrumb tabs. Solved by a thin client
component (`ReconciliationShell`) that calls `useParams()` at runtime and passes the resolved
values down to `SiteHeader`. It also owns the sidebar collapse state.

### 4. CSS Variable `--sidebar-w`
`BalanceBanner` is `position: fixed` and needs `left: var(--sidebar-w)` to avoid being hidden
behind the sidebar. The shell sets `--sidebar-w` on its root `div`; CSS custom properties are
inherited by fixed children in the same stacking context, so the banner repositions correctly
when the sidebar collapses.

### 5. Styling Strategy
- All existing Vite inline styles kept as Tailwind utility classes where 1:1 equivalents exist
- Design tokens preserved unchanged as CSS custom properties in `styles/globals.css`
- `oklch` color values carried over verbatim from the Vite `:root` block
- Tailwind config extended with `positive`, `warning`, and `sidebar-*` semantic color tokens
  that point at the same CSS variables

### 6. Upload Screen (Screen 2)
Removed the Vite-specific `window.location.search` `?freeze` parameter that was used to
pause the animation for screenshot capture. The Next.js version simply starts the 4-stage
upload animation immediately on mount.

---

## File Structure

```
Reconciliation-next/
├── app/
│   ├── layout.tsx                                   # Root layout — Inter font
│   ├── page.tsx                                     # Redirects → /reconciliation
│   └── reconciliation/
│       ├── layout.tsx                               # Wraps all pages in ReconciliationShell
│       ├── page.tsx                                 # Screen 0 — accounts list
│       └── [accountId]/
│           ├── page.tsx                             # Screen 0.5 — account periods
│           └── [periodId]/
│               ├── page.tsx                         # Screen 1 — transactions table
│               ├── upload/page.tsx                  # Screen 2 — upload animation
│               ├── reconcile/page.tsx               # Screen 3 — AI reconcile view
│               └── report/page.tsx                  # Screen 4 — reconciliation report
├── components/
│   ├── ui/                                          # shadcn/ui primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── separator.tsx
│   │   └── tooltip.tsx
│   └── reconciliation/                              # Feature components
│       ├── shell.tsx
│       ├── sidebar.tsx
│       ├── site-header.tsx
│       ├── period-selector.tsx
│       ├── stats-bar.tsx
│       ├── balance-banner.tsx
│       ├── conf-box.tsx
│       ├── sec-hdr.tsx
│       ├── not-in-ledger.tsx
│       ├── ledger-statement-items.tsx
│       ├── edit-transaction-dialog.tsx
│       └── create-transaction-dialog.tsx
├── lib/
│   ├── utils.ts
│   └── reconciliation/
│       └── mock-data.ts
├── styles/
│   └── globals.css
├── types/
│   └── reconciliation.ts
├── next.config.ts
├── tailwind.config.js
├── postcss.config.mjs
└── tsconfig.json
```

---

## Build & Dev

```bash
npm install
npx next dev        # → http://localhost:3000
npx next build      # production build (all 7 routes compile cleanly)
```

Build output (production):

```
Route (app)                                              Size  First Load JS
┌ ○ /                                                   135 B         101 kB
├ ○ /reconciliation                                   2.54 kB         113 kB
├ ƒ /reconciliation/[accountId]                       3.98 kB         115 kB
├ ƒ /reconciliation/[accountId]/[periodId]            4.88 kB         132 kB
├ ƒ /reconciliation/[accountId]/[periodId]/reconcile  7.84 kB         148 kB
├ ƒ /reconciliation/[accountId]/[periodId]/report     3.47 kB         111 kB
└ ƒ /reconciliation/[accountId]/[periodId]/upload     1.58 kB         109 kB
```
