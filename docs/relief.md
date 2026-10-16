# Cantia Relief

L'entreprise en maquette 3D vivante. Le responsable dicte (ou écrit) son métier et sa façon de travailler ; l'IA choisit un modèle de monde, l'habille avec les mots de l'entreprise et les étapes de son process ; la scène est ensuite alimentée en direct par les vraies données : projets, planning du jour, tâches, chiffres.

Option payante (module privé `relief`) : accordée par l'admin plateforme (`organization_modules.enabled`), puis activée par l'admin de l'entreprise (`activated`).

## Parcours

1. **Offre** (`ReliefLocked`) tant que l'option n'est pas activée ; bouton « Activer » si elle est accordée et que l'utilisateur est admin.
2. **Onboarding** (`ReliefOnboardingDom`, avec aperçu 3D en direct qui change à chaque réponse) : accueil, puis 5 étapes comme dans une vraie entreprise :
   1. Activité en une phrase + modèle (suggéré d'après le secteur, modifiable).
   2. Process : étapes d'un projet (nom, responsable, durée, validation client), à réordonner ; préremplies selon le métier (`lib/relief/process.ts`).
   3. Équipe : le rôle de chaque membre.
   4. Facturation : devis systématique ou non, quand on facture (à la fin, acompte, par étape, mensuel).
   5. Récit libre, dicté au micro ou écrit.
   Puis un récapitulatif modifiable. Les réponses sont gardées (`relief_worlds.answers`) pour « Refaire mon Relief ».
3. **Construction** (même écran, aperçu animé) : la fonction `relief-build` répond tout de suite (202) et travaille en arrière-plan. À la fin : notification dans l'app + e-mail « Cantia <noreply@cantia.ch> » avec le lien vers `/relief`. La page suit la ligne `relief_worlds` en temps réel (et toutes les 15 s en secours).
4. **Le monde** (`ReliefDom`) en plein écran. Ordinateur : en-tête, liste à gauche, fiche à droite. Téléphone : la 3D occupe l'écran, liste et fiche dans une feuille en bas (aperçu des projets en bande, liste dépliable, fiche à 68 % de l'écran) ; la caméra se centre dans la zone libre (`setInsets`).
   La fiche d'un projet est son dossier complet, selon les droits :
   - **Aperçu** : process avec responsable, durée et validations client, avancement, dates, phase du planning de chantier, devis acceptés et facturé (si devis/finances), dépenses (si finances), équipe du jour.
   - **Tâches** : cocher / décocher, ajouter, terminées repliées.
   - **Planning** : les 7 prochains jours par personne ; planifier quelqu'un un jour donné (admin ou droit planning).
   - **Facturation** (droit devis ou finances) : devis et factures du projet avec statut, montant, payé / reste, échéance ; nouveau devis / nouvelle facture préremplis avec le projet ; dépenses et facturé − dépenses (finances).
   - **Dossier** : liens vers fil, rapports, planning de chantier, documents, photos, métré, sous-traitants, rentabilité, travaux supplémentaires, situations — mêmes règles que la page du projet.
   « Refaire mon Relief » rouvre l'onboarding avec les réponses précédentes.

## Identité : une carte suisse

Le Relief se lit comme une feuille de carte nationale, pas comme un tableau de bord générique :

