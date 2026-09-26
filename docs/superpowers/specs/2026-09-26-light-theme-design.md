# Dashboard Light Theme — Design

Date: 2026-09-26
Branch: `feat/light-theme` (off `main` @ 37f4f32)
Status: approved in brainstorming; awaiting spec review

## Goal

Add a light theme to every page of the dashboard (`clients/dashboard/pages`). Dark stays the designed look; users choose Light, Dark, or System from a toggle. Work ships in batches, and each batch is accepted only after the user smoke tests it and shares screenshots in both themes.

## Scope

In scope: all pages under `pages/` (except `_app`, `_document`, `sitemap.xml.ts`), the layouts, and every component they render.

Out of scope: the GrapesJS editor canvas and published lander HTML (user content, not dashboard chrome); the server; per-account theme storage.

## Current state

- Colors are hardcoded Tailwind classes in ~177 `.tsx` files; there are no CSS variables or theme tokens.
- Two class dialects coexist: the new dark design (`bg-zinc-900`, `bg-white/5`, `border-white/10`, `text-zinc-400`, PR #50) and older light-styled components (`bg-white`, `bg-gray-100`, `text-gray-700`, `border-gray-300`). The older ones show as light islands in the dark app today.
- PrimeReact uses `bootstrap4-light-blue`; `.oxy-dark-overlay-panel` rules in `styles/globals.css` darken its dropdown, multiselect, and datepicker overlays.
- ~150 inline hex colors in `style` props and chart.js options.

## Design

### 1. Tokens

Semantic tokens are CSS variables holding RGB channels, so Tailwind opacity modifiers keep working (`bg-panel/60`).

| Token | Role | Dark | Light |
|---|---|---|---|
| `surface` | page background | `#000000` | `#f4f4f5` |
| `panel` | cards, tables, modals | `#18181b` | `#ffffff` |
| `panel-raised` | nested boxes, inputs, table headers | `#27272a` | `#fafafa` |
| `hover` | row/button hover wash | white @ 5% | black @ 4% |
| `fg` | primary text | `#f4f4f5` | `#18181b` |
| `fg-muted` | secondary text | `#a1a1aa` | `#52525b` |
| `fg-subtle` | hints, placeholders | `#71717a` | `#71717a` |
| `line` | borders, dividers | white @ 10% | black @ 10% |
| `line-strong` | input and focus borders, rings | white @ 18% | black @ 18% |
| `scrim` | modal backdrop | black @ 60% | black @ 40% |

Translucent tokens (`hover`, `line`, `line-strong`, `scrim`) are defined as full `rgb(... / a)` colors rather than channels. They are used without opacity modifiers.

Brand blue `#00ABE4`, status colors (green/red/amber/etc.), gradients, and `text-white` on colored buttons and badges stay hardcoded. Status tints such as `bg-green-500/10` get a contrast check on white and are adjusted only when unreadable.

### 2. Theme mechanics

- `tailwind.config.ts`: register the tokens under `theme.extend.colors`: channel tokens as `rgb(var(--x) / <alpha-value>)`, translucent tokens as `var(--x)`.
- `styles/globals.css`: dark values on `:root`, light values on `html.light`; `color-scheme: dark` / `light` accordingly; `body` uses `bg-surface text-fg`.
- `utils/theme.ts`: pure logic.
  - Types: `ThemePref = "light" | "dark" | "system"`, `ResolvedTheme = "light" | "dark"`.
  - `parsePref(value: unknown): ThemePref` returns `"system"` for anything invalid.
  - `resolveTheme(pref, prefersDark): ResolvedTheme`.
  - `THEME_STORAGE_KEY = "theme"`.
- `pages/_document.tsx`: a small inline script in `<Head>` reads `localStorage.theme` inside try/catch, resolves it with `matchMedia('(prefers-color-scheme: dark)')`, and adds the `light` class to `<html>` before first paint. The script mirrors `resolveTheme`; the unit tests pin that behavior.
- `hooks/useTheme.ts`: returns `{ pref, resolved, setPref }`.
  - Persists the choice to localStorage, wrapped in try/catch.
  - Toggles the `html.light` class.
  - Listens for `matchMedia` changes while the pref is `system`.
  - Listens for `storage` events for cross-tab sync.
  - `resolved` is read after mount to avoid hydration mismatch.
- `components/common/ThemeToggle.tsx`: Light / Dark / System control, placed in `dashboardNavbar`. On the auth pages, which have no navbar, a compact version sits in a corner.
- PrimeReact: `.oxy-dark-overlay-panel` becomes `.oxy-overlay-panel`, with its hex values replaced by token variables. All `panelClassName` usages are updated.
- SweetAlert2: a `globals.css` rule themes `.swal2-popup`, its title, its content, and its inputs with the tokens.
- Print: `.print` and the payslip page force light values.

### 3. Migration rules

Map each class by the role it plays, not its literal value:

| Today | Becomes |
|---|---|
| `bg-black`, page-level `bg-gray-50/100` | `bg-surface` |
| `bg-zinc-900`, card/modal `bg-white` | `bg-panel` |
| `bg-zinc-800/700`, `bg-white/5`, `bg-gray-50/100` inside cards | `bg-panel-raised` |
| `hover:bg-white/5`, `hover:bg-gray-50` | `hover:bg-hover` |
| `text-white` / `text-zinc-100/200` on panels, `text-black`, `text-gray-800/900` | `text-fg` |
| `text-zinc-300/400`, `text-gray-500/600/700` | `text-fg-muted` |
| `text-zinc-500`, `text-gray-400`, placeholder colors | `text-fg-subtle` |
| `border-white/5–10`, `border-gray-100/200/300`, `divide-*` | `border-line` / `divide-line` |
| `border-white/15–20`, `border-gray-400/600`, `ring-gray-*` | `border-line-strong` / `ring-line-strong` |
| `bg-black/30–60` backdrops | `bg-scrim` |

Kept as-is: `text-white` on brand or status backgrounds, status colors, and gradients. `ring-black` focus rings are handled case by case.

Beyond classes:
- Chart.js grid, tick, and legend colors come from `useTheme().resolved`, so charts redraw when the theme changes.
- Inline hex styles are reviewed one by one. Neutral colors become `rgb(var(--x))` or `var(--x)`; brand and status colors stay.

### 4. Batches

Each batch is one commit and ends at a user smoke-test checkpoint.

0. **Foundation + app shell**
   - Tokens, `utils/theme.ts`, the `_document` script, `useTheme`, and `ThemeToggle`.
   - `dashboardNavbar`, `components/sidebars`, `dashboardLayout`, `PopupLayout`.
   - `components/common`, `components/loadings`, `AnnoucementShow`.
   - The PrimeReact and SweetAlert2 overrides.
1. **Landers and domains**
   - Pages: `/` (index), `landingPages`, `landingpage/[landingPageId]`, `create-landingpage`, `domain`, `domain/[domainId]`, `link-audit`.
   - Components: `category`, `landingPages`, `domain`, `link-audit`.
2. **Analytics and admin**
   - Pages: `analytics`, `customer`, `manage-account`.
   - Components: `analytics`, `Annoucement`, `forms`, `everflow-reports`.
3. **Account and billing**
   - Pages: `account-setting`, `account-history`, `account-billing`, `account/devices`, `payslip/[recordDate]`, `inbox`.
   - Components: `billing`, `payslip`, `inbox`.
4. **Auth**
   - Pages: `auth/sign-in`, `sign-up`, `pending`, `setup-totp`, `new-password`.
   - Components: `components/auth`, plus the corner toggle.
5. **Tools**
   - Page: `tools`.
   - Components: `sms-*`, `cloud-phone`, `simCard`, `partner-league`, `IntimateInfoContents`, `sms-report`, and any remaining component folders.
   - May be split into 5a/5b at plan time.

## Verification

- **Unit tests (Vitest):** `parsePref` and `resolveTheme` cover every pref × OS combination, plus invalid, null, and missing values.
- **Audit script** (`scripts/theme-audit.mjs <paths...>`):
  - Fails when a raw neutral color class remains in the given files: `bg|text|border|ring|divide|placeholder` combined with `black|white|zinc-*|gray-*|slate-*|neutral-*`, with or without an opacity suffix.
  - Allowlisted: `text-white` / `hover:text-white` / `ring-black` on lines that also carry a brand or status background.
  - Allowlisted: an inline `// theme-audit-ignore` marker for justified exceptions.
  - Runs per batch, and across `pages components layouts` at the end.
- **Build gate:** `npm run build && npm test` pass before every commit.
- **Smoke test (user):** after each batch, the user gets a checklist of URLs and states (open dropdown, modal, chart, empty table) and shares screenshots in Light and Dark. Pass criteria:
  - Light: readable and consistent.
  - Dark: matches today's look, except that former light islands are now dark.

  A batch is done only after the user confirms from their screenshots.

## Error handling

- localStorage unavailable, throwing, or holding a bad value → the pref falls back to `system`.
- `matchMedia` unavailable → `system` resolves to `dark` (the designed default).
- No hydration warnings: the server render carries no theme-specific attributes that React owns; the `html` class is set by the script outside React.

## Risks

- **Role misjudgment during mapping**, e.g. `text-white` that sits on a panel versus on a button. Mitigated by the per-batch screenshots.
- **Third-party widgets** (Tawk.to chat, react-query devtools) keep their own styling. That is accepted.
- **Large diff on `everflow-reports`, `forms`, and `cloud-phone`** (~12k lines). Batches keep review sizes manageable.
