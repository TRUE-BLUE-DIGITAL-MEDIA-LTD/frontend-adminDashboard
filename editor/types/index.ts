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
  /** Apply one AI design op to the live canvas. Undoable like a manual edit. */
  applyDesignOp(op: DesignOp): ApplyResult;
  /** Raw canvas HTML/CSS (no injected runtimes): the AI's working copy. */
  getSnapshot(): { html: string; css: string };
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

export type Language =
  | 'th' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hr' | 'de-ch'
  | 'fr-ch' | 'it-ch' | 'nl' | 'fi' | 'no' | 'sv' | 'ro' | 'hu' | 'pl' | 'cs';

export interface LandingPageTranslation {
  strings: Record<string, string>;
  title: string;
  description: string;
}

export type Translations = Partial<Record<Language, LandingPageTranslation>>;

export type InsertPosition = "before" | "after" | "inside_start" | "inside_end";

/** An AI edit broadcast by the server (mirrors server design/types.ts). */
export type DesignOp =
  | { kind: "replace"; ref: string; html: string }
  | { kind: "insert"; ref: string; position: InsertPosition; html: string }
  | { kind: "remove"; ref: string }
  | { kind: "css"; css: string }
  | { kind: "full"; html: string; css: string };

export type ApplyResult = { status: "applied" } | { status: "skipped"; reason: string };
