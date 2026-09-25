# Dashboard Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Light / Dark / System theme to every dashboard page, delivered in batches that each end with a user screenshot smoke test.

**Architecture:**
- Semantic color tokens live as CSS variables: dark values on `:root`, light values on `html.light`.
- Tailwind registers the tokens as color classes (`bg-panel`, `text-fg`, `border-line`, …).
- An inline script in `_document.tsx` sets `html.light` before first paint.
- A `useTheme` hook and a `ThemeToggle` component let users switch themes.
- Component files are migrated batch by batch from hardcoded neutral classes to tokens. An audit script enforces that nothing hardcoded is left.

**Tech Stack:** Next.js 14 (pages router), React 18.3, Tailwind 3.4, PrimeReact 10, SweetAlert2, Chart.js 4, Vitest (+ jsdom for `*.dom.test.ts`).

**Spec:** `docs/superpowers/specs/2026-09-26-light-theme-design.md`

**Working dir:** `clients/dashboard`. **Branch:** `feat/light-theme`. Dev server: `npm run dev` → http://localhost:8080.

## Global Constraints

- Theme preferences: `"light" | "dark" | "system"`. The default is `"system"`. The localStorage key is `theme`. Invalid values fall back to `"system"`. When `matchMedia` is unavailable, `system` resolves to `dark`.
- Token names are exactly: `surface`, `panel`, `panel-raised`, `hover`, `fg`, `fg-muted`, `fg-subtle`, `line`, `line-strong`, `scrim`.
- Token values:
  - Dark: surface `#000000`, panel `#18181b`, panel-raised `#27272a`, hover white 5%, fg `#f4f4f5`, fg-muted `#a1a1aa`, fg-subtle `#71717a`, line white 10%, line-strong white 18%, scrim black 60%.
  - Light: surface `#f4f4f5`, panel `#ffffff`, panel-raised `#fafafa`, hover black 4%, fg `#18181b`, fg-muted `#52525b`, fg-subtle `#71717a`, line black 10%, line-strong black 18%, scrim black 40%.
- These stay hardcoded: brand `#00ABE4` (`main-color`), `icon-color`, status colors, gradients, and `text-white` on brand or status backgrounds.
- Out of scope: the GrapesJS editor canvas and `editor/`, published lander HTML, TinyMCE's internal UI, Tawk.to, react-query devtools, and the server.
- No JSX in test files: the project compiles with `jsx: "preserve"`, so tests build trees with `React.createElement`. The Vitest include pattern is `**/*.test.ts`. DOM tests start with `// @vitest-environment jsdom`.
- `npm run build && npm test` must pass before every commit.
- Commits get no `Co-Authored-By` trailer (project CLAUDE.md rule). Nothing is pushed without the user's say-so.
- Every source file stays under 500 lines. Don't split existing large files as part of this work.
- **Smoke-test gate:** at the end of each batch task, STOP and ask the user for screenshots in Light and Dark. Do not start the next batch until the user confirms. Never claim a batch visually works without their screenshots.

## Review Focus

1. localStorage blocked or throwing (Safari private mode, disabled storage) → no crash, theme follows System. Tests: Task 1 (init script) and Task 3 (hook).
2. OS theme flips while System is selected → the page follows live. Test: Task 3.
3. Two consumers in the same tab (navbar toggle + a chart) → both update on a toggle click without a reload. Test: Task 3.
4. A garbage stored value (e.g. `"blue"`) → treated as System and shown as System in the toggle. Test: Task 3.
5. White text on a brand button must not trip the audit, while white text on a neutral panel must. Test: Task 4.

---

## File Map

| File | Responsibility |
|---|---|
| `utils/theme.ts` (new) | Pure theme logic: types, `parsePref`, `resolveTheme`, `applyTheme`, `chartColors`, `THEME_INIT_SCRIPT`, `THEME_TOKENS`, event name |
| `utils/theme.test.ts` (new) | Unit tests for the above, including executing the init script against fakes |
| `utils/themeTokens.test.ts` (new) | Checks that every token is defined in CSS (dark, light, print) and registered in Tailwind |
| `styles/globals.css` | Token variables, Prime overlay theming, SweetAlert2 theming, print/light scope |
| `tailwind.config.ts` | Registers token colors |
| `pages/_document.tsx` | Injects `THEME_INIT_SCRIPT` |
| `hooks/useTheme.ts` (new) | React state for the preference, persistence, OS and cross-instance sync |
| `hooks/useTheme.dom.test.ts` (new) | Hook + toggle behaviour tests |
| `components/common/ThemeToggle.tsx` (new) | Light/Dark/System segmented control |
| `scripts/theme-audit.mjs` (new) | CLI + `auditSource()` that flags raw neutral color classes |
| `scripts/theme-audit.test.ts` (new) | Audit rule tests |
| All `.tsx` in the batch lists below | Class migration to tokens |

## Migration Rules (used by Tasks 6–12)

Map each class by the role it plays in the UI, not by its literal value. Variant prefixes (`hover:`, `focus:`, `md:`, `group-hover:`) carry over unchanged.

| Hardcoded (either dialect) | Token class |
|---|---|
| `bg-black`; page-wrapper `bg-gray-50` / `bg-gray-100` | `bg-surface` |
| `bg-zinc-900`; card/modal/table `bg-white` | `bg-panel` |
| `bg-zinc-800`, `bg-zinc-700`, `bg-white/5`, `bg-white/10`; `bg-gray-50/100/200` *inside* a card; `bg-slate-*` neutral fills | `bg-panel-raised` |
| `hover:bg-white/5`, `hover:bg-white/10`, `hover:bg-gray-50/100` | `hover:bg-hover` |
| `text-white`, `text-zinc-100`, `text-zinc-200` on a neutral surface; `text-black`; `text-gray-800/900` | `text-fg` |
| `text-zinc-300`, `text-zinc-400`, `text-white/60–80`, `text-gray-500/600/700` | `text-fg-muted` |
| `text-zinc-500`, `text-white/30–50`, `text-gray-400`, `placeholder:text-*` neutrals | `text-fg-subtle` (`placeholder:text-fg-subtle`) |
| `border-white/5`, `border-white/10`, `border-gray-100/200/300`, `divide-white/5`, `divide-gray-200/700`, `bg-white/10` used as a 1px divider | `border-line` / `divide-line` / `bg-line` |
| `border-white/15`, `border-white/20`, `border-gray-400/600/700`, `border-black`, `ring-gray-*`, `ring-white/10`, `ring-black` (non-focus) | `border-line-strong` / `ring-line-strong` |
| `bg-black/30`, `bg-black/40`, `bg-black/60` backdrops | `bg-scrim` |
| `hover:text-white` on a neutral item | `hover:text-fg` |
| `<option className="bg-black text-white">` | `className="bg-panel text-fg"` |

Keep unchanged:
- `text-white` / `hover:text-white` on a `bg-main-color`, `bg-<status>-<n>` or gradient background. It must be on the same line as that background, or be marked with `{/* theme-audit-ignore */}` / `// theme-audit-ignore` on the same line.
- Status tints (`bg-green-500/10 text-green-400`, etc.). If the text is unreadable on white in Light, switch it to the `-600` shade (e.g. `text-green-600`), which reads on both black and white. These are not neutrals, so the audit does not flag them either way.
- `bg-white` on a logo "pill" that must stay white (the navbar logo): add `theme-audit-ignore`.

