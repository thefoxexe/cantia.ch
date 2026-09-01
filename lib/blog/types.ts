// Small typed content-block model for blog articles — no markdown/MDX parser
// exists anywhere in this repo, so this follows the same convention as
// lib/helpArticles.ts (plain structured data) rather than introducing one.
// Each block renders through a manual switch in components/BlogArticle.tsx.
export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; title: string; text: string }
  | { type: 'stat'; value: string; label: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'cta'; title: string; text: string; buttonLabel: string };

export interface BlogFaqItem {
  question: string;
  answer: string;
}

// One category set, shared by the index filter chips and every post — kept
// as a union (not free text) so a typo can't silently create an orphan
// category that never shows up in the filter row.
export type BlogCategory =
  | 'Devis & facturation'
  | 'Juridique & normes'
  | 'RH & salaires'
  | 'Chantier & rentabilité'
  | 'Comparatifs & outils'
  | 'Métiers du bâtiment'
  | 'Croissance & acquisition'
  | 'Sur-mesure & automatisations';

export interface BlogPost {
  slug: string;
  // The real, specific search query this article answers — shown as the
  // page's kicker/subtitle, and what the ~50-question backlog is built from.
  question: string;
  title: string;
  description: string; // meta description, ~150-160 chars
  excerpt: string; // shown on index cards, can differ from description
  category: BlogCategory;
  keywords: string[];
  publishedAt: string; // ISO date, e.g. "2026-02-03"
  readMinutes: number;
  blocks: BlogBlock[];
  faq?: BlogFaqItem[];
  relatedSlugs?: string[];
  // Slug of a matching /[metier] trade landing page (lib/tradeLandingPages.ts),
  // when this article is specific enough to one trade to warrant a direct
  // link — e.g. 'plombier' for an article about plumber devis/facturation.
  relatedTradeSlug?: string;
}
