import { describe, expect, it } from "vitest";
import { crSignificance } from "./significance";

describe("crSignificance", () => {
  it("flags a clearly real difference (10% vs 6% at n=1000)", () => {
    // pooled p=0.08, se≈0.01213, z≈3.30
    expect(
      crSignificance({ clicks: 100, views: 1000 }, { clicks: 60, views: 1000 }),
    ).toBe("significant");
  });

  it("does not flag noise (5.2% vs 4.8% at n=1000)", () => {
    // z≈0.41
    expect(
      crSignificance({ clicks: 52, views: 1000 }, { clicks: 48, views: 1000 }),
    ).toBe("not-significant");
  });

  it("requires at least 30 clicks and 200 views on both sides", () => {
    expect(
      crSignificance({ clicks: 29, views: 1000 }, { clicks: 100, views: 1000 }),
    ).toBe("insufficient");
    expect(
      crSignificance({ clicks: 50, views: 199 }, { clicks: 100, views: 1000 }),
    ).toBe("insufficient");
  });

  it("handles degenerate input (identical 100% CRs → zero variance)", () => {
    expect(
      crSignificance({ clicks: 300, views: 300 }, { clicks: 300, views: 300 }),
    ).toBe("insufficient");
  });
});
