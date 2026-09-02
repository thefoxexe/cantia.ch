import { BlogPost } from "./types";
import { post as p1 } from "./posts-de/accident-travail-chantier-obligations-employeur-suva";
import { post as p2 } from "./posts-de/appel-offres-marches-publics-batiment-suisse";
import { post as p3 } from "./posts-de/application-gestion-freelance-batiment";
import { post as p4 } from "./posts-de/application-hors-ligne-chantier-pourquoi-important";
import { post as p5 } from "./posts-de/apprenti-batiment-salaire-obligations-employeur";
import { post as p6 } from "./posts-de/assurance-chantier-tous-risques-ectr-obligatoire";
import { post as p7 } from "./posts-de/assurance-perte-de-gain-maladie-independant-batiment";
import { post as p8 } from "./posts-de/assurance-rc-professionnelle-batiment-obligatoire";
import { post as p9 } from "./posts-de/avs-ai-independant-batiment";
import { post as p10 } from "./posts-de/bexio-vs-cantia-logiciel-batiment";
import { post as p11 } from "./posts-de/budget-logiciel-gestion-demarrage-entreprise";
import { post as p12 } from "./posts-de/calculer-13e-salaire-prorata-employe";
import { post as p13 } from "./posts-de/calculer-heures-travail-ouvrier-minutes-decimales";
import { post as p14 } from "./posts-de/calculer-prix-de-revient-chantier-batiment";
import { post as p15 } from "./posts-de/calculer-prix-devis-renovation-suisse";
import { post as p16 } from "./posts-de/combien-coute-logiciel-facturation-pas-cher";
import { post as p17 } from "./posts-de/combien-coute-logiciel-gestion-chantier-roi";
import { post as p18 } from "./posts-de/comment-facturer-premiers-clients-debut-activite";
import { post as p19 } from "./posts-de/contrat-ecrit-petits-travaux-quand-necessaire";
import { post as p20 } from "./posts-de/contrat-entreprise-vs-mandat-artisan";
import { post as p21 } from "./posts-de/creer-champ-processus-sur-mesure-logiciel-gestion";
import { post as p22 } from "./posts-de/devis-carreleur-facturation-au-m2-suisse";
import { post as p23 } from "./posts-de/devis-charpente-bois-facturation-suisse";
import { post as p24 } from "./posts-de/devis-facture-chauffagiste-cvc-suisse";
import { post as p25 } from "./posts-de/devis-facture-facadier-isolation-suisse";
import { post as p26 } from "./posts-de/devis-facture-paysagiste-jardinier-suisse";
import { post as p27 } from "./posts-de/gestion-chantier-facturation-electricien-suisse";
import { post as p28 } from "./posts-de/gestion-entreprise-sur-mobile-artisan";
import { post as p29 } from "./posts-de/logiciel-facturation-qr-facture-comparatif-suisse";
import { post as p30 } from "./posts-de/logiciel-facturation-raison-individuelle-suisse";
import { post as p31 } from "./posts-de/meilleur-outil-gestion-independant-suisse";

// German blog posts — mirrors lib/blog/index.ts one-for-one, sourced from
// lib/blog/posts-de/<slug>.ts instead of lib/blog/posts/<slug>.ts. Not every
// French post has a German translation yet (translation is ongoing,
// batch by batch) — getPostBySlug/getRelatedPosts fall back to the French
// version for any slug not yet present here.
export const BLOG_POSTS_DE: BlogPost[] = [
  p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
  p11, p12, p13, p14, p15, p16, p17, p18, p19, p20,
  p21, p22, p23, p24, p25, p26, p27, p28, p29, p30,
  p31,
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
