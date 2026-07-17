import { describe, expect, it } from "vitest";
import { formatDurationMs, formatPct, formatReturningPct, sortRows } from "./format";
import type { LanderAnalyticsRow } from "../../models";

function row(over: Partial<LanderAnalyticsRow>): LanderAnalyticsRow {
  return {
    landingPageId: "x", landingPageName: null, domainName: null,
    domainId: null, percent: null,
    views: 0, clicks: 0, returningViews: 0, identifiedViews: 0, ctr: 0, bounceRate: 0,
    avgTimeOnPageMs: null, avgMaxScrollPct: null,
    ...over,
  };
}

describe("formatDurationMs", () => {
  it("formats null, seconds, and minutes", () => {
    expect(formatDurationMs(null)).toBe("—");
    expect(formatDurationMs(9500)).toBe("10s");
    expect(formatDurationMs(65000)).toBe("1m 05s");
  });
});

describe("formatPct", () => {
  it("formats fractions as percent", () => {
    expect(formatPct(null)).toBe("—");
    expect(formatPct(0.756)).toBe("75.6%");
    expect(formatPct(1)).toBe("100%");
  });
});

describe("formatReturningPct", () => {
  it("formats returning share over identified views", () => {
    expect(formatReturningPct(25, 100)).toBe("25%");
  });
  it("returns a dash when no visitor data exists", () => {
    expect(formatReturningPct(0, 0)).toBe("—");
  });
});

describe("sortRows", () => {
  it("sorts by key and direction, nulls last", () => {
    const rows = [
      row({ landingPageId: "a", views: 10, avgTimeOnPageMs: null }),
      row({ landingPageId: "b", views: 30, avgTimeOnPageMs: 5 }),
      row({ landingPageId: "c", views: 20, avgTimeOnPageMs: 9 }),
    ];
    expect(sortRows(rows, "views", "desc").map((r) => r.landingPageId)).toEqual(["b", "c", "a"]);
    expect(sortRows(rows, "avgTimeOnPageMs", "asc").map((r) => r.landingPageId)).toEqual(["b", "c", "a"]);
  });
});
