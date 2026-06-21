/**
 * Quiz config schema — the single source of truth for a quiz.
 *
 * A quiz is one versioned JSON document. The editor renders from it
 * (render.ts), the QuizPanel edits it, the export embeds it in a
 * `data-oxy-quiz-config` attribute, and the published-page runtime
 * (public/unlayer-custom/script-quiz.ts) navigates from it.
 *
 * This schema is also the AI-authoring contract — see
 * docs/quiz-config-schema.md. Keep that doc in sync with any change here.
 */

export interface QuizAnswer {
  /** Visible button text. Translatable (data-i18n). */
  label: string;
  /** Canonical answer value — becomes the query-param value. Never translated. */
  value: string;
  /** Optional emoji rendered above/next to the label. */
  emoji?: string;
  /** Optional image URL rendered as a card image (cards layout). */
  imageUrl?: string;
  /** Step id to jump to when picked. null/undefined = next step in order. */
  goTo?: string | null;
}

export interface QuizQuestionStep {
  type: "question";
  /** Unique within the quiz. Doubles as the redirect query-param name. */
  id: string;
  title: string;
  /** "buttons" = stacked full-width buttons; "cards" = 2-column grid. */
  layout: "buttons" | "cards";
  answers: QuizAnswer[];
}

export interface QuizInterstitialStep {
  type: "interstitial";
  id: string;
  /** "loading" = spinner + auto-advance; "message" = text + continue button. */
  variant: "loading" | "message";
  title: string;
  subtitle?: string;
  /** loading variant only: auto-advance delay. Default 2500. */
  durationMs?: number;
  /** message variant only: continue button text. Default "Continue". */
  buttonLabel?: string;
}

export interface QuizEmailStep {
  type: "email";
  id: string;
  title: string;
  /** Input placeholder. Default "Enter your email". */
  placeholder?: string;
  /** Submit button text. Default "Continue". */
  buttonLabel?: string;
}

export type QuizStep = QuizQuestionStep | QuizInterstitialStep | QuizEmailStep;

export interface QuizTheme {
  /** Buttons + progress bar fill. */
  primaryColor: string;
  buttonTextColor: string;
  /** Cards layout: card background. */
  cardBackground: string;
  /** Cards layout text + step titles. */
  cardTextColor: string;
  /** px — buttons and cards. */
  borderRadius: number;
  showProgressBar: boolean;
}

export interface QuizRedirect {
  /** Final affiliate URL. Empty string = author hasn't set it yet. */
  url: string;
  /** Append collected answers as query params (?<stepId>=<value>...). */
  appendAnswers: boolean;
}

export interface QuizConfig {
  version: 1;
  theme: QuizTheme;
  steps: QuizStep[];
  redirect: QuizRedirect;
}

export interface QuizValidationIssue {
  level: "error" | "warning";
  /** Dotted path to the offending field, e.g. "steps[2].answers[0].goTo". */
  path: string;
  message: string;
}

