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

  it("makes bare `border` / `divide-*` use the theme line color", () => {
    const extend = tailwindConfig.theme!.extend as Record<string, Record<string, string>>;
    expect(extend.borderColor?.DEFAULT).toBe("var(--line)");
  });
});
