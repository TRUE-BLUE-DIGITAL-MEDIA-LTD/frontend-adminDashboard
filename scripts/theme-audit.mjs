#!/usr/bin/env node
// Flags hardcoded neutral Tailwind colors that should be theme tokens.
// Usage: node scripts/theme-audit.mjs <file|dir>...   (exit 1 when offenders exist)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const NEUTRAL =
  /(?<![\w-])((?:[\w-]+:)*(?:bg|text|border(?:-[trblxy])?|ring|divide|placeholder|outline|fill|stroke)-(?:black|white|zinc-\d+|gray-\d+|slate-\d+|neutral-\d+|stone-\d+)(?:\/\d+)?)(?![\w/-])/g;
// Pale status fills (bg-green-100 etc.) read as white blobs in Dark; use bg-<hue>-500/10–20.
const PALE =
  /(?<![\w-])((?:[\w-]+:)*bg-(?:red|green|blue|amber|yellow|emerald|sky|rose|orange|purple|indigo|teal|cyan|violet|pink|lime|fuchsia)-(?:50|100|200))(?![\w/-])/g;
// A solid brand/status/gradient background on the same line makes white text legitimate.
const SOLID_ACCENT_BG =
  /(?<![\w-])(?:[\w-]+:)*(?:bg-main-color|bg-icon-color|bg-(?:red|green|blue|amber|yellow|emerald|sky|rose|orange|purple|indigo|teal|cyan|violet|pink|lime|fuchsia)-\d+|bg-gradient-[\w-]+|gradient-[\w-]+|animate-gradient)(?![\w/-])/;
const WHITE_TEXT = /^(?:[\w-]+:)*(?:text-white|text-black|ring-black|border-white)$/;
// Hardcoded color-scheme and arbitrary-value neutrals bypass the tokens too.
const HARD =
  /(?<![\w-])((?:[\w-]+:)*(?:\[color-scheme:(?:dark|light)\]|(?:bg|text|border)-\[#(?:fff|ffffff|000|000000)\]))(?![\w/-])/gi;
// Prime overlays render outside the component tree; without this class the list stays bootstrap-white.
const PRIME_OVERLAY = { dropdown: "Dropdown", multiselect: "MultiSelect", calendar: "Calendar", autocomplete: "AutoComplete" };
const IGNORE = "theme-audit-ignore";

function auditPrimeOverlays(source, lines) {
  const names = [...source.matchAll(/from\s+"primereact\/(dropdown|multiselect|calendar|autocomplete)"/g)].map(
    (m) => PRIME_OVERLAY[m[1]],
  );
  const out = [];
  if (!names.length) return out;
  for (const m of source.matchAll(new RegExp(`<(${names.join("|")})(?=[\\s/>])`, "g"))) {
    let depth = 0;
    let j = m.index + m[0].length;
    for (; j < source.length; j++) {
      const c = source[j];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    const line = source.slice(0, m.index).split(/\r?\n/).length;
    if (/panelClassName/.test(source.slice(m.index, j)) || lines[line - 1].includes(IGNORE)) continue;
    out.push({ line, cls: `${m[1]} without panelClassName` });
  }
  return out;
}

export function auditSource(source) {
  const out = [];
  const lines = source.split(/\r?\n/);
  lines.forEach((text, i) => {
    if (text.includes(IGNORE)) return;
    // multi-line classNames: the accent background may sit up to two lines above
    const accent = lines.slice(Math.max(0, i - 2), i + 1).some((l) => SOLID_ACCENT_BG.test(l));
    const found = [];
    for (const m of text.matchAll(NEUTRAL)) {
      if (accent && WHITE_TEXT.test(m[1])) continue;
      found.push(m);
    }
    for (const m of text.matchAll(PALE)) found.push(m);
    for (const m of text.matchAll(HARD)) found.push(m);
    found
      .sort((a, b) => a.index - b.index)
      .forEach((m) => out.push({ line: i + 1, cls: m[1] }));
  });
  return [...out, ...auditPrimeOverlays(source, lines)].sort((a, b) => a.line - b.line);
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
