import type { Editor as GrapesEditor, Component } from "grapesjs";

/**
 * Form block — imports Unlayer `form` content blocks (and supplies the
 * palette "Form" block) as a dedicated, editable GrapesJS component. Mirrors
 * the `multiple-form.ts` pattern: a converter emits a DOM shape, and the
 * `isComponent` callbacks below hydrate it back into typed components.
 *
 * DOM contract (also emitted by `renderForm` in
 * `editor/compat/unlayer-to-html.ts`):
 *   • Root  : <form class="oxy-form"> + data-oxy-button-* attributes
 *   • Field : <div class="oxy-form-field"> + data-oxy-field-* attributes,
 *             inner <label class="oxy-form-field-label"> + control
 *   • Submit: <button class="oxy-form-submit" type="submit">
 *
 * A plain <form> submits natively, so — unlike multiple-form — no runtime
 * script and no canvas-only CSS are needed.
 */

const FORM_MARKER_CLASS = "oxy-form";
const FIELD_CLASS = "oxy-form-field";
const FIELD_LABEL_CLASS = "oxy-form-field-label";
const SUBMIT_CLASS = "oxy-form-submit";

const ROOT_TYPE = "oxy-form";
const FIELD_TYPE = "oxy-form-field";
const FIELD_LIST_TRAIT_TYPE = "oxy-form-field-list";

const CMD_ADD_FIELD = "oxy-form:add-field";
const CMD_REMOVE_FIELD = "oxy-form:remove-field";

const DEFAULT_BUTTON_TEXT = "Continue";
const DEFAULT_BUTTON_COLOR = "#2563eb";
const DEFAULT_BUTTON_TEXT_COLOR = "#ffffff";
const DEFAULT_BUTTON_WIDTH = "100%";
const DEFAULT_BUTTON_RADIUS = "8px";
const DEFAULT_FIELD_TYPE = "text";

/**
 * Normalised control types. The Unlayer → HTML converter maps Unlayer's own
 * field-type names (dropdown, phone, long_answer, boolean) onto these before
 * emitting, so the component only ever deals with this fixed set.
 */
const FIELD_TYPE_OPTIONS: ReadonlyArray<{ id: string; name: string }> = [
  { id: "text", name: "Text" },
  { id: "email", name: "Email" },
  { id: "tel", name: "Phone" },
  { id: "number", name: "Number" },
  { id: "textarea", name: "Textarea" },
  { id: "select", name: "Dropdown" },
  { id: "checkbox", name: "Checkbox" },
  { id: "hidden", name: "Hidden" },
];

const KNOWN_FIELD_TYPES = new Set(FIELD_TYPE_OPTIONS.map((o) => o.id));

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeFieldType(raw: unknown): string {
  const t = String(raw ?? "").toLowerCase();
  return KNOWN_FIELD_TYPES.has(t) ? t : DEFAULT_FIELD_TYPE;
}

