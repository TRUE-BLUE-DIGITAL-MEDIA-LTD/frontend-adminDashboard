import type { Editor as GrapesEditor } from "grapesjs";

type Style = Record<string, string>;

const isImportant = (v: string | undefined) => /!important\s*$/i.test(v ?? "");

/**
 * Merge a stray `body {}` rule into the wrapper's own rule with the same
 * cascade the published page uses: both rules hit the exported `<body
 * id="…">`, where the id rule wins unless only the body value is !important.
 */
export function mergeBodyIntoWrapper(body: Style, wrapper: Style): Style {
  const out: Style = { ...wrapper };
  for (const [prop, value] of Object.entries(body)) {
    const current = out[prop];
    if (current === undefined || (isImportant(value) && !isImportant(current))) {
      out[prop] = value;
    }
  }
  return out;
}

type RuleLike = {
  get(key: string): unknown;
  getSelectors(): { length: number };
  getStyle(): Style;
};

function isPlainBodyRule(rule: RuleLike): boolean {
  const add = String(rule.get("selectorsAdd") ?? "").trim();
  if (add !== "body" || rule.getSelectors().length > 0) return false;
  if (rule.get("state")) return false;
  const atRule = String(rule.get("atRuleType") ?? "");
  return atRule === "" || atRule === "media";
}

/**
 * Some pages (imported/legacy designs) carry their page background on a free
 * `body {}` CSS rule instead of on the Body (wrapper) component. In the
 * canvas the wrapper is a <div> above the iframe <body>, so that background
 * was hidden behind the wrapper, and selecting Body showed nothing to edit or
 * remove. Move those declarations onto the wrapper's id rule — the published
 * output is unchanged because the wrapper exports as that same <body>.
 */
export function adoptBodyRules(grapes: GrapesEditor): void {
  const wrapper = grapes.getWrapper();
  if (!wrapper) return;
  const css = grapes.Css;
  const rules = (css.getRules() as unknown as RuleLike[]).filter(isPlainBodyRule);
  if (rules.length === 0) return;

  const id = wrapper.getId();
  for (const rule of rules) {
    const mediaText = String(rule.get("mediaText") ?? "");
    const existing = css.getIdRule(id, { mediaText });
    const merged = mergeBodyIntoWrapper(
      rule.getStyle(),
      (existing?.getStyle() as Style | undefined) ?? {},
    );
    css.setIdRule(id, merged, { mediaText });
    css.remove(rule as never);
  }
  // Make sure the id rule's selector is the one the wrapper exports.
  wrapper.addAttributes({ id });
}
