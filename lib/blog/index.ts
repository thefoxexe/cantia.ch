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
import { post as p13 } from './posts/facturer-acompte-suisse-securiser-solde';
import { post as p14 } from './posts/relancer-client-facture-impayee-sans-perdre-client';
import { post as p15 } from './posts/validite-devis-signe-prix-qui-bouge';
import { post as p16 } from './posts/garantie-travaux-construction-2-ou-5-ans';
import { post as p17 } from './posts/defaut-construction-decouvert-apres-reception-qui-paie';
import { post as p18 } from './posts/assurance-rc-professionnelle-batiment-obligatoire';
import { post as p19 } from './posts/permis-construire-renovation-quand-necessaire';
import { post as p20 } from './posts/contrat-entreprise-vs-mandat-artisan';
import { post as p21 } from './posts/salaire-minimum-cct-construction-suisse';
import { post as p22 } from './posts/heures-supplementaires-batiment-majoration-25';
import { post as p23 } from './posts/indemnites-kilometriques-2026-nouveau-taux';
import { post as p24 } from './posts/calculer-13e-salaire-prorata-employe';
import { post as p25 } from './posts/chantier-complet-peut-etre-en-perte-taux-horaire';
import { post as p26 } from './posts/gerer-plusieurs-chantiers-en-parallele-methode';
import { post as p27 } from './posts/whatsapp-gestion-equipe-chantier-limites';

// Every published article, newest first. To add a new one: write a new file
// under lib/blog/posts/<slug>.ts exporting `post: BlogPost`, then add one
// import + one entry here — nothing else needs to change (index page, SEO
// meta and the static export route list all derive from this array). See
// scripts/seo-routes.mjs for the one place metadata still needs a matching
// entry, following the same pattern as /solutions/*.
export const BLOG_POSTS: BlogPost[] = [
  p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27,
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

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
