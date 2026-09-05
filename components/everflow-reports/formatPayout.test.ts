import { describe, expect, it } from "vitest";
import { formatPayout } from "./formatPayout";

describe("formatPayout", () => {
  it("formats as USD with a dollar sign when no currency is given", () => {
    expect(formatPayout(1234.5)).toBe("$1,234.50");
  });

  it("formats USD explicitly", () => {
    expect(formatPayout(10, "USD")).toBe("$10.00");
  });

  it("formats THB with the baht symbol", () => {
    expect(formatPayout(1234.5, "THB")).toBe("฿1,234.50");
  });

  it("always keeps two decimal places", () => {
    expect(formatPayout(1000000, "THB")).toBe("฿1,000,000.00");
  });

  it("falls back to the historical $ format for an invalid code", () => {
    // Not a valid ISO 4217 code: Intl.NumberFormat throws a RangeError.
    expect(formatPayout(1234.5, "not-a-code")).toBe("$1,234.50");
  });
});
