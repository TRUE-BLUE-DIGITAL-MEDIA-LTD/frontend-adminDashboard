import { describe, expect, it } from "vitest";
import {
  CONSENT_LINK_CLASS,
  DEFAULT_CONSENT_TEXT,
  DEFAULT_PRIVACY_LINK_TEXT,
  MAX_STEPS,
  SUBMIT_STEP_CLASS,
  MAX_ANSWER_KEYS,
  applyInputFieldAttrs,
  applyInputStepCta,
  applySubmitStepButtonStyling,
  applySubmitStepFields,
  countAnswerKeySources,
  isAnswerKeyCapReached,
  isAnswerStepCapReached,
  makeDefaultRootTree,
  makeInputStepTreeNode,
  makeSubmitStepTreeNode,
  normalizeSubmitStepChildren,
  stepListCounterText,
} from "./multiple-form";

// Recursively collect { attributes.class } strings from a component tree.
function collectClasses(node: any, acc: string[] = []): string[] {
  const cls = node?.attributes?.class;
  if (typeof cls === "string") acc.push(cls);
  const children = Array.isArray(node?.components) ? node.components : [];
  for (const child of children) {
    if (typeof child === "object" && child !== null) {
      collectClasses(child, acc);
    }
  }
  return acc;
}

// ---- Component stubs for the trait-application functions ----------------
// These functions only use: get/set, addAttributes, getAttributes, setStyle,
// components(next?), find(".class"). A plain object tree is enough.

type StubNode = {
  cls: string;
  props: Record<string, unknown>;
  attrs: Record<string, string>;
  style: Record<string, string> | null;
  styleCalls: number;
  text: unknown;
  children: StubNode[];
};

function makeStubNode(cls: string, children: StubNode[] = []): StubNode {
  return {
    cls,
    props: {},
    attrs: { class: cls },
    style: null,
    styleCalls: 0,
    text: null,
    children,
  };
}

function asFakeComponent(stub: StubNode): any {
  return {
    get: (k: string) => stub.props[k],
    set: (k: string, v: unknown) => {
      stub.props[k] = v;
    },
    addAttributes: (attrs: Record<string, string>) => {
      Object.assign(stub.attrs, attrs);
    },
    removeAttributes: (names: string[]) => {
      for (const n of names) delete stub.attrs[n];
    },
    getAttributes: () => stub.attrs,
    setStyle: (style: Record<string, string>) => {
      stub.style = style;
      stub.styleCalls += 1;
    },
    components: (next?: unknown) => {
      if (next !== undefined) {
        stub.text = next;
        return [];
      }
      return stub.children.map(asFakeComponent);
    },
    find: (selector: string) => {
      const cls = selector.startsWith(".") ? selector.slice(1) : selector;
      const found: any[] = [];
      const walk = (node: StubNode) => {
        if ((node.attrs.class ?? "").split(/\s+/).includes(cls)) {
          found.push(asFakeComponent(node));
        }
        node.children.forEach(walk);
      };
      stub.children.forEach(walk);
      return found;
    },
    is: () => false,
    parent: () => undefined,
    on: () => {},
    append: (def: any) => {
      const child = makeStubNode(String(def?.attributes?.class ?? ""));
      Object.assign(child.attrs, def?.attributes ?? {});
      if (typeof def?.components === "string") child.text = def.components;
      if (def?.style) child.style = def.style;
      for (const key of [
        "draggable",
        "copyable",
        "removable",
        "editable",
        "selectable",
        "hoverable",
      ]) {
        if (def?.[key] !== undefined) child.props[key] = def[key];
      }
      stub.children.push(child);
      return [asFakeComponent(child)];
    },
    remove: () => ({}),
  };
}

function makeStubSubmitStep() {
  const title = makeStubNode("oxy-form-step-title");
  const divider = makeStubNode("oxy-form-step-divider");
  const emailInput = makeStubNode("oxy-form-email-input");
  const checkbox = makeStubNode("oxy-form-consent-checkbox");
  const consentSpan = makeStubNode("oxy-form-consent-text");
  const consentLink = makeStubNode("oxy-form-consent-link");
  const consentRow = makeStubNode("oxy-form-consent-row", [
    checkbox,
    consentSpan,
    consentLink,
  ]);
  const cta = makeStubNode("oxy-form-submit-cta");
  const root = makeStubNode("form_step oxy-form-submit-step", [
    title,
    divider,
    emailInput,
    consentRow,
    cta,
  ]);
  return {
    step: asFakeComponent(root),
    root,
    title,
    divider,
    emailInput,
    checkbox,
    consentRow,
    consentSpan,
    consentLink,
    cta,
  };
}

