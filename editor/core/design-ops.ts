import type { Component, Editor as GrapesEditor } from "grapesjs";
import type { ApplyResult, DesignOp } from "../types";
import { adoptBodyRules } from "./body-rule";

// Must match the server's ref grammar (server-dashboard design/refs.ts).
const SAFE_ID = /^[A-Za-z][\w-]*$/;
const SEGMENT = /^([a-z][a-z0-9-]*):nth-of-type\((\d+)\)$/;

const applied: ApplyResult = { status: "applied" };
const skipped = (reason: string): ApplyResult => ({ status: "skipped", reason });

function elementChildren(comp: Component): Component[] {
  return comp.components().filter((c: Component) => {
    const type = c.get("type");
    return type !== "textnode" && type !== "comment" && !!c.get("tagName");
  });
}

const tagOf = (c: Component) => String(c.get("tagName")).toLowerCase();

function findById(root: Component, id: string): Component | null {
  for (const child of elementChildren(root)) {
    if (child.getId() === id) return child;
    const nested = findById(child, id);
    if (nested) return nested;
  }
  return null;
}

/** Resolve a server ref against the component tree (works headless, unlike `find`). */
export function resolveRef(wrapper: Component, ref: string): Component | null {
  const trimmed = ref.trim();
  if (trimmed === "body") return wrapper;
  if (trimmed.startsWith("#")) {
    const id = trimmed.slice(1);
    return SAFE_ID.test(id) ? findById(wrapper, id) : null;
  }
  const parts = trimmed.split(">").map((p) => p.trim());
  if (parts[0] !== "body") return null;
  let current = wrapper;
  for (const part of parts.slice(1)) {
    const match = SEGMENT.exec(part);
    if (!match) return null;
    const [, tag, n] = match;
    const next = elementChildren(current).filter((c) => tagOf(c) === tag)[Number(n) - 1];
    if (!next) return null;
    current = next;
  }
  return current;
}

export function applyDesignOp(editor: GrapesEditor, op: DesignOp): ApplyResult {
  const wrapper = editor.getWrapper();
  if (!wrapper) return skipped("Editor is not ready");

  if (op.kind === "css") {
    editor.Css.addRules(op.css);
    return applied;
  }
  if (op.kind === "full") {
    editor.setComponents(op.html);
    editor.setStyle(op.css);
    adoptBodyRules(editor);
    return applied;
  }

  const target = resolveRef(wrapper, op.ref);
  if (!target) return skipped(`No element matches ${op.ref}`);
  const isBody = target === wrapper;

  if (op.kind === "replace") {
    if (isBody) return skipped("Cannot replace body");
    target.replaceWith(op.html);
    return applied;
  }
  if (op.kind === "remove") {
    if (isBody) return skipped("Cannot remove body");
    target.remove();
    return applied;
  }
  if (op.position === "inside_start") {
    target.append(op.html, { at: 0 });
    return applied;
  }
  if (op.position === "inside_end") {
    target.append(op.html);
    return applied;
  }
  const parent = target.parent();
  if (isBody || !parent) return skipped("Cannot insert next to body");
  parent.append(op.html, { at: target.index() + (op.position === "after" ? 1 : 0) });
  return applied;
}
