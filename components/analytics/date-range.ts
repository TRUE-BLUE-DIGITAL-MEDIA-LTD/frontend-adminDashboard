export type RangePreset = "today" | "yesterday" | "7d" | "30d" | "90d";

export interface DateRange {
  from: string; // ISO
  to: string; // ISO
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Local-timezone start of day, offset by whole days (DST-safe via Date fields).
function dayStart(d: Date, offsetDays = 0): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offsetDays);
}

export function rangeForPreset(
  preset: RangePreset,
  now: Date = new Date(),
): DateRange {
  switch (preset) {
    case "today":
      return { from: dayStart(now).toISOString(), to: now.toISOString() };
    case "yesterday":
      return {
        from: dayStart(now, -1).toISOString(),
        to: new Date(dayStart(now).getTime() - 1).toISOString(),
      };
    case "7d":
      return { from: new Date(now.getTime() - 7 * DAY_MS).toISOString(), to: now.toISOString() };
    case "30d":
      return { from: new Date(now.getTime() - 30 * DAY_MS).toISOString(), to: now.toISOString() };
    case "90d":
      return { from: new Date(now.getTime() - 90 * DAY_MS).toISOString(), to: now.toISOString() };
  }
}

// fromDay/toDay are local YYYY-MM-DD, inclusive on both ends.
export function rangeForCustom(fromDay: string, toDay: string): DateRange | null {
  const parse = (s: string): Date | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const from = parse(fromDay);
  const toStart = parse(toDay);
  if (!from || !toStart || from.getTime() > toStart.getTime()) return null;
  const to = new Date(dayStart(toStart, 1).getTime() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}
