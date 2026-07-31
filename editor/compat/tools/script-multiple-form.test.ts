import { beforeAll, describe, expect, it } from "vitest";

// The runtime is a classic script with no exports. Importing it runs its
// IIFE, which registers the pure-helper API on globalThis and skips DOM
// init (no `document` in the node test environment).
type OxyMultipleFormApi = {
  recordAnswer(
    answers: Record<string, string>,
    payload: Record<string, unknown>,
  ): Record<string, string>;
  isValidEmail(email: string): boolean;
  buildSubmitPayload(
    answers: Record<string, string>,
    email: string,
    landingPageId: string,
  ): {
    email: string;
    landingPageId: string;
    formAnswers: Record<string, string>;
  };
  buildRedirectUrl(
    answerUrl: string,
    link: string,
    fallbackLink: string,
    email: string,
  ): string;
};

let api: OxyMultipleFormApi;

beforeAll(async () => {
  // @ts-expect-error TS2306 — the runtime is deliberately a global (non-module)
  // script so published pages can load it via a classic <script> tag; this
  // side-effect import only runs its IIFE.
  await import("../../../public/unlayer-custom/script-multiple-form");
  api = (globalThis as unknown as { __oxyMultipleForm: OxyMultipleFormApi })
    .__oxyMultipleForm;
});

describe("recordAnswer", () => {
  it("stores answer keys and ignores url/move_to_step", () => {
    const next = api.recordAnswer(
      {},
      { gender: "male", url: "https://x.example", move_to_step: "3" },
    );
    expect(next).toEqual({ gender: "male" });
  });

  it("overwrites a re-answered key (back-jumps must not duplicate)", () => {
    const first = api.recordAnswer({}, { gender: "male" });
    const second = api.recordAnswer(first, { gender: "female" });
    expect(second).toEqual({ gender: "female" });
  });

  it("accumulates across steps without mutating the input", () => {
    const a = api.recordAnswer({}, { gender: "male" });
    const b = api.recordAnswer(a, { age: "25-34" });
    expect(b).toEqual({ gender: "male", age: "25-34" });
    expect(a).toEqual({ gender: "male" });
  });

  it("skips non-string values", () => {
    expect(api.recordAnswer({}, { age: 25 })).toEqual({});
  });
});

describe("isValidEmail", () => {
  it("accepts a plain address and rejects garbage", () => {
    expect(api.isValidEmail("a@b.co")).toBe(true);
    expect(api.isValidEmail("nope")).toBe(false);
    expect(api.isValidEmail("a @b.co")).toBe(false);
    expect(api.isValidEmail("")).toBe(false);
  });
});

describe("buildSubmitPayload", () => {
  it("assembles the API payload contract", () => {
    expect(
      api.buildSubmitPayload({ gender: "male" }, "a@b.co", "lp123"),
    ).toEqual({
      email: "a@b.co",
      landingPageId: "lp123",
      formAnswers: { gender: "male" },
    });
  });
});

describe("buildRedirectUrl", () => {
  it("prefers the final answer's url over form link and fallback", () => {
    const url = api.buildRedirectUrl(
      "https://answer.example/go?aff=7",
      "https://form.example",
      "https://fallback.example",
      "a@b.co",
    );
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe("https://answer.example/go");
    expect(u.searchParams.get("aff")).toBe("7");
    expect(u.searchParams.get("sub3")).toBe(btoa("a@b.co"));
  });

  it("falls back to the form link when the answer url is empty", () => {
    const url = api.buildRedirectUrl(
      "",
      "https://form.example/x",
      "https://fallback.example",
      "a@b.co",
    );
    expect(new URL(url).hostname).toBe("form.example");
  });

  it("falls back to the fallback link when answer url and form link are empty", () => {
    const url = api.buildRedirectUrl("", "", "https://fallback.example/x", "a@b.co");
    expect(new URL(url).hostname).toBe("fallback.example");
  });

  it("returns the raw target when it is not a parseable URL", () => {
    expect(api.buildRedirectUrl("not a url", "", "", "a@b.co")).toBe("not a url");
  });

  it("returns empty string when no link exists", () => {
    expect(api.buildRedirectUrl("", "", "", "a@b.co")).toBe("");
  });

  it("omits sub3 when email is empty", () => {
    const url = api.buildRedirectUrl("https://p.example/go", "", "", "");
    expect(new URL(url).searchParams.get("sub3")).toBeNull();
  });
});
