import type { ExportResult } from "../types";

export interface ExporterOptions {
  minify?: boolean;
  inlineCss?: boolean;
}

export function exportDesign(
  _design: unknown,
  _options: ExporterOptions = {},
): ExportResult {
  throw new Error("exportDesign not implemented");
}
