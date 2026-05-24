export type EditorMode = "page" | "email" | "document" | "popup";

export type DesignJson = unknown;

export interface ExportResult {
  design: DesignJson;
  html: string;
  css?: string;
}

export type ExportCallback = (result: ExportResult) => void;

export interface EditorInstance {
  exportHtml(cb: ExportCallback): void;
  loadDesign(design: DesignJson): void;
  setHtml(html: string): void;
  saveDesign(cb: (design: DesignJson) => void): void;
  registerCallback(event: string, cb: (...args: unknown[]) => void): void;
  /** Roll back the last tracked change. No-op when stack is empty. */
  undo(): void;
  /** Re-apply the most recently undone change. No-op when stack is empty. */
  redo(): void;
  /** Whether there is at least one change available to undo. */
  canUndo(): boolean;
  /** Whether there is at least one change available to redo. */
  canRedo(): boolean;
  /**
   * Subscribe to history-state changes (undo/redo executed, or any change
   * that mutates the stack). Returns an unsubscribe function.
   */
  onHistoryChange(cb: () => void): () => void;
  /** Drop the entire history stack. Useful after loading a new design. */
  clearHistory(): void;
}

export interface ToolDefinition<TValues = Record<string, unknown>> {
  name: string;
  label: string;
  icon?: string;
  category?: string;
  defaultValues?: TValues;
  render(values: TValues): string;
  mount?(
    node: HTMLElement,
    values: TValues,
    updateValues: (next: TValues) => void,
  ): void;
}

export interface PropertyEditorDefinition<TValue = unknown> {
  name: string;
  layout?: "bottom" | "side";
  render(value: TValue, updateValue: (next: TValue) => void): string;
  mount?(
    node: HTMLElement,
    value: TValue,
    updateValue: (next: TValue) => void,
  ): void;
}
