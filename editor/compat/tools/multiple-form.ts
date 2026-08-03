import type { Editor as GrapesEditor, Component } from "grapesjs";

/**
 * Multi-step form block — port of the legacy Unlayer custom tool at
 * `clients/dashboard/public/unlayer-custom/multiple-form.ts`.
 *
 * Runtime compatibility (`public/unlayer-custom/script-multiple-form.ts`):
 *   • Steps are `.form_step` divs with `id="form_step_N"` (1-indexed). On
 *     page load the runtime expects step 1 to be visible (`display:flex`) and
 *     every other step hidden (`display:none`) — it toggles inline display as
 *     the user advances. We always restore that invariant on add/remove.
 *   • Each button must be a direct child of `.button-containers` with a JSON
 *     payload in its `value` attribute: `{ <answerKey>, url?, move_to_step? }`.
 *   • The runtime also reads the final redirect URL from a separate
 *     `<script class="script_multiple_form" value='{"link":"..."}'>` tag —
 *     `appendMultipleFormRuntime` injects this on export from the root's
 *     `data-oxy-form-link` attribute.
 *
 * Editor experience:
 *   • Only the active step is shown in the canvas. A custom `oxy-step-list`
 *     trait on the root form lets the author switch between steps; clicking a
 *     step inside the canvas also makes it active.
 *   • The "active" indicator is purely an editor concern — it lives in a
 *     class (`oxy-form-step-active`) plus a canvas-only stylesheet, so it
 *     never alters the exported HTML.
 */

export const MULTIPLE_FORM_MARKER_CLASS = "oxy-multiple-form";
export const MULTIPLE_FORM_RUNTIME_SRC =
  "/unlayer-custom/script-multiple-form.js";

const STEP_CLASS = "form_step";
const BUTTONS_CLASS = "button-containers";
const OPTION_CLASS = "oxy-form-option-button";
const TITLE_CLASS = "oxy-form-step-title";
const DIVIDER_CLASS = "oxy-form-step-divider";
const ACTIVE_STEP_CLASS = "oxy-form-step-active";
const RUNTIME_LINK_CLASS = "script_multiple_form";

const ROOT_TYPE = "oxy-multiple-form";
const STEP_TYPE = "oxy-form-step";
const OPTION_TYPE = "oxy-form-option";

const SUBMIT_STEP_TYPE = "oxy-form-submit-step";
export const SUBMIT_STEP_CLASS = "oxy-form-submit-step";
const EMAIL_INPUT_CLASS = "oxy-form-email-input";
const CONSENT_ROW_CLASS = "oxy-form-consent-row";
const CONSENT_CHECKBOX_CLASS = "oxy-form-consent-checkbox";
const CONSENT_TEXT_CLASS = "oxy-form-consent-text";
const SUBMIT_CTA_CLASS = "oxy-form-submit-cta";

const INPUT_STEP_TYPE = "oxy-form-input-step";
export const INPUT_STEP_CLASS = "oxy-form-input-step";
const INPUT_FIELD_TYPE = "oxy-form-input-field";
const INPUT_FIELD_CLASS = "oxy-form-input-field";
const INPUT_CONTINUE_CLASS = "oxy-form-input-continue";

/** Author-facing field types → HTML input types. */
const INPUT_FIELD_HTML_TYPES: Record<string, string> = {
  text: "text",
  number: "number",
  phone: "tel",
  date: "date",
};

function htmlInputType(fieldType: string): string {
  return INPUT_FIELD_HTML_TYPES[fieldType] ?? "text";
}

/**
 * Server-side sanitizeFormAnswers rejects the ENTIRE submit when any value
 * exceeds 200 chars — cap at the browser so a long paste can't silently
 * drop the lead.
 */
const INPUT_VALUE_MAXLENGTH = "200";

/**
 * sanitizeFormAnswers also rejects submits carrying more than 20 keys.
 * Every option step records one key (its answer key) and every input field
 * records one, so the editor blocks adding sources past this budget —
 * otherwise EVERY submit on the published page would 400 silently.
 */
export const MAX_ANSWER_KEYS = 20;

export function isAnswerKeyCapReached(sourceCount: number): boolean {
  return sourceCount >= MAX_ANSWER_KEYS;
}

/** Maximum ANSWER steps per form — the submission step is always extra. */
export const MAX_STEPS = 10;

export function isAnswerStepCapReached(answerStepCount: number): boolean {
  return answerStepCount >= MAX_STEPS;
}

export function stepListCounterText(answerStepCount: number): string {
  const base = `Answer steps: ${answerStepCount} / ${MAX_STEPS}`;
  return isAnswerStepCapReached(answerStepCount)
    ? `${base} — limit reached`
    : base;
}

export const DEFAULT_CONSENT_TEXT =
  "I agree to receive marketing communications and accept the privacy policy.";


const STEP_LIST_TRAIT_TYPE = "oxy-step-list";
const REMOVE_STEP_TRAIT_TYPE = "oxy-remove-step";
const REMOVE_FIELD_TRAIT_TYPE = "oxy-remove-field";
const ADD_FIELD_TRAIT_TYPE = "oxy-add-field";

export const LAST_STEP_HINT =
  "A form needs at least one answer step, so the last one can't be removed.";

export const LAST_FIELD_HINT =
  "An input step needs at least one field, so the last one can't be removed.";

export const FIELD_CAP_HINT = `This form already collects ${MAX_ANSWER_KEYS} answers — the server accepts at most ${MAX_ANSWER_KEYS} per submit. Remove a field or an answer step first.`;

const CMD_ADD_STEP = "oxy-mf:add-step";
const CMD_REMOVE_STEP = "oxy-mf:remove-step";
const CMD_ADD_OPTION = "oxy-mf:add-option";
const CMD_REMOVE_OPTION = "oxy-mf:remove-option";
const CMD_ADD_INPUT_STEP = "oxy-mf:add-input-step";
const CMD_ADD_INPUT_FIELD = "oxy-mf:add-input-field";
const CMD_REMOVE_INPUT_FIELD = "oxy-mf:remove-input-field";

const DEFAULT_BUTTON_COLOR = "#dc2626";
const DEFAULT_TEXT_COLOR = "#ffffff";
const DEFAULT_BUTTON_PADDING = 10;
const DEFAULT_BUTTON_RADIUS = 8;
const DEFAULT_BUTTON_SPACING = 8;

/**
 * CSS injected into the canvas iframe ONLY. Hides every step except the one
 * carrying `.oxy-form-step-active`, regardless of its inline `display`. Uses
 * `!important` to beat the inline `display:flex` we keep on step 1 for the
 * export.
 */
const CANVAS_STYLES = `
.${MULTIPLE_FORM_MARKER_CLASS} .${STEP_CLASS} {
  display: none !important;
}
.${MULTIPLE_FORM_MARKER_CLASS} .${STEP_CLASS}.${ACTIVE_STEP_CLASS} {
  display: flex !important;
}
`;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unescapeAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function buildOptionValueJson(opt: {
  type: string;
  value: string;
  url: string;
  moveToStep: number | "";
  totalSteps: number;
}): string {
  const payload: Record<string, string> = {
    [opt.type || "value"]: opt.value || "",
  };
  if (opt.url && opt.url !== "" && opt.url !== "-") {
    payload.url = opt.url;
  }
  if (
    typeof opt.moveToStep === "number" &&
    opt.moveToStep > 0 &&
    opt.moveToStep <= opt.totalSteps
  ) {
    payload.move_to_step = String(opt.moveToStep);
  }
  return JSON.stringify(payload);
}

function buttonStyleObject(step: {
  buttonColor: string;
  textColor: string;
  buttonPadding: number;
  buttonRadius: number;
}): Record<string, string> {
  const padding = `${step.buttonPadding}px`;
  const paddingInline = `${Math.round(step.buttonPadding * 1.05)}px`;
  return {
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
  };
}

function buttonContainerStyle(spacing: number): Record<string, string> {
  return {
    display: "flex",
    width: "100%",
    "flex-direction": "column",
    "align-items": "center",
    "justify-content": "center",
    gap: `${spacing}px`,
  };
}

const STEP_BASE_STYLE: Record<string, string> = {
  width: "100%",
  "flex-direction": "column",
  "align-items": "center",
  "justify-content": "center",
  gap: "3px",
  padding: "12px 0",
};

function stepStyleFor(isActive: boolean): Record<string, string> {
  // Inline `display` MUST mirror the page-load state expected by the runtime
  // script: step 1 visible, every other step hidden. The editor-only
  // `.oxy-form-step-active` class overrides this in the canvas without
  // touching the export.
  return {
    ...STEP_BASE_STYLE,
    display: isActive ? "flex" : "none",
  };
}

const TITLE_STYLE: Record<string, string> = {
  background: "#ffffff",
  padding: "0.25rem 0.45rem",
  "min-width": "15rem",
  "text-align": "center",
  "border-radius": "0.375rem",
  "margin-bottom": "1rem",
};

