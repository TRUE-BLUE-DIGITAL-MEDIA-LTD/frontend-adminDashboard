import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * DOM-wiring tests for the multi-step form runtime.
 *
 * The GrapesJS export does NOT guarantee the markup the old runtime assumed:
 * steps carry volatile auto ids (never `form_step_N`) and visibility lives in
 * CSS rules, not inline styles. The runtime must therefore own initial
 * visibility and navigate by DOM order, not by id. These tests mount real
 * fixtures in jsdom and import the runtime source (.ts explicitly — the
 * extensionless specifier would resolve to the compiled .js sibling).
 */

type Win = Window & { open: (url?: string, target?: string) => unknown };

function mount(bodyHtml: string): { dom: JSDOM; open: ReturnType<typeof vi.fn> } {
  const dom = new JSDOM(`<!doctype html><html><body>${bodyHtml}</body></html>`);
  const open = vi.fn();
  (dom.window as unknown as Win).open = open as never;
  const g = globalThis as Record<string, unknown>;
  g.document = dom.window.document;
  g.window = dom.window;
  return { dom, open };
}

async function importRuntime(): Promise<void> {
  vi.resetModules();
  await import("../../../public/unlayer-custom/script-multiple-form.ts");
}

afterEach(() => {
  const g = globalThis as Record<string, unknown>;
  delete g.document;
  delete g.window;
  delete g.fetch;
});

/** GrapesJS-shaped export: no form_step ids, no inline display styles. */
const GRAPES_FIXTURE = `
<div class="oxy-multiple-form" data-oxy-lp-id="lp1" data-oxy-fallback-link="https://fallback.example">
  <div class="form_step" id="iaaa">
    <div class="button-containers">
      <button type="button" value='{"gender":"male"}'>Male</button>
      <button type="button" value='{"gender":"female","move_to_step":"3"}'>Female</button>
    </div>
  </div>
  <div class="form_step" id="ibbb">
    <div class="button-containers">
      <button type="button" value='{"age":"18-24"}'>18-24</button>
    </div>
  </div>
  <div class="form_step" id="iccc">
    <div class="button-containers">
      <button type="button" value='{"interests":"casual"}'>Casual</button>
    </div>
  </div>
  <div class="form_step oxy-form-submit-step" id="iddd">
    <input type="email" required class="oxy-form-email-input" />
    <input type="checkbox" required class="oxy-form-consent-checkbox" />
    <button type="button" class="oxy-form-submit-cta">Continue</button>
  </div>
</div>`;

/** Legacy Unlayer-era export: form_step_N ids, inline displays, no submit step. */
const LEGACY_FIXTURE = `
<div class="oxy-multiple-form">
  <div class="form_step" id="form_step_1" style="display:flex">
    <div class="button-containers">
      <button type="button" value='{"answer":"a"}'>A</button>
    </div>
  </div>
  <div class="form_step" id="form_step_2" style="display:none">
    <div class="button-containers">
      <button type="button" value='{"answer":"b","url":"https://partner.example/go"}'>B</button>
    </div>
  </div>
</div>
<script class="script_multiple_form" value='{"link":""}'></script>`;

function displays(dom: JSDOM): string[] {
  return Array.from(
    dom.window.document.getElementsByClassName("form_step"),
  ).map((el) => (el as HTMLElement).style.display);
}

function clickButton(dom: JSDOM, text: string): void {
  const btn = Array.from(dom.window.document.querySelectorAll("button")).find(
    (b) => b.textContent === text,
  );
  if (!btn) throw new Error(`no button "${text}"`);
  (btn as HTMLButtonElement).click();
}

