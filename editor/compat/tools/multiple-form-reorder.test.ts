import { describe, expect, it } from "vitest";
import {
  computeStepMove,
  remapMoveToStep,
} from "./multiple-form-reorder";

describe("computeStepMove", () => {
  // Typical form: 3 answer steps + submission step at position 4.
  const form = { totalSteps: 4, submitIndex: 4 as number | null };

  it("moves a middle step up and swaps the two positions in the map", () => {
    const move = computeStepMove({ ...form, fromIndex: 3, direction: "up" });
    expect(move).not.toBeNull();
    expect(move!.toIndex).toBe(2);
    expect(move!.oldToNew.get(1)).toBe(1);
    expect(move!.oldToNew.get(2)).toBe(3);
    expect(move!.oldToNew.get(3)).toBe(2);
    expect(move!.oldToNew.get(4)).toBe(4);
  });

  it("moves a step down within the answer range", () => {
    const move = computeStepMove({ ...form, fromIndex: 1, direction: "down" });
    expect(move).not.toBeNull();
    expect(move!.toIndex).toBe(2);
    expect(move!.oldToNew.get(1)).toBe(2);
    expect(move!.oldToNew.get(2)).toBe(1);
  });

  it("blocks moving the first step up", () => {
    expect(
      computeStepMove({ ...form, fromIndex: 1, direction: "up" }),
    ).toBeNull();
  });

  it("blocks moving the last answer step down into the submit slot", () => {
    expect(
      computeStepMove({ ...form, fromIndex: 3, direction: "down" }),
    ).toBeNull();
  });

  it("blocks moving the submission step in either direction", () => {
    expect(
      computeStepMove({ ...form, fromIndex: 4, direction: "up" }),
    ).toBeNull();
    expect(
      computeStepMove({ ...form, fromIndex: 4, direction: "down" }),
    ).toBeNull();
  });

  it("allows moving the last step down when there is no submission step", () => {
    const move = computeStepMove({
      totalSteps: 3,
      submitIndex: null,
      fromIndex: 2,
      direction: "down",
    });
    expect(move).not.toBeNull();
    expect(move!.toIndex).toBe(3);
  });

  it("blocks moving past the end even without a submission step", () => {
    expect(
      computeStepMove({
        totalSteps: 3,
        submitIndex: null,
        fromIndex: 3,
        direction: "down",
      }),
    ).toBeNull();
  });

  it("rejects out-of-range and non-integer fromIndex", () => {
    expect(
      computeStepMove({ ...form, fromIndex: 0, direction: "down" }),
    ).toBeNull();
    expect(
      computeStepMove({ ...form, fromIndex: 5, direction: "up" }),
    ).toBeNull();
    expect(
      computeStepMove({ ...form, fromIndex: Number.NaN, direction: "up" }),
    ).toBeNull();
    expect(
      computeStepMove({ ...form, fromIndex: 2.5, direction: "up" }),
    ).toBeNull();
  });
});

describe("remapMoveToStep", () => {
  const oldToNew = new Map<number, number>([
    [1, 1],
    [2, 3],
    [3, 2],
    [4, 4],
  ]);

  it("follows the step it pointed at", () => {
    expect(remapMoveToStep(2, oldToNew)).toBe(3);
    expect(remapMoveToStep(3, oldToNew)).toBe(2);
    expect(remapMoveToStep(1, oldToNew)).toBe(1);
  });

  it("leaves dangling references unchanged", () => {
    expect(remapMoveToStep(9, oldToNew)).toBe(9);
  });

  it("normalizes empty/absent values to the empty string", () => {
    expect(remapMoveToStep("", oldToNew)).toBe("");
    expect(remapMoveToStep(null, oldToNew)).toBe("");
    expect(remapMoveToStep(undefined, oldToNew)).toBe("");
    expect(remapMoveToStep(Number.NaN, oldToNew)).toBe("");
  });
});
