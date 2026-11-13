import { BlogPost } from './types';
import { BLOG_POSTS_DE } from './index-de';
import { BLOG_POSTS_IT } from './index-it';
import { isListed, isRetired, publicSlug, resolvedBlogRoute, type BlogLocale } from './triage';
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
import { post as p18 } from './posts/assurance-rc-professionnelle-batiment-obligatoire';
import { post as p19 } from './posts/permis-construire-renovation-quand-necessaire';
import { post as p20 } from './posts/contrat-entreprise-vs-mandat-artisan';
import { post as p21 } from './posts/salaire-minimum-cct-construction-suisse';
import { post as p22 } from './posts/heures-supplementaires-batiment-majoration-25';
import { post as p23 } from './posts/indemnites-kilometriques-2026-nouveau-taux';
import { post as p24 } from './posts/calculer-13e-salaire-prorata-employe';
import { post as p26 } from './posts/gerer-plusieurs-chantiers-en-parallele-methode';
import { post as p27 } from './posts/whatsapp-gestion-equipe-chantier-limites';
import { post as p28 } from './posts/devis-oral-valeur-legale-suisse';
import { post as p29 } from './posts/signature-electronique-devis-suisse-valeur-legale';
import { post as p30 } from './posts/client-refuse-payer-solde-final-que-faire';
import { post as p31 } from './posts/avenant-chantier-plus-value-moins-value';
import { post as p32 } from './posts/travail-au-noir-batiment-suisse-risques-controles';
import { post as p34 } from './posts/photos-chantier-preuve-juridique-litige';
import { post as p35 } from './posts/difference-devis-offre-facture-pro-forma';
import { post as p36 } from './posts/logiciel-gestion-chantier-independant-seul';
import { post as p38 } from './posts/appel-offres-marches-publics-batiment-suisse';
import { post as p39 } from './posts/estimer-chantier-a-distance-devis-photo';
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
import { post as p57 } from './posts/planning-chantier-eviter-conflits-ressources';
import { post as p59 } from './posts/facturation-heures-regie-batiment-comment-faire';
import { post as p61 } from './posts/meilleur-logiciel-devis-facture-batiment-suisse-2026';
import { post as p63 } from './posts/crm-artisan-batiment-pourquoi-utile';
import { post as p64 } from './posts/duree-validite-devis-non-signe-combien-temps';
import { post as p65 } from './posts/note-de-credit-facture-rectificative-suisse';
import { post as p66 } from './posts/prescription-facture-impayee-delai-10-ans';
import { post as p68 } from './posts/difference-sia-108-sia-118-devis-contrat';
import { post as p69 } from './posts/degats-voisinage-chantier-qui-est-responsable';
import { post as p70 } from './posts/retenue-de-garantie-chantier-consignation';
import { post as p71 } from './posts/litige-chantier-mediation-ou-tribunal';
import { post as p72 } from './posts/certificat-de-travail-obligation-employeur-batiment';
import { post as p73 } from './posts/demission-employe-batiment-preavis-a-respecter';
import { post as p74 } from './posts/travailleur-temporaire-interimaire-batiment-regles';
import { post as p75 } from './posts/calculer-prix-de-revient-chantier-batiment';
import { post as p76 } from './posts/previsionnel-tresorerie-entreprise-batiment';
import { post as p77 } from './posts/checklist-ouverture-chantier-artisan';
import { post as p78 } from './posts/checklist-cloture-chantier-avant-facturation';
import { post as p91 } from './posts/trouver-clients-artisan-batiment-suisse';
import { post as p93 } from './posts/site-internet-artisan-batiment-utile';
import { post as p94 } from './posts/vitesse-reponse-devis-taux-conversion-batiment';
import { post as p96 } from './posts/fixer-prix-artisan-sans-brader-concurrence-suisse';
import { post as p97 } from './posts/portfolio-photos-avant-apres-chantier-vente';
import { post as p101 } from './posts/logiciel-gestion-tout-en-un-petite-entreprise-suisse';
import { post as p103 } from './posts/devis-gratuit-en-ligne-suisse-outil';
import { post as p104 } from './posts/quel-logiciel-choisir-demarrer-entreprise-construction';
import { post as p117 } from './posts/outil-devis-factures-sans-double-saisie';
import { post as p128 } from './posts/lancer-entreprise-batiment-suisse-par-ou-commencer';
import { post as p139 } from './posts/raison-individuelle-sarl-sa-quel-statut-batiment';
import { post as p140 } from './posts/cout-creation-entreprise-construction-suisse';
import { post as p141 } from './posts/immatriculer-entreprise-construction-registre-commerce';
import { post as p143 } from './posts/creer-entreprise-batiment-suisse-guide-complet';
import { post as p144 } from './posts/modele-devis-gratuit-artisan-batiment-suisse';
import { post as p145 } from './posts/application-devis-mobile-artisan';
import { post as p146 } from './posts/calculer-acomptes-impots-independant-batiment';
import { post as p147 } from './posts/cantia-vs-cresus-facturation';
import { post as p148 } from './posts/cantia-vs-klara';
import { post as p149 } from './posts/cantia-vs-winbiz';
import { post as p150 } from './posts/checklist-fin-annee-entreprise-batiment';
import { post as p151 } from './posts/chomage-intemperies-rht-batiment-suisse';
import { post as p153 } from './posts/clauses-oubliees-contrat-travail-batiment';
import { post as p155 } from './posts/delai-declaration-tva-suisse-calendrier';
import { post as p159 } from './posts/devis-facture-installateur-solaire-suisse';
import { post as p161 } from './posts/devis-facture-poelier-fumiste-suisse';
import { post as p165 } from './posts/diagnostic-amiante-renovation-obligatoire-suisse';
import { post as p166 } from './posts/directive-suva-echafaudage-chantier-obligation';
import { post as p167 } from './posts/etablir-certificat-salaire-lohnausweis-premier-employe';
import { post as p168 } from './posts/facturer-depannage-urgent-sans-devis';
import { post as p169 } from './posts/facturer-frais-deplacement-client-artisan';
import { post as p171 } from './posts/horaires-bruit-chantier-autorises-suisse';
import { post as p173 } from './posts/instagram-ou-facebook-artisan-batiment';
import { post as p174 } from './posts/lire-fiche-de-salaire-batiment';
import { post as p178 } from './posts/norme-aeai-incendie-batiment-obligation';
import { post as p179 } from './posts/periode-essai-batiment-duree-legale';
import { post as p180 } from './posts/prix-isolation-facade-m2-suisse';
import { post as p181 } from './posts/prix-refection-toiture-suisse';
import { post as p182 } from './posts/prix-renovation-cuisine-suisse';
import { post as p183 } from './posts/prix-renovation-salle-de-bain-suisse-m2';
import { post as p184 } from './posts/programme-batiments-subvention-renovation-suisse';
import { post as p186 } from './posts/relancer-client-devis-sans-reponse';
import { post as p188 } from './posts/repondre-avis-negatif-google-artisan';
import { post as p191 } from './posts/travailleur-detache-batiment-suisse-regles';
import { post as p192 } from './posts/tva-methode-effective-ou-tdfn-batiment';
import { post as p193 } from './posts/vacances-construction-suisse-dates-canton';
import { post as p194 } from './posts/vacances-employe-batiment-cct-jours';
import { post as p195 } from './posts/action-garantie-sous-traitant-entrepreneur-general';
import { post as p196 } from './posts/affacturage-factoring-entreprise-batiment-suisse';
import { post as p198 } from './posts/assurance-bris-machine-outillage-chantier';
import { post as p203 } from './posts/bilan-carbone-chantier-construction-suisse';
import { post as p204 } from './posts/cautionnement-bancaire-entreprise-generale-suisse';
import { post as p206 } from './posts/chantier-copropriete-ppe-facturation-suisse';
import { post as p207 } from './posts/chantier-propre-reduire-nuisances-voisinage';
import { post as p208 } from './posts/comparer-devis-fournisseurs-materiaux-methode';
import { post as p209 } from './posts/construction-modulaire-prefabriquee-suisse';
import { post as p211 } from './posts/credit-construction-hypothecaire-entreprise-batiment';
import { post as p223 } from './posts/faillite-client-creance-impayee-que-faire';
import { post as p224 } from './posts/formation-continue-obligatoire-batiment-suisse';
import { post as p225 } from './posts/gerer-conflit-entre-deux-ouvriers-chantier';
import { post as p226 } from './posts/gestion-dechets-chantier-tri-obligatoire-suisse';
import { post as p229 } from './posts/leasing-machines-vehicules-chantier-suisse';
import { post as p231 } from './posts/motiver-equipe-chantier-batiment-quotidien';
import { post as p233 } from './posts/norme-minergie-batiment-explication';
import { post as p236 } from './posts/racheter-entreprise-batiment-existante-suisse';
import { post as p238 } from './posts/renovation-apres-sinistre-degat-eau-assurance';
import { post as p239 } from './posts/renovation-batiment-historique-protege-suisse';
import { post as p241 } from './posts/rupture-stock-fournisseur-chantier-que-faire';
import { post as p244 } from './posts/transmettre-entreprise-batiment-retraite';
import { post as p245 } from './posts/calcul-lpp-employe-taux-salaire-coordonne-2026';
import { post as p246 } from './posts/prix-contrat-nettoyage-bureaux-suisse-calcul';
import { post as p247 } from './posts/facturer-petites-interventions-gerance-conciergerie';
import { post as p248 } from './posts/devis-reparation-garage-supplement-accord-client';
import { post as p249 } from './posts/acompte-demenagement-suisse-montant-facture';
import { post as p250 } from './posts/facturer-support-informatique-temps-passe';
import { post as p251 } from './posts/corrections-incluses-offre-graphiste-droits';
import { post as p252 } from './posts/annulation-reservation-photographe-acompte-arrhes';
import { post as p253 } from './posts/salaire-personnel-extra-evenementiel-traiteur';
import { post as p254 } from './posts/forfait-ou-temps-passe-consultant-suisse';
import { post as p255 } from './posts/formateur-independant-suisse-tva-facture';
import { post as soum1 } from './posts/remplir-soumission-pdf-architecte';
import { post as soum3 } from './posts/calculer-prix-unitaire-soumission';
import { post as soum4 } from './posts/rabais-escompte-tva-ordre-soumission';
import { post as soum5 } from './posts/comprendre-soumission-can-positions';

