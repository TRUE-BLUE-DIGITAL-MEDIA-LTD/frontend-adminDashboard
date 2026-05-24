import type { Editor as GrapesEditor } from "grapesjs";

/**
 * Friendly color picker shared by the Style Manager AND the Trait Manager.
 *
 * The picker is a swatch + hex input pair that opens a body-mounted popover
 * with brand presets, a hex input, and the native spectrum bar. The popover
 * is positioned with `getBoundingClientRect()` so it never gets clipped by
 * the right panel's `overflow: auto` and never drifts to the viewport edge
 * like the OS-native `<input type="color">` picker.
 *
 *   • `registerColorPopupType`        → Style Manager type `oxy-color`
 *     Used by STYLE_SECTORS for text-color, background-color, etc.
 *
 *   • `registerColorPopupTraitType`   → Trait Manager type `oxy-color`
 *     Used by component traits (e.g. multi-step form's button/text color)
 *     so per-component color traits get the same UX, not the GrapesJS
 *     built-in trait color which falls back to the unmovable OS picker.
 */

const PRESETS = [
  "#1B3C53",
  "#234C6A",
  "#456882",
  "#D2C1B6",
  "#F4EEE6",
  "#FFFFFF",
  "#000000",
  "#374151",
  "#DC2626",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
];

const POPUP_WIDTH = 224;
const POPUP_ESTIMATED_HEIGHT = 240;

function normalizeHex(input: string): string {
  const v = input.trim();
  if (!v) return "";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v;
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return `#${v}`;
  return v;
}

interface PopupTarget {
  swatch: HTMLElement;
  commit: (value: string) => void;
}

// Module-level singleton — one popup shared across all color fields, whether
// they live in the Style Manager or in a component's trait panel.
let popupEl: HTMLDivElement | null = null;
let popupNative: HTMLInputElement | null = null;
let popupHex: HTMLInputElement | null = null;
let popupClear: HTMLButtonElement | null = null;
let currentTarget: PopupTarget | null = null;
let outsideListenersAttached = false;

function ensurePopup(): HTMLDivElement {
  if (popupEl) return popupEl;

  const el = document.createElement("div");
  el.className = "oxy-color-popup";
  el.hidden = true;
  el.innerHTML = `
    <input
      type="color"
      class="oxy-color-popup__native"
      aria-label="Color spectrum"
    />
    <div class="oxy-color-popup__presets" role="listbox" aria-label="Brand colors">
      ${PRESETS.map(
        (c) =>
          `<button type="button" class="oxy-color-popup__preset" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`,
      ).join("")}
    </div>
    <div class="oxy-color-popup__row">
      <input
        type="text"
        class="oxy-color-popup__hex"
        placeholder="#000000"
        spellcheck="false"
        autocomplete="off"
      />
      <button type="button" class="oxy-color-popup__clear">Clear</button>
    </div>
  `;
  document.body.appendChild(el);

  popupNative = el.querySelector(".oxy-color-popup__native");
  popupHex = el.querySelector(".oxy-color-popup__hex");
  popupClear = el.querySelector(".oxy-color-popup__clear");

  popupNative?.addEventListener("input", () => {
    if (!currentTarget || !popupNative || !popupHex) return;
    const value = popupNative.value;
    popupHex.value = value;
    currentTarget.commit(value);
  });

  const commitHex = () => {
    if (!currentTarget || !popupHex) return;
    currentTarget.commit(popupHex.value);
  };
  popupHex?.addEventListener("change", commitHex);
  popupHex?.addEventListener("blur", commitHex);
  popupHex?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitHex();
      closePopup();
    }
  });

  popupClear?.addEventListener("click", () => {
    if (!currentTarget) return;
    currentTarget.commit("");
    closePopup();
  });

  el.querySelectorAll<HTMLButtonElement>(".oxy-color-popup__preset").forEach(
    (btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentTarget) return;
        const color = btn.getAttribute("data-color") ?? "";
        currentTarget.commit(color);
        closePopup();
      });
    },
  );

  // Stop clicks inside the popup from bubbling to the outside-click handler.
  el.addEventListener("click", (e) => e.stopPropagation());

  popupEl = el;
  return el;
}