function makeLegacyStubSubmitStep() {
  const title = makeStubNode("oxy-form-step-title");
  const divider = makeStubNode("oxy-form-step-divider");
  const emailInput = makeStubNode("oxy-form-email-input");
  const checkbox = makeStubNode("oxy-form-consent-checkbox");
  const consentSpan = makeStubNode("oxy-form-consent-text");
  const consentRow = makeStubNode("oxy-form-consent-row", [
    checkbox,
    consentSpan,
  ]);
  const cta = makeStubNode("oxy-form-submit-cta");
  const root = makeStubNode("form_step oxy-form-submit-step", [
    title,
    divider,
    emailInput,
    consentRow,
    cta,
  ]);
  return { step: asFakeComponent(root), root, consentRow };
}

describe("makeDefaultRootTree", () => {
  const tree = makeDefaultRootTree() as any;
  const steps = tree.components as any[];

  it("drops in as a 4-step dating flow ending in the submission step", () => {
    expect(steps).toHaveLength(4);
    expect(steps[3].type).toBe("oxy-form-submit-step");
    expect(steps.slice(0, 3).every((s) => s.type === "oxy-form-step")).toBe(
      true,
    );
  });

  it("covers gender, age, interests answer keys", () => {
    expect(steps.map((s) => s["step-type"]).slice(0, 3)).toEqual([
      "gender",
      "age",
      "interests",
    ]);
  });

  it("stays under the answer-step cap", () => {
    const answerSteps = steps.filter((s) => s.type === "oxy-form-step");
    expect(answerSteps.length).toBeLessThanOrEqual(MAX_STEPS);
    expect(MAX_STEPS).toBe(10);
  });
});

describe("answer-key cap (server sanitizer limit)", () => {
  it("MAX_ANSWER_KEYS mirrors the server's 20-key formAnswers limit", () => {
    expect(MAX_ANSWER_KEYS).toBe(20);
    expect(isAnswerKeyCapReached(19)).toBe(false);
    expect(isAnswerKeyCapReached(20)).toBe(true);
    expect(isAnswerKeyCapReached(21)).toBe(true);
  });

  it("countAnswerKeySources counts option steps + input fields, not submit", () => {
    const fieldA = makeStubNode("oxy-form-input-field");
    const fieldB = makeStubNode("oxy-form-input-field");
    const optionStep1 = makeStubNode("form_step");
    const optionStep2 = makeStubNode("form_step");
    const inputStep = makeStubNode("form_step oxy-form-input-step", [
      fieldA,
      fieldB,
    ]);
    const submitStep = makeStubNode("form_step oxy-form-submit-step");
    const root = makeStubNode("oxy-multiple-form", [
      optionStep1,
      optionStep2,
      inputStep,
      submitStep,
    ]);

    // 2 option steps (1 key each) + 2 input fields = 4 key sources.
    expect(countAnswerKeySources(asFakeComponent(root))).toBe(4);
  });
});

describe("answer-step cap", () => {
  it("counts answer steps only — the submission step never eats a slot", () => {
    expect(isAnswerStepCapReached(MAX_STEPS - 1)).toBe(false);
    expect(isAnswerStepCapReached(MAX_STEPS)).toBe(true);
    expect(isAnswerStepCapReached(MAX_STEPS + 1)).toBe(true);
  });

  it("allows more than 4 answer steps (the old bug)", () => {
    expect(isAnswerStepCapReached(5)).toBe(false);
    expect(isAnswerStepCapReached(9)).toBe(false);
  });

  it("stepListCounterText shows progress toward the limit", () => {
    expect(stepListCounterText(3)).toBe(`Answer steps: 3 / ${MAX_STEPS}`);
  });

  it("stepListCounterText announces when the limit is reached", () => {
    expect(stepListCounterText(MAX_STEPS)).toBe(
      `Answer steps: ${MAX_STEPS} / ${MAX_STEPS} — limit reached`,
    );
  });
});

