import type { Editor as GrapesEditor, Component } from "grapesjs";
import { DEFAULT_DATING_QUIZ, type QuizConfig } from "./schema";
import {
  QUIZ_ACTIVE_STEP_CLASS,
  QUIZ_CONFIG_ATTR,
  QUIZ_MARKER_CLASS,
  decodeQuizConfigAttr,
  encodeQuizConfigAttr,
  renderQuizInnerHtml,
} from "./render";

/**
 * Quiz block — config-driven (see
 * docs/superpowers/specs/2026-06-12-quiz-tool-design.md).
 *
 * The component holds two props:
 *   • `quiz-config` — the QuizConfig object (single source of truth). Every
 *     edit is one `set("quiz-config", next)`, so undo/redo is atomic per
 *     edit with zero custom history wiring.
 *   • `active-step` — 1-based editor-only preview index. Controls which step
 *     carries QUIZ_ACTIVE_STEP_CLASS; canvas-only CSS makes that step
 *     visible. Inline display styles always keep the export invariant
 *     (step 1 flex, rest none) — same trick as multiple-form.
 *
 * Inner components are re-rendered from the config on every change and are
 * not individually selectable — clicking anywhere selects the quiz root,
 * whose editing UI is the React QuizPanel (react/QuizPanel.tsx).
 */

export const QUIZ_COMPONENT_TYPE = "oxy-quiz";

const CANVAS_STYLES = `
.${QUIZ_MARKER_CLASS} .oxy-quiz__step {
  display: none !important;
}
.${QUIZ_MARKER_CLASS} .oxy-quiz__step.${QUIZ_ACTIVE_STEP_CLASS} {
  display: flex !important;
}
@keyframes oxy-quiz-spin { to { transform: rotate(360deg); } }
`;

// Set at registration time so rerender() can exclude derived-children
// rebuilds from the undo stack via the public UndoManager.skip API. One
// editor is mounted at a time (see react/OxyEditor.tsx).
let activeGrapes: GrapesEditor | null = null;

/** Run a derived-state mutation outside the undo stack when possible. */
function skipHistory(fn: () => void): void {
  if (activeGrapes) {
    activeGrapes.UndoManager.skip(fn);
  } else {
    fn();
  }
}

type ComponentLike = Component & {
  get: (key: string) => unknown;
  set: (key: string, value: unknown, opts?: unknown) => void;
  components: (next?: unknown) => unknown;
  find: (selector: string) => Component[];
  addAttributes: (attrs: Record<string, string>) => Component;
  getAttributes: () => Record<string, string>;
  on: (events: string, cb: (...args: unknown[]) => void) => Component;
};

function asLike(c: Component): ComponentLike {
  return c as unknown as ComponentLike;
}

function cloneDefaultConfig(): QuizConfig {
  return JSON.parse(JSON.stringify(DEFAULT_DATING_QUIZ)) as QuizConfig;
}

function getConfig(comp: Component): QuizConfig {
  const raw = asLike(comp).get("quiz-config");
  if (raw && typeof raw === "object") return raw as QuizConfig;
  return cloneDefaultConfig();
}

function walk(comp: unknown, visit: (c: ComponentLike) => void): void {
  const c = comp as ComponentLike | undefined;
  if (!c) return;
  visit(c);
  const children = c.components?.() as
    | { length: number; at: (i: number) => unknown }
    | undefined;
  const len = children?.length ?? 0;
  for (let i = 0; i < len; i++) {
    walk(children!.at(i), visit);
  }
}

/** Lock every descendant so the quiz behaves as one unit on the canvas. */
function lockChildren(root: Component): void {
  const children = asLike(root).components() as {
    length: number;
    at: (i: number) => unknown;
  };
  const len = children?.length ?? 0;
  for (let i = 0; i < len; i++) {
    walk(children.at(i), (c) => {
      c.set("selectable", false);
      c.set("hoverable", false);
      c.set("draggable", false);
      c.set("removable", false);
      c.set("copyable", false);
      c.set("layerable", false);
    });
  }
}

