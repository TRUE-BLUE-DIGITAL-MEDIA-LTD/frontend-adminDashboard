import type { Editor as GrapesEditor } from "grapesjs";

/**
 * Keeps the Style Manager showing what the selected element really looks
 * like. GrapesJS only knows values written on the element's own rule (or a
 * matching parent rule); everything else falls back to the property's
 * hard-coded default, so a span that inherits `font-weight: 900` showed
 * "400" and an inherited white text showed an empty/black color field.
 *
 * Display only — nothing here writes styles. Values are written only when
 * the user edits a field, exactly as before.
 */

/** CSS properties that inherit from the parent element. */
const INHERITED = new Set([
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
  "text-align",
]);

/** `rgb(255, 0, 0)` → `#ff0000`; translucent colors stay as rgba(). */
export function toHex(color: string): string {
  const m = color
    .trim()
    .match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i);
  if (!m) return color.trim();
  const alpha = m[4];
  if (alpha !== undefined) {
    const a = alpha.endsWith("%") ? parseFloat(alpha) / 100 : parseFloat(alpha);
    if (a < 1) return color.trim();
  }
  const hex = [m[1], m[2], m[3]]
    .map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}

/** Map computed values onto the option ids the panel uses. */
export function toDisplayValue(name: string, computed: string): string {
  const v = computed.trim();
  if (name === "color") return toHex(v);
  if (name === "text-align") {
    if (v === "start") return "left";
    if (v === "end") return "right";
    if (v === "-webkit-center") return "center";
  }
  return v;
}

/** Select `value`, adding it as an option when the list doesn't have it. */
export function ensureSelectValue(select: HTMLSelectElement, value: string): void {
  if (!value) return;
  const has = Array.from(select.options).some((o) => o.value === value);
  if (!has) {
    const opt = select.ownerDocument.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  }
  select.value = value;
}

type PropLike = {
  getName(): string;
  getType(): string;
  hasValue(opts?: { noParent?: boolean }): boolean;
  getFullValue(val?: string, opts?: { skipImportant?: boolean }): string;
  getProperties?(): PropLike[];
  view?: {
    el?: HTMLElement;
    createdEl?: HTMLElement & { __oxySetInherited?: (v: string) => void };
  };
};

function syncProperty(
  prop: PropLike,
  el: Element | null,
  win: Window | null,
  style: Record<string, string>,
): void {
  const type = prop.getType();
  if (type === "stack") return;
  if (type === "composite") {
    // padding / margin / border-radius sides are number sub-properties.
    prop.getProperties?.().forEach((sub) => syncProperty(sub, el, win, style));
    return;
  }
  const viewEl = prop.view?.el;
  if (!viewEl) return;

  const name = prop.getName();
  const hasValue = prop.hasValue();
  const inherited =
    !hasValue && el && win && INHERITED.has(name)
      ? toDisplayValue(name, win.getComputedStyle(el).getPropertyValue(name))
      : "";

  const created = prop.view?.createdEl;
  if (created) {
    // Custom types (oxy-color) render their own inherited state.
    created.__oxySetInherited?.(inherited);
    return;
  }

  if (type === "select") {
    const select = viewEl.querySelector("select");
    if (!select) return;
    const value = hasValue
      ? String(prop.getFullValue(undefined, { skipImportant: true }) ?? "").trim()
      : inherited;
    ensureSelectValue(select, value);
    return;
  }

  if (type === "number") {
    const input = viewEl.querySelector<HTMLInputElement>("input");
    if (!input) return;
    // Keywords (max-content, auto, fit-content, …) don't parse as a number,
    // so GrapesJS drops them and leaves the input blank — show them as
    // written on the target.
    const raw = String(
      (hasValue
        ? prop.getFullValue(undefined, { skipImportant: true })
        : style[name]) ?? "",
    )
      .replace(/\s*!important\s*$/i, "")
      .trim();
    if (raw) {
      if (!input.value) input.value = raw;
    } else if (inherited) {
      input.value = "";
      input.placeholder = inherited;
    }
    return;
  }

  if (!inherited) return;

  if (type === "radio") {
    const radio = Array.from(
      viewEl.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    ).find((r) => r.value === inherited);
    if (radio) radio.checked = true;
    return;
  }

  if (type === "base" || type === "") {
    const input = viewEl.querySelector<HTMLInputElement>(
      'input:not([type="radio"]):not([type="file"])',
    );
    if (!input) return;
    input.value = "";
    input.placeholder = inherited;
  }
}

export function attachStyleDisplaySync(grapes: GrapesEditor): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    const comp = grapes.getSelected();
    const el = (comp?.getEl?.() as Element | undefined) ?? null;
    const win = (grapes.Canvas.getWindow?.() as Window | undefined) ?? null;
    const target = grapes.StyleManager.getSelected() as
      | { getStyle?: () => Record<string, string> }
      | undefined;
    const style = target?.getStyle?.() ?? {};
    const sectors = grapes.StyleManager.getSectors() as unknown as {
      getProperties(): PropLike[];
    }[];
    sectors.forEach((sector) =>
      sector
        .getProperties()
        .forEach((prop) => syncProperty(prop, el, win, style)),
    );
  };

  // Property views refresh on a short debounce after the Style Manager
  // updates; run after them so our display wins.
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, 30);
  };

  const events =
    "style:custom style:property:update component:styleUpdate change:device";
  grapes.on(events, schedule);

  return () => {
    if (timer) clearTimeout(timer);
    grapes.off(events, schedule);
  };
}
