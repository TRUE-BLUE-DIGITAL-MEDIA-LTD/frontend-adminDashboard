// @vitest-environment jsdom
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Component tests for the two-step sign-up page.
 *
 * The page is only reachable through Turnstile + the sign-up code services, so
 * both are mocked: the widget mock records the props of every mounted instance
 * (index 0 is the form widget, the next one is the interaction-only resend
 * widget) and lets a test hand out a token, and the services record their
 * arguments. No JSX here — the project compiles with `jsx: "preserve"`, so the
 * tree is built with `React.createElement`.
 */

const mocks = vi.hoisted(() => {
  type Widget = {
    props: Record<string, unknown>;
    response: string | null;
    reset: () => void;
    resetCalls: number;
  };
  return {
    widgets: [] as Widget[],
    requestSignUpCode: vi.fn(),
    verifySignUpCode: vi.fn(),
    routerReplace: vi.fn(),
    swalFire: vi.fn(),
  };
});

vi.mock("next/router", () => ({
  useRouter: () => ({ replace: mocks.routerReplace }),
}));

vi.mock("next/image", () => ({ default: () => null }));

vi.mock("next/link", async () => {
  const R = await import("react");
  return {
    default: (props: { href: string; children?: React.ReactNode }) =>
      R.createElement("a", { href: props.href }, props.children),
  };
});

// The icon barrel is thousands of modules; the page only needs two glyphs.
vi.mock("@mui/icons-material", async () => {
  const R = await import("react");
  const icon = () => R.createElement("span");
  return { Visibility: icon, VisibilityOff: icon };
});

vi.mock("sweetalert2", () => ({ default: { fire: mocks.swalFire } }));

vi.mock("@marsidev/react-turnstile", async () => {
  const R = await import("react");
  const Turnstile = R.forwardRef(function TurnstileMock(
    props: Record<string, unknown>,
    ref: React.Ref<unknown>,
  ) {
    const self = R.useRef<(typeof mocks.widgets)[number] | null>(null);
    if (!self.current) {
      const widget = {
        props,
        response: null as string | null,
        resetCalls: 0,
        reset: () => {
          widget.resetCalls += 1;
          widget.response = null;
        },
      };
      self.current = widget;
      mocks.widgets.push(widget);
    }
    self.current.props = props;
    R.useImperativeHandle(ref, () => ({
      reset: () => self.current?.reset(),
      getResponsePromise: async () => self.current?.response ?? null,
    }));
    return R.createElement("div", { "data-testid": "turnstile" });
  });
  return { Turnstile };
});

vi.mock("../../services/auth/sign-up", () => ({
  requestSignUpCode: mocks.requestSignUpCode,
  verifySignUpCode: mocks.verifySignUpCode,
}));

import SignUp from "./sign-up";

const act = (
  React as unknown as {
    act: (cb: () => void | Promise<void>) => Promise<void>;
  }
).act;

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

async function render(): Promise<void> {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(SignUp));
  });
}

function input(selector: string): HTMLInputElement {
  const el = container.querySelector<HTMLInputElement>(selector);
  if (!el) throw new Error(`no input for ${selector}`);
  return el;
}

