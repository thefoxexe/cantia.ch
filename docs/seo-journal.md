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

---

## 4. Revues mensuelles

(à remplir à chaque passage : clics hors marque, inscriptions venant de la recherche, pages qui montent ou baissent, au plus 5 actions)