const DIVIDER_STYLE: Record<string, string> = {
  "min-width": "15rem",
  height: "2px",
  background: "#000000",
};

const EMAIL_INPUT_STYLE: Record<string, string> = {
  "min-width": "15rem",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  "border-radius": "8px",
  "font-size": "1rem",
};

const CONSENT_ROW_STYLE: Record<string, string> = {
  display: "flex",
  "align-items": "flex-start",
  gap: "8px",
  "max-width": "22rem",
  "font-size": "0.875rem",
  "text-align": "left",
  cursor: "pointer",
};

const ROOT_STYLE: Record<string, string> = {
  width: "100%",
  display: "flex",
  "flex-direction": "column",
  "align-items": "center",
  gap: "16px",
  padding: "16px 0",
};

function makeOptionTreeNode(args: {
  display: string;
  value: string;
  url: string;
  moveToStep: number | "";
  stepType: string;
  totalSteps: number;
  buttonStyle: Record<string, string>;
}) {
  return {
    type: OPTION_TYPE,
    "opt-display": args.display,
    "opt-value": args.value,
    "opt-url": args.url,
    "opt-move-to-step": args.moveToStep,
    components: args.display,
    attributes: {
      type: "button",
      class: OPTION_CLASS,
      value: buildOptionValueJson({
        type: args.stepType,
        value: args.value,
        url: args.url,
        moveToStep: args.moveToStep,
        totalSteps: args.totalSteps,
      }),
    },
    style: args.buttonStyle,
  };
}

function makeStepTreeNode(args: {
  title: string;
  stepType: string;
  buttonColor: string;
  textColor: string;
  buttonPadding: number;
  buttonRadius: number;
  buttonSpacing: number;
  isFirst: boolean;
  isActive: boolean;
  options: ReadonlyArray<{
    display: string;
    value: string;
    url: string;
    moveToStep: number | "";
  }>;
  totalSteps: number;
}) {
  const btnStyle = buttonStyleObject({
    buttonColor: args.buttonColor,
    textColor: args.textColor,
    buttonPadding: args.buttonPadding,
    buttonRadius: args.buttonRadius,
  });
  const classes = [STEP_CLASS];
  if (args.isActive) classes.push(ACTIVE_STEP_CLASS);
  return {
    type: STEP_TYPE,
    "step-title": args.title,
    "step-type": args.stepType,
    "button-color": args.buttonColor,
    "text-color": args.textColor,
    "button-padding": args.buttonPadding,
    "button-radius": args.buttonRadius,
    "button-spacing": args.buttonSpacing,
    attributes: { class: classes.join(" ") },
    style: stepStyleFor(args.isFirst),
    components: [
      {
        tagName: "div",
        attributes: { class: TITLE_CLASS },
        components: args.title,
        style: {
          ...TITLE_STYLE,
          display: args.title ? "block" : "none",
        },
        selectable: false,
        hoverable: false,
        draggable: false,
        copyable: false,
        removable: false,
      },
      {
        tagName: "div",
        attributes: { class: DIVIDER_CLASS },
        style: DIVIDER_STYLE,
        selectable: false,
        hoverable: false,
        draggable: false,
        copyable: false,
        removable: false,
      },
      {
        tagName: "div",
        attributes: { class: BUTTONS_CLASS },
        style: buttonContainerStyle(args.buttonSpacing),
        selectable: false,
        hoverable: false,
        draggable: false,
        copyable: false,
        removable: false,
        components: args.options.map((opt) =>
          makeOptionTreeNode({
            ...opt,
            stepType: args.stepType,
            totalSteps: args.totalSteps,
            buttonStyle: btnStyle,
          }),
        ),
      },
    ],
  };
}

export function makeSubmitStepTreeNode(args: {
  title: string;
  emailPlaceholder: string;
  consentText: string;
  ctaText: string;
  buttonColor: string;
  textColor: string;
  buttonPadding: number;
  buttonRadius: number;
  isActive: boolean;
}) {
  const ctaStyle = buttonStyleObject({
    buttonColor: args.buttonColor,
    textColor: args.textColor,
    buttonPadding: args.buttonPadding,
    buttonRadius: args.buttonRadius,
  });
  const classes = [STEP_CLASS, SUBMIT_STEP_CLASS];
  if (args.isActive) classes.push(ACTIVE_STEP_CLASS);
  // Structure is protected, but every child stays selectable/hoverable so
  // the Style Manager can target it — same freedom as answer-step buttons.
  const structural = {
    draggable: false,
    copyable: false,
    removable: false,
  };
  // Text on these children is trait-driven (step-title / consent-text /
  // cta-text) — block inline editing so canvas text can't diverge.
  const traitText = { ...structural, editable: false };
  return {
    type: SUBMIT_STEP_TYPE,
    "step-title": args.title,
    "email-placeholder": args.emailPlaceholder,
    "consent-text": args.consentText,
    "cta-text": args.ctaText,
    "button-color": args.buttonColor,
    "text-color": args.textColor,
    "button-padding": args.buttonPadding,
    "button-radius": args.buttonRadius,
    attributes: { class: classes.join(" ") },
    // Submission step is never step 1 in practice, but mirror the same
    // inline-display invariant the runtime expects.
    style: stepStyleFor(args.isActive),
    components: [
      {
        tagName: "div",
        attributes: { class: TITLE_CLASS },
        components: args.title,
        style: { ...TITLE_STYLE, display: args.title ? "block" : "none" },
        ...traitText,
      },
      {
        tagName: "div",
        attributes: { class: DIVIDER_CLASS },
        style: DIVIDER_STYLE,
        ...structural,
      },
      {
        tagName: "input",
        void: true,
        attributes: {
          type: "email",
          required: "required",
          class: EMAIL_INPUT_CLASS,
          placeholder: args.emailPlaceholder,
        },
        style: EMAIL_INPUT_STYLE,
        ...structural,
      },
      {
        tagName: "label",
        attributes: { class: CONSENT_ROW_CLASS },
        style: CONSENT_ROW_STYLE,
        ...structural,
        components: [
          {
            tagName: "input",
            void: true,
            attributes: {
              type: "checkbox",
              required: "required",
              class: CONSENT_CHECKBOX_CLASS,
            },
            ...structural,
          },
          {
            tagName: "span",
            attributes: { class: CONSENT_TEXT_CLASS },
            components: args.consentText,
            ...traitText,
          },
        ],
      },
      {
        tagName: "button",
        attributes: { type: "button", class: SUBMIT_CTA_CLASS },
        components: args.ctaText,
        style: ctaStyle,
        ...traitText,
      },
    ],
  };
}

export function makeInputFieldTreeNode(args: {
  label: string;
  answerKey: string;
  fieldType: string;
  placeholder: string;
  required: boolean;
}) {
  const attrs: Record<string, string> = {
    type: htmlInputType(args.fieldType),
    class: INPUT_FIELD_CLASS,
    placeholder: args.placeholder,
    maxlength: INPUT_VALUE_MAXLENGTH,
    "aria-label": args.label,
    "data-oxy-answer-key": args.answerKey,
    "data-oxy-field-label": args.label,
    "data-oxy-field-type": args.fieldType,
  };
  if (args.required) attrs.required = "required";
  return {
    type: INPUT_FIELD_TYPE,
    tagName: "input",
    void: true,
    "field-label": args.label,
    "answer-key": args.answerKey,
    "field-type": args.fieldType,
    "field-placeholder": args.placeholder,
    "field-required": args.required,
    attributes: attrs,
    style: EMAIL_INPUT_STYLE,
    draggable: false,
    copyable: false,
  };
}

export function makeInputStepTreeNode(args: {
  title: string;
  ctaText: string;
  buttonColor: string;
  textColor: string;
  buttonPadding: number;
  buttonRadius: number;
  isActive: boolean;
  fields: ReadonlyArray<{
    label: string;
    answerKey: string;
    fieldType: string;
    placeholder: string;
    required: boolean;
  }>;
}) {
  const ctaStyle = buttonStyleObject({
    buttonColor: args.buttonColor,
    textColor: args.textColor,
    buttonPadding: args.buttonPadding,
    buttonRadius: args.buttonRadius,
  });
  const classes = [STEP_CLASS, INPUT_STEP_CLASS];
  if (args.isActive) classes.push(ACTIVE_STEP_CLASS);
  const structural = {
    draggable: false,
    copyable: false,
    removable: false,
  };
  const traitText = { ...structural, editable: false };
  return {
    type: INPUT_STEP_TYPE,
    "step-title": args.title,
    "cta-text": args.ctaText,
    "button-color": args.buttonColor,
    "text-color": args.textColor,
    "button-padding": args.buttonPadding,
    "button-radius": args.buttonRadius,
    attributes: { class: classes.join(" ") },
    style: stepStyleFor(args.isActive),
    components: [
      {
        tagName: "div",
        attributes: { class: TITLE_CLASS },
        components: args.title,
        style: { ...TITLE_STYLE, display: args.title ? "block" : "none" },
        ...traitText,
      },
      {
        tagName: "div",
        attributes: { class: DIVIDER_CLASS },
        style: DIVIDER_STYLE,
        ...structural,
      },
      ...args.fields.map((f) => makeInputFieldTreeNode(f)),
      {
        tagName: "button",
        attributes: { type: "button", class: INPUT_CONTINUE_CLASS },
        components: args.ctaText,
        style: ctaStyle,
        ...traitText,
      },
    ],
  };
}