describe("makeSubmitStepTreeNode", () => {
  const node = makeSubmitStepTreeNode({
    title: "Almost done!",
    emailPlaceholder: "Enter your email",
    consentText: DEFAULT_CONSENT_TEXT,
    ctaText: "Continue",
    privacyLinkText: "Privacy Policy",
    privacyLinkUrl: "",
    buttonColor: "#dc2626",
    textColor: "#ffffff",
    buttonPadding: 10,
    buttonRadius: 8,
    isActive: false,
  }) as any;

  it("is a form_step so numbering/navigation counts it", () => {
    expect(node.attributes.class).toContain("form_step");
    expect(node.attributes.class).toContain(SUBMIT_STEP_CLASS);
  });

  it("contains the email input, consent checkbox, and CTA (contract classes)", () => {
    const classes = collectClasses(node).join(" ");
    expect(classes).toContain("oxy-form-email-input");
    expect(classes).toContain("oxy-form-consent-checkbox");
    expect(classes).toContain("oxy-form-submit-cta");
  });

  it("CTA is type=button so the legacy submit hijack in index.tsx skips it", () => {
    const findCta = (n: any): any => {
      if (
        typeof n?.attributes?.class === "string" &&
        n.attributes.class.includes("oxy-form-submit-cta")
      ) {
        return n;
      }
      const children = Array.isArray(n?.components) ? n.components : [];
      for (const c of children) {
        if (typeof c === "object" && c !== null) {
          const hit = findCta(c);
          if (hit) return hit;
        }
      }
      return null;
    };
    const cta = findCta(node);
    expect(cta).not.toBeNull();
    expect(cta.attributes.type).toBe("button");
  });

  it("email input is a required email field, checkbox is required", () => {
    const flat: any[] = [];
    const walk = (n: any) => {
      flat.push(n);
      const children = Array.isArray(n?.components) ? n.components : [];
      for (const c of children) {
        if (typeof c === "object" && c !== null) walk(c);
      }
    };
    walk(node);
    const email = flat.find((n) =>
      String(n?.attributes?.class ?? "").includes("oxy-form-email-input"),
    );
    expect(email.attributes.type).toBe("email");
    expect(email.attributes.required).toBe("required");
    const checkbox = flat.find((n) =>
      String(n?.attributes?.class ?? "").includes("oxy-form-consent-checkbox"),
    );
    expect(checkbox.attributes.type).toBe("checkbox");
    expect(checkbox.attributes.required).toBe("required");
  });

  it("children are selectable/hoverable for the Style Manager but structurally locked", () => {
    const flat: any[] = [];
    const walk = (n: any) => {
      flat.push(n);
      const children = Array.isArray(n?.components) ? n.components : [];
      for (const c of children) {
        if (typeof c === "object" && c !== null) walk(c);
      }
    };
    for (const child of node.components) walk(child);

    for (const child of flat) {
      // selectable/hoverable must be left at their GrapesJS defaults (true)
      expect(child.selectable).toBeUndefined();
      expect(child.hoverable).toBeUndefined();
      expect(child.draggable).toBe(false);
      expect(child.copyable).toBe(false);
      expect(child.removable).toBe(false);
    }
  });

  it("trait-driven text children block inline editing", () => {
    const flat: any[] = [];
    const walk = (n: any) => {
      flat.push(n);
      const children = Array.isArray(n?.components) ? n.components : [];
      for (const c of children) {
        if (typeof c === "object" && c !== null) walk(c);
      }
    };
    for (const child of node.components) walk(child);

    const byClass = (cls: string) =>
      flat.find((n) => String(n?.attributes?.class ?? "").includes(cls));
    expect(byClass("oxy-form-step-title")?.editable).toBe(false);
    expect(byClass("oxy-form-consent-text")?.editable).toBe(false);
    expect(byClass("oxy-form-submit-cta")?.editable).toBe(false);
  });
});

