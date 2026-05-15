import grapesjs, { type Editor as GrapesEditor } from "grapesjs";
import type {
  DesignJson,
  EditorInstance,
  EditorMode,
  ExportCallback,
} from "../types";
import { pageModeConfig } from "./modes/page";
import { emailModeConfig } from "./modes/email";
import { documentModeConfig } from "./modes/document";
import { popupModeConfig } from "./modes/popup";
import { registerBuiltInTools } from "../compat/tools";
import { registerBackgroundImagePickerType } from "./style-types/background-image-picker";
import {
  registerColorPopupType,
  registerColorPopupTraitType,
  OXY_COLOR_TYPE,
} from "./style-types/color-popup";
import { importUnlayerDesign } from "../compat/unlayer-import";
import { appendMultipleFormRuntime } from "../compat/tools/multiple-form";
import type { UnlayerDesign } from "../compat/unlayer-types";

export interface EngineMountOptions {
  container: HTMLElement;
  mode: EditorMode;
  initialDesign?: DesignJson;
  initialHtml?: string;
  height?: string;
  width?: string;
  /**
   * If false, skip registering Oxy's default block panel entries.
   * Useful when the host app supplies its own tool catalog via defineTool.
   */
  registerDefaultTools?: boolean;
  /**
   * Optional DOM element where GrapesJS will render the draggable blocks
   * sidebar (the "tools menu"). When omitted, the BlockManager is registered
   * but not rendered as a panel — the host app is expected to drag blocks via
   * its own UI or skip the sidebar entirely.
   */
  blocksPanelEl?: HTMLElement;
  /**
   * Optional DOM element where GrapesJS renders the Style Manager and Trait
   * Manager (the per-component customization panel — colors, spacing,
   * typography, link target, etc.).
   */
  propertiesPanelEl?: HTMLElement;
  /**
   * Optional DOM element where GrapesJS renders the Layer Manager — a tree
   * view of the component hierarchy. Toggled from the editor chrome.
   */
  layersPanelEl?: HTMLElement;
}

export interface Engine {
  instance: EditorInstance;
  grapes: GrapesEditor;
  destroy(): void;
}

const modeConfigs = {
  page: pageModeConfig,
  email: emailModeConfig,
  document: documentModeConfig,
  popup: popupModeConfig,
};

/**
 * Style Manager sectors, following the GrapesJS docs:
 *   https://grapesjs.com/docs/modules/Style-manager.html#initialization
 *
 * Conventions:
 *   • String entries reference GrapesJS' built-in property definitions
 *     (preferred — keeps default labels, units, defaults).
 *   • Object entries either `extend` a built-in to tweak it, or define a
 *     custom property type (e.g. our `background-image-picker`).
 *   • `type: 'color'` uses GrapesJS' built-in color picker — no override.
 */
const STYLE_SECTORS = [
  {
    name: "Typography",
    open: true,
    properties: [
      "font-family",
      "font-size",
      "font-weight",
      "letter-spacing",
      {
        type: OXY_COLOR_TYPE,
        property: "color",
        label: "Text color",
        default: "",
      },
      "line-height",
      {
        extend: "text-align",
        type: "radio",
        property: "text-align",
        label: "Align",
        default: "left",
        options: [
          { id: "left", label: "Left" },
          { id: "center", label: "Center" },
          { id: "right", label: "Right" },
          { id: "justify", label: "Justify" },
        ],
      },
      "text-decoration",
    ],
  },
  {
    name: "Decorations",
    open: true,
    properties: [
      {
        type: OXY_COLOR_TYPE,
        property: "background-color",
        label: "Background color",
        default: "",
      },
      "border-radius",
      "border",
      "box-shadow",
      {
        type: "background-image-picker",
        property: "background-image",
        label: "Background image",
      },
      {
        type: "select",
        property: "background-repeat",
        label: "Repeat",
        default: "no-repeat",
        options: [
          { id: "no-repeat", label: "No repeat" },
          { id: "repeat", label: "Tile" },
          { id: "repeat-x", label: "Tile X" },
          { id: "repeat-y", label: "Tile Y" },
          { id: "space", label: "Space" },
          { id: "round", label: "Round" },
        ],
      },
      {
        type: "select",
        property: "background-position",
        label: "Position",
        default: "center center",
        options: [
          { id: "top left", label: "Top left" },
          { id: "top center", label: "Top center" },
          { id: "top right", label: "Top right" },
          { id: "center left", label: "Center left" },
          { id: "center center", label: "Center" },
          { id: "center right", label: "Center right" },
          { id: "bottom left", label: "Bottom left" },
          { id: "bottom center", label: "Bottom center" },
          { id: "bottom right", label: "Bottom right" },
        ],
      },
      {
        type: "select",
        property: "background-size",
        label: "Size",
        default: "auto",
        options: [
          { id: "auto", label: "Auto" },
          { id: "cover", label: "Cover (fill)" },
          { id: "contain", label: "Contain (fit)" },
          { id: "100% 100%", label: "Stretch" },
          { id: "100% auto", label: "Full width" },
          { id: "auto 100%", label: "Full height" },
        ],
      },
    ],
  },
  {
    name: "Dimension",
    open: false,
    properties: [
      "width",
      "min-width",
      "max-width",
      "height",
      "padding",
      "margin",
    ],
  },
  {
    name: "Layout",
    open: false,
    properties: [
      "display",
      "position",
      "top",
      "right",
      "bottom",
      "left",
      "flex-direction",
      "justify-content",
      "align-items",
      "gap",
    ],
  },
];

