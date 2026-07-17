import type { LanderAnalyticsRow } from "../../models";

export type SortKey =
  | "views"
  | "clicks"
  | "ctr"
  | "bounceRate"
  | "avgTimeOnPageMs"
  | "avgMaxScrollPct";

export function formatDurationMs(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function formatPct(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return "—";
  const pct = v * 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)}%`;
}

export function formatReturningPct(
  returningViews: number,
  identifiedViews: number,
): string {
  if (identifiedViews <= 0) return "—";
  return formatPct(returningViews / identifiedViews);
}

export function sortRows(
  rows: LanderAnalyticsRow[],
  key: SortKey,
  dir: "asc" | "desc",
): LanderAnalyticsRow[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === null && bv === null) return 0;
    if (av === null) return 1; // nulls last regardless of direction
    if (bv === null) return -1;
    return (av - bv) * sign;
  });
}
