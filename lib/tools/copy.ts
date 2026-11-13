import COPY from './copy.json';
import { getAppLocale } from '../translations';

// Texts of the free tools in the visitor's language (lib/tools/copy.json:
// French, German, Italian). The same file feeds scripts/seo-routes.mjs.
export type ToolLocale = 'fr' | 'de' | 'it';
export type ToolSlug = 'calcul-tva' | 'calcul-taux-horaire' | 'calcul-marge' | 'interets-de-retard' | 'indemnite-vacances';

export function toolLocale(): ToolLocale {
  const l = getAppLocale();
  return l === 'de' || l === 'it' ? l : 'fr';
}

export function toolPrefix(locale: ToolLocale = toolLocale()): string {
  return locale === 'fr' ? '' : `/${locale}`;
}

export function toolsChrome(locale: ToolLocale = toolLocale()) {
  return COPY.chrome[locale];
}

export function toolsHub(locale: ToolLocale = toolLocale()) {
  return COPY.hub[locale];
}

// Every string of one tool's page: labels, meta, FAQ. `fill` replaces the
// {placeholders} of a string.
export function toolCopy<S extends ToolSlug>(slug: S, locale: ToolLocale = toolLocale()) {
  return (COPY[slug] as Record<ToolLocale, (typeof COPY)[S]['fr']>)[locale];
}

export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function toolNames(locale: ToolLocale = toolLocale()): Record<string, [string, string]> {
  return COPY.registry[locale] as unknown as Record<string, [string, string]>;
}