describe("runtime on GrapesJS-shaped markup (no form_step ids, no inline styles)", () => {
  it("enforces initial visibility: first step shown, all others hidden", async () => {
    const { dom } = mount(GRAPES_FIXTURE);
    await importRuntime();
    expect(displays(dom)).toEqual(["flex", "none", "none", "none"]);
  });

  it("advances to the next step by DOM order on click", async () => {
    const { dom } = mount(GRAPES_FIXTURE);
    await importRuntime();
    clickButton(dom, "Male");
    expect(displays(dom)).toEqual(["none", "flex", "none", "none"]);
    clickButton(dom, "18-24");
    expect(displays(dom)).toEqual(["none", "none", "flex", "none"]);
  });

  it("honors move_to_step as a 1-based index", async () => {
    const { dom } = mount(GRAPES_FIXTURE);
    await importRuntime();
    clickButton(dom, "Female");
    expect(displays(dom)).toEqual(["none", "none", "flex", "none"]);
  });

  it("shows the submission step only when reached from the last answer step", async () => {
    const { dom } = mount(GRAPES_FIXTURE);
    await importRuntime();
    expect(displays(dom)[3]).toBe("none");
    clickButton(dom, "Male");
    expect(displays(dom)[3]).toBe("none");
    clickButton(dom, "18-24");
    expect(displays(dom)[3]).toBe("none");
    clickButton(dom, "Casual");
    expect(displays(dom)).toEqual(["none", "none", "none", "flex"]);
  });
});

describe("runtime with two forms on one page", () => {
  const TWO_FORMS = `
<div class="oxy-multiple-form" data-oxy-lp-id="lpA">
  <div class="form_step"><div class="button-containers">
    <button type="button" value='{"gender":"male"}'>A1</button>
  </div></div>
  <div class="form_step"><div class="button-containers">
    <button type="button" value='{"age":"18-24"}'>A2</button>
  </div></div>
</div>
<div class="oxy-multiple-form" data-oxy-lp-id="lpB">
  <div class="form_step"><div class="button-containers">
    <button type="button" value='{"color":"red"}'>B1</button>
  </div></div>
  <div class="form_step"><div class="button-containers">
    <button type="button" value='{"size":"xl"}'>B2</button>
  </div></div>
</div>`;

  it("each form shows its own first step and navigates independently", async () => {
    const { dom } = mount(TWO_FORMS);
    await importRuntime();
    // Steps in DOM order: A1, A2, B1, B2 — both firsts visible.
    expect(displays(dom)).toEqual(["flex", "none", "flex", "none"]);
    clickButton(dom, "A1");
    // Form A advanced; form B untouched.
    expect(displays(dom)).toEqual(["none", "flex", "flex", "none"]);
    clickButton(dom, "B1");
    expect(displays(dom)).toEqual(["none", "flex", "none", "flex"]);
  });
});

describe("runtime on legacy markup WITHOUT the .oxy-multiple-form root", () => {
  const NO_ROOT = `
<div class="form_step" id="form_step_1" style="display:flex"><div class="button-containers">
  <button type="button" value='{"answer":"a"}'>A</button>
</div></div>
<div class="form_step" id="form_step_2" style="display:none"><div class="button-containers">
  <button type="button" value='{"answer":"b","url":"https://partner.example/go"}'>B</button>
</div></div>`;

  it("falls back to document-wide wiring", async () => {
    const { dom, open } = mount(NO_ROOT);
    await importRuntime();
    expect(displays(dom)).toEqual(["flex", "none"]);
    clickButton(dom, "A");
    expect(displays(dom)).toEqual(["none", "flex"]);
    clickButton(dom, "B");
    expect(open).toHaveBeenCalledWith("https://partner.example/go", "_blank");
  });
});

describe("runtime on legacy markup (form_step_N ids, inline styles, no submit step)", () => {
  it("keeps step 1 visible and navigates on click", async () => {
    const { dom } = mount(LEGACY_FIXTURE);
    await importRuntime();
    expect(displays(dom)).toEqual(["flex", "none"]);
    clickButton(dom, "A");
    expect(displays(dom)).toEqual(["none", "flex"]);
  });

  it("opens the button url in a new tab on the last step (legacy behavior)", async () => {
    const { dom, open } = mount(LEGACY_FIXTURE);
    await importRuntime();
    clickButton(dom, "A");
    clickButton(dom, "B");
    expect(open).toHaveBeenCalledWith("https://partner.example/go", "_blank");
    expect(displays(dom)).toEqual(["none", "flex"]);
  });
});

