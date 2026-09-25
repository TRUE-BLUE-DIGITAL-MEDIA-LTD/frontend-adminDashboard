import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildMuiTheme } from "./muiTheme";
import { THEME_HEX } from "./theme";

const css = readFileSync(join(__dirname, "../styles/globals.css"), "utf8");

function hexToChannels(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** First innermost block whose selector matches — the screen (non-print) one. */
function block(match: (sel: string) => boolean): string {
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (match(m[1].trim())) return m[2];
  }
  throw new Error("block not found");
}

describe("THEME_HEX mirrors the CSS tokens", () => {
  const blocks = {
    dark: block((s) => s === ":root"),
    light: block((s) => s.includes("html.light")),
  };
  for (const mode of ["dark", "light"] as const) {
    it(`${mode} channel tokens match`, () => {
      for (const [token, hex] of Object.entries(THEME_HEX[mode])) {
        expect(blocks[mode], `--${token}`).toContain(`--${token}: ${hexToChannels(hex)};`);
      }
    });
  }
});

describe("buildMuiTheme", () => {
  it("uses a light MUI palette with light token colors", () => {
    const t = buildMuiTheme("light");
    expect(t.palette.mode).toBe("light");
    expect(t.palette.background.paper).toBe(THEME_HEX.light.panel);
    expect(t.palette.background.default).toBe(THEME_HEX.light.surface);
    expect(t.palette.text.primary).toBe(THEME_HEX.light.fg);
    expect(t.palette.text.secondary).toBe(THEME_HEX.light["fg-muted"]);
  });

  it("uses a dark MUI palette with dark token colors", () => {
    const t = buildMuiTheme("dark");
    expect(t.palette.mode).toBe("dark");
    expect(t.palette.background.paper).toBe(THEME_HEX.dark.panel);
    expect(t.palette.text.primary).toBe(THEME_HEX.dark.fg);
  });

  it("keeps the brand blue as primary in both themes", () => {
    expect(buildMuiTheme("light").palette.primary.main).toBe("#00ABE4");
    expect(buildMuiTheme("dark").palette.primary.main).toBe("#00ABE4");
  });
});
