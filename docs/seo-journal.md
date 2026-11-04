# Journal SEO — cantia.ch

Ce fichier garde les chiffres de référence, les changements datés (jalons) et les résultats mensuels.
Règle : on ne conclut jamais sans 4 semaines de recul. Le bâtiment ralentit en décembre et pendant les vacances de la construction.

---

## 1. Référence Search Console (29 juillet → 31 octobre 2026)

Chiffres fournis par Bastien, relevés le 2 novembre 2026.

- 226 clics, 11 287 impressions, 959 requêtes distinctes.
- 28 derniers jours : 74 clics (95 avant, −22 %), 5 923 impressions (4 593 avant, +29 %).
- Position moyenne hebdomadaire : environ 11 en septembre, environ 22 depuis mi-octobre.
- 72 des 76 clics rattachés à une requête viennent de la marque (« cantia », « cantia app »).
- Hors marque : environ 3 500 impressions pour 4 clics. **KPI n°1 = clics hors marque.**

| Recherche | Position | Impressions |
|---|---|---|
| nachtrag offerte | 3,9 | 18 |
| comment trouver des clients dans le bâtiment | 4,8 | 8 |
| ppe facture / ppe sur facture | 6,3 à 7,0 | 23 |
| créer son entreprise bâtiment | 7,5 | 8 |
| logiciel comptabilité suisse comparatif | 7,8 | 8 |
| lohnausweis | 9,3 | 30 |
| branchensoftware baugewerbe | 11,0 | 11 |
| assurance bris de machine entreprise | 11,2 | 60 |
| tva trimestrielle | 11,3 (en hausse, depuis 40) | 16 |
| online offerten | 14,3 | 61 |
| online offerte tool | 24,7 (en chute, depuis 2,4) | 20 |
| sia 118 | 27,3 (en chute, depuis 9,4) | 29 |
| offerte erstellen | 30,5 | 104 |
| logiciel gestion chantier suisse | 28 | — |
| software bauunternehmen | 45 | — |
| software für bauunternehmen | 58 | — |
| bausoftware schweiz | 64 | — |
| facturation chantier bâtiment suisse | 66 | — |
| baustellen software | 70 | — |
| logiciel devis factures bâtiment | 77 | — |

---

## 2. Étape 0 : contrôles techniques (mesurés le 2 novembre 2026)

### Méthode

