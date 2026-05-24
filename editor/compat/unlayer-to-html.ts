import type {
  UnlayerBackgroundImage,
  UnlayerBody,
  UnlayerBodyValues,
  UnlayerColumn,
  UnlayerContent,
  UnlayerDesign,
  UnlayerRow,
} from "./unlayer-types";

export interface UnlayerToHtmlOptions {
  preserveUnknown?: boolean;
  classPrefix?: string;
}

const DEFAULT_OPTIONS: Required<UnlayerToHtmlOptions> = {
  preserveUnknown: true,
  classPrefix: "oxy",
};

export function unlayerToHtml(
  design: UnlayerDesign,
  options: UnlayerToHtmlOptions = {},
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const body = design.body;
  return renderBody(body, opts);
}

function renderBody(
  body: UnlayerBody,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const rowsHtml = body.rows.map((row) => renderRow(row, opts)).join("");
  // Body-level visuals (background image/color, page font, text color) must
  // live on the real <body> element so the background covers the whole
  // viewport — both inside the editor's canvas iframe and on the published
  // page. We emit a <style> block targeting `body` for those, then keep
  // `.oxy-body` as a content wrapper that handles centering + max-width.
  const bodyCss = composeBodyCssRules(body.values);
  const innerStyle = composeBodyInnerStyle(body.values);
  return `<style data-oxy-body-style>${bodyCss}</style><div class="${opts.classPrefix}-body" style="${innerStyle}">${rowsHtml}</div>`;
}

function renderRow(
  row: UnlayerRow,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const cells = row.cells ?? row.columns.map(() => 1);
  const totalWeight = cells.reduce((acc, w) => acc + (w || 1), 0) || 1;
  const cellsHtml = row.columns
    .map((col, i) => renderColumn(col, cells[i] ?? 1, totalWeight, opts))
    .join("");
  const style = rowStyle(row.values);
  const hideClasses = hideClassFor(row.values, opts.classPrefix);
  return `<div class="${opts.classPrefix}-row${hideClasses}" style="${style}">${cellsHtml}</div>`;
}

function renderColumn(
  column: UnlayerColumn,
  cellWeight: number,
  totalWeight: number,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const contentsHtml = column.contents
    .map((content) => renderContent(content, opts))
    .join("");
  const style = columnStyle(column.values, cellWeight, totalWeight);
  return `<div class="${opts.classPrefix}-col" style="${style}" data-cell-weight="${cellWeight}">${contentsHtml}</div>`;
}

function renderContent(
  content: UnlayerContent,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const baseStyle = contentBaseStyle(content);
  const hide = hideClassFor(content.values, opts.classPrefix);
  switch (content.type) {
    case "text":
      return renderText(content, baseStyle, hide, opts);
    case "heading":
      return renderHeading(content, baseStyle, hide, opts);
    case "image":
      return renderImage(content, baseStyle, hide, opts);
    case "button":
      return renderButton(content, baseStyle, hide, opts);
    case "divider":
      return renderDivider(content, baseStyle, hide, opts);
    case "html":
      return renderHtmlBlock(content, baseStyle, hide, opts);
    case "menu":
      return renderMenu(content, baseStyle, hide, opts);
    case "social":
      return renderSocial(content, baseStyle, hide, opts);
    case "timer":
      return renderTimer(content, baseStyle, hide, opts);
    case "custom":
      return renderCustom(content, baseStyle, hide, opts);
    case "form":
      return renderForm(content, baseStyle, hide, opts);
    default:
      return renderUnknown(content, baseStyle, hide, opts);
  }
}

function renderText(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const text = (v.text as string) ?? "";
  const fontFamily = readFontFamily(v.fontFamily);
  const color = (v.color as string) ?? "";
  const lineHeight = (v.lineHeight as string) ?? "";
  const textAlign = (v.textAlign as string) ?? "";
  const style = composeStyle(baseStyle, {
    "font-family": fontFamily,
    color,
    "line-height": lineHeight,
    "text-align": textAlign,
  });
  return `<div class="${opts.classPrefix}-text${hide}" style="${style}">${text}</div>`;
}

