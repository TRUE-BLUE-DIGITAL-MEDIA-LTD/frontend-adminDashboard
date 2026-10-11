import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { ensureSelectValue, toDisplayValue, toHex } from "./style-display-sync";

describe("toHex", () => {
  it("converts opaque rgb to hex", () => {
    expect(toHex("rgb(37, 99, 235)")).toBe("#2563eb");
    expect(toHex("rgba(255, 255, 255, 1)")).toBe("#ffffff");
  });

  it("keeps translucent colors and non-rgb values as written", () => {
    expect(toHex("rgba(0, 0, 0, 0)")).toBe("rgba(0, 0, 0, 0)");
    expect(toHex("#ff9900")).toBe("#ff9900");
  });
});

describe("toDisplayValue", () => {
  it("maps logical text-align values onto the panel's options", () => {
    expect(toDisplayValue("text-align", "start")).toBe("left");
    expect(toDisplayValue("text-align", "end")).toBe("right");
    expect(toDisplayValue("text-align", "-webkit-center")).toBe("center");
  });
});

describe("ensureSelectValue", () => {
  const select = () => {
    const doc = new JSDOM("<select><option value='400'>400</option><option value='700'>700</option></select>").window.document;
    return doc.querySelector("select")!;
  };

  it("selects an existing option", () => {
    const s = select();
    ensureSelectValue(s, "700");
    expect(s.value).toBe("700");
  });

  it("adds a missing value (e.g. font-weight: bold) instead of showing blank", () => {
    const s = select();
    ensureSelectValue(s, "bold");
    expect(s.value).toBe("bold");
    expect(s.options).toHaveLength(3);
  });
});
