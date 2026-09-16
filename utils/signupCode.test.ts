import { describe, expect, it } from "vitest";
import {
  isSixDigitCode,
  resendRemainingSeconds,
  RESEND_COOLDOWN_MS,
  sanitizeCodeInput,
} from "./signupCode";

describe("resendRemainingSeconds", () => {
  it("counts down whole seconds from the cooldown", () => {
    expect(resendRemainingSeconds(0, 0)).toBe(60);
    expect(resendRemainingSeconds(0, 1_500)).toBe(59);
    expect(resendRemainingSeconds(0, 59_999)).toBe(1);
  });

  it("returns 0 once the cooldown has elapsed and never goes negative", () => {
    expect(resendRemainingSeconds(0, RESEND_COOLDOWN_MS)).toBe(0);
    expect(resendRemainingSeconds(0, 999_999)).toBe(0);
  });

  it("honours a custom cooldown", () => {
    expect(resendRemainingSeconds(0, 0, 10_000)).toBe(10);
  });
});

describe("sanitizeCodeInput", () => {
  it("strips non-digits and caps at six characters", () => {
    expect(sanitizeCodeInput("12a3-45 6789")).toBe("123456");
    expect(sanitizeCodeInput("")).toBe("");
  });
});

describe("isSixDigitCode", () => {
  it("accepts exactly six digits", () => {
    expect(isSixDigitCode("123456")).toBe(true);
    expect(isSixDigitCode("12345")).toBe(false);
    expect(isSixDigitCode("1234567")).toBe(false);
    expect(isSixDigitCode("12345a")).toBe(false);
  });
});
