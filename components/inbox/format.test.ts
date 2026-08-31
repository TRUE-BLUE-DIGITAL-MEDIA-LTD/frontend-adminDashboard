import { describe, expect, it } from "vitest";
import { formatBytes, formatSender } from "./format";

describe("formatSender", () => {
  it("prefers the display name", () => {
    expect(formatSender("A Visitor", "visitor@gmail.com")).toBe("A Visitor");
  });
  it("falls back to the address", () => {
    expect(formatSender(null, "visitor@gmail.com")).toBe("visitor@gmail.com");
    expect(formatSender("", "visitor@gmail.com")).toBe("visitor@gmail.com");
  });
});

describe("formatBytes", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
  it("handles zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });
});
