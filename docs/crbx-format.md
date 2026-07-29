# Format CRBX / IfA18 — observations

> **Ce document doit être rempli à partir de vrais fichiers `.crbx` inspectés
> avec `lib/crbx/cli.ts inspect`, jamais deviné.** Tant qu'il est vide, aucun
> parser/builder n'est écrit — voir `AGENTS.md` / brief CRBX pour la règle.
>
> Statut : **⛔ non rempli — en attente de fichiers `.crbx` réels.**

## 0. Fichiers inspectés

| Fichier | Source | Logiciel d'origine | Avec prix ? | Date d'inspection |
|---|---|---|---|---|
| _(aucun pour l'instant)_ | | | | |

## 1. Conteneur

- [ ] Type : fichier XML seul, ou archive ZIP (pièces jointes/images) ?
- [ ] Extension réelle vs déclarée
- [ ] Sortie de `file <sample>` :
- [ ] Si ZIP, sortie de `unzip -l <sample>` :

## 2. Encodage

- [ ] Encodage déclaré (`<?xml version="1.0" encoding="..."?>`)
- [ ] Encodage réel observé (BOM ? `xxd` sur les premiers octets)
- [ ] Cohérents entre eux ?

## 3. Arbre des éléments

- [ ] Sortie de `xmllint --format` sur un extrait représentatif
- [ ] Fréquence des balises (`grep -oP '<\w+' | sort | uniq -c | sort -rn`)
- [ ] Cardinalités (0..1, 0..n, 1..n) par niveau

## 4. Localisation des données clés

| Donnée | Élément / attribut XML | Notes |
|---|---|---|
| N° de chapitre | | |
| N° de position (référence CAN complète) | | |
| Texte court | | |
| Texte long | | |
| Unité | | |
| Quantité | | |
| Prix unitaire | | |
| Prix total | | |
| Taux de TVA | | |

## 5. Représentation des cas particuliers

- [ ] Variantes / options — comment marquées ? Entrent-elles dans le total ?
- [ ] Positions en régie
- [ ] Remarques préliminaires
- [ ] Titres / sous-totaux
- [ ] Positions non chiffrées (sans quantité/prix)

## 6. Codes de rattachement

- [ ] CFC présent ? Où ?
- [ ] eCCC-Bât / eBKP présent ? Où ?

## 7. Multilinguisme

- [ ] Langue déclarée où (niveau document, pas position) ?
- [ ] Valeurs observées (FR/DE/IT) ?

## 8. Version IfA

- [ ] Élément/attribut portant le numéro de version IfA
- [ ] Valeur(s) observée(s)
- [ ] Comportement si version inconnue/future (à décider : avertir, ne jamais planter)

## 9. Arrondis

- [ ] Le total du fichier correspond-il au centime près à qté × PU par position, sommé ?
- [ ] Arrondi par position ou par sous-total/chapitre ?

## 10. Éléments non compris / à préserver tels quels

- [ ] Lister tout élément dont le rôle n'est pas clair — doit ressortir identique au round-trip malgré tout.