describe("submit step privacy link markup", () => {
  const flatten = (n: any, acc: any[] = []): any[] => {
    acc.push(n);
    const children = Array.isArray(n?.components) ? n.components : [];
    for (const c of children) {
      if (typeof c === "object" && c !== null) flatten(c, acc);
    }
    return acc;
  };
  const findLink = (node: any) =>
    flatten(node).find((n) =>
      String(n?.attributes?.class ?? "").includes(CONSENT_LINK_CLASS),
    );

  it("renders a locked, non-editable anchor inside the consent row", () => {
    const node = makeSubmitStepTreeNode({
      title: "Almost done!",
      emailPlaceholder: "Enter your email",
      consentText: DEFAULT_CONSENT_TEXT,
      ctaText: "Continue",
      privacyLinkText: "Privacy Policy",
      privacyLinkUrl: "https://example.com/privacy",
      buttonColor: "#dc2626",
      textColor: "#ffffff",
      buttonPadding: 10,
      buttonRadius: 8,
      isActive: false,
    }) as any;
    const link = findLink(node);
    expect(link).toBeTruthy();
    expect(link.tagName).toBe("a");
    expect(link.attributes.target).toBe("_blank");
    expect(link.attributes.rel).toBe("noopener noreferrer");
    expect(link.attributes.href).toBe("https://example.com/privacy");
    expect(link.attributes.hidden).toBeUndefined();
    expect(link.components).toBe("Privacy Policy");
    expect(link.editable).toBe(false);
    expect(link.draggable).toBe(false);
    expect(link.copyable).toBe(false);
    expect(link.removable).toBe(false);
    // Blue + underlined so visitors recognize it as clickable.
    expect(link.style.color).toBe("#2563eb");
    expect(link.style["text-decoration"]).toBe("underline");
  });

  it("is hidden (attribute, not display) when the URL is empty", () => {
    const node = makeSubmitStepTreeNode({
      title: "Almost done!",
      emailPlaceholder: "Enter your email",
      consentText: DEFAULT_CONSENT_TEXT,
      ctaText: "Continue",
      privacyLinkText: "Privacy Policy",
      privacyLinkUrl: "",
      buttonColor: "#dc2626",
      textColor: "#ffffff",
      buttonPadding: 10,
      buttonRadius: 8,
      isActive: false,
    }) as any;
    const link = findLink(node);
    expect(link.attributes.hidden).toBe("hidden");
    expect(link.attributes.href).toBeUndefined();
    expect(link.style.display).toBeUndefined();
  });

  it("default block drop ships the link hidden with default text", () => {
    const tree = makeDefaultRootTree() as any;
    const submit = tree.components[3];
    const link = findLink(submit);
    expect(link).toBeTruthy();
    expect(link.attributes.hidden).toBe("hidden");
    expect(link.components).toBe(DEFAULT_PRIVACY_LINK_TEXT);
    expect(DEFAULT_PRIVACY_LINK_TEXT).toBe("Privacy Policy");
  });
});