export function makeDefaultRootTree() {
  const totalSteps = 4;
  const shared = {
    buttonColor: DEFAULT_BUTTON_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
    buttonPadding: DEFAULT_BUTTON_PADDING,
    buttonRadius: DEFAULT_BUTTON_RADIUS,
    buttonSpacing: DEFAULT_BUTTON_SPACING,
    totalSteps,
  };
  return {
    type: ROOT_TYPE,
    attributes: { class: MULTIPLE_FORM_MARKER_CLASS },
    style: ROOT_STYLE,
    "form-link": "",
    "active-step": 1,
    components: [
      makeStepTreeNode({
        ...shared,
        title: "I am a...",
        stepType: "gender",
        isFirst: true,
        isActive: true,
        options: [
          { display: "Male", value: "male", url: "", moveToStep: "" },
          { display: "Female", value: "female", url: "", moveToStep: "" },
        ],
      }),
      makeStepTreeNode({
        ...shared,
        title: "How old are you?",
        stepType: "age",
        isFirst: false,
        isActive: false,
        options: [
          { display: "18–24", value: "18-24", url: "", moveToStep: "" },
          { display: "25–34", value: "25-34", url: "", moveToStep: "" },
          { display: "35–44", value: "35-44", url: "", moveToStep: "" },
          { display: "45+", value: "45+", url: "", moveToStep: "" },
        ],
      }),
      makeStepTreeNode({
        ...shared,
        title: "What are you looking for?",
        stepType: "interests",
        isFirst: false,
        isActive: false,
        options: [
          { display: "Casual dating", value: "casual", url: "", moveToStep: "" },
          {
            display: "Serious relationship",
            value: "serious",
            url: "",
            moveToStep: "",
          },
          { display: "Chat & friends", value: "chat", url: "", moveToStep: "" },
        ],
      }),
      makeSubmitStepTreeNode({
        title: "Almost done!",
        emailPlaceholder: "Enter your email",
        consentText: DEFAULT_CONSENT_TEXT,
        ctaText: "Continue",
        buttonColor: DEFAULT_BUTTON_COLOR,
        textColor: DEFAULT_TEXT_COLOR,
        buttonPadding: DEFAULT_BUTTON_PADDING,
        buttonRadius: DEFAULT_BUTTON_RADIUS,
        isActive: false,
      }),
    ],
  };
}

type ComponentLike = Component & {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  components: (next?: unknown) => Component[] | Component;
  find: (selector: string) => Component[];
  parent: () => Component | undefined;
  append: (def: unknown, opts?: unknown) => Component[];
  remove: () => Component;
  addAttributes: (attrs: Record<string, string>) => Component;
  removeAttributes: (attrs: string[]) => Component;
  getAttributes: () => Record<string, string>;
  setStyle: (style: Record<string, string>) => Component;
  is: (type: string) => boolean;
  on: (events: string, cb: (...args: unknown[]) => void) => Component;
};

function asLike(c: Component): ComponentLike {
  return c as unknown as ComponentLike;
}

function findRoot(c: Component | undefined): Component | null {
  let cur: Component | undefined = c;
  while (cur) {
    if (asLike(cur).is(ROOT_TYPE)) return cur;
    cur = asLike(cur).parent();
  }
  return null;
}

function findAncestor(
  c: Component | undefined,
  type: string,
): Component | null {
  let cur: Component | undefined = c;
  while (cur) {
    if (asLike(cur).is(type)) return cur;
    cur = asLike(cur).parent();
  }
  return null;
}

function findStepAncestor(c: Component | undefined): Component | null {
  return (
    findAncestor(c, STEP_TYPE) ??
    findAncestor(c, INPUT_STEP_TYPE) ??
    findAncestor(c, SUBMIT_STEP_TYPE)
  );
}

function findFirstByClass(
  parent: Component,
  className: string,
): Component | null {
  const matches = asLike(parent).find(`.${className}`);
  return matches.length > 0 ? matches[0] : null;
}

function getStepsOf(root: Component): Component[] {
  return asLike(root).find(`.${STEP_CLASS}`);
}

function countAnswerSteps(root: Component): number {
  return getStepsOf(root).filter(
    (s) => !classListOf(s).includes(SUBMIT_STEP_CLASS),
  ).length;
}

/**
 * How many formAnswers keys this form can produce at submit time: one per
 * option (answer-button) step + one per input field. Conservative — two
 * fields sharing an answer key collapse into one submitted key, but
 * overcounting only makes the editor stricter, never the submit invalid.
 */
export function countAnswerKeySources(root: Component): number {
  const optionSteps = getStepsOf(root).filter((s) => {
    const classes = classListOf(s);
    return (
      !classes.includes(SUBMIT_STEP_CLASS) &&
      !classes.includes(INPUT_STEP_CLASS)
    );
  }).length;
  const inputFields = asLike(root).find(`.${INPUT_FIELD_CLASS}`).length;
  return optionSteps + inputFields;
}

function getButtonsContainer(step: Component): Component | null {
  return findFirstByClass(step, BUTTONS_CLASS);
}

function getOptionsOf(step: Component): Component[] {
  const container = getButtonsContainer(step);
  if (!container) return [];
  return asLike(container).find(`.${OPTION_CLASS}`);
}

function getStepType(step: Component): string {
  const t = asLike(step).get("step-type");
  return typeof t === "string" && t ? t : "value";
}

function classListOf(c: Component): string[] {
  const attrs = asLike(c).getAttributes();
  return String(attrs.class || "")
    .split(/\s+/)
    .filter(Boolean);
}

function setClassList(c: Component, classes: ReadonlyArray<string>): void {
  asLike(c).addAttributes({ class: classes.join(" ") });
}

/**
 * Renumber step IDs and restore the inline display invariant required by the
 * runtime script: step 1 = flex, every other step = none. This is called
 * after any structural change (add/remove/reorder).
 */
function renumberSteps(root: Component): void {
  const steps = getStepsOf(root);
  steps.forEach((step, idx) => {
    const i = idx + 1;
    asLike(step).addAttributes({ id: `form_step_${i}` });
    asLike(step).setStyle(stepStyleFor(i === 1));
  });
  steps.forEach((step) =>
    refreshOptionValueAttrs(step, steps.length, getStepType(step)),
  );
}

function refreshOptionValueAttrs(
  step: Component,
  totalSteps: number,
  stepType: string,
): void {
  const options = getOptionsOf(step);
  options.forEach((opt) => {
    const optLike = asLike(opt);
    const value = String(optLike.get("opt-value") ?? "");
    const url = String(optLike.get("opt-url") ?? "");
    const moveRaw = optLike.get("opt-move-to-step");
    const moveToStep =
      typeof moveRaw === "number"
        ? moveRaw
        : moveRaw === "" || moveRaw == null
          ? ""
          : Number(moveRaw);
    optLike.addAttributes({
      value: buildOptionValueJson({
        type: stepType,
        value,
        url,
        moveToStep:
          typeof moveToStep === "number" && !Number.isNaN(moveToStep)
            ? moveToStep
            : "",
        totalSteps,
      }),
    });
  });
}

function applyStepButtonStyling(step: Component): void {
  const stepLike = asLike(step);
  const buttonColor = String(
    stepLike.get("button-color") ?? DEFAULT_BUTTON_COLOR,
  );
  const textColor = String(stepLike.get("text-color") ?? DEFAULT_TEXT_COLOR);
  const buttonPadding = Number(
    stepLike.get("button-padding") ?? DEFAULT_BUTTON_PADDING,
  );
  const buttonRadius = Number(
    stepLike.get("button-radius") ?? DEFAULT_BUTTON_RADIUS,
  );
  const style = buttonStyleObject({
    buttonColor,
    textColor,
    buttonPadding: Number.isFinite(buttonPadding)
      ? buttonPadding
      : DEFAULT_BUTTON_PADDING,
    buttonRadius: Number.isFinite(buttonRadius)
      ? buttonRadius
      : DEFAULT_BUTTON_RADIUS,
  });
  getOptionsOf(step).forEach((opt) => {
    asLike(opt).setStyle(style);
  });
}

function applyStepSpacing(step: Component): void {
  const spacingRaw = asLike(step).get("button-spacing");
  const spacing = Number(spacingRaw ?? DEFAULT_BUTTON_SPACING);
  const container = getButtonsContainer(step);
  if (!container) return;
  asLike(container).setStyle(
    buttonContainerStyle(
      Number.isFinite(spacing) ? spacing : DEFAULT_BUTTON_SPACING,
    ),
  );
}

