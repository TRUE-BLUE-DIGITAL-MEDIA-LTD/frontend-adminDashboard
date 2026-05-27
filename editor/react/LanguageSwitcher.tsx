import { useMemo } from "react";
import type { Language } from "../types";

export interface LanguageSwitcherProps {
  primary: Language;
  supported: Language[];
  current: Language;
  onChange(lang: Language): void;
  onAddLanguage(): void;
}

const LANGUAGE_NAMES: Record<Language, string> = {
  th: "Thai",
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  hr: "Croatian",
  "de-ch": "Swiss German",
  "fr-ch": "Swiss French",
  "it-ch": "Swiss Italian",
  nl: "Dutch",
  fi: "Finnish",
  no: "Norwegian",
  sv: "Swedish",
  ro: "Romanian",
  hu: "Hungarian",
  pl: "Polish",
  cs: "Czech",
};

export function LanguageSwitcher({
  primary,
  supported,
  current,
  onChange,
  onAddLanguage,
}: LanguageSwitcherProps) {
  const items = useMemo(
    () =>
      supported.map((lang) => ({
        lang,
        label: LANGUAGE_NAMES[lang] + (lang === primary ? " (primary)" : ""),
      })),
    [supported, primary],
  );

  return (
    <div
      className="oxy-language-switcher text-black"
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span style={{ fontSize: 12, opacity: 0.7 }}>Lang:</span>
      <select
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__add__") {
            onAddLanguage();
          } else {
            onChange(v as Language);
          }
        }}
        style={{ padding: "2px 6px", fontSize: 13 }}
        aria-label="Edit language"
      >
        {items.map((it) => (
          <option key={it.lang} value={it.lang}>
            {it.label}
          </option>
        ))}
        <option value="__add__">+ Add language…</option>
      </select>
    </div>
  );
}
