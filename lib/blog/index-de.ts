import { BlogPost } from "./types";
import { post as p1 } from "./posts-de/accident-travail-chantier-obligations-employeur-suva";
import { post as p2 } from "./posts-de/appel-offres-marches-publics-batiment-suisse";
import { post as p5 } from "./posts-de/apprenti-batiment-salaire-obligations-employeur";
import { post as p8 } from "./posts-de/assurance-rc-professionnelle-batiment-obligatoire";
import { post as p12 } from "./posts-de/avenant-chantier-plus-value-moins-value";
import { post as p14 } from "./posts-de/avs-ai-independant-batiment";
import { post as p15 } from "./posts-de/bexio-vs-cantia-logiciel-batiment";
import { post as p17 } from "./posts-de/calculer-13e-salaire-prorata-employe";
import { post as p18 } from "./posts-de/calculer-heures-travail-ouvrier-minutes-decimales";
import { post as p19 } from "./posts-de/calculer-prix-de-revient-chantier-batiment";
import { post as p21 } from "./posts-de/calculer-prix-horaire-reel-ouvrier-batiment";
import { post as p23 } from "./posts-de/certificat-de-travail-obligation-employeur-batiment";
import { post as p25 } from "./posts-de/checklist-cloture-chantier-avant-facturation";
import { post as p27 } from "./posts-de/checklist-ouverture-chantier-artisan";
import { post as p28 } from "./posts-de/client-refuse-payer-solde-final-que-faire";
import { post as p30 } from "./posts-de/combien-coute-logiciel-gestion-chantier-roi";
import { post as p33 } from "./posts-de/contrat-entreprise-vs-mandat-artisan";
import { post as p35 } from "./posts-de/crm-artisan-batiment-pourquoi-utile";
import { post as p37 } from "./posts-de/degats-voisinage-chantier-qui-est-responsable";
import { post as p38 } from "./posts-de/delai-paiement-facture-artisan-code-obligations";
import { post as p41 } from "./posts-de/demission-employe-batiment-preavis-a-respecter";
import { post as p49 } from "./posts-de/devis-gratuit-en-ligne-suisse-outil";
import { post as p50 } from "./posts-de/devis-gratuit-ou-payant-que-dit-la-loi";
import { post as p52 } from "./posts-de/devis-oral-valeur-legale-suisse";
import { post as p54 } from "./posts-de/difference-devis-offre-facture-pro-forma";
import { post as p55 } from "./posts-de/difference-sia-108-sia-118-devis-contrat";
import { post as p56 } from "./posts-de/duree-conservation-devis-factures-suisse";
import { post as p57 } from "./posts-de/duree-validite-devis-non-signe-combien-temps";
import { post as p60 } from "./posts-de/estimer-chantier-a-distance-devis-photo";
import { post as p61 } from "./posts-de/excel-vs-logiciel-gestion-chantier-limites";
import { post as p62 } from "./posts-de/facturation-heures-regie-batiment-comment-faire";
import { post as p63 } from "./posts-de/facturer-acompte-suisse-securiser-solde";
import { post as p66 } from "./posts-de/fixer-prix-artisan-sans-brader-concurrence-suisse";
import { post as p67 } from "./posts-de/garantie-travaux-construction-2-ou-5-ans";
import { post as p70 } from "./posts-de/gerer-plusieurs-chantiers-en-parallele-methode";
import { post as p74 } from "./posts-de/heures-supplementaires-batiment-majoration-25";
import { post as p75 } from "./posts-de/hypotheque-legale-artisans-entrepreneurs-suisse";
import { post as p76 } from "./posts-de/indemnites-kilometriques-2026-nouveau-taux";
import { post as p78 } from "./posts-de/lancer-entreprise-batiment-suisse-par-ou-commencer";
import { post as p79 } from "./posts-de/licenciement-ouvrier-batiment-delai-conge-cct";
import { post as p80 } from "./posts-de/litige-chantier-mediation-ou-tribunal";
import { post as p88 } from "./posts-de/logiciel-gestion-chantier-independant-seul";
import { post as p91 } from "./posts-de/logiciel-gestion-tout-en-un-petite-entreprise-suisse";
import { post as p95 } from "./posts-de/lpp-deuxieme-pilier-independant-batiment";
import { post as p96 } from "./posts-de/meilleur-logiciel-devis-facture-batiment-suisse-2026";
import { post as p101 } from "./posts-de/mentions-obligatoires-facture-suisse-tva";
import { post as p102 } from "./posts-de/norme-sia-118-devis-obligatoire";
import { post as p103 } from "./posts-de/note-de-credit-facture-rectificative-suisse";
import { post as p105 } from "./posts-de/outil-devis-factures-sans-double-saisie";
import { post as p108 } from "./posts-de/permis-construire-renovation-quand-necessaire";
import { post as p109 } from "./posts-de/photos-chantier-preuve-juridique-litige";
import { post as p110 } from "./posts-de/planning-chantier-eviter-conflits-ressources";
import { post as p111 } from "./posts-de/portfolio-photos-avant-apres-chantier-vente";
import { post as p113 } from "./posts-de/pourquoi-entreprises-batiment-font-faillite-suisse";
import { post as p115 } from "./posts-de/poursuite-facture-impayee-procedure-suisse";
import { post as p116 } from "./posts-de/prescription-facture-impayee-delai-10-ans";
import { post as p117 } from "./posts-de/previsionnel-tresorerie-entreprise-batiment";
import { post as p118 } from "./posts-de/qr-facture-obligatoire-2026";
import { post as p119 } from "./posts-de/quel-logiciel-choisir-demarrer-entreprise-construction";
import { post as p120 } from "./posts-de/reception-travaux-proces-verbal-chantier";
import { post as p121 } from "./posts-de/rediger-devis-qui-inspire-confiance-client";
import { post as p122 } from "./posts-de/relancer-client-facture-impayee-sans-perdre-client";
import { post as p123 } from "./posts-de/resiliation-contrat-entreprise-chantier-en-cours";
import { post as p124 } from "./posts-de/retard-chantier-meteo-obligations-contractuelles";
import { post as p125 } from "./posts-de/retenue-de-garantie-chantier-consignation";
import { post as p126 } from "./posts-de/salaire-minimum-cct-construction-suisse";
import { post as p127 } from "./posts-de/signature-electronique-devis-suisse-valeur-legale";
import { post as p128 } from "./posts-de/site-internet-artisan-batiment-utile";
import { post as p130 } from "./posts-de/sous-traitant-batiment-suisse-contrat-facturation";
import { post as p131 } from "./posts-de/suivre-rentabilite-chantier-sans-excel";
import { post as p132 } from "./posts-de/travail-au-noir-batiment-suisse-risques-controles";
import { post as p133 } from "./posts-de/travailleur-temporaire-interimaire-batiment-regles";
import { post as p134 } from "./posts-de/trouver-clients-artisan-batiment-suisse";
import { post as p135 } from "./posts-de/vacances-non-prises-fin-annee-batiment-cct";
import { post as p136 } from "./posts-de/validite-devis-signe-prix-qui-bouge";
import { post as p137 } from "./posts-de/vitesse-reponse-devis-taux-conversion-batiment";
import { post as p138 } from "./posts-de/whatsapp-gestion-equipe-chantier-limites";
import { post as p139 } from "./posts-de/remplir-soumission-pdf-architecte";
import { post as p141 } from "./posts-de/calculer-prix-unitaire-soumission";
import { post as p142 } from "./posts-de/rabais-escompte-tva-ordre-soumission";
import { post as p143 } from "./posts-de/comprendre-soumission-can-positions";

// German blog posts — mirrors lib/blog/index.ts one-for-one, sourced from
// lib/blog/posts-de/<slug>.ts instead of lib/blog/posts/<slug>.ts. All 138
// posts are translated; getPostBySlug/getRelatedPosts still fall back to the
// French version for any future slug added here before its translation lands.
export const BLOG_POSTS_DE: BlogPost[] = [
  p1, p2, p5, p8, p12, p14, p15, p17, p18, p19, p21, p23, p25, p27, p28, p30,
  p33, p35, p37, p38, p41, p49, p50,
  p52, p54, p55, p56, p57, p60,
  p61, p62, p63, p66, p67, p70,
  p74, p75, p76, p78, p79, p80,
  p88, p91, p95, p96, p101, p102, p103, p105, p108, p109, p110,
  p111, p113, p115, p116, p117, p118, p119, p120,
  p121, p122, p123, p124, p125, p126, p127, p128, p130,
  p131, p132, p133, p134, p135, p136, p137, p138,
  p139, p141, p142, p143, ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
