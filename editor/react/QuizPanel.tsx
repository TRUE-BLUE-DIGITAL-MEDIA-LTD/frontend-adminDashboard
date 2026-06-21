import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor as GrapesEditor, Component } from "grapesjs";
import {
  DEFAULT_DATING_QUIZ,
  validateQuizConfig,
  type QuizAnswer,
  type QuizConfig,
  type QuizStep,
} from "../core/tools/quiz/schema";

/**
 * Structured quiz editor shown in the properties sidebar when an `oxy-quiz`
 * component is selected (see OxyEditor.tsx). The selected component's
 * `quiz-config` prop is the single source of truth: every edit goes through
 * `commit()` → `component.set("quiz-config", next)`, which triggers the
 * canvas re-render in core/tools/quiz/block.ts and lands as one undo entry.
 */

interface QuizPanelProps {
  component: Component;
  grapes: GrapesEditor;
}

type ComponentLike = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
};

function readConfig(component: Component): QuizConfig {
  const raw = (component as unknown as ComponentLike).get("quiz-config");
  if (raw && typeof raw === "object") {
    return JSON.parse(JSON.stringify(raw)) as QuizConfig;
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATING_QUIZ)) as QuizConfig;
}

function nextStepId(steps: QuizStep[], base: string): string {
  const ids = new Set(steps.map((s) => s.id));
  let n = steps.length + 1;
  while (ids.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

function makeStep(type: QuizStep["type"], steps: QuizStep[]): QuizStep {
  switch (type) {
    case "question":
      return {
        type: "question",
        id: nextStepId(steps, "question"),
        title: "New question?",
        layout: "buttons",
        answers: [
          { label: "Option A", value: "a", goTo: null },
          { label: "Option B", value: "b", goTo: null },
        ],
      };
    case "interstitial":
      return {
        type: "interstitial",
        id: nextStepId(steps, "message"),
        variant: "loading",
        title: "One moment…",
        durationMs: 2500,
      };
    case "email":
      return {
        type: "email",
        id: nextStepId(steps, "email"),
        title: "Where should we reach you?",
        placeholder: "Enter your email",
        buttonLabel: "Continue",
      };
  }
}

const S = {
  panel: { padding: "10px", fontSize: "13px" } as React.CSSProperties,
  section: { marginBottom: "14px" } as React.CSSProperties,
  sectionTitle: {
    fontWeight: 700,
    margin: "0 0 6px",
    fontSize: "12px",
    textTransform: "uppercase",
    opacity: 0.7,
  } as React.CSSProperties,
  row: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
  } as React.CSSProperties,
  label: { width: "92px", flexShrink: 0, opacity: 0.8 } as React.CSSProperties,
  input: {
    flex: 1,
    minWidth: 0,
    padding: "5px 7px",
    border: "1px solid #d1d5db",
    borderRadius: "5px",
    fontSize: "13px",
    color: "#111",
    background: "#fff",
  } as React.CSSProperties,
  btn: {
    padding: "5px 9px",
    border: "1px solid #d1d5db",
    borderRadius: "5px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    color: "#111",
  } as React.CSSProperties,
  smallBtn: {
    padding: "2px 7px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#111",
  } as React.CSSProperties,
  stepItem: (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: active ? "#2563eb" : "#111",
    width: "100%",
    padding: "6px 8px",
    marginBottom: "4px",
    border: active ? "1px solid #2563eb" : "1px solid #e5e7eb",
    background: active ? "#eff6ff" : "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "13px",
  }),
  issue: (level: "error" | "warning"): React.CSSProperties => ({
    padding: "6px 8px",
    marginBottom: "6px",
    borderRadius: "5px",
    fontSize: "12px",
    background: level === "error" ? "#fef2f2" : "#fffbeb",
    color: level === "error" ? "#b91c1c" : "#92400e",
  }),
  answerBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "8px",
    marginBottom: "8px",
  } as React.CSSProperties,
};

const STEP_BADGE: Record<QuizStep["type"], string> = {
  question: "❓",
  interstitial: "⏳",
  email: "✉️",
};