export interface QuizValidationResult {
  /** The typed config when there are no errors (warnings allowed), else null. */
  config: QuizConfig | null;
  issues: QuizValidationIssue[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/**
 * Structural validation, no dependencies. Errors block (config: null);
 * warnings don't — the editor flags them inline but never refuses to render.
 */
export function validateQuizConfig(value: unknown): QuizValidationResult {
  const issues: QuizValidationIssue[] = [];
  const err = (path: string, message: string) =>
    issues.push({ level: "error", path, message });
  const warn = (path: string, message: string) =>
    issues.push({ level: "warning", path, message });

  if (!isRecord(value)) {
    err("", "config must be an object");
    return { config: null, issues };
  }
  if (value.version !== 1) {
    err("version", `unknown version ${String(value.version)} — expected 1`);
  }
  if (!isRecord(value.theme)) {
    err("theme", "theme must be an object");
  } else {
    const theme = value.theme;
    for (const key of [
      "primaryColor",
      "buttonTextColor",
      "cardBackground",
      "cardTextColor",
    ] as const) {
      if (!isNonEmptyString(theme[key])) {
        err(`theme.${key}`, `theme.${key} must be a non-empty string`);
      }
    }
    if (typeof theme.borderRadius !== "number" || !Number.isFinite(theme.borderRadius)) {
      err("theme.borderRadius", "theme.borderRadius must be a number");
    }
    if (typeof theme.showProgressBar !== "boolean") {
      err("theme.showProgressBar", "theme.showProgressBar must be a boolean");
    }
  }
  if (!isRecord(value.redirect)) {
    err("redirect", "redirect must be an object");
  } else {
    if (typeof value.redirect.url !== "string") {
      err("redirect.url", "redirect.url must be a string");
    }
    if (typeof value.redirect.appendAnswers !== "boolean") {
      err("redirect.appendAnswers", "redirect.appendAnswers must be a boolean");
    }
  }

  const steps = value.steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    err("steps", "steps must be a non-empty array");
    return { config: null, issues };
  }

  const ids = new Set<string>();
  let emailCount = 0;
  steps.forEach((raw, i) => {
    const path = `steps[${i}]`;
    if (!isRecord(raw)) {
      err(path, "step must be an object");
      return;
    }
    if (!isNonEmptyString(raw.id)) {
      err(`${path}.id`, "step id must be a non-empty string");
    } else if (ids.has(raw.id)) {
      err(`${path}.id`, `duplicate step id "${raw.id}"`);
    } else {
      ids.add(raw.id);
    }
    if (!isNonEmptyString(raw.title)) {
      err(`${path}.title`, "step title must be a non-empty string");
    }
    switch (raw.type) {
      case "question": {
        if (raw.layout !== "buttons" && raw.layout !== "cards") {
          err(`${path}.layout`, 'layout must be "buttons" or "cards"');
        }
        if (!Array.isArray(raw.answers) || raw.answers.length === 0) {
          err(`${path}.answers`, "question step needs at least one answer");
        } else {
          raw.answers.forEach((a, j) => {
            const ap = `${path}.answers[${j}]`;
            if (!isRecord(a)) {
              err(ap, "answer must be an object");
              return;
            }
            if (!isNonEmptyString(a.label)) {
              err(`${ap}.label`, "answer label must be a non-empty string");
            }
            if (!isNonEmptyString(a.value)) {
              err(`${ap}.value`, "answer value must be a non-empty string");
            }
          });
        }
        break;
      }
      case "interstitial": {
        if (raw.variant !== "loading" && raw.variant !== "message") {
          err(`${path}.variant`, 'variant must be "loading" or "message"');
        }
        break;
      }
      case "email": {
        emailCount += 1;
        if (emailCount > 1) {
          err(`${path}.type`, "at most one email step is allowed");
        }
        break;
      }
      default:
        err(`${path}.type`, `unknown step type "${String(raw.type ?? "(missing)")}"`);
    }
  });

  // goTo references — warnings only. The runtime treats a missing target
  // as "next step", so a stale reference degrades instead of breaking.
  steps.forEach((raw, i) => {
    if (!isRecord(raw) || raw.type !== "question" || !Array.isArray(raw.answers))
      return;
    raw.answers.forEach((a, j) => {
      if (isRecord(a) && isNonEmptyString(a.goTo) && !ids.has(a.goTo)) {
        warn(
          `steps[${i}].answers[${j}].goTo`,
          `goTo points at unknown step id "${a.goTo}" — will fall back to next step`,
        );
      }
    });
  });

  const hasError = issues.some((i) => i.level === "error");
  return { config: hasError ? null : (value as unknown as QuizConfig), issues };
}

/**
 * The block-drop default: a complete, working dating funnel. Authors tweak
 * from here instead of building from blank. redirect.url is intentionally
 * empty — the author pastes their affiliate link in the panel.
 */
export const DEFAULT_DATING_QUIZ: QuizConfig = {
  version: 1,
  theme: {
    primaryColor: "#dc2626",
    buttonTextColor: "#ffffff",
    cardBackground: "#ffffff",
    cardTextColor: "#111827",
    borderRadius: 12,
    showProgressBar: true,
  },
  steps: [
    {
      type: "question",
      id: "looking_for",
      title: "Who are you looking for?",
      layout: "cards",
      answers: [
        { label: "Women", value: "women", emoji: "👩", goTo: null },
        { label: "Men", value: "men", emoji: "👨", goTo: null },
      ],
    },
    {
      type: "question",
      id: "age",
      title: "How old are you?",
      layout: "buttons",
      answers: [
        { label: "18–24", value: "18-24", goTo: null },
        { label: "25–34", value: "25-34", goTo: null },
        { label: "35–44", value: "35-44", goTo: null },
        { label: "45+", value: "45plus", goTo: null },
      ],
    },
    {
      type: "interstitial",
      id: "searching",
      variant: "loading",
      title: "Finding matches near you…",
      subtitle: "Hundreds of members online now",
      durationMs: 2500,
    },
    {
      type: "email",
      id: "email_capture",
      title: "Where should we send your matches?",
      placeholder: "Enter your email",
      buttonLabel: "See My Matches 🔥",
    },
  ],
  redirect: {
    url: "",
    appendAnswers: true,
  },
};
