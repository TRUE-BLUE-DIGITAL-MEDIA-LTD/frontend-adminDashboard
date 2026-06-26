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
  BiImages,
  BiImageAdd,
} from "react-icons/bi";
import { mountEngine, type Engine } from "../core/engine";
import ImageLibraryModal from "./ImageLibraryModal";
import {
  GetSignURLService,
  UploadSignURLService,
} from "@/services/cloud-storage";
import type {
  DesignJson,
  EditorInstance,
  EditorMode,
  Language,
  Translations,
} from "../types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TranslationsPanel } from "./TranslationsPanel";
import { QuizPanel } from "./QuizPanel";

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

  /** Admin users can upload/edit/delete library images; all users can browse. */
  isAdmin?: boolean;

  /** When provided, enables multilingual editing in the toolbar/panels. */
  primaryLanguage?: Language;
  supportedLanguages?: Language[];
  currentLanguage?: Language;
  translations?: Translations;
  onTranslationsChange?(next: Translations): void;
  onCurrentLanguageChange?(lang: Language): void;
  onAddLanguage?(): void;
  /** Fires the bulk dialog flow. Parent runs the actual stream. */
  onRequestTranslateAll?(): void;
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
      isAdmin = false,
      primaryLanguage,
      supportedLanguages,
      currentLanguage,
      translations,
      onTranslationsChange,
      onCurrentLanguageChange,
      onAddLanguage,
      onRequestTranslateAll,
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
    const [selectedI18nKey, setSelectedI18nKey] = useState<string | null>(null);
    const [quizSelected, setQuizSelected] = useState<any | null>(null);

    // Image library modal. `onSelect` is supplied by whoever opened it
    // (toolbar = insert <img>; bg-picker / asset-manager = set the URL).
    const [libraryOpen, setLibraryOpen] = useState(false);
    const librarySelectRef = useRef<((url: string) => void) | null>(null);
    const logoInputRef = useRef<HTMLInputElement | null>(null);

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
        setPreviewHtml(doc);
      });
    }
    function closePreview() {
      setPreviewHtml(null);
    }

    function openLibrary(onSelect: (url: string) => void) {
      librarySelectRef.current = onSelect;
      setLibraryOpen(true);
    }

    function insertImageComponent(url: string) {
      const g = engineRef.current?.grapes;
      if (!g) return;
      const node = {
        type: "image",
        attributes: { class: "oxy-image-block", alt: "", src: url },
        style: {
          padding: "8px",
          "max-width": "100%",
          display: "block",
          "margin-left": "auto",
          "margin-right": "auto",
        },
      };
      const sel = g.getSelected();
      if (sel) sel.append(node);
      else g.getWrapper()?.append(node);
    }

    function insertLogoComponent(url: string) {
      const g = engineRef.current?.grapes;
      if (!g) return;
      g.getWrapper()?.append({
        type: "image",
        attributes: { class: "oxy-logo", alt: "Logo", src: url },
        style: {
          display: "block",
          "margin-left": "auto",
          "margin-right": "auto",
          "max-width": "200px",
          padding: "8px",
        },
      });
    }

    async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const sign = await GetSignURLService({
          fileName: file.name,
          fileType: file.type,
          category: "image-library",
        });
        await UploadSignURLService({
          file,
          signURL: sign.signURL,
          contentType: file.type,
        });
        insertLogoComponent(sign.originalURL);
      } catch (err) {
        console.error("[oxy-editor] logo upload failed", err);
      }
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
        isAdmin,
      });
      engineRef.current = engine;
      setInstance(engine.instance);
      onReady?.(engine.instance);

      if (initialDevice && initialDevice !== "desktop") {
        engine.grapes.setDevice(initialDevice);
      }

      const findI18nKey = (comp: any): string | null => {
        if (!comp) return null;
        const own = comp.getAttributes?.()?.["data-i18n"];
        if (typeof own === "string" && own.length > 0) return own;
        // Recursive descent — GrapesJS `find()` with attribute selectors is
        // unreliable across versions, so walk the tree by hand.
        const children = comp.components?.();
        const len = children?.length ?? 0;
        for (let i = 0; i < len; i++) {
          const child = children.at(i);
          const found = findI18nKey(child);
          if (found) return found;
        }
        return null;
      };

      const onSelect = (comp?: any) => {
        setHasSelection(true);
        setSelectedI18nKey(findI18nKey(comp));
        setQuizSelected(comp?.is?.("oxy-quiz") ? comp : null);
      };
      const onDeselect = () => {
        setHasSelection(false);
        setSelectedI18nKey(null);
        setQuizSelected(null);
      };
      engine.grapes.on("component:selected", onSelect);
      engine.grapes.on("component:deselected", onDeselect);

      const onOpenLibrary = (payload?: {
        onSelect?: (url: string) => void;
      }) => {
        openLibrary(payload?.onSelect ?? insertImageComponent);
      };
      engine.grapes.on("oxy:open-image-library", onOpenLibrary);

      return () => {
        engine.grapes.off("component:selected", onSelect);
        engine.grapes.off("component:deselected", onDeselect);
        engine.grapes.off("oxy:open-image-library", onOpenLibrary);
        engine.destroy();
        engineRef.current = null;
        setInstance(null);
        setHasSelection(false);
        setSelectedI18nKey(null);
        setQuizSelected(null);
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

    useEffect(() => {
      const engine = engineRef.current;
      if (
        !engine ||
        !instance ||
        !translations ||
        !primaryLanguage ||
        !currentLanguage
      ) {
        return;
      }
      const doc = engine.grapes.Canvas.getDocument();
      if (!doc) return;

      doc.querySelectorAll("[data-i18n]").forEach((node) => {
        const tag = node.tagName.toLowerCase();
        if (tag === "script" || tag === "style") return;
        const key = node.getAttribute("data-i18n");
        if (!key) return;

        const target = translations[currentLanguage]?.strings?.[key];
        if (typeof target === "string" && target.length > 0) {
          node.textContent = target;
          return;
        }
        const primary = translations[primaryLanguage]?.strings?.[key];
        if (typeof primary === "string" && primary.length > 0) {
          node.textContent = primary;
        }
      });
    }, [currentLanguage, translations, primaryLanguage, instance]);

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
          {libraryOpen && (
            <ImageLibraryModal
              isAdmin={isAdmin}
              onSelect={(url) => librarySelectRef.current?.(url)}
              onClose={() => setLibraryOpen(false)}
            />
          )}
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
                overflow: "auto",
                display: layersOpen ? "flex" : "none",
                flexDirection: "column",
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
                {primaryLanguage && supportedLanguages && currentLanguage && (
                  <>
                    <span className="oxy-device-toolbar__divider" aria-hidden />
                    <LanguageSwitcher
                      primary={primaryLanguage}
                      supported={supportedLanguages}
                      current={currentLanguage}
                      onChange={(lang) => onCurrentLanguageChange?.(lang)}
                      onAddLanguage={() => onAddLanguage?.()}
                    />
                    <button
                      type="button"
                      onClick={() => onRequestTranslateAll?.()}
                      className="oxy-device-toolbar__btn"
                      aria-label="Translate all"
                      title="Translate all"
                    >
                      ↻ Translate all
                    </button>
                  </>
                )}
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
                  onClick={() => openLibrary(insertImageComponent)}
                  className="oxy-device-toolbar__btn"
                  aria-label="Open image library"
                  title="Image library"
                >
                  <BiImages size={16} />
                  Images
                </button>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="oxy-device-toolbar__btn"
                  aria-label="Upload logo"
                  title="Upload a logo for this lander (not saved to the library)"
                >
                  <BiImageAdd size={16} />
                  Logo
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleLogoFile}
                />
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
                overflow: "auto",
                display: propertiesOpen ? "flex" : "none",
                flexDirection: "column",
              }}
            >
              <div className="oxy-properties-panel__header">
                {quizSelected
                  ? "Quiz"
                  : hasSelection
                    ? "Element properties"
                    : "Properties"}
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
                  display: hasSelection && !quizSelected ? "block" : "none",
                  overflow: "auto",
                }}
              />
              {quizSelected && engineRef.current && (
                <div style={{ flex: 1, overflow: "auto" }}>
                  <QuizPanel
                    key={String(
                      (quizSelected as { cid?: string }).cid ?? "quiz",
                    )}
                    component={quizSelected}
                    grapes={engineRef.current.grapes}
                  />
                </div>
              )}
              {primaryLanguage && supportedLanguages && translations && (
                <TranslationsPanel
                  i18nKey={selectedI18nKey}
                  primary={primaryLanguage}
                  supported={supportedLanguages}
                  translations={translations}
                  onChange={(lang, key, value) => {
                    const next: Translations = {
                      ...translations,
                      [lang]: {
                        ...(translations[lang] ?? {
                          strings: {},
                          title: "",
                          description: "",
                        }),
                        strings: {
                          ...(translations[lang]?.strings ?? {}),
                          [key]: value,
                        },
                      },
                    };
                    onTranslationsChange?.(next);
                  }}
                  onTranslateOne={(lang, key) => {
                    // Hand off to parent. Parent decides what AI flow to run.
                    onRequestTranslateAll?.();
                  }}
                />
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <div
          ref={containerRef}
          className={className}
          style={{ width: "100%", height: "100%", ...style }}
        />
        {libraryOpen && (
          <ImageLibraryModal
            isAdmin={isAdmin}
            onSelect={(url) => librarySelectRef.current?.(url)}
            onClose={() => setLibraryOpen(false)}
          />
        )}
      </>
    );
  },
);
