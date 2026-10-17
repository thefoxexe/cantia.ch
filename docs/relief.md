# Cantia Maquette

(Nom de code dans le code et la base : `relief`. Allemand : Cantia Modell ; italien : Cantia Plastico.)

L'entreprise en maquette 3D vivante. Le process de l'entreprise est prérempli d'après son site internet, le responsable le corrige (types de projets, étapes, durées habituelles et minimales) ; l'IA choisit un modèle de monde et l'habille avec les mots de l'entreprise ; la scène est ensuite alimentée en direct par les vraies données : projets à leur étape, équipes du jour qui partent sur leurs projets, tâches, chiffres.

Option payante (module privé `relief`) : accordée par l'admin plateforme (`organization_modules.enabled`), puis activée par l'admin de l'entreprise (`activated`).

## Où on la trouve

Sur l'accueil, juste sous les boutons rapides, quand l'option est active (`components/relief/MaquetteCard.tsx` + `MaquetteCardDom.tsx`) : le petit monde de l'entreprise qui tourne tout seul (équipes qui partent sur leurs projets, bâtiments à leur étape, effet maquette) ; à côté, qui est sur le terrain aujourd'hui et où, la « ligne d'horizon » du process (combien de projets à chaque étape), projets en cours / en retard / à surveiller, et « Entrer dans la maquette ». Toute la carte est cliquable et ouvre `/maquette` en plein écran. Mise à jour en direct (projets, étapes, planning, tâches). Avant la première construction : le process type du métier en esquisse et « Créer la maquette ». Jamais de montants sur l'accueil. L'ancienne adresse `/relief` redirige.

## Parcours