describe("submit step trait application", () => {
  it("applySubmitStepFields syncs text + text data attrs and never styles the CTA", () => {
    const { step, root, emailInput, consentSpan, cta } = makeStubSubmitStep();
    step.set("step-title", "Almost done!");
    step.set("email-placeholder", "you@example.com");
    step.set("consent-text", "I agree.");
    step.set("cta-text", "Go");

    applySubmitStepFields(step);

    expect(emailInput.attrs.placeholder).toBe("you@example.com");
    expect(consentSpan.text).toBe("I agree.");
    expect(cta.text).toBe("Go");
    expect(root.attrs["data-oxy-step-title"]).toBe("Almost done!");
    expect(root.attrs["data-oxy-email-placeholder"]).toBe("you@example.com");
    expect(root.attrs["data-oxy-consent-text"]).toBe("I agree.");
    expect(root.attrs["data-oxy-cta-text"]).toBe("Go");
    // The critical fix: loading/syncing text must not clobber custom styles.
    expect(cta.styleCalls).toBe(0);
  });

  it("applySubmitStepFields syncs the privacy link text, href, and data attrs", () => {
    const { step, root, consentLink } = makeStubSubmitStep();
    step.set("privacy-link-text", "Our Privacy Policy");
    step.set("privacy-link-url", "https://example.com/privacy");

    applySubmitStepFields(step);

    expect(consentLink.text).toBe("Our Privacy Policy");
    expect(consentLink.attrs.href).toBe("https://example.com/privacy");
    expect(consentLink.attrs.hidden).toBeUndefined();
    expect(root.attrs["data-oxy-privacy-link-text"]).toBe(
      "Our Privacy Policy",
    );
    expect(root.attrs["data-oxy-privacy-link-url"]).toBe(
      "https://example.com/privacy",
    );
    // Style survival: syncing text must never restyle the link.
    expect(consentLink.styleCalls).toBe(0);
  });

  it("applySubmitStepFields hides the link via the hidden attribute when the URL is emptied", () => {
    const { step, consentLink } = makeStubSubmitStep();
    // Simulate a previously-set URL now cleared to whitespace.
    consentLink.attrs.href = "https://old.example.com/privacy";
    step.set("privacy-link-url", "   ");

    applySubmitStepFields(step);

    expect(consentLink.attrs.hidden).toBe("hidden");
    expect(consentLink.attrs.href).toBeUndefined();
    expect(consentLink.text).toBe(DEFAULT_PRIVACY_LINK_TEXT);
  });

  it("applySubmitStepButtonStyling styles the CTA from traits and stamps style data attrs", () => {
    const { step, root, cta } = makeStubSubmitStep();
    step.set("button-color", "#123456");
    step.set("text-color", "#ffffff");
    step.set("button-padding", 12);
    step.set("button-radius", 4);

    applySubmitStepButtonStyling(step);

    expect(cta.styleCalls).toBe(1);
    expect(cta.style?.["background-color"]).toBe("#123456");
    expect(cta.style?.color).toBe("#ffffff");
    expect(cta.style?.["border-radius"]).toBe("4px");
    expect(cta.style?.["padding-top"]).toBe("12px");
    expect(root.attrs["data-oxy-button-color"]).toBe("#123456");
    expect(root.attrs["data-oxy-text-color"]).toBe("#ffffff");
    expect(root.attrs["data-oxy-button-padding"]).toBe("12");
    expect(root.attrs["data-oxy-button-radius"]).toBe("4");
  });

  it("applySubmitStepButtonStyling falls back to defaults for missing/invalid numbers", () => {
    const { step, cta } = makeStubSubmitStep();
    step.set("button-padding", Number.NaN);

    applySubmitStepButtonStyling(step);

    // DEFAULT_BUTTON_PADDING = 10, DEFAULT_BUTTON_RADIUS = 8
    expect(cta.style?.["padding-top"]).toBe("10px");
    expect(cta.style?.["border-radius"]).toBe("8px");
  });
});

describe("normalizeSubmitStepChildren", () => {
  it("re-enables selection on children locked by pages saved before the unlock", () => {
    const stubs = makeStubSubmitStep();
    const all = [
      stubs.title,
      stubs.divider,
      stubs.emailInput,
      stubs.consentRow,
      stubs.checkbox,
      stubs.consentSpan,
      stubs.cta,
    ];
    // Simulate the persisted pre-unlock flags.
    for (const s of all) {
      s.props.selectable = false;
      s.props.hoverable = false;
    }

    normalizeSubmitStepChildren(stubs.step);

    for (const s of all) {
      expect(s.props.selectable).toBe(true);
      expect(s.props.hoverable).toBe(true);
      expect(s.props.draggable).toBe(false);
      expect(s.props.copyable).toBe(false);
      expect(s.props.removable).toBe(false);
    }
    expect(stubs.title.props.editable).toBe(false);
    expect(stubs.consentSpan.props.editable).toBe(false);
    expect(stubs.cta.props.editable).toBe(false);
    // Non-text children keep editable untouched.
    expect(stubs.emailInput.props.editable).toBeUndefined();
    expect(stubs.divider.props.editable).toBeUndefined();
  });

  it("appends a hidden privacy link to legacy submit steps missing one", () => {
    const { step, consentRow } = makeLegacyStubSubmitStep();

    normalizeSubmitStepChildren(step);

    const link = consentRow.children.find((c) =>
      c.attrs.class.includes(CONSENT_LINK_CLASS),
    );
    expect(link).toBeTruthy();
    expect(link!.attrs.hidden).toBe("hidden");
    expect(link!.attrs.target).toBe("_blank");
    expect(link!.attrs.rel).toBe("noopener noreferrer");
    expect(link!.text).toBe(DEFAULT_PRIVACY_LINK_TEXT);
    // The lock pass must cover the appended child too.
    expect(link!.props.selectable).toBe(true);
    expect(link!.props.hoverable).toBe(true);
    expect(link!.props.draggable).toBe(false);
    expect(link!.props.copyable).toBe(false);
    expect(link!.props.removable).toBe(false);
    expect(link!.props.editable).toBe(false);
  });

  it("does not duplicate the link when one already exists", () => {
    const { step, consentRow } = makeStubSubmitStep();

    normalizeSubmitStepChildren(step);
    normalizeSubmitStepChildren(step);

    const links = consentRow.children.filter((c) =>
      c.attrs.class.includes("oxy-form-consent-link"),
    );
    expect(links).toHaveLength(1);
  });
});