function ensureOutsideListeners(): void {
  if (outsideListenersAttached) return;
  outsideListenersAttached = true;

  document.addEventListener("click", (e) => {
    if (!popupEl || popupEl.hidden) return;
    const target = e.target as Node | null;
    if (!target) return;
    if (popupEl.contains(target)) return;
    if (currentTarget?.swatch.contains(target)) return;
    closePopup();
  });

  // Scrolling or resizing the panel moves the swatch but a fixed-position
  // popup stays put — easier to just close it than chase the anchor.
  window.addEventListener(
    "scroll",
    () => {
      if (popupEl && !popupEl.hidden) closePopup();
    },
    true,
  );
  window.addEventListener("resize", () => {
    if (popupEl && !popupEl.hidden) closePopup();
  });
}

function positionPopup(swatch: HTMLElement): void {
  if (!popupEl) return;
  const rect = swatch.getBoundingClientRect();
  const margin = 8;

  let left = rect.left;
  let top = rect.bottom + 6;

  if (left + POPUP_WIDTH > window.innerWidth - margin) {
    left = window.innerWidth - POPUP_WIDTH - margin;
  }
  if (left < margin) left = margin;

  if (top + POPUP_ESTIMATED_HEIGHT > window.innerHeight - margin) {
    // Flip above the swatch if not enough room below.
    top = rect.top - POPUP_ESTIMATED_HEIGHT - 6;
    if (top < margin) top = margin;
  }

  popupEl.style.left = `${left}px`;
  popupEl.style.top = `${top}px`;
}

function openPopup(target: PopupTarget, currentValue: string): void {
  ensurePopup();
  ensureOutsideListeners();
  currentTarget = target;

  if (popupHex) popupHex.value = currentValue;
  if (popupNative) {
    popupNative.value = /^#([0-9a-f]{6})$/i.test(currentValue)
      ? currentValue
      : "#000000";
  }

  positionPopup(target.swatch);
  if (popupEl) popupEl.hidden = false;
}

function closePopup(): void {
  if (popupEl) popupEl.hidden = true;
  currentTarget = null;
}

interface ColorFieldOptions {
  initial: string;
  onCommit: (value: string) => void;
}

interface ColorFieldHandle {
  /** The wrapper element to mount inside the panel cell. */
  root: HTMLDivElement;
  /**
   * Mirror an externally-applied value into the field's swatch + hex input
   * without triggering `onCommit`. Used by the Style/Trait Manager when the
   * underlying model changes for some other reason (loadDesign, undo, etc.).
   */
  setValue: (value: string) => void;
}

/**
 * Build a swatch + hex input pair that opens the shared popup on click and
 * funnels every change through `onCommit`. The same DOM is reused by both
 * the Style Manager and the Trait Manager registrars.
 */
function createOxyColorField(opts: ColorFieldOptions): ColorFieldHandle {
  const root = document.createElement("div");
  root.className = "oxy-color-field";
  root.innerHTML = `
    <button
      type="button"
      class="oxy-color-swatch is-empty"
      aria-label="Open color picker"
    ></button>
    <input
      type="text"
      class="oxy-color-hex"
      placeholder="#000000"
      spellcheck="false"
      autocomplete="off"
    />
  `;

  const swatch = root.querySelector(".oxy-color-swatch") as HTMLButtonElement;
  const hex = root.querySelector(".oxy-color-hex") as HTMLInputElement;

  const setSwatch = (value: string) => {
    if (value) {
      swatch.style.background = value;
      swatch.classList.remove("is-empty");
    } else {
      swatch.style.background = "transparent";
      swatch.classList.add("is-empty");
    }
  };

  const commit = (raw: string) => {
    const normalized = normalizeHex(raw);
    if (document.activeElement !== hex) hex.value = normalized;
    setSwatch(normalized);
    opts.onCommit(normalized);
  };

  swatch.addEventListener("click", (e) => {
    e.stopPropagation();
    if (popupEl && !popupEl.hidden && currentTarget?.swatch === swatch) {
      closePopup();
      return;
    }
    openPopup({ swatch, commit }, hex.value);
  });

  hex.addEventListener("change", () => commit(hex.value));
  hex.addEventListener("blur", () => commit(hex.value));
  hex.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(hex.value);
    }
  });

  const setValue = (value: string) => {
    const normalized = value ?? "";
    if (document.activeElement !== hex) hex.value = normalized;
    setSwatch(normalized);

    // If the popup is currently anchored to this field, mirror the value
    // into its inputs so they stay in sync with external changes.
    if (currentTarget?.swatch === swatch && popupEl && !popupEl.hidden) {
      if (popupHex && document.activeElement !== popupHex) {
        popupHex.value = normalized;
      }
      if (popupNative) {
        popupNative.value = /^#([0-9a-f]{6})$/i.test(normalized)
          ? normalized
          : "#000000";
      }
    }
  };

  // Initial paint.
  setValue(opts.initial);

  return { root, setValue };
}