function applyStepTitle(step: Component): void {
  const title = String(asLike(step).get("step-title") ?? "");
  const titleEl = findFirstByClass(step, TITLE_CLASS);
  if (!titleEl) return;
  asLike(titleEl).components(title);
  asLike(titleEl).setStyle({
    ...TITLE_STYLE,
    display: title ? "block" : "none",
  });
}

function applyOptionFields(opt: Component): void {
  const optLike = asLike(opt);
  const display = String(optLike.get("opt-display") ?? "");
  optLike.components(display);

  const step = findAncestor(opt, STEP_TYPE);
  if (!step) return;
  const root = findRoot(step);
  const totalSteps = root ? getStepsOf(root).length : 1;
  refreshOptionValueAttrs(step, totalSteps, getStepType(step));
}

/**
 * Sync the submission step's text content + text data attrs from its props.
 * Data attrs make HTML round-trips hydrate fully (same pattern as the
 * answer steps' isComponent readers). Styling is deliberately NOT touched
 * here — custom Style Manager designs must survive editor loads.
 */
export function applySubmitStepFields(step: Component): void {
  const stepLike = asLike(step);
  const placeholder = String(stepLike.get("email-placeholder") ?? "");
  const consentText = String(
    stepLike.get("consent-text") ?? DEFAULT_CONSENT_TEXT,
  );
  const ctaText = String(stepLike.get("cta-text") ?? "Continue");

  const emailInput = findFirstByClass(step, EMAIL_INPUT_CLASS);
  if (emailInput) {
    asLike(emailInput).addAttributes({ placeholder });
  }
  const consentSpan = findFirstByClass(step, CONSENT_TEXT_CLASS);
  if (consentSpan) {
    asLike(consentSpan).components(consentText);
  }
  const cta = findFirstByClass(step, SUBMIT_CTA_CLASS);
  if (cta) {
    asLike(cta).components(ctaText);
  }
  stepLike.addAttributes({
    "data-oxy-step-title": String(stepLike.get("step-title") ?? ""),
    "data-oxy-email-placeholder": placeholder,
    "data-oxy-consent-text": consentText,
    "data-oxy-cta-text": ctaText,
  });
}

/**
 * Stamp the 4 style-trait data attrs (hydration) and return the resolved
 * values. Split from the CTA setStyle so init() can stamp attrs without
 * overwriting custom styles.
 */
function stampSubmitStepStyleAttrs(step: Component): {
  buttonColor: string;
  textColor: string;
  buttonPadding: number;
  buttonRadius: number;
} {
  const stepLike = asLike(step);
  const buttonColor = String(
    stepLike.get("button-color") ?? DEFAULT_BUTTON_COLOR,
  );
  const textColor = String(stepLike.get("text-color") ?? DEFAULT_TEXT_COLOR);
  const paddingRaw = Number(
    stepLike.get("button-padding") ?? DEFAULT_BUTTON_PADDING,
  );
  const radiusRaw = Number(
    stepLike.get("button-radius") ?? DEFAULT_BUTTON_RADIUS,
  );
  const buttonPadding = Number.isFinite(paddingRaw)
    ? paddingRaw
    : DEFAULT_BUTTON_PADDING;
  const buttonRadius = Number.isFinite(radiusRaw)
    ? radiusRaw
    : DEFAULT_BUTTON_RADIUS;

  stepLike.addAttributes({
    "data-oxy-button-color": buttonColor,
    "data-oxy-text-color": textColor,
    "data-oxy-button-padding": String(buttonPadding),
    "data-oxy-button-radius": String(buttonRadius),
  });
  return { buttonColor, textColor, buttonPadding, buttonRadius };
}

/**
 * Apply the 4 style traits to the CTA. Bound ONLY to style-trait changes —
 * never called on load — mirroring the answer steps' change-only
 * applyStepButtonStyling. Overwrites the CTA's styled props by design.
 */
export function applySubmitStepButtonStyling(step: Component): void {
  const styleProps = stampSubmitStepStyleAttrs(step);
  const cta = findFirstByClass(step, SUBMIT_CTA_CLASS);
  if (cta) {
    asLike(cta).setStyle(buttonStyleObject(styleProps));
  }
}

/**
 * Sync an input field's element attributes from its trait props. `required`
 * must be REMOVED (not set falsy) when toggled off — browsers treat any
 * present `required` attribute as true.
 */
export function applyInputFieldAttrs(field: Component): void {
  const f = asLike(field);
  const label = String(f.get("field-label") ?? "");
  const answerKey = String(f.get("answer-key") ?? "");
  const fieldType = String(f.get("field-type") ?? "text");
  const placeholder = String(f.get("field-placeholder") ?? "");
  const required = Boolean(f.get("field-required"));
  f.addAttributes({
    type: htmlInputType(fieldType),
    placeholder,
    maxlength: INPUT_VALUE_MAXLENGTH,
    "aria-label": label,
    "data-oxy-answer-key": answerKey,
    "data-oxy-field-label": label,
    "data-oxy-field-type": fieldType,
  });
  if (required) {
    f.addAttributes({ required: "required" });
  } else {
    f.removeAttributes(["required"]);
  }
}

/** Sync the input step's Continue text + hydration data attrs. */
export function applyInputStepCta(step: Component): void {
  const s = asLike(step);
  const ctaText = String(s.get("cta-text") ?? "Continue");
  const cta = findFirstByClass(step, INPUT_CONTINUE_CLASS);
  if (cta) asLike(cta).components(ctaText);
  s.addAttributes({
    "data-oxy-step-title": String(s.get("step-title") ?? ""),
    "data-oxy-cta-text": ctaText,
  });
}

/** Style the Continue button from the step's 4 style traits (change-only). */
function applyInputStepButtonStyling(step: Component): void {
  const styleProps = stampSubmitStepStyleAttrs(step);
  const cta = findFirstByClass(step, INPUT_CONTINUE_CLASS);
  if (cta) asLike(cta).setStyle(buttonStyleObject(styleProps));
}

const SUBMIT_TRAIT_TEXT_CLASSES: ReadonlyArray<string> = [
  TITLE_CLASS,
  CONSENT_TEXT_CLASS,
  SUBMIT_CTA_CLASS,
];

const SUBMIT_CHILD_CLASSES: ReadonlyArray<string> = [
  TITLE_CLASS,
  DIVIDER_CLASS,
  EMAIL_INPUT_CLASS,
  CONSENT_ROW_CLASS,
  CONSENT_CHECKBOX_CLASS,
  CONSENT_TEXT_CLASS,
  SUBMIT_CTA_CLASS,
];

/**
 * Pages saved before the submit step was unlocked persist
 * `selectable:false` / `hoverable:false` on its children in the stored
 * project JSON. Re-enable selection (Style Manager access) while
 * re-asserting the structural locks. Idempotent — runs on every load.
 */
export function normalizeSubmitStepChildren(step: Component): void {
  for (const cls of SUBMIT_CHILD_CLASSES) {
    const el = findFirstByClass(step, cls);
    if (!el) continue;
    const like = asLike(el);
    like.set("selectable", true);
    like.set("hoverable", true);
    like.set("draggable", false);
    like.set("copyable", false);
    like.set("removable", false);
    if (SUBMIT_TRAIT_TEXT_CLASSES.includes(cls)) {
      like.set("editable", false);
    }
  }
}

function applyRootLink(root: Component): void {
  const link = String(asLike(root).get("form-link") ?? "");
  asLike(root).addAttributes({ "data-oxy-form-link": link });
}

/**
 * Add `oxy-form-step-active` to the step matching the root's `active-step`
 * index; remove it from the others. Inline display styles are NOT touched —
 * they reflect the export-time state (step 1 visible, others hidden) and are
 * overridden by the canvas-only CSS for the editor view.
 */
function applyActiveStep(root: Component): void {
  const steps = getStepsOf(root);
  if (steps.length === 0) return;
  const raw = asLike(root).get("active-step");
  let activeIdx = Math.floor(Number(raw) || 1);
  if (!Number.isFinite(activeIdx) || activeIdx < 1) activeIdx = 1;
  if (activeIdx > steps.length) activeIdx = steps.length;
  steps.forEach((step, idx) => {
    const i = idx + 1;
    const classes = classListOf(step).filter((c) => c !== ACTIVE_STEP_CLASS);
    if (i === activeIdx) classes.push(ACTIVE_STEP_CLASS);
    setClassList(step, classes);
  });
}

function stepIndexInRoot(root: Component, step: Component): number {
  const steps = getStepsOf(root);
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === step) return i + 1;
  }
  return 0;
}

