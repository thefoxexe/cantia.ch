# Carrousels Instagram — Nouveautés Cantia (automne 2026)

Quatre carrousels (7, 7, 7 et 6 slides), format 4:5 (1080 × 1350), dans `carrousels/`.
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

## Carrousel 3 · Cantia Accounting (fiduciaires)

Fichiers : `cantia-accounting-01.png` à `-07.png`

Description :

Fiduciaires : toute la comptabilité de vos mandants, dans un seul espace. Et c’est gratuit. (glissez →)

01 · Vos mandants sur Banana, Abacus, Winbiz ou Excel : vous reprenez écritures, plan comptable et soldes, et vous leur rendez tout dans leur format.
02 · Une écriture au montant TTC, la TVA séparée au bon taux (8,1 %, 2,6 %, 3,8 %).
03 · Le décompte TVA rempli chiffre par chiffre, contrôlé contre 2200, 1170 et 1171, avec le fichier eCH-0217 pour le portail de l’AFC.
04 · Un lien privé à vos couleurs : le client dépose ses pièces et signe ses comptes depuis son téléphone, sans compte.
05 · Des contrôles avant le bouclement, le report du résultat et les comptes annuels N / N-1 en PDF.

CHF 0, mandants et collaborateurs illimités, sans carte bancaire. Hébergé en Suisse, en français, allemand et italien.

👉 accounting.cantia.ch

#Cantia #CantiaAccounting #Fiduciaire #Treuhand #Comptabilite #TVA #AFC #Bouclement #PME #Suisse #Romandie #LogicielSuisse

## Carrousel 4 · Cantia Partners

Fichiers : `cantia-partners-01.png` à `-06.png`

Description :

Fiduciaires, intégrateurs, fournisseurs, associations professionnelles : vous accompagnez des PME suisses depuis des années. Nous cherchons quelques partenaires pour travailler dans la durée. (glissez →)

· Trois façons de travailler ensemble : conseil, intégration, réseau.
· Vos clients restent les vôtres : vous ne voyez jamais leurs données.
· De notre côté : une ligne directe avec l’équipe, des démonstrations faites ensemble, vos retours dans le produit, un accompagnement au démarrage de vos clients.
· Un cadre écrit, défini avec vous, consigné dans votre espace partenaire.
· Aucun frais d’adhésion, aucune durée minimale.

Le programme commence, et nous le disons franchement : les premiers partenaires travaillent directement avec l’équipe.

👉 partners.cantia.ch

#Cantia #CantiaPartners #Partenariat #Fiduciaire #Integrateur #PME #Digitalisation #Suisse #Romandie #LogicielSuisse

## À vérifier avant de publier

- Salaires, trésorerie et planning de chantier : dès le plan Équipe (indiqué sur les slides).
- Outlook n’est pas encore disponible : la slide le dit (« arrive bientôt »). À mettre à jour quand il sera actif.
- Les noms de chantiers (« Villa Martin », « Immeuble Gare »), numéros et montants sont des exemples.
- Accounting et Partners : « Menuiserie Bonvin » et « Rossier & Associés » sont des exemples, repris des pages accounting.cantia.ch et partners.cantia.ch (le cadre de partenariat porte la mention « Exemple »).

## Rendu

`NODE_PATH=$(npm root -g) node render-carrousels.js` (sources : `carrousels.html` et `produits.html`, styles communs dans `carrousels.css`, polices locales dans `fonts/`).
