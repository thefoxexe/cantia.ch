# Reels Instagram — Cantia

Cinq Reels verticaux (1080 × 1920, 30 images/s, 10 à 14 secondes), dans `reels/`.
Style : coupes rapides calées sur 120 BPM (un plan par temps de 0,5 s), gros titres condensés qui frappent l’écran, vrais documents Cantia en 3D avec mouvements de caméra, étiquettes, flash à chaque coupe et grain de film. Choisissez une musique autour de 120 BPM pour que les coupes tombent sur le rythme.
Ils ont **leur propre son** : une petite musique à 120 BPM (kick, clap, basse, nappe en la mineur) et des bruitages calés sur l’image (whoosh à chaque coupe, impacts sur les gros titres, pop des étiquettes, tic-tac des chiffres, frappe au clavier, bip du scan, « ding » sur signé / payé / envoyé). Tout est synthétisé par `sound.py`, sans échantillon ni musique externe : aucun droit à gérer. Si vous préférez un son tendance d’Instagram, baissez le son d’origine à 0 dans l’éditeur.
Le texte important reste au centre de l’image, hors des zones couvertes par les boutons d’Instagram.

Rendu : `NODE_PATH=$(npm root -g) node render-reels.js` (source : `reels.html`, chaque Reel est une fonction du temps, rendue image par image puis encodée avec ffmpeg ; le son vient de `sound.py`, à partir des repères `window.events()`). `--preview` sort quelques images fixes pour vérifier un Reel, `--audio` refait seulement le son sur les vidéos existantes.

## 1 · Le devis — `cantia-reel-devis.mp4` (14 s)

Vos devis, le soir, à la main ? Stop ✋

Vous dictez les lignes, Cantia met vos prix du catalogue, calcule la TVA et les totaux. Le client signe sur son téléphone, sans compte.

👉 14 jours d’essai gratuit sur cantia.ch (lien en bio)

#Cantia #Devis #Artisan #Construction #Batiment #PME #Suisse #Romandie #LogicielSuisse

## 2 · La facture QR — `cantia-reel-facture.mp4` (10 s)

Votre client paie quand ? Dès qu’il scanne 📱

La facture QR suisse en un clic : montant, IBAN et référence déjà remplis. Vous importez votre relevé bancaire, Cantia voit ce qui est payé.

👉 cantia.ch (lien en bio)

#Cantia #QRFacture #Facture #PME #Artisan #Entrepreneur #Suisse #Romandie

## 3 · Le rapport de chantier — `cantia-reel-rapport.mp4` (13 s)

18h30, le rapport pas fait ? Une note vocale, l’IA rédige 🎙️

Vous relisez, il part au client. Et l’imprévu du jour est signalé, pour être facturé en travaux supplémentaires.

👉 cantia.ch (lien en bio)

#Cantia #RapportDeChantier #Chantier #Construction #IA #Artisan #Suisse #Romandie

## 4 · Le taux horaire — `cantia-reel-taux.mp4` (11 s)

Combien vaut vraiment votre heure ? ⏱️

Salaires, charges, frais, heures facturables et marge : notre calculateur gratuit vous donne le taux à facturer. Ici, 79.50 CHF de l’heure (exemple : 4 employés, 5’600.– de salaire, 120’000.– de frais).

👉 Gratuit, sans compte : cantia.ch/outils (lien en bio)

#Cantia #TauxHoraire #Artisan #Prix #Devis #PME #Suisse #Romandie

## 5 · Du brut au net — `cantia-reel-salaire.mp4` (11 s)

5’500.– brut. Combien en net ? 💸

AVS, chômage, LPP, accidents, allocations : 4’950.70 net par mois. Et pour l’employeur, 6’160.40 charges comprises (exemple : employé né en 1994, Vaud, célibataire, sans enfant).

👉 Le calculateur de salaire gratuit : cantia.ch/calculateur-salaire (lien en bio)

#Cantia #Salaire #SalaireNet #AVS #LPP #RH #PME #Suisse #Romandie

## À vérifier avant de publier

- Les chiffres des Reels 4 et 5 sont ceux affichés par les vrais calculateurs avec leurs valeurs d’exemple. Ce sont des exemples, présentés comme tels dans les descriptions.
- Les documents (devis, facture, rapport) sont les exemples de cantia.ch.
- Couverture : dans Instagram, choisissez la première image (le gros titre) ou la carte de fin.