1. **Offre** (`ReliefLocked`) tant que l'option n'est pas activée ; bouton « Activer » si elle est accordée et que l'utilisateur est admin.
2. **Onboarding** (`ReliefOnboardingDom`, aperçu 3D en direct qui change à chaque réponse) :
   - **Le site** : l'adresse du site (reprise de `organizations.website`) ; « Lire mon site » appelle `relief-prefill`, qui lit la page d'accueil et jusqu'à 3 pages (prestations, à propos, méthode…) et propose les réponses. Pendant la lecture : liste d'étapes animée et balayage de la maquette. Ensuite « Voici ce que nous avons compris » : activité, points compris, types de projets trouvés avec leur frise. On peut aussi continuer sans site.
   - 5 étapes à vérifier, marquées « D'après votre site » quand elles viennent du site :
     1. Activité en une phrase + modèle (Territoire / Studio / Atelier).
     2. Process **par type de projet** (jusqu'à 4 types, ex. « Site vitrine » et « Boutique en ligne ») : étapes (nom, responsable, validation client), **durée habituelle** et **durée minimum** en jours ouvrables, frise proportionnelle aux durées (minimum hachuré, validations client marquées).
     3. Équipe : le rôle de chaque membre.
     4. Facturation : devis systématique ou non, quand on facture.
     5. Récit libre, dicté ou écrit (prérempli d'après le site).
   - Récapitulatif modifiable. Les réponses sont gardées (`relief_worlds.answers`).
3. **Construction** : `relief-build` répond tout de suite (202) et travaille en arrière-plan. À la fin : notification + e-mail « Cantia <noreply@cantia.ch> » avec le lien vers `/maquette`.
4. **La maquette** (`ReliefDom`) en plein écran. Ordinateur : cartouche, liste à gauche, fiche à droite. Téléphone : la 3D occupe l'écran, liste et fiche dans une feuille en bas. Tablette / petit écran : boutons en icônes, sans légende.

## Faire avancer un projet

- **Au clic** : la fiche commence par un tableau d'étapes (« Étape 2 sur 5 · Conception ») : depuis combien de jours, durée prévue, minimum, dépassement ; un rail des étapes proportionnel aux durées — toucher une étape y place le projet ; bouton « Étape terminée → Passer à « … » ». Avant le minimum, une confirmation est demandée. À la dernière étape : « Clôturer le projet » (passe le projet en terminé, admin ou droit de créer des projets).
- **À la voix** : bouton « Dire » (en-tête) : « Villa Dupont : gros œuvre terminé, on passe au second œuvre ». Le projet est trouvé par son nom (ou c'est celui ouvert), l'étape par son libellé, l'intention par quelques mots en FR/DE/IT (terminé, on passe à, fertig, jetzt, finito, passiamo a…). Parseur pur testé : `lib/relief/stages.ts`, `npm run test:maquette`.
- **Type de projet** : choisi dans la fiche quand il y en a plusieurs ; sinon deviné d'après le nom du projet.
- Tout membre peut faire avancer un projet (comme cocher une tâche) ; l'historique garde qui et quand (`relief_item_progress.history`).
- La maquette suit : le bâtiment / le site / le poste se reconstruit à la nouvelle étape et « saute » avec un anneau.
- **Process éditable** depuis la maquette (bouton « Process », admin) : types, étapes, durées habituelles et minimales ; enregistré sans reconstruction (`relief_save_answers`). « Refaire ma maquette » est dans ce panneau.

## Calculs

- Étape suivie (ligne `relief_item_progress`) : avancement = jours des étapes passées + jours passés dans l'étape (au plus 90 % de sa durée) / durée totale du process ; « à surveiller » si l'étape dépasse sa durée habituelle ou si la fin estimée dépasse la date de fin du projet ; fin estimée = reste de l'étape + étapes suivantes, en jours ouvrables.
- Étape non suivie : comme avant (planning de chantier pondéré, sinon tâches faites, sinon dates), affichée « Étape estimée ».
- En retard : date de fin passée. Terminé : projet terminé.

## Les équipes du jour

Chaque personne planifiée aujourd'hui sur un projet est une figurine (jambes et bras articulés, casque en Territoire, initiales au-dessus pendant le trajet) :

- **Territoire** : une camionnette part du dépôt et roule jusqu'au chantier, se gare au portail ; l'équipe descend et va à son poste. Au-delà de 6 camionnettes, à pied le long de la route.
- **Studio** : sortie du bureau, à pied par les rues jusqu'au bâtiment.
- **Atelier** : du bureau par les allées jusqu'au poste.
- Sur place : l'un fait des allers-retours, l'autre travaille (marteau). Seuls les nouveaux arrivants refont le trajet quand les données changent.

## Identité : une carte suisse

- **Lieu de l'entreprise** (`lib/relief/geo.ts`) : géocodage de `organizations.locality`, coordonnées LV95, altitude, canton dans le cartouche.
- **Repères locaux en 3D** : monument et horizon de la ville derrière l'île, lac ou rivière devant (Lausanne, Genève, Sion, Zurich, Berne, Bâle, Lucerne, Montreux / Vevey, Fribourg, Neuchâtel, Delémont, Bienne, Lugano…).
- **Lettrage de carte**, légende, flèche du nord, « Maquette schématique — pas à l'échelle ».
- **Effet maquette** (tilt-shift) : le haut et le bas de l'image sont flous comme une photo de vraie maquette (sous les noms, pas dessus).
- Mode nuit, câbles de données, balises, circulation : voir le moteur (`lib/relief/engine.ts`).

## Modèles

| Modèle | Pour qui | Un projet c'est… |
|---|---|---|
| Territoire | On travaille chez le client (bâtiment, nettoyage, paysagisme…) | Un site relié au dépôt par une route ; il se construit selon l'étape. |
| Studio | Travail de bureau (agence web, informatique, conseil, fiduciaire…) | Un bâtiment qui gagne un étage à chaque étape du process. |
| Atelier | Les clients viennent chez vous (garage, menuiserie, réparation…) | Un poste de l'atelier avec l'objet traité. |

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
| `lib/relief/engine.ts` | La scène three.js (figurines, trajets, camionnettes, tilt-shift…). |
| `lib/relief/copy.ts` | Textes FR / DE / IT. |
| `components/relief/ReliefOnboardingDom.tsx` | Onboarding (site, process par type, frise), construction, échec. |
| `components/relief/ReliefDom.tsx` | Interface de la maquette : fiche, tableau d'étapes, voix, éditeur de process. |
| `components/relief/MaquetteCard.tsx`, `MaquetteCardDom.tsx` | La carte de l'accueil. |
| `components/relief/ReliefScreens.tsx` | Offre et note pour les non-admins. |
| `app/(app)/maquette.tsx` | La page plein écran ; `app/(app)/relief.tsx` redirige. |

## Activer pour une entreprise

```sql
insert into organization_modules (organization_id, module_id, enabled, activated)
select '<organization_id>', id, true, false from modules where key = 'relief';
```

L'admin de l'entreprise l'active ensuite depuis la page `/maquette`.
