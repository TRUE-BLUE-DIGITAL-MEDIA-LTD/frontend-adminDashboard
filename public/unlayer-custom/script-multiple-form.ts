/**
 * Runtime for the oxy multi-step form block.
 *
 * Shared by ALL published landing pages, so behavior is strictly additive:
 *   • Legacy forms (no `.oxy-form-submit-step`): identical to the old
 *     script — option buttons navigate between `.form_step` divs and the
 *     last step's button opens its own `url` in a new tab.
 *   • Upgraded forms: option answers accumulate in memory; the submission
 *     step's CTA validates email + consent, POSTs everything to
 *     /api/v1/customers, then redirects to the final answer's `url`
 *     (fallbacks: page-level form link, then the page's main link) with
 *     `sub3` = base64 email.
 *
 * Pure helpers are exposed on `globalThis.__oxyMultipleForm` for unit
 * tests; DOM wiring is skipped when `document` is undefined (node/vitest).
 */

(() => {
  type AnswerMap = Record<string, string>;

  // ---- pure helpers (unit-tested via globalThis.__oxyMultipleForm) ----

  const RESERVED_KEYS = ["url", "move_to_step"];

  function recordAnswer(
    answers: AnswerMap,
    payload: Record<string, unknown>,
  ): AnswerMap {
    const next: AnswerMap = { ...answers };
    for (const key of Object.keys(payload)) {
      if (RESERVED_KEYS.indexOf(key) !== -1) continue;
      const value = payload[key];
      if (typeof value === "string") next[key] = value;
    }
    return next;
  }

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function buildSubmitPayload(
    answers: AnswerMap,
    email: string,
    landingPageId: string,
  ): { email: string; landingPageId: string; formAnswers: AnswerMap } {
    return { email, landingPageId, formAnswers: answers };
  }

  function buildRedirectUrl(
    answerUrl: string,
    link: string,
    fallbackLink: string,
    email: string,
  ): string {
    const target = answerUrl || link || fallbackLink;
    if (!target) return "";
    try {
      const u = new URL(target);
      if (email) u.searchParams.set("sub3", btoa(email));
      return u.toString();
    } catch {
      return target;
    }
  }

  (globalThis as Record<string, unknown>).__oxyMultipleForm = {
    recordAnswer,
    isValidEmail,
    buildSubmitPayload,
    buildRedirectUrl,
  };

  if (typeof document === "undefined") return; // unit-test environment

  // ---- DOM wiring ----

  // The final-redirect link tag is a single page-level element shared by all
  // forms on the page (legacy contract — one tag per page).
  let formLink = "";
  const linkScript = document.getElementsByClassName(
    "script_multiple_form",
  )[0] as HTMLScriptElement | undefined;
  if (linkScript) {
    try {
      const parsed = JSON.parse(linkScript.getAttribute("value") ?? "{}") as {
        link?: string;
      };
      formLink = parsed.link ?? "";
    } catch {
      // malformed tag — fall back to the stamped link
    }
  }

  /**
   * Wire one form. `scope` bounds every element lookup so multiple forms on
   * a page stay independent; `rootEl` (the `.oxy-multiple-form` element, when
   * present) carries the server-stamped landing-page id and fallback link.
   */
  const wireForm = (
    scope: Document | Element,
    rootEl: Element | null,
  ): void => {
    const steps = Array.from(
      scope.getElementsByClassName("form_step"),
    ) as HTMLElement[];
    if (steps.length === 0) return;

    const landingPageId = rootEl?.getAttribute("data-oxy-lp-id") ?? "";
    const fallbackLink = rootEl?.getAttribute("data-oxy-fallback-link") ?? "";

    const hasSubmitStep =
      scope.getElementsByClassName("oxy-form-submit-step").length > 0;

    let answers: AnswerMap = {};

    // URL of the most recently clicked option — every click overwrites it
    // (empty when the option has no url), so only the FINAL answer, the
    // click that led into the submission step, decides the redirect.
    let finalUrl = "";

    /**
     * Show exactly one step (0-based index), hiding every other, via inline
     * styles. Navigation is by DOM order, NOT by `form_step_N` ids: the
     * GrapesJS export assigns volatile auto ids to steps (never form_step_N —
     * that attr write doesn't survive export) and emits visibility as CSS
     * rules keyed to those ids. Inline styles win over any such rules, and
     * DOM order matches legacy pages' sequential ids, so this works for both
     * eras of markup.
     */
    const showStep = (idx: number): void => {
      steps.forEach((s, i) => {
        s.style.display = i === idx ? "flex" : "none";
      });
    };

    // The export can't be trusted to carry the initial visibility state, so
    // the runtime owns it: first step visible, everything else (including the
    // submission step) hidden until reached.
    showStep(0);

    steps.forEach((step, idx) => {
      const i = idx + 1;
      const containers = step.getElementsByClassName("button-containers");
      for (let c = 0; c < containers.length; c++) {
        const buttons = Array.from(
          containers[c].children,
        ) as HTMLButtonElement[];
        buttons.forEach((button) => {
          let payload: Record<string, unknown> = {};
          try {
            payload = JSON.parse(
              button.getAttribute("value") ?? "{}",
            ) as Record<string, unknown>;
          } catch {
            // keep {} — button still navigates
          }

          button.onclick = () => {
            answers = recordAnswer(answers, payload);
            finalUrl = typeof payload.url === "string" ? payload.url : "";

            // Legacy final-step behavior — only when no submission step
            // exists (old published pages).
            if (!hasSubmitStep && i === steps.length) {
              window.open(String(payload.url ?? ""), "_blank");
              return;
            }

            const moveTo = payload.move_to_step;
            const toIndex =
              typeof moveTo === "string" && moveTo !== ""
                ? Number(moveTo)
                : i + 1;
            if (
              Number.isFinite(toIndex) &&
              toIndex >= 1 &&
              toIndex <= steps.length
            ) {
              showStep(toIndex - 1);
            }
          };
        });
      }
    });

    // Input steps: Continue validates required fields, records every filled
    // field into `answers` keyed by data-oxy-answer-key, then advances one
    // step in DOM order. Strictly additive — legacy pages have no
    // .oxy-form-input-step elements.
    steps.forEach((step, idx) => {
      if (!step.classList.contains("oxy-form-input-step")) return;
      const continueBtns = Array.from(
        step.getElementsByClassName("oxy-form-input-continue"),
      ) as HTMLButtonElement[];
      continueBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const fields = Array.from(
            step.getElementsByClassName("oxy-form-input-field"),
          ) as HTMLInputElement[];
          for (const field of fields) {
            if (!field.reportValidity()) return;
          }
          const payload: Record<string, string> = {};
          for (const field of fields) {
            const key = field.getAttribute("data-oxy-answer-key") ?? "";
            const value = field.value.trim();
            if (key && value) payload[key] = value;
          }
          answers = recordAnswer(answers, payload);
          if (idx + 1 < steps.length) showStep(idx + 1);
        });
      });
    });

    const ctas = Array.from(
      scope.getElementsByClassName("oxy-form-submit-cta"),
    ) as HTMLButtonElement[];
    ctas.forEach((cta) => {
      const stepEl = cta.closest(".oxy-form-submit-step");
      if (!stepEl) return;
      const emailInput = stepEl.querySelector<HTMLInputElement>(
        ".oxy-form-email-input",
      );
      const consent = stepEl.querySelector<HTMLInputElement>(
        ".oxy-form-consent-checkbox",
      );

      cta.addEventListener("click", async () => {
        // Native constraint validation shows the browser's own messages;
        // isValidEmail is a belt-and-braces re-check of the same rule.
        if (emailInput && !emailInput.reportValidity()) return;
        const email = emailInput?.value ?? "";
        if (!isValidEmail(email)) {
          emailInput?.reportValidity();
          return;
        }
        if (consent && !consent.reportValidity()) return;

        const originalText = cta.textContent;
        cta.disabled = true;
        cta.textContent = "Loading..";

        // Never strand the user: 5s cap on the POST, redirect regardless.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        try {
          await fetch("/api/v1/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              buildSubmitPayload(answers, email, landingPageId),
            ),
            signal: controller.signal,
          });
        } catch {
          // losing one lead record beats losing the conversion
        }
        clearTimeout(timer);

        const redirect = buildRedirectUrl(
          finalUrl,
          formLink,
          fallbackLink,
          email,
        );
        if (redirect) {
          window.open(redirect, "_self");
        } else {
          cta.disabled = false;
          cta.textContent = originalText;
        }
      });
    });
  };

  const roots = Array.from(
    document.getElementsByClassName("oxy-multiple-form"),
  ) as HTMLElement[];
  if (roots.length > 0) {
    roots.forEach((rootEl) => wireForm(rootEl, rootEl));
  } else {
    // Legacy pages may predate the `.oxy-multiple-form` marker entirely —
    // treat the whole document as a single form.
    wireForm(document, null);
  }
})();