interface FieldProps {
  type: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

interface ButtonProps {
  text: string;
  color: string;
  textColor: string;
  width: string;
  radius: string;
}

const FIELD_INPUT_STYLE =
  "width:100%;padding:10px 12px;border:1px solid #d1d5db;" +
  "border-radius:6px;font-size:14px;box-sizing:border-box;";

/** Inner DOM of one field: a <label> plus the control. */
function fieldInnerHtml(p: FieldProps): string {
  const nameAttr = p.name ? ` name="${escapeAttr(p.name)}"` : "";
  const phAttr = p.placeholder
    ? ` placeholder="${escapeAttr(p.placeholder)}"`
    : "";
  const reqAttr = p.required ? " required" : "";
  const labelText = escapeHtml(p.label || p.name || "Field");

  if (p.type === "hidden") {
    return `<input type="hidden"${nameAttr} value="">`;
  }
  if (p.type === "checkbox") {
    return (
      `<input type="checkbox"${nameAttr}${reqAttr} ` +
      `style="margin-right:8px;width:16px;height:16px;cursor:pointer;">` +
      `<span class="${FIELD_LABEL_CLASS}" ` +
      `style="font-size:14px;color:#374151;">${labelText}</span>`
    );
  }
  const labelHtml =
    `<label class="${FIELD_LABEL_CLASS}" ` +
    `style="display:block;font-size:14px;color:#374151;` +
    `margin-bottom:4px;font-weight:500;">${labelText}</label>`;
  if (p.type === "textarea") {
    return (
      labelHtml +
      `<textarea${nameAttr}${phAttr}${reqAttr} rows="4" ` +
      `style="${FIELD_INPUT_STYLE}font-family:inherit;resize:vertical;">` +
      `</textarea>`
    );
  }
  if (p.type === "select") {
    const opts = p.options
      .map((o) => `<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`)
      .join("");
    return (
      labelHtml +
      `<select${nameAttr}${reqAttr} style="${FIELD_INPUT_STYLE}">${opts}` +
      `</select>`
    );
  }
  return (
    labelHtml +
    `<input type="${escapeAttr(p.type)}"${nameAttr}${phAttr}${reqAttr} ` +
    `style="${FIELD_INPUT_STYLE}">`
  );
}

function fieldWrapStyle(type: string): Record<string, string> {
  if (type === "hidden") return { display: "none" };
  if (type === "checkbox") return { display: "flex", "align-items": "center" };
  return { display: "block" };
}

function fieldDataAttrs(p: FieldProps): Record<string, string> {
  return {
    class: FIELD_CLASS,
    "data-oxy-field-type": p.type,
    "data-oxy-field-name": p.name,
    "data-oxy-field-label": p.label,
    "data-oxy-field-placeholder": p.placeholder,
    "data-oxy-field-required": p.required ? "true" : "false",
    "data-oxy-field-options": p.options.join(", "),
  };
}

function submitButtonStyle(b: ButtonProps): Record<string, string> {
  return {
    "background-color": b.color,
    color: b.textColor,
    width: b.width,
    "border-radius": b.radius,
    border: "0",
    padding: "12px 16px",
    "font-size": "16px",
    "font-weight": "600",
    cursor: "pointer",
  };
}

function buttonDataAttrs(b: ButtonProps): Record<string, string> {
  return {
    "data-oxy-button-text": b.text,
    "data-oxy-button-color": b.color,
    "data-oxy-button-text-color": b.textColor,
    "data-oxy-button-width": b.width,
    "data-oxy-button-radius": b.radius,
  };
}

// --- Component-tree builders (used by the palette block) -------------------

function makeFieldTreeNode(p: FieldProps) {
  return {
    type: FIELD_TYPE,
    "field-type": p.type,
    "field-name": p.name,
    "field-label": p.label,
    "field-placeholder": p.placeholder,
    "field-required": p.required,
    "field-options": p.options.join(", "),
    attributes: fieldDataAttrs(p),
    style: fieldWrapStyle(p.type),
    components: fieldInnerHtml(p),
  };
}

function makeSubmitButtonNode(b: ButtonProps) {
  return {
    tagName: "button",
    attributes: { type: "submit", class: SUBMIT_CLASS },
    style: submitButtonStyle(b),
    components: b.text,
    draggable: false,
    copyable: false,
    removable: false,
  };
}

function makeDefaultFormTree() {
  const button: ButtonProps = {
    text: DEFAULT_BUTTON_TEXT,
    color: DEFAULT_BUTTON_COLOR,
    textColor: DEFAULT_BUTTON_TEXT_COLOR,
    width: DEFAULT_BUTTON_WIDTH,
    radius: DEFAULT_BUTTON_RADIUS,
  };
  const field: FieldProps = {
    type: "email",
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
    options: [],
  };
  return {
    type: ROOT_TYPE,
    attributes: {
      class: FORM_MARKER_CLASS,
      method: "GET",
      action: "",
      ...buttonDataAttrs(button),
    },
    "button-text": button.text,
    "button-color": button.color,
    "button-text-color": button.textColor,
    "button-width": button.width,
    "button-radius": button.radius,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "12px",
      "max-width": "420px",
      margin: "0 auto",
      padding: "16px",
      background: "#ffffff",
      "border-radius": "8px",
    },
    components: [makeFieldTreeNode(field), makeSubmitButtonNode(button)],
  };
}

// --- Component lookups -----------------------------------------------------

