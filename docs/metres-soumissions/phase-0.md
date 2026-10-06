# Métrés & Soumissions — Rapport de phase 0

Audit de l'existant et plan d'intégration, avant toute implémentation.
Référence : `cantia_metres_soumissions_cahier_des_charges.md` (v1.0).

> PDF de référence : `fixtures/tenders/01_BA_maconnerie.pdf`, **local uniquement**. Le dossier `fixtures/` est gitignoré, car les textes CAN appartiennent au CRB (voir `fixtures/README.md`). Analyse au §9.

---

## 1. Ce qui existe déjà

| Domaine | Existant | Fichiers |
|---|---|---|
| Frontend | Expo 57 / React Native Web, export statique, expo-router | `app/`, `components/` |
| Backend | Supabase : Postgres + RLS, edge functions Deno, Storage | `supabase/` (289 migrations, 60 fonctions) |
| Tenants | `organizations`, `organization_members`, helpers `is_org_member()` / `is_org_admin()` | init_schema |
| Rôles | `organization_roles` avec cases à cocher, dont **`can_view_metre`** (fonction `can_view_org_metre()`) et **`can_view_finances`** (`can_view_org_finances()`) | `20260812160000_role_permission_catalog.sql` |
| Accès chantier | `project_members` : liste blanche facultative par chantier | `20260804000000_invites_and_project_access.sql` |
| Plans tarifaires | Table `plans` avec des drapeaux `has_*` (`has_profitability`, `has_payroll`…) et `max_ai_uses_per_month` | `lib/types.ts` (Plan) |
| Modules | **Org** : `ORG_MODULES`. **Par chantier** : `PROJECT_MODULES` dans `projects.enabled_modules`, avec un module **`metre`** déjà présent. Gating par plan via `PROJECT_MODULE_PLAN_GATED` | `lib/modules.ts`, `chantiers/[id]/settings.tsx` |
| Métré actuel | `metre_items` : liste plate (référence, description, quantité, unité, prix, section). Import CSV, rapprochement catalogue, « Créer un devis depuis ce métré ». **En prod : 8 lignes sur 5 chantiers ; module activé sur 15 chantiers** | `components/ProjectMetre.tsx`, `lib/catalog.ts` |
| Catalogue | `catalog_items` (org) : description, unité, prix, `use_count`, `last_used_at`. 6 270 lignes en prod (articles Bexio + devis) | `20260807200000_catalog_items.sql` |
| Devis / factures | `devis`, `devis_items`, `factures`. Moteur TVA et rabais existants | `lib/vat/`, `app/(app)/devis/` |
| Situations | `chantier_situations` et `chantier_situation_items` (liées au devis ; 0 en prod) : base de la facturation de situation future | `20260916150000_chantier_situations.sql` |
| Fichiers | Table `files` (org, chantier), bucket `opus-storage`, URL signées | init_schema |
| PDF générés | Edge functions avec `pdf-lib` (`generate-devis-pdf`, `generate-facture-pdf`…) | `supabase/functions/generate-*-pdf` |
| Tableur | Dépendance `xlsx` déjà installée | `package.json` |
| IA | Claude via `ANTHROPIC_API_KEY` dans 10 edge functions. Quota mensuel via `check_and_log_ai_usage` | `scan-receipt`, `dataimport-ai-map`, `generate-devis-lines`… |
| Audit | Plusieurs tables `*_audit_log` (partenaires, compta, fiduciaire) sur le même modèle | — |
| i18n | i18next FR / DE / IT | `lib/translations/{fr,de,it}.ts` |
| Tests | `node --test` sur des modules TS purs (moteur salaires, TVA, bouclement, compta admin) | `scripts/*.test.mjs` |
| Viewer PDF | **Aucun** (ni pdf.js ni rendu de page) | — |
| Jobs asynchrones | Pas de file d'attente générique. Cron Supabase et workers dédiés (`bexio-sync-worker`) | — |

## 2. Ce qu'on réutilise

