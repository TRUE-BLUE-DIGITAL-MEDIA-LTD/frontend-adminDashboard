/**
 * Dating Signup block — pure rendering (no GrapesJS imports, node-testable).
 *
 * The block collects the fields the merchant "Profile API" needs to create
 * an account (email, username, password, gender, searchGender, birthdate).
 * The published page never talks to the merchant directly: the landing-page
 * app (clients/landingpage) wires this DOM in `services/signup-form.ts` and
 * proxies the request through its own `/api/v1/profile/create` route, which
 * holds the API token and fills in ip / userAgent / countryCode.
 *
 * DOM contract (keep in sync with clients/landingpage/services/signup-form.ts):
 *   • Root   : <form class="oxy-signup"> + data-oxy-signup-* attributes
 *   • Inputs : [name="signup_email" | "signup_username" | "signup_password" |
 *              "signup_gender" | "signup_search_gender" | "signup_birthdate"]
 *   • Errors : <div class="oxy-signup__error" hidden> holding one hidden
 *              <span data-oxy-signup-msg="CODE"> per message
 *   • Submit : <button type="button" class="oxy-signup__submit">
 *
 * The submit button is deliberately NOT type="submit" and no class contains
 * "form": the lander's legacy hooks (pages/index.tsx) hijack both.
 */

/** Marker class on the root element — also the GrapesJS type name. */
export const SIGNUP_MARKER_CLASS = "oxy-signup";

/**
 * Merchants the block can target. The id must match a key of the registry in
 * clients/landingpage/server/profile-api/merchants.ts (which owns the URL and
 * the token) — the editor only stores the id.
 */
export const SIGNUP_MERCHANTS: ReadonlyArray<{ id: string; name: string }> = [
  { id: "meetmyhookup", name: "MeetMyHookup" },
];

/** Every author-editable text of the block (field labels, options, messages). */
export const SIGNUP_LABEL_KEYS = [
  "email",
  "username",
  "password",
  "gender",
  "searchGender",
  "birthdate",
  "optionMale",
  "optionFemale",
  "msgEmailExists",
  "msgUsernameExists",
  "msgGeneric",
] as const;

export type SignupLabelKey = (typeof SIGNUP_LABEL_KEYS)[number];

export interface SignupProps {
  /**
   * Per-block id, part of every data-i18n key (signup.<id>.…) so two blocks
   * on one page never share — and overwrite — each other's translations.
   */
  id: string;
  merchant: string;
  /** Tracking defaults; the lander's own URL query overrides them. */
  cid: string;
  source: string;
  subsource: string;
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  labels: Record<SignupLabelKey, string>;
}

export const DEFAULT_SIGNUP_PROPS: SignupProps = {
  id: "",
  merchant: SIGNUP_MERCHANTS[0].id,
  cid: "",
  source: "",
  subsource: "",
  buttonText: "Create my account",
  buttonColor: "#e11d48",
  buttonTextColor: "#ffffff",
  labels: {
    email: "Email",
    username: "Username",
    password: "Password",
    gender: "I am a",
    searchGender: "Looking for a",
    birthdate: "Date of birth",
    optionMale: "Man",
    optionFemale: "Woman",
    msgEmailExists: "This email is already registered.",
    msgUsernameExists: "This username is taken. Please choose another one.",
    msgGeneric: "Something went wrong. Please check your details and try again.",
  },
};

/** Messages the lander runtime reveals by code. Translatable via data-i18n. */
export const SIGNUP_MESSAGES: ReadonlyArray<{
  code: string;
  label: SignupLabelKey;
}> = [
  { code: "EMAIL_EXISTS", label: "msgEmailExists" },
  { code: "USERNAME_EXISTS", label: "msgUsernameExists" },
  { code: "GENERIC", label: "msgGeneric" },
];