function renderHeading(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const text = (v.text as string) ?? "";
  const tag = sanitizeTag((v.headingType as string) ?? "h1");
  const fontFamily = readFontFamily(v.fontFamily);
  const fontWeight = (v.fontWeight as string) ?? "";
  const fontSize = (v.fontSize as string) ?? "";
  const color = (v.color as string) ?? "";
  const textAlign = (v.textAlign as string) ?? "";
  const lineHeight = (v.lineHeight as string) ?? "";
  const style = composeStyle(baseStyle, {
    "font-family": fontFamily,
    "font-weight": fontWeight,
    "font-size": fontSize,
    color,
    "text-align": textAlign,
    "line-height": lineHeight,
  });
  return `<${tag} class="${opts.classPrefix}-heading${hide}" style="${style}">${text}</${tag}>`;
}

function renderImage(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const src = readSrc(v);
  const alt = (v.altText as string) ?? "";
  const width =
    typeof v.size === "object" && v.size !== null
      ? ((v.size as Record<string, unknown>).width as string) ?? ""
      : "";
  const autoWidth =
    typeof v.size === "object" && v.size !== null
      ? ((v.size as Record<string, unknown>).autoWidth as boolean) ?? false
      : false;
  const widthCss = autoWidth ? "auto" : width;
  const href = readActionHref(v.action);
  const target = readActionTarget(v.action);
  const imgTag = `<img class="${opts.classPrefix}-image-el" src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" style="${
    widthCss ? `width:${widthCss};` : ""
  }max-width:100%;display:block;">`;
  const inner = href
    ? `<a href="${escapeAttr(href)}"${target ? ` target="${escapeAttr(target)}"` : ""}>${imgTag}</a>`
    : imgTag;
  return `<div class="${opts.classPrefix}-image${hide}" style="${baseStyle}">${inner}</div>`;
}

function renderButton(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const text = (v.text as string) ?? "";
  const fontFamily = readFontFamily(v.fontFamily);
  const fontWeight = (v.fontWeight as string) ?? "";
  const fontSize = (v.fontSize as string) ?? "";
  const buttonColors = (v.buttonColors as Record<string, unknown>) ?? {};
  const color =
    (buttonColors.color as string) ?? ((v.color as string) ?? "");
  const bg =
    (buttonColors.backgroundColor as string) ??
    ((v.backgroundColor as string) ?? "");
  const textAlign = (v.textAlign as string) ?? "";
  const padding = (v.padding as string) ?? "";
  const borderRadius = (v.borderRadius as string) ?? "";
  const lineHeight = (v.lineHeight as string) ?? "";
  const sizeObj = (v.size as Record<string, unknown>) ?? {};
  const autoWidth = (sizeObj.autoWidth as boolean) ?? true;
  const width = (sizeObj.width as string) ?? "";
  const href = readActionHref(v.href);
  const target = readActionTarget(v.href);
  const buttonStyle = composeStyle("", {
    "font-family": fontFamily,
    "font-weight": fontWeight,
    "font-size": fontSize,
    "line-height": lineHeight,
    color,
    "background-color": bg,
    "text-align": textAlign,
    padding,
    "border-radius": borderRadius,
    "text-decoration": "none",
    display: autoWidth ? "inline-block" : "block",
    width: autoWidth ? "" : width,
    "box-sizing": "border-box",
  });
  const containerStyle = composeStyle(baseStyle, { "text-align": textAlign });
  return `<div class="${opts.classPrefix}-button${hide}" style="${containerStyle}"><a href="${escapeAttr(
    href,
  )}"${target ? ` target="${escapeAttr(target)}"` : ""} style="${buttonStyle}">${text}</a></div>`;
}

function readActionHref(action: unknown): string {
  if (typeof action === "string") return action;
  if (action && typeof action === "object") {
    const values = (action as Record<string, unknown>).values;
    if (values && typeof values === "object") {
      const href = (values as Record<string, unknown>).href;
      if (typeof href === "string") return href;
    }
  }
  return "";
}

function readActionTarget(action: unknown): string {
  if (action && typeof action === "object") {
    const values = (action as Record<string, unknown>).values;
    if (values && typeof values === "object") {
      const target = (values as Record<string, unknown>).target;
      if (typeof target === "string") return target;
    }
  }
  return "";
}

function renderCustom(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const slug = content.slug ?? "";
  if (slug === "multiple_form") {
    return renderMultipleForm(content, baseStyle, hide, opts);
  }
  return renderUnknown(content, baseStyle, hide, opts);
}

