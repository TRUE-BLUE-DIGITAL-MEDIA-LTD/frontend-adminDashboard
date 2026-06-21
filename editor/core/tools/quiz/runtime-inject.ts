import { QUIZ_MARKER_CLASS } from "./render";

export const QUIZ_RUNTIME_SRC = "/unlayer-custom/script-quiz.js";

/**
 * Appends the quiz runtime <script> tag to an HTML export when at least one
 * quiz block is present. The config itself already travels inside the quiz
 * root's data-oxy-quiz-config attribute, so unlike multiple-form there is no
 * separate config <script> to inject.
 *
 * Idempotent. Same localhost/prod URL convention as appendMultipleFormRuntime;
 * the window guard keeps this callable from node (tests).
 */
export function appendQuizRuntime(html: string): string {
  if (!html.includes(QUIZ_MARKER_CLASS)) return html;
  if (html.includes(QUIZ_RUNTIME_SRC)) return html;
  const isOnLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const base = isOnLocalhost ? "http://localhost:8080" : "https://oxyclick.com";
  return `${html}\n<script src="${base}${QUIZ_RUNTIME_SRC}" defer></script>`;
}
