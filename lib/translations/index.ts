import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fr } from './fr';
import { de } from './de';

export type AppLocale = 'fr' | 'de';
export const AVAILABLE_LOCALES: AppLocale[] = ['fr', 'de'];
export const DEFAULT_LOCALE: AppLocale = 'fr';

const LOCALE_CACHE_KEY = 'cantia:locale';

i18next.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    de: { translation: de },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  // Missing keys render as the key itself (i18next's own default) rather
  // than blank — makes an unconverted string impossible to miss during
  // development instead of silently showing nothing.
  returnEmptyString: false,
});

// Read once at boot, before the Supabase session/org round-trip resolves,
// so the app renders in the right language immediately on a repeat visit
// instead of flashing French first. lib/auth-context.tsx reconciles this
// against organization_members.locale (the source of truth) once the org
// loads, and updates both if they disagree.
export async function restoreCachedLocale(): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(LOCALE_CACHE_KEY);
    if (cached && AVAILABLE_LOCALES.includes(cached as AppLocale)) {
      await i18next.changeLanguage(cached);
    }
  } catch {
    // AsyncStorage unavailable (e.g. private browsing) — default language
    // stands, nothing to recover from here.
  }
}

export async function setAppLocale(locale: AppLocale): Promise<void> {
  await i18next.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(LOCALE_CACHE_KEY, locale);
  } catch {
    // Best-effort cache — the DB value (organization_members.locale) is
    // still the source of truth for the next real login.
  }
}

export function getAppLocale(): AppLocale {
  const current = i18next.language;
  return AVAILABLE_LOCALES.includes(current as AppLocale) ? (current as AppLocale) : DEFAULT_LOCALE;
}

export { i18next };
export { useTranslation } from 'react-i18next';
