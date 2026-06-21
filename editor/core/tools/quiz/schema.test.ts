import { describe, expect, it } from "vitest";
import {
  DEFAULT_DATING_QUIZ,
  validateQuizConfig,
  type QuizConfig,
} from "./schema";

function clone(): QuizConfig {
  return JSON.parse(JSON.stringify(DEFAULT_DATING_QUIZ)) as QuizConfig;
}

describe("validateQuizConfig", () => {
  it("accepts the default dating quiz with no issues", () => {
    const { config, issues } = validateQuizConfig(DEFAULT_DATING_QUIZ);
    expect(issues).toEqual([]);
    expect(config).not.toBeNull();
    expect(config?.version).toBe(1);
  });

  it("rejects non-object input", () => {
    const { config, issues } = validateQuizConfig("nope");
    expect(config).toBeNull();
    expect(issues.some((i) => i.level === "error")).toBe(true);
  });

  it("rejects null input", () => {
    const { config, issues } = validateQuizConfig(null);
    expect(config).toBeNull();
    expect(issues.some((i) => i.level === "error")).toBe(true);
  });

  it("rejects a theme with missing fields", () => {
    const bad = clone() as unknown as { theme: Record<string, unknown> };
    delete bad.theme.primaryColor;
    bad.theme.borderRadius = "12";
    const { config, issues } = validateQuizConfig(bad);
    expect(config).toBeNull();
    expect(issues.map((i) => i.path)).toContain("theme.primaryColor");
    expect(issues.map((i) => i.path)).toContain("theme.borderRadius");
  });

  it("rejects unknown version", () => {
    const bad = { ...clone(), version: 2 };
    const { config, issues } = validateQuizConfig(bad);
    expect(config).toBeNull();
    expect(issues.map((i) => i.path)).toContain("version");
  });

  it("rejects empty steps", () => {
    const bad = { ...clone(), steps: [] };
    const { config } = validateQuizConfig(bad);
    expect(config).toBeNull();
  });

  it("rejects duplicate step ids", () => {
    const bad = clone();
    bad.steps[1].id = bad.steps[0].id;
    const { config, issues } = validateQuizConfig(bad);
    expect(config).toBeNull();
    expect(issues.some((i) => i.message.includes("duplicate"))).toBe(true);
  });

  it("rejects two email steps", () => {
    const bad = clone();
    bad.steps.push({
      type: "email",
      id: "email_2",
      title: "Again?",
    });
    const { config, issues } = validateQuizConfig(bad);
    expect(config).toBeNull();
    expect(issues.some((i) => i.message.includes("email"))).toBe(true);
  });

  it("rejects a question step with no answers", () => {
    const bad = clone();
    (bad.steps[0] as { answers: unknown[] }).answers = [];
    const { config } = validateQuizConfig(bad);
    expect(config).toBeNull();
  });

  it("flags goTo to an unknown step id as a warning, not an error", () => {
    const cfg = clone();
    (cfg.steps[0] as { answers: { goTo?: string | null }[] }).answers[0].goTo =
      "no_such_step";
    const { config, issues } = validateQuizConfig(cfg);
    expect(config).not.toBeNull(); // warnings don't block
    expect(
      issues.some((i) => i.level === "warning" && i.message.includes("goTo")),
    ).toBe(true);
  });
});

describe("DEFAULT_DATING_QUIZ", () => {
  it("is a complete dating funnel: question(s), interstitial, email", () => {
    const types = DEFAULT_DATING_QUIZ.steps.map((s) => s.type);
    expect(types).toContain("question");
    expect(types).toContain("interstitial");
    expect(types).toContain("email");
    expect(types.filter((t) => t === "email")).toHaveLength(1);
  });

  it("appends answers by default", () => {
    expect(DEFAULT_DATING_QUIZ.redirect.appendAnswers).toBe(true);
  });
});