// Every published article, newest first. To add a new one: write a new file
// under lib/blog/posts/<slug>.ts exporting `post: BlogPost`, then add one
// import + one entry here — nothing else needs to change (index page, SEO
// meta and the static export route list all derive from this array). See
// scripts/seo-routes.mjs for the one place metadata still needs a matching
// entry, following the same pattern as /solutions/*.
export const BLOG_POSTS: BlogPost[] = [
  soum1, soum3, soum4, soum5, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p18, p19, p20, p21, p22, p23, p24, p26, p27,
  p28, p29, p30, p31, p32, p34, p35, p36, p38, p39, p41, p42, p43, p44, p45, p46, p47, p48, p49, p50, p51, p52,
  p53, p54, p55, p57, p59, p61, p63, p64, p65, p66, p68, p69, p70,
  p71, p72, p73, p74, p75, p76, p77, p78, p91, p93, p94, p96, p97, p101, p103, p104, p117, p128, p139, p140, p141, p143, p144,
  p145, p146, p147, p148, p149, p150, p151, p153, p155, p159, p161, p165, p166, p167, p168, p169, p171, p173, p174, p178, p179, p180, p181, p182, p183, p184,
  p186, p188, p191, p192, p193, p194,
  p195, p196, p198, p203, p204, p206, p207, p208, p209, p211, p223, p224, p225, p226, p229, p231, p233, p236, p238, p239, p241, p244, p245,
  p246, p247, p248, p249, p250, p251, p252, p253, p254, p255,
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const BLOG_CATEGORIES = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));