- **Activation** : le module chantier `metre` existant (case « Métré » dans les paramètres du chantier), plus un nouveau drapeau plan `plans.has_tenders` ajouté à `PROJECT_MODULE_PLAN_GATED`. Pas de système de feature flags parallèle.
- **Permissions** :
  - `can_view_org_metre()` pour `tender.read/write` et `measurement.read/write` ;
  - `can_view_org_finances()` pour voir et saisir les prix (`tender.price`) ;
  - liste blanche `project_members` pour le scoping chantier.
  - **Aucun nouveau rôle.**
- **Fichiers** : table `files` et bucket `opus-storage`. Les PDF originaux (soumissions et plans) sont des fichiers du chantier, visibles dans « Documents » et **jamais modifiés**.
- **Catalogue** : `catalog_items` devient le « catalogue entreprise ». On ajoute les colonnes `internal_code`, `classification_*` et `default_formula`.
- **Devis** : « Créer une offre » produit un `devis` standard (numérotation, TVA, rabais, e-mail, suivi commercial, situations futures). C'est le **moteur financier existant** : pas de second calcul de TVA ou de rabais.
- **IA** : même modèle d'edge function que `scan-receipt` (sortie JSON validée, quota `check_and_log_ai_usage`).
- **PDF d'offre** : `generate-devis-pdf`, éventuellement avec une mise en page « soumission » (références CAN, R, ventilations).
- **Audit** : nouvelle table `tender_audit_log` sur le modèle de `partner_audit_log`.

## 3. Ce qu'il faut ajouter

1. **Modèle de données métrés** (§4).
2. **Extraction PDF côté navigateur avec pdf.js.** Elle donne texte, page, coordonnées, police et rotation. Raisons :
   - gratuit ;
   - pas de limite de temps d'edge function ;
   - le PDF reste chez l'utilisateur pendant l'analyse.
3. **Parseur déterministe en TypeScript pur** (`lib/tenders/parser/`), testable en Node avec la fixture. Étapes :
   - mise en page (colonnes, retraits, en-têtes et pieds répétés) ;
   - numérotation (CAN, CFC, R, `.111`) ;
   - unités, quantités, ventilations ;
   - lignes financières (report, sous-total, TVA…) ;
   - contrôles mathématiques.
4. **Résolveur IA** (edge function `tender-ai-resolve`). Il reçoit **uniquement les blocs ambigus**, avec leur contexte, et renvoie un schéma strict. Il ne crée jamais de prix et ne fixe jamais seul une unité incertaine : il pose une question.
5. **OCR** pour les scans uniquement : pages rendues en image, puis vision Claude, puis même pipeline. À confirmer (§8).
6. **Écran de validation d'import** : PDF à gauche avec zone surlignée, arbre à droite, résumé « prêtes / à vérifier / questions », questions regroupées avec « appliquer aux pages similaires ».
7. **Tableau du métré** : arbre repliable, virtualisé, avec les colonnes Soumission / Métré / Écart / Retenu / PU / Montant / Statut, un panneau de provenance et l'autosave.
8. **Moteur de formules sûr** (`lib/tenders/formula.ts`) :
   - parseur d'expressions maison (AST), sans `eval` ;
   - liste blanche de variables (`length`, `area`, `height`, `thickness`, `faces`…) et d'opérateurs (`+ - * / ( )`) ;
   - détection des paramètres manquants.
9. **Espace « Mesurer sur plan »** (ordinateur uniquement) :
   - rendu pdf.js page par page avec calque SVG ;
   - calibration par échelle ou par cote ;
   - outils distance, polyligne, surface, périmètre et comptage ;
   - coordonnées normalisées 0–1 ;
   - undo/redo, position active, zone active ;
   - navigation position ↔ plan.
10. **Allocations** mesure ↔ position (N–N) et recalcul :
    - calcul immédiat côté client pour l'affichage ;
    - **calcul de référence côté serveur** par fonction SQL, avant l'export et la création de l'offre.
11. **Exports** : tableur (`xlsx`, déjà installé) et PDF d'offre. Architecture prête pour CRBX (`TenderExporter` / `TenderImporter` par format).

## 4. Tables et migrations