/** Upgraded form whose options carry redirect urls. */
const SUBMIT_REDIRECT_FIXTURE = `
<div class="oxy-multiple-form" data-oxy-lp-id="lp1" data-oxy-fallback-link="https://fallback.example/main">
  <div class="form_step">
    <div class="button-containers">
      <button type="button" value='{"gender":"male","url":"https://early.example/go"}'>Male</button>
    </div>
  </div>
  <div class="form_step">
    <div class="button-containers">
      <button type="button" value='{"interests":"chat","url":"https://partner.example/go"}'>Chat</button>
      <button type="button" value='{"interests":"serious"}'>Serious</button>
    </div>
  </div>
  <div class="form_step oxy-form-submit-step">
    <input type="email" required class="oxy-form-email-input" />
    <input type="checkbox" required class="oxy-form-consent-checkbox" />
    <button type="button" class="oxy-form-submit-cta">Continue</button>
  </div>
</div>`;

function fillAndSubmit(dom: JSDOM): void {
  const doc = dom.window.document;
  const email = doc.querySelector<HTMLInputElement>(".oxy-form-email-input");
  const consent = doc.querySelector<HTMLInputElement>(
    ".oxy-form-consent-checkbox",
  );
  if (!email || !consent) throw new Error("submit inputs missing");
  email.value = "a@b.co";
  consent.checked = true;
  // jsdom's constraint-validation support varies by version — pin the
  // result so these tests exercise redirect logic, not native validation.
  email.reportValidity = () => true;
  consent.reportValidity = () => true;
  clickButton(dom, "Continue");
}

describe("submission redirect uses the final answer's url", () => {
  it("redirects to the last-clicked option's url with sub3 appended", async () => {
    const { dom, open } = mount(SUBMIT_REDIRECT_FIXTURE);
    (globalThis as Record<string, unknown>).fetch = vi.fn(async () => ({}));
    await importRuntime();
    clickButton(dom, "Male");
    clickButton(dom, "Chat");
    fillAndSubmit(dom);
    await vi.waitFor(() => expect(open).toHaveBeenCalled());
    const target = new URL(String(open.mock.calls[0][0]));
    expect(target.hostname).toBe("partner.example");
    expect(target.searchParams.get("sub3")).toBe(btoa("a@b.co"));
    expect(open.mock.calls[0][1]).toBe("_self");
  });

  it("does not leak an earlier answer's url when the final answer has none", async () => {
    const { dom, open } = mount(SUBMIT_REDIRECT_FIXTURE);
    (globalThis as Record<string, unknown>).fetch = vi.fn(async () => ({}));
    await importRuntime();
    clickButton(dom, "Male"); // carries early.example — must be overwritten
    clickButton(dom, "Serious"); // final answer, no url
    fillAndSubmit(dom);
    await vi.waitFor(() => expect(open).toHaveBeenCalled());
    expect(new URL(String(open.mock.calls[0][0])).hostname).toBe(
      "fallback.example",
    );
  });

  it("uses the legacy page-level form link before the stamped fallback", async () => {
    const withLegacyLink =
      SUBMIT_REDIRECT_FIXTURE +
      `\n<script class="script_multiple_form" value='{"link":"https://legacy.example/thanks"}'></script>`;
    const { dom, open } = mount(withLegacyLink);
    (globalThis as Record<string, unknown>).fetch = vi.fn(async () => ({}));
    await importRuntime();
    clickButton(dom, "Male");
    clickButton(dom, "Serious"); // final answer has no url -> legacy link wins
    fillAndSubmit(dom);
    await vi.waitFor(() => expect(open).toHaveBeenCalled());
    expect(new URL(String(open.mock.calls[0][0])).hostname).toBe(
      "legacy.example",
    );
  });
});