/**
 * Multi-step form import — emits the exact DOM shape that the new
 * GrapesJS component types in `editor/compat/tools/multiple-form.ts`
 * recognize via their `isComponent` callbacks, so Unlayer fixtures load
 * as fully-editable multi-form components (title, button color, etc. all
 * recovered from `data-oxy-*` attributes).
 *
 * Classes / IDs mirror the runtime script's contract:
 *   • Root  : .oxy-multiple-form, with data-oxy-form-link for mainLink
 *   • Step  : .form_step + id="form_step_N"; step 1 inline display:flex,
 *             rest display:none (the runtime toggles them on click)
 *   • Button: .oxy-form-option-button with value="{JSON payload}" using
 *             step.type as the answer key (the legacy code used
 *             option.value for the key, which was wrong)
 */

interface MultipleFormStep {
  id?: number;
  title?: string;
  type?: string;
  picture?: { url?: string | null; width_auto?: boolean; width?: string };
  button_color?: string;
  text_color?: string;
  button_size?: string;
  button_rounded?: string;
  spacing?: string;
  options?: Array<{
    display?: string;
    value?: string;
    id?: number;
    url?: string;
    move_to_step?: number;
  }>;
}

const MF_DEFAULT_BUTTON_COLOR = "#dc2626";
const MF_DEFAULT_TEXT_COLOR = "#ffffff";
const MF_DEFAULT_BUTTON_PADDING = 10;
const MF_DEFAULT_BUTTON_RADIUS = 8;
const MF_DEFAULT_BUTTON_SPACING = 8;

