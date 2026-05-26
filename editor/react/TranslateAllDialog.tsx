import { useState } from 'react';
import type { Language } from '../types';

export interface TranslateAllDialogProps {
  open: boolean;
  primary: Language;
  supported: Language[];
  onClose(): void;
  /** Returns once the stream completes. Calls onEvent for every event. */
  onTranslate(input: {
    sourceLanguage: Language;
    targetLanguages: Language[];
    scope: 'overwrite' | 'missing';
  }): Promise<void>;
  /** Live progress feed dispatched by the parent. */
  progress: Partial<Record<Language, { processed: number; total: number; failed?: string }>>;
}

const LANGUAGE_NAMES: Record<Language, string> = {
  th: 'Thai', en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  it: 'Italian', pt: 'Portuguese', hr: 'Croatian', 'de-ch': 'Swiss German',
  'fr-ch': 'Swiss French', 'it-ch': 'Swiss Italian', nl: 'Dutch',
  fi: 'Finnish', no: 'Norwegian', sv: 'Swedish', ro: 'Romanian',
  hu: 'Hungarian', pl: 'Polish', cs: 'Czech',
};

export function TranslateAllDialog({
  open,
  primary,
  supported,
  onClose,
  onTranslate,
  progress,
}: TranslateAllDialogProps) {
  const [targets, setTargets] = useState<Language[]>(
    supported.filter((l) => l !== primary),
  );
  const [scope, setScope] = useState<'overwrite' | 'missing'>('missing');
  const [running, setRunning] = useState(false);

  if (!open) return null;

  function toggle(lang: Language) {
    setTargets((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  }

  async function start() {
    setRunning(true);
    try {
      await onTranslate({ sourceLanguage: primary, targetLanguages: targets, scope });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Translate landing page"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 480, maxHeight: '80vh', overflow: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>Translate landing page</h3>
        <p style={{ fontSize: 13 }}>From <strong>{LANGUAGE_NAMES[primary]}</strong> (primary).</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
          {supported.filter((l) => l !== primary).map((lang) => (
            <label key={lang} style={{ fontSize: 13 }}>
              <input
                type="checkbox"
                checked={targets.includes(lang)}
                onChange={() => toggle(lang)}
                disabled={running}
              />{' '}
              {LANGUAGE_NAMES[lang]}
              {progress[lang] && (
                <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 11 }}>
                  {progress[lang]?.failed
                    ? `⚠ ${progress[lang]?.failed}`
                    : `${progress[lang]?.processed}/${progress[lang]?.total || '?'}`}
                </span>
              )}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13 }}>
          <label>
            <input type="radio" checked={scope === 'overwrite'} onChange={() => setScope('overwrite')} disabled={running} />{' '}
            Overwrite all
          </label>
          <label>
            <input type="radio" checked={scope === 'missing'} onChange={() => setScope('missing')} disabled={running} />{' '}
            Only missing translations
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} disabled={running}>Cancel</button>
          <button type="button" onClick={start} disabled={running || targets.length === 0}>
            {running ? 'Translating…' : 'Translate'}
          </button>
        </div>
      </div>
    </div>
  );
}
