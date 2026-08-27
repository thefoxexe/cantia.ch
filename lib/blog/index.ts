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
import { post as p28 } from './posts/devis-oral-valeur-legale-suisse';
import { post as p29 } from './posts/signature-electronique-devis-suisse-valeur-legale';
import { post as p30 } from './posts/client-refuse-payer-solde-final-que-faire';
import { post as p31 } from './posts/avenant-chantier-plus-value-moins-value';
import { post as p32 } from './posts/travail-au-noir-batiment-suisse-risques-controles';
import { post as p33 } from './posts/assurance-perte-de-gain-maladie-independant-batiment';
import { post as p34 } from './posts/photos-chantier-preuve-juridique-litige';
import { post as p35 } from './posts/difference-devis-offre-facture-pro-forma';
import { post as p36 } from './posts/logiciel-gestion-chantier-independant-seul';
import { post as p37 } from './posts/contrat-ecrit-petits-travaux-quand-necessaire';
import { post as p38 } from './posts/appel-offres-marches-publics-batiment-suisse';
import { post as p39 } from './posts/estimer-chantier-a-distance-devis-photo';
import { post as p40 } from './posts/integration-bexio-cantia-synchronisation-automatique';
import { post as p41 } from './posts/resiliation-contrat-entreprise-chantier-en-cours';
import { post as p42 } from './posts/hypotheque-legale-artisans-entrepreneurs-suisse';
import { post as p43 } from './posts/reception-travaux-proces-verbal-chantier';
import { post as p44 } from './posts/poursuite-facture-impayee-procedure-suisse';
import { post as p45 } from './posts/mentions-obligatoires-facture-suisse-tva';
import { post as p46 } from './posts/devis-gratuit-ou-payant-que-dit-la-loi';
import { post as p47 } from './posts/licenciement-ouvrier-batiment-delai-conge-cct';
import { post as p48 } from './posts/accident-travail-chantier-obligations-employeur-suva';
import { post as p49 } from './posts/apprenti-batiment-salaire-obligations-employeur';
import { post as p50 } from './posts/vacances-non-prises-fin-annee-batiment-cct';
import { post as p51 } from './posts/calculer-prix-horaire-reel-ouvrier-batiment';
import { post as p52 } from './posts/pourquoi-entreprises-batiment-font-faillite-suisse';
import { post as p53 } from './posts/retard-chantier-meteo-obligations-contractuelles';
import { post as p54 } from './posts/excel-vs-logiciel-gestion-chantier-limites';
import { post as p55 } from './posts/combien-coute-logiciel-gestion-chantier-roi';
import { post as p56 } from './posts/assurance-chantier-tous-risques-ectr-obligatoire';
import { post as p57 } from './posts/planning-chantier-eviter-conflits-ressources';
import { post as p58 } from './posts/application-hors-ligne-chantier-pourquoi-important';
import { post as p59 } from './posts/facturation-heures-regie-batiment-comment-faire';
import { post as p60 } from './posts/sous-effectif-chantier-recruter-ou-sous-traiter';

// Every published article, newest first. To add a new one: write a new file
// under lib/blog/posts/<slug>.ts exporting `post: BlogPost`, then add one
// import + one entry here — nothing else needs to change (index page, SEO
// meta and the static export route list all derive from this array). See
// scripts/seo-routes.mjs for the one place metadata still needs a matching
// entry, following the same pattern as /solutions/*.
export const BLOG_POSTS: BlogPost[] = [
  p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27,
  p28, p29, p30, p31, p32, p33, p34, p35, p36, p37, p38, p39, p40, p41, p42, p43, p44, p45, p46, p47, p48, p49, p50, p51, p52,
  p53, p54, p55, p56, p57, p58, p59, p60,
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
