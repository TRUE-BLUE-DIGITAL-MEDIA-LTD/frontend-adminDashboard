import { describe, expect, it } from "vitest";
import { appendQuizRuntime, QUIZ_RUNTIME_SRC } from "./runtime-inject";

const QUIZ_HTML = '<div class="oxy-quiz" data-oxy-quiz-config="%7B%7D"></div>';

describe("appendQuizRuntime", () => {
  it("returns input unchanged when no quiz is present", () => {
    const html = "<div>no quiz here</div>";
    expect(appendQuizRuntime(html)).toBe(html);
  });

  it("appends the runtime script tag when a quiz is present", () => {
    const out = appendQuizRuntime(QUIZ_HTML);
    expect(out).toContain(QUIZ_RUNTIME_SRC);
    expect(out).toContain("<script");
    expect(out).toContain("defer");
  });

  it("uses the production base URL outside the browser (node test env)", () => {
    const out = appendQuizRuntime(QUIZ_HTML);
    expect(out).toContain(`https://oxyclick.com${QUIZ_RUNTIME_SRC}`);
  });

  it("is idempotent", () => {
    const once = appendQuizRuntime(QUIZ_HTML);
    const twice = appendQuizRuntime(once);
    expect(twice).toBe(once);
    expect(twice.match(/script-quiz\.js/g)).toHaveLength(1);
  });
});
