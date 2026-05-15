import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  BiDesktop,
  BiMobileAlt,
  BiGridAlt,
  BiLayer,
  BiCog,
  BiShow,
  BiX,
  BiUndo,
  BiRedo,
} from "react-icons/bi";
import { mountEngine, type Engine } from "../core/engine";
import type { DesignJson, EditorInstance, EditorMode } from "../types";

export type OxyDeviceId = "desktop" | "mobile";

export interface OxyEditorProps {
  mode: EditorMode;
  initialDesign?: DesignJson;
  initialHtml?: string;
  onReady?: (editor: EditorInstance) => void;
  className?: string;
  style?: React.CSSProperties;
  height?: string;
  registerDefaultTools?: boolean;
  /**
   * Render a left-hand "blocks menu" sidebar populated by the editor's
   * BlockManager. Used for landing-page / page-mode editing where you want
   * the Unlayer-like draggable tool palette.
   */
  showBlocksPanel?: boolean;
  blocksPanelWidth?: string;
  /**
   * Render a right-hand properties panel populated by the GrapesJS Style
   * Manager and Trait Manager. Lets users edit colors, spacing, typography,
   * link target, etc. on whichever component is selected on the canvas.
   */
  showPropertiesPanel?: boolean;
  propertiesPanelWidth?: string;
  /**
   * Render a left-side Layer Manager panel — a tree view of components on
   * the canvas. Useful for navigating deeply nested layouts.
   */
  showLayersPanel?: boolean;
  layersPanelWidth?: string;
  /**
   * Render a top toolbar above the canvas with Desktop / Mobile preview
   * toggles. Wired to GrapesJS's deviceManager via `editor.setDevice()`.
   */
  showDeviceToolbar?: boolean;
  initialDevice?: OxyDeviceId;
}

export interface OxyEditorRef {
  editor: EditorInstance | null;
}