type ComponentLike = Component & {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  components: (next?: unknown) => Component[] | Component;
  find: (selector: string) => Component[];
  parent: () => Component | undefined;
  append: (def: unknown, opts?: unknown) => Component[];
  remove: () => Component;
  index: () => number;
  addAttributes: (attrs: Record<string, string>) => Component;
  getAttributes: () => Record<string, string>;
  setStyle: (style: Record<string, string>) => Component;
  is: (type: string) => boolean;
  on: (events: string, cb: (...args: unknown[]) => void) => Component;
};

function asLike(c: Component): ComponentLike {
  return c as unknown as ComponentLike;
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

function getFieldsOf(root: Component): Component[] {
  return asLike(root).find(`.${FIELD_CLASS}`);
}

/**
 * Lowest `field_N` (N ≥ 1) not currently used as a field-name under `root`.
 * Guarantees a fresh, collision-free submission key even after fields have
 * been removed (a plain `length + 1` counter would reuse names).
 */
function nextFieldOrdinal(root: Component): number {
  const used = new Set(
    getFieldsOf(root).map((f) => String(asLike(f).get("field-name") ?? "")),
  );
  let n = 1;
  while (used.has(`field_${n}`)) n += 1;
  return n;
}

function findSubmitButton(root: Component): Component | null {
  const matches = asLike(root).find(`.${SUBMIT_CLASS}`);
  return matches.length > 0 ? matches[0] : null;
}

// --- Prop readers / appliers ----------------------------------------------

function readFieldProps(comp: Component): FieldProps {
  const c = asLike(comp);
  const required = c.get("field-required");
  const optionsRaw = String(c.get("field-options") ?? "");
  return {
    type: normalizeFieldType(c.get("field-type")),
    name: String(c.get("field-name") ?? ""),
    label: String(c.get("field-label") ?? ""),
    placeholder: String(c.get("field-placeholder") ?? ""),
    required: required === true || required === "true",
    options: optionsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

/** Rebuild a field's inner DOM, wrapper style, and data attrs from its props. */
function applyField(comp: Component): void {
  const props = readFieldProps(comp);
  const c = asLike(comp);
  c.components(fieldInnerHtml(props));
  c.setStyle(fieldWrapStyle(props.type));
  c.addAttributes(fieldDataAttrs(props));
}

function readButtonProps(comp: Component): ButtonProps {
  const c = asLike(comp);
  return {
    text: String(c.get("button-text") ?? DEFAULT_BUTTON_TEXT),
    color: String(c.get("button-color") ?? DEFAULT_BUTTON_COLOR),
    textColor: String(c.get("button-text-color") ?? DEFAULT_BUTTON_TEXT_COLOR),
    width: String(c.get("button-width") ?? DEFAULT_BUTTON_WIDTH),
    radius: String(c.get("button-radius") ?? DEFAULT_BUTTON_RADIUS),
  };
}

/** Re-label / re-style the submit button from the root's button-* props. */
function applyButton(root: Component): void {
  const b = readButtonProps(root);
  asLike(root).addAttributes(buttonDataAttrs(b));
  const btn = findSubmitButton(root);
  if (!btn) return;
  const btnLike = asLike(btn);
  btnLike.components(b.text);
  btnLike.setStyle(submitButtonStyle(b));
  // Keep the submit button protected even on imported / round-tripped forms,
  // where the parsed <button> has no component type of its own.
  btnLike.set("draggable", false);
  btnLike.set("copyable", false);
  btnLike.set("removable", false);
}

// --- Commands --------------------------------------------------------------

function defineCommands(editor: GrapesEditor): void {
  editor.Commands.add(CMD_ADD_FIELD, {
    run(ed) {
      const selected = ed.getSelected();
      const root =
        findAncestor(selected, ROOT_TYPE) ||
        (selected && asLike(selected).is(ROOT_TYPE) ? selected : null);
      if (!root) return;
      const ordinal = nextFieldOrdinal(root);
      const node = makeFieldTreeNode({
        type: DEFAULT_FIELD_TYPE,
        name: `field_${ordinal}`,
        label: `Field ${ordinal}`,
        placeholder: "",
        required: false,
        options: [],
      });
      // Insert before the submit button so the button stays last.
      const btn = findSubmitButton(root);
      if (btn) {
        asLike(root).append(node, { at: asLike(btn).index() });
      } else {
        asLike(root).append(node);
      }
    },
  });

  editor.Commands.add(CMD_REMOVE_FIELD, {
    run(ed) {
      const selected = ed.getSelected();
      const field = findAncestor(selected, FIELD_TYPE);
      if (!field) return;
      const root = findAncestor(field, ROOT_TYPE);
      asLike(field).remove();
      if (root) ed.select(root);
    },
  });
}

// --- Component types -------------------------------------------------------

function defineComponentTypes(editor: GrapesEditor): void {
  const dom = editor.Components;

  dom.addType(FIELD_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(FIELD_CLASS)) return undefined;
      const get = (key: string): string => el.getAttribute(key) ?? "";
      return {
        type: FIELD_TYPE,
        "field-type": normalizeFieldType(get("data-oxy-field-type")),
        "field-name": get("data-oxy-field-name"),
        "field-label": get("data-oxy-field-label"),
        "field-placeholder": get("data-oxy-field-placeholder"),
        "field-required": el.getAttribute("data-oxy-field-required") === "true",
        "field-options": get("data-oxy-field-options"),
      };
    },
    model: {
      defaults: {
        name: "Form Field",
        droppable: false,
        "field-type": DEFAULT_FIELD_TYPE,
        "field-name": "",
        "field-label": "",
        "field-placeholder": "",
        "field-required": false,
        "field-options": "",
        attributes: { class: FIELD_CLASS },
        traits: [
          {
            type: "select",
            name: "field-type",
            label: "Field type",
            options: FIELD_TYPE_OPTIONS,
            changeProp: 1,
          },
          { type: "text", name: "field-name", label: "Name", changeProp: 1 },
          { type: "text", name: "field-label", label: "Label", changeProp: 1 },
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
            type: "text",
            name: "field-options",
            label: "Dropdown options (comma-separated)",
            changeProp: 1,
          },
          {
            type: "button",
            name: "remove-field",
            labelButton: "× Remove Field",
            label: false,
            full: true,
            command: CMD_REMOVE_FIELD,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on(
          "change:field-type change:field-name change:field-label " +
            "change:field-placeholder change:field-required " +
            "change:field-options",
          () => applyField(comp),
        );
      },
    },
  });

  dom.addType(ROOT_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (el.tagName !== "FORM") return undefined;
      if (!el.classList.contains(FORM_MARKER_CLASS)) return undefined;
      const get = (key: string, fallback: string): string => {
        const raw = el.getAttribute(key);
        return raw === null || raw === "" ? fallback : raw;
      };
      return {
        type: ROOT_TYPE,
        "button-text": get("data-oxy-button-text", DEFAULT_BUTTON_TEXT),
        "button-color": get("data-oxy-button-color", DEFAULT_BUTTON_COLOR),
        "button-text-color": get(
          "data-oxy-button-text-color",
          DEFAULT_BUTTON_TEXT_COLOR,
        ),
        "button-width": get("data-oxy-button-width", DEFAULT_BUTTON_WIDTH),
        "button-radius": get("data-oxy-button-radius", DEFAULT_BUTTON_RADIUS),
      };
    },
    model: {
      defaults: {
        name: "Form",
        tagName: "form",
        droppable: false,
        "button-text": DEFAULT_BUTTON_TEXT,
        "button-color": DEFAULT_BUTTON_COLOR,
        "button-text-color": DEFAULT_BUTTON_TEXT_COLOR,
        "button-width": DEFAULT_BUTTON_WIDTH,
        "button-radius": DEFAULT_BUTTON_RADIUS,
        attributes: { class: FORM_MARKER_CLASS, method: "GET", action: "" },
        traits: [
          { type: "text", name: "action", label: "Action URL" },
          {
            type: "select",
            name: "method",
            label: "Method",
            options: [
              { id: "GET", name: "GET" },
              { id: "POST", name: "POST" },
            ],
          },
          {
            type: "text",
            name: "button-text",
            label: "Button text",
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
            name: "button-text-color",
            label: "Text color",
            changeProp: 1,
          },
          {
            type: "text",
            name: "button-width",
            label: "Button width",
            changeProp: 1,
          },
          {
            type: "text",
            name: "button-radius",
            label: "Button radius",
            changeProp: 1,
          },
          {
            type: FIELD_LIST_TRAIT_TYPE,
            name: "field-list",
            label: "Fields",
            full: true,
          },
          {
            type: "button",
            name: "add-field",
            labelButton: "+ Add Field",
            label: false,
            full: true,
            command: CMD_ADD_FIELD,
          },
        ],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        comp.on(
          "change:button-text change:button-color " +
            "change:button-text-color change:button-width " +
            "change:button-radius",
          () => applyButton(comp),
        );
        // Initial sync — handles both block-drop and design-load.
        applyButton(comp);
      },
    },
  });
}

