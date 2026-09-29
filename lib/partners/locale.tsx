import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'expo-router';
import { PARTNERS_COPY, type PartnersLocale } from './copy';

// Language of partners.cantia.ch: the URL decides on the landing pages (/,
// /de, /it, so each is prerendered in its own language); elsewhere the last
// choice, remembered in localStorage, then the browser language.
const STORAGE_KEY = 'cantia_partners_locale';

function localeFromPath(pathname: string): PartnersLocale | null {
  if (pathname === '/de' || pathname.startsWith('/de/')) return 'de';
  if (pathname === '/it' || pathname.startsWith('/it/')) return 'it';
  if (pathname === '/') return 'fr';
  return null;
}

function storedLocale(): PartnersLocale | null {
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

const LocaleContext = createContext<{ locale: PartnersLocale; setLocale: (l: PartnersLocale) => void }>({
  locale: 'fr',
  setLocale: () => {},
});

export function PartnersLocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fromPath = localeFromPath(pathname);
  const [chosen, setChosen] = useState<PartnersLocale | null>(null);

  useEffect(() => {
    if (!fromPath) setChosen(storedLocale());
  }, [fromPath]);

  const setLocale = useCallback((next: PartnersLocale) => {
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

export function usePartnersCopy() {
  const { locale, setLocale } = useContext(LocaleContext);
  return { locale, setLocale, copy: PARTNERS_COPY[locale] };
}
