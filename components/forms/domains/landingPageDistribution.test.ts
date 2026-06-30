import { describe, it, expect } from "vitest";
import {
  isLandingPageDistributionValid,
  sumLandingPagePercent,
} from "./landingPageDistribution";

describe("sumLandingPagePercent", () => {
  it("returns 0 for no landing pages", () => {
    expect(sumLandingPagePercent([])).toBe(0);
  });

  it("sums the percent values", () => {
    expect(sumLandingPagePercent([{ percent: 40 }, { percent: 60 }])).toBe(100);
  });

  it("treats non-finite percents as 0", () => {
    expect(sumLandingPagePercent([{ percent: NaN }, { percent: 30 }])).toBe(30);
  });
});

describe("isLandingPageDistributionValid", () => {
  it("is valid when there are no landing pages", () => {
    expect(isLandingPageDistributionValid([])).toBe(true);
  });

  it("is valid when percents total exactly 100", () => {
    expect(
      isLandingPageDistributionValid([{ percent: 25 }, { percent: 75 }]),
    ).toBe(true);
  });

  it("allows individual pages at 0 when the total is 100", () => {
    expect(
      isLandingPageDistributionValid([{ percent: 0 }, { percent: 100 }]),
    ).toBe(true);
  });

  it("is invalid when the total is below 100", () => {
    expect(
      isLandingPageDistributionValid([{ percent: 40 }, { percent: 50 }]),
    ).toBe(false);
  });

  it("is invalid when the total is above 100", () => {
    expect(
      isLandingPageDistributionValid([{ percent: 60 }, { percent: 50 }]),
    ).toBe(false);
  });

  it("is invalid when off by more than the tolerance", () => {
    expect(
      isLandingPageDistributionValid([
        { percent: 33.3 },
        { percent: 33.3 },
        { percent: 33.3 },
      ]),
    ).toBe(false);
  });

  it("accepts totals within the float tolerance of 100", () => {
    expect(isLandingPageDistributionValid([{ percent: 99.995 }])).toBe(true);
  });
});