// --- Field-list trait ------------------------------------------------------

/**
 * Custom trait rendering a clickable list of the form's fields. Lives on the
 * root's Properties panel — clicking a row selects that field in the canvas.
 */
function defineFieldListTrait(editor: GrapesEditor): void {
  type CreateInputArgs = { trait: unknown; component: Component };

  const def = {
    noLabel: false,
    createInput(args: CreateInputArgs) {
      const component = args.component;
      const wrapper = document.createElement("div");
      wrapper.className = "oxy-form-field-list";

      const render = () => {
        if (!component) return;
        const fields = getFieldsOf(component);
        wrapper.innerHTML = "";
        if (fields.length === 0) {
          const empty = document.createElement("div");
          empty.className = "oxy-form-field-list__empty";
          empty.textContent = "No fields yet.";
          wrapper.appendChild(empty);
          return;
        }
        fields.forEach((field, idx) => {
          const c = asLike(field);
          const nameRaw = c.get("field-name");
          const labelRaw = c.get("field-label");
          const text =
            (typeof labelRaw === "string" && labelRaw.trim()) ||
            (typeof nameRaw === "string" && nameRaw.trim()) ||
            "(unnamed)";
          const item = document.createElement("button");
          item.type = "button";
          item.className = "oxy-form-field-list__item";
          item.innerHTML =
            `<span class="oxy-form-field-list__num">${idx + 1}</span> ` +
            `<span class="oxy-form-field-list__label">${escapeAttr(
              String(text),
            )}</span> ` +
            `<span class="oxy-form-field-list__type">${escapeAttr(
              normalizeFieldType(c.get("field-type")),
            )}</span>`;
          item.addEventListener("click", (e) => {
            e.preventDefault();
            editor.select(field);
          });
          wrapper.appendChild(item);
        });
      };

      render();

      const editorAny = editor as unknown as {
        on: (event: string, cb: (...args: unknown[]) => void) => void;
      };
      // Re-render on any signal that may change the list length, ordering, or
      // labels. Editor-level events fire across all components, so filter to
      // descendants of this root first.
      const onChild = (changed: unknown) => {
        const c = changed as Component | undefined;
        if (!c) {
          render();
          return;
        }
        if (findAncestor(c, ROOT_TYPE) === component) render();
      };
      editorAny.on("component:add", onChild);
      editorAny.on("component:remove", onChild);
      editorAny.on("component:update:field-name", onChild);
      editorAny.on("component:update:field-label", onChild);
      editorAny.on("component:update:field-type", onChild);

      return wrapper;
    },
  };

  const tm = editor.TraitManager as unknown as {
    addType: (name: string, def: unknown) => void;
  };
  tm.addType(FIELD_LIST_TRAIT_TYPE, def);
}

// --- Public registration ---------------------------------------------------

/**
 * Registers the "Form" block in the BlockManager plus the `oxy-form` /
 * `oxy-form-field` component types, commands, and field-list trait. Dropping
 * the block and importing an Unlayer `form` block both yield the same
 * editable component tree.
 */
export function registerFormBlock(
  grapes: GrapesEditor,
  opts: { blockCategory: string; icon: string },
): void {
  defineCommands(grapes);
  defineComponentTypes(grapes);
  defineFieldListTrait(grapes);

  grapes.BlockManager.add("oxy-form", {
    label: "Form",
    category: opts.blockCategory,
    media: opts.icon,
    content: makeDefaultFormTree(),
  });
}
