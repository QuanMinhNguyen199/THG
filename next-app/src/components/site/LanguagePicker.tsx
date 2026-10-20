"use client";

// Globe button in the top bar that opens a short list of site languages. Only Vietnamese exists
// today; other languages are listed as coming, without a link, until their pages are published.
import { useEffect, useRef, useState } from "react";

type Language = { code: string; name: string; href?: string; current?: boolean };

// TODO(unconfirmed): no English edition exists yet; give it an href once its pages are published.
const LANGUAGES: Language[] = [
  { code: "vi", name: "Tiếng Việt", current: true },
  { code: "en", name: "English" },
];

export function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = LANGUAGES.find((l) => l.current)!;

  // Close on a tap or click elsewhere, and on Escape (returning focus to the button).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="language lang" ref={root}>
      <button
        ref={button}
        type="button"
        className="lang-button"
        aria-expanded={open}
        aria-controls="lang-list"
        aria-label={`Ngôn ngữ: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <svg className="lang-globe" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" />
        </svg>
        <span className="lang-code">{current.code.toUpperCase()}</span>
        <svg className="lang-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul id="lang-list" className="lang-list">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              {l.current ? (
                <span className="lang-item is-current" aria-current="true" lang={l.code}>
                  {l.name}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                </span>
              ) : l.href ? (
                <a className="lang-item" href={l.href} hrefLang={l.code} lang={l.code}>
                  {l.name}
                </a>
              ) : (
                <span className="lang-item is-soon" aria-disabled="true" lang={l.code}>
                  {l.name}
                  <small>Sắp có</small>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