export const OxyEditor = forwardRef<OxyEditorRef, OxyEditorProps>(
  function OxyEditor(
    {
      mode,
      initialDesign,
      initialHtml,
      onReady,
      className,
      style,
      height,
      registerDefaultTools,
      showBlocksPanel,
      blocksPanelWidth,
      showPropertiesPanel,
      propertiesPanelWidth,
      showLayersPanel,
      layersPanelWidth,
      showDeviceToolbar,
      initialDevice = "desktop",
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const blocksPanelRef = useRef<HTMLDivElement | null>(null);
    const propertiesPanelRef = useRef<HTMLDivElement | null>(null);
    const layersPanelRef = useRef<HTMLDivElement | null>(null);
    const engineRef = useRef<Engine | null>(null);
    const [instance, setInstance] = useState<EditorInstance | null>(null);
    const [hasSelection, setHasSelection] = useState<boolean>(false);
    const [device, setDevice] = useState<OxyDeviceId>(initialDevice);

    // Local toggle state for the three side panels. The `showXxxPanel` props
    // gate whether the panel is mounted at all; the toggles below control
    // visibility for mounted panels at runtime via the chrome toolbar.
    const [blocksOpen, setBlocksOpen] = useState<boolean>(true);
    const [layersOpen, setLayersOpen] = useState<boolean>(true);
    const [propertiesOpen, setPropertiesOpen] = useState<boolean>(true);

    // Preview overlay: when active, renders `instance.exportHtml()` into an
    // iframe so the author can see the live page exactly as end-users will.
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);

    // History state for the Undo/Redo buttons. Synced via the engine's
    // onHistoryChange subscription (see effect below).
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);

    function openPreview() {
      if (!engineRef.current) return;
      engineRef.current.instance.exportHtml(({ html, css }) => {
        const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview</title><style>${css ?? ""}</style></head><body>${html}</body></html>`;
        console.log(doc);
        setPreviewHtml(doc);
      });
    }
    function closePreview() {
      setPreviewHtml(null);
    }

    useImperativeHandle(ref, () => ({ editor: instance }), [instance]);

    useEffect(() => {
      if (!containerRef.current) return;
      const engine = mountEngine({
        container: containerRef.current,
        mode,
        initialDesign,
        initialHtml,
        height: showDeviceToolbar ? "100%" : height,
        registerDefaultTools,
        blocksPanelEl: showBlocksPanel
          ? blocksPanelRef.current ?? undefined
          : undefined,
        propertiesPanelEl: showPropertiesPanel
          ? propertiesPanelRef.current ?? undefined
          : undefined,
        layersPanelEl: showLayersPanel
          ? layersPanelRef.current ?? undefined
          : undefined,
      });
      engineRef.current = engine;
      setInstance(engine.instance);
      onReady?.(engine.instance);

      if (initialDevice && initialDevice !== "desktop") {
        engine.grapes.setDevice(initialDevice);
      }

      const onSelect = () => setHasSelection(true);
      const onDeselect = () => setHasSelection(false);
      engine.grapes.on("component:selected", onSelect);
      engine.grapes.on("component:deselected", onDeselect);

      return () => {
        engine.grapes.off("component:selected", onSelect);
        engine.grapes.off("component:deselected", onDeselect);
        engine.destroy();
        engineRef.current = null;
        setInstance(null);
        setHasSelection(false);
      };
    }, [mode]);

    function handleDevice(next: OxyDeviceId) {
      setDevice(next);
      engineRef.current?.grapes.setDevice(next);
    }

    function doUndo() {
      const inst = engineRef.current?.instance;
      if (!inst) return;
      inst.undo();
    }
    function doRedo() {
      const inst = engineRef.current?.instance;
      if (!inst) return;
      inst.redo();
    }

    // Sync history state (canUndo/canRedo) with the engine and wire global
    // Ctrl/Cmd+Z / Shift+Z / Ctrl+Y shortcuts. Skipped when focus is in an
    // input/textarea/contenteditable so native text undo still works.
    useEffect(() => {
      if (!instance) return;
      const refresh = () => {
        setCanUndo(instance.canUndo());
        setCanRedo(instance.canRedo());
      };
      refresh();
      const unsubscribe = instance.onHistoryChange(refresh);

      const isEditableTarget = (target: EventTarget | null): boolean => {
        if (!target || !(target instanceof HTMLElement)) return false;
        const tag = target.tagName;
        return (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        );
      };

      const onKeyDown = (e: KeyboardEvent) => {
        const mod = e.ctrlKey || e.metaKey;
        if (!mod) return;
        const key = e.key.toLowerCase();
        const isUndo = key === "z" && !e.shiftKey;
        const isRedo = (key === "z" && e.shiftKey) || key === "y";
        if (!isUndo && !isRedo) return;
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        if (isUndo) instance.undo();
        else instance.redo();
      };
      document.addEventListener("keydown", onKeyDown);

      return () => {
        unsubscribe();
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [instance]);

    const useLayout =
      showBlocksPanel ||
      showPropertiesPanel ||
      showLayersPanel ||
      showDeviceToolbar;

    if (useLayout) {
      return (
        <div
          className={className}
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: height ?? "100%",
            ...style,
          }}
        >
          {previewHtml !== null && (
            <div
              className="oxy-preview-overlay"
              role="dialog"
              aria-label="Live HTML preview"
            >
              <div className="oxy-preview-overlay__bar">
                <span className="oxy-preview-overlay__title">Live preview</span>
                <span className="oxy-preview-overlay__hint">
                  This is what end users will see on the published page.
                </span>
                <button
                  type="button"
                  className="oxy-preview-overlay__close"
                  onClick={closePreview}
                  aria-label="Close preview"
                >
                  <BiX size={18} /> Close
                </button>
              </div>
              <iframe
                title="Live HTML preview"
                srcDoc={previewHtml}
                className="oxy-preview-overlay__frame"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          )}
          {showBlocksPanel && (
            <div
              ref={blocksPanelRef}
              className="oxy-blocks-panel"
              style={{
                width: blocksPanelWidth ?? "280px",
                flexShrink: 0,
                height: "100%",
                borderRight: "1px solid #d2c1b6",
                overflow: "auto",
                display: blocksOpen ? "block" : "none",
              }}
            />
          )}
          {showLayersPanel && (
            <div
              className="oxy-layers-panel"
              style={{
                width: layersPanelWidth ?? "260px",
                flexShrink: 0,
                height: "100%",
                borderRight: "1px solid #d2c1b6",
                overflow: "auto",
                display: layersOpen ? "flex" : "none",
                flexDirection: "column",
                background: "#ffffff",
              }}
            >
              <div className="oxy-layers-panel__header">Layers</div>
              <div ref={layersPanelRef} style={{ flex: 1, overflow: "auto" }} />
            </div>
          )}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {showDeviceToolbar && (
              <div
                className="oxy-device-toolbar"
                role="toolbar"
                aria-label="Editor chrome"
              >
                <button
                  type="button"
                  onClick={doUndo}
                  disabled={!canUndo}
                  className="oxy-device-toolbar__btn oxy-device-toolbar__btn--icon"
                  aria-label="Undo (Ctrl+Z)"
                  title="Undo (Ctrl+Z)"
                >
                  <BiUndo size={16} />
                </button>
                <button
                  type="button"
                  onClick={doRedo}
                  disabled={!canRedo}
                  className="oxy-device-toolbar__btn oxy-device-toolbar__btn--icon"
                  aria-label="Redo (Ctrl+Shift+Z)"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <BiRedo size={16} />
                </button>
                <span className="oxy-device-toolbar__divider" aria-hidden />
                {showBlocksPanel && (
                  <button
                    type="button"
                    onClick={() => setBlocksOpen((v) => !v)}
                    className={
                      "oxy-device-toolbar__btn" +
                      (blocksOpen ? " oxy-device-toolbar__btn--active" : "")
                    }
                    aria-pressed={blocksOpen}
                  >
                    <BiGridAlt size={16} />
                    Blocks
                  </button>
                )}
                {showLayersPanel && (
                  <button
                    type="button"
                    onClick={() => setLayersOpen((v) => !v)}
                    className={
                      "oxy-device-toolbar__btn" +
                      (layersOpen ? " oxy-device-toolbar__btn--active" : "")
                    }
                    aria-pressed={layersOpen}
                  >
                    <BiLayer size={16} />
                    Layers
                  </button>
                )}
                {showPropertiesPanel && (
                  <button
                    type="button"
                    onClick={() => setPropertiesOpen((v) => !v)}
                    className={
                      "oxy-device-toolbar__btn" +
                      (propertiesOpen ? " oxy-device-toolbar__btn--active" : "")
                    }
                    aria-pressed={propertiesOpen}
                  >
                    <BiCog size={16} />
                    Properties
                  </button>
                )}
                <button
                  type="button"
                  onClick={openPreview}
                  className="oxy-device-toolbar__btn oxy-device-toolbar__btn--preview"
                  aria-label="Open live HTML preview"
                >
                  <BiShow size={16} />
                  Preview
                </button>
                <span className="oxy-device-toolbar__divider" aria-hidden />
                <span className="oxy-device-toolbar__label">Device</span>
                <button
                  type="button"
                  onClick={() => handleDevice("desktop")}
                  className={
                    "oxy-device-toolbar__btn" +
                    (device === "desktop"
                      ? " oxy-device-toolbar__btn--active"
                      : "")
                  }
                  aria-pressed={device === "desktop"}
                >
                  <BiDesktop size={16} />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => handleDevice("mobile")}
                  className={
                    "oxy-device-toolbar__btn" +
                    (device === "mobile"
                      ? " oxy-device-toolbar__btn--active"
                      : "")
                  }
                  aria-pressed={device === "mobile"}
                >
                  <BiMobileAlt size={16} />
                  Mobile
                </button>
              </div>
            )}
            <div
              ref={containerRef}
              style={{ flex: 1, minHeight: 0, position: "relative" }}
            />
          </div>
          {showPropertiesPanel && (
            <div
              className="oxy-properties-panel"
              style={{
                width: propertiesPanelWidth ?? "300px",
                flexShrink: 0,
                height: "100%",
                borderLeft: "1px solid #d2c1b6",
                overflow: "auto",
                display: propertiesOpen ? "flex" : "none",
                flexDirection: "column",
              }}
            >
              <div className="oxy-properties-panel__header">
                {hasSelection ? "Element properties" : "Properties"}
              </div>
              {!hasSelection && (
                <div className="oxy-properties-panel__empty">
                  Select an element on the canvas to edit its colors, spacing,
                  typography, and other styles.
                </div>
              )}
              <div
                ref={propertiesPanelRef}
                style={{
                  flex: 1,
                  display: hasSelection ? "block" : "none",
                  overflow: "auto",
                }}
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width: "100%", height: "100%", ...style }}
      />
    );
  },
);