const LABEL_ATTR: Record<SignupLabelKey, string> = {
  email: "data-oxy-signup-label-email",
  username: "data-oxy-signup-label-username",
  password: "data-oxy-signup-label-password",
  gender: "data-oxy-signup-label-gender",
  searchGender: "data-oxy-signup-label-search-gender",
  birthdate: "data-oxy-signup-label-birthdate",
  optionMale: "data-oxy-signup-option-male",
  optionFemale: "data-oxy-signup-option-female",
  msgEmailExists: "data-oxy-signup-msg-email-exists",
  msgUsernameExists: "data-oxy-signup-msg-username-exists",
  msgGeneric: "data-oxy-signup-msg-generic",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const INPUT_STYLE =
  "width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;" +
  "font-size:16px;font-family:inherit;box-sizing:border-box;" +
  "background:#ffffff;color:#111827;";
const LABEL_STYLE =
  "display:block;font-size:14px;color:#374151;margin-bottom:4px;font-weight:500;";

/** Inner DOM of the signup form, rebuilt from props on every change. */
export function renderSignupInnerHtml(p: SignupProps): string {
  const l = p.labels;
  const scope = p.id ? `${escapeAttr(p.id)}.` : "";
  const i18n = (key: string) => `data-i18n="signup.${scope}${key}"`;

  // The <label> wraps its control, so tapping the text focuses the field
  // without needing ids (GrapesJS owns element ids).
  const row = (key: SignupLabelKey, control: string): string =>
    `<label class="oxy-signup__row" style="display:block;">` +
    `<span class="oxy-signup__label" ${i18n(key)} ` +
    `style="${LABEL_STYLE}">${escapeHtml(l[key])}</span>${control}</label>`;

  const genderSelect = (name: string, selected: "MALE" | "FEMALE"): string => {
    const opt = (value: string, key: SignupLabelKey) =>
      `<option value="${value}" ${i18n(`${name}.${key}`)}` +
      `${value === selected ? " selected" : ""}>${escapeHtml(l[key])}</option>`;
    return (
      `<select class="oxy-signup__input" name="${name}" required ` +
      `style="${INPUT_STYLE}">` +
      opt("MALE", "optionMale") +
      opt("FEMALE", "optionFemale") +
      `</select>`
    );
  };

  const messages = SIGNUP_MESSAGES.map(
    (m) =>
      `<span data-oxy-signup-msg="${m.code}" ${i18n(m.label)} hidden>` +
      `${escapeHtml(l[m.label])}</span>`,
  ).join("");

  return (
    row(
      "email",
      // The pattern mirrors the server check (a dot in the domain), which
      // type="email" alone does not require.
      `<input class="oxy-signup__input" type="email" name="signup_email" ` +
        `autocomplete="email" required maxlength="200" ` +
        `pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]+" style="${INPUT_STYLE}">`,
    ) +
    row(
      "username",
      // Merchant limit: letters and numbers only, 25 characters max.
      `<input class="oxy-signup__input" type="text" name="signup_username" ` +
        `autocomplete="username" required maxlength="25" ` +
        `pattern="[A-Za-z0-9]+" style="${INPUT_STYLE}">`,
    ) +
    row(
      "password",
      // Merchant limit: 6–200 characters.
      `<input class="oxy-signup__input" type="password" ` +
        `name="signup_password" autocomplete="new-password" required ` +
        `minlength="6" maxlength="200" style="${INPUT_STYLE}">`,
    ) +
    row("gender", genderSelect("signup_gender", "MALE")) +
    row("searchGender", genderSelect("signup_search_gender", "FEMALE")) +
    row(
      "birthdate",
      // The runtime sets `min` / `max` (18 to 120 years old).
      `<input class="oxy-signup__input" type="date" name="signup_birthdate" ` +
        `autocomplete="bday" required style="${INPUT_STYLE}">`,
    ) +
    // No `display` here, ever: it would export as an #id rule and beat the
    // `hidden` attribute the runtime toggles.
    `<div class="oxy-signup__error" role="alert" hidden ` +
    `style="color:#b91c1c;font-size:14px;">${messages}</div>` +
    `<button type="button" class="oxy-signup__submit" ` +
    `${i18n("submit")} style="background-color:${escapeAttr(
      p.buttonColor,
    )};color:${escapeAttr(
      p.buttonTextColor,
    )};width:100%;border:0;border-radius:8px;padding:14px 16px;` +
    `font-size:16px;font-family:inherit;font-weight:600;cursor:pointer;">` +
    `${escapeHtml(p.buttonText)}</button>`
  );
}

/** Root data attributes — the persisted form of the props. */
export function signupDataAttrs(p: SignupProps): Record<string, string> {
  const attrs: Record<string, string> = {
    "data-oxy-signup-id": p.id,
    "data-oxy-signup-merchant": p.merchant,
    "data-oxy-signup-cid": p.cid,
    "data-oxy-signup-source": p.source,
    "data-oxy-signup-subsource": p.subsource,
    "data-oxy-signup-button-text": p.buttonText,
    "data-oxy-signup-button-color": p.buttonColor,
    "data-oxy-signup-button-text-color": p.buttonTextColor,
  };
  for (const key of SIGNUP_LABEL_KEYS) attrs[LABEL_ATTR[key]] = p.labels[key];
  return attrs;
}

/** Inverse of signupDataAttrs; missing / empty display values fall back. */
export function readSignupAttrs(
  get: (name: string) => string | null | undefined,
): SignupProps {
  const d = DEFAULT_SIGNUP_PROPS;
  const display = (name: string, fallback: string): string => {
    const raw = get(name);
    return raw === null || raw === undefined || raw === "" ? fallback : raw;
  };
  const merchant = get("data-oxy-signup-merchant") ?? "";
  const labels = {} as Record<SignupLabelKey, string>;
  for (const key of SIGNUP_LABEL_KEYS) {
    labels[key] = display(LABEL_ATTR[key], d.labels[key]);
  }
  const id = get("data-oxy-signup-id") ?? "";
  return {
    id: /^[a-z0-9]{1,16}$/.test(id) ? id : "",
    merchant: SIGNUP_MERCHANTS.some((m) => m.id === merchant)
      ? merchant
      : d.merchant,
    cid: get("data-oxy-signup-cid") ?? "",
    source: get("data-oxy-signup-source") ?? "",
    subsource: get("data-oxy-signup-subsource") ?? "",
    buttonText: display("data-oxy-signup-button-text", d.buttonText),
    buttonColor: display("data-oxy-signup-button-color", d.buttonColor),
    buttonTextColor: display(
      "data-oxy-signup-button-text-color",
      d.buttonTextColor,
    ),
    labels,
  };
}
