"use strict";
/**
 * Oxyclick Quiz runtime — loaded on published landing pages via
 * <script src="https://oxyclick.com/unlayer-custom/script-quiz.js" defer>.
 *
 * CLASSIC SCRIPT: no import/export statements allowed (compiled by
 * `npm run convert:tsx` and served as a non-module script). Types are
 * declared locally; the authoritative schema lives in
 * clients/dashboard/editor/core/tools/quiz/schema.ts.
 *
 * Reads the quiz config from the root's data-oxy-quiz-config attribute
 * (URI-encoded JSON). Handles step navigation, goTo branching, progress
 * bar, interstitial timers, email validation, and the final redirect.
 *
 * Integration contract with clients/landingpage/pages/index.tsx:
 *   - dispatches "oxy-quiz:step" on each answered question
 *   - dispatches cancelable "oxy-quiz:complete" at the end; if nobody calls
 *     preventDefault(), this script performs the redirect itself.
 */
(() => {
    // ---- pure helpers (unit-tested via globalThis.__oxyQuiz) ----
    function nextStepId(steps, currentId, goTo) {
        if (goTo && steps.some((s) => s.id === goTo))
            return goTo;
        const idx = steps.findIndex((s) => s.id === currentId);
        if (idx === -1)
            return null;
        const next = steps[idx + 1];
        return next ? next.id : null;
    }
    function buildRedirectUrl(redirect, answers, email) {
        try {
            const u = new URL(redirect.url);
            if (redirect.appendAnswers) {
                for (const key of Object.keys(answers)) {
                    u.searchParams.set(key, answers[key]);
                }
            }
            if (email)
                u.searchParams.set("sub3", btoa(email));
            return u.toString();
        }
        catch {
            return redirect.url;
        }
    }
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    // Keep in sync with quizProgressPercent in
    // editor/core/tools/quiz/render.ts (duplicated because this file
    // cannot import).
    function progressPercent(steps, stepId) {
        const total = steps.filter((s) => s.type === "question" || s.type === "email").length;
        if (total === 0)
            return 0;
        let position = 0;
        for (const step of steps) {
            if (step.type === "question" || step.type === "email")
                position += 1;
            if (step.id === stepId)
                return Math.round((position / total) * 100);
        }
        return 0;
    }
    globalThis.__oxyQuiz = {
        nextStepId,
        buildRedirectUrl,
        isValidEmail,
        progressPercent,
    };
    // ---- DOM wiring (browser only) ----
    function init() {
        if (typeof document === "undefined")
            return;
        const root = document.querySelector(".oxy-quiz");
        if (!root)
            return;
        // Alias to a non-nullable const so TypeScript can track it across closures.
        const el = root;
        // Guard against double wiring (e.g. script injected twice).
        if (el.dataset.oxyQuizInit === "1")
            return;
        el.dataset.oxyQuizInit = "1";
        let config = null;
        try {
            const raw = el.getAttribute("data-oxy-quiz-config") || "";
            config = JSON.parse(decodeURIComponent(raw));
        }
        catch (err) {
            console.error("[oxy-quiz] unreadable config", err);
        }
        if (!config || !Array.isArray(config.steps) || config.steps.length === 0) {
            // Degrade: any answer click goes straight to the redirect URL so a
            // broken quiz still monetizes as a one-click lander.
            const fallbackUrl = config && config.redirect ? config.redirect.url : "";
            el.querySelectorAll(".oxy-quiz__answer").forEach((btn) => {
                btn.onclick = () => {
                    if (fallbackUrl)
                        window.open(fallbackUrl, "_self");
                };
            });
            return;
        }
        const cfg = config;
        // Spinner keyframes — inline styles can't carry @keyframes.
        if (!document.getElementById("oxy-quiz-spin-style")) {
            const style = document.createElement("style");
            style.id = "oxy-quiz-spin-style";
            style.textContent =
                "@keyframes oxy-quiz-spin{to{transform:rotate(360deg)}}";
            document.head.appendChild(style);
        }
        const answers = {};
        let email = "";
        let interstitialTimer;
        let autoHops = 0;
        function stepEl(id) {
            return el.querySelector(`.oxy-quiz__step[data-step-id="${id}"]`);
        }
        function complete() {
            const redirectUrl = cfg.redirect ? cfg.redirect.url : "";
            const evt = new CustomEvent("oxy-quiz:complete", {
                cancelable: true,
                detail: {
                    answers: { ...answers },
                    email,
                    redirectUrl,
                    appendAnswers: cfg.redirect ? cfg.redirect.appendAnswers !== false : true,
                },
            });
            const notClaimed = document.dispatchEvent(evt);
            if (!notClaimed)
                return; // landing page renderer took over
            if (!redirectUrl) {
                console.warn("[oxy-quiz] no redirect url configured");
                return;
            }
            window.open(buildRedirectUrl(cfg.redirect, answers, email), "_self");
        }
        function showStep(id) {
            if (interstitialTimer !== undefined) {
                window.clearTimeout(interstitialTimer);
                interstitialTimer = undefined;
            }
            if (id === null) {
                complete();
                return;
            }
            cfg.steps.forEach((s) => {
                const stepNode = stepEl(s.id);
                if (stepNode)
                    stepNode.style.display = s.id === id ? "flex" : "none";
            });
            const fill = el.querySelector(".oxy-quiz__progress-fill");
            if (fill)
                fill.style.width = `${progressPercent(cfg.steps, id)}%`;
            const step = cfg.steps.find((s) => s.id === id);
            if (step && step.type === "interstitial" && step.variant === "loading") {
                const duration = typeof step.durationMs === "number" ? step.durationMs : 2500;
                interstitialTimer = window.setTimeout(() => {
                    autoHops += 1;
                    if (autoHops > cfg.steps.length) {
                        // Misconfigured goTo cycle through auto-advancing steps —
                        // bail out to completion instead of looping forever.
                        complete();
                        return;
                    }
                    showStep(nextStepId(cfg.steps, id, ""));
                }, duration);
            }
        }
        function advanceFrom(id, goTo) {
            showStep(nextStepId(cfg.steps, id, goTo));
        }
        cfg.steps.forEach((step) => {
            const stepDiv = stepEl(step.id);
            if (!stepDiv)
                return;
            if (step.type === "question") {
                stepDiv.querySelectorAll(".oxy-quiz__answer").forEach((btn) => {
                    btn.onclick = () => {
                        autoHops = 0;
                        const value = btn.getAttribute("data-value") || "";
                        const label = btn.getAttribute("data-label") || "";
                        const goTo = btn.getAttribute("data-goto") || "";
                        answers[step.id] = value;
                        document.dispatchEvent(new CustomEvent("oxy-quiz:step", {
                            detail: { stepId: step.id, value, label },
                        }));
                        advanceFrom(step.id, goTo);
                    };
                });
            }
            else if (step.type === "interstitial" && step.variant === "message") {
                const btn = stepDiv.querySelector(".oxy-quiz__continue");
                if (btn)
                    btn.onclick = () => { autoHops = 0; advanceFrom(step.id, ""); };
            }
            else if (step.type === "email") {
                const input = stepDiv.querySelector(".oxy-quiz__email-input");
                const error = stepDiv.querySelector(".oxy-quiz__email-error");
                const btn = stepDiv.querySelector(".oxy-quiz__email-btn");
                if (btn) {
                    btn.onclick = () => {
                        autoHops = 0;
                        const value = input ? input.value.trim() : "";
                        if (!isValidEmail(value)) {
                            if (error)
                                error.style.display = "block";
                            if (input)
                                input.focus();
                            return;
                        }
                        if (error)
                            error.style.display = "none";
                        email = value;
                        document.dispatchEvent(new CustomEvent("oxy-quiz:step", {
                            detail: { stepId: step.id, value: "submitted", label: "email" },
                        }));
                        advanceFrom(step.id, "");
                    };
                }
            }
        });
        // Sync display + progress to the first step (the export already renders
        // this state, but a reload after partial DOM mutation must self-heal).
        showStep(cfg.steps[0].id);
    }
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        }
        else {
            init();
        }
    }
})();
