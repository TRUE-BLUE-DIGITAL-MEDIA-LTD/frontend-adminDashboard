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