function defineCommands(editor: GrapesEditor): void {
  editor.Commands.add(CMD_ADD_STEP, {
    run(ed) {
      const selected = ed.getSelected();
      const root =
        findRoot(selected) ||
        (selected && asLike(selected).is(ROOT_TYPE) ? selected : null);
      if (!root) return;
      const steps = getStepsOf(root);
      const submitSteps = asLike(root).find(`.${SUBMIT_STEP_CLASS}`);
      const answerCount = steps.length - submitSteps.length;
      if (isAnswerStepCapReached(answerCount)) return; // submit step is extra
      // A new option step records one more formAnswers key at submit time.
      if (isAnswerKeyCapReached(countAnswerKeySources(root))) return;
      const totalAfter = steps.length + 1;
      const answerSteps = steps.filter(
        (s) => !asLike(s).is(SUBMIT_STEP_TYPE),
      );
      const newStep = makeStepTreeNode({
        title: `Step ${answerCount + 1}`,
        stepType: getStepType(answerSteps[0] ?? root),
        buttonColor: DEFAULT_BUTTON_COLOR,
        textColor: DEFAULT_TEXT_COLOR,
        buttonPadding: DEFAULT_BUTTON_PADDING,
        buttonRadius: DEFAULT_BUTTON_RADIUS,
        buttonSpacing: DEFAULT_BUTTON_SPACING,
        totalSteps: totalAfter,
        isFirst: false,
        isActive: false,
        options: [{ display: "Option A", value: "a", url: "", moveToStep: "" }],
      });
      // New answer steps always go BEFORE the submission step.
      asLike(root).append(newStep, { at: answerCount });
      renumberSteps(root);
      asLike(root).set("active-step", answerCount + 1);
      applyActiveStep(root);
    },
  });

  editor.Commands.add(CMD_ADD_INPUT_STEP, {
    run(ed) {
      const selected = ed.getSelected();
      const root =
        findRoot(selected) ||
        (selected && asLike(selected).is(ROOT_TYPE) ? selected : null);
      if (!root) return;
      const steps = getStepsOf(root);
      const submitSteps = asLike(root).find(`.${SUBMIT_STEP_CLASS}`);
      const answerCount = steps.length - submitSteps.length;
      if (isAnswerStepCapReached(answerCount)) return; // submit step is extra
      // The new step's default field records one more formAnswers key.
      if (isAnswerKeyCapReached(countAnswerKeySources(root))) return;
      const newStep = makeInputStepTreeNode({
        title: `Step ${answerCount + 1}`,
        ctaText: "Continue",
        buttonColor: DEFAULT_BUTTON_COLOR,
        textColor: DEFAULT_TEXT_COLOR,
        buttonPadding: DEFAULT_BUTTON_PADDING,
        buttonRadius: DEFAULT_BUTTON_RADIUS,
        isActive: false,
        fields: [
          {
            label: "Answer",
            answerKey: "",
            fieldType: "text",
            placeholder: "Type here…",
            required: true,
          },
        ],
      });
      // Input steps go BEFORE the submission step, like answer steps.
      asLike(root).append(newStep, { at: answerCount });
      renumberSteps(root);
      asLike(root).set("active-step", answerCount + 1);
      applyActiveStep(root);
    },
  });

  editor.Commands.add(CMD_ADD_INPUT_FIELD, {
    run(ed) {
      const selected = ed.getSelected();
      const step = findAncestor(selected, INPUT_STEP_TYPE);
      if (!step) return;
      const root = findRoot(step);
      if (root && isAnswerKeyCapReached(countAnswerKeySources(root))) return;
      const children = asLike(step).components() as unknown as Component[];
      // Keep the Continue button last: insert new fields just before it.
      const at = Math.max(0, children.length - 1);
      asLike(step).append(
        makeInputFieldTreeNode({
          label: "Answer",
          answerKey: "",
          fieldType: "text",
          placeholder: "Type here…",
          required: false,
        }),
        { at },
      );
    },
  });

  editor.Commands.add(CMD_REMOVE_INPUT_FIELD, {
    run(ed) {
      const selected = ed.getSelected();
      const field = findAncestor(selected, INPUT_FIELD_TYPE);
      if (!field) return;
      const step = findAncestor(field, INPUT_STEP_TYPE);
      if (!step) return;
      if (asLike(step).find(`.${INPUT_FIELD_CLASS}`).length <= 1) return;
      asLike(field).remove();
      ed.select(step);
    },
  });

  editor.Commands.add(CMD_REMOVE_STEP, {
    run(ed) {
      const selected = ed.getSelected();
      const step = findStepAncestor(selected);
      if (!step) return;
      if (asLike(step).is(SUBMIT_STEP_TYPE)) return; // submit step is fixed
      const root = findRoot(step);
      if (!root) return;
      const answerStepCount = getStepsOf(root).filter(
        (s) => !asLike(s).is(SUBMIT_STEP_TYPE),
      ).length;
      if (answerStepCount <= 1) {
        // Keep at least one answer step.
        return;
      }
      const removedIdx = stepIndexInRoot(root, step);
      asLike(step).remove();
      renumberSteps(root);
      const remaining = getStepsOf(root).length;
      const nextActive = Math.max(1, Math.min(remaining, removedIdx || 1));
      asLike(root).set("active-step", nextActive);
      applyActiveStep(root);
      ed.select(root);
    },
  });

  editor.Commands.add(CMD_ADD_OPTION, {
    run(ed) {
      const selected = ed.getSelected();
      const step = findAncestor(selected, STEP_TYPE);
      if (!step) return;
      const stepLike = asLike(step);
      const buttonColor = String(
        stepLike.get("button-color") ?? DEFAULT_BUTTON_COLOR,
      );
      const textColor = String(
        stepLike.get("text-color") ?? DEFAULT_TEXT_COLOR,
      );
      const buttonPadding = Number(
        stepLike.get("button-padding") ?? DEFAULT_BUTTON_PADDING,
      );
      const buttonRadius = Number(
        stepLike.get("button-radius") ?? DEFAULT_BUTTON_RADIUS,
      );
      const stepType = getStepType(step);
      const container = getButtonsContainer(step);
      if (!container) return;
      const root = findRoot(step);
      const totalSteps = root ? getStepsOf(root).length : 1;
      const optsCount = getOptionsOf(step).length + 1;
      asLike(container).append(
        makeOptionTreeNode({
          display: `Option ${String.fromCharCode(64 + Math.min(optsCount, 26))}`,
          value: "",
          url: "",
          moveToStep: "",
          stepType,
          totalSteps,
          buttonStyle: buttonStyleObject({
            buttonColor,
            textColor,
            buttonPadding: Number.isFinite(buttonPadding)
              ? buttonPadding
              : DEFAULT_BUTTON_PADDING,
            buttonRadius: Number.isFinite(buttonRadius)
              ? buttonRadius
              : DEFAULT_BUTTON_RADIUS,
          }),
        }),
      );
    },
  });

  editor.Commands.add(CMD_REMOVE_OPTION, {
    run(ed) {
      const selected = ed.getSelected();
      const opt = findAncestor(selected, OPTION_TYPE);
      if (!opt) return;
      const step = findAncestor(opt, STEP_TYPE);
      if (!step) return;
      if (getOptionsOf(step).length <= 1) return;
      asLike(opt).remove();
      const root = findRoot(step);
      if (root) {
        refreshOptionValueAttrs(
          step,
          getStepsOf(root).length,
          getStepType(step),
        );
      }
      ed.select(step);
    },
  });
}

