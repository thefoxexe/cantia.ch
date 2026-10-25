# Carrousels Instagram — Nouveautés Cantia (automne 2026)

Deux carrousels de 7 slides, format 4:5 (1080 × 1350), dans `carrousels/`.
À publier à quelques jours d’écart : d’abord « Côté chantier », puis « Côté bureau ».

## Carrousel 1 · Côté chantier

Fichiers : `cantia-nouveautes-chantier-01.png` à `-07.png`

Description :

Ce qui change sur vos chantiers cet automne 👷‍♂️ (glissez →)

01 · Remplir une soumission (bêta) : importez le PDF reçu de l’architecte, mettez vos prix, Cantia remplit le document d’origine avec montants, reports et totaux.
02 · Le planning de chantier : phases, tâches et jalons liés entre eux, jours fériés cantonaux, export PDF, Excel et MS Project.
03 · Le planning partagé par lien : le maître d’ouvrage ou vos sous-traitants voient la dernière version, sans compte.
04 · Google Agenda relié dans les deux sens, et vos rendez-vous restent privés.
05 · Des chantiers mieux rangés : numéro, dossiers, contacts triés, et un accueil qui montre le planning du jour.

Soumission et planning de chantier sont réservés aux entreprises du bâtiment.

👉 Essai gratuit de 14 jours, sans engagement, sur cantia.ch (lien en bio)

#Cantia #Construction #Batiment #Chantier #PlanningDeChantier #Soumission #Artisan #Entrepreneur #PME #Suisse #Romandie #LogicielSuisse

## Carrousel 2 · Côté bureau

Fichiers : `cantia-nouveautes-bureau-01.png` à `-07.png`

Description :

Et au bureau, ça change aussi 📂 (glissez →)

01 · Des fiches de salaire vraiment suisses : AVS/AI/APG, AC, LPP, LAA, IJM, impôt à la source et allocations familiales, calculés pour vous.
02 · Le décompte TVA préparé avec les chiffres du formulaire de l’AFC, à partir de vos factures et dépenses. Et si vous n’êtes pas assujetti, pas de TVA sur vos documents.
03 · Un bouclement guidé : amortissements, ducroire, transitoires, travaux en cours, provision pour impôts.
04 · La trésorerie en courbe, avec une projection pour voir venir les mois serrés.
05 · Votre fiduciaire dans la boucle avec Cantia Accounting, gratuit pour les fiduciaires.

Et toujours nos outils gratuits, sans compte : calculateur de salaire, taux horaire, TVA, marge, intérêts de retard (cantia.ch/outils).

👉 Essai gratuit de 14 jours sur cantia.ch (lien en bio)

#Cantia #PME #Salaires #TVA #Comptabilite #Fiduciaire #Bouclement #Tresorerie #Entrepreneur #Suisse #Romandie #LogicielSuisse

## À vérifier avant de publier

- Salaires, trésorerie et planning de chantier : dès le plan Équipe (indiqué sur les slides).
- Outlook n’est pas encore disponible : la slide le dit (« arrive bientôt »). À mettre à jour quand il sera actif.
- Les noms de chantiers (« Villa Martin », « Immeuble Gare »), numéros et montants sont des exemples.

## Rendu

`NODE_PATH=$(npm root -g) node render-carrousels.js` (source : `carrousels.html`, polices locales dans `fonts/`).
