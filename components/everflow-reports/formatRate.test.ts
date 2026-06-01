import { describe, it, expect } from "vitest";
import type { AdjustLeadRate } from "../../services/adjust-lead-rate";
import { formatRate } from "./formatRate";

function makeRate(partial: Partial<AdjustLeadRate>): AdjustLeadRate {
  return {
    id: "id",
    createAt: "2026-01-01T00:00:00.000Z",
    updateAt: "2026-01-01T00:00:00.000Z",
    rate: partial.rate ?? 1,
    targetCurrency: partial.targetCurrency ?? "USD",
    convertedCurrency: partial.convertedCurrency ?? "USD",
    campaignId: "98",
    country: "France",
    type: "fixed",
    startDate: undefined,
    endDate: undefined,
  };
}

describe("formatRate", () => {
  it("formats whole USD amounts with no decimals", () => {
    expect(formatRate(makeRate({ rate: 5, convertedCurrency: "USD" }))).toBe("$5");
  });

  it("formats fractional USD amounts with two decimals", () => {
    expect(formatRate(makeRate({ rate: 2.4, convertedCurrency: "USD" }))).toBe("$2.40");
    expect(formatRate(makeRate({ rate: 0.75, convertedCurrency: "USD" }))).toBe("$0.75");
  });

  it("formats THB amounts with the baht symbol", () => {
    expect(formatRate(makeRate({ rate: 70, convertedCurrency: "THB" }))).toBe("฿70");
  });

  it("formats zero as a whole amount", () => {
    expect(formatRate(makeRate({ rate: 0, convertedCurrency: "USD" }))).toBe("$0");
  });

  it("falls back to the currency code for unknown currencies", () => {
    expect(formatRate(makeRate({ rate: 3, convertedCurrency: "GBP" }))).toBe("GBP 3");
  });
});
