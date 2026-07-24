import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONSENT_TEXT,
  MAX_STEPS,
  SUBMIT_STEP_CLASS,
  applySubmitStepButtonStyling,
  applySubmitStepFields,
  makeDefaultRootTree,
  makeSubmitStepTreeNode,
  normalizeSubmitStepChildren,
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
    append: () => [],
    remove: () => ({}),
  };
}

function makeStubSubmitStep() {
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
  return {
    step: asFakeComponent(root),
    root,
    title,
    divider,
    emailInput,
    checkbox,
    consentRow,
    consentSpan,
    cta,
  };
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

  it("stays under the step cap", () => {
    expect(steps.length).toBeLessThanOrEqual(MAX_STEPS);
    expect(MAX_STEPS).toBe(5);
  });
});

describe("makeSubmitStepTreeNode", () => {
  const node = makeSubmitStepTreeNode({
    title: "Almost done!",
    emailPlaceholder: "Enter your email",
    consentText: DEFAULT_CONSENT_TEXT,
    ctaText: "Continue",
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
});
