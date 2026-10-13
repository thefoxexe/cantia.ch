# Cantia Relief

L'entreprise en maquette 3D vivante. Le responsable dicte (ou écrit) son métier et sa façon de travailler ; l'IA choisit un modèle de monde, l'habille avec les mots de l'entreprise et les étapes de son process ; la scène est ensuite alimentée en direct par les vraies données : projets, planning du jour, tâches, chiffres.

Option payante (module privé `relief`) : accordée par l'admin plateforme (`organization_modules.enabled`), puis activée par l'admin de l'entreprise (`activated`).

## Parcours

1. **Offre** (`ReliefLocked`) tant que l'option n'est pas activée ; bouton « Activer » si elle est accordée et que l'utilisateur est admin.
2. **Onboarding** (`ReliefOnboarding`) : les 3 modèles, puis la description (dictée par micro ou texte, 20 caractères minimum).
3. **Construction** (`ReliefBuilding`) : la fonction `relief-build` répond tout de suite (202) et travaille en arrière-plan. À la fin : notification dans l'app + e-mail « Cantia <noreply@cantia.ch> » avec le lien vers `/relief`. La page suit la ligne `relief_worlds` en temps réel (et toutes les 15 s en secours).
4. **Le monde** (`ReliefDom`) en plein écran : liste à gauche, clic sur un élément → fiche (étapes, avancement, dates, chiffres si autorisé, équipe du jour, tâches). Depuis la fiche : ajouter une tâche, planifier quelqu'un aujourd'hui, ouvrir le dossier dans Cantia. « Refaire mon Relief » relance l'onboarding.

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
| `supabase/functions/relief-build/index.ts` | Vérifications (admin, option, quota IA), appel IA, nettoyage du plan, notification, e-mail. |
| `lib/relief/types.ts` | Le plan (`ReliefSpec`) et les données de la scène. |
| `lib/relief/data.ts` | Lecture des vraies données, écritures (tâche, planning). |
| `lib/relief/engine.ts` | La scène three.js des 3 modèles. |
| `lib/relief/copy.ts` | Textes FR / DE / IT. |
| `components/relief/ReliefDom.tsx` | Interface autour de la scène (composant DOM Expo). |
| `components/relief/ReliefScreens.tsx` | Offre, onboarding, construction, échec. |
| `app/(app)/relief.tsx` | La page, plein écran (sans menu, voir `app/(app)/_layout.tsx`). |

## Activer pour une entreprise

```sql
insert into organization_modules (organization_id, module_id, enabled, activated)
select '<organization_id>', id, true, false from modules where key = 'relief';
```

L'admin de l'entreprise l'active ensuite depuis la page `/relief`.
