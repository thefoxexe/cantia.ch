# Vidéos tutoriels Cantia

Une vidéo YouTube (1920×1080, environ 31 secondes) et un réel Instagram (1080×1920, environ 20 secondes) pour chacun des 41 tutoriels (Super Admin › Tutoriels). Elles sont sans voix : chaque étape est écrite à l’écran, sur un vrai écran de Cantia pris dans la démo (entreprise fictive Atelier Martin SA). La piste son est muette : ajoutez une musique sur YouTube ou Instagram si vous le souhaitez.

Ce dossier ne fait partie d’aucun site : rien ici n’est copié dans cantia.ch, app.cantia.ch, la démo, partners ou accounting.

Le titre, la description et la miniature YouTube de chaque vidéo se trouvent dans Super Admin › Tutoriels.

## Refaire les vidéos

1. Lancer la démo : `EXPO_PUBLIC_DEMO=1 CI=1 BROWSER=none npx expo start --web --port 8098`
2. Reprendre les écrans (dans `screens/`) : `node scripts/videos/capture-screens.cjs`
3. Rendre les vidéos : `node scripts/videos/make-tutorial-videos.mjs` (options : `--only 5,12`, `--format youtube` ou `reel`, `--jobs 3`)

Les textes des étapes se modifient dans `scripts/videos/chapters.mjs`. Il faut Playwright (Chromium) et ffmpeg.

Quand la démo n’a rien à montrer pour une étape (module vide dans la démo), l’étape est présentée sur un fond uni avec son numéro et l’endroit où la trouver dans Cantia, sans fausse interface.

## Liste

