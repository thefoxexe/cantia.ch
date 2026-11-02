# Reels Instagram — Cantia

Cinq Reels verticaux (1080 × 1920, 30 images/s, 13 à 15 secondes), dans `reels/`.

Direction : un film produit plutôt qu’un Reel « effets ». Fond crème, beaucoup d’espace, un plan par idée (environ 3 secondes), titres en phrases révélés ligne par ligne, caméra lente sur le vrai document Cantia, détails entourés d’un trait fin qui se dessine, et une courte légende éditoriale sous l’image. Le logo et le nom de la rubrique restent en haut, avec une fine barre de progression. Pas de flash, pas de tremblement, pas d’emoji.

Son : uniquement un glissement doux à chaque changement de plan (`slide-sound.py`, fait sur mesure, sans musique ni droits à gérer). Vous pouvez ajouter une musique calme dans Instagram par-dessus, à volume modéré. Tout le texte se lit sans le son.

Rendu : `NODE_PATH=$(npm root -g) node render-reels.js` (source : `reels.html`, chaque Reel est une fonction du temps, rendue image par image puis encodée avec ffmpeg). `--preview` sort quelques images fixes pour vérifier un Reel, `--sound` refait seulement le son sur les vidéos existantes.

## 1 · Le devis — `cantia-reel-devis.mp4` (15 s)

Un devis prêt avant de quitter le chantier.

Vous dictez les lignes, Cantia met vos prix du catalogue, calcule la TVA et les totaux. Le client signe sur son téléphone, sans compte.

👉 14 jours d’essai gratuit sur cantia.ch (lien en bio)

#Cantia #Devis #Artisan #Construction #Batiment #PME #Suisse #Romandie #LogicielSuisse

## 2 · La facture QR — `cantia-reel-facture.mp4` (14 s)

Une facture que le client paie en un scan.

La facture QR suisse en un clic : montant, IBAN et référence déjà remplis. Vous importez votre relevé bancaire, Cantia voit ce qui est payé.

👉 cantia.ch (lien en bio)

#Cantia #QRFacture #Facture #PME #Artisan #Entrepreneur #Suisse #Romandie

## 3 · Le rapport de chantier — `cantia-reel-rapport.mp4` (14 s)

Le rapport du jour, dicté en rangeant les outils.

Vous relisez, il part au client. Et l’imprévu du jour est signalé, pour être facturé en travaux supplémentaires.

👉 cantia.ch (lien en bio)

#Cantia #RapportDeChantier #Chantier #Construction #IA #Artisan #Suisse #Romandie

## 4 · Le taux horaire — `cantia-reel-taux.mp4` (13 s)

Votre taux horaire, calculé sur vos vrais coûts.

Salaires, charges, frais, heures facturables et marge : notre calculateur gratuit vous donne le taux à facturer. Ici, 79.50 CHF de l’heure (exemple : 4 employés, 5’600.– de salaire, 120’000.– de frais).

👉 Gratuit, sans compte : cantia.ch/outils (lien en bio)

#Cantia #TauxHoraire #Artisan #Prix #Devis #PME #Suisse #Romandie

## 5 · Du brut au net — `cantia-reel-salaire.mp4` (13,5 s)

5’500.– brut. Ce qu’il reste à votre employé.

AVS, chômage, LPP, accidents, allocations : 4’950.70 net par mois. Et pour l’employeur, 6’160.40 charges comprises (exemple : employé né en 1994, Vaud, célibataire, sans enfant).

👉 Le calculateur de salaire gratuit : cantia.ch/calculateur-salaire (lien en bio)

#Cantia #Salaire #SalaireNet #AVS #LPP #RH #PME #Suisse #Romandie

## À vérifier avant de publier

- Les chiffres des Reels 4 et 5 sont ceux affichés par les vrais calculateurs avec leurs valeurs d’exemple. Ce sont des exemples, présentés comme tels dans les descriptions.
- Les documents (devis, facture, rapport) sont les exemples de cantia.ch.
- Couverture : dans Instagram, choisissez l’image où le titre est entièrement affiché (vers 1,5 s) ou la carte de fin.
