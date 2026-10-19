# Cantia Panorama

(Nom de code dans le code et la base : `relief`. Même nom en allemand et en italien. Anciens noms : Relief, puis Maquette ; `/relief` et `/maquette` redirigent vers `/panorama`.)

Toute l'entreprise en direct sur une vraie planète en 3D. Le process de l'entreprise est prérempli d'après son site internet, le responsable le corrige (types de projets, étapes, durées habituelles et minimales) ; l'IA l'habille avec les mots de l'entreprise ; la planète est ensuite alimentée en direct par les vraies données : chaque projet à son adresse et à son étape, les équipes du jour, les tâches, les chiffres.

Option payante (module privé `relief`) : accordée par l'admin plateforme (`organization_modules.enabled`), puis activée par l'admin de l'entreprise (`activated`).

## La planète

Le même moteur partout (`lib/relief/globe.ts`, three.js) : la Terre texturée (NASA Blue Marble le jour, lumières des villes la nuit, océans qui brillent, nuages, halo bleu de l'atmosphère, étoiles), avec le jour et la nuit placés selon la vraie position du soleil. Au-dessus des Alpes, une pièce en haute définition (`public/globe/alps-day.jpg` + `alps-height.png`, générées par `scripts/panorama-alps.py` à partir du relief réel — AWS Terrain Tiles — et des lacs de Natural Earth) : le relief est éclairé par le soleil du moment, les lacs brillent. La Suisse est tracée en blanc (`lib/relief/globeData.ts`, régénéré par `scripts/panorama-globe-data.mjs`).

Sur la planète : le siège comme une balise blanche (une lumière chaude vue de loin), chaque projet comme un petit faisceau de lumière à l'adresse de sa localité (vert dans les temps, orange tâche en retard, rouge en retard, gris terminé), un anneau qui pulse là où quelqu'un est planifié aujourd'hui ou si le projet est en retard, des arcs depuis le siège avec des impulsions qui partent vers les projets. Les localités sont géocodées (open-meteo, en cache) ; sans adresse, les projets se placent autour du siège.

Les images sont servies depuis `public/globe/` (même origine, CSP inchangée) ; sources et licences dans `public/globe/README.md`.

## Sur l'accueil

Tout en bas de l'accueil, quand l'option est active (`components/relief/PanoramaCard.tsx` + `PanoramaGlobeDom.tsx`) : la planète tourne seule, façon Shopify Live View. Quand la Suisse arrive, elle ralentit et plonge jusqu'à ce que le pays remplisse la vue, reste un moment, puis repart. Dans un coin : « Cantia Panorama », une ligne en direct (« 4 sur le terrain · 7 projets en cours ») et « Ouvrir le Panorama ». Avant la première construction : la planète seule et un petit bouton « Créer mon Panorama ». Un clic n'importe où ouvre `/panorama`.

## Parcours

1. **Offre** (`ReliefLocked`) tant que l'option n'est pas activée ; bouton « Activer » si elle est accordée et que l'utilisateur est admin.
2. **Onboarding** (`ReliefOnboardingDom`, la planète en aperçu derrière le formulaire, qui plonge vers le siège avec des lumières d'exemple) :
   - **Le site** : l'adresse du site (reprise de `organizations.website`) ; « Lire mon site » appelle `relief-prefill`, qui lit la page d'accueil et jusqu'à 3 pages (prestations, à propos, méthode…) et propose les réponses. Pendant la lecture : liste d'étapes animée et balayage de la vue. Ensuite « Voici ce que nous avons compris » : activité, points compris, types de projets trouvés avec leur frise. On peut aussi continuer sans site.
   - 5 étapes à vérifier, marquées « D'après votre site » quand elles viennent du site :
     1. Activité en une phrase + modèle (Territoire / Studio / Atelier).
     2. Process **par type de projet** (jusqu'à 4 types, ex. « Site vitrine » et « Boutique en ligne ») : étapes (nom, responsable, validation client), **durée habituelle** et **durée minimum** en jours ouvrables, frise proportionnelle aux durées (minimum hachuré, validations client marquées).
     3. Équipe : le rôle de chaque membre.
     4. Facturation : devis systématique ou non, quand on facture.
     5. Récit libre, dicté ou écrit (prérempli d'après le site).
   - Récapitulatif modifiable. Les réponses sont gardées (`relief_worlds.answers`).
3. **Construction** : `relief-build` répond tout de suite (202) et travaille en arrière-plan. À la fin : notification + e-mail « Cantia <noreply@cantia.ch> » avec le lien vers `/panorama`.
4. **La vue plein écran** (`ReliefDom`) : arrivée depuis l'espace jusqu'à la Suisse. On fait tourner la planète en glissant, on zoome à la molette ou à deux doigts ; le nom, l'étape et l'avancement de chaque projet flottent au-dessus de sa lumière ; toucher un projet (sur la planète ou dans la liste) ouvre sa fiche et y vole. Bouton lune / soleil : nuit (lumières des villes) ou plein jour sur la Suisse. Ordinateur : cartouche, liste à gauche, fiche à droite. Téléphone : la planète occupe l'écran, liste et fiche dans une feuille en bas. Tablette / petit écran : boutons en icônes, sans légende.

## Faire avancer un projet

- **Au clic** : la fiche commence par un tableau d'étapes (« Étape 2 sur 5 · Conception ») : depuis combien de jours, durée prévue, minimum, dépassement ; un rail des étapes proportionnel aux durées — toucher une étape y place le projet ; bouton « Étape terminée → Passer à « … » ». Avant le minimum, une confirmation est demandée. À la dernière étape : « Clôturer le projet » (passe le projet en terminé, admin ou droit de créer des projets).
- **À la voix** : bouton « Dire » (en-tête) : « Villa Dupont : gros œuvre terminé, on passe au second œuvre ». Le projet est trouvé par son nom (ou c'est celui ouvert), l'étape par son libellé, l'intention par quelques mots en FR/DE/IT (terminé, on passe à, fertig, jetzt, finito, passiamo a…). Parseur pur testé : `lib/relief/stages.ts`, `npm run test:maquette`.
- **Type de projet** : choisi dans la fiche quand il y en a plusieurs ; sinon deviné d'après le nom du projet.
- Tout membre peut faire avancer un projet (comme cocher une tâche) ; l'historique garde qui et quand (`relief_item_progress.history`).
- La planète suit : le nom et l'étape au-dessus du projet changent tout de suite (temps réel).
- **Process éditable** depuis la vue plein écran (bouton « Process », admin) : types, étapes, durées habituelles et minimales ; enregistré sans reconstruction (`relief_save_answers`). « Refaire mon Panorama » est dans ce panneau.

## Calculs

- Étape suivie (ligne `relief_item_progress`) : avancement = jours des étapes passées + jours passés dans l'étape (au plus 90 % de sa durée) / durée totale du process ; « à surveiller » si l'étape dépasse sa durée habituelle ou si la fin estimée dépasse la date de fin du projet ; fin estimée = reste de l'étape + étapes suivantes, en jours ouvrables.
- Étape non suivie : comme avant (planning de chantier pondéré, sinon tâches faites, sinon dates), affichée « Étape estimée ».
- En retard : date de fin passée. Terminé : projet terminé.

## Les équipes du jour

Chaque projet où quelqu'un est planifié aujourd'hui a un faisceau plus haut et un anneau qui pulse ; des impulsions partent du siège le long de l'arc vers chaque projet en cours. Sur l'accueil : « N sur le terrain ».

## Modèles

Le modèle choisi à l'onboarding donne le vocabulaire (chantier, projet, véhicule…) et le nom du siège (dépôt, bureau, atelier) ; sur la planète, tous les projets sont des lumières à leur adresse.

| Modèle | Pour qui |
|---|---|
| Territoire | On travaille chez le client (bâtiment, nettoyage, paysagisme…) |
| Studio | Travail de bureau (agence web, informatique, conseil, fiduciaire…) |
| Atelier | Les clients viennent chez vous (garage, menuiserie, réparation…) |

## Fichiers

| Fichier | Rôle |
|---|---|
| `supabase/migrations/20261013180000_relief.sql` | Table `relief_worlds`, module `relief`, types de notification. |
| `supabase/migrations/20261013200000_relief_answers.sql` | Réponses de l'onboarding (`relief_worlds.answers`). |
| `supabase/migrations/20261016100000_maquette.sql` | Étape de chaque projet (`relief_item_progress`, RLS membres), `relief_save_answers` (admin), nom du module. |
| `supabase/functions/relief-prefill/index.ts` | Lecture du site (http(s) publics seulement : pas d'IP, pas de noms locaux, 3 redirections, 600 ko par page), proposition des réponses par l'IA, rien n'est enregistré. Admin, option active, quota IA. |
| `supabase/functions/relief-build/index.ts` | Construction du monde (le process du responsable prime), notification, e-mail. |
| `lib/relief/stages.ts` | Types de projets, jours ouvrables, avancement, fin estimée, commande vocale (testé). |
| `lib/relief/process.ts` | Process type par métier, rôles proposés. |
| `lib/relief/types.ts` | Le plan (`ReliefSpec`), les types de projets, les données de la scène. |
| `lib/relief/data.ts` | Lecture des données, étape d'un projet, process, clôture, tâches, planning, lecture du site. |
| `lib/relief/globe.ts` | La planète three.js (textures, jour / nuit, Alpes en haute définition, lumières des projets, arcs, noms, toucher, zoom). |
| `lib/relief/sceneCss.ts` | Les noms des projets au-dessus de la planète. |
| `lib/relief/copy.ts` | Textes FR / DE / IT. |
| `components/relief/ReliefOnboardingDom.tsx` | Onboarding (site, process par type, frise), construction, échec. |
| `components/relief/ReliefDom.tsx` | Interface de la vue plein écran : fiche, tableau d'étapes, voix, éditeur de process. |
| `components/relief/PanoramaCard.tsx`, `PanoramaGlobeDom.tsx` | La planète en bas de l'accueil. |
| `public/globe/`, `scripts/panorama-alps.py`, `scripts/panorama-globe-data.mjs`, `lib/relief/globeData.ts` | Images de la Terre et des Alpes, contour suisse. |
| `components/relief/ReliefScreens.tsx` | Offre et note pour les non-admins. |
| `app/(app)/panorama.tsx` | La page plein écran ; `relief.tsx` et `maquette.tsx` redirigent. |

## Activer pour une entreprise

```sql
insert into organization_modules (organization_id, module_id, enabled, activated)
select '<organization_id>', id, true, false from modules where key = 'relief';
```

L'admin de l'entreprise l'active ensuite depuis la page `/panorama`.
