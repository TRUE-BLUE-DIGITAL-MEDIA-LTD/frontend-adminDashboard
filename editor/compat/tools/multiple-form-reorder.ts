/**
 * Pure reorder logic for the multi-step form block. Kept free of GrapesJS
 * so it runs under Vitest's node environment. `multiple-form.ts` applies
 * the returned plan to the component tree.
 *
 * All positions are 1-based, matching `form_step_N` ids, the root's
 * `active-step` prop, and option buttons' `move_to_step` payloads.
 */

export type StepMoveDirection = "up" | "down";

export interface StepMovePlan {
  /** New 1-based position of the moved step. */
  toIndex: number;
  /** Old 1-based position → new 1-based position, for EVERY step. */
  oldToNew: ReadonlyMap<number, number>;
}

/**
 * Compute an adjacent-swap move, or null when the move is not allowed:
 * out-of-range index, moving the submission step, or landing at/past the
 * submission step's slot (it must stay last).
 */
export function computeStepMove(args: {
  totalSteps: number;
  /** 1-based position of the submission step, or null if the form has none. */
  submitIndex: number | null;
  fromIndex: number;
  direction: StepMoveDirection;
}): StepMovePlan | null {
  const { totalSteps, submitIndex, fromIndex, direction } = args;
  if (
    !Number.isInteger(fromIndex) ||
    fromIndex < 1 ||
    fromIndex > totalSteps
  ) {
    return null;
  }
  if (submitIndex !== null && fromIndex === submitIndex) return null;
  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  if (toIndex < 1 || toIndex > totalSteps) return null;
  if (submitIndex !== null && toIndex >= submitIndex) return null;

  const oldToNew = new Map<number, number>();
  for (let i = 1; i <= totalSteps; i++) oldToNew.set(i, i);
  oldToNew.set(fromIndex, toIndex);
  oldToNew.set(toIndex, fromIndex);
  return { toIndex, oldToNew };
}

/**
 * Remap one option's "Go to step #" value after a move. References follow
 * the step they pointed at; dangling numbers (no such step in the old
 * order) pass through unchanged; empty/invalid values normalize to "".
 */
export function remapMoveToStep(
  value: number | "" | null | undefined,
  oldToNew: ReadonlyMap<number, number>,
): number | "" {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return oldToNew.get(value) ?? value;
}
