import type {
  QuizAnswer,
  QuizConfig,
  QuizEmailStep,
  QuizInterstitialStep,
  QuizQuestionStep,
  QuizStep,
  QuizTheme,
} from "./schema";

/** Marker class on the quiz root element — also the GrapesJS type name. */
export const QUIZ_MARKER_CLASS = "oxy-quiz";
/** Attribute on the quiz root carrying the URI-encoded JSON config. */
export const QUIZ_CONFIG_ATTR = "data-oxy-quiz-config";
/** Editor-only class marking the previewed step (never exported meaningfully). */
export const QUIZ_ACTIVE_STEP_CLASS = "oxy-quiz-step-active";

export function encodeQuizConfigAttr(config: QuizConfig): string {
  return encodeURIComponent(JSON.stringify(config));
}

/** Returns null when the attribute doesn't decode to an object. */
export function decodeQuizConfigAttr(raw: string): QuizConfig | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as QuizConfig;
  } catch {
    return null;
  }
}

function countable(step: QuizStep): boolean {
  return step.type === "question" || step.type === "email";
}

/**
 * Progress for the bar while `stepId` is shown. Question + email steps each
 * add a segment; interstitials hold the previous value.
 * NOTE: duplicated (small, by design) in public/unlayer-custom/script-quiz.ts,
 * which cannot import modules. Keep both in sync.
 */
export function quizProgressPercent(config: QuizConfig, stepId: string): number {
  const total = config.steps.filter(countable).length;
  if (total === 0) return 0;
  let position = 0;
  for (const step of config.steps) {
    if (countable(step)) position += 1;
    if (step.id === stepId) {
      return Math.round((position / total) * 100);
    }
  }
  return 0;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");
}

/**
 * Joins a style object into a `style` attribute value. The result is
 * attribute-escaped here, at the single choke point, because theme strings
 * (colors) are author-provided and must not break out of the attribute.
 */
function styleStr(styles: Record<string, string>): string {
  return escapeAttr(
    Object.entries(styles)
      .map(([k, v]) => `${k}:${v}`)
      .join(";"),
  );
}

const STEP_BASE: Record<string, string> = {
  "flex-direction": "column",
  "align-items": "center",
  "justify-content": "center",
  gap: "14px",
  width: "100%",
  padding: "20px 12px",
  "box-sizing": "border-box",
};

function stepStyle(visible: boolean): string {
  return styleStr({ ...STEP_BASE, display: visible ? "flex" : "none" });
}

function titleHtml(stepId: string, title: string, theme: QuizTheme): string {
  return `<div class="oxy-quiz__title" data-i18n="quiz.${escapeAttr(stepId)}.title" style="${styleStr(
    {
      "font-size": "24px",
      "font-weight": "700",
      color: theme.cardTextColor,
      "text-align": "center",
      "line-height": "1.3",
    },
  )}">${escapeHtml(title)}</div>`;
}

function subtitleHtml(
  stepId: string,
  subtitle: string,
  theme: QuizTheme,
): string {
  return `<div class="oxy-quiz__subtitle" data-i18n="quiz.${escapeAttr(stepId)}.subtitle" style="${styleStr(
    {
      "font-size": "15px",
      color: theme.cardTextColor,
      opacity: "0.75",
      "text-align": "center",
    },
  )}">${escapeHtml(subtitle)}</div>`;
}

function primaryButtonStyle(theme: QuizTheme): string {
  return styleStr({
    "min-width": "15rem",
    padding: "12px 20px",
    "background-color": theme.primaryColor,
    color: theme.buttonTextColor,
    "font-size": "18px",
    "font-weight": "600",
    border: "0",
    "border-radius": `${theme.borderRadius}px`,
    cursor: "pointer",
    "box-shadow":
      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  });
}

function answerHtml(
  stepId: string,
  answer: QuizAnswer,
  layout: "buttons" | "cards",
  theme: QuizTheme,
): string {
  const isCard = layout === "cards";
  const style = isCard
    ? styleStr({
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        gap: "8px",
        padding: "16px 12px",
        "background-color": theme.cardBackground,
        color: theme.cardTextColor,
        border: "1px solid rgba(0,0,0,0.08)",
        "border-radius": `${theme.borderRadius}px`,
        cursor: "pointer",
        "font-size": "17px",
        "font-weight": "600",
        "box-shadow": "0 2px 6px rgba(0,0,0,0.08)",
      })
    : primaryButtonStyle(theme);
  const media = answer.imageUrl
    ? `<img class="oxy-quiz__answer-img" src="${escapeAttr(answer.imageUrl)}" alt="" style="${styleStr(
        {
          width: "100%",
          "max-height": "140px",
          "object-fit": "cover",
          "border-radius": `${Math.max(theme.borderRadius - 4, 0)}px`,
          display: "block",
        },
      )}" />`
    : answer.emoji
      ? `<span class="oxy-quiz__answer-emoji" style="font-size:34px;line-height:1;">${escapeHtml(answer.emoji)}</span>`
      : "";
  return `<button type="button" class="oxy-quiz__answer" data-value="${escapeAttr(
    answer.value,
  )}" data-label="${escapeAttr(answer.label)}" data-goto="${escapeAttr(
    answer.goTo ?? "",
  )}" style="${style}">${media}<span class="oxy-quiz__answer-label" data-i18n="quiz.${escapeAttr(
    stepId,
  )}.answer.${escapeAttr(answer.value)}">${escapeHtml(answer.label)}</span></button>`;
}