describe("makeInputStepTreeNode", () => {
  const node = makeInputStepTreeNode({
    title: "About you",
    ctaText: "Continue",
    buttonColor: "#dc2626",
    textColor: "#ffffff",
    buttonPadding: 10,
    buttonRadius: 8,
    isActive: false,
    fields: [
      {
        label: "Name",
        answerKey: "name",
        fieldType: "text",
        placeholder: "Your name",
        required: true,
      },
      {
        label: "Phone",
        answerKey: "phone",
        fieldType: "phone",
        placeholder: "",
        required: false,
      },
    ],
  }) as any;

  const flatten = (n: any, acc: any[] = []): any[] => {
    acc.push(n);
    const children = Array.isArray(n?.components) ? n.components : [];
    for (const c of children) {
      if (typeof c === "object" && c !== null) flatten(c, acc);
    }
    return acc;
  };
  const flat = flatten(node);
  const inputs = flat.filter((n) =>
    String(n?.attributes?.class ?? "").includes("oxy-form-input-field"),
  );

  it("is a form_step carrying the input-step marker class", () => {
    expect(node.attributes.class).toContain("form_step");
    expect(node.attributes.class).toContain("oxy-form-input-step");
  });

  it("maps field types to HTML input types (phone → tel)", () => {
    expect(inputs[0].attributes.type).toBe("text");
    expect(inputs[1].attributes.type).toBe("tel");
  });

  it("required flag becomes the required attribute, absent when optional", () => {
    expect(inputs[0].attributes.required).toBe("required");
    expect(inputs[1].attributes.required).toBeUndefined();
  });

  it("fields carry their formAnswers key in data-oxy-answer-key", () => {
    expect(inputs[0].attributes["data-oxy-answer-key"]).toBe("name");
    expect(inputs[1].attributes["data-oxy-answer-key"]).toBe("phone");
  });

  it("fields cap input at the server sanitizer's 200-char value limit", () => {
    expect(inputs[0].attributes.maxlength).toBe("200");
    expect(inputs[1].attributes.maxlength).toBe("200");
  });

  it("continue button is type=button with the runtime contract class", () => {
    const cta = flat.find((n) =>
      String(n?.attributes?.class ?? "").includes("oxy-form-input-continue"),
    );
    expect(cta).toBeTruthy();
    expect(cta.attributes.type).toBe("button");
    expect(cta.components).toBe("Continue");
  });
});

describe("input step trait application", () => {
  it("applyInputFieldAttrs syncs type/placeholder/required and data attrs", () => {
    const stub = makeStubNode("oxy-form-input-field");
    const field = asFakeComponent(stub);
    field.set("field-label", "Phone");
    field.set("answer-key", "phone");
    field.set("field-type", "phone");
    field.set("field-placeholder", "Your phone");
    field.set("field-required", true);

    applyInputFieldAttrs(field);

    expect(stub.attrs.type).toBe("tel");
    expect(stub.attrs.placeholder).toBe("Your phone");
    expect(stub.attrs.required).toBe("required");
    expect(stub.attrs.maxlength).toBe("200");
    expect(stub.attrs["data-oxy-answer-key"]).toBe("phone");
    expect(stub.attrs["data-oxy-field-type"]).toBe("phone");

    field.set("field-required", false);
    applyInputFieldAttrs(field);
    expect(stub.attrs.required).toBeUndefined();
  });

  it("applyInputStepCta syncs button text and stamps hydration attrs", () => {
    const cta = makeStubNode("oxy-form-input-continue");
    const root = makeStubNode("form_step oxy-form-input-step", [cta]);
    const step = asFakeComponent(root);
    step.set("step-title", "About you");
    step.set("cta-text", "Next");

    applyInputStepCta(step);

    expect(cta.text).toBe("Next");
    expect(root.attrs["data-oxy-step-title"]).toBe("About you");
    expect(root.attrs["data-oxy-cta-text"]).toBe("Next");
  });
});