- cantia.ch n'est pas joignable depuis l'environnement de travail, et l'API PageSpeed refuse les appels sans clé (429).
- J'ai donc reconstruit **la build de production exacte** : même commande que Netlify, même commit `0a39150`.
- Je l'ai servie avec un émulateur des règles de `netlify.toml` (redirections, en-têtes, compression gzip).
- J'ai crawlé les 831 URL cantia.ch du sitemap.
- Lighthouse 13.6.0 en mode mobile, avec la simulation par défaut (Moto G Power, 4G lente).
- **Ce sont des mesures de labo, pas des données terrain.** À confirmer avec PageSpeed Insights sur le vrai domaine (le CrUX n'aura probablement pas assez de trafic).

### Lighthouse mobile (labo)

| Page | Perf | SEO | Access. | Bonnes pratiques | FCP | LCP | TBT | CLS | Poids transféré |
|---|---|---|---|---|---|---|---|---|---|
| Accueil `/` | 26 | 100 | 91 | 92 | 16,2 s | 22,3 s | 3 250 ms | 0 | 4 090 Ko |
| `/tarifs` | 27 | 100 | 87 | 92 | 15,9 s | 15,9 s | 2 250 ms | 0 | 3 579 Ko |
| `/blog/calculer-prix-unitaire-soumission` | 26 | 100 | 96 | 92 | 15,9 s | 21,6 s | 3 390 ms | 0 | 3 582 Ko |

- L'INP ne se mesure pas en labo. Le TBT (2,2 à 3,4 s) annonce un INP mauvais sur mobile.
- Cause principale du FCP à 16 s : le HTML pré-rendu est caché (`html:not(.hydrated) #root{visibility:hidden}`, dans `scripts/inject-seo-meta.mjs`) jusqu'à ce que React ait chargé et exécuté tout le JS. Le texte est dans le HTML, mais rien ne s'affiche avant le JS.

### Poids du JavaScript (chargé sur chaque page vitrine)

| Fichier | Brut | gzip | brotli |
|---|---|---|---|
| `/_expo/static/js/web/index-….js` | 11 095 Ko | 2 873 Ko | 2 161 Ko |
| module complémentaire | 327 Ko | 103 Ko | 86 Ko |

- Le paquet contient toute l'app : SheetJS (xlsx), pdf-lib, pdf.js, three.js, les écrans de l'app et de l'admin.
- Il n'y a pas de découpage par route : `asyncRoutes` n'est pas activé dans `app.json`.
- Objectif de l'étape 1 : **moins de 300 Ko compressés** sur une page vitrine.

### Sitemap

- 832 URL :
  - 831 sur cantia.ch : 361 en français, 235 en allemand, 235 en italien ;
  - 1 sur `https://app.cantia.ch/login`, à retirer.
- Les 831 URL cantia.ch répondent 200.
- Tous les `lastmod` sont à la date de la build.

### Codes de réponse et redirections

| URL | Réponse | Attendu |
|---|---|---|
| `/de/tarifs`, `/it/tarifs`, `/de/tarifs/` | 404 | 200 (ou plus de hreflang vers elles) |
| `/fonctionnalites` | 404 | page à créer (les 10 pages `/solutions/*` existent) |
| `/tarifs` et `/tarifs/` | 200 et 200 | une seule forme, 301 de l'autre |
| `/signup`, `/login` | 200, sans `noindex` | `noindex` |
| `/liens` | 200, sans H1, dans le sitemap, sans `noindex` | `noindex`, hors sitemap |
| URL inconnue | 404 avec `app-shell.html` (page blanche) | vraie page 404 lisible |

- **18 alternates hreflang en 404**, sur 9 pages françaises : `/liens`, `/tarifs`, `/outils`, ses 5 calculateurs et `/logiciel-chantier`. Elles annoncent des versions `/de/…` et `/it/…` qui n'existent pas.
- Redirections existantes :
  - 10 règles manuelles (API santé, calendrier, PostHog, `/presentation`, `/link` → `/liens` en 301) ;
  - 275 règles générées (réécritures 200 vers les pages pré-rendues) ;
  - aucune 301 de slash final.

### Balises (HTML brut, 831 pages)

- **19 pages sans H1**, dont `/liens`, `/blog`, `/de/blog`, les pages légales, `/aide/videos` et `/aide/ressources`.
- Meta descriptions hors de 120 à 160 caractères :
  - français : 187 sur 361 (de 9 à 209 caractères) ;
  - allemand : 164 sur 235 (jusqu'à 287) ;
  - italien : 138 sur 235 (au plus court, 11).
- 572 titles de plus de 60 caractères.
- 0 balise `<img>` sur tout le site.
- Seule la balise Google Ads `AW-18465996566` figure dans le HTML. GA4 `G-1K03L5TNDX` n'y est pas. PostHog est relayé par `/ingest/*`.

### Données structurées

| Type | Pages |
|---|---|
| Organization | 831 |
| BreadcrumbList | 828 |
| FAQPage | 711 |
| Article | 555 |
| SoftwareApplication | 33 |

- Dans les FAQPage, 83 des 1 364 questions ne figurent pas dans le texte visible de la page (exemple : `/calculateur-salaire`). Google l'interdit.
- L'auteur des articles est l'organisation, pas une personne.

### Pages clés (HTML brut)

| Page | Mots | H1 | H2 |
|---|---|---|---|
| `/` | 1 906 | 1 | 20 |
| `/de` | 1 736 | 1 | — |
| `/logiciel-chantier` | 1 410 | 1 | — |
| `/electricien` | 911 | 1 | — |
| article type | 765 | 1 | — |
| `/tarifs` | 197 | 1 | 0 |

- Description de l'accueil : 124 caractères.

### Blog

- 263 articles en français, 146 en allemand, 146 en italien.
- Médiane : environ 473 mots.
- Publications par mois (dates affichées) :

| Jan. | Févr. | Mars | Avr. | Mai | Juin | Juil. | Août | Sept. | Oct. |
|---|---|---|---|---|---|---|---|---|---|
| 6 | 8 | 9 | 9 | 7 | 15 | 33 | 34 | 59 | 83 |

- **107 articles sont datés avant la création du blog** dans le code (19 août 2026). 82 d'entre eux sont même datés avant le premier commit du dépôt (28 juillet 2026). 106 articles ont été ajoutés en un seul commit le 22 septembre 2026.
- Catégories :

| Catégorie | Articles |
|---|---|
| Juridique | 60 |
| Comparatifs | 48 |
| Chantier | 32 |
| RH | 30 |
| Devis | 28 |
| Métiers | 28 |
| Croissance | 17 |
| Services & autres métiers | 10 |
| Sur-mesure | 10 |

- Slugs qui contiennent « logiciel » : 31. « assurance » : 10. « devis-facture-… » : 23.

---

## 3. Jalons

Format : `AAAA-MM-JJ · type · ce qui a changé · pages touchées`

- 2026-11-02 · mesure · référence de l'étape 0 (Lighthouse labo, crawl du sitemap, poids du JS) · toutes
- 2026-11-03 · contenu · dates de publication des articles alignées sur leur vraie mise en ligne (historique git) : 380 étaient antérieures, 131 postérieures · 263 articles FR, 146 DE, 146 IT
- 2026-11-03 · technique · pages /de/tarifs et /it/tarifs créées (étaient en 404) · /tarifs, /de/tarifs, /it/tarifs
- 2026-11-03 · technique · hreflang limité aux versions qui existent (18 liens en 404 supprimés) · /tarifs, /liens, /outils et ses 5 calculateurs, /logiciel-chantier
- 2026-11-03 · technique · noindex sur /liens, l'inscription, la connexion, les routes de l'app et la 404 · /liens, /signup, /login, app-shell
- 2026-11-03 · technique · 301 de /page/ vers /page (fonction edge Netlify) · toutes
- 2026-11-03 · technique · sitemap : lastmod réel par page, /liens et app.cantia.ch/login retirés, tarifs DE et IT ajoutés · sitemap.xml
- 2026-11-03 · technique · meta description échappée (un guillemet coupait la balise, ex. « Le terme ») · toutes
- 2026-11-03 · données structurées · FAQPage limité aux questions visibles, FAQ des articles reprise de l'article · 711 pages avec FAQ
- 2026-11-03 · données structurées · auteur Article = Person « Bastien », signature visible « Par Bastien » · articles FR, DE, IT
- 2026-11-03 · données structurées · SoftwareApplication : operatingSystem Web seulement (apps non publiées) · pages produit
- 2026-11-03 · balises · H1 ajouté · /blog, /de/blog, /it/blog, pages légales, /aide/videos, /aide/ressources, /liens (FR, DE, IT)
- 2026-11-03 · balises · 65 meta descriptions réécrites en 140 à 155 caractères · pages produit, métiers, légales, contact, téléchargement (FR, DE, IT)
- 2026-11-03 · performance · JavaScript découpé par page (asyncRoutes web) et SheetJS chargé seulement à l'export ou à l'import Excel : JS au chargement de 2 976 à environ 2 240 Ko gzip · toutes
- 2026-11-03 · mesure · GA4 G-1K03L5TNDX, configuré seulement après accord cookies ; événements signup_start, sign_up, trial_start, pricing_click, generate_lead, contact_click ; politique de confidentialité mise à jour · toutes
- 2026-11-04 · contenu · tri du blog appliqué : 117 articles FR fusionnés (301 vers la page qui reprend le sujet), 12 hors sujet en noindex ; 134 articles FR indexés au lieu de 263 · blog FR, DE, IT
- 2026-11-04 · technique · 522 redirections 301 (fusions, articles non traduits vers le français, slugs allemands) ; sitemap 832 → 504 URL · blog FR, DE, IT
- 2026-11-04 · contenu · traductions sans impressions en noindex (DE 23, IT 14) ; italien en pause sauf pages avec impressions · /de/blog, /it/blog
- 2026-11-04 · SEO · 13 articles allemands avec un slug allemand (ex. /de/blog/offerte-erstellen-online-schweiz, /de/blog/sia-118-offerte-pflicht) et titres réécrits pour « offerte erstellen », « software bauunternehmen », « nachtrag offerte » · /de/blog
- 2026-11-04 · SEO · titles et meta réécrits d'après les requêtes réelles : bruit de chantier, indemnités kilométriques, SIA 118, salaire minimum CCT, TVA, Lohnausweis, bris de machine, 4h45, régie · 9 articles FR
- 2026-11-04 · technique · 10 pages métiers hors bâtiment (traiteur, graphiste, garage…) en noindex et retirées de /metiers · 30 pages FR, DE, IT
- 2026-11-04 · performance · bloc JS commun 1 741 → 1 512 Ko gzip (articles retirés) · toutes

### Après les changements du 3 novembre 2026 (même méthode, labo)

| Page | Perf | FCP | LCP | TBT | CLS | Poids transféré |
|---|---|---|---|---|---|---|
| Accueil `/` | 37 (26) | 12,8 s (16,2) | 20,1 s (22,3) | 710 ms (3 250) | 0,069 (0) | 3 477 Ko (4 090) |
| `/tarifs` | 46 (27) | 4,0 s (15,9) | 4,0 s (15,9) | 1 400 ms (2 250) | 0 | 2 967 Ko (3 579) |
| `/blog/calculer-prix-unitaire-soumission` | 32 (26) | 4,0 s (15,9) | 18,2 s (21,6) | 1 790 ms (3 390) | 0 | 2 970 Ko (3 582) |

Entre parenthèses : la référence du 2 novembre.

JS chargé par une page vitrine (gzip) : bloc commun 1 741 Ko + mise en page 205 Ko + page d'accueil 293 Ko. Le bloc commun contient encore :
- le texte de tous les articles du blog en 3 langues (2,6 Mo bruts) ;
- les pages métiers en 3 langues (460 Ko bruts) ;
- les traductions de l'app (690 Ko bruts) ;
- les graphiques de l'app (gifted-charts) et Supabase.

L'objectif de 300 Ko demande de sortir ces blocs : c'est l'étape suivante.

---

## 4. Revues mensuelles

(à remplir à chaque passage : clics hors marque, inscriptions venant de la recherche, pages qui montent ou baissent, au plus 5 actions)

### 3 novembre 2026 : lecture de l'export du 1er novembre (90 jours)

Export Search Console reçu (pages, requêtes, requête × page, jours). Les 28 derniers jours (5 oct. → 1er nov.) sont comparés aux 28 d'avant (7 sept. → 4 oct.).

| | Impressions | Position | Clics |
|---|---|---|---|
| Pages FR | 2 683 → 2 531 | 12,8 → 9,4 | 82 → 46 |
| Pages DE | 602 → 2 711 | 10,1 → 35,1 | 6 → 6 |
| Pages IT | 1 507 → 1 383 | 10,3 → 12,1 | 10 → 26 |
| Blog, toutes langues | | | 48 → 51 |

- La baisse de la position moyenne vient des nouvelles impressions allemandes (position 30 à 70). Le français progresse : 11,1 → 7,9 sur les 141 pages vues dans les deux périodes.
- La baisse des clics vient de la marque : /telechargement passe de 17 à 3 clics, l'accueil de 25 à 20. La période d'avant contient le pic du 10 septembre.
- **KPI n° 1 (clics hors marque)** : les requêtes rares sont masquées par Google (4 clics hors marque visibles en 90 jours, mais 106 clics sur les pages du blog). On suit donc les clics des pages du blog, des outils et des fonctions : **51 sur les 28 derniers jours**.
- Barre oblique finale : 264 URL avec « / » final ont reçu 4 754 impressions (41 %). La 301 du 3 novembre doit les réunir : à vérifier dans le prochain export.
- Tri du contenu proposé dans `docs/seo-tri-contenu.md`, en attente d'accord.
