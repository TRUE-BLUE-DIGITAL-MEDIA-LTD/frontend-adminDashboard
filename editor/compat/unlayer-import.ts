import type { UnlayerDesign } from "./unlayer-types";
import {
  unlayerToHtml,
  type UnlayerToHtmlOptions,
} from "./unlayer-to-html";

export interface ImportResult {
  html: string;
  unknownBlocks: UnknownBlockReport[];
}

export interface UnknownBlockReport {
  path: string;
  type: string;
  raw: unknown;
}

export interface ImportOptions extends UnlayerToHtmlOptions {}

export function importUnlayerDesign(
  design: UnlayerDesign,
  options: ImportOptions = {},
): ImportResult {
  const html = unlayerToHtml(design, options);
  const unknownBlocks = collectUnknownBlocks(design);
  return { html, unknownBlocks };
}

export function parseUnlayerDesignString(raw: string): UnlayerDesign {
  const parsed = JSON.parse(raw) as UnlayerDesign;
  if (!parsed || typeof parsed !== "object" || !("body" in parsed)) {
    throw new Error("Invalid Unlayer design JSON: missing 'body'");
  }
  return parsed;
}

const KNOWN_TYPES = new Set([
  "text",
  "heading",
  "image",
  "button",
  "divider",
  "html",
  "menu",
  "social",
  "timer",
  "custom",
  "form",
]);

function collectUnknownBlocks(design: UnlayerDesign): UnknownBlockReport[] {
  const out: UnknownBlockReport[] = [];
  design.body.rows.forEach((row, ri) => {
    row.columns.forEach((col, ci) => {
      col.contents.forEach((content, di) => {
        if (!KNOWN_TYPES.has(content.type)) {
          out.push({
            path: `body.rows[${ri}].columns[${ci}].contents[${di}]`,
            type: content.type,
            raw: content,
          });
        }
      });
    });
  });
  return out;
}
