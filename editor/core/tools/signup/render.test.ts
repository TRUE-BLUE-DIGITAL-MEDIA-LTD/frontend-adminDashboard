import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIGNUP_PROPS,
  SIGNUP_MESSAGES,
  readSignupAttrs,
  renderSignupInnerHtml,
  signupDataAttrs,
  type SignupProps,
} from "./render";

describe("renderSignupInnerHtml", () => {
  const html = renderSignupInnerHtml(DEFAULT_SIGNUP_PROPS);

  it("renders every field the Profile API requires", () => {
    for (const name of [
      "signup_email",
      "signup_username",
      "signup_password",
      "signup_gender",
      "signup_search_gender",
      "signup_birthdate",
    ]) {
      expect(html).toContain(`name="${name}"`);
    }
  });

  it("encodes the merchant's username and password limits", () => {
    expect(html).toContain('maxlength="25"');
    expect(html).toContain('pattern="[A-Za-z0-9]+"');
    expect(html).toContain('minlength="6"');
  });

  it("stays clear of the lander's legacy submit/form hooks", () => {
    expect(html).not.toContain('type="submit"');
    expect(html).not.toContain('name="email"');
    const buttonClass = /<button[^>]*class="([^"]*)"/.exec(html)?.[1] ?? "";
    expect(buttonClass).toBe("oxy-signup__submit");
    expect(buttonClass).not.toContain("form");
  });

  it("ships one hidden message per error code", () => {
    for (const m of SIGNUP_MESSAGES) {
      expect(html).toContain(`data-oxy-signup-msg="${m.code}"`);
    }
  });

  it("scopes every translation key to the block id", () => {
    const out = renderSignupInnerHtml({ ...DEFAULT_SIGNUP_PROPS, id: "ab12" });
    const keys = Array.from(out.matchAll(/data-i18n="([^"]+)"/g)).map(
      (m) => m[1],
    );
    expect(keys.length).toBeGreaterThan(10);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((k) => k.startsWith("signup.ab12."))).toBe(true);
  });

  it("never puts a display style on the error box", () => {
    const box = /<div class="oxy-signup__error"[^>]*>/.exec(html)?.[0] ?? "";
    expect(box).toContain("hidden");
    expect(box).not.toContain("display");
  });

  it("escapes author-provided text", () => {
    const out = renderSignupInnerHtml({
      ...DEFAULT_SIGNUP_PROPS,
      buttonText: "<b>Go</b>",
      buttonColor: '"><script>',
      labels: { ...DEFAULT_SIGNUP_PROPS.labels, email: "<i>Mail</i>" },
    });
    expect(out).not.toContain("<b>Go</b>");
    expect(out).not.toContain("<i>Mail</i>");
    expect(out).not.toContain('"><script>');
  });
});

describe("signupDataAttrs / readSignupAttrs", () => {
  it("round-trips the props through the root attributes", () => {
    const props: SignupProps = {
      id: "ab12",
      merchant: "meetmyhookup",
      cid: "abc",
      source: "1",
      subsource: "2",
      buttonText: "Join",
      buttonColor: "#000000",
      buttonTextColor: "#ffffff",
      labels: {
        email: "E-Mail",
        username: "Benutzername",
        password: "Passwort",
        gender: "Ich bin",
        searchGender: "Ich suche",
        birthdate: "Geburtsdatum",
        optionMale: "Mann",
        optionFemale: "Frau",
        msgEmailExists: "E-Mail vergeben",
        msgUsernameExists: "Name vergeben",
        msgGeneric: "Fehler",
      },
    };
    const attrs = signupDataAttrs(props);
    expect(readSignupAttrs((name) => attrs[name] ?? null)).toEqual(props);
  });

  it("falls back to defaults for missing attributes and unknown merchants", () => {
    expect(readSignupAttrs(() => null)).toEqual(DEFAULT_SIGNUP_PROPS);
    expect(
      readSignupAttrs((name) =>
        name === "data-oxy-signup-merchant" ? "nope" : null,
      ).merchant,
    ).toBe(DEFAULT_SIGNUP_PROPS.merchant);
  });
});
