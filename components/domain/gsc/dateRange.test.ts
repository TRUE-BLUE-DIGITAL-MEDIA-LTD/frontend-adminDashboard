import { describe, expect, it } from "vitest";
import { buildGscDateRange } from "./dateRange";

describe("buildGscDateRange", () => {
  const today = new Date("2026-08-25T12:00:00Z");

  it("ends 2 days before today because GSC data lags", () => {
    expect(buildGscDateRange(7, today).endDate).toBe("2026-08-23");
  });

  it("spans exactly the requested number of days", () => {
    expect(buildGscDateRange(7, today)).toEqual({
      startDate: "2026-08-17",
      endDate: "2026-08-23",
    });
  });

  it("handles month boundaries", () => {
    expect(buildGscDateRange(28, today).startDate).toBe("2026-07-27");
  });

  it("handles 90 days", () => {
    expect(buildGscDateRange(90, today).startDate).toBe("2026-05-26");
  });
});
