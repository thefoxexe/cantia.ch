import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'expo-router';
import { ACC_COPY, type AccLocale } from './copy';

// Language of accounting.cantia.ch: the URL decides on the landing pages (/,
// /de, /it, so each is prerendered in its own language); elsewhere the last
// choice, remembered in localStorage, then the browser language.
const STORAGE_KEY = 'cantia_accounting_locale';

function localeFromPath(pathname: string): AccLocale | null {
  if (pathname === '/de' || pathname.startsWith('/de/')) return 'de';
  if (pathname === '/it' || pathname.startsWith('/it/')) return 'it';
  if (pathname === '/') return 'fr';
  return null;
}

function storedLocale(): AccLocale | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === 'fr' || value === 'de' || value === 'it') return value;
  } catch {
    // Storage blocked: fall through to the browser language.
  }
  const lang = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2).toLowerCase() : null;
  return lang === 'de' || lang === 'it' ? lang : null;
}

const LocaleContext = createContext<{ locale: AccLocale; setLocale: (l: AccLocale) => void }>({
  locale: 'fr',
  setLocale: () => {},
});

export function AccountingLocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fromPath = localeFromPath(pathname);
  const [chosen, setChosen] = useState<AccLocale | null>(null);

  useEffect(() => {
    if (!fromPath) setChosen(storedLocale());
  }, [fromPath]);

  const setLocale = useCallback((next: AccLocale) => {
    setChosen(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered, still applied for this page.
    }
  }, []);

  const locale = fromPath ?? chosen ?? 'fr';
  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useAccCopy() {
  const { locale, setLocale } = useContext(LocaleContext);
  return { locale, setLocale, copy: ACC_COPY[locale] };
}