function defineComponentTypes(editor: GrapesEditor): void {
  const dom = editor.Components;

  dom.addType(ROOT_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(MULTIPLE_FORM_MARKER_CLASS)) return undefined;
      // Hydrate the form-link prop from the data attr so loaded designs
      // (Unlayer fixtures + HTML round-trips) recover the redirect URL.
      const formLink = el.getAttribute("data-oxy-form-link") ?? "";
      return { type: ROOT_TYPE, "form-link": formLink };
    },
    model: {
      defaults: {
        name: "Multi-step Form",
        droppable: false,
        copyable: false,
        "form-link": "",
        "active-step": 1,
        attributes: { class: MULTIPLE_FORM_MARKER_CLASS },
        traits: [
          {
            type: STEP_LIST_TRAIT_TYPE,
            name: "step-list",
            label: "Steps",
            full: true,
          },
          {
            type: "button",
            name: "add-step",
            labelButton: "+ Add Step",
            label: false,
            full: true,
            command: CMD_ADD_STEP,
          },
          {
            type: "button",
            name: "add-input-step",
            labelButton: "+ Add Input Step",
            label: false,
            full: true,
            command: CMD_ADD_INPUT_STEP,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on("change:form-link", () => applyRootLink(comp));
        comp.on("change:active-step", () => applyActiveStep(comp));
        // Initial sync — handles both block-drop and design-load.
        applyRootLink(comp);
        applyActiveStep(comp);
      },
    },
  });

  dom.addType(STEP_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (el.classList.contains(SUBMIT_STEP_CLASS)) return undefined;
      if (el.classList.contains(INPUT_STEP_CLASS)) return undefined;
      if (!el.classList.contains(STEP_CLASS)) return undefined;
      // Recover step props from data attrs so fixtures hydrate fully.
      const num = (key: string, fallback: number): number => {
        const raw = el.getAttribute(key);
        if (raw === null || raw === "") return fallback;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : fallback;
      };
      const str = (key: string, fallback: string): string => {
        const raw = el.getAttribute(key);
        return raw === null ? fallback : raw;
      };
      return {
        type: STEP_TYPE,
        "step-title": str("data-oxy-step-title", ""),
        "step-type": str("data-oxy-step-type", "answer"),
        "button-color": str("data-oxy-button-color", DEFAULT_BUTTON_COLOR),
        "text-color": str("data-oxy-text-color", DEFAULT_TEXT_COLOR),
        "button-padding": num(
          "data-oxy-button-padding",
          DEFAULT_BUTTON_PADDING,
        ),
        "button-radius": num("data-oxy-button-radius", DEFAULT_BUTTON_RADIUS),
        "button-spacing": num(
          "data-oxy-button-spacing",
          DEFAULT_BUTTON_SPACING,
        ),
      };
    },
    model: {
      defaults: {
        name: "Form Step",
        droppable: false,
        copyable: false,
        "step-title": "",
        "step-type": "answer",
        "button-color": DEFAULT_BUTTON_COLOR,
        "text-color": DEFAULT_TEXT_COLOR,
        "button-padding": DEFAULT_BUTTON_PADDING,
        "button-radius": DEFAULT_BUTTON_RADIUS,
        "button-spacing": DEFAULT_BUTTON_SPACING,
        attributes: { class: STEP_CLASS },
        traits: [
          {
            type: "text",
            name: "step-title",
            label: "Title",
            placeholder: "Shown above the buttons",
            changeProp: 1,
          },
          {
            type: "text",
            name: "step-type",
            label: "Answer key",
            placeholder: "e.g. age, color",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "button-color",
            label: "Button color",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "text-color",
            label: "Text color",
            changeProp: 1,
          },
          {
            type: "number",
            name: "button-padding",
            label: "Button padding (px)",
            min: 0,
            max: 80,
            changeProp: 1,
          },
          {
            type: "number",
            name: "button-radius",
            label: "Button radius (px)",
            min: 0,
            max: 80,
            changeProp: 1,
          },
          {
            type: "number",
            name: "button-spacing",
            label: "Spacing between buttons (px)",
            min: 0,
            max: 80,
            changeProp: 1,
          },
          {
            type: "button",
            name: "add-option",
            labelButton: "+ Add Option",
            label: false,
            full: true,
            command: CMD_ADD_OPTION,
          },
          {
            type: REMOVE_STEP_TRAIT_TYPE,
            name: "remove-step",
            label: false,
            full: true,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on("change:step-title", () => applyStepTitle(comp));
        comp.on(
          "change:button-color change:text-color change:button-padding change:button-radius",
          () => applyStepButtonStyling(comp),
        );
        comp.on("change:button-spacing", () => applyStepSpacing(comp));
        comp.on("change:step-type", () => {
          const root = findRoot(comp);
          const total = root ? getStepsOf(root).length : 1;
          refreshOptionValueAttrs(comp, total, getStepType(comp));
        });
      },
    },
  });

  dom.addType(SUBMIT_STEP_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(SUBMIT_STEP_CLASS)) return undefined;
      const str = (key: string, fallback: string): string => {
        const raw = el.getAttribute(key);
        return raw === null ? fallback : raw;
      };
      const num = (key: string, fallback: number): number => {
        const raw = el.getAttribute(key);
        if (raw === null || raw === "") return fallback;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : fallback;
      };
      return {
        type: SUBMIT_STEP_TYPE,
        "step-title": str("data-oxy-step-title", ""),
        "email-placeholder": str("data-oxy-email-placeholder", ""),
        "consent-text": str("data-oxy-consent-text", DEFAULT_CONSENT_TEXT),
        "cta-text": str("data-oxy-cta-text", "Continue"),
        "button-color": str("data-oxy-button-color", DEFAULT_BUTTON_COLOR),
        "text-color": str("data-oxy-text-color", DEFAULT_TEXT_COLOR),
        "button-padding": num(
          "data-oxy-button-padding",
          DEFAULT_BUTTON_PADDING,
        ),
        "button-radius": num("data-oxy-button-radius", DEFAULT_BUTTON_RADIUS),
      };
    },
    model: {
      defaults: {
        name: "Submission Step",
        // Authors may drop extra content here (e.g. a privacy-policy Link),
        // but never another form or a step: nested .form_step elements would
        // corrupt getStepsOf() renumbering and the runtime's step navigation.
        droppable: `:not(.${MULTIPLE_FORM_MARKER_CLASS}):not(.${STEP_CLASS})`,
        copyable: false,
        draggable: false,
        removable: false,
        "step-title": "Almost done!",
        "email-placeholder": "Enter your email",
        "consent-text": DEFAULT_CONSENT_TEXT,
        "cta-text": "Continue",
        "button-color": DEFAULT_BUTTON_COLOR,
        "text-color": DEFAULT_TEXT_COLOR,
        "button-padding": DEFAULT_BUTTON_PADDING,
        "button-radius": DEFAULT_BUTTON_RADIUS,
        attributes: { class: `${STEP_CLASS} ${SUBMIT_STEP_CLASS}` },
        traits: [
          {
            type: "text",
            name: "step-title",
            label: "Title",
            changeProp: 1,
          },
          {
            type: "text",
            name: "email-placeholder",
            label: "Email placeholder",
            changeProp: 1,
          },
          {
            type: "text",
            name: "consent-text",
            label: "Consent text",
            changeProp: 1,
          },
          {
            type: "text",
            name: "cta-text",
            label: "CTA button text",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "button-color",
            label: "Button color",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "text-color",
            label: "Text color",
            changeProp: 1,
          },
          {
            type: "number",
            name: "button-padding",
            label: "Button padding (px)",
            min: 0,
            max: 80,
            changeProp: 1,
          },
          {
            type: "number",
            name: "button-radius",
            label: "Button radius (px)",
            min: 0,
            max: 80,
            changeProp: 1,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on("change:step-title", () => applyStepTitle(comp));
        comp.on(
          "change:email-placeholder change:consent-text change:cta-text",
          () => applySubmitStepFields(comp),
        );
        comp.on(
          "change:button-color change:text-color change:button-padding change:button-radius",
          () => applySubmitStepButtonStyling(comp),
        );
        applySubmitStepFields(comp);
        stampSubmitStepStyleAttrs(comp);
        normalizeSubmitStepChildren(comp);
      },
    },
  });

  dom.addType(INPUT_STEP_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(INPUT_STEP_CLASS)) return undefined;
      const str = (key: string, fallback: string): string => {
        const raw = el.getAttribute(key);
        return raw === null ? fallback : raw;
      };
      const num = (key: string, fallback: number): number => {
        const raw = el.getAttribute(key);
        if (raw === null || raw === "") return fallback;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : fallback;
      };
      return {
        type: INPUT_STEP_TYPE,
        "step-title": str("data-oxy-step-title", ""),
        "cta-text": str("data-oxy-cta-text", "Continue"),
        "button-color": str("data-oxy-button-color", DEFAULT_BUTTON_COLOR),
        "text-color": str("data-oxy-text-color", DEFAULT_TEXT_COLOR),
        "button-padding": num(
          "data-oxy-button-padding",
          DEFAULT_BUTTON_PADDING,
        ),
        "button-radius": num("data-oxy-button-radius", DEFAULT_BUTTON_RADIUS),
      };
    },
    model: {
      defaults: {
        name: "Input Step",
        droppable: false,
        copyable: false,
        "step-title": "",
        "cta-text": "Continue",
        "button-color": DEFAULT_BUTTON_COLOR,
        "text-color": DEFAULT_TEXT_COLOR,
        "button-padding": DEFAULT_BUTTON_PADDING,
        "button-radius": DEFAULT_BUTTON_RADIUS,
        attributes: { class: `${STEP_CLASS} ${INPUT_STEP_CLASS}` },
        traits: [
          { type: "text", name: "step-title", label: "Title", changeProp: 1 },
          {
            type: "text",
            name: "cta-text",
            label: "Continue button text",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "button-color",
            label: "Button color",
            changeProp: 1,
          },
          {
            type: "oxy-color",
            name: "text-color",
            label: "Text color",
            changeProp: 1,
          },
          {
            type: "number",
            name: "button-padding",
            label: "Button padding (px)",
            min: 0,
            max: 80,
            changeProp: 1,
          },
          {
            type: "number",
            name: "button-radius",
            label: "Button radius (px)",
            min: 0,
            max: 80,
            changeProp: 1,
          },
          {
            type: ADD_FIELD_TRAIT_TYPE,
            name: "add-field",
            label: false,
            full: true,
          },
          {
            type: REMOVE_STEP_TRAIT_TYPE,
            name: "remove-step",
            label: false,
            full: true,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on("change:step-title", () => {
          applyStepTitle(comp);
          applyInputStepCta(comp);
        });
        comp.on("change:cta-text", () => applyInputStepCta(comp));
        comp.on(
          "change:button-color change:text-color change:button-padding change:button-radius",
          () => applyInputStepButtonStyling(comp),
        );
        applyInputStepCta(comp);
        stampSubmitStepStyleAttrs(comp);
      },
    },
  });

  dom.addType(INPUT_FIELD_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(INPUT_FIELD_CLASS)) return undefined;
      const get = (key: string): string => el.getAttribute(key) ?? "";
      return {
        type: INPUT_FIELD_TYPE,
        "field-label": get("data-oxy-field-label"),
        "answer-key": get("data-oxy-answer-key"),
        "field-type": get("data-oxy-field-type") || "text",
        "field-placeholder": el.getAttribute("placeholder") ?? "",
        "field-required": el.hasAttribute("required"),
      };
    },
    model: {
      defaults: {
        name: "Input Field",
        tagName: "input",
        void: true,
        droppable: false,
        copyable: false,
        draggable: false,
        "field-label": "Answer",
        "answer-key": "",
        "field-type": "text",
        "field-placeholder": "",
        "field-required": false,
        attributes: { type: "text", class: INPUT_FIELD_CLASS },
        traits: [
          {
            type: "text",
            name: "field-label",
            label: "Label",
            changeProp: 1,
          },
          {
            type: "text",
            name: "answer-key",
            label: "Answer key",
            placeholder: "e.g. name, phone",
            changeProp: 1,
          },
          {
            type: "select",
            name: "field-type",
            label: "Input type",
            options: [
              { id: "text", label: "Text" },
              { id: "number", label: "Number" },
              { id: "phone", label: "Phone" },
              { id: "date", label: "Date" },
            ],
            changeProp: 1,
          },
          {
            type: "text",
            name: "field-placeholder",
            label: "Placeholder",
            changeProp: 1,
          },
          {
            type: "checkbox",
            name: "field-required",
            label: "Required",
            changeProp: 1,
          },
          {
            type: REMOVE_FIELD_TRAIT_TYPE,
            name: "remove-field",
            label: false,
            full: true,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on(
          "change:field-label change:answer-key change:field-type change:field-placeholder change:field-required",
          () => applyInputFieldAttrs(comp),
        );
      },
    },
  });

  dom.addType(OPTION_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(OPTION_CLASS)) return undefined;
      // Recover option props from data attrs. opt-move-to-step is stored as
      // a string in the DOM but treated as a number by the trait — leave it
      // as-is, the trait's number input coerces on edit.
      const get = (key: string): string => el.getAttribute(key) ?? "";
      const moveRaw = el.getAttribute("data-oxy-move-to-step") ?? "";
      const moveParsed = moveRaw === "" ? "" : Number(moveRaw);
      return {
        type: OPTION_TYPE,
        "opt-display": get("data-oxy-display"),
        "opt-value": get("data-oxy-value"),
        "opt-url": get("data-oxy-url"),
        "opt-move-to-step":
          typeof moveParsed === "number" && Number.isFinite(moveParsed)
            ? moveParsed
            : "",
      };
    },
    model: {
      defaults: {
        name: "Option Button",
        tagName: "button",
        droppable: false,
        copyable: false,
        "opt-display": "Option",
        "opt-value": "",
        "opt-url": "",
        "opt-move-to-step": "",
        attributes: { type: "button", class: OPTION_CLASS },
        traits: [
          {
            type: "text",
            name: "opt-display",
            label: "Button text",
            changeProp: 1,
          },
          {
            type: "text",
            name: "opt-value",
            label: "Answer value",
            placeholder: "Submitted as the answer",
            changeProp: 1,
          },
          {
            type: "text",
            name: "opt-url",
            label: "Open link (optional)",
            placeholder: "https://...",
            changeProp: 1,
          },
          {
            type: "number",
            name: "opt-move-to-step",
            label: "Go to step #",
            placeholder: "Leave blank for next step",
            min: 1,
            changeProp: 1,
          },
          {
            type: "button",
            name: "remove-option",
            labelButton: "× Remove Option",
            label: false,
            full: true,
            command: CMD_REMOVE_OPTION,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on(
          "change:opt-display change:opt-value change:opt-url change:opt-move-to-step",
          () => applyOptionFields(comp),
        );
      },
    },
  });
}