Toutes les tables ont `organization_id` (dérivé côté serveur, jamais du client) et la RLS `can_view_org_metre(organization_id)` + accès chantier.

| Table | Rôle | Points clés |
|---|---|---|
| `tenders` | Le métré ou la soumission (N par chantier) | `project_id`, `name`, `number`, `kind` (soumission / interne / variante / complémentaire), `status`, `classification_type` (CAN / CUSTOM / UNKNOWN), `cfc_code`, `language`, `currency`, `source_type` (pdf / manual / duplicate / csv / crbx), `devis_id` (offre générée) |
| `tender_documents` | Fichiers sources | `file_id` → `files`, `role` (soumission / annexe), `page_count`, `sha256`, `parser_version`, `ai_model_version`, `imported_at`, métadonnées détectées (projet, MO, architecte, date) |
| `tender_nodes` | Arbre du document | `parent_id`, `node_type` (contract, chapter, section, article, billable_position, carry_forward, subtotal, chapter_total, financial_adjustment, note, other), `sort_order`, `raw_number`, `position_path`, `display_reference`, `can_chapter`, `can_position`, `can_version`, `can_language`, `cfc_code`, `is_reserved`, `title`, `description` (non tronquée), `raw_text`, provenance (`source_document_id`, `source_page`, `source_bbox`), `confidence`, `needs_review`, `validated_by`, `validated_at` |
| `tender_positions` | Postes chiffrables (1–1 avec un nœud `billable_position`) | `raw_unit`, `unit` (normalisée), `quantity_original` (**jamais écrasée**), `quantity_measured` (somme des allocations, calculée), `quantity_manual`, `manual_note`, `quantity_selected_source` (original / measured / manual), `quantity_selected` (dérivée), `unit_price`, `price_source`, `amount` (dérivé), `status`, `excluded`. Colonnes prévues mais vides en V1 : `quantity_contractual`, `quantity_executed`, `quantity_invoiced` |
| `position_breakdowns` | Ventilations (PG, A-B…) | `code`, `label`, `quantity_original`, `quantity_measured`, `quantity_manual`, `quantity_selected`, `unit`, `sort_order`, provenance, `confidence` |
| `tender_zone_labels` | Signification des codes de zone, **par métré** (pas universelle) | `tender_id`, `code`, `label`, `source` (document / user) |
| `plans` | Plan d'un chantier | `project_id`, `name`, `number` (A-102), `active_revision_id` |
| `plan_revisions` | Révisions | `plan_id`, `label` (Rev C), `file_id`, `page_count`, `uploaded_at`. Les anciennes ne sont jamais supprimées |
| `plan_pages` | Page et calibration | `revision_id`, `page_index`, `width_pt`, `height_pt`, `rotation`, `calibration` (méthode, échelle ou deux points + distance réelle), `meters_per_unit` |
| `measured_objects` | Géométries mesurées | `plan_page_id`, `name` (M-014), `kind` (distance / polyline / polygon / perimeter / count), `geometry` jsonb (points normalisés), `length_m`, `area_m2`, `perimeter_m`, `count` (dérivés et stockés), `params` jsonb avec la source de chaque valeur, `zone`, `floor`, `color` (affichage uniquement), `deleted_at` |
| `quantity_allocations` | Lien N–N mesure ↔ position | `measured_object_id` (null pour une saisie manuelle), `position_id`, `breakdown_id`, `formula`, `parameters` jsonb, `calculated_quantity`, `manual_adjustment`, `final_quantity`, `source` (plan / manual), `comment`, `deleted_at` |
| `quantity_formulas` | Formules nommées | Formules système (volume mur, coffrage 2 faces, dalle…) et formules de l'org |
| `position_param_presets` | « Utiliser ces valeurs pour les prochaines mesures » | Par position ou par catalogue |
| `price_history` | Historique des prix de l'org | `catalog_item_id` ou clé de description, `unit`, `unit_price`, `project_id`, `tender_id`, `recorded_at`. Alimenté quand une offre est créée |
| `tender_import_jobs` | État d'import | `status` (uploaded → extracting → parsing → resolving → needs_user_input → ready_for_review → imported / failed), `step`, `progress`, `stats`, `error`, `draft` jsonb |
| `tender_import_questions` | Questions et réponses | `kind` (unit / column_role / zone_label / classification / hierarchy), `payload`, `answer`, `apply_scope` (item / similar_pages / document), `answered_by` |
| `tender_audit_log` | Audit | `entity`, `entity_id`, `field`, `old`, `new`, `actor`, `at`. Rempli par triggers sur les champs importants (quantité retenue, prix, géométrie) |

