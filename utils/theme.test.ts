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