/**
 * Custom trait type rendering a clickable list of the form's steps. Lives on
 * the root component's Properties panel — clicking a step makes it the
 * active one in the canvas.
 */
function defineStepListTrait(editor: GrapesEditor): void {
  type CreateInputArgs = {
    trait: unknown;
    component: Component;
  };

  const def = {
    noLabel: false,
    createInput(args: CreateInputArgs) {
      const component = args.component;
      const wrapper = document.createElement("div");
      wrapper.className = "oxy-mf-step-list";

      const render = () => {
        // The component may have been detached between async events.
        if (!component) return;
        const steps = getStepsOf(component);
        const raw = asLike(component).get("active-step");
        const activeIdx = Math.max(1, Math.floor(Number(raw) || 1));
        wrapper.innerHTML = "";
        if (steps.length === 0) {
          const empty = document.createElement("div");
          empty.className = "oxy-mf-step-list__empty";
          empty.textContent = "No steps yet.";
          wrapper.appendChild(empty);
          return;
        }
        steps.forEach((step, idx) => {
          const i = idx + 1;
          const titleRaw = asLike(step).get("step-title");
          const title =
            typeof titleRaw === "string" && titleRaw.trim()
              ? titleRaw.trim()
              : "(untitled)";
          const item = document.createElement("button");
          item.type = "button";
          item.className =
            "oxy-mf-step-list__item" + (i === activeIdx ? " is-active" : "");
          item.innerHTML = `<span class="oxy-mf-step-list__num">${i}</span><span class="oxy-mf-step-list__label">${escapeAttr(
            title,
          )}</span>`;
          item.addEventListener("click", (e) => {
            e.preventDefault();
            asLike(component).set("active-step", i);
            editor.select(step);
          });
          wrapper.appendChild(item);
        });

        // Always show how close the form is to the answer-step cap so the
        // author knows why "+ Add Step" stops working at the limit.
        const answerCount = countAnswerSteps(component);
        const counter = document.createElement("div");
        counter.className =
          "oxy-mf-step-list__count" +
          (isAnswerStepCapReached(answerCount) ? " is-limit" : "");
        counter.textContent = stepListCounterText(answerCount);
        wrapper.appendChild(counter);
      };

      render();

      const editorAny = editor as unknown as {
        on: (event: string, cb: (...args: unknown[]) => void) => void;
      };
      // Refresh on any signal that may change list length, ordering, titles,
      // or active selection. Editor-level events fire across all components,
      // so we filter to children of this root before re-rendering.
      const onChild = (changed: unknown) => {
        const c = changed as Component | undefined;
        if (!c) {
          render();
          return;
        }
        if (findRoot(c) === component) render();
      };
      // A removed component is already detached, so findRoot can't attribute
      // it to this form — always re-render (the list is tiny, this is cheap).
      const onRemove = () => render();
      editorAny.on("component:add", onChild);
      editorAny.on("component:remove", onRemove);
      editorAny.on("component:update:step-title", onChild);
      editorAny.on("component:update:active-step", onChild);

      return wrapper;
    },
  };

  // GrapesJS' TraitManager.addType expects a TraitView-like object; the type
  // surface varies across versions, so we coerce.
  const tm = editor.TraitManager as unknown as {
    addType: (name: string, def: unknown) => void;
  };
  tm.addType(STEP_LIST_TRAIT_TYPE, def);
}

/**
 * Custom trait for the "× Remove Step" action. Unlike the stock button
 * trait, it disables itself and explains WHY when removal is blocked (only
 * one answer step left), instead of silently doing nothing.
 */
function defineRemoveStepTrait(editor: GrapesEditor): void {
  type CreateInputArgs = {
    trait: unknown;
    component: Component;
  };

  const def = {
    noLabel: true,
    createInput(args: CreateInputArgs) {
      const component = args.component;
      const wrapper = document.createElement("div");
      wrapper.className = "oxy-mf-remove-step";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "oxy-mf-remove-step__btn";
      btn.textContent = "× Remove Step";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        editor.runCommand(CMD_REMOVE_STEP);
      });

      const hint = document.createElement("div");
      hint.className = "oxy-mf-remove-step__hint";
      hint.textContent = LAST_STEP_HINT;

      const render = () => {
        const root = findRoot(component);
        const blocked = !root || countAnswerSteps(root) <= 1;
        btn.disabled = blocked;
        hint.style.display = blocked ? "" : "none";
      };
      render();

      const editorAny = editor as unknown as {
        on: (event: string, cb: (...args: unknown[]) => void) => void;
      };
      // Step count can change while this panel stays mounted (e.g. "+ Add
      // Step" on the root, or deleting steps from the layers panel).
      editorAny.on("component:add", render);
      editorAny.on("component:remove", render);

      wrapper.appendChild(btn);
      wrapper.appendChild(hint);
      return wrapper;
    },
  };

  const tm = editor.TraitManager as unknown as {
    addType: (name: string, def: unknown) => void;
  };
  tm.addType(REMOVE_STEP_TRAIT_TYPE, def);
}

