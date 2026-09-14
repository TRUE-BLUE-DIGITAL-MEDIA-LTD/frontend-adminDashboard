// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeEmailHtml } from "./sanitizeEmailHtml";

describe("sanitizeEmailHtml", () => {
  it("strips script tags", () => {
    const out = sanitizeEmailHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).toContain("<p>hi</p>");
    expect(out).not.toContain("script");
  });

  it("strips inline event handlers", () => {
    const out = sanitizeEmailHtml('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain("onerror");
  });

  it("strips javascript: urls", () => {
    const out = sanitizeEmailHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });

  it("forces links to open in a new window", () => {
    const out = sanitizeEmailHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('href="https://example.com"');
  });

  it("overrides an explicit target=_self", () => {
    const out = sanitizeEmailHtml(
      '<a href="https://example.com" target="_self">x</a>',
    );
    expect(out).toContain('target="_blank"');
    expect(out).not.toContain('target="_self"');
  });

  it("keeps normal formatting markup", () => {
    const out = sanitizeEmailHtml(
      '<table><tr><td><b>OTP</b> is <span style="color:red">123456</span></td></tr></table>',
    );
    expect(out).toContain("<b>OTP</b>");
    expect(out).toContain("123456");
  });
});