export function QuizPanel({ component, grapes }: QuizPanelProps) {
  const [config, setConfig] = useState<QuizConfig>(() => readConfig(component));
  const [stepIdx, setStepIdx] = useState(0);

  // True while commit() is inside component.set(): GrapesJS emits
  // component:update:quiz-config synchronously during set(), and the resync
  // subscription below must ignore the panel's own writes (it exists only
  // for external changes like undo/redo).
  const committingRef = useRef(false);

  // Resync when the prop changes outside this panel (undo/redo).
  useEffect(() => {
    const handler = (comp: unknown) => {
      if (comp === component && !committingRef.current) {
        setConfig(readConfig(component));
      }
    };
    grapes.on("component:update:quiz-config", handler);
    return () => {
      grapes.off("component:update:quiz-config", handler);
    };
  }, [component, grapes]);

  const issues = useMemo(() => validateQuizConfig(config).issues, [config]);
  const step = config.steps[Math.min(stepIdx, config.steps.length - 1)];

  function commit(next: QuizConfig) {
    setConfig(next);
    committingRef.current = true;
    try {
      (component as unknown as ComponentLike).set("quiz-config", next);
    } finally {
      committingRef.current = false;
    }
  }

  function previewStep(i: number) {
    setStepIdx(i);
    (component as unknown as ComponentLike).set("active-step", i + 1);
  }

  function updateStep(i: number, patch: Partial<QuizStep>) {
    commit({
      ...config,
      steps: config.steps.map((s, j) =>
        j === i ? ({ ...s, ...patch } as QuizStep) : s,
      ),
    });
  }

  function addStep(type: QuizStep["type"]) {
    const next = [...config.steps, makeStep(type, config.steps)];
    commit({ ...config, steps: next });
    previewStep(next.length - 1);
  }

  function removeStep(i: number) {
    if (config.steps.length <= 1) return;
    const next = config.steps.filter((_, j) => j !== i);
    commit({ ...config, steps: next });
    previewStep(Math.max(0, Math.min(i, next.length - 1)));
  }

  function moveStep(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= config.steps.length) return;
    const next = [...config.steps];
    [next[i], next[j]] = [next[j], next[i]];
    commit({ ...config, steps: next });
    previewStep(j);
  }

  function updateAnswer(
    stepI: number,
    ansI: number,
    patch: Partial<QuizAnswer>,
  ) {
    const target = config.steps[stepI];
    if (target.type !== "question") return;
    updateStep(stepI, {
      answers: target.answers.map((a, k) =>
        k === ansI ? { ...a, ...patch } : a,
      ),
    } as Partial<QuizStep>);
  }

  function addAnswer(stepI: number) {
    const target = config.steps[stepI];
    if (target.type !== "question") return;
    updateStep(stepI, {
      answers: [
        ...target.answers,
        {
          label: "New option",
          value: `option_${target.answers.length + 1}`,
          goTo: null,
        },
      ],
    } as Partial<QuizStep>);
  }

  function removeAnswer(stepI: number, ansI: number) {
    const target = config.steps[stepI];
    if (target.type !== "question" || target.answers.length <= 1) return;
    updateStep(stepI, {
      answers: target.answers.filter((_, k) => k !== ansI),
    } as Partial<QuizStep>);
  }

  function text(
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
  ) {
    return (
      <div style={S.row}>
        <span style={S.label}>{label}</span>
        <input
          style={S.input}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div style={S.panel} className="oxy-quiz-panel">
      {issues.map((issue, i) => (
        <div key={i} style={S.issue(issue.level)}>
          {issue.path ? `${issue.path}: ` : ""}
          {issue.message}
        </div>
      ))}

      <div style={S.section}>
        <p style={S.sectionTitle}>Steps</p>
        {config.steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            style={S.stepItem(i === stepIdx)}
            onClick={() => previewStep(i)}
          >
            <span>{STEP_BADGE[s.type]}</span>
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {i + 1}. {s.title || s.id}
            </span>
            <span
              style={S.smallBtn}
              onClick={(e) => {
                e.stopPropagation();
                moveStep(i, -1);
              }}
              title="Move up"
            >
              ↑
            </span>
            <span
              style={S.smallBtn}
              onClick={(e) => {
                e.stopPropagation();
                moveStep(i, 1);
              }}
              title="Move down"
            >
              ↓
            </span>
            <span
              style={S.smallBtn}
              onClick={(e) => {
                e.stopPropagation();
                removeStep(i);
              }}
              title="Remove step"
            >
              ×
            </span>
          </button>
        ))}
        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
          <button
            type="button"
            style={S.btn}
            onClick={() => addStep("question")}
          >
            + Question
          </button>
          <button
            type="button"
            style={S.btn}
            onClick={() => addStep("interstitial")}
          >
            + Interstitial
          </button>
          {!config.steps.some((s) => s.type === "email") && (
            <button
              type="button"
              style={S.btn}
              onClick={() => addStep("email")}
            >
              + Email
            </button>
          )}
        </div>
      </div>

      {step && (
        <div style={S.section}>
          <p style={S.sectionTitle}>
            Step {stepIdx + 1} — {step.type}
          </p>
          {text(
            "Step key",
            step.id,
            (v) => updateStep(stepIdx, { id: v }),
            "query param name",
          )}
          {text("Title", step.title, (v) => updateStep(stepIdx, { title: v }))}

          {step.type === "question" && (
            <>
              <div style={S.row}>
                <span style={S.label}>Layout</span>
                <select
                  style={S.input}
                  value={step.layout}
                  onChange={(e) =>
                    updateStep(stepIdx, {
                      layout: e.target.value as "buttons" | "cards",
                    })
                  }
                >
                  <option value="buttons">Buttons (stacked)</option>
                  <option value="cards">Cards (2-column)</option>
                </select>
              </div>
              {step.answers.map((a, k) => (
                <div key={k} style={S.answerBox}>
                  {text("Label", a.label, (v) =>
                    updateAnswer(stepIdx, k, { label: v }),
                  )}
                  {text(
                    "Value",
                    a.value,
                    (v) => updateAnswer(stepIdx, k, { value: v }),
                    "query param value",
                  )}
                  {text("Emoji", a.emoji ?? "", (v) =>
                    updateAnswer(stepIdx, k, { emoji: v }),
                  )}
                  {text(
                    "Image URL",
                    a.imageUrl ?? "",
                    (v) => updateAnswer(stepIdx, k, { imageUrl: v }),
                    "https://…",
                  )}
                  <div style={S.row}>
                    <span style={S.label}>Go to step</span>
                    <select
                      style={S.input}
                      value={a.goTo ?? ""}
                      onChange={(e) =>
                        updateAnswer(stepIdx, k, {
                          goTo: e.target.value || null,
                        })
                      }
                    >
                      <option value="">(next step)</option>
                      {config.steps
                        .filter((s) => s.id !== step.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id}
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    style={S.smallBtn}
                    onClick={() => removeAnswer(stepIdx, k)}
                  >
                    × Remove option
                  </button>
                </div>
              ))}
              <button
                type="button"
                style={S.btn}
                onClick={() => addAnswer(stepIdx)}
              >
                + Add option
              </button>
            </>
          )}

          {step.type === "interstitial" && (
            <>
              <div style={S.row}>
                <span style={S.label}>Variant</span>
                <select
                  style={S.input}
                  value={step.variant}
                  onChange={(e) =>
                    updateStep(stepIdx, {
                      variant: e.target.value as "loading" | "message",
                    })
                  }
                >
                  <option value="loading">Loading (auto-advance)</option>
                  <option value="message">Message (continue button)</option>
                </select>
              </div>
              {text("Subtitle", step.subtitle ?? "", (v) =>
                updateStep(stepIdx, { subtitle: v }),
              )}
              {step.variant === "loading" && (
                <div style={S.row}>
                  <span style={S.label}>Duration (ms)</span>
                  <input
                    style={S.input}
                    type="number"
                    min={300}
                    value={step.durationMs ?? 2500}
                    onChange={(e) =>
                      updateStep(stepIdx, {
                        durationMs: Number(e.target.value) || 2500,
                      })
                    }
                  />
                </div>
              )}
              {step.variant === "message" &&
                text("Button text", step.buttonLabel ?? "Continue", (v) =>
                  updateStep(stepIdx, { buttonLabel: v }),
                )}
            </>
          )}

          {step.type === "email" && (
            <>
              {text("Placeholder", step.placeholder ?? "", (v) =>
                updateStep(stepIdx, { placeholder: v }),
              )}
              {text("Button text", step.buttonLabel ?? "", (v) =>
                updateStep(stepIdx, { buttonLabel: v }),
              )}
            </>
          )}
        </div>
      )}

      <div style={S.section}>
        <p style={S.sectionTitle}>Theme</p>
        <div style={S.row}>
          <span style={S.label}>Primary</span>
          <input
            type="color"
            value={config.theme.primaryColor}
            onChange={(e) =>
              commit({
                ...config,
                theme: { ...config.theme, primaryColor: e.target.value },
              })
            }
          />
        </div>
        <div style={S.row}>
          <span style={S.label}>Button text</span>
          <input
            type="color"
            value={config.theme.buttonTextColor}
            onChange={(e) =>
              commit({
                ...config,
                theme: { ...config.theme, buttonTextColor: e.target.value },
              })
            }
          />
        </div>
        <div style={S.row}>
          <span style={S.label}>Card bg</span>
          <input
            type="color"
            value={config.theme.cardBackground}
            onChange={(e) =>
              commit({
                ...config,
                theme: { ...config.theme, cardBackground: e.target.value },
              })
            }
          />
        </div>
        <div style={S.row}>
          <span style={S.label}>Card text</span>
          <input
            type="color"
            value={config.theme.cardTextColor}
            onChange={(e) =>
              commit({
                ...config,
                theme: { ...config.theme, cardTextColor: e.target.value },
              })
            }
          />
        </div>
        <div style={S.row}>
          <span style={S.label}>Radius (px)</span>
          <input
            style={S.input}
            type="number"
            min={0}
            max={40}
            value={config.theme.borderRadius}
            onChange={(e) =>
              commit({
                ...config,
                theme: {
                  ...config.theme,
                  borderRadius: Number(e.target.value) || 0,
                },
              })
            }
          />
        </div>
        <div style={S.row}>
          <span style={S.label}>Progress bar</span>
          <input
            type="checkbox"
            checked={config.theme.showProgressBar}
            onChange={(e) =>
              commit({
                ...config,
                theme: { ...config.theme, showProgressBar: e.target.checked },
              })
            }
          />
        </div>
      </div>

      <div style={S.section}>
        <p style={S.sectionTitle}>Redirect</p>
        {text(
          "Affiliate URL",
          config.redirect.url,
          (v) =>
            commit({ ...config, redirect: { ...config.redirect, url: v } }),
          "https://your-offer-link…",
        )}
        <div style={S.row}>
          <span style={S.label}>Append answers</span>
          <input
            type="checkbox"
            checked={config.redirect.appendAnswers}
            onChange={(e) =>
              commit({
                ...config,
                redirect: {
                  ...config.redirect,
                  appendAnswers: e.target.checked,
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
