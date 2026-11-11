import type { Feather } from '@expo/vector-icons';
import type { SectorKey } from '../sectors';

type IconName = keyof typeof Feather.glyphMap;

// One trade page inside a non-building sector (/metiers/<sector>/<slug>),
// rendered by SubTradePage in components/site/SectorPages.tsx. Only what
// Cantia really does for that trade: no figures, no invented customers.
export interface SubTrade {
  slug: string;
  sector: SectorKey;
  name: string; // breadcrumb and link label
  seoTitle: string; // ≤ 60 characters, no brand suffix
  seoDescription: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  pains: { title: string; text: string; answer: string }[];
  uses: { icon: IconName; title: string; text: string; module?: string }[];
  scenarioTitle: string;
  scenario: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  closingTitle: string;
}