- **Fonctions SQL** :
  - `recalc_tender_position(id)` ;
  - `recalc_tender(id)` (sommes des allocations, quantité retenue, montants, sous-totaux) ;
  - `tender_create_offer(id)` (crée le devis à partir des quantités retenues et des prix, recalculés côté serveur) ;
  - `import_tender_draft(job_id)` (insertion en lot, transactionnelle, après validation).
- **Index** :
  - `(tender_id, sort_order)` sur les nœuds ;
  - `position_id` et `measured_object_id` sur les allocations ;
  - recherche plein texte (tsvector `simple`) sur référence et description.
- **Migration du métré actuel** : les 8 lignes `metre_items` sont converties en un métré « Métré interne » par chantier. L'ancienne table est conservée en lecture pendant une version, puis supprimée.

## 5. Dépendances proposées

| Dépendance | Pourquoi | Remarque |
|---|---|---|
| `pdfjs-dist` | Extraction du texte avec coordonnées, rendu des plans et des soumissions | Web uniquement. Worker servi en fichier statique |
| *(aucune pour les formules)* | Parseur d'expressions maison d'environ 150 lignes, testé | Plus sûr et plus léger qu'une lib générique |
| `xlsx` | Export tableur | Déjà installé |
| `pdf-lib` | PDF d'offre | Déjà utilisé dans les edge functions |
| Claude (`ANTHROPIC_API_KEY`) | Ambiguïtés et OCR des scans | Déjà configuré. Quota existant |

Pas de dépendance de dessin (Konva…) : SVG et React suffisent pour quelques centaines de géométries.

## 6. Risques techniques

1. **Variété des PDF.** Mises en page très différentes d'un architecte à l'autre : colonnes non alignées, textes sur plusieurs lignes, en-têtes répétés. Parade : parseur par règles + scores de confiance + questions. On vise « la majorité de la structure », pas 100 %.
2. **Gros documents** (50+ pages, 1 000+ nœuds). Parades :
   - extraction page par page dans le navigateur ;
   - insertion en lot dans une seule RPC ;
   - tableau virtualisé.
3. **Coût et délai de l'IA.** On n'envoie que les blocs ambigus. L'OCR complet d'un scan de 50 pages coûte cher : à décompter du quota mensuel ou à plafonner.
4. **Précision des mesures.** Elle dépend de la calibration et du zoom. On affiche toujours l'échelle utilisée, on autorise la recalibration et les mesures existantes sont recalculées.
5. **React Native Web et canvas.** Le rendu pdf.js et le calque SVG passent par des composants `.web.tsx` dédiés. Mobile : consultation seulement, comme prévu.
6. **Droits CAN / CRBX.** Pas de catalogue CAN complet sans licence CRB. CRBX reste un format préparé (interfaces), pas implémenté en V1.
7. **Cohérence des calculs.** Le calcul est fait deux fois, client pour l'affichage et SQL pour la référence, avec les mêmes formules. La même série de tests porte sur les deux.
8. **Ancien module Métré.** Remplacement et migration : seulement 8 lignes en prod, donc risque faible.

## 7. Plan d'implémentation

