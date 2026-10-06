# Planning de chantier (Gantt)

Ce document décrit ce qui est livré par rapport au cahier des charges « Planning de chantier Cantia » v1.0 : le MVP, plus le modèle Villa et le recalcul en cascade.

Le module est réservé aux entreprises du secteur « Construction & bâtiment ». Il apparaît d'office sur chaque chantier, sous le nom « Planning de chantier ».

## Fichiers

- Base de données : `supabase/migrations/20261007160000_site_schedules.sql`. Elle contient :
  - les tables (planning, lignes, liens fin → début, corps de métier de l'entreprise, historique) ;
  - les droits : lecture pour toute personne qui a accès au chantier, modification réservée aux entreprises du bâtiment, suppression du planning réservée aux administrateurs ;
  - les contrôles : une ligne ne peut être rangée que dans une phase, et une dépendance circulaire est refusée.
- Règles de calcul (`lib/schedule/calc.ts`, testé dans `scripts/schedule.test.mjs`) :
  - jours ouvrables ;
  - début / fin / durée : deux valeurs données, la troisième est calculée ;
  - retards ;
  - avancement d'une phase, pondéré par la durée de ses tâches ;
  - recalcul en cascade proposé ;
  - détection des boucles.
- Écran : `app/(app)/chantiers/[id]/gantt.tsx`, avec `components/schedule/GanttView.tsx` et `components/schedule/ItemSheet.tsx`.
- Export PDF : `lib/schedule/pdf.ts` (A3 paysage, généré dans le navigateur avec pdf-lib).

## Comportement

- **Lignes** : phase, sous-phase (une phase dans une phase), tâche ou jalon. On peut ajouter, modifier, dupliquer, monter / descendre, mettre dans la phase au-dessus, remonter d'un niveau, supprimer. La suppression d'une phase non vide demande une confirmation.
- **Champs** : tous ceux du §4.3. Les corps de métier partent de la liste de base, et l'entreprise peut en ajouter.
- **Vue Gantt** :
  - zoom jour / semaine / mois et bouton « aujourd'hui » ;
  - week-ends grisés, ligne du jour ;
  - avancement affiché dans la barre ;
  - retards en rouge, conflits de dépendance signalés ;
  - flèches de dépendance affichables ou masquables ;
  - plan initial tracé sous la barre quand les dates ont bougé ;
  - filtres : masquer les tâches terminées, n'afficher que les retards, filtrer par corps de métier.
- **Ordinateur** : glisser une barre déplace la tâche en gardant sa durée ; tirer son bord droit change sa fin et recalcule la durée.
- **Téléphone** : liste en lecture seule.
- **Dépendances** : lien fin → début uniquement. Après un changement de dates, Cantia liste les tâches à décaler et demande avant d'appliquer. Une tâche à date fixe ou déjà terminée n'est pas déplacée : elle est signalée comme conflit.
- **Suivi** :
  - passage « en cours » : la date réelle de début est enregistrée, et le plan initial est conservé ;
  - passage « terminé » : la date réelle de fin est enregistrée, et l'avancement passe à 100 %.
- **Historique** : sont enregistrés les dates, la durée, le statut, l'avancement, l'entreprise, le responsable, le corps de métier, les dépendances, ainsi que les créations et les suppressions.

## Pas encore fait (versions suivantes du cahier)

- Modèles enregistrés par l'entreprise.
- Export Excel / CSV et import (Excel, MS Project).
- Partage en lecture seule par lien.
- Notifications d'échéance.
- Jours fériés cantonaux.
- Réglage des jours travaillés dans l'écran. La colonne existe déjà ; par défaut, du lundi au vendredi.
- Liens vers les documents et photos du chantier.
- Types de dépendance autres que fin → début, chemin critique, charge des équipes.