function applyActiveStep(root: Component): void {
  const cfg = getConfig(root);
  const raw = asLike(root).get("active-step");
  let idx = Math.floor(Number(raw) || 1);
  if (!Number.isFinite(idx) || idx < 1) idx = 1;
  if (idx > cfg.steps.length) idx = cfg.steps.length;
  const steps = asLike(root).find(".oxy-quiz__step");
  steps.forEach((step, i) => {
    const like = asLike(step);
    const attrs = like.getAttributes();
    const classes = String(attrs.class || "")
      .split(/\s+/)
      .filter((c) => c && c !== QUIZ_ACTIVE_STEP_CLASS);
    if (i + 1 === idx) classes.push(QUIZ_ACTIVE_STEP_CLASS);
    like.addAttributes({ class: classes.join(" ") });
  });
}

/**
 * Rebuild the inner DOM from the config. Called on drop, design load, and
 * every QuizPanel edit. The config attribute is refreshed so the export
 * (and isComponent hydration on reload) always carries the current state.
 */
function rerender(root: Component): void {
  const cfg = getConfig(root);
  const like = asLike(root);
  const rebuild = () => {
    like.components(renderQuizInnerHtml(cfg));
    like.addAttributes({ [QUIZ_CONFIG_ATTR]: encodeQuizConfigAttr(cfg) });
    lockChildren(root);
    applyActiveStep(root);
  };
  // Children are derived from quiz-config: only the prop change belongs in
  // the undo stack. Undoing the prop re-fires this handler and rebuilds.
  skipHistory(rebuild);
}

function defineComponentType(grapes: GrapesEditor): void {
  grapes.Components.addType(QUIZ_COMPONENT_TYPE, {
    isComponent: (el: HTMLElement) => {
      if (typeof el.classList === "undefined") return undefined;
      if (!el.classList.contains(QUIZ_MARKER_CLASS)) return undefined;
      const decoded = decodeQuizConfigAttr(
        el.getAttribute(QUIZ_CONFIG_ATTR) ?? "",
      );
      return {
        type: QUIZ_COMPONENT_TYPE,
        "quiz-config": decoded ?? cloneDefaultConfig(),
      };
    },
    model: {
      defaults: {
        name: "Quiz",
        droppable: false,
        copyable: false,
        "quiz-config": null,
        "active-step": 1,
        attributes: { class: QUIZ_MARKER_CLASS },
        style: {
          width: "100%",
          display: "flex",
          "flex-direction": "column",
          gap: "16px",
          padding: "16px 0",
        },
        // No GrapesJS traits — editing happens in the React QuizPanel.
        traits: [],
      } as Record<string, unknown>,
      init() {
        const comp = this as unknown as Component;
        asLike(comp).on("change:quiz-config", () => rerender(comp));
        // Preview switching is editor-only state — keep it out of undo.
        asLike(comp).on("change:active-step", () =>
          skipHistory(() => applyActiveStep(comp)),
        );
        // Initial sync — handles block drop, design load, and undo/redo
        // re-instantiation alike.
        rerender(comp);
      },
    },
  });
}

function injectCanvasStyles(grapes: GrapesEditor): void {
  const inject = () => {
    const canvas = grapes.Canvas as unknown as {
      getDocument?: () => Document | null;
    };
    const doc = canvas.getDocument ? canvas.getDocument() : null;
    if (!doc || !doc.head) return;
    if (doc.getElementById("oxy-quiz-canvas-style")) return;
    const style = doc.createElement("style");
    style.id = "oxy-quiz-canvas-style";
    style.textContent = CANVAS_STYLES;
    doc.head.appendChild(style);
  };
  inject();
  grapes.on("load", inject);
}

export function registerQuizBlock(
  grapes: GrapesEditor,
  opts: { blockCategory: string; icon: string },
): void {
  activeGrapes = grapes;
  defineComponentType(grapes);
  injectCanvasStyles(grapes);

  // Block content is an HTML string so every drop hydrates a FRESH config
  // object via isComponent (a shared object literal in block content would
  // alias the same config across multiple dropped quizzes).
  grapes.BlockManager.add("oxy-quiz", {
    label: "Quiz",
    category: opts.blockCategory,
    media: opts.icon,
    content: `<div class="${QUIZ_MARKER_CLASS}" ${QUIZ_CONFIG_ATTR}="${encodeQuizConfigAttr(
      DEFAULT_DATING_QUIZ,
    )}"></div>`,
  });
}