Inline styles and hex values:
- In `style={{…}}` props, neutral hex/rgba values become CSS variables: `#000`/`#09090b` → `rgb(var(--surface))`, `#18181b` → `rgb(var(--panel))`, `#fff` text → `rgb(var(--fg))`, `rgba(255,255,255,.1)` → `var(--line)`.
- Brand and status hex values stay.

Before/after example (from `components/navbars/dashboardNavbar.tsx:103`):

```tsx
// before
<div className="absolute right-0 top-12 z-50 flex w-64 flex-col gap-2 rounded-xl border border-white/10 bg-black p-3 text-white shadow-xl md:top-14 md:w-72">
// after
<div className="absolute right-0 top-12 z-50 flex w-64 flex-col gap-2 rounded-xl border border-line bg-panel p-3 text-fg shadow-xl md:top-14 md:w-72">
```

Older light dialect example:

```tsx
// before
<div className="rounded-lg bg-white p-4 shadow">
  <h2 className="text-lg font-semibold text-gray-800">
// after
<div className="rounded-lg bg-panel p-4 shadow">
  <h2 className="text-lg font-semibold text-fg">
```

Brand button (unchanged, passes audit because the background is on the same line):

```tsx
<button className="rounded-lg bg-main-color px-4 py-2 text-white hover:bg-main-color/90">
```

**Per-file procedure** (every migration task):
1. Run `node scripts/theme-audit.mjs <file>` to list offenders.
2. Rewrite each one per the table, reading the surrounding markup to decide the role.
3. Replace neutral inline hex values.
4. Re-run the audit on the file. Zero offenders is required, apart from justified `theme-audit-ignore` markers.

---

### Task 1: Pure theme logic

**Files:**
- Create: `utils/theme.ts`
- Test: `utils/theme.test.ts`

**Interfaces:**
- Produces:
  - `type ThemePref = "light" | "dark" | "system"`
  - `type ResolvedTheme = "light" | "dark"`
  - `THEME_STORAGE_KEY = "theme"`
  - `THEME_CHANGE_EVENT = "oxy-theme-change"`
  - `THEME_TOKENS` (readonly tuple of the 10 names)
  - `parsePref(value: unknown): ThemePref`
  - `resolveTheme(pref: ThemePref, prefersDark: boolean | null): ResolvedTheme`
  - `applyTheme(resolved: ResolvedTheme, root: { classList: DOMTokenList }): void`
  - `chartColors(resolved: ResolvedTheme): { text: string; grid: string }`
  - `THEME_INIT_SCRIPT: string`

- [ ] **Step 1: Write the failing tests** in `utils/theme.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  THEME_TOKENS,
  applyTheme,
  chartColors,
  parsePref,
  resolveTheme,
} from "./theme";

function fakeClassList() {
  const set = new Set<string>();
  return {
    set,
    classList: {
      add: (c: string) => void set.add(c),
      remove: (c: string) => void set.delete(c),
      contains: (c: string) => set.has(c),
    } as unknown as DOMTokenList,
  };
}

/** Executes the inline <head> script against fake globals; returns whether html got `light`. */
function runInitScript(opts: {
  stored?: string | null;
  storageThrows?: boolean;
  prefersDark?: boolean | null; // null = matchMedia missing
}): boolean {
  const cl = fakeClassList();
  const localStorage = {
    getItem: (k: string) => {
      if (opts.storageThrows) throw new Error("SecurityError");
      return k === THEME_STORAGE_KEY ? (opts.stored ?? null) : null;
    },
  };
  const window =
    opts.prefersDark === null
      ? {}
      : { matchMedia: () => ({ matches: opts.prefersDark ?? true }) };
  const document = { documentElement: { classList: cl.classList } };
  new Function("localStorage", "window", "document", THEME_INIT_SCRIPT)(
    localStorage,
    window,
    document,
  );
  return cl.set.has("light");
}

describe("parsePref", () => {
  it.each(["light", "dark", "system"])("accepts %s", (v) => {
    expect(parsePref(v)).toBe(v);
  });
  it.each([null, undefined, "", "blue", "LIGHT", 1, {}])(
    "falls back to system for %p",
    (v) => {
      expect(parsePref(v)).toBe("system");
    },
  );
});

describe("resolveTheme", () => {
  it("explicit prefs win over the OS", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("system follows the OS", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("system without matchMedia is dark", () => {
    expect(resolveTheme("system", null)).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("adds and removes the light class", () => {
    const cl = fakeClassList();
    applyTheme("light", cl);
    expect(cl.set.has("light")).toBe(true);
    applyTheme("dark", cl);
    expect(cl.set.has("light")).toBe(false);
  });
});

describe("chartColors", () => {
  it("returns distinct palettes per theme", () => {
    expect(chartColors("light")).toEqual({ text: "#52525b", grid: "rgba(0,0,0,0.08)" });
    expect(chartColors("dark")).toEqual({ text: "#a1a1aa", grid: "rgba(255,255,255,0.08)" });
  });
});

describe("THEME_TOKENS", () => {
  it("lists the ten spec tokens", () => {
    expect([...THEME_TOKENS]).toEqual([
      "surface", "panel", "panel-raised", "hover", "fg",
      "fg-muted", "fg-subtle", "line", "line-strong", "scrim",
    ]);
  });
});

describe("THEME_INIT_SCRIPT matches resolveTheme", () => {
  it.each([
    ["light", true, true],
    ["dark", false, false],
    ["system", false, true],
    ["system", true, false],
    ["blue", false, true],
    [null, false, true],
    [null, true, false],
  ] as const)("stored=%p prefersDark=%p → light=%p", (stored, prefersDark, light) => {
    expect(runInitScript({ stored, prefersDark })).toBe(light);
  });
  it("no matchMedia + system → dark", () => {
    expect(runInitScript({ stored: "system", prefersDark: null })).toBe(false);
  });
  it("throwing localStorage → system, no exception", () => {
    expect(runInitScript({ storageThrows: true, prefersDark: false })).toBe(true);
    expect(runInitScript({ storageThrows: true, prefersDark: true })).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run utils/theme.test.ts`
Expected: FAIL, "Failed to resolve import ./theme".

- [ ] **Step 3: Implement `utils/theme.ts`**

