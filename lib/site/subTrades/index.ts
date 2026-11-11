import type { SiteLocale } from '../copy';
import type { SectorKey } from '../sectors';
import type { SubTrade } from './types';
import { SERVICES_TRADES } from './services';
import { ETUDES_TRADES } from './etudes';
import { CREATIFS_TRADES } from './creatifs';

export type { SubTrade };

// Trade pages of the non-building sectors, by sector and locale.
const BY_SECTOR: Partial<Record<SectorKey, Record<SiteLocale, SubTrade[]>>> = {
  services: SERVICES_TRADES,
  etudes: ETUDES_TRADES,
  creatifs: CREATIFS_TRADES,
};

export function subTradesOf(sector: SectorKey, locale: SiteLocale): SubTrade[] {
  return BY_SECTOR[sector]?.[locale] ?? [];
}

export function getSubTrade(sector: SectorKey, slug: string, locale: SiteLocale): SubTrade | undefined {
  return subTradesOf(sector, locale).find((t) => t.slug === slug);
}

// All (sector, slug) pairs, for generateStaticParams and the SEO routes.
export function allSubTradeSlugs(sector: SectorKey): string[] {
  return subTradesOf(sector, 'fr').map((t) => t.slug);
}
