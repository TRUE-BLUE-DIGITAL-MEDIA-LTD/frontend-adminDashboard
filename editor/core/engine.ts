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
import { appendQuizRuntime } from "./tools/quiz/runtime-inject";
import type { UnlayerDesign } from "../compat/unlayer-types";
import { registerI18nKeysPlugin } from "./plugins/i18n-keys";
import { uploadAndIndexImage } from "./upload-image";

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
  /** When true, inline uploads are indexed into the shared image library. */
  isAdmin?: boolean;
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
        // Render the picker cell at full sector width (GrapesJS otherwise
        // lays properties out in half-width columns).
        full: true,
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

  // Captured by the AssetManager.uploadFile closure below — assigned right
  // after grapesjs.init() returns, before any user interaction can fire
  // the upload handler.
  let grapesInstance: GrapesEditor | undefined;

  const grapes = grapesjs.init({
    container: opts.container,
    // @ts-expect-error custom flag read by oxy plugins via editor.getConfig()
    oxyIsAdmin: Boolean(opts.isAdmin),
    /**
     * Custom Style Manager / Trait Manager property types MUST be registered
     * as plugins, not after `grapesjs.init()` returns.
     *
     * `grapesjs.init()` runs synchronously as: plugins → `loadOnStart()` →
     * return. `loadOnStart()` calls `StyleManager.onLoad()`, which adds
     * `styleManager.sectors` and builds each property model, binding it to a
     * view class resolved *at that instant*. A type referenced by
     * STYLE_SECTORS (e.g. `background-image-picker`) only resolves to its
     * custom view if it was registered before that point. Registering via
     * `addType()` after init is too late — the `background-image` property is
     * already bound to GrapesJS' default text-input view, so the Decorations
     * sector shows a raw `url("...")` field instead of the upload picker.
     */
    plugins: [
      registerColorPopupType,
      registerColorPopupTraitType,
      registerBackgroundImagePickerType,
    ],
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
    /**
     * Asset Manager — when the user double-clicks an Image component (or any
     * block that opens the asset picker) we route to our React
     * ImageLibraryModal via the `oxy:open-image-library` event bus instead of
     * GrapesJS's default asset modal (see `custom.open` below). Any remaining
     * programmatic upload path (`uploadFile`) goes through the shared
     * `uploadAndIndexImage` helper: signed-URL upload + best-effort library
     * index for admins.
     */
    assetManager: {
      // Double-clicking an image (or dropping the Image block) is routed to our
      // React ImageLibraryModal by overriding the `open-assets` command after
      // init (see below) — that is what GrapesJS' image component actually runs
      // (`Assets.open` → `Commands.run('open-assets', { select, target })`).
      // `uploadFile` stays as a programmatic fallback so any default upload
      // path goes through the shared helper (signed-URL + best-effort index).
      upload: false,
      uploadFile: async (ev: Event) => {
        if (!grapesInstance) return;
        const dt = (ev as DragEvent).dataTransfer;
        const inputFiles =
          (ev.target as HTMLInputElement | null)?.files ?? null;
        const fileList =
          dt && dt.files && dt.files.length > 0 ? dt.files : inputFiles;
        if (!fileList || fileList.length === 0) return;
        for (const file of Array.from(fileList)) {
          try {
            const url = await uploadAndIndexImage(file, {
              isAdmin: Boolean(opts.isAdmin),
            });
            grapesInstance.AssetManager.add({ src: url, type: "image" });
          } catch (err) {
            console.error("[oxy-editor] asset upload failed", err);
          }
        }
      },
    },
    canvas: { styles: [], scripts: [] },
  });

  grapesInstance = grapes;

  // Override the built-in `open-assets` command (run by the Image component on
  // double-click via `Assets.open`, and by drag-drop) to route to our React
  // ImageLibraryModal through the editor event bus instead of GrapesJS' default
  // asset modal. `opts.select` is GrapesJS' own handler that applies the chosen
  // src to the active target; we also set src directly on the selected image as
  // a belt-and-braces fallback.
  grapes.Commands.add("open-assets", {
    run(
      editor: GrapesEditor,
      _sender: unknown,
      opts: {
        target?: { addAttributes?: (attrs: Record<string, string>) => void };
        select?: (asset: { getSrc: () => string }, complete?: boolean) => void;
      } = {},
    ) {
      const apply = (url: string) => {
        if (typeof opts.select === "function") {
          opts.select({ getSrc: () => url }, true);
        }
        const target = opts.target ?? editor.getSelected();
        target?.addAttributes?.({ src: url });
      };
      editor.trigger("oxy:open-image-library", { onSelect: apply });
    },
  });

  void modeConfig;

  // The Style Manager (`registerColorPopupType`) and Trait Manager
  // (`registerColorPopupTraitType`) custom types, plus the background-image
  // upload picker (`registerBackgroundImagePickerType`), are registered via
  // the `plugins` array above so they exist before GrapesJS builds the
  // Style Manager sectors during `init()`. See the comment on `plugins`.

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
      const html = appendQuizRuntime(appendMultipleFormRuntime(rawHtml));
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

  const teardownI18n = registerI18nKeysPlugin(grapes);

  return {
    instance,
    grapes,
    destroy() {
      teardownI18n();
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
