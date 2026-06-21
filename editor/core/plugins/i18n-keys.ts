import type { Editor as GrapesEditor } from 'grapesjs';

// Recursive walk of the GrapesJS component tree. Used instead of
// `wrapper.find('*')` / `wrapper.find('[data-i18n]')` because the find()
// selector behavior is inconsistent across GrapesJS versions and sometimes
// returns nothing when components are loaded from project data.
function walk(comp: any, visit: (c: any) => void): void {
  if (!comp) return;
  visit(comp);
  const children = comp.components?.();
  const len = children?.length ?? 0;
  for (let i = 0; i < len; i++) {
    walk(children.at(i), visit);
  }
}

// Counter is per-editor-instance; we read existing keys from the loaded
// document so reloading a saved design picks up where we left off.
function nextKeyFromDoc(grapes: GrapesEditor): () => string {
  let next = 0;
  const wrapper = grapes.getWrapper();
  walk(wrapper, (comp) => {
    const k = comp.getAttributes?.()?.['data-i18n'];
    if (typeof k === 'string') {
      const m = k.match(/^k(\d+)$/);
      if (m) next = Math.max(next, Number(m[1]) + 1);
    }
  });
  return () => `k${next++}`;
}

/**
 * Does this component have non-whitespace text DIRECTLY inside it (ignoring
 * descendant elements)? Mirrors the backend `keyTranslatableText` rule in
 * `server-dashboard/src/admin/landing-page/i18n/translatable-text.ts`.
 *
 * A `<div><p><span>hi</span></p></div>` keys ONLY the span. A `<p>Hello
 * <strong>bold</strong> world</p>` keys both the p (own text "Hello world")
 * and the strong (own text "bold").
 */
function hasOwnText(comp: any): boolean {
  const children = comp.components?.();
  if (!children) return false;
  for (let i = 0; i < children.length; i++) {
    const child = children.at(i);
    if (child?.get?.('type') === 'textnode') {
      const content = child.get('content');
      if (typeof content === 'string' && content.trim().length > 0) return true;
    }
  }
  return false;
}

// Quiz blocks (core/tools/quiz) stamp their own deterministic keys
// (quiz.<stepId>.…) in render.ts. Auto-keying must leave the whole quiz
// subtree alone: the seenKeys dedupe below would otherwise re-key those
// nodes on every config re-render, orphaning saved translations.
function isInsideQuiz(comp: any): boolean {
  let cur = comp;
  while (cur) {
    const cls = String(cur.getAttributes?.()?.class ?? '');
    if (cls.split(/\s+/).includes('oxy-quiz')) return true;
    cur = cur.parent?.();
  }
  return false;
}

function ensureKey(
  comp: any,
  nextKey: () => string,
  seenKeys: Set<string>,
): void {
  if (isInsideQuiz(comp)) return;
  // Never key script/style — same exclusion the backend uses.
  const tag = comp.get('tagName');
  if (tag === 'script' || tag === 'style') return;

  if (!hasOwnText(comp)) return;

  const attrs = comp.getAttributes();
  let key = attrs['data-i18n'];
  if (key && seenKeys.has(key)) {
    // Two visible nodes can never share a key (e.g. after duplicate).
    key = undefined;
  }
  if (!key) {
    key = nextKey();
    comp.addAttributes({ 'data-i18n': key });
  }
  seenKeys.add(key);
}

export function registerI18nKeysPlugin(grapes: GrapesEditor): () => void {
  const nextKey = nextKeyFromDoc(grapes);
  const seenKeys = new Set<string>();

  // Initial pass over existing components. Recursive walk so we visit every
  // descendant — `wrapper.find('*')` returns inconsistent results.
  walk(grapes.getWrapper(), (c) => ensureKey(c, nextKey, seenKeys));

  // New components added later (drag-drop, paste, programmatic insert) also
  // need keying — walk the subtree because `component:add` only fires for
  // the inserted root, not its descendants.
  const onAdd = (comp: any) =>
    walk(comp, (c) => ensureKey(c, nextKey, seenKeys));
  const onClone = (comp: any) => {
    // Force fresh keys on the clone subtree so duplicates don't share keys.
    walk(comp, (c) => {
      c.removeAttributes?.(['data-i18n']);
      ensureKey(c, nextKey, seenKeys);
    });
  };

  grapes.on('component:add', onAdd);
  grapes.on('component:clone', onClone);

  return () => {
    grapes.off('component:add', onAdd);
    grapes.off('component:clone', onClone);
  };
}