// The French slug an article is known by in every language.
export function baseSlugOf(post: BlogPost): string {
  return post.baseSlug ?? post.slug;
}

// German articles with their own German slug carry it as `slug`.
const POSTS_DE: BlogPost[] = BLOG_POSTS_DE.map((p) => {
  const slug = publicSlug(p.slug, 'de');
  return slug === p.slug ? p : { ...p, slug, baseSlug: p.slug };
});

function postsOf(locale: BlogLocale): BlogPost[] {
  return locale === 'de' ? POSTS_DE : locale === 'it' ? BLOG_POSTS_IT : BLOG_POSTS;
}

const BY_BASE: Record<BlogLocale, Map<string, BlogPost>> = {
  fr: new Map(BLOG_POSTS.map((p) => [p.slug, p])),
  de: new Map(POSTS_DE.map((p) => [baseSlugOf(p), p])),
  it: new Map(BLOG_POSTS_IT.map((p) => [p.slug, p])),
};

// The articles listed in a language (blog index, newest first): translated,
// not merged into another page, not set aside from Google (lib/blog/triage.ts).
export function getAllPosts(locale: BlogLocale = 'fr'): BlogPost[] {
  return BLOG_POSTS.map((p) => BY_BASE[locale].get(p.slug)).filter(
    (p): p is BlogPost => !!p && isListed(baseSlugOf(p), locale)
  );
}

