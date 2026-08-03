import { describe, expect, it } from "vitest";
import { computeFitZoom, parseDeviceWidth } from "./fit-zoom";

describe("computeFitZoom", () => {
  it("returns 100 when the device fits with room to spare", () => {
    expect(computeFitZoom(1600, 1200)).toBe(100);
  });

  it("returns exactly 100 when the device just fits after the gutter", () => {
    // 1240 - 40 gutter = 1200 available for a 1200px device
    expect(computeFitZoom(1240, 1200)).toBe(100);
  });

  it("shrinks proportionally when space is tight", () => {
    // The reported bug: ~146px canvas column on a Nest Hub, mobile 320px design
    expect(computeFitZoom(146, 320)).toBeCloseTo(((146 - 40) / 320) * 100, 5);
  });

  it("respects a custom gutter", () => {
    expect(computeFitZoom(1000, 960, 40)).toBe(100);
    expect(computeFitZoom(1000, 960, 60)).toBeLessThan(100);
  });

  it("clamps to the 5% floor for zero or tiny containers", () => {
    expect(computeFitZoom(0, 1200)).toBe(5);
    expect(computeFitZoom(30, 1200)).toBe(5);
  });

  it("returns 100 (no-op zoom) for invalid device widths", () => {
    expect(computeFitZoom(800, 0)).toBe(100);
    expect(computeFitZoom(800, -10)).toBe(100);
    expect(computeFitZoom(800, NaN)).toBe(100);
  });

  it("returns 100 for invalid container widths", () => {
    expect(computeFitZoom(NaN, 1200)).toBe(100);
  });
});

describe("parseDeviceWidth", () => {
  it("parses px widths", () => {
    expect(parseDeviceWidth("1200px")).toBe(1200);
    expect(parseDeviceWidth("320px")).toBe(320);
  });

  it("returns null for empty or non-numeric widths", () => {
    expect(parseDeviceWidth("")).toBeNull();
    expect(parseDeviceWidth(undefined)).toBeNull();
    expect(parseDeviceWidth(null)).toBeNull();
    expect(parseDeviceWidth("auto")).toBeNull();
    expect(parseDeviceWidth(320)).toBeNull(); // GrapesJS device widths are strings
  });
});