```ts
export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
/** Fired on window when a tab changes the pref, so every useTheme instance re-syncs. */
export const THEME_CHANGE_EVENT = "oxy-theme-change";

export const THEME_TOKENS = [
  "surface",
  "panel",
  "panel-raised",
  "hover",
  "fg",
  "fg-muted",
  "fg-subtle",
  "line",
  "line-strong",
  "scrim",
] as const;

export function parsePref(value: unknown): ThemePref {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : "system";
}

/** prefersDark is null when matchMedia is unavailable; dark is the designed default. */
export function resolveTheme(
  pref: ThemePref,
  prefersDark: boolean | null,
): ResolvedTheme {
  if (pref !== "system") return pref;
  return prefersDark === false ? "light" : "dark";
}

export function applyTheme(
  resolved: ResolvedTheme,
  root: { classList: DOMTokenList },
): void {
  if (resolved === "light") root.classList.add("light");
  else root.classList.remove("light");
}

export function chartColors(resolved: ResolvedTheme): {
  text: string;
  grid: string;
} {
  return resolved === "light"
    ? { text: "#52525b", grid: "rgba(0,0,0,0.08)" }
    : { text: "#a1a1aa", grid: "rgba(255,255,255,0.08)" };
}

/**
 * Runs in <head> before first paint (pages/_document.tsx). Mirrors
 * parsePref + resolveTheme; utils/theme.test.ts executes it to keep them in step.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=null;try{p=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(p!=="light"&&p!=="dark")p="system";var d=null;try{d=window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)").matches:null}catch(e){}var r=p==="system"?(d===false?"light":"dark"):p;var c=document.documentElement.classList;if(r==="light")c.add("light");else c.remove("light")}catch(e){}})();`;
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run utils/theme.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add utils/theme.ts utils/theme.test.ts
git commit -m "feat(theme): pure theme resolution logic and init script"
```

---

### Task 2: Tokens in CSS + Tailwind, no-flash script

**Files:**
- Modify: `styles/globals.css` (append a token section after the `@tailwind` lines)
- Modify: `tailwind.config.ts` (`theme.extend.colors`)
- Modify: `pages/_document.tsx`
- Test: `utils/themeTokens.test.ts`

**Interfaces:**
- Consumes: `THEME_TOKENS`, `THEME_INIT_SCRIPT` from Task 1.
- Produces:
  - Tailwind classes `bg|text|border|ring|divide-{surface,panel,panel-raised,hover,fg,fg-muted,fg-subtle,line,line-strong,scrim}`.
  - CSS vars `--<token>`.
  - Class `.theme-light-scope`, which forces light values inside any container.

- [ ] **Step 1: Write the failing test** `utils/themeTokens.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import tailwindConfig from "../tailwind.config";
import { THEME_TOKENS } from "./theme";

const css = readFileSync(join(__dirname, "../styles/globals.css"), "utf8");

/** Innermost `selector { body }` blocks — enough for flat variable blocks. */
function blocks(): { selector: string; body: string }[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
  }));
}

function flattenColors(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const name = k === "DEFAULT" ? prefix : prefix ? `${prefix}-${k}` : k;
    return typeof v === "string" ? [name] : flattenColors(v as Record<string, unknown>, name);
  });
}

