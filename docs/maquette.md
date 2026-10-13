# Ma maquette (prototype)

La maquette 3D d'une entreprise : ses chantiers posés sur une petite île, construits selon leur phase, reliés au dépôt par des routes où roulent les camions, avec les équipes du jour sur place. Au clic, la fiche du chantier : avancement, budget prévu et dépensé, écart, fin prévue, qui est sur place, tâches ouvertes, alertes.

## État actuel

- Page `/maquette` dans l'app (non liée au menu), sur des **données d'exemple** (`lib/maquette/sample.ts`).
- Thème : construction uniquement. Textes en français.
- Web (ordinateur) d'abord. Le composant est un composant DOM Expo (`'use dom'`), il pourra tourner dans l'app téléphone.

## Fichiers

| Fichier | Rôle |
|---|---|
| `lib/maquette/types.ts` | Le « plan » de maquette : ce que la scène montre et ce que chaque élément porte. |
| `lib/maquette/sample.ts` | L'entreprise d'exemple (Démo Bâtiment SA). |
| `lib/maquette/engine.ts` | La scène three.js : île, Alpes, lac, rivière, routes, dépôt, chantiers par phase (terrassement, gros œuvre avec grue, second œuvre, finitions, réception), camions, ouvriers, étiquettes, caméra. |
| `components/maquette/MaquetteDom.tsx` | L'interface autour : chiffres du jour, liste des chantiers, fiche du chantier, légende. |
| `app/(app)/maquette.tsx` | La page. |

## Suite prévue

1. Brancher les vraies données (chantiers, planning du jour, budgets, tâches).
2. Placer les chantiers d'après leur adresse (géolocalisation à ajouter).
3. Questions de l'IA à la première ouverture, qui produisent le plan de maquette.
4. Autres métiers (nettoyage, garage, paysagiste, bureau), avec leur propre décor et leurs étapes.
5. Entrée « Voir ma maquette » sur le tableau de bord, version téléphone allégée.

Pour revenir en arrière : supprimer ces fichiers et la dépendance `three`, rien d'autre n'en dépend.