function questionStepHtml(
  step: QuizQuestionStep,
  theme: QuizTheme,
  visible: boolean,
): string {
  const isCards = step.layout === "cards";
  const answersStyle = isCards
    ? styleStr({
        display: "grid",
        "grid-template-columns": "1fr 1fr",
        gap: "12px",
        width: "100%",
        "max-width": "420px",
      })
    : styleStr({
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        gap: "10px",
        width: "100%",
      });
  const answers = step.answers
    .map((a) => answerHtml(step.id, a, step.layout, theme))
    .join("");
  return `<div class="oxy-quiz__step" data-step-id="${escapeAttr(step.id)}" data-step-type="question" style="${stepStyle(
    visible,
  )}">${titleHtml(step.id, step.title, theme)}<div class="oxy-quiz__answers oxy-quiz__answers--${
    isCards ? "cards" : "buttons"
  }" style="${answersStyle}">${answers}</div></div>`;
}

function interstitialStepHtml(
  step: QuizInterstitialStep,
  theme: QuizTheme,
  visible: boolean,
): string {
  const duration = step.durationMs ?? 2500;
  const spinner =
    step.variant === "loading"
      ? `<div class="oxy-quiz__spinner" style="${styleStr({
          width: "42px",
          height: "42px",
          border: "4px solid rgba(0,0,0,0.12)",
          "border-top-color": theme.primaryColor,
          "border-radius": "50%",
          animation: "oxy-quiz-spin 0.8s linear infinite",
        })}"></div>`
      : "";
  const continueBtn =
    step.variant === "message"
      ? `<button type="button" class="oxy-quiz__continue" style="${primaryButtonStyle(
          theme,
        )}"><span data-i18n="quiz.${escapeAttr(step.id)}.button">${escapeHtml(
          step.buttonLabel ?? "Continue",
        )}</span></button>`
      : "";
  const subtitle = step.subtitle
    ? subtitleHtml(step.id, step.subtitle, theme)
    : "";
  return `<div class="oxy-quiz__step" data-step-id="${escapeAttr(step.id)}" data-step-type="interstitial" data-variant="${
    step.variant
  }" data-duration="${duration}" style="${stepStyle(visible)}">${titleHtml(
    step.id,
    step.title,
    theme,
  )}${subtitle}${spinner}${continueBtn}</div>`;
}

function emailStepHtml(
  step: QuizEmailStep,
  theme: QuizTheme,
  visible: boolean,
): string {
  // Deliberately NOT name="email" and NOT type="submit": the landing-page
  // renderer attaches its own handlers to input[name="email"] and
  // button[type="submit"] (see clients/landingpage/pages/index.tsx) — the
  // quiz runtime owns this flow instead.
  return `<div class="oxy-quiz__step" data-step-id="${escapeAttr(step.id)}" data-step-type="email" style="${stepStyle(
    visible,
  )}">${titleHtml(step.id, step.title, theme)}<input type="email" name="quiz_email" class="oxy-quiz__email-input" placeholder="${escapeAttr(
    step.placeholder ?? "Enter your email",
  )}" style="${styleStr({
    width: "100%",
    "max-width": "320px",
    padding: "12px 14px",
    "font-size": "16px",
    border: "1px solid rgba(0,0,0,0.2)",
    "border-radius": `${theme.borderRadius}px`,
    "box-sizing": "border-box",
  })}" /><div class="oxy-quiz__email-error" data-i18n="quiz.${escapeAttr(step.id)}.error" style="${styleStr({
    display: "none",
    color: "#dc2626",
    "font-size": "14px",
  })}">Please enter a valid email</div><button type="button" class="oxy-quiz__email-btn" style="${primaryButtonStyle(
    theme,
  )}"><span data-i18n="quiz.${escapeAttr(step.id)}.button">${escapeHtml(
    step.buttonLabel ?? "Continue",
  )}</span></button></div>`;
}

function progressHtml(config: QuizConfig): string {
  if (!config.theme.showProgressBar) return "";
  const first = config.steps[0];
  const initial = first ? quizProgressPercent(config, first.id) : 0;
  return `<div class="oxy-quiz__progress" style="${styleStr({
    width: "100%",
    "max-width": "420px",
    height: "8px",
    "background-color": "rgba(0,0,0,0.1)",
    "border-radius": "999px",
    margin: "0 auto",
    overflow: "hidden",
  })}"><div class="oxy-quiz__progress-fill" style="${styleStr({
    width: `${initial}%`,
    height: "100%",
    "background-color": config.theme.primaryColor,
    "border-radius": "999px",
    transition: "width 0.3s ease",
  })}"></div></div>`;
}

/**
 * Renders the quiz INNER html (progress bar + all steps). The root
 * `<div class="oxy-quiz">` element is owned by the GrapesJS component
 * (block.ts) / the exported document — not rendered here.
 *
 * Export invariant (mirrored from multiple-form): first step inline
 * `display:flex`, every other step `display:none`. The runtime toggles
 * inline display as the user advances; the editor canvas overrides via
 * the QUIZ_ACTIVE_STEP_CLASS + canvas-only CSS.
 */
export function renderQuizInnerHtml(config: QuizConfig): string {
  const steps = config.steps
    .map((step, i) => {
      const visible = i === 0;
      switch (step.type) {
        case "question":
          return questionStepHtml(step, config.theme, visible);
        case "interstitial":
          return interstitialStepHtml(step, config.theme, visible);
        case "email":
          return emailStepHtml(step, config.theme, visible);
      }
    })
    .join("");
  return `${progressHtml(config)}${steps}`;
}
