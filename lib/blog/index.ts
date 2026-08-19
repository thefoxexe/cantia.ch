import { BlogPost } from './types';
import { post as p1 } from './posts/calculer-prix-devis-renovation-suisse';
import { post as p2 } from './posts/norme-sia-118-devis-obligatoire';
import { post as p3 } from './posts/qr-facture-obligatoire-2026';
import { post as p4 } from './posts/delai-paiement-facture-artisan-code-obligations';
import { post as p5 } from './posts/avs-ai-independant-batiment';
import { post as p6 } from './posts/lpp-deuxieme-pilier-independant-batiment';
import { post as p7 } from './posts/bexio-vs-cantia-logiciel-batiment';
import { post as p8 } from './posts/suivre-rentabilite-chantier-sans-excel';
import { post as p9 } from './posts/calculer-heures-travail-ouvrier-minutes-decimales';
import { post as p10 } from './posts/sous-traitant-batiment-suisse-contrat-facturation';
import { post as p11 } from './posts/duree-conservation-devis-factures-suisse';
import { post as p12 } from './posts/rediger-devis-qui-inspire-confiance-client';

// Every published article, newest first. To add a new one: write a new file
// under lib/blog/posts/<slug>.ts exporting `post: BlogPost`, then add one
// import + one entry here — nothing else needs to change (index page, SEO
// meta and the static export route list all derive from this array). See
// scripts/seo-routes.mjs for the one place metadata still needs a matching
// entry, following the same pattern as /solutions/*.
export const BLOG_POSTS: BlogPost[] = [p12, p11, p10, p9, p8, p7, p6, p5, p4, p3, p2, p1].sort(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt)
);

export const BLOG_CATEGORIES = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: BlogPost, max = 3): BlogPost[] {
  const bySlug = post.relatedSlugs?.map((s) => getPostBySlug(s)).filter((p): p is BlogPost => !!p) ?? [];
  if (bySlug.length >= max) return bySlug.slice(0, max);
  const fallback = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category && !bySlug.includes(p));
  return [...bySlug, ...fallback].slice(0, max);
}
