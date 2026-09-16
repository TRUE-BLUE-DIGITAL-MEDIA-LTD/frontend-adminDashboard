import { describe, expect, it } from "vitest";
import { formatSeconds, loadColorClass, probeAge, regionGroup } from "./speedFormat";

describe("formatSeconds", () => {
  it("renders ms as seconds with one decimal, or a dash", () => {
    expect(formatSeconds(2210)).toBe("2.2 s");
    expect(formatSeconds(0)).toBe("0.0 s");
    expect(formatSeconds(null)).toBe("—");
  });
});

describe("loadColorClass", () => {
  it("applies the 2.5 s / 5 s thresholds", () => {
    expect(loadColorClass(2499)).toContain("green");
    expect(loadColorClass(2500)).toContain("orange");
    expect(loadColorClass(4999)).toContain("orange");
    expect(loadColorClass(5000)).toContain("red");
    expect(loadColorClass(null)).toContain("gray");
  });
});

describe("regionGroup", () => {
  it("groups by Cloud Run region prefix", () => {
    expect(regionGroup("us-east1")).toBe("United States");
    expect(regionGroup("europe-west2")).toBe("Europe");
    expect(regionGroup("asia-southeast1")).toBe("Other");
  });
});

describe("probeAge", () => {
  const now = new Date("2026-09-16T12:00:00Z");
  it("humanises minutes, hours and days", () => {
    expect(probeAge("2026-09-16T11:58:30Z", now)).toBe("1 min ago");
    expect(probeAge("2026-09-16T09:00:00Z", now)).toBe("3 h ago");
    expect(probeAge("2026-09-14T12:00:00Z", now)).toBe("2 d ago");
    expect(probeAge(null, now)).toBe("never");
  });
});