| Phase | Contenu | Livrable testable |
|---|---|---|
| **A — Fondation** | Migrations (tables, RLS, audit, recalcul SQL), drapeau `has_tenders`, liste des métrés d'un chantier, métré vide, arbre éditable, quantités et prix, autosave, migration des `metre_items` | Créer un métré à la main, l'éditer, le retrouver après rechargement |
| **B — Import** | Upload, extraction pdf.js, parseur (CAN / CFC / R / ventilations / reports / totaux), contrôles mathématiques, brouillon, écran de validation split-view, questions, résolveur IA, provenance, OCR | La fixture `01_BA_maconnerie.pdf` passe les 21 critères du §87 |
| **C — Chiffrage** | Quantité retenue, sources de prix (document / catalogue / dernier / moyenne), historique, totaux, export tableur | Métré chiffré et exporté en XLSX |
| **D — Plans** | Plans et révisions, viewer, calibration, outils de mesure, objets mesurés, undo/redo | Mesurer un mur calibré et retrouver sa longueur |
| **E — Allocations** | Allocations N–N, formules, paramètres manquants, presets, position et zone actives, navigation position ↔ plan | Les 22 critères du §88 |
| **F — Offre** | Comparatif soumission / métré, création du devis, PDF d'offre, tableau de bord du métré, finitions UX, FR / DE / IT | Le parcours complet du §89 |

Tests à chaque phase :
- parseur (fixture + cas synthétiques non-CAN) ;
- mathématiques ;
- formules ;
- géométrie et calibration ;
- allocations ;
- RLS (autre org refusée, lecture seule).

## 8. Décisions produit à valider

1. **Remplacer le « Métré » actuel** par le nouveau module (migration des 8 lignes) plutôt que d'avoir deux métrés côte à côte. *Recommandé.*
2. **Plans concernés** : Équipe (`equipe`) et Entreprise (`pro`). Questions ouvertes :
   - Sur mesure (`illimite`, `custom`) aussi ?
   - Le plan personnalisé Besson (39 CHF, peinture) : oui ou non ?
   - Que voient les chantiers Essentiel où le Métré simple est déjà activé ? Proposition : l'ancien métré simple, en lecture seule, avec un écran flouté « disponible dès Équipe ».
3. **OCR des scans** : par Claude (vision), décompté du quota IA mensuel. Alternative : refuser les scans en V1 et les accepter en V2.
4. **Les quantités et les prix restent visibles seulement avec la permission Finances**, comme les devis : un collaborateur sans Finances voit les quantités, pas les prix. *Recommandé.*
5. **L'offre finale est un devis Cantia normal** (numéro, TVA, e-mail, suivi, situations), avec une mise en page « soumission ». *Recommandé.*
6. **Ordre de livraison** : A + B + C d'abord (soumission importée et chiffrée, utile tout de suite), puis D + E (plans), puis F. *Recommandé.*

---

## 9. Analyse du PDF de référence (`01_BA_maconnerie.pdf`)

**Généralités**
- 50 pages A4 générées par Messerli (logiciel de soumission CAN).
- **Texte natif** : aucun OCR nécessaire.
- Une seule police de 10 pt, sans gras : la hiérarchie se lit **aux numéros et aux positions horizontales**, pas au style.

**Page 1 (couverture)**
- Soumission N° 1, projet 18106_CHOEX-VILLAS JUMELLES.
- Maître d'ouvrage, architecte, ingénieur civil.
- **CFC 211 : BÉTON ARMÉ**.