/**
 * "+ Add Field" trait for input steps — disables itself with an explanation
 * when the form has hit the server's answer-key budget (MAX_ANSWER_KEYS),
 * instead of silently doing nothing.
 */
function defineAddFieldTrait(editor: GrapesEditor): void {
  type CreateInputArgs = {
    trait: unknown;
    component: Component;
  };

  const def = {
    noLabel: true,
    createInput(args: CreateInputArgs) {
      const component = args.component;
      const wrapper = document.createElement("div");
      wrapper.className = "oxy-mf-add-field";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "oxy-mf-add-field__btn";
      btn.textContent = "+ Add Field";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        editor.runCommand(CMD_ADD_INPUT_FIELD);
      });

      const hint = document.createElement("div");
      hint.className = "oxy-mf-add-field__hint";
      hint.textContent = FIELD_CAP_HINT;

      const render = () => {
        const root = findRoot(component);
        const blocked =
          !root || isAnswerKeyCapReached(countAnswerKeySources(root));
        btn.disabled = blocked;
        hint.style.display = blocked ? "" : "none";
      };
      render();

      const editorAny = editor as unknown as {
        on: (event: string, cb: (...args: unknown[]) => void) => void;
      };
      editorAny.on("component:add", render);
      editorAny.on("component:remove", render);

      wrapper.appendChild(btn);
      wrapper.appendChild(hint);
      return wrapper;
    },
  };

  const tm = editor.TraitManager as unknown as {
    addType: (name: string, def: unknown) => void;
  };
  tm.addType(ADD_FIELD_TRAIT_TYPE, def);
}

/**
 * "× Remove Field" trait for input fields — disables itself with an
 * explanation when the field is the step's last one. Mirrors
 * defineRemoveStepTrait, including its CSS classes.
 */
function defineRemoveFieldTrait(editor: GrapesEditor): void {
  type CreateInputArgs = {
    trait: unknown;
    component: Component;
  };

  const def = {
    noLabel: true,
    createInput(args: CreateInputArgs) {
      const component = args.component;
      const wrapper = document.createElement("div");
      wrapper.className = "oxy-mf-remove-step";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "oxy-mf-remove-step__btn";
      btn.textContent = "× Remove Field";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        editor.runCommand(CMD_REMOVE_INPUT_FIELD);
      });

      const hint = document.createElement("div");
      hint.className = "oxy-mf-remove-step__hint";
      hint.textContent = LAST_FIELD_HINT;

      const render = () => {
        const step = findAncestor(component, INPUT_STEP_TYPE);
        const blocked =
          !step || asLike(step).find(`.${INPUT_FIELD_CLASS}`).length <= 1;
        btn.disabled = blocked;
        hint.style.display = blocked ? "" : "none";
      };
      render();

      const editorAny = editor as unknown as {
        on: (event: string, cb: (...args: unknown[]) => void) => void;
      };
      editorAny.on("component:add", render);
      editorAny.on("component:remove", render);

      wrapper.appendChild(btn);
      wrapper.appendChild(hint);
      return wrapper;
    },
  };

  const tm = editor.TraitManager as unknown as {
    addType: (name: string, def: unknown) => void;
  };
  tm.addType(REMOVE_FIELD_TRAIT_TYPE, def);
}

/**
 * Inject canvas-only CSS so non-active steps are hidden in the editor view.
 * The CSS lives only in the canvas iframe, never in `getCss()`, so it doesn't
 * leak into the export.
 */
function injectCanvasStyles(editor: GrapesEditor): void {
  const inject = () => {
    const canvas = editor.Canvas as unknown as {
      getDocument?: () => Document | null;
    };
    const doc = canvas.getDocument ? canvas.getDocument() : null;
    if (!doc || !doc.head) return;
    if (doc.getElementById("oxy-mf-canvas-style")) return;
    const style = doc.createElement("style");
    style.id = "oxy-mf-canvas-style";
    style.textContent = CANVAS_STYLES;
    doc.head.appendChild(style);
  };
  // Canvas may already be ready (re-mount) or load later.
  inject();
  editor.on("load", inject);
}

/**
 * Keep every multi-form consistent when a step is removed through ANY path —
 * the "× Remove Step" trait button, the layers panel, or the Delete key.
 * The removed component is already detached when `component:remove` fires,
 * so its root can't be reached from it; instead resync every form root in
 * the document (renumber ids, restore the display invariant, clamp the
 * active step). Idempotent, so double-running after CMD_REMOVE_STEP is fine.
 */
function wireStepRemovalSync(editor: GrapesEditor): void {
  (
    editor as unknown as {
      on: (event: string, cb: (...args: unknown[]) => void) => void;
    }
  ).on("component:remove", (...args: unknown[]) => {
    const removed = args[0] as Component | undefined;
    if (!removed || !classListOf(removed).includes(STEP_CLASS)) return;
    const wrapper = editor.getWrapper();
    if (!wrapper) return;
    const roots = asLike(wrapper as unknown as Component).find(
      `.${MULTIPLE_FORM_MARKER_CLASS}`,
    );
    roots.forEach((root) => {
      renumberSteps(root);
      const steps = getStepsOf(root);
      const raw = Math.floor(
        Number(asLike(root).get("active-step") ?? 1) || 1,
      );
      const clamped = Math.max(1, Math.min(steps.length || 1, raw));
      if (clamped !== raw) {
        asLike(root).set("active-step", clamped);
      }
      applyActiveStep(root);
    });
  });
}

/**
 * Wire `component:selected` so picking any descendant of a step in the
 * canvas (or layers panel) makes that step the active one — keeps the
 * editor visually consistent with what the user is editing.
 */
function wireActiveStepFollowsSelection(editor: GrapesEditor): void {
  (
    editor as unknown as {
      on: (event: string, cb: (...args: unknown[]) => void) => void;
    }
  ).on("component:selected", (...args: unknown[]) => {
    const selected = args[0] as Component | undefined;
    if (!selected) return;
    const step = findStepAncestor(selected);
    if (!step) return;
    const root = findRoot(step);
    if (!root) return;
    const idx = stepIndexInRoot(root, step);
    if (idx <= 0) return;
    const current = Number(asLike(root).get("active-step") ?? 1);
    if (current !== idx) {
      asLike(root).set("active-step", idx);
    }
  });
}

/**
 * Registers the "Multiple Form" block in GrapesJS' BlockManager. Dropping it
 * builds a typed component tree (root → step → option buttons) so each piece
 * is individually selectable with its own trait panel.
 */
export function registerMultipleFormBlock(
  grapes: GrapesEditor,
  opts: { blockCategory: string; icon: string },
): void {
  defineCommands(grapes);
  defineComponentTypes(grapes);
  defineStepListTrait(grapes);
  defineRemoveStepTrait(grapes);
  defineRemoveFieldTrait(grapes);
  defineAddFieldTrait(grapes);
  injectCanvasStyles(grapes);
  wireActiveStepFollowsSelection(grapes);
  wireStepRemovalSync(grapes);

  grapes.BlockManager.add("oxy-multiple-form", {
    label: "Multiple Form",
    category: opts.blockCategory,
    media: opts.icon,
    content: makeDefaultRootTree(),
  });
}

/**
 * Wraps an HTML export so it includes the runtime navigation script when at
 * least one multi-form block is present. Also injects the
 * `<script class="script_multiple_form">` element the runtime reads for the
 * final redirect URL.
 *
 * Idempotent: safe to call repeatedly; returns input unchanged when no marker
 * is present or tags already exist.
 */
export function appendMultipleFormRuntime(html: string): string {
  if (!html.includes(MULTIPLE_FORM_MARKER_CLASS)) return html;

  let result = html;

  // The runtime script reads the final redirect URL from a script tag with
  // class `script_multiple_form`, not from the form root's data-attr.
  if (
    !new RegExp(`class="[^"]*\\b${RUNTIME_LINK_CLASS}\\b[^"]*"`).test(result)
  ) {
    const linkMatch = result.match(/data-oxy-form-link="([^"]*)"/);
    const link = linkMatch ? unescapeAttr(linkMatch[1]) : "";
    const payload = escapeAttr(JSON.stringify({ link }));
    result += `\n<script class="${RUNTIME_LINK_CLASS}" value="${payload}" defer></script>`;
  }
  const isOnLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  if (!result.includes(MULTIPLE_FORM_RUNTIME_SRC)) {
    result += `\n<script src="${isOnLocalhost === true ? "http://localhost:8080" : "https://oxyclick.com"}${MULTIPLE_FORM_RUNTIME_SRC}" defer></script>`;
  }

  return result;
}
