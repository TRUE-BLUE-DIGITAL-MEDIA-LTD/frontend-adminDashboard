// @vitest-environment jsdom
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SpeedByRegionSection from "./speedByRegionSection";
import type { RegionLatest } from "../../models";

// react 18.3 exports `act`, but @types/react 18.2 does not declare it yet.
const { act } = React as unknown as { act: (cb: () => unknown) => void };

const row = (over: Partial<RegionLatest>): RegionLatest => ({
  region: "us-east1", status: "OK", httpStatus: 200, ttfbMs: 400, domContentLoadedMs: 1300,
  loadMs: 2200, lcpMs: 1600, error: null, probedAt: new Date().toISOString(), ...over,
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("SpeedByRegionSection", () => {
  it("renders OK, FAILED and never-probed rows grouped by area", () => {
    act(() => {
      root.render(
        React.createElement(SpeedByRegionSection, {
          latest: [
            row({ region: "us-east1", loadMs: 2200 }),
            row({ region: "europe-west2", status: "FAILED", loadMs: null, error: "http-404" }),
            row({ region: "europe-west3", status: null, loadMs: null, probedAt: null }),
          ],
          isLoading: false,
          isProbing: false,
          onProbeNow: () => {},
        }),
      );
    });
    const text = container.textContent ?? "";
    expect(text).toContain("United States");
    expect(text).toContain("Europe");
    expect(text).toContain("2.2 s");
    expect(text).toContain("http-404");
    expect(text).toContain("never");
  });

  it("calls onProbeNow when the button is clicked and disables it while probing", () => {
    const onProbeNow = vi.fn();
    act(() => {
      root.render(
        React.createElement(SpeedByRegionSection, { latest: [], isLoading: false, isProbing: false, onProbeNow }),
      );
    });
    const button = container.querySelector("button") as HTMLButtonElement;
    act(() => button.click());
    expect(onProbeNow).toHaveBeenCalledTimes(1);

    act(() => {
      root.render(
        React.createElement(SpeedByRegionSection, { latest: [], isLoading: false, isProbing: true, onProbeNow }),
      );
    });
    expect((container.querySelector("button") as HTMLButtonElement).disabled).toBe(true);
  });
});