async function type(selector: string, value: string): Promise<void> {
  const el = input(selector);
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(el, value);
  await act(async () => {
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function buttonWithText(text: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.trim() === text,
  );
}

function submitForm(): Promise<void> {
  const form = container.querySelector("form");
  if (!form) throw new Error("no form");
  return act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
}

async function fillValidForm(): Promise<void> {
  await type("#name", "Willy");
  await type("#email", "user@oxyclick.com");
  await type('input[name="password"]', "secret-pass");
  await type('input[name="confirmPassword"]', "secret-pass");
}

async function grantFormToken(token = "form-token"): Promise<void> {
  const onSuccess = mocks.widgets[0].props.onSuccess as (t: string) => void;
  await act(async () => {
    onSuccess(token);
  });
}

/** Fill the form, pass the captcha and submit — lands on the code step. */
async function reachCodeStep(): Promise<void> {
  await fillValidForm();
  await grantFormToken();
  await submitForm();
}

beforeEach(() => {
  mocks.widgets.length = 0;
  mocks.requestSignUpCode.mockReset().mockResolvedValue(undefined);
  mocks.verifySignUpCode.mockReset().mockResolvedValue(undefined);
  mocks.routerReplace.mockReset();
  mocks.swalFire.mockReset();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.useRealTimers();
});

describe("sign-up page — Turnstile gating", () => {
  it("keeps register inert until the captcha hands over a token", async () => {
    await render();
    await fillValidForm();

    expect(buttonWithText("register")).toBeUndefined();

    await grantFormToken();

    expect(buttonWithText("register")).toBeDefined();
  });

  it("refuses to submit without a token and warns instead", async () => {
    await render();
    await fillValidForm();
    await submitForm();

    expect(mocks.requestSignUpCode).not.toHaveBeenCalled();
    expect(mocks.swalFire).toHaveBeenCalledWith(
      "error!",
      "Please complete the captcha",
      "error",
    );
  });

  it("requests a code with the form data and resets the single-use token", async () => {
    await render();
    await reachCodeStep();

    expect(mocks.requestSignUpCode).toHaveBeenCalledWith({
      email: "user@oxyclick.com",
      name: "Willy",
      password: "secret-pass",
      confirmPassword: "secret-pass",
      turnstileToken: "form-token",
    });
    // siteverify tokens are single-use, so the widget is reset after the call.
    expect(mocks.widgets[0].resetCalls).toBe(1);
    expect(container.textContent).toContain("Check your email");
    expect(container.textContent).toContain("user@oxyclick.com");
    expect(container.textContent).toContain("Resend in 60s");
  });

  it("stays on the form and surfaces the error when the request fails", async () => {
    mocks.requestSignUpCode.mockRejectedValue(new Error("too many requests"));
    await render();
    await reachCodeStep();

    expect(container.textContent).toContain("Sign Up to OxyClick");
    expect(mocks.swalFire).toHaveBeenCalledWith(
      "error!",
      "too many requests",
      "error",
    );
    // The consumed token is cleared, so register is inert again.
    expect(buttonWithText("register")).toBeUndefined();
  });
});

describe("sign-up page — code verification", () => {
  it("only enables verify for a six-digit code and redirects on success", async () => {
    await render();
    await reachCodeStep();

    await type("#code", "12ab3");
    expect(input("#code").value).toBe("123");
    expect(buttonWithText("verify")).toBeUndefined();

    await type("#code", "123456");
    expect(buttonWithText("verify")).toBeDefined();

    await submitForm();

    expect(mocks.verifySignUpCode).toHaveBeenCalledWith({
      email: "user@oxyclick.com",
      code: "123456",
    });
    expect(mocks.routerReplace).toHaveBeenCalledWith("/auth/pending");
  });

  it("shows the server message and stays on the code step when verify fails", async () => {
    mocks.verifySignUpCode.mockRejectedValue(new Error("Invalid code"));
    await render();
    await reachCodeStep();
    await type("#code", "123456");
    await submitForm();

    expect(mocks.routerReplace).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Invalid code");
    expect(container.textContent).toContain("Check your email");
    // Verify stays available for another attempt.
    expect(buttonWithText("verify")).toBeDefined();
  });
});

describe("sign-up page — resend countdown", () => {
  it("hides resend until the cooldown elapses, then resends with a fresh token", async () => {
    vi.useFakeTimers();
    await render();
    await reachCodeStep();

    expect(buttonWithText("Resend code")).toBeUndefined();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(container.textContent).toContain("Resend in 30s");
    expect(buttonWithText("Resend code")).toBeUndefined();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    const resend = buttonWithText("Resend code");
    expect(resend).toBeDefined();

    // The interaction-only widget is the second one mounted.
    mocks.widgets[1].response = "resend-token";
    await act(async () => {
      resend?.click();
    });

    expect(mocks.requestSignUpCode).toHaveBeenCalledTimes(2);
    expect(mocks.requestSignUpCode).toHaveBeenLastCalledWith(
      expect.objectContaining({
        email: "user@oxyclick.com",
        turnstileToken: "resend-token",
      }),
    );
    expect(container.textContent).toContain("Resend in 60s");
  });

  it("reports a captcha-less resend as an inline error", async () => {
    vi.useFakeTimers();
    await render();
    await reachCodeStep();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    // No token handed out by the interaction-only widget.
    await act(async () => {
      buttonWithText("Resend code")?.click();
    });

    expect(mocks.requestSignUpCode).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Please complete the captcha");
  });
});

describe("sign-up page — use a different email", () => {
  it("returns to the form, clears the code and drops the captcha token", async () => {
    await render();
    await reachCodeStep();
    await type("#code", "123456");

    await act(async () => {
      buttonWithText("Use a different email")?.click();
    });

    expect(container.textContent).toContain("Sign Up to OxyClick");
    // Token was dropped, so register is inert until the captcha passes again.
    expect(buttonWithText("register")).toBeUndefined();
    expect(input("#email").value).toBe("user@oxyclick.com");

    await grantFormToken("second-token");
    await submitForm();

    expect(mocks.requestSignUpCode).toHaveBeenLastCalledWith(
      expect.objectContaining({ turnstileToken: "second-token" }),
    );
    expect(input("#code").value).toBe("");
  });
});