**Page 2 (récapitulation)**
- Contrat 1 (= CFC 211), avec les chapitres CAN 111, 112, 113, 172, 241, 314, 315 (le 102, conditions, n'a pas de montant).
- Lignes de conditions : Brut, Rabais %, Sous-total 1, Escompte %, Sous-total 2, TVA 7.70 %, Net.
- La ligne **`Structure : PG, A-B, C-D, F-G, E-COUV, PARK`** déclare la liste des zones. Leur signification n'est pas donnée dans le document : il faudra la demander à l'utilisateur.

**Pages 3 et suivantes**
- Chaque page a un en-tête répété à ignorer :
  - projet ;
  - date ;
  - « Page: N » ;
  - `Contrat : 1    CAN Construction : 241 Constructions en béton coulé sur place F/04(V´11)`.
- Cet en-tête donne le **chapitre CAN** et sa **version** (`F/04(V´11)` = français, édition 04, version 2011).

**Colonnes (en points PDF, identiques sur toutes les pages)**

| x | Contenu |
|---|---|
| 57–60 | Numéro d'article principal (`121`, `R 429`) |
| 76–78 | Sous-article (`.100`, `.111`) |
| 101 | Texte |
| 249 | Code de zone `:PG`, `:A-B`… `:Total` |
| 350–365 | Quantité (alignée à droite) |
| 390 | Unité |
| 427 | Prix unitaire (pointillés vides, ou valeur) |
| 500–523 | Montant |

**Hiérarchie**
- Les numéros sur 3 chiffres sont des articles. Les centaines (`100`, `200`) suivies d'une ligne de tirets sont des **titres de groupe**.
- `.100`, `.110`, `.111` sont des sous-articles ; seuls ceux qui portent une quantité sont chiffrables.
- Après un saut de page, le chemin complet est répété (`121.112 Epaisseur mm 51 à 100.`) : c'est une **continuation**, pas une nouvelle position.

**Chiffres clés**
- **145 positions chiffrables**.
- 99 lignes de ventilation et 39 lignes `:Total`.

**Unités rencontrées**

| Unité | Lignes |
|---|---|
| `up` (unité de prix, ex. `up = Fr.` en régie ou `up = pce`) | 101 |
| `m2` | 87 |
| `p` (pièce) | 37 |
| `m` | 24 |
| `m3` | 18 |
| `kg` | 6 |
| `gl` (global) | 2 |

**Positions R (réserve)**
- Exemples : `R 411.902`, `R 429`, `R 490`, `R 591.103`, `R 821.190`.
- Le `R` est parfois **sur une ligne à part**, juste au-dessus du numéro.

**Prix**
- Pointillés vides presque partout.
- **Exception : la régie (CAN 111)**. Les prix y sont pré-remplis (`8'000 up × 0.90 = 7'200.00`), avec l'apostrophe suisse comme séparateur des milliers. Ce sont des facteurs de rabais et non des prix de marché. Ils sont à importer comme « prix du document » et à vérifier par `quantité × prix ≈ montant`.

**Totaux**
- « A reporter : » en pied de page.
- « Total <chapitre> » + numéro à la fin de chaque chapitre, puis « Total général ».
- Aucune de ces lignes n'est une position.

**Textes libres**
- Les articles R contiennent des textes rédigés par l'architecte (« Selon plan du bureau BF Architecture… »).
- On y trouve parfois des nombres parasites (`99`) en colonne texte. Ils doivent rester du texte et ne pas devenir une quantité.

**Conséquence pour le parseur.** Ce format (Messerli / CAN) se parse à **plus de 95 % par règles de position**. L'IA ne servira que pour les documents non standard et les cas réellement ambigus.

**Tests prévus avec cette fixture** (sans dépendre de valeurs propres au seul document) :
- 7 chapitres avec montants, plus les conditions ;
- CFC 211 ;
- comptage des positions chiffrables ;
- présence de positions R ;
- ventilations dont la somme égale `:Total` (ex. 241 / 214.114 : 40 + 40 + 28 = 108 m2) ;
- prix de régie avec contrôle q × p = montant ;
- « A reporter » et totaux non chiffrables ;
- continuation après saut de page ;
- texte long conservé.

**Tests et droits CAN**
- Les tests utilisent la fixture **quand elle est présente en local** et sont ignorés sinon (CI).
- En parallèle, une **fixture synthétique** est commitée. Elle reprend la même mise en page (colonnes, numérotation, R, ventilations, reports), mais avec des textes inventés. Elle couvre aussi un document non-CAN.
- **CRBX** : `docs/crbx-format.md` et `fixtures/README.md` posent déjà la règle « observé, jamais deviné ». Le format reste préparé (interfaces) tant qu'aucun vrai `.crbx` n'a été inspecté.

## 10. Phase D livrée — plans et mesures

- **Tables** (`20261006140000_tenders_plans.sql`) : `site_plans`, `site_plan_revisions`, `site_plan_pages`, `measured_objects`.
  - Nom `site_plans`, parce que `public.plans` est le catalogue des abonnements.
  - `organization_id` et `project_id` sont toujours dérivés du parent.
  - Les révisions ne se suppriment pas (aucune politique `delete`).
- **Calibration** par page, de deux façons :
  - par une cote : deux points et la longueur réelle ;
  - par l'échelle (1:50), seulement si le PDF est à l'échelle d'origine.
  - `meters_per_pt` est calculé par trigger. Une recalibration recalcule toutes les mesures de la page.
- **Mesures** : distance, longueur (polyligne), surface, périmètre, comptage.
  - Les points sont normalisés de 0 à 1 sur la page.
  - Longueurs et surfaces sont recalculées côté serveur (`measure_geometry`) : la valeur envoyée par le client est ignorée.
  - Les mêmes formules existent dans `lib/tenders/geometry.ts` pour l'affichage en direct. Mêmes cas de test des deux côtés : `scripts/tenders-geometry.test.mjs` et `supabase/tests/tenders/30_plans.sql`.
  - Numérotation automatique M-001, M-002… par chantier.
- **Écran** `chantiers/[id]/plans/[planId]` :
  - outils en barre, Maj pour l'horizontale / verticale, fermeture au premier point ;
  - points déplaçables, annuler / rétablir (⌘Z), zoom (Ctrl + molette) ;
  - panneau avec les totaux de la page et la liste des mesures.
  - Sur téléphone : consultation seulement.
- **Critère de la phase** vérifié sur un plan A3 au 1:50 :
  - mur calibré : 10.80 m retrouvés ;
  - local : 75.60 m² ;
  - comptage : 3 pce.
- **Reste pour la phase E** : lier une mesure à une position du métré (allocations N–N, formules, quantité mesurée).

## 11. Phase E et export rempli

- **Affecter une mesure** : le panneau de droite du plan propose trois étapes.
  1. Ce qui a été mesuré (mur, dalle, semelle, surface, longueur, pièces).
  2. Ses dimensions (hauteur, épaisseur, largeur, nombre de fois), saisies une fois par mesure et reprises pour la mesure suivante du même type.
  3. Les positions proposées, chacune avec son calcul écrit (`17.80 m × 2.60 m × 2 = 92.56 m²`).
- **Suggestions** (`lib/tenders/allocation.ts`) :
  - l'unité de la position choisit la formule (m², m³, kg, m, pce, et le CAN « up = … ») ;
  - le texte de la position et de ses parents la classe : un mur propose d'abord coffrages de parois et béton pour murs ;
  - les dimensions imprimées dans la soumission (« Epaisseur mm 250 », « Masse kg/m3 85 ») sont lues et signalées. Les plages (« mm 51 à 100 ») et les bornes (« jusqu'à ») ne sont jamais prises.
- **Formules fermées** : 13 formules, pas d'expression libre. Elles sont recalculées côté serveur (`tender_alloc_quantity`), avec les mêmes cas de test qu'en TypeScript.
- **Liens** : table `quantity_allocations` (N–N). `quantity_measured` = somme des liens actifs.
  - Redessiner, recalibrer ou supprimer une mesure met à jour ses liens et la position.
  - « Position active » : chaque nouvelle mesure y est affectée directement.
- **Dans le métré** : chaque position liste ses mesures sur plan, avec un lien qui ouvre le plan sur la mesure.
- **Téléphone** : consultation seulement. Pas de mesure, pas d'import, pas de modification. Le métré, le plan et le devis restent visibles.
- **Export « PDF de la soumission, rempli »** (`lib/tenders/pdfFill.ts`) :
  - les champs pointillés du PDF d'origine reçoivent le PU, le montant, les « A reporter », les totaux de chapitre et le total général ;
  - les montants déjà imprimés par l'architecte (régie) comptent dans les reports ;
  - au choix : quantités de la soumission (recommandé) ou quantités retenues ;
  - vérifié sur `01_BA_maconnerie.pdf` : 28 reports, 8 totaux de chapitre, régie 18'600.00, aucune position sans case ;
  - un PDF scanné est refusé avec un message clair.