/**
 * Type name used in `STYLE_SECTORS`. We register under a fresh name rather
 * than overriding the built-in `color` type because GrapesJS' default
 * `color` renderer appears to be pre-baked into the StyleManager and isn't
 * fully replaceable via `addType`. Sectors that want the friendly popover
 * reference this name explicitly.
 */
export const OXY_COLOR_TYPE = "oxy-color";

/** Trait Manager type name. Component traits use `type: 'oxy-color'`. */
export const OXY_COLOR_TRAIT_TYPE = "oxy-color";

export function registerColorPopupType(editor: GrapesEditor): void {
  const sm = editor.StyleManager;

  type ChangePayload = { value: string; partial?: boolean };
  type ElWithSetter = HTMLElement & {
    __oxySetValue?: (value: string) => void;
  };

  const definition = {
    create({
      change,
    }: {
      change: (payload: ChangePayload) => void;
    }) {
      const { root, setValue } = createOxyColorField({
        initial: "",
        onCommit: (value) => change({ value }),
      });
      (root as ElWithSetter).__oxySetValue = setValue;
      return root;
    },
    emit(
      {
        updateStyle,
      }: {
        updateStyle: (value: string, opts?: { partial?: boolean }) => void;
      },
      { value, partial }: ChangePayload,
    ) {
      updateStyle(value, { partial });
    },
    update({ value, el }: { value: string; el: HTMLElement }) {
      const setter = (el as ElWithSetter).__oxySetValue;
      if (setter) setter(value ?? "");
    },
  };

  // Primary registration — Style Manager sectors reference this name.
  sm.addType(OXY_COLOR_TYPE, definition);
  // Best-effort override of the built-in `color` type so nested colors
  // inside composite/stack properties (e.g. border, box-shadow) pick up
  // the same friendly UI when possible.
  sm.addType("color", definition);
}

/**
 * Trait Manager registrar — same popup machinery, wired to a component
 * property (`changeProp: 1`) or attribute via the trait's name.
 */
export function registerColorPopupTraitType(editor: GrapesEditor): void {
  type ElWithSetter = HTMLElement & {
    __oxySetValue?: (value: string) => void;
  };

  type TraitLike = {
    get: (key: string) => unknown;
  };
  type ComponentLike = {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    getAttributes: () => Record<string, string>;
    addAttributes: (attrs: Record<string, string>) => unknown;
  };

  const def = {
    noLabel: false,
    createInput({
      trait,
      component,
    }: {
      trait: TraitLike;
      component: ComponentLike;
    }) {
      const propName = String(trait.get("name") ?? "");
      const isChangeProp =
        trait.get("changeProp") === 1 || trait.get("changeProp") === true;

      const readValue = (): string => {
        if (isChangeProp) {
          return String(component.get(propName) ?? "");
        }
        return String(component.getAttributes()[propName] ?? "");
      };

      const writeValue = (value: string) => {
        if (isChangeProp) {
          component.set(propName, value);
        } else {
          component.addAttributes({ [propName]: value });
        }
      };

      const { root, setValue } = createOxyColorField({
        initial: readValue(),
        onCommit: writeValue,
      });
      (root as ElWithSetter).__oxySetValue = setValue;
      return root;
    },
    onUpdate({
      elInput,
      component,
      trait,
    }: {
      elInput: HTMLElement;
      component: ComponentLike;
      trait: TraitLike;
    }) {
      const propName = String(trait.get("name") ?? "");
      const isChangeProp =
        trait.get("changeProp") === 1 || trait.get("changeProp") === true;
      const next = isChangeProp
        ? String(component.get(propName) ?? "")
        : String(component.getAttributes()[propName] ?? "");
      const setter = (elInput as ElWithSetter).__oxySetValue;
      if (setter) setter(next);
    },
  };

  const tm = editor.TraitManager as unknown as {
    addType: (name: string, def: unknown) => void;
  };
  tm.addType(OXY_COLOR_TRAIT_TYPE, def);
}
