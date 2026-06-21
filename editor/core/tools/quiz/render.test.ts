import { describe, expect, it } from "vitest";
import { DEFAULT_DATING_QUIZ, type QuizConfig } from "./schema";
import {
  decodeQuizConfigAttr,
  encodeQuizConfigAttr,
  quizProgressPercent,
  renderQuizInnerHtml,
} from "./render";

function clone(): QuizConfig {
  return JSON.parse(JSON.stringify(DEFAULT_DATING_QUIZ)) as QuizConfig;
}

describe("encode/decode config attr", () => {
  it("round-trips the default config (including emoji)", () => {
    const encoded = encodeQuizConfigAttr(DEFAULT_DATING_QUIZ);
    expect(encoded).not.toContain('"'); // attribute-safe
    expect(encoded).not.toContain("<");
    const decoded = decodeQuizConfigAttr(encoded);
    expect(decoded).toEqual(DEFAULT_DATING_QUIZ);
  });

  it("returns null for garbage", () => {
    expect(decodeQuizConfigAttr("%%%not-json")).toBeNull();
    expect(decodeQuizConfigAttr("")).toBeNull();
  });
});

describe("quizProgressPercent", () => {
  // Default quiz: question, question, interstitial, email
  // → countable steps (question+email): 3.
  it("counts question and email steps only", () => {
    expect(quizProgressPercent(DEFAULT_DATING_QUIZ, "looking_for")).toBe(33);
    expect(quizProgressPercent(DEFAULT_DATING_QUIZ, "age")).toBe(67);
    expect(quizProgressPercent(DEFAULT_DATING_QUIZ, "email_capture")).toBe(100);
  });

  it("holds the previous value on interstitials", () => {
    // "searching" comes after 2 countable steps → stays at 2/3.
    expect(quizProgressPercent(DEFAULT_DATING_QUIZ, "searching")).toBe(67);
  });

  it("returns 0 for unknown step ids", () => {
    expect(quizProgressPercent(DEFAULT_DATING_QUIZ, "nope")).toBe(0);
  });
});

describe("renderQuizInnerHtml", () => {
  const html = renderQuizInnerHtml(DEFAULT_DATING_QUIZ);

  it("renders the first step visible and the rest hidden", () => {
    const flexCount = (html.match(/display:flex/g) ?? []).length;
    // Step containers only — answers containers use grid/flex too, so
    // assert per-step instead: first step has display:flex, others none.
    const steps = html.split('class="oxy-quiz__step"');
    expect(steps.length - 1).toBe(4);
    expect(steps[1]).toContain("display:flex");
    expect(steps[2]).toContain("display:none");
    expect(steps[3]).toContain("display:none");
    expect(steps[4]).toContain("display:none");
    expect(flexCount).toBeGreaterThan(0);
  });

  it("renders a progress bar when theme.showProgressBar is true", () => {
    expect(html).toContain("oxy-quiz__progress-fill");
    expect(html).toContain("width:33%");
  });

  it("omits the progress bar when disabled", () => {
    const cfg = clone();
    cfg.theme.showProgressBar = false;
    expect(renderQuizInnerHtml(cfg)).not.toContain("oxy-quiz__progress");
  });

  it("stamps deterministic data-i18n keys", () => {
    expect(html).toContain('data-i18n="quiz.looking_for.title"');
    expect(html).toContain('data-i18n="quiz.looking_for.answer.women"');
    expect(html).toContain('data-i18n="quiz.searching.title"');
    expect(html).toContain('data-i18n="quiz.email_capture.button"');
    expect(html).toContain('data-i18n="quiz.email_capture.error"');
  });

  it("renders cards layout as a 2-column grid and buttons layout stacked", () => {
    expect(html).toContain("oxy-quiz__answers--cards");
    expect(html).toContain("grid-template-columns:1fr 1fr");
    expect(html).toContain("oxy-quiz__answers--buttons");
  });

  it("carries runtime data attributes on steps and answers", () => {
    expect(html).toContain('data-step-id="looking_for"');
    expect(html).toContain('data-step-type="question"');
    expect(html).toContain('data-variant="loading"');
    expect(html).toContain('data-duration="2500"');
    expect(html).toContain('data-value="women"');
  });

  it("escapes HTML in author-provided text", () => {
    const cfg = clone();
    cfg.steps[0].title = '<script>alert("x")</script>';
    const out = renderQuizInnerHtml(cfg);
    expect(out).not.toContain("<script>alert");
    expect(out).toContain("&lt;script&gt;");
  });

  it("escapes attribute-breaking characters in theme values", () => {
    const cfg = clone();
    cfg.theme.primaryColor = '#fff" onmouseover="alert(1)';
    const out = renderQuizInnerHtml(cfg);
    expect(out).not.toContain('onmouseover="alert(1)"');
  });

  it("does not use name=\"email\" or type=\"submit\" (would collide with the landing page's existing handlers)", () => {
    expect(html).not.toContain('name="email"');
    expect(html).not.toContain('type="submit"');
  });
});