function mfNumber(raw: unknown, fallback: number): number {
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function renderMultipleForm(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const form =
    (content.values.form as Record<string, unknown> | undefined) ?? {};
  const steps = Array.isArray(form.steps)
    ? (form.steps as MultipleFormStep[])
    : [];
  if (steps.length === 0) return "";
  const mainLink =
    typeof form.mainLink === "string" ? (form.mainLink as string) : "";
  const total = steps.length;
  const stepsHtml = steps
    .map((step, idx) => renderMultipleFormStep(step, idx, total))
    .join("");
  const rootStyle = composeStyle(baseStyle, {
    width: "100%",
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    gap: "16px",
    padding: "16px 0",
  });
  return `<div class="oxy-multiple-form${hide}" data-oxy-form-link="${escapeAttr(
    mainLink,
  )}" style="${rootStyle}">${stepsHtml}</div>`;
}

function renderMultipleFormStep(
  step: MultipleFormStep,
  index: number,
  total: number,
): string {
  const stepId = index + 1;
  const isFirst = index === 0;
  const title = step.title ?? "";
  const type = step.type ?? "value";
  const buttonColor = step.button_color || MF_DEFAULT_BUTTON_COLOR;
  const textColor = step.text_color || MF_DEFAULT_TEXT_COLOR;
  const buttonPadding = mfNumber(step.button_size, MF_DEFAULT_BUTTON_PADDING);
  const buttonRadius = mfNumber(step.button_rounded, MF_DEFAULT_BUTTON_RADIUS);
  const buttonSpacing = mfNumber(step.spacing, MF_DEFAULT_BUTTON_SPACING);

  const stepClass = isFirst ? "form_step oxy-form-step-active" : "form_step";
  const stepStyle = composeStyle("", {
    width: "100%",
    "flex-direction": "column",
    "align-items": "center",
    "justify-content": "center",
    gap: "3px",
    padding: "12px 0",
    display: isFirst ? "flex" : "none",
  });

  const titleHtml = title
    ? `<div class="oxy-form-step-title" style="background:#ffffff;padding:0.25rem 0.45rem;min-width:15rem;text-align:center;border-radius:0.375rem;margin-bottom:1rem;">${escapeHtml(title)}</div>`
    : `<div class="oxy-form-step-title" style="display:none;"></div>`;

  const dividerHtml = `<div class="oxy-form-step-divider" style="min-width:15rem;height:2px;background:#000000;"></div>`;

  const buttonsHtml = (step.options ?? [])
    .map((opt) =>
      renderMultipleFormButton(opt, {
        stepType: type,
        buttonColor,
        textColor,
        buttonPadding,
        buttonRadius,
        totalSteps: total,
      }),
    )
    .join("");

  const containerStyle = composeStyle("", {
    display: "flex",
    width: "100%",
    "flex-direction": "column",
    "align-items": "center",
    "justify-content": "center",
    gap: `${buttonSpacing}px`,
  });

  return (
    `<div class="${stepClass}" id="form_step_${stepId}"` +
    ` data-oxy-step-title="${escapeAttr(title)}"` +
    ` data-oxy-step-type="${escapeAttr(type)}"` +
    ` data-oxy-button-color="${escapeAttr(buttonColor)}"` +
    ` data-oxy-text-color="${escapeAttr(textColor)}"` +
    ` data-oxy-button-padding="${buttonPadding}"` +
    ` data-oxy-button-radius="${buttonRadius}"` +
    ` data-oxy-button-spacing="${buttonSpacing}"` +
    ` style="${stepStyle}">${titleHtml}${dividerHtml}` +
    `<div class="button-containers" style="${containerStyle}">${buttonsHtml}</div></div>`
  );
}

function renderMultipleFormButton(
  option: {
    display?: string;
    value?: string;
    id?: number;
    url?: string;
    move_to_step?: number;
  },
  step: {
    stepType: string;
    buttonColor: string;
    textColor: string;
    buttonPadding: number;
    buttonRadius: number;
    totalSteps: number;
  },
): string {
  const display = option.display ?? "";
  const value = option.value ?? "";
  const url = option.url ?? "";
  const move = option.move_to_step;

  // Runtime script reads this JSON. Key must be step.type (the answer key),
  // value must be option.value. URL and move_to_step are optional escape
  // hatches the script honors before advancing.
  const payload: Record<string, string> = {
    [step.stepType || "value"]: value,
  };
  if (url && url !== "" && url !== "-") payload.url = url;
  if (typeof move === "number" && move > 0 && move <= step.totalSteps) {
    payload.move_to_step = String(move);
  }
  const valueJson = JSON.stringify(payload);

  const padding = `${step.buttonPadding}px`;
  const paddingInline = `${Math.round(step.buttonPadding * 1.05)}px`;
  const btnStyle = composeStyle("", {
    "min-width": "15rem",
    width: "max-content",
    "border-radius": `${step.buttonRadius}px`,
    "background-color": step.buttonColor,
    "padding-top": padding,
    "padding-bottom": padding,
    "padding-left": paddingInline,
    "padding-right": paddingInline,
    color: step.textColor,
    "font-size": "1.5rem",
    cursor: "pointer",
    border: "0",
    transition: "background-color 0.3s ease",
    "box-shadow":
      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  });

  return (
    `<button type="button" class="oxy-form-option-button"` +
    ` value="${escapeAttr(valueJson)}"` +
    ` data-oxy-display="${escapeAttr(display)}"` +
    ` data-oxy-value="${escapeAttr(value)}"` +
    ` data-oxy-url="${escapeAttr(url)}"` +
    ` data-oxy-move-to-step="${typeof move === "number" ? move : ""}"` +
    ` style="${btnStyle}">${escapeHtml(display)}</button>`
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Unlayer `form` widget → editable Form component.
 *
 * Emits the DOM contract recognised by the `oxy-form` / `oxy-form-field`
 * component types in `editor/compat/tools/form.ts`:
 *   • Root  : <form class="oxy-form"> + data-oxy-button-* attributes
 *   • Field : <div class="oxy-form-field"> + data-oxy-field-* attributes
 *   • Submit: <button class="oxy-form-submit" type="submit">
 *
 * Unlayer forms with an empty `fields` array (the common "styled CTA button"
 * case) come through as just the submit button. The class is hardcoded
 * "oxy-form" — not `opts.classPrefix` — because the component type keys off
 * that literal string (same choice `renderMultipleForm` made).
 */
const FORM_FIELD_TYPE_MAP: Record<string, string> = {
  text: "text",
  email: "email",
  phone: "tel",
  tel: "tel",
  number: "number",
  textarea: "textarea",
  long_answer: "textarea",
  dropdown: "select",
  select: "select",
  checkbox: "checkbox",
  boolean: "checkbox",
  hidden: "hidden",
};

interface FormFieldControlData {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

function renderForm(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  void opts;
  const v = content.values;
  const action = (v.action as Record<string, unknown> | undefined) ?? {};
  const actionUrl = (action.url as string) ?? "";
  const method =
    String((action.method as string) ?? "GET").toUpperCase() === "POST"
      ? "POST"
      : "GET";

  const buttonColors =
    (v.buttonColors as Record<string, unknown> | undefined) ?? {};
  const buttonText = (v.buttonText as string) ?? "Continue";
  const buttonColor = (buttonColors.backgroundColor as string) ?? "#2563eb";
  const buttonTextColor = (buttonColors.color as string) ?? "#ffffff";
  const buttonWidthObj =
    (v.buttonWidth as Record<string, unknown> | undefined) ?? {};
  const buttonWidth =
    buttonWidthObj.autoWidth === true
      ? "auto"
      : (buttonWidthObj.width as string) ?? "100%";
  const buttonRadius = (v.buttonBorderRadius as string) ?? "8px";
  const buttonFontSize = (v.buttonFontSize as string) ?? "16px";

  const formWidthObj =
    (v.formWidth as Record<string, unknown> | undefined) ?? {};
  const formWidth =
    formWidthObj.autoWidth === true
      ? "auto"
      : (formWidthObj.width as string) ?? "100%";
  const formAlign = (v.formAlign as string) ?? "center";
  const fieldDistance = (v.fieldDistance as string) ?? "15px";

  const fields = Array.isArray(v.fields) ? (v.fields as unknown[]) : [];
  const fieldsHtml = fields.map((f) => renderFormField(f)).join("");

  const submitStyle = composeStyle("", {
    "background-color": buttonColor,
    color: buttonTextColor,
    width: buttonWidth,
    "border-radius": buttonRadius,
    border: "0",
    padding: "12px 16px",
    "font-size": buttonFontSize,
    "font-weight": "600",
    cursor: "pointer",
  });
  const submitHtml = `<button type="submit" class="oxy-form-submit" style="${submitStyle}">${escapeHtml(
    buttonText,
  )}</button>`;

  const marginX = formAlign === "center" ? "auto" : "0";
  const formStyle = composeStyle(baseStyle, {
    display: "flex",
    "flex-direction": "column",
    gap: fieldDistance,
    width: formWidth,
    "margin-left": marginX,
    "margin-right": marginX,
    "box-sizing": "border-box",
  });

  const dataAttrs =
    ` data-oxy-button-text="${escapeAttr(buttonText)}"` +
    ` data-oxy-button-color="${escapeAttr(buttonColor)}"` +
    ` data-oxy-button-text-color="${escapeAttr(buttonTextColor)}"` +
    ` data-oxy-button-width="${escapeAttr(buttonWidth)}"` +
    ` data-oxy-button-radius="${escapeAttr(buttonRadius)}"`;

  return (
    `<form class="oxy-form${hide}" method="${method}"` +
    ` action="${escapeAttr(actionUrl)}"${dataAttrs} style="${formStyle}">` +
    `${fieldsHtml}${submitHtml}</form>`
  );
}

function renderFormField(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const f = raw as Record<string, unknown>;
  const rawType = String(f.type ?? "text").toLowerCase();
  const type = FORM_FIELD_TYPE_MAP[rawType] ?? "text";
  const name = (f.name as string) ?? "";
  const label = (f.label as string) ?? name;
  const placeholder = (f.placeholder as string) ?? "";
  const required = f.required === true;
  const options = Array.isArray(f.options)
    ? (f.options as unknown[]).map((o) => {
        if (o && typeof o === "object") {
          const obj = o as Record<string, unknown>;
          return String(obj.label ?? obj.value ?? "");
        }
        return String(o);
      })
    : [];

  const dataAttrs =
    ` data-oxy-field-type="${escapeAttr(type)}"` +
    ` data-oxy-field-name="${escapeAttr(name)}"` +
    ` data-oxy-field-label="${escapeAttr(label)}"` +
    ` data-oxy-field-placeholder="${escapeAttr(placeholder)}"` +
    ` data-oxy-field-required="${required ? "true" : "false"}"` +
    ` data-oxy-field-options="${escapeAttr(options.join(", "))}"`;

  const wrapStyle =
    type === "hidden"
      ? "display:none;"
      : type === "checkbox"
        ? "display:flex;align-items:center;"
        : "display:block;";

  const inner = formFieldControlHtml(type, {
    name,
    label,
    placeholder,
    required,
    options,
  });

  return `<div class="oxy-form-field"${dataAttrs} style="${wrapStyle}">${inner}</div>`;
}

function formFieldControlHtml(type: string, d: FormFieldControlData): string {
  const nameAttr = d.name ? ` name="${escapeAttr(d.name)}"` : "";
  const phAttr = d.placeholder
    ? ` placeholder="${escapeAttr(d.placeholder)}"`
    : "";
  const reqAttr = d.required ? " required" : "";
  const inputStyle =
    "width:100%;padding:10px 12px;border:1px solid #d1d5db;" +
    "border-radius:6px;font-size:14px;box-sizing:border-box;";
  const labelText = escapeHtml(d.label || d.name || "Field");

  if (type === "hidden") {
    return `<input type="hidden"${nameAttr} value="">`;
  }
  if (type === "checkbox") {
    return (
      `<input type="checkbox"${nameAttr}${reqAttr} ` +
      `style="margin-right:8px;width:16px;height:16px;cursor:pointer;">` +
      `<span class="oxy-form-field-label" ` +
      `style="font-size:14px;color:#374151;">${labelText}</span>`
    );
  }
  const labelHtml =
    `<label class="oxy-form-field-label" ` +
    `style="display:block;font-size:14px;color:#374151;` +
    `margin-bottom:4px;font-weight:500;">${labelText}</label>`;
  if (type === "textarea") {
    return (
      labelHtml +
      `<textarea${nameAttr}${phAttr}${reqAttr} rows="4" ` +
      `style="${inputStyle}font-family:inherit;resize:vertical;"></textarea>`
    );
  }
  if (type === "select") {
    const opts = d.options
      .map((o) => `<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`)
      .join("");
    return (
      labelHtml +
      `<select${nameAttr}${reqAttr} style="${inputStyle}">${opts}</select>`
    );
  }
  return (
    labelHtml +
    `<input type="${escapeAttr(type)}"${nameAttr}${phAttr}${reqAttr} ` +
    `style="${inputStyle}">`
  );
}

function renderDivider(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const border = (v.border as Record<string, unknown> | undefined) ?? {};
  const width = (border.borderTopWidth as string) ?? "1px";
  const style = (border.borderTopStyle as string) ?? "solid";
  const color = (border.borderTopColor as string) ?? "#BBBBBB";
  const divStyle = composeStyle(baseStyle, {
    "border-top": `${width} ${style} ${color}`,
    height: "0",
  });
  return `<div class="${opts.classPrefix}-divider${hide}" style="${divStyle}"></div>`;
}

function renderHtmlBlock(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const html = (v.html as string) ?? "";
  return `<div class="${opts.classPrefix}-html${hide}" style="${baseStyle}">${html}</div>`;
}

function renderMenu(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const items = Array.isArray(v.menu) ? (v.menu as unknown[]) : [];
  const links = items
    .map((raw) => {
      if (!raw || typeof raw !== "object") return "";
      const item = raw as Record<string, unknown>;
      const text = (item.text as string) ?? "";
      const link =
        typeof item.link === "object" && item.link !== null
          ? ((item.link as Record<string, unknown>).values as
              | Record<string, unknown>
              | undefined)
          : undefined;
      const href = (link?.href as string) ?? "#";
      const target = (link?.target as string) ?? "";
      return `<a href="${escapeAttr(href)}"${target ? ` target="${escapeAttr(target)}"` : ""}>${text}</a>`;
    })
    .join("");
  return `<nav class="${opts.classPrefix}-menu${hide}" style="${baseStyle}">${links}</nav>`;
}

function renderSocial(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const icons = Array.isArray(v.icons)
    ? (v.icons as Array<Record<string, unknown>>)
    : [];
  const links = icons
    .map((icon) => {
      const url = (icon.url as string) ?? "#";
      const src = (icon.src as string) ?? "";
      const name = (icon.name as string) ?? "";
      return `<a href="${escapeAttr(url)}" title="${escapeAttr(name)}"><img src="${escapeAttr(src)}" alt="${escapeAttr(name)}" style="height:32px;width:32px;display:inline-block;"></a>`;
    })
    .join("");
  return `<div class="${opts.classPrefix}-social${hide}" style="${baseStyle}">${links}</div>`;
}

function renderTimer(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  const v = content.values;
  const endAt = (v.endDate as string) ?? "";
  return `<div class="${opts.classPrefix}-timer${hide}" style="${baseStyle}" data-oxy-timer-end="${escapeAttr(endAt)}">Timer</div>`;
}

function renderUnknown(
  content: UnlayerContent,
  baseStyle: string,
  hide: string,
  opts: Required<UnlayerToHtmlOptions>,
): string {
  if (!opts.preserveUnknown) return "";
  const raw = JSON.stringify(content);
  return `<div class="${opts.classPrefix}-unknown${hide}" data-oxy-unknown-type="${escapeAttr(content.type)}" data-oxy-unknown-raw="${escapeAttr(raw)}" style="${baseStyle}padding:8px;border:1px dashed #888;color:#888;font-family:monospace;">[unknown block: ${escapeAttr(content.type)}]</div>`;
}

/**
 * CSS for the real <body> element — background, font, and text color.
 * Background props use `!important` so they win over GrapesJS' canvas
 * theme rules (which set their own body background). `min-height: 100vh`
 * + `margin: 0` ensure the image always covers the full viewport even
 * when content is short.
 */
function composeBodyCssRules(values: UnlayerBodyValues): string {
  const bg = values.backgroundColor ?? "";
  const bgImg = values.backgroundImage
    ? backgroundImageCss(values.backgroundImage)
    : "";
  const fontFamily = readFontFamily(values.fontFamily);
  const textColor = values.textColor ?? "";

  const parts: string[] = ["margin:0", "min-height:100vh"];
  if (bg) parts.push(`background-color:${bg} !important`);
  if (bgImg) {
    parts.push(`background-image:${bgImg} !important`);
    parts.push("background-size:cover");
    parts.push("background-position:center center");
    parts.push("background-repeat:no-repeat");
    parts.push("background-attachment:scroll");
  }
  if (fontFamily) parts.push(`font-family:${fontFamily}`);
  if (textColor) parts.push(`color:${textColor}`);
  return `body{${parts.join(";")};}`;
}

/**
 * Inline style for the `.oxy-body` content wrapper — only the centering
 * concerns (max-width + auto margins). Background/font/color now live on
 * <body> via composeBodyCssRules.
 */
function composeBodyInnerStyle(values: UnlayerBodyValues): string {
  const contentWidth = values.contentWidth ?? "";
  return composeStyle("", {
    "max-width": contentWidth,
    "margin-left": "auto",
    "margin-right": "auto",
    width: "100%",
  });
}

function rowStyle(values: UnlayerRow["values"]): string {
  return composeStyle("", {
    "background-color": values.backgroundColor ?? "",
    "background-image": values.backgroundImage
      ? backgroundImageCss(values.backgroundImage)
      : "",
    padding: values.padding ?? "",
    display: "flex",
    "flex-wrap": "wrap",
  });
}

function columnStyle(
  values: UnlayerColumn["values"],
  cellWeight: number,
  totalWeight: number,
): string {
  const flex = `${cellWeight} 1 0`;
  const widthPct = `${(cellWeight / totalWeight) * 100}%`;
  return composeStyle("", {
    "background-color": values.backgroundColor ?? "",
    padding: values.padding ?? "",
    "border-radius": values.borderRadius ?? "",
    flex,
    "max-width": widthPct,
    "box-sizing": "border-box",
  });
}

function contentBaseStyle(content: UnlayerContent): string {
  return composeStyle("", {
    padding: (content.values.containerPadding as string) ?? "",
  });
}

function backgroundImageCss(img: UnlayerBackgroundImage): string {
  if (!img.url) return "";
  return `url(${img.url})`;
}

function readFontFamily(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  return (value as { value?: string }).value ?? "";
}

function readSrc(values: Record<string, unknown>): string {
  const src = values.src;
  if (typeof src === "string") return src;
  if (src && typeof src === "object") {
    return ((src as Record<string, unknown>).url as string) ?? "";
  }
  return "";
}

function hideClassFor(
  values: { hideDesktop?: boolean; hideMobile?: boolean },
  prefix: string,
): string {
  const classes: string[] = [];
  if (values.hideDesktop) classes.push(`${prefix}-hide-desktop`);
  if (values.hideMobile) classes.push(`${prefix}-hide-mobile`);
  return classes.length ? ` ${classes.join(" ")}` : "";
}

function composeStyle(
  base: string,
  extras: Record<string, string>,
): string {
  const parts = base ? [base.replace(/;?\s*$/, "")] : [];
  for (const [key, value] of Object.entries(extras)) {
    if (value === "" || value == null) continue;
    parts.push(`${key}:${value}`);
  }
  return parts.length ? `${parts.join(";")};` : "";
}

function sanitizeTag(tag: string): string {
  return /^h[1-6]$/i.test(tag) ? tag.toLowerCase() : "h1";
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
