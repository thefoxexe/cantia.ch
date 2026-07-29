# Fixtures CRBX

⚠️ **Ce dossier est gitignoré.** Le Catalogue des Articles Normalisés (CAN/NPK)
appartient au CRB — on ne commit jamais de fichier `.crbx` réel, même dans un
repo privé. C'est un dossier de travail local uniquement.

## Comment obtenir des fichiers de test

Viser 3 à 5 fichiers de sources différentes, dont au moins un avec prix
(offre) et un sans (descriptif) :

- **RUWA AG** — descriptifs types CAN chapitre 241 (béton armé), `.crbx` et `.01S`
- **GTSM Magglingen** — chapitre 182 (équipements d'aires de jeux)
- Un export depuis n'importe quel logiciel licencié (Messerli, Sorba,
  Baubit/ABBF, Bau-Data, BRZ…) — école, bureau, connaissance

## Convention de nommage local

```
fixtures/
  01-ruwa-241-devis.crbx
  02-ruwa-241-01S.01S
  03-gtsm-182-descriptif.crbx
  ...
```

## Une fois les fichiers déposés ici

```bash
npx tsx lib/crbx/cli.ts inspect fixtures/01-ruwa-241-devis.crbx
```

Ça sort la reconnaissance brute (type de conteneur, encodage, arbre des
balises) à reporter dans `docs/crbx-format.md` — observé, jamais deviné.