// Static pages to generate under /blog, /de/blog, /it/blog.
export function blogStaticParams(locale: BlogLocale): { slug: string }[] {
  return postsOf(locale)
    .filter((p) => !isRetired(baseSlugOf(p), locale))
    .map((p) => ({ slug: p.slug }));
}

// The article at /<locale>/blog/<slug>.
export function getPostBySlug(slug: string, locale: BlogLocale = 'fr'): BlogPost | undefined {
  const post = postsOf(locale).find((p) => p.slug === slug);
  return post && !isRetired(baseSlugOf(post), locale) ? post : undefined;
}

// The article a link to `base` leads to in this language, following merges;
// undefined when it now leads elsewhere (another language, a product page)
// or to a page kept out of the lists.
export function getPostByBase(base: string, locale: BlogLocale = 'fr'): BlogPost | undefined {
  const route = resolvedBlogRoute(base, locale);
  const prefix = locale === 'fr' ? 'blog/' : `${locale}/blog/`;
  if (!route.startsWith(prefix)) return undefined;
  const post = postsOf(locale).find((p) => p.slug === route.slice(prefix.length));
  return post && isListed(baseSlugOf(post), locale) ? post : undefined;
}

export function getRelatedPosts(post: BlogPost, max = 3, locale: BlogLocale = 'fr'): BlogPost[] {
  const self = baseSlugOf(post);
  const bySlug: BlogPost[] = [];
  for (const s of post.relatedSlugs ?? []) {
    const p = getPostByBase(s, locale);
    if (p && baseSlugOf(p) !== self && !bySlug.includes(p)) bySlug.push(p);
  }
  if (bySlug.length >= max) return bySlug.slice(0, max);
  const fallback = getAllPosts(locale).filter((p) => baseSlugOf(p) !== self && p.category === post.category && !bySlug.includes(p));
  return [...bySlug, ...fallback].slice(0, max);
}

// Other articles of the same category, for the "same category" list under
// every article. The listed articles of a category form a ring (oldest
// first): each one links to the next `count` around it, so every article
// receives `count` links from its neighbours (more than the hand-picked
// "see also" cards can promise). Articles already in `exclude` are skipped.
export function getCategoryNeighbours(post: BlogPost, count = 4, locale: BlogLocale = 'fr', exclude: BlogPost[] = []): BlogPost[] {
  const ring = getAllPosts(locale)
    .filter((p) => p.category === post.category)
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || baseSlugOf(a).localeCompare(baseSlugOf(b)));
  const at = ring.findIndex((p) => baseSlugOf(p) === baseSlugOf(post));
  if (at < 0 || ring.length < 2) return [];
  const skip = new Set(exclude.map(baseSlugOf));
  const out: BlogPost[] = [];
  for (let step = 1; step < ring.length && out.length < count; step++) {
    const p = ring[(at + step) % ring.length];
    if (!skip.has(baseSlugOf(p))) out.push(p);
  }
  return out;
}
