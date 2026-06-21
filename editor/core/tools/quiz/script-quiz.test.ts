import { beforeAll, describe, expect, it } from "vitest";

// The runtime is a classic script with no exports. Importing it runs its
// IIFE, which registers the pure-helper API on globalThis and skips DOM
// init (no `document` in the node test environment).
type OxyQuizApi = {
  nextStepId(
    steps: Array<{ id: string }>,
    currentId: string,
    goTo: string,
  ): string | null;
  buildRedirectUrl(
    redirect: { url: string; appendAnswers: boolean },
    answers: Record<string, string>,
    email: string,
  ): string;
  isValidEmail(email: string): boolean;
  progressPercent(
    steps: Array<{ id: string; type: string }>,
    stepId: string,
  ): number;
};

let api: OxyQuizApi;

beforeAll(async () => {
  await import("../../../../public/unlayer-custom/script-quiz");
  api = (globalThis as unknown as { __oxyQuiz: OxyQuizApi }).__oxyQuiz;
});

const STEPS = [
  { id: "a", type: "question" },
  { id: "b", type: "question" },
  { id: "mid", type: "interstitial" },
  { id: "mail", type: "email" },
];

describe("nextStepId", () => {
  it("advances to the next step in order", () => {
    expect(api.nextStepId(STEPS, "a", "")).toBe("b");
    expect(api.nextStepId(STEPS, "b", "")).toBe("mid");
  });

  it("returns null after the last step (quiz complete)", () => {
    expect(api.nextStepId(STEPS, "mail", "")).toBeNull();
  });

  it("honors goTo when it points at a real step", () => {
    expect(api.nextStepId(STEPS, "a", "mail")).toBe("mail");
  });

  it("falls back to next step when goTo is unknown", () => {
    expect(api.nextStepId(STEPS, "a", "ghost")).toBe("b");
  });

  it("returns null for an unknown current step", () => {
    expect(api.nextStepId(STEPS, "ghost", "")).toBeNull();
  });
});

describe("buildRedirectUrl", () => {
  const redirect = { url: "https://offer.example/go?aff=7", appendAnswers: true };

  it("appends answers as query params, preserving existing ones", () => {
    const url = api.buildRedirectUrl(redirect, { age: "25-34", looking_for: "women" }, "");
    const u = new URL(url);
    expect(u.searchParams.get("aff")).toBe("7");
    expect(u.searchParams.get("age")).toBe("25-34");
    expect(u.searchParams.get("looking_for")).toBe("women");
  });

  it("appends sub3 as base64 email when provided", () => {
    const url = api.buildRedirectUrl(redirect, {}, "a@b.co");
    expect(new URL(url).searchParams.get("sub3")).toBe(btoa("a@b.co"));
  });

  it("skips answers when appendAnswers is false but still adds sub3", () => {
    const url = api.buildRedirectUrl(
      { url: "https://offer.example/go", appendAnswers: false },
      { age: "25-34" },
      "a@b.co",
    );
    const u = new URL(url);
    expect(u.searchParams.get("age")).toBeNull();
    expect(u.searchParams.get("sub3")).toBe(btoa("a@b.co"));
  });

  it("returns the raw url unchanged when it cannot be parsed", () => {
    expect(api.buildRedirectUrl({ url: "not a url", appendAnswers: true }, { a: "1" }, "")).toBe("not a url");
  });
});

describe("isValidEmail", () => {
  it("accepts plain addresses and rejects junk", () => {
    expect(api.isValidEmail("user@site.com")).toBe(true);
    expect(api.isValidEmail("u.ser+tag@s.co")).toBe(true);
    expect(api.isValidEmail("nope")).toBe(false);
    expect(api.isValidEmail("a@b")).toBe(false);
    expect(api.isValidEmail("")).toBe(false);
  });
});

describe("progressPercent", () => {
  it("matches the renderer's math (question+email countable)", () => {
    expect(api.progressPercent(STEPS, "a")).toBe(33);
    expect(api.progressPercent(STEPS, "b")).toBe(67);
    expect(api.progressPercent(STEPS, "mid")).toBe(67);
    expect(api.progressPercent(STEPS, "mail")).toBe(100);
    expect(api.progressPercent(STEPS, "ghost")).toBe(0);
  });
});