- **Lieu de l'entreprise** (`lib/relief/geo.ts`) : à partir de `organizations.locality`, géocodage (open-meteo, mis en cache), coordonnées suisses LV95, altitude, canton. Le cartouche du Relief et la carte de l'accueil les affichent (ex. « Valais · 491 m · 2 593 979 / 1 120 187 »).
- **Repères locaux en 3D** : derrière l'île, une bande de terrain avec le monument de la ville et l'horizon du lieu ; devant, le lac ou la rivière avec leur nom. Villes connues : Lausanne (cathédrale, Léman, Alpes de Savoie), Genève (Jet d'eau, Léman, Salève), Sion (Valère et Tourbillon, vignes, Rhône, Alpes valaisannes), Zurich (Grossmünster, lac), Berne (Zytglogge, Aar, Eiger · Mönch · Jungfrau), Bâle (Münster, Rhin), Lucerne (Kapellbrücke), Montreux / Vevey (Chillon), Fribourg, Neuchâtel, Delémont (Porte au Loup, Sorne, Jura), Bienne, Lugano, Nyon, Martigny, Sierre, etc. Ailleurs : l'horizon d'après le canton (Alpes, Préalpes, Jura, collines) et une vieille ville générique.
- **Lettrage de carte** : noms de projets en annotations avec trait de rappel (pas de bulles), eaux en italique bleu, lieux en capitales espacées, horizon en italique ; les noms qui se chevauchent sont éclaircis automatiquement (priorité aux retards, puis au premier plan).
- **Habillage** : cartouche, légende, flèche du nord, « Relief schématique — pas à l'échelle » ; angles nets, filets fins, chiffres en chasse fixe. Carte de l'accueil : cadre gradué en coordonnées, courbes de niveau, cartouche crème, journal d'activité.

## Ville vivante

Le moteur (`lib/relief/engine.ts`) ajoute à chaque modèle :

- **Câbles de données** du siège (antenne qui clignote, ondes au sol) vers chaque projet ; couleur selon l'état (normal, tâche en retard, en retard, terminé). Des impulsions partent vers le projet — plus il y a de tâches ouvertes et de personnes, plus il y en a — et une impulsion verte revient quand le projet avance.
- **Balises** : ondes rouges et faisceau lumineux sur les projets en retard, ondes ambre sur ceux qui ont une tâche en retard.
- **Circulation** dans les rues (Studio) et sur la route principale (Territoire), lampadaires.
- **Mode nuit** (bouton lune / soleil dans le Relief, mémorisé sur l'appareil) : lumière lunaire, fenêtres allumées, phares, halos des lampadaires, câbles lumineux.
- **Pourcentage d'avancement** dans l'étiquette de chaque projet ; jauges flottantes quand les étiquettes sont masquées (carte de l'accueil).

## Sur l'accueil

Quand l'option est active, l'accueil montre la carte « Cantia Relief » (`components/relief/ReliefDashboardCard.tsx` + `ReliefPeekDom.tsx`) : la ville de l'entreprise de nuit, qui tourne doucement, avec câbles, impulsions, balises, circulation et jauges ; les chiffres du jour qui défilent jusqu'à leur valeur (projets en cours, planifiés aujourd'hui, avancement moyen, retards — jamais de montants) ; le fil d'activité des 14 derniers jours qui tourne (tâches terminées, planifications, nouveaux projets, factures payées si la personne y a droit, `loadReliefActivity`) ; un clic ouvre le Relief. Mise à jour en direct. Avant la première construction : esquisse du process type du métier et « Créer mon Relief ».

## Modèles

| Modèle | Pour qui | Un projet c'est… |
|---|---|---|
| Territoire | On travaille chez le client (bâtiment, nettoyage, paysagisme…) | Un site relié au dépôt par une route ; il se construit selon l'étape. |
| Studio | Travail de bureau (agence web, informatique, conseil, fiduciaire…) | Un bâtiment qui gagne un étage à chaque étape du process. |
| Atelier | Les clients viennent chez vous (garage, menuiserie, réparation…) | Un poste de l'atelier avec l'objet traité. |

## Données

- Avancement : planning de chantier (Gantt) pondéré par durée, sinon ratio des tâches faites, sinon dates de début / fin.
- Statut : en retard si la date de fin est passée, à surveiller si une tâche ouverte est échue, terminé si le projet est terminé.
- Équipe du jour : `planning_assignments` qui couvrent aujourd'hui. Personne sans projet → au dépôt / bureau / atelier.
- Chiffres (devis acceptés, factures envoyées, dépenses) seulement pour qui voit les finances.
- Moins de 3 projets : la scène ajoute les exemples proposés par l'IA, marqués « Exemple ».
- Rechargement automatique (temps réel) quand projets, planning ou tâches changent.

## Fichiers

| Fichier | Rôle |
|---|---|
| `supabase/migrations/20261013180000_relief.sql` | Table `relief_worlds`, module `relief`, types de notification. |
| `supabase/migrations/20261013200000_relief_answers.sql` | Réponses de l'onboarding (`relief_worlds.answers`). |
| `lib/relief/process.ts` | Process type par métier (étapes, responsables, durées), rôles proposés. |
| `lib/relief/sceneCss.ts` | Style des étiquettes posées sur la scène. |
| `components/relief/ReliefOnboardingDom.tsx` | Onboarding, construction, échec (composant DOM, aperçu 3D). |
| `supabase/functions/relief-build/index.ts` | Vérifications (admin, option, quota IA), appel IA avec les réponses structurées (le process du responsable prime), nettoyage du plan, notification, e-mail. |
| `lib/relief/types.ts` | Le plan (`ReliefSpec`) et les données de la scène. |
| `lib/relief/data.ts` | Lecture des vraies données et du dossier d'un projet, écritures (tâche, cocher, planning). |
| `lib/relief/engine.ts` | La scène three.js des 3 modèles. |
| `lib/relief/copy.ts` | Textes FR / DE / IT. |
| `components/relief/ReliefDom.tsx` | Interface autour de la scène (composant DOM Expo). |
| `components/relief/ReliefDashboardCard.tsx`, `ReliefPeekDom.tsx` | Carte de l'accueil (aperçu 3D vivant). |
| `lib/relief/preview.ts` | Monde esquissé à partir des réponses (onboarding, carte de l'accueil). |
| `components/relief/ReliefScreens.tsx` | Offre et note pour les non-admins. |
| `app/(app)/relief.tsx` | La page, plein écran (sans menu, voir `app/(app)/_layout.tsx`). |

## Activer pour une entreprise

```sql
insert into organization_modules (organization_id, module_id, enabled, activated)
select '<organization_id>', id, true, false from modules where key = 'relief';
```

L'admin de l'entreprise l'active ensuite depuis la page `/relief`.
