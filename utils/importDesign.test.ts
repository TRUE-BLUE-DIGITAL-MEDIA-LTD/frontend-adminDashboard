import { describe, expect, it } from "vitest";
import {
  extractImportedTranslationState,
  ImportDesignError,
  parseDesignJson,
} from "./importDesign";

describe("parseDesignJson", () => {
  it("accepts GrapesJS project data (pages array)", () => {
    const json = JSON.stringify({ pages: [{ frames: [] }], styles: [] });
    expect(parseDesignJson(json)).toEqual({
      pages: [{ frames: [] }],
      styles: [],
    });
  });

  it("accepts legacy Unlayer designs (body.rows array)", () => {
    const json = JSON.stringify({ body: { rows: [] }, counters: {} });
    expect(parseDesignJson(json)).toEqual({ body: { rows: [] }, counters: {} });
  });

  it("throws ImportDesignError for null/undefined/empty json", () => {
    expect(() => parseDesignJson(null)).toThrow(ImportDesignError);
    expect(() => parseDesignJson(undefined)).toThrow(ImportDesignError);
    expect(() => parseDesignJson("")).toThrow(ImportDesignError);
  });

  it("throws ImportDesignError for invalid JSON", () => {
    expect(() => parseDesignJson("{not json")).toThrow(ImportDesignError);
  });

  it("throws ImportDesignError for JSON without a recognizable design shape", () => {
    expect(() => parseDesignJson("{}")).toThrow(ImportDesignError);
    expect(() => parseDesignJson('"just a string"')).toThrow(ImportDesignError);
    expect(() => parseDesignJson('{"body": {}}')).toThrow(ImportDesignError);
    expect(() => parseDesignJson('{"pages": "nope"}')).toThrow(
      ImportDesignError,
    );
  });
});

describe("extractImportedTranslationState", () => {
  it("takes strings from the source but never its SEO title/description", () => {
    const result = extractImportedTranslationState(
      {
        language: "en",
        primaryLanguage: "de",
        supportedLanguages: ["de", "fr"],
        translations: {
          de: { strings: { k: "v" }, title: "src-t", description: "src-d" },
        },
      },
      {},
    );
    expect(result).toEqual({
      primaryLanguage: "de",
      supportedLanguages: ["de", "fr"],
      translations: {
        de: { strings: { k: "v" }, title: "", description: "" },
        fr: { strings: {}, title: "", description: "" },
      },
    });
  });

  it("preserves the current page's SEO title/description per language", () => {
    const result = extractImportedTranslationState(
      {
        language: "en",
        primaryLanguage: "en",
        supportedLanguages: ["en", "de"],
        translations: {
          en: { strings: { hi: "Hello" }, title: "src-t", description: "src-d" },
          de: { strings: { hi: "Hallo" }, title: "src-t-de", description: "" },
        },
      },
      {
        en: { strings: { old: "gone" }, title: "My title", description: "My desc" },
        de: { strings: {}, title: "Mein Titel", description: "" },
      },
    );
    expect(result.translations).toEqual({
      en: { strings: { hi: "Hello" }, title: "My title", description: "My desc" },
      de: { strings: { hi: "Hallo" }, title: "Mein Titel", description: "" },
    });
  });

  it("falls back to legacy language fields and keeps current SEO when source has no translations", () => {
    const result = extractImportedTranslationState(
      {
        language: "th",
        primaryLanguage: undefined,
        supportedLanguages: undefined,
        translations: undefined,
      },
      { th: { strings: { old: "gone" }, title: "Thai title", description: "Thai desc" } },
    );
    expect(result).toEqual({
      primaryLanguage: "th",
      supportedLanguages: ["th"],
      translations: {
        th: { strings: {}, title: "Thai title", description: "Thai desc" },
      },
    });
  });

  it("adds the primary language to supportedLanguages when missing", () => {
    const result = extractImportedTranslationState(
      {
        language: "en",
        primaryLanguage: "en",
        supportedLanguages: ["fr"],
        translations: {},
      },
      {},
    );
    expect(result.supportedLanguages).toContain("en");
    expect(result.supportedLanguages).toContain("fr");
  });

  it("treats an empty supportedLanguages array as absent", () => {
    const result = extractImportedTranslationState(
      {
        language: "es",
        primaryLanguage: undefined,
        supportedLanguages: [],
        translations: undefined,
      },
      {},
    );
    expect(result.supportedLanguages).toEqual(["es"]);
  });
});
