import type { Editor as GrapesEditor } from 'grapesjs';

// Counter is per-editor-instance; we read existing keys from the loaded
// document so reloading a saved design picks up where we left off.
function nextKeyFromDoc(grapes: GrapesEditor): () => string {
  let next = 0;
  const wrapper = grapes.getWrapper();
  if (wrapper) {
    wrapper.find('[data-i18n]').forEach((comp) => {
      const k = comp.getAttributes()['data-i18n'];
      if (typeof k === 'string') {
        const m = k.match(/^k(\d+)$/);
        if (m) next = Math.max(next, Number(m[1]) + 1);
      }
    });
  }
  return () => `k${next++}`;
}

function ensureKey(
  comp: any,
  nextKey: () => string,
  seenKeys: Set<string>,
): void {
  const isTextLike = ['text', 'textnode', 'link', 'paragraph', 'heading'].includes(
    comp.get('type'),
  ) || (comp.get('content') && !comp.components()?.length);
  if (!isTextLike) return;

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

  // Initial pass over existing components
  const wrapper = grapes.getWrapper();
  if (wrapper) {
    wrapper.find('*').forEach((c) => ensureKey(c, nextKey, seenKeys));
  }

  const onAdd = (comp: any) => ensureKey(comp, nextKey, seenKeys);
  const onClone = (comp: any) => {
    // Force fresh key on the clone so two visible nodes don't share one.
    comp.removeAttributes(['data-i18n']);
    ensureKey(comp, nextKey, seenKeys);
  };

  grapes.on('component:add', onAdd);
  grapes.on('component:clone', onClone);

  return () => {
    grapes.off('component:add', onAdd);
    grapes.off('component:clone', onClone);
  };
}
