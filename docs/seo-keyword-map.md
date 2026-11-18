# Carte des mots-clés de cantia.ch

Une requête, une page par langue. Avant d'écrire un article ou une page, vérifier ici
qu'aucune page ne vise déjà la même intention. Si c'est le cas, enrichir la page
existante au lieu d'en créer une deuxième ; si deux pages se concurrencent, fusionner
dans la meilleure et rediriger l'autre en 301 (`lib/blog/triage.json`).

Sources : audit Search Console du 18.11.2026 (90 jours) et état du dépôt après les
corrections du même jour.

## Pages produit

| Mot-clé principal | Langue | URL cible | Variantes couvertes |
|---|---|---|---|
| logiciel de gestion de chantier | FR | `/` | cantia, logiciel chantier suisse |
| Software Baustellenverwaltung | DE | `/de` | Handwerkersoftware Schweiz |
| software gestione cantieri | IT | `/it` | cantieri, gestione cantieri |
| logiciel de devis | FR | `/solutions/devis` | devis en ligne, logiciel devis artisan |
| offerte erstellen | DE | `/de/offerte-erstellen` | offerte, offertenerstellung, offerten programm, online offerte tool, offerten automatisch erstellen, offerte vorlage, offerten vergleichen |
| creare preventivo | IT | `/it/creare-preventivo` | preventivo gratuito, preventivo costruzioni, modello preventivo |
| software für bauunternehmen | DE | `/de/metiers/batiment-artisanat` | bauunternehmen software, software baugewerbe, branchensoftware baugewerbe |
| application mobile chantier | FR | `/telechargement` | application mobile entreprise suisse |
| logiciel pour {métier} | FR/DE/IT | page métier (`/electricien`, `/de/electricien`… ; slugs DE/IT des pages métier : à traduire, P2) | H1 = titre SEO de la page |

## Articles

| Mot-clé principal | Langue | URL cible |
|---|---|---|
| norme SIA 118 | FR | `/blog/norme-sia-118-devis-obligatoire` |
| SIA 118 (Garantie, Offerte) | DE | `/de/blog/sia-118-offerte-pflicht` |
| SIA 118 | IT | `/it/blog/norma-sia-118-preventivo` |
| SIA 108 vs 118 | FR / DE / IT | `/blog/difference-sia-108-sia-118-devis-contrat`, `/de/blog/sia-108-vs-sia-118-unterschied`, `/it/blog/sia-108-vs-sia-118-differenza` |
| modèle de devis gratuit | FR | `/blog/modele-devis-gratuit-artisan-batiment-suisse` |
| assurance bris de machine | FR | `/blog/assurance-bris-machine-outillage-chantier` |
| facture PPE | FR | `/blog/chantier-copropriete-ppe-facturation-suisse` |
| nuisances de chantier | FR | `/blog/chantier-propre-reduire-nuisances-voisinage` |
| crédit de construction | FR | `/blog/credit-construction-hypothecaire-entreprise-batiment` |
| détachement de travailleurs | FR | `/blog/travailleur-detache-batiment-suisse-regles` |
| chômage intempéries (RHT) | FR | `/blog/chomage-intemperies-rht-batiment-suisse` |
| indemnité kilométrique 2026 | FR | `/blog/indemnites-kilometriques-2026-nouveau-taux` |
| construction modulaire | FR | `/blog/construction-modulaire-prefabriquee-suisse` |
| ouvrir son entreprise dans le bâtiment | FR | `/blog/creer-entreprise-batiment-suisse-guide-complet` |
| heures en décimal (4h45) | FR | `/blog/calculer-heures-travail-ouvrier-minutes-decimales` |
| trouver des clients (bâtiment) | FR | `/blog/trouver-clients-artisan-batiment-suisse` |
| Lohnausweis | DE | `/de/blog/lohnausweis-erstellen-erster-mitarbeiter` |
| Nachtrag Offerte | DE | `/de/blog/nachtragsofferte-mehrkosten` |
| alles in einer Lösung | DE | `/de/blog/alles-in-einer-loesung-software-kmu` |
| Betriebshaftpflicht Bau | DE | `/de/blog/betriebshaftpflicht-baugewerbe` |
| Rabatt und Skonto | DE | `/de/blog/rabatt-skonto-mwst-reihenfolge` |
| calcolo tredicesima | IT | `/it/blog/calcolo-tredicesima-svizzera-pro-rata` |

## Règles

- Les articles allemands et italiens ont un slug dans leur langue (`deSlugs` et `itSlugs` dans
  `lib/blog/triage.json`). L'ancienne adresse avec le slug français redirige en 301.
- Une page traduite déclare ses versions en hreflang, réciproques, avec `x-default` (la version
  française, sinon la première qui existe). Une page sans traduction n'en déclare aucune.
- Le sitemap ne contient que des pages 200, indexables et auto-canoniques
  (`node scripts/generate-sitemap.mjs`).
- Aucun lien interne ne passe par une redirection : `scripts/inject-seo-meta.mjs` réécrit ceux qui
  restent vers l'adresse finale.
- Pas de page « gestion du matériel » (geräteverwaltung bau) tant que Cantia n'a pas cette
  fonction : le Catalogue est une liste de prix, pas un suivi de stock.
