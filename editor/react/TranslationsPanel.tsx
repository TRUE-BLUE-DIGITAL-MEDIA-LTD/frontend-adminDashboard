import type { Language, Translations } from '../types';

export interface TranslationsPanelProps {
  i18nKey: string | null;            // null when selection has no data-i18n
  primary: Language;
  supported: Language[];
  translations: Translations;
  onChange(lang: Language, key: string, value: string): void;
  onTranslateOne(lang: Language, key: string): void;
}

const LANGUAGE_NAMES: Record<Language, string> = {
  th: 'Thai', en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  it: 'Italian', pt: 'Portuguese', hr: 'Croatian', 'de-ch': 'Swiss German',
  'fr-ch': 'Swiss French', 'it-ch': 'Swiss Italian', nl: 'Dutch',
  fi: 'Finnish', no: 'Norwegian', sv: 'Swedish', ro: 'Romanian',
  hu: 'Hungarian', pl: 'Polish', cs: 'Czech',
};

export function TranslationsPanel({
  i18nKey,
  primary,
  supported,
  translations,
  onChange,
  onTranslateOne,
}: TranslationsPanelProps) {
  if (!i18nKey) {
    return (
      <div style={{ padding: 12, fontSize: 12, opacity: 0.7 }}>
        Select a text element to edit its translations.
      </div>
    );
  }

  return (
    <div className="oxy-translations-panel" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>Translations</div>
      {supported.map((lang) => {
        const value = translations[lang]?.strings?.[i18nKey] ?? '';
        const missing = !value;
        return (
          <div key={lang} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <label style={{ width: 90, fontSize: 12 }}>
              {LANGUAGE_NAMES[lang]}
              {lang === primary ? ' (primary)' : ''}
            </label>
            <input
              type="text"
              value={value}
              placeholder={missing ? '(missing)' : ''}
              onChange={(e) => onChange(lang, i18nKey, e.target.value)}
              style={{ flex: 1, padding: '2px 6px', fontSize: 13, border: missing ? '1px solid #f59e0b' : '1px solid #d1d5db' }}
            />
            {missing && lang !== primary && (
              <button
                type="button"
                onClick={() => onTranslateOne(lang, i18nKey)}
                style={{ fontSize: 11, padding: '2px 6px' }}
              >
                Translate
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
