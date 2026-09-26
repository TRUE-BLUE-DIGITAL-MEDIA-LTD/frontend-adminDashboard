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

/**
 * Node >= 25 ships a global `localStorage` that is an empty object without
 * --localstorage-file, and it shadows jsdom's. Install a real in-memory one.
 */
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  clear() {
    this.map.clear();
  }
}
function installStorage() {
  Object.defineProperty(window, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}

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
  installStorage();
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
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
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
