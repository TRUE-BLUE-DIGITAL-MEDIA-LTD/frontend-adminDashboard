const TEXT_NODE = 3;

/** Original/written data for text nodes we changed, so a preview can revert. */
export type OwnTextMemo = WeakMap<Text, { original: string; written: string }>;

function ownTextNodes(el: Element): Text[] {
  return Array.from(el.childNodes).filter(
    (n) => n.nodeType === TEXT_NODE,
  ) as Text[];
}

/**
 * Put back text nodes changed by `replaceOwnText`, unless someone has edited
 * them since (then their edit wins).
 */
export function restoreOwnText(el: Element, memo: OwnTextMemo): void {
  for (const node of ownTextNodes(el)) {
    const m = memo.get(node);
    if (!m) continue;
    if (node.data === m.written) node.data = m.original;
    memo.delete(node);
  }
}

/**
 * Replace only the element's OWN text (its direct text-node children), never
 * its child elements. Mirrors `applyI18nSubstitution` in the landing page
 * renderer: a key's string is the element's own text, so `<p>Get <span
 * style="color:orange">50% off</span> today</p>` keys the p and the span
 * separately, and assigning `textContent` on the p would destroy the span.
 *
 * The translation goes into the first non-blank text node (keeping its
 * surrounding whitespace); other non-blank own text nodes collapse to a single
 * space so inline spacing around child elements survives.
 */
export function replaceOwnText(
  el: Element,
  text: string,
  memo?: OwnTextMemo,
): void {
  const textNodes = ownTextNodes(el);

  const current = textNodes.map((n) => n.data).join("").trim();
  if (current === text.trim()) return; // already showing this text

  const filled = textNodes.filter((n) => n.data.trim().length > 0);
  if (filled.length === 0) {
    // No own text left to replace. Only safe to write when there are no
    // child elements to destroy.
    if (el.children.length === 0) el.textContent = text;
    return;
  }

  filled.forEach((node, i) => {
    const original = node.data;
    if (i === 0) {
      const lead = original.match(/^\s*/)?.[0] ?? "";
      const trail = original.match(/\s*$/)?.[0] ?? "";
      node.data = lead + text.trim() + trail;
    } else {
      node.data = /\s/.test(original) ? " " : "";
    }
    memo?.set(node, { original, written: node.data });
  });
}