| N° | Domaine | Titre | YouTube | Réel |
|---|---|---|---|---|
| 01 | Démarrage | Créer son compte Cantia et démarrer en 5 minutes | [youtube/01-creer-son-compte.mp4](youtube/01-creer-son-compte.mp4) | [reels/01-creer-son-compte.mp4](reels/01-creer-son-compte.mp4) |
| 02 | Démarrage | Installer Cantia sur son téléphone, iPhone ou Android | [youtube/02-installer-sur-telephone.mp4](youtube/02-installer-sur-telephone.mp4) | [reels/02-installer-sur-telephone.mp4](reels/02-installer-sur-telephone.mp4) |
| 03 | Démarrage | Reprendre ses clients et ses devis depuis Excel ou un ancien logiciel | [youtube/03-importer-ses-donnees.mp4](youtube/03-importer-ses-donnees.mp4) | [reels/03-importer-ses-donnees.mp4](reels/03-importer-ses-donnees.mp4) |
| 04 | Démarrage | Des devis et factures à votre image : logo, signature, numérotation | [youtube/04-logo-signature-numerotation.mp4](youtube/04-logo-signature-numerotation.mp4) | [reels/04-logo-signature-numerotation.mp4](reels/04-logo-signature-numerotation.mp4) |
| 05 | Devis | Créer un devis à la voix, sur le chantier | [youtube/05-devis-a-la-voix.mp4](youtube/05-devis-a-la-voix.mp4) | [reels/05-devis-a-la-voix.mp4](reels/05-devis-a-la-voix.mp4) |
| 06 | Devis | Le catalogue : vos prix proposés tout seuls dans chaque devis | [youtube/06-catalogue-des-prix.mp4](youtube/06-catalogue-des-prix.mp4) | [reels/06-catalogue-des-prix.mp4](reels/06-catalogue-des-prix.mp4) |
| 07 | Devis | Des trames de devis pour ne plus repartir de zéro | [youtube/07-trames-de-devis.mp4](youtube/07-trames-de-devis.mp4) | [reels/07-trames-de-devis.mp4](reels/07-trames-de-devis.mp4) |
| 08 | Devis | Envoyer un devis et le faire signer en ligne | [youtube/08-envoyer-et-faire-signer.mp4](youtube/08-envoyer-et-faire-signer.mp4) | [reels/08-envoyer-et-faire-signer.mp4](reels/08-envoyer-et-faire-signer.mp4) |
| 09 | Devis | Relancer automatiquement un devis resté sans réponse | [youtube/09-relances-automatiques.mp4](youtube/09-relances-automatiques.mp4) | [reels/09-relances-automatiques.mp4](reels/09-relances-automatiques.mp4) |
| 10 | Devis | Transformer un devis accepté en facture, sans rien ressaisir | [youtube/10-devis-en-facture.mp4](youtube/10-devis-en-facture.mp4) | [reels/10-devis-en-facture.mp4](reels/10-devis-en-facture.mp4) |
| 11 | Devis | Remplir une soumission reçue et renvoyer le PDF chiffré | [youtube/11-remplir-une-soumission.mp4](youtube/11-remplir-une-soumission.mp4) | [reels/11-remplir-une-soumission.mp4](reels/11-remplir-une-soumission.mp4) |
| 12 | Facturation | Créer une facture avec QR-facture suisse | [youtube/12-facture-qr.mp4](youtube/12-facture-qr.mp4) | [reels/12-facture-qr.mp4](reels/12-facture-qr.mp4) |
| 13 | Facturation | Facturer un acompte avant de démarrer un chantier | [youtube/13-facturer-un-acompte.mp4](youtube/13-facturer-un-acompte.mp4) | [reels/13-facturer-un-acompte.mp4](reels/13-facturer-un-acompte.mp4) |
| 14 | Facturation | Facturer un chantier par étapes, avec les situations | [youtube/14-situations-de-chantier.mp4](youtube/14-situations-de-chantier.mp4) | [reels/14-situations-de-chantier.mp4](reels/14-situations-de-chantier.mp4) |
| 15 | Facturation | Suivre ses paiements et relancer un impayé | [youtube/15-paiements-et-impayes.mp4](youtube/15-paiements-et-impayes.mp4) | [reels/15-paiements-et-impayes.mp4](reels/15-paiements-et-impayes.mp4) |
| 16 | Facturation | Importer un relevé bancaire et pointer les factures payées | [youtube/16-import-releve-bancaire.mp4](youtube/16-import-releve-bancaire.mp4) | [reels/16-import-releve-bancaire.mp4](reels/16-import-releve-bancaire.mp4) |
| 17 | E-mails | Tous vos e-mails clients au même endroit : envois suivis et réponses | [youtube/17-boite-e-mails.mp4](youtube/17-boite-e-mails.mp4) | [reels/17-boite-e-mails.mp4](reels/17-boite-e-mails.mp4) |
| 18 | Chantiers | Créer un chantier et suivre son fil d’actualité | [youtube/18-chantier-et-fil.mp4](youtube/18-chantier-et-fil.mp4) | [reels/18-chantier-et-fil.mp4](reels/18-chantier-et-fil.mp4) |
| 19 | Chantiers | Photos, plans et documents de chantier, rangés au même endroit | [youtube/19-photos-et-documents.mp4](youtube/19-photos-et-documents.mp4) | [reels/19-photos-et-documents.mp4](reels/19-photos-et-documents.mp4) |
| 20 | Chantiers | Un rapport de chantier propre à partir de notes et de photos | [youtube/20-rapport-de-chantier.mp4](youtube/20-rapport-de-chantier.mp4) | [reels/20-rapport-de-chantier.mp4](reels/20-rapport-de-chantier.mp4) |
| 21 | Chantiers | Le planning de chantier : phases, tâches et avancement | [youtube/21-planning-de-chantier.mp4](youtube/21-planning-de-chantier.mp4) | [reels/21-planning-de-chantier.mp4](reels/21-planning-de-chantier.mp4) |
| 22 | Chantiers | Travaux supplémentaires : chiffrer, faire signer, facturer | [youtube/22-travaux-supplementaires.mp4](youtube/22-travaux-supplementaires.mp4) | [reels/22-travaux-supplementaires.mp4](reels/22-travaux-supplementaires.mp4) |
| 23 | Chantiers | Faire signer un travail supplémentaire sur place, sur tablette | [youtube/23-signature-sur-tablette.mp4](youtube/23-signature-sur-tablette.mp4) | [reels/23-signature-sur-tablette.mp4](reels/23-signature-sur-tablette.mp4) |
| 24 | Chantiers | Suivre ses sous-traitants sur un chantier | [youtube/24-sous-traitants-chantier.mp4](youtube/24-sous-traitants-chantier.mp4) | [reels/24-sous-traitants-chantier.mp4](reels/24-sous-traitants-chantier.mp4) |
| 25 | Chantiers | Savoir si un chantier gagne de l’argent : devisé contre coût réel | [youtube/25-rentabilite-chantier.mp4](youtube/25-rentabilite-chantier.mp4) | [reels/25-rentabilite-chantier.mp4](reels/25-rentabilite-chantier.mp4) |
| 26 | Équipe & RH | Le planning d’équipe : qui est où, chaque jour | [youtube/26-planning-equipe.mp4](youtube/26-planning-equipe.mp4) | [reels/26-planning-equipe.mp4](reels/26-planning-equipe.mp4) |
| 27 | Équipe & RH | La liste de tâches de toute l’équipe | [youtube/27-taches-equipe.mp4](youtube/27-taches-equipe.mp4) | [reels/27-taches-equipe.mp4](reels/27-taches-equipe.mp4) |
| 28 | Équipe & RH | Inviter son équipe et choisir ce que chacun voit | [youtube/28-membres-et-roles.mp4](youtube/28-membres-et-roles.mp4) | [reels/28-membres-et-roles.mp4](reels/28-membres-et-roles.mp4) |
| 29 | Équipe & RH | Des heures pointées à la fiche de salaire | [youtube/29-heures-et-salaires.mp4](youtube/29-heures-et-salaires.mp4) | [reels/29-heures-et-salaires.mp4](reels/29-heures-et-salaires.mp4) |
| 30 | Équipe & RH | Demandes de congé et soldes de vacances de l’équipe | [youtube/30-absences-et-vacances.mp4](youtube/30-absences-et-vacances.mp4) | [reels/30-absences-et-vacances.mp4](reels/30-absences-et-vacances.mp4) |
| 31 | Équipe & RH | Le répertoire de ses sous-traitants | [youtube/31-repertoire-sous-traitants.mp4](youtube/31-repertoire-sous-traitants.mp4) | [reels/31-repertoire-sous-traitants.mp4](reels/31-repertoire-sous-traitants.mp4) |
| 32 | Clients | Toute l’histoire d’un client sur une seule fiche | [youtube/32-fiche-client.mp4](youtube/32-fiche-client.mp4) | [reels/32-fiche-client.mp4](reels/32-fiche-client.mp4) |
| 33 | Clients | Ce que voit votre client : devis, factures et signature en ligne | [youtube/33-portail-client.mp4](youtube/33-portail-client.mp4) | [reels/33-portail-client.mp4](reels/33-portail-client.mp4) |
| 34 | Gestion | Suivre ses dépenses et scanner ses tickets | [youtube/34-depenses.mp4](youtube/34-depenses.mp4) | [reels/34-depenses.mp4](reels/34-depenses.mp4) |
| 35 | Gestion | La trésorerie prévue sur 90 jours | [youtube/35-tresorerie.mp4](youtube/35-tresorerie.mp4) | [reels/35-tresorerie.mp4](reels/35-tresorerie.mp4) |
| 36 | Gestion | Bilan et compte de résultat, tenus automatiquement | [youtube/36-comptabilite.mp4](youtube/36-comptabilite.mp4) | [reels/36-comptabilite.mp4](reels/36-comptabilite.mp4) |
| 37 | Gestion | Préparer son décompte TVA suisse | [youtube/37-decompte-tva.mp4](youtube/37-decompte-tva.mp4) | [reels/37-decompte-tva.mp4](reels/37-decompte-tva.mp4) |
| 38 | Gestion | Le bouclement de fin d’année, étape par étape | [youtube/38-bouclement.mp4](youtube/38-bouclement.mp4) | [reels/38-bouclement.mp4](reels/38-bouclement.mp4) |
| 39 | Gestion | Travailler avec sa fiduciaire sans échanger de classeurs | [youtube/39-fiduciaire.mp4](youtube/39-fiduciaire.mp4) | [reels/39-fiduciaire.mp4](reels/39-fiduciaire.mp4) |
| 40 | Outils | L’assistant vocal : parler à Cantia au lieu de taper | [youtube/40-assistant-vocal.mp4](youtube/40-assistant-vocal.mp4) | [reels/40-assistant-vocal.mp4](reels/40-assistant-vocal.mp4) |
| 41 | Outils | Relier Cantia à Bexio | [youtube/41-integration-bexio.mp4](youtube/41-integration-bexio.mp4) | [reels/41-integration-bexio.mp4](reels/41-integration-bexio.mp4) |
