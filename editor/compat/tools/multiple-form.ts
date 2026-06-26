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

const STEP_LIST_TRAIT_TYPE = "oxy-step-list";

const CMD_ADD_STEP = "oxy-mf:add-step";
const CMD_REMOVE_STEP = "oxy-mf:remove-step";
const CMD_ADD_OPTION = "oxy-mf:add-option";
const CMD_REMOVE_OPTION = "oxy-mf:remove-option";

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

function makeDefaultRootTree() {
  const stepType = "answer";
  const totalSteps = 1;
  return {
    type: ROOT_TYPE,
    attributes: { class: MULTIPLE_FORM_MARKER_CLASS },
    style: ROOT_STYLE,
    "form-link": "",
    "active-step": 1,
    components: [
      makeStepTreeNode({
        title: "Pick an option",
        stepType,
        buttonColor: DEFAULT_BUTTON_COLOR,
        textColor: DEFAULT_TEXT_COLOR,
        buttonPadding: DEFAULT_BUTTON_PADDING,
        buttonRadius: DEFAULT_BUTTON_RADIUS,
        buttonSpacing: DEFAULT_BUTTON_SPACING,
        totalSteps,
        isFirst: true,
        isActive: true,
        options: [
          { display: "Option A", value: "a", url: "", moveToStep: "" },
          { display: "Option B", value: "b", url: "", moveToStep: "" },
        ],
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
      const totalAfter = steps.length + 1;
      const newStep = makeStepTreeNode({
        title: `Step ${totalAfter}`,
        stepType: getStepType(steps[0] ?? root),
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
      asLike(root).append(newStep);
      renumberSteps(root);
      asLike(root).set("active-step", totalAfter);
      applyActiveStep(root);
    },
  });

  editor.Commands.add(CMD_REMOVE_STEP, {
    run(ed) {
      const selected = ed.getSelected();
      const step = findAncestor(selected, STEP_TYPE);
      if (!step) return;
      const root = findRoot(step);
      if (!root) return;
      if (getStepsOf(root).length <= 1) {
        // Keep at least one step.
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
            type: "text",
            name: "form-link",
            label: "Final redirect URL",
            placeholder: "https://example.com/thank-you",
            changeProp: 1,
          },
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
            type: "button",
            name: "remove-step",
            labelButton: "× Remove Step",
            label: false,
            full: true,
            command: CMD_REMOVE_STEP,
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
      editorAny.on("component:add", onChild);
      editorAny.on("component:remove", onChild);
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
    const step = findAncestor(selected, STEP_TYPE);
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
  injectCanvasStyles(grapes);
  wireActiveStepFollowsSelection(grapes);

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