export function mountEngine(opts: EngineMountOptions): Engine {
  const modeConfig = modeConfigs[opts.mode];

  const grapes = grapesjs.init({
    container: opts.container,
    height: opts.height ?? "100vh",
    width: opts.width ?? "auto",
    storageManager: false,
    fromElement: false,
    panels: { defaults: [] },
    blockManager: opts.blocksPanelEl
      ? { appendTo: opts.blocksPanelEl }
      : undefined,
    selectorManager: { componentFirst: true },
    styleManager: opts.propertiesPanelEl
      ? {
          appendTo: opts.propertiesPanelEl,
          sectors: STYLE_SECTORS,
        }
      : { sectors: STYLE_SECTORS },
    traitManager: opts.propertiesPanelEl
      ? { appendTo: opts.propertiesPanelEl }
      : undefined,
    layerManager: opts.layersPanelEl
      ? { appendTo: opts.layersPanelEl }
      : undefined,
    deviceManager: {
      devices: [
        { id: "desktop", name: "Desktop", width: "" },
        { id: "tablet", name: "Tablet", width: "768px", widthMedia: "992px" },
        { id: "mobile", name: "Mobile", width: "320px", widthMedia: "480px" },
      ],
    },
    canvas: { styles: [], scripts: [] },
  });

  void modeConfig;

  // Override the default `color` Style Manager type with a swatch + hex
  // input that opens a body-mounted, fixed-positioned popover. The OS
  // native picker drifts to unpredictable viewport positions inside a
  // narrow side panel; ours anchors to the swatch's bounding rect.
  registerColorPopupType(grapes);
  // Register the same picker as a Trait Manager type so component traits
  // (e.g. multi-step form's button-color, text-color) get the friendly
  // popup instead of the OS-native trait color input.
  registerColorPopupTraitType(grapes);

  // Register the URL + Upload background-image picker. The Decorations
  // sector references this type via `{ type: 'background-image-picker' }`.
  registerBackgroundImagePickerType(grapes);

  if (opts.registerDefaultTools !== false) {
    registerBuiltInTools(grapes);
  }

  // Initial content load — wrapped in `UndoManager.skip` so the empty
  // canvas isn't sitting at the bottom of the user's undo stack.
  const um = grapes.UndoManager;
  um.skip(() => {
    if (opts.initialHtml) {
      grapes.setComponents(opts.initialHtml);
    } else if (opts.initialDesign) {
      if (isUnlayerDesign(opts.initialDesign)) {
        const { html } = importUnlayerDesign(opts.initialDesign);
        grapes.setComponents(html);
      } else if (isGrapesProjectData(opts.initialDesign)) {
        grapes.loadProjectData(opts.initialDesign);
      }
    }
  });
  // Belt-and-braces: clear anything the renderer might have added to the
  // stack during the initial bootstrap.
  um.clear();

  const instance: EditorInstance = {
    exportHtml(cb: ExportCallback) {
      const rawHtml = grapes.getHtml();
      const html = appendMultipleFormRuntime(rawHtml);
      const css = grapes.getCss() ?? "";
      const design = grapes.getProjectData();
      cb({ design, html, css });
    },
    loadDesign(design: DesignJson) {
      const parsed: unknown =
        typeof design === "string" ? JSON.parse(design) : design;
      // Loading a new design shouldn't end up in the undo stack — that
      // would let the user "undo" their open-document action into the
      // previous one's content. Skip + clear, just like initial load.
      um.skip(() => {
        if (isUnlayerDesign(parsed)) {
          const { html } = importUnlayerDesign(parsed);
          grapes.setComponents(html);
          return;
        }
        if (isGrapesProjectData(parsed)) {
          grapes.loadProjectData(parsed);
          return;
        }
        throw new Error(
          "loadDesign received unrecognized data. Expected Unlayer design (body.rows) or GrapesJS project data (pages).",
        );
      });
      um.clear();
    },
    setHtml(html: string) {
      um.skip(() => grapes.setComponents(html));
      um.clear();
    },
    saveDesign(cb: (design: DesignJson) => void) {
      cb(grapes.getProjectData());
    },
    registerCallback(event, cb) {
      grapes.on(event, cb as (...args: unknown[]) => void);
    },
    undo() {
      um.undo();
    },
    redo() {
      um.redo();
    },
    canUndo() {
      return um.hasUndo();
    },
    canRedo() {
      return um.hasRedo();
    },
    onHistoryChange(cb) {
      // Fires on any stack mutation (component changes flow through here),
      // plus the explicit undo/redo events.
      grapes.on("update", cb);
      grapes.on("undo", cb);
      grapes.on("redo", cb);
      return () => {
        grapes.off("update", cb);
        grapes.off("undo", cb);
        grapes.off("redo", cb);
      };
    },
    clearHistory() {
      um.clear();
    },
  };

  return {
    instance,
    grapes,
    destroy() {
      grapes.destroy();
    },
  };
}

function isGrapesProjectData(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "pages" in (value as Record<string, unknown>)
  );
}

function isUnlayerDesign(value: unknown): value is UnlayerDesign {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!("body" in v) || typeof v.body !== "object" || v.body === null) {
    return false;
  }
  return Array.isArray((v.body as Record<string, unknown>).rows);
}
