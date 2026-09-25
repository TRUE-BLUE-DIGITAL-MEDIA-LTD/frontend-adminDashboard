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