describe("theme tokens", () => {
  const all = blocks();
  const root = all.filter((b) => b.selector === ":root");
  const light = all.find((b) => b.selector.includes("html.light"));

  it("defines every token for dark (:root, twice: screen + print) and light", () => {
    expect(root).toHaveLength(2);
    expect(light).toBeDefined();
    for (const t of THEME_TOKENS) {
      for (const b of [...root, light!]) {
        expect(b.body, `--${t} in ${b.selector}`).toMatch(new RegExp(`--${t}:`));
      }
    }
  });

  it("registers every token as a Tailwind color", () => {
    const colors = flattenColors(
      tailwindConfig.theme!.extend!.colors as Record<string, unknown>,
    );
    for (const t of THEME_TOKENS) expect(colors).toContain(t);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run utils/themeTokens.test.ts`
Expected: FAIL. `root` has length 0 and `light` is undefined.

- [ ] **Step 3: Add the token variables** to `styles/globals.css`, directly after `@tailwind utilities;`:

```css
/* ── Theme tokens ─────────────────────────────────────────────
   Channel tokens hold "r g b" so Tailwind opacity modifiers work.
   Translucent tokens hold full colors. Dark is the default (:root);
   html.light is set before paint by THEME_INIT_SCRIPT (utils/theme.ts). */
@layer base {
  :root {
    color-scheme: dark;
    --surface: 0 0 0;
    --panel: 24 24 27;
    --panel-raised: 39 39 42;
    --fg: 244 244 245;
    --fg-muted: 161 161 170;
    --fg-subtle: 113 113 122;
    --hover: rgb(255 255 255 / 0.05);
    --line: rgb(255 255 255 / 0.1);
    --line-strong: rgb(255 255 255 / 0.18);
    --scrim: rgb(0 0 0 / 0.6);
  }

  html.light,
  .theme-light-scope {
    color-scheme: light;
    --surface: 244 244 245;
    --panel: 255 255 255;
    --panel-raised: 250 250 250;
    --fg: 24 24 27;
    --fg-muted: 82 82 91;
    --fg-subtle: 113 113 122;
    --hover: rgb(0 0 0 / 0.04);
    --line: rgb(0 0 0 / 0.1);
    --line-strong: rgb(0 0 0 / 0.18);
    --scrim: rgb(0 0 0 / 0.4);
  }

  /* Paper is always light (payslips, .print sections). Keep in sync with html.light. */
  @media print {
    :root {
      color-scheme: light;
      --surface: 255 255 255;
      --panel: 255 255 255;
      --panel-raised: 250 250 250;
      --fg: 24 24 27;
      --fg-muted: 82 82 91;
      --fg-subtle: 113 113 122;
      --hover: rgb(0 0 0 / 0.04);
      --line: rgb(0 0 0 / 0.1);
      --line-strong: rgb(0 0 0 / 0.18);
      --scrim: rgb(0 0 0 / 0.4);
    }
  }
}
```

Note: `body` colors are deliberately **not** set here. Task 13 sets them once every page is migrated, so unmigrated pages keep today's look during the rollout.

- [ ] **Step 4: Register the colors** in `tailwind.config.ts`. Extend `colors` so it reads:

```ts
      colors: {
        "icon-color": "#62C7D8",
        "supper-main-color": "#FFFFFF",
        "main-color": "#00ABE4",
        "second-color": "#E9F1FA",
        // Theme tokens — values live in styles/globals.css
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: {
          DEFAULT: "rgb(var(--panel) / <alpha-value>)",
          raised: "rgb(var(--panel-raised) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          subtle: "rgb(var(--fg-subtle) / <alpha-value>)",
        },
        hover: "var(--hover)",
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        scrim: "var(--scrim)",
      },
```

- [ ] **Step 5: Inject the init script** in `pages/_document.tsx`:

```tsx
import { Html, Head, Main, NextScript } from 'next/document'
import { THEME_INIT_SCRIPT } from '../utils/theme'

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* Sets html.light before first paint so light users never see a dark flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

- [ ] **Step 6: Run the tests and the build**

Run: `npx vitest run utils/themeTokens.test.ts && npm run build`
Expected: the tests PASS and the build succeeds.

- [ ] **Step 7: Commit**

```bash
git add styles/globals.css tailwind.config.ts pages/_document.tsx utils/themeTokens.test.ts
git commit -m "feat(theme): token variables, tailwind colors, no-flash init script"
```

---

### Task 3: `useTheme` hook + `ThemeToggle`

**Files:**
- Create: `hooks/useTheme.ts`
- Create: `components/common/ThemeToggle.tsx`
- Test: `hooks/useTheme.dom.test.ts`

**Interfaces:**
- Consumes: `THEME_STORAGE_KEY`, `THEME_CHANGE_EVENT`, `parsePref`, `resolveTheme`, `applyTheme`, `ThemePref`, `ResolvedTheme` from Task 1.
- Produces:
  - `useTheme(): { pref: ThemePref; resolved: ResolvedTheme; setPref: (p: ThemePref) => void; mounted: boolean }`
  - `default export ThemeToggle({ compact?: boolean })`
  - Buttons carry `aria-label` "Light" / "Dark" / "System" and `aria-pressed`.

- [ ] **Step 1: Write the failing tests** `hooks/useTheme.dom.test.ts`:

```ts
// @vitest-environment jsdom
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "./useTheme";

const act = (
  React as unknown as { act: (cb: () => void | Promise<void>) => Promise<void> }
).act;
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Controllable prefers-color-scheme media query. */
let osDark = true;
let mqListeners: Array<() => void> = [];
function installMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    get matches() {
      return osDark;
    },
    addEventListener: (_: string, cb: () => void) => mqListeners.push(cb),
    removeEventListener: (_: string, cb: () => void) => {
      mqListeners = mqListeners.filter((l) => l !== cb);
    },
  })) as unknown as typeof window.matchMedia;
}

function Probe({ id }: { id: string }) {
  const t = useTheme();
  return React.createElement("output", { id }, `${t.pref}|${t.resolved}`);
}

let container: HTMLDivElement;
let root: Root;
async function render(...els: React.ReactElement[]) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(React.Fragment, null, ...els));
  });
}
const text = (id: string) => container.querySelector(`#${id}`)!.textContent;
const isLight = () => document.documentElement.classList.contains("light");
const button = (label: string) =>
  container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

beforeEach(() => {
  osDark = true;
  mqListeners = [];
  installMatchMedia();
  localStorage.clear();
  document.documentElement.classList.remove("light");
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("useTheme", () => {
  it("reads a stored light pref and applies html.light", async () => {
    localStorage.setItem("theme", "light");
    await render(React.createElement(Probe, { id: "a" }));
    expect(text("a")).toBe("light|light");
    expect(isLight()).toBe(true);
  });

  it("treats a garbage stored value as system", async () => {
    localStorage.setItem("theme", "blue");
    osDark = false;
    await render(React.createElement(Probe, { id: "a" }));
    expect(text("a")).toBe("system|light");
  });

  it("follows OS changes live while on system", async () => {
    await render(React.createElement(Probe, { id: "a" }));
    expect(text("a")).toBe("system|dark");
    osDark = false;
    await act(async () => mqListeners.forEach((l) => l()));
    expect(text("a")).toBe("system|light");
    expect(isLight()).toBe(true);
  });

  it("falls back to system when localStorage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    await render(React.createElement(ThemeToggle), React.createElement(Probe, { id: "a" }));
    expect(text("a")).toBe("system|dark");
    await act(async () => button("Light").click());
    expect(text("a")).toBe("light|light"); // still switches for this session
  });

  it("syncs a second consumer in the same tab when the toggle is clicked", async () => {
    await render(React.createElement(ThemeToggle), React.createElement(Probe, { id: "a" }));
    await act(async () => button("Light").click());
    expect(localStorage.getItem("theme")).toBe("light");
    expect(text("a")).toBe("light|light");
    expect(isLight()).toBe(true);
    await act(async () => button("Dark").click());
    expect(text("a")).toBe("dark|dark");
    expect(isLight()).toBe(false);
  });

  it("syncs from another tab via the storage event", async () => {
    await render(React.createElement(Probe, { id: "a" }));
    await act(async () => {
      window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "light" }));
    });
    expect(text("a")).toBe("light|light");
  });
});

describe("ThemeToggle", () => {
  it("marks exactly the active option as pressed", async () => {
    localStorage.setItem("theme", "dark");
    await render(React.createElement(ThemeToggle));
    expect(button("Dark").getAttribute("aria-pressed")).toBe("true");
    expect(button("Light").getAttribute("aria-pressed")).toBe("false");
    expect(button("System").getAttribute("aria-pressed")).toBe("false");
  });

  it("hides labels in compact mode but keeps aria-labels", async () => {
    await render(React.createElement(ThemeToggle, { compact: true }));
    expect(button("System")).not.toBeNull();
    expect(container.textContent).toBe("");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run hooks/useTheme.dom.test.ts`
Expected: FAIL, "Failed to resolve import ./useTheme".

- [ ] **Step 3: Implement `hooks/useTheme.ts`**

```ts
import { useCallback, useEffect, useState } from "react";
import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  applyTheme,
  parsePref,
  resolveTheme,
  type ResolvedTheme,
  type ThemePref,
} from "../utils/theme";

const QUERY = "(prefers-color-scheme: dark)";

// Last pref chosen in this tab; only consulted when localStorage throws.
let sessionPref: ThemePref | null = null;

function readPref(): ThemePref {
  try {
    return parsePref(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return sessionPref ?? "system";
  }
}

function media(): MediaQueryList | null {
  try {
    return typeof window.matchMedia === "function" ? window.matchMedia(QUERY) : null;
  } catch {
    return null;
  }
}

export function useTheme(): {
  pref: ThemePref;
  resolved: ResolvedTheme;
  setPref: (p: ThemePref) => void;
  mounted: boolean;
} {
  // Server render and first client render agree on defaults; real values arrive after mount.
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefState(readPref());
    setMounted(true);
    const reread = () => setPrefState(readPref());
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) setPrefState(parsePref(e.newValue));
    };
    window.addEventListener(THEME_CHANGE_EVENT, reread);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, reread);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const mq = media();
    const sync = () => {
      const next = resolveTheme(pref, mq ? mq.matches : null);
      applyTheme(next, document.documentElement);
      setResolved(next);
    };
    sync();
    if (pref !== "system" || !mq) return;
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [pref, mounted]);

  const setPref = useCallback((next: ThemePref) => {
    sessionPref = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage blocked — the choice still applies for this session
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return { pref, resolved, setPref, mounted };
}
```

- [ ] **Step 4: Implement `components/common/ThemeToggle.tsx`**

```tsx
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../hooks/useTheme";
import type { ThemePref } from "../../utils/theme";

const OPTIONS: { value: ThemePref; label: string; Icon: typeof FiSun }[] = [
  { value: "light", label: "Light", Icon: FiSun },
  { value: "dark", label: "Dark", Icon: FiMoon },
  { value: "system", label: "System", Icon: FiMonitor },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { pref, setPref, mounted } = useTheme();
  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-line bg-panel-raised p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        // Nothing is pressed until mount, so the server markup never disagrees.
        const active = mounted && pref === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => setPref(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              active ? "bg-main-color text-white" : "text-fg-muted hover:bg-hover hover:text-fg"
            }`}
          >
            <Icon className="text-sm" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npx vitest run hooks/useTheme.dom.test.ts`
Expected: all 8 tests PASS.

- [ ] **Step 6: Build, full tests, commit**

Run: `npm run build && npm test`. Expected: both succeed.

```bash
git add hooks/useTheme.ts hooks/useTheme.dom.test.ts components/common/ThemeToggle.tsx
git commit -m "feat(theme): useTheme hook and Light/Dark/System toggle"
```

---

### Task 4: Class audit script

**Files:**
- Create: `scripts/theme-audit.mjs`
- Test: `scripts/theme-audit.test.ts`

**Interfaces:**
- Produces:
  - `auditSource(source: string): { line: number; cls: string }[]`
  - CLI `node scripts/theme-audit.mjs <file|dir>...`: prints `path:line  class`, exits 1 when anything is found and 0 when clean.

- [ ] **Step 1: Write the failing tests** `scripts/theme-audit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
// @ts-ignore — plain ESM script; allowJs may or may not type it, so ignore rather than expect-error
import { auditSource } from "./theme-audit.mjs";

const hits = (src: string) =>
  (auditSource(src) as { line: number; cls: string }[]).map((h) => h.cls);

describe("auditSource", () => {
  it("flags neutral classes from both dialects", () => {
    expect(
      hits(`<div className="bg-zinc-900 border-white/10 text-gray-700 hover:bg-white/5 md:bg-black">`),
    ).toEqual(["bg-zinc-900", "border-white/10", "text-gray-700", "hover:bg-white/5", "md:bg-black"]);
  });

  it("flags text-white on a neutral panel", () => {
    expect(hits(`<p className="bg-panel text-white">`)).toEqual(["text-white"]);
  });

  it("allows text-white on brand, status, or gradient backgrounds on the same line", () => {
    expect(hits(`<button className="bg-main-color text-white hover:text-white">`)).toEqual([]);
    expect(hits(`<span className="rounded bg-red-500 text-white">`)).toEqual([]);
    expect(hits(`<div className="gradient-gold text-white">`)).toEqual([]);
  });

  it("does not treat a status tint as a solid background", () => {
    expect(hits(`<span className="bg-green-500/10 text-white">`)).toEqual(["text-white"]);
  });

  it("honours the ignore marker", () => {
    expect(hits(`<div className="bg-white"> {/* theme-audit-ignore */}`)).toEqual([]);
  });

  it("ignores token classes and non-neutral colors", () => {
    expect(hits(`<div className="bg-panel text-fg-muted border-line text-red-400 bg-main-color">`)).toEqual([]);
  });

  it("reports 1-based line numbers", () => {
    expect(auditSource(`const a = 1;\n<div className="bg-black" />`)).toEqual([
      { line: 2, cls: "bg-black" },
    ]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run scripts/theme-audit.test.ts`
Expected: FAIL, cannot resolve `./theme-audit.mjs`.

- [ ] **Step 3: Implement `scripts/theme-audit.mjs`**

```js
#!/usr/bin/env node
// Flags hardcoded neutral Tailwind colors that should be theme tokens.
// Usage: node scripts/theme-audit.mjs <file|dir>...   (exit 1 when offenders exist)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const NEUTRAL =
  /(?<![\w-])((?:[\w-]+:)*(?:bg|text|border(?:-[trblxy])?|ring|divide|placeholder|outline|from|via|to|fill|stroke)-(?:black|white|zinc-\d+|gray-\d+|slate-\d+|neutral-\d+|stone-\d+)(?:\/\d+)?)(?![\w/-])/g;
// A solid brand/status/gradient background on the same line makes white text legitimate.
const SOLID_ACCENT_BG =
  /(?<![\w-])(?:[\w-]+:)*(?:bg-main-color|bg-icon-color|bg-(?:red|green|blue|amber|yellow|emerald|sky|rose|orange|purple|indigo|teal|cyan|violet|pink|lime|fuchsia)-\d+|bg-gradient-[\w-]+|gradient-[\w-]+|animate-gradient)(?![\w/-])/;
const WHITE_TEXT = /^(?:[\w-]+:)*(?:text-white|ring-black|border-white)$/;
const IGNORE = "theme-audit-ignore";

export function auditSource(source) {
  const out = [];
  source.split(/\r?\n/).forEach((text, i) => {
    if (text.includes(IGNORE)) return;
    const accent = SOLID_ACCENT_BG.test(text);
    for (const m of text.matchAll(NEUTRAL)) {
      const cls = m[1];
      if (accent && WHITE_TEXT.test(cls)) continue;
      out.push({ line: i + 1, cls });
    }
  });
  return out;
}

function files(path) {
  if (statSync(path).isDirectory()) {
    return readdirSync(path).flatMap((f) => files(join(path, f)));
  }
  return /\.(tsx|ts|jsx)$/.test(path) && !/\.test\.ts$/.test(path) ? [path] : [];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.error("usage: node scripts/theme-audit.mjs <file|dir>...");
    process.exit(2);
  }
  let total = 0;
  for (const f of targets.flatMap(files)) {
    for (const h of auditSource(readFileSync(f, "utf8"))) {
      console.log(`${f}:${h.line}  ${h.cls}`);
      total++;
    }
  }
  console.log(total ? `\n${total} hardcoded neutral color(s)` : "theme-audit: clean");
  process.exit(total ? 1 : 0);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run scripts/theme-audit.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Sanity-run the CLI**

Run: `node scripts/theme-audit.mjs components/navbars; echo "exit=$?"`
Expected: a list of offenders from `dashboardNavbar.tsx` and `exit=1`.

- [ ] **Step 6: Commit**

```bash
git add scripts/theme-audit.mjs scripts/theme-audit.test.ts
git commit -m "chore(theme): audit script for hardcoded neutral colors"
```

---

### Task 5: Theme-aware PrimeReact overlays, SweetAlert2, light scope

**Files:**
- Modify: `styles/globals.css`. Replace the whole `/* Dark Prime overlay panels … */` section (from that comment to the end of the file).
- Modify: rename `oxy-dark-overlay-panel` → `oxy-overlay-panel` in
  - `components/everflow-reports/AdjustLeadRatesTable.tsx`
  - `components/everflow-reports/BulkUpdateExchangeRate.tsx`
  - `components/everflow-reports/EditAdjustLeadRateDialog.tsx`

**Interfaces:**
- Consumes: the CSS vars from Task 2.
- Produces: the class `oxy-overlay-panel`, applied through PrimeReact `panelClassName` on Dropdown, MultiSelect and Calendar. Later batches add it to every Prime overlay they touch.

- [ ] **Step 1: Replace the overlay section** in `styles/globals.css` with:

```css
/* Prime overlay panels (dropdown / multiselect / datepicker) — follow the theme.
   Add panelClassName="oxy-overlay-panel" to every Prime overlay component. */
.oxy-overlay-panel.p-dropdown-panel,
.oxy-overlay-panel.p-multiselect-panel,
.oxy-overlay-panel.p-datepicker {
  background: rgb(var(--panel)) !important;
  color: rgb(var(--fg)) !important;
  border: 1px solid var(--line) !important;
}

.oxy-overlay-panel .p-dropdown-header,
.oxy-overlay-panel .p-multiselect-header {
  background: rgb(var(--panel)) !important;
  border-color: var(--line) !important;
  color: rgb(var(--fg)) !important;
}

.oxy-overlay-panel .p-dropdown-filter,
.oxy-overlay-panel .p-multiselect-filter,
.oxy-overlay-panel .p-inputtext {
  background: rgb(var(--surface)) !important;
  color: rgb(var(--fg)) !important;
  border: 1px solid var(--line) !important;
}

.oxy-overlay-panel .p-dropdown-filter::placeholder,
.oxy-overlay-panel .p-multiselect-filter::placeholder {
  color: rgb(var(--fg-subtle)) !important;
}

.oxy-overlay-panel .p-dropdown-items .p-dropdown-item,
.oxy-overlay-panel .p-multiselect-items .p-multiselect-item {
  color: rgb(var(--fg)) !important;
  background: transparent !important;
}

.oxy-overlay-panel .p-dropdown-item:not(.p-highlight):not(.p-disabled):hover,
.oxy-overlay-panel .p-dropdown-item.p-focus,
.oxy-overlay-panel .p-multiselect-item:not(.p-highlight):not(.p-disabled):hover,
.oxy-overlay-panel .p-multiselect-item.p-focus {
  background: var(--hover) !important;
  color: rgb(var(--fg)) !important;
}

.oxy-overlay-panel .p-dropdown-item.p-highlight,
.oxy-overlay-panel .p-multiselect-item.p-highlight {
  background: #00abe4 !important;
  color: #ffffff !important;
}

.oxy-overlay-panel .p-dropdown-empty-message,
.oxy-overlay-panel .p-multiselect-empty-message {
  color: rgb(var(--fg-muted)) !important;
}

.oxy-overlay-panel .p-datepicker-header,
.oxy-overlay-panel .p-datepicker-calendar td > span {
  background: transparent !important;
  color: rgb(var(--fg)) !important;
}

.oxy-overlay-panel .p-datepicker-calendar td > span.p-highlight {
  background: #00abe4 !important;
  color: #ffffff !important;
}

/* SweetAlert2 — follow the theme */
.swal2-popup {
  background: rgb(var(--panel)) !important;
  color: rgb(var(--fg)) !important;
  border: 1px solid var(--line);
}
.swal2-title,
.swal2-html-container {
  color: rgb(var(--fg)) !important;
}
.swal2-input,
.swal2-textarea,
.swal2-select {
  background: rgb(var(--panel-raised)) !important;
  color: rgb(var(--fg)) !important;
  border-color: var(--line-strong) !important;
}
.swal2-container.swal2-backdrop-show {
  background: var(--scrim) !important;
}
```

- [ ] **Step 2: Rename the class in the three files**

Run:
```bash
sed -i 's/oxy-dark-overlay-panel/oxy-overlay-panel/g' components/everflow-reports/AdjustLeadRatesTable.tsx components/everflow-reports/BulkUpdateExchangeRate.tsx components/everflow-reports/EditAdjustLeadRateDialog.tsx
grep -rn "oxy-dark-overlay-panel" pages components layouts styles; echo "left=$?"
```
Expected: no matches, and `left=1`.

- [ ] **Step 3: Build, tests, commit**

Run: `npm run build && npm test`. Expected: both succeed.

```bash
git add styles/globals.css components/everflow-reports/AdjustLeadRatesTable.tsx components/everflow-reports/BulkUpdateExchangeRate.tsx components/everflow-reports/EditAdjustLeadRateDialog.tsx
git commit -m "feat(theme): theme-aware Prime overlays and SweetAlert2"
```

---

### Task 6: Batch 0 — app shell migration + toggle placement → CHECKPOINT 0

**Files (migrate every one per the Migration Rules):**
- `components/navbars/dashboardNavbar.tsx`, `components/navbars/impersonateNavBar.tsx`
- `components/sidebars/sidebarDashboard.tsx`, `components/sidebars/SidbarList.tsx`
- `layouts/dashboardLayout.tsx`, `layouts/PopupLayout.tsx`
- `components/common/AiDesign.tsx`, `Chat.tsx`, `Ping.tsx`, `TextEditor.tsx` (wrapper classes only; TinyMCE internals stay as they are)
- `components/loadings/fullLoading.tsx`, `components/loadings/spinLoading.tsx`
- `components/animations/numberRunning.tsx`
- `components/Annoucement/AnnoucementShow.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` (Task 3), token classes (Task 2), `oxy-overlay-panel` (Task 5), and the audit CLI (Task 4).

- [ ] **Step 1: Place the toggle in the navbar dropdown.** In `components/navbars/dashboardNavbar.tsx`, add `import ThemeToggle from "../common/ThemeToggle";` and insert this block after the timezone `</label>` and before the `<div className="my-0.5 h-px w-full bg-white/10" />` divider (around line 150):

```tsx
              <div className="flex w-full flex-col gap-1.5 px-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
                  Theme
                </span>
                <ThemeToggle />
              </div>
```

- [ ] **Step 2: Migrate every file in the list.** Follow the per-file procedure. The navbar logo pill (`bg-white` around the logo, line ~62) stays white; add `{/* theme-audit-ignore */}` on that line. `bg-slate-300` avatar placeholder → `bg-panel-raised`.

- [ ] **Step 3: Audit the batch**

Run: `node scripts/theme-audit.mjs components/navbars components/sidebars layouts components/common components/loadings components/animations components/Annoucement/AnnoucementShow.tsx`
Expected: `theme-audit: clean`, exit 0.

- [ ] **Step 4: Build + tests**

Run: `npm run build && npm test`. Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add -A components/navbars components/sidebars layouts components/common components/loadings components/animations components/Annoucement/AnnoucementShow.tsx
git commit -m "feat(theme): batch 0 — app shell on theme tokens with navbar toggle"
```

- [ ] **Step 6: CHECKPOINT 0. STOP and ask the user.** Start `npm run dev`, then send the user this checklist:

> Please smoke test on http://localhost:8080 and paste screenshots. For each item, capture **Light** and **Dark** (switch with the navbar avatar menu → Theme):
> 1. `/landingPages`: the navbar only (page content isn't migrated yet and will stay dark in Light; that's expected).
> 2. The navbar avatar menu open, showing wallet, timezone and theme toggle.
> 3. The sidebar open (hamburger).
> 4. Any page with the announcement banner, if one is active.
> 5. Choose **System**, flip your OS appearance, and confirm the navbar follows without a reload.
> 6. Reload with Light selected: confirm there's no dark flash before the page appears.
> 7. Dark regression: the navbar and sidebar should look like today.

Wait for the screenshots. Fix any issues, amend with a new commit, and re-ask for the affected screenshots. Proceed to Task 7 only after the user confirms.

---

### Task 7: Batch 1 — Landers and domains → CHECKPOINT 1

**Files:**
- Pages: `pages/index.tsx`, `pages/landingPages/index.tsx`, `pages/landingpage/[landingPageId].tsx`, `pages/create-landingpage/index.tsx`, `pages/domain/index.tsx`, `pages/domain/[domainId].tsx`, `pages/link-audit/index.tsx`
- Components: all `.tsx` under `components/category`, `components/landingPages`, `components/domain` (including `components/domain/gsc/*`), `components/link-audit`, plus `components/forms/domains/domainCreate.tsx`

**Interfaces:**
- Consumes: `useTheme` (Task 3), `chartColors` (Task 1).

- [ ] **Step 1: Migrate every file** per the Migration Rules. Add `panelClassName="oxy-overlay-panel"` to every PrimeReact `Dropdown`, `MultiSelect` and `Calendar` in these files that lacks it.

- [ ] **Step 2: Theme the GSC chart.** In `components/domain/gsc/gscPerformanceTab.tsx`:
  - Add imports: `import { useTheme } from "../../../hooks/useTheme";` and `import { chartColors } from "../../../utils/theme";`.
  - In the component that renders `<Line …>` (the one with `dateRows`), at the top of its body: `const { resolved } = useTheme(); const cc = chartColors(resolved);`.
  - Add `key={resolved}` to `<Line` so Chart.js redraws on toggle.
  - Replace its `options` prop (around line 210) with:

```tsx
          options={{
            responsive: true,
            interaction: { mode: "index", intersect: false },
            color: cc.text,
            plugins: { legend: { labels: { color: cc.text } } },
            scales: {
              x: { ticks: { color: cc.text }, grid: { color: cc.grid } },
              y: {
                type: "linear",
                position: "left",
                ticks: { color: cc.text },
                grid: { color: cc.grid },
              },
              y1: {
                type: "linear",
                position: "right",
                ticks: { color: cc.text },
                grid: { drawOnChartArea: false, color: cc.grid },
              },
            },
          }}
```

  The dataset colors (`#2563eb` blue, `#9333ea` purple) stay as they are.

- [ ] **Step 3: Audit**

Run: `node scripts/theme-audit.mjs pages/index.tsx pages/landingPages pages/landingpage pages/create-landingpage pages/domain pages/link-audit components/category components/landingPages components/domain components/link-audit components/forms/domains`
Expected: `theme-audit: clean`.

- [ ] **Step 4: Build + tests.** Run `npm run build && npm test`. Existing domain tests such as `speedByRegionSection.dom.test.ts` must still pass. If a test asserted an old class name, update the assertion to the token class.

- [ ] **Step 5: Commit**

```bash
git add -A pages/index.tsx pages/landingPages pages/landingpage pages/create-landingpage pages/domain pages/link-audit components/category components/landingPages components/domain components/link-audit components/forms/domains
git commit -m "feat(theme): batch 1 — landers and domains on theme tokens"
```

- [ ] **Step 6: CHECKPOINT 1. STOP and ask the user.** Checklist (each in Light + Dark):

> 1. `/` (home/categories)
> 2. `/landingPages`: the list, plus one row's action menu open
> 3. `/landingpage/<any id>`: the settings/detail page, including a Prime dropdown open
> 4. `/create-landingpage`
> 5. `/domain`: the list, plus the "create domain" modal open
> 6. `/domain/<any id>`: every tab, especially the GSC performance chart (axis text and grid readable) and the speed-by-region section
> 7. `/link-audit`
> 8. One SweetAlert confirm, e.g. a delete prompt (cancel it)

Wait for the screenshots, fix, and re-ask as needed. Proceed only after the user confirms.

---

### Task 8: Batch 2 — Analytics and admin → CHECKPOINT 2

**Files:**
- Pages: `pages/analytics/index.tsx`, `pages/customer/index.tsx`, `pages/manage-account/index.tsx`
- Components: all `.tsx` under `components/analytics`, `components/Annoucement` (except `AnnoucementShow.tsx`, done in Task 6), `components/everflow-reports`, `components/forms/accounts`, `components/forms/partners`

- [ ] **Step 1: Migrate every file** per the Migration Rules, adding `panelClassName="oxy-overlay-panel"` to Prime overlays. `everflow-reports` has many status-colored cells (profit/loss, rate deltas). Keep the status hues, but check that tints like `text-green-400` / `text-red-400` are readable on white. If not, use the `-600` shade, which reads on both.

- [ ] **Step 2: Audit**

Run: `node scripts/theme-audit.mjs pages/analytics pages/customer pages/manage-account components/analytics components/Annoucement components/everflow-reports components/forms/accounts components/forms/partners`
Expected: `theme-audit: clean`.

- [ ] **Step 3: Build + tests.** Run `npm run build && npm test`. The everflow and analytics unit tests must still pass.

- [ ] **Step 4: Commit**

```bash
git add -A pages/analytics pages/customer pages/manage-account components/analytics components/Annoucement components/everflow-reports components/forms/accounts components/forms/partners
git commit -m "feat(theme): batch 2 — analytics, reports and admin forms on theme tokens"
```

- [ ] **Step 5: CHECKPOINT 2. STOP and ask the user.** Checklist (Light + Dark):

> 1. `/analytics`: the compare table and the lander detail panel open
> 2. `/customer`
> 3. `/manage-account`: the accounts table, plus the create, edit, assign-partner and bonus-rate dialogs open
> 4. Partners table, plus the assign-domain / assign-phone-number / permissions dialogs
> 5. Announcements table + create form
> 6. Partner report / everflow reports (wherever they render for your role): the AI analysis panel, adjust-lead-rates table with the edit dialog open and a date picker open, and bulk exchange rate
> 7. Profit/loss and status colors readable in Light

Wait for the screenshots, fix, and re-ask as needed. Proceed only after the user confirms.

---

### Task 9: Batch 3 — Account and billing → CHECKPOINT 3

**Files:**
- Pages: `pages/account-setting.tsx`, `pages/account-history.tsx`, `pages/account-billing.tsx`, `pages/account/devices.tsx`, `pages/payslip/[recordDate]/index.tsx`, `pages/inbox/index.tsx`
- Components: all `.tsx` under `components/billing`, `components/payslip`, `components/inbox`, `components/forms/payslips`, plus `components/forms/createDeviceUser.tsx`

- [ ] **Step 1: Migrate every file** per the Migration Rules.

- [ ] **Step 2: Keep payslips paper-light.** In `pages/payslip/[recordDate]/index.tsx` and `components/payslip/payslipGenerator.tsx`, add `theme-light-scope` to the outermost element of the printable payslip document. It then renders light in both themes on screen and in print. Still migrate its classes to tokens: inside the scope they resolve to light values.

- [ ] **Step 3: Audit**

Run: `node scripts/theme-audit.mjs pages/account-setting.tsx pages/account-history.tsx pages/account-billing.tsx pages/account pages/payslip pages/inbox components/billing components/payslip components/inbox components/forms/payslips components/forms/createDeviceUser.tsx`
Expected: `theme-audit: clean`.

- [ ] **Step 4: Build + tests.** Run `npm run build && npm test`.

- [ ] **Step 5: Commit**

```bash
git add -A pages/account-setting.tsx pages/account-history.tsx pages/account-billing.tsx pages/account pages/payslip pages/inbox components/billing components/payslip components/inbox components/forms/payslips components/forms/createDeviceUser.tsx
git commit -m "feat(theme): batch 3 — account, billing, payslip and inbox on theme tokens"
```

- [ ] **Step 6: CHECKPOINT 3. STOP and ask the user.** Checklist (Light + Dark):

> 1. `/account-setting`
> 2. `/account-history`
> 3. `/account-billing`: including the top-up/payment flow up to (not through) payment
> 4. `/account/devices`: plus the create-device-user form
> 5. `/payslip/<recordDate>`: the payslip should be white in BOTH themes; also a print preview (Ctrl+P)
> 6. `/inbox`: the message list and one email open
> 7. The payslip create/duplicate/update forms (wherever they render for your role)

Wait for the screenshots, fix, and re-ask as needed. Proceed only after the user confirms.

---

### Task 10: Batch 4 — Auth → CHECKPOINT 4

**Files:**
- Pages: `pages/auth/sign-in.tsx`, `sign-up.tsx`, `pending.tsx`, `setup-totp.tsx`, `new-password.tsx`
- Components: `components/auth/totp-require.tsx` and the other `.tsx` in `components/auth`

- [ ] **Step 1: Add a corner toggle** to each auth page except `setup-totp.tsx` (it renders inside `DashboardLayout`, which already has the navbar toggle). Add `import ThemeToggle from "../../components/common/ThemeToggle";` and place this as the first child of the page's root element:

```tsx
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle compact />
      </div>
```

- [ ] **Step 2: Migrate every file** per the Migration Rules. The Turnstile widget stays as is (third-party).

- [ ] **Step 3: Audit**

Run: `node scripts/theme-audit.mjs pages/auth components/auth`
Expected: `theme-audit: clean`.

- [ ] **Step 4: Build + tests.** Run `npm run build && npm test`. `components/auth/sign-up.dom.test.ts` must still pass. It now also renders `ThemeToggle`; jsdom has no `matchMedia`, and `useTheme` handles that (`media()` returns null), so no mock is needed. If a query in that test now matches a toggle button by accident, narrow the query rather than removing the toggle.

- [ ] **Step 5: Commit**

```bash
git add -A pages/auth components/auth
git commit -m "feat(theme): batch 4 — auth pages on theme tokens with corner toggle"
```

- [ ] **Step 6: CHECKPOINT 4. STOP and ask the user.** Checklist (Light + Dark, signed out, e.g. in a private window):

> 1. `/auth/sign-in`: including an error state (wrong password)
> 2. `/auth/sign-up`: step 1 and the email-code step
> 3. `/auth/pending`
> 4. `/auth/new-password`
> 5. `/auth/setup-totp` (signed in)
> 6. Toggle on sign-in → sign in → the dashboard keeps the chosen theme

Wait for the screenshots, fix, and re-ask as needed. Proceed only after the user confirms.

---

### Task 11: Batch 5a — Tools: SMS providers → CHECKPOINT 5a

**Files:** all `.tsx` under `components/sms-berry`, `sms-bower`, `sms-bulk`, `sms-daisy`, `sms-getatext`, `sms-online`, `sms-pinverify`, `sms-pool`, `sms-pva`, `sms-report`, `sms-textverified`, `sms-virtualsms` (63 files).

- [ ] **Step 1: Migrate every file** per the Migration Rules, adding `panelClassName="oxy-overlay-panel"` to Prime overlays. The provider files share near-identical structure (`SelectService`, `ActiveNumber`, `History`, `Account`). Migrate one provider fully first, then apply the same mapping to its siblings, checking each role in context.

- [ ] **Step 2: Theme the SMS report chart.** In `components/sms-report/SmsReport.tsx`:
  - Add imports: `import { useTheme } from "../../hooks/useTheme";` and `import { chartColors } from "../../utils/theme";`.
  - In the component body: `const { resolved } = useTheme();`.
  - In the `options` `useMemo` (line ~174), make the first statement inside the factory `const cc = chartColors(resolved);`. The factory then becomes a block body `() => { const cc = …; return ({ …options… }); }`. Then:
    - Add `color: cc.text` at the top level.
    - Change `legend` to `{ position: "top" as const, labels: { color: cc.text } }`.
    - Add `color: cc.text` to `title`.
    - Replace `scales` with:

```ts
      scales: {
        x: { ticks: { color: cc.text }, grid: { color: cc.grid } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: cc.text },
          grid: { color: cc.grid },
        },
      },
```

  Change the memo's dependency list to `[bucketDetails, resolved]`. Add `key={resolved}` to `<Line …>`.

- [ ] **Step 3: Audit**

Run: `node scripts/theme-audit.mjs components/sms-berry components/sms-bower components/sms-bulk components/sms-daisy components/sms-getatext components/sms-online components/sms-pinverify components/sms-pool components/sms-pva components/sms-report components/sms-textverified components/sms-virtualsms`
Expected: `theme-audit: clean`.

- [ ] **Step 4: Build + tests.** Run `npm run build && npm test`.

- [ ] **Step 5: Commit**

```bash
git add -A components/sms-berry components/sms-bower components/sms-bulk components/sms-daisy components/sms-getatext components/sms-online components/sms-pinverify components/sms-pool components/sms-pva components/sms-report components/sms-textverified components/sms-virtualsms
git commit -m "feat(theme): batch 5a — SMS provider tools on theme tokens"
```

- [ ] **Step 6: CHECKPOINT 5a. STOP and ask the user.** Checklist (Light + Dark), on `/tools`:

> 1. Oxy Bulk (sms-bulk): the SMS tab and Email tab, the service picker dropdown open, an active email, and email history
> 2. SMS Pool, Daisy, PVA, Pinverify: the service select, an active number, and history
> 3. VirtualSMS, TextVerified, GetAText (including the delay / no-SMS reports), Berry, Bower, SMS Online: one screen each
> 4. SMS report chart: legend, axes and grid readable
> 5. An account/settings form for any provider

Wait for the screenshots, fix, and re-ask as needed. Proceed only after the user confirms.

---

### Task 12: Batch 5b — Tools: remaining sections → CHECKPOINT 5b

**Files:**
- Page: `pages/tools/index.tsx`
- Components: all `.tsx` under `components/cloud-phone`, `components/simCard`, `components/partner-league`, `components/IntimateInfoContents`, `components/postcode`, plus `components/forms/createTagsOnSimcard.tsx`

- [ ] **Step 1: Migrate every file** per the Migration Rules. `cloud-phone` already contains `dark:` variants (`CloudPhoneCard`, `CreateUpdateProxyModal`, `ManageProxiesModal`) and `components/loadings/spinLoading.tsx` did too (done in Task 6). Remove the `dark:` classes when the base class becomes a token, since tokens already cover both themes. `partner-league` gradients (`gradient-gold` / `silver` / `bronze`) stay.

- [ ] **Step 2: Audit**

Run: `node scripts/theme-audit.mjs pages/tools components/cloud-phone components/simCard components/partner-league components/IntimateInfoContents components/postcode components/forms/createTagsOnSimcard.tsx`
Expected: `theme-audit: clean`.

- [ ] **Step 3: Build + tests.** Run `npm run build && npm test`.

- [ ] **Step 4: Commit**

```bash
git add -A pages/tools components/cloud-phone components/simCard components/partner-league components/IntimateInfoContents components/postcode components/forms/createTagsOnSimcard.tsx
git commit -m "feat(theme): batch 5b — tools page, cloud phone, sim cards, league on theme tokens"
```

- [ ] **Step 5: CHECKPOINT 5b. STOP and ask the user.** Checklist (Light + Dark):

> 1. `/tools`: the tab/section switcher
> 2. Cloud phone: the card list, the update modal, the manage-proxies and change-proxy modals
> 3. SIM cards: the list, the report box, a message view, the Excel import, and the tags form
> 4. Partner league: the leaderboard with gold/silver/bronze
> 5. Intimate info contents: the list + editor
> 6. Any postcode/country input

Wait for the screenshots, fix, and re-ask as needed. Proceed only after the user confirms.

---

### Task 13: Global body colors + whole-app audit → FINAL CHECKPOINT

**Files:**
- Modify: `styles/globals.css` (token section from Task 2)
- Modify: any file the full audit still flags

- [ ] **Step 1: Set the body colors.** In `styles/globals.css`, inside the `@layer base { … }` token block, after `html.light, .theme-light-scope { … }`, add:

```css
  body {
    @apply bg-surface text-fg;
  }
```

- [ ] **Step 2: Whole-app audit**

Run: `node scripts/theme-audit.mjs pages components layouts`
Expected: `theme-audit: clean`. Any file that shows up was missed by the batch lists (e.g. a new folder); migrate it per the Migration Rules and re-run.

- [ ] **Step 3: Check the leftovers**

Run: `grep -rn "dark:" pages components layouts; grep -rn "theme-audit-ignore" pages components layouts`
Expected: no `dark:` classes remain. Each `theme-audit-ignore` line has a clear reason, e.g. the logo pill. Remove any that aren't justified.

- [ ] **Step 4: Build + tests**

Run: `npm run build && npm test`. Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add -A styles/globals.css pages components layouts
git commit -m "feat(theme): themed body colors; whole dashboard passes theme audit"
```

- [ ] **Step 6: FINAL CHECKPOINT. STOP and ask the user.**

> Final pass, Light + Dark:
> 1. Click through every sidebar entry and screenshot anything that looks off.
> 2. Pages previously checked still look right. Spot-check `/landingPages`, `/analytics`, `/tools`, `/auth/sign-in`.
> 3. Short page content with no dark/light gaps at the bottom (body background).
> 4. Open the GrapesJS editor from a lander: the editor itself is unchanged (out of scope), and the dashboard around it is fine.

After the user confirms, hand off to superpowers:finishing-a-development-branch. Do not push or open a PR without the user's say-so.
