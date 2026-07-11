import { LandingPage, Language, Translations } from "../models";

/** Thrown when a landing page's saved json cannot be loaded into the editor. */
export class ImportDesignError extends Error {}

/**
 * Parse a landing page's stored `json` column and validate it is one of the
 * two shapes EditorInstance.loadDesign auto-detects: GrapesJS project data
 * (`pages` array) or a legacy Unlayer design (`body.rows` array).
 */
export function parseDesignJson(json: string | null | undefined): unknown {
  if (!json) {
    throw new ImportDesignError("This page has no importable design");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new ImportDesignError("This page's design data is not valid JSON");
  }
  const obj =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  const isGrapes = obj !== null && Array.isArray(obj.pages);
  const body =
    obj !== null && typeof obj.body === "object" && obj.body !== null
      ? (obj.body as Record<string, unknown>)
      : null;
  const isUnlayer = body !== null && Array.isArray(body.rows);
  if (!isGrapes && !isUnlayer) {
    throw new ImportDesignError("This page has no importable design");
  }
  return parsed;
}

export interface ImportedTranslationState {
  primaryLanguage: Language;
  supportedLanguages: Language[];
  translations: Translations;
}

/**
 * Pull the translation bundle off a source landing page, with the same
 * legacy fallbacks the edit page applies when loading its own record.
 *
 * Only the design-facing `strings` come from the source — per-language SEO
 * title/description are preserved from the current page's translations
 * (blank for languages the current page didn't have).
 */
export function extractImportedTranslationState(
  source: Pick<
    LandingPage,
    "language" | "primaryLanguage" | "supportedLanguages" | "translations"
  >,
  currentTranslations: Translations,
): ImportedTranslationState {
  const primaryLanguage = source.primaryLanguage ?? source.language;
  const supportedLanguages =
    source.supportedLanguages && source.supportedLanguages.length > 0
      ? Array.from(new Set([...source.supportedLanguages, primaryLanguage]))
      : [primaryLanguage];
  const sourceTranslations = source.translations ?? {};
  const translations: Translations = {};
  const languages = new Set<Language>([
    ...supportedLanguages,
    ...(Object.keys(sourceTranslations) as Language[]),
  ]);
  for (const lang of languages) {
    translations[lang] = {
      strings: sourceTranslations[lang]?.strings ?? {},
      title: currentTranslations[lang]?.title ?? "",
      description: currentTranslations[lang]?.description ?? "",
    };
  }
  return {
    primaryLanguage,
    supportedLanguages,
    translations,
  };
}
