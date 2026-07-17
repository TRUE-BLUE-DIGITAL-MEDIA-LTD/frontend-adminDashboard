import { describe, expect, it } from "vitest";
import { rangeForCustom, rangeForPreset } from "./date-range";

// Local-time reference: 2026-07-17 15:30 local.
const NOW = new Date(2026, 6, 17, 15, 30, 0);

describe("rangeForPreset", () => {
  it("today spans local midnight to now", () => {
    const r = rangeForPreset("today", NOW);
    expect(r.from).toBe(new Date(2026, 6, 17).toISOString());
    expect(r.to).toBe(NOW.toISOString());
  });

  it("yesterday spans the full previous local day", () => {
    const r = rangeForPreset("yesterday", NOW);
    expect(r.from).toBe(new Date(2026, 6, 16).toISOString());
    expect(r.to).toBe(new Date(new Date(2026, 6, 17).getTime() - 1).toISOString());
  });

  it("7d/30d/90d are rolling windows ending now", () => {
    const DAY = 24 * 60 * 60 * 1000;
    expect(rangeForPreset("7d", NOW).from).toBe(new Date(NOW.getTime() - 7 * DAY).toISOString());
    expect(rangeForPreset("30d", NOW).from).toBe(new Date(NOW.getTime() - 30 * DAY).toISOString());
    expect(rangeForPreset("90d", NOW).from).toBe(new Date(NOW.getTime() - 90 * DAY).toISOString());
    expect(rangeForPreset("7d", NOW).to).toBe(NOW.toISOString());
  });
});

describe("rangeForCustom", () => {
  it("covers the inclusive local-day span", () => {
    const r = rangeForCustom("2026-07-01", "2026-07-03");
    expect(r?.from).toBe(new Date(2026, 6, 1).toISOString());
    expect(r?.to).toBe(new Date(new Date(2026, 6, 4).getTime() - 1).toISOString());
  });

  it("allows a single-day range", () => {
    const r = rangeForCustom("2026-07-01", "2026-07-01");
    expect(r?.from).toBe(new Date(2026, 6, 1).toISOString());
    expect(r?.to).toBe(new Date(new Date(2026, 6, 2).getTime() - 1).toISOString());
  });

  it("rejects reversed or malformed input", () => {
    expect(rangeForCustom("2026-07-03", "2026-07-01")).toBeNull();
    expect(rangeForCustom("garbage", "2026-07-01")).toBeNull();
    expect(rangeForCustom("", "")).toBeNull();
  });
});
