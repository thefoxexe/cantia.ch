// Single source of truth for marketing-page SEO metadata, shared by:
//  - scripts/inject-seo-meta.mjs (patches meta tags into the "single"
//    CSR export that still ships app.cantia.ch)
//  - scripts/build-marketing.mjs (patches the same meta tags into the
//    separate "static" prerendered export that ships cantia.ch)
// Keeping one array means the two builds can never describe a page
// differently by accident.
export const SITE = 'https://cantia.ch';
export const OG_IMAGE = `${SITE}/og-image.jpg`;

const HOME = {
  path: '',
  title: 'Logiciel de gestion de chantier en Suisse | Cantia',
  description:
    'Cantia centralise devis, factures, planning, rapports, heures et rentabilité pour les artisans et PME du bâtiment en Suisse.',
};

// One entry per public marketing route — copied from each page's own
// title/subtitle (or lead paragraph) so the tags actually match what a
// visitor (and a crawler) finds on that page.
export const ROUTES = [
  HOME,
  {
    path: 'solutions/devis',
    title: 'Devis en ligne pour artisans suisses | Cantia',
    description:
      "Dictez vos lignes de devis à voix haute sur le chantier. Cantia les transforme en positions chiffrées avec vos prix habituels, PDF prêt à envoyer.",
    faq: [
      {
        q: 'Comment faire un devis rapidement en tant qu’artisan ?',
        a: "Dictez vos lignes à voix haute sur le chantier ou en voiture. Cantia les transforme en positions chiffrées avec vos prix habituels, et le PDF est prêt avant même d'avoir quitté le client.",
      },
      {
        q: 'Le devis est-il conforme aux usages suisses (TVA, mise en page) ?',
        a: "Oui : chaque devis reprend votre taux de TVA, vos coordonnées d'entreprise et peut être personnalisé à votre couleur de marque et votre logo.",
      },
      {
        q: 'Peut-on transformer un devis accepté en facture automatiquement ?',
        a: 'Oui, un devis accepté se convertit en facture — avec QR-bill suisse — en un clic, sans ressaisir les lignes.',
      },
      {
        q: 'Cantia est-il gratuit pour faire des devis ?',
        a: 'Oui, un quota de devis mensuel est disponible gratuitement, sans carte bancaire ni engagement.',
      },
    ],
  },
  {
    path: 'solutions/facturation',
    title: 'Facturation & QR-facture suisse | Cantia',
    description:
      "Chaque facture Cantia intègre automatiquement le QR-bill suisse conforme — IBAN, référence structurée et montant déjà encodés, prêt à scanner.",
    faq: [
      {
        q: 'Comment créer une facture avec QR-facture suisse ?',
        a: "Renseignez votre IBAN une fois dans les paramètres : chaque facture génère ensuite automatiquement le bulletin QR conforme à la norme SIX, IBAN et référence structurée déjà encodés.",
      },
      {
        q: 'Peut-on facturer un acompte avant la fin du chantier ?',
        a: "Oui, Cantia permet d'émettre une facture d'acompte pour un pourcentage du devis, puis déduit automatiquement ce montant de la facture finale.",
      },
      {
        q: 'Comment savoir si une facture a été payée ?',
        a: 'Recherchez et rapprochez un paiement directement par son numéro de référence QR — le statut passe à «payée» sans devoir vérifier votre compte bancaire manuellement.',
      },
      {
        q: 'Combien coûte la facturation avec QR-code via Cantia ?',
        a: 'La facturation avec QR-bill suisse est incluse dans tous les plans, y compris le plan gratuit.',
      },
    ],
  },
  {
    path: 'solutions/rapports-chantier',
    title: 'Rapports de chantier | Cantia',
    description:
      "Notes vocales, photos géolocalisées et messages d'équipe : Cantia en tire un rapport rédigé et structuré, prêt à envoyer.",
    faq: [
      {
        q: 'Comment rédiger un rapport de chantier rapidement ?',
        a: "Prenez vos photos et dictez vos notes sur le moment — Cantia assemble tout en un rapport PDF structuré et prêt à envoyer, sans devoir tout retaper le soir.",
      },
      {
        q: 'Les photos sont-elles géolocalisées automatiquement ?',
        a: 'Oui, chaque photo est horodatée et géolocalisée sans action supplémentaire de votre part.',
      },
      {
        q: 'Peut-on personnaliser le rapport avec son logo et sa signature ?',
        a: 'Oui, chaque rapport PDF reprend votre logo, votre couleur de marque et la signature de son rédacteur.',
      },
      {
        q: 'Le rapport de chantier remplace-t-il un carnet de chantier papier ?',
        a: 'Oui — notes, photos et suivi sont centralisés dans un document numérique consultable à tout moment, par chantier.',
      },
    ],
  },
  {
    path: 'solutions/dictee-vocale',
    title: 'Dictée vocale pour le bâtiment | Cantia',
    description:
      "Devis, rapports, messages d'équipe : un bouton dicter remplace la saisie au clavier, partout dans Cantia.",
    faq: [
      {
        q: 'La dictée vocale fonctionne-t-elle bien avec le vocabulaire du bâtiment ?',
        a: 'Oui, la reconnaissance est adaptée au vocabulaire technique du bâtiment — matériaux, unités, métiers — pas seulement à du langage courant.',
      },
      {
        q: 'Faut-il une connexion internet pour dicter ?',
        a: 'Oui, la dictée nécessite une connexion pour la transcription, mais les devis et rapports générés restent consultables une fois créés.',
      },
      {
        q: 'Où peut-on utiliser la dictée vocale dans Cantia ?',
        a: "Sur les devis, les rapports de chantier et les messages d'équipe du fil d'actualité — partout où vous écrivez.",
      },
      {
        q: 'La dictée vocale est-elle plus rapide que le clavier sur le terrain ?',
        a: 'Pour la plupart des artisans sur chantier, oui — parler va plus vite que taper sur un téléphone avec les mains sales ou des gants.',
      },
    ],
  },
  {
    path: 'solutions/planning',
    title: "Planning d'équipe chantier | Cantia",
    description:
      "Un vrai calendrier d'équipe : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou WhatsApp.",
    faq: [
      {
        q: "Comment organiser le planning d'une équipe de chantier ?",
        a: 'Cantia affiche un calendrier hebdomadaire partagé : chaque membre voit qui est sur quel chantier, chaque jour.',
      },
      {
        q: 'Le planning remplace-t-il un tableau Excel ou un groupe WhatsApp ?',
        a: "Oui, toute l'équipe consulte les mêmes informations en temps réel, sans fichier ni message à faire défiler.",
      },
      {
        q: 'Peut-on planifier plusieurs chantiers en parallèle ?',
        a: 'Oui, chaque affectation est liée à un chantier précis et reste visible sur toute la semaine, membre par membre.',
      },
      {
        q: 'Le planning est-il inclus dans le plan gratuit ?',
        a: 'Le planning est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'solutions/rentabilite',
    title: 'Rentabilité par chantier | Cantia',
    description:
      "Comparez le devis accepté au coût réel — matériel et main d'œuvre — pour savoir si chaque chantier est rentable, en marge serrée ou en perte.",
    faq: [
      {
        q: 'Comment savoir si un chantier est rentable ?',
        a: "Cantia compare le devis accepté (revenu) au coût réel — matériel saisi et main d'œuvre issue du planning — et affiche la marge en CHF et en % en temps réel.",
      },
      {
        q: "D'où vient le calcul du coût de main d'œuvre ?",
        a: "Du planning d'équipe : les jours affectés à un chantier sont multipliés par le coût horaire de votre entreprise, sans pointage séparé.",
      },
      {
        q: 'Peut-on comparer plusieurs chantiers entre eux ?',
        a: 'Oui, chaque chantier affiche sa propre marge, ce qui permet de repérer rapidement les chantiers en perte.',
      },
      {
        q: 'La rentabilité par chantier est-elle incluse dans le plan gratuit ?',
        a: 'Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'solutions/rh-salaires',
    title: 'RH, heures & salaires pour le bâtiment | Cantia',
    description:
      "Chaque employé pointe ses heures par chantier et ses frais professionnels ; la secrétaire ou l'administrateur gère la fiche de salaire de toute l'équipe, du brut au net.",
    faq: [
      {
        q: 'Qui peut voir les salaires dans Cantia ?',
        a: "Uniquement la secrétaire RH et les administrateurs, selon les permissions accordées depuis Équipe. Un employé standard ne voit que ses propres heures et frais.",
      },
      {
        q: 'Cantia calcule-t-il automatiquement les cotisations sociales suisses ?',
        a: "Cantia calcule le salaire net à partir de taux AVS/AC/LPP/LAA et d'un taux d'impôt à la source configurables par employé — les taux par défaut sont indicatifs, à ajuster selon votre caisse de compensation, votre caisse LPP et le canton.",
      },
      {
        q: "Comment un employé exporte-t-il sa feuille d'heures ?",
        a: 'Depuis le module RH & Salaires, en choisissant la granularité — journalière, hebdomadaire ou mensuelle — puis en téléchargeant un fichier CSV.',
      },
      {
        q: 'Le module RH & Salaires est-il inclus dans le plan gratuit ?',
        a: 'Il est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'solutions/travaux-supplementaires',
    title: 'Travaux supplémentaires (TS) pour artisans suisses | Cantia',
    description:
      "Chaque extra demandé en cours de chantier devient un document daté, signé en ligne par le client et transformé automatiquement en facture — fini les extras oubliés ou contestés.",
    faq: [
      {
        q: 'Qu’est-ce qu’un Travaux supplémentaires (TS) dans Cantia ?',
        a: "C'est un document dédié pour tout ce qui est demandé en cours de chantier en plus du devis initial — un mur à déplacer, une prise à ajouter. Il se crée, s'envoie et se signe comme un devis, puis se transforme automatiquement en facture une fois accepté.",
      },
      {
        q: 'Un TS doit-il être rattaché à un devis existant ?',
        a: "Non, c'est optionnel. Vous pouvez le lier au devis d'origine pour garder le contexte, ou le créer seul si le chantier n'a pas de devis initial dans Cantia.",
      },
      {
        q: 'Comment le client valide-t-il un Travaux supplémentaires ?',
        a: "Il reçoit un lien vers un portail sécurisé, consulte le détail chiffré et signe en ligne — l'acceptation est horodatée et déclenche automatiquement la facture correspondante.",
      },
      {
        q: 'Les travaux supplémentaires comptent-ils dans la Rentabilité par chantier ?',
        a: "Oui : dès qu'un TS est accepté, son montant s'ajoute automatiquement au total devisé du chantier dans le module Rentabilité.",
      },
    ],
  },
  {
    path: 'solutions/tresorerie',
    title: 'Trésorerie prévisionnelle pour le bâtiment | Cantia',
    description:
      "Factures à encaisser, salaires, sous-traitants et charges récurrentes réunis en une projection à 90 jours — sans connexion bancaire.",
    faq: [
      {
        q: 'Cantia se connecte-t-il à mon compte bancaire ?',
        a: 'Non. Vous saisissez votre solde manuellement quand vous le souhaitez — aucun accès bancaire n’est demandé ni nécessaire.',
      },
      {
        q: 'D’où viennent les montants de la projection ?',
        a: "Des factures clients non soldées, d'une estimation de la masse salariale (profils RH + heures saisies), des factures sous-traitants impayées et des dépenses récurrentes que vous enregistrez — tout ce que Cantia sait déjà sur votre activité.",
      },
      {
        q: 'Comment fonctionnent les rappels de dépenses récurrentes ?',
        a: 'Un bandeau sur l’accueil et la page Trésorerie vous signale les dépenses récurrentes actives qui tombent dans les 7 prochains jours, avant qu’elles ne soient prélevées.',
      },
      {
        q: 'La Trésorerie prévisionnelle est-elle incluse dans le plan gratuit ?',
        a: 'Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'integrations',
    title: 'Intégrations | Cantia',
    description:
      "Cantia se connecte directement à votre comptabilité : Bexio dès aujourd'hui, clients et articles importés, factures envoyées en un clic, statuts de paiement synchronisés.",
    faq: [
      { q: 'Quelles intégrations Cantia propose-t-il aujourd’hui ?', a: 'Bexio, disponible nativement dès le plan Équipe. D’autres intégrations suivront le même principe de connexion officielle.' },
      { q: 'L’intégration Bexio est-elle payante en plus de l’abonnement ?', a: 'Non — elle est incluse automatiquement à partir du plan Équipe, sans module ni coût supplémentaire.' },
      { q: 'Cantia peut-il envoyer une facture définitive à mon client via Bexio ?', a: 'Non. Chaque facture arrive dans Bexio en brouillon uniquement — la finalisation reste toujours une action manuelle côté Bexio.' },
    ],
  },
  {
    path: 'sur-mesure',
    title: 'Développement sur mesure | Cantia',
    description:
      "Au-delà des modules standards, Cantia peut développer un workflow, une automatisation ou une intégration spécialement pour votre entreprise — sans changer l'expérience des autres clients.",
    faq: [
      { q: 'Un module sur mesure est-il visible par les autres entreprises ?', a: 'Non. Un module développé pour vous est activé uniquement pour votre organisation — les autres clients Cantia ne le voient jamais.' },
      { q: 'Est-ce que je dois changer de logiciel ou installer autre chose ?', a: 'Non — le module vit dans le même Cantia que vous utilisez déjà, avec les mêmes accès et les mêmes mises à jour.' },
      { q: 'Combien coûte un développement sur mesure ?', a: 'Cela dépend entièrement du besoin. On en discute d’abord ensemble, et vous recevez un devis clair avant tout engagement.' },
    ],
  },
  {
    path: 'blog',
    title: 'Blog | Cantia — Réponses concrètes pour le bâtiment suisse',
    description:
      "Devis, facturation, RH, juridique, comparatifs : des réponses précises aux questions que se posent les artisans et entreprises du bâtiment en Suisse.",
  },
  {
    path: 'blog/calculer-prix-devis-renovation-suisse',
    title: 'Comment calculer le prix d’un devis de rénovation en Suisse | Cantia',
    description:
      "Méthode concrète pour chiffrer un devis de rénovation en Suisse : coût horaire réel, matériel, marge, TVA 8,1 % — avec un exemple chiffré complet.",
    faq: [
      { q: 'Quelle marge appliquer sur un devis de rénovation en Suisse ?', a: 'En général entre 20 et 35 % au total (frais fixes + bénéfice + provision imprévus), à ajuster selon le corps de métier et le niveau d’incertitude du chantier existant.' },
      { q: 'Faut-il inclure les imprévus dans le prix du devis ou les facturer à part ?', a: 'Les deux approches existent : soit une provision intégrée au prix ferme, soit une clause explicite prévoyant une facturation complémentaire sur devis supplémentaire en cas de découverte imprévue.' },
      { q: 'La TVA se calcule sur le prix HT ou TTC du devis ?', a: 'Toujours sur le montant hors taxe (HT). Le taux normal est de 8,1 % depuis 2024 pour la plupart des prestations du bâtiment.' },
    ],
  },
  {
    path: 'blog/norme-sia-118-devis-obligatoire',
    title: 'La norme SIA 118 est-elle obligatoire sur un devis ? | Cantia',
    description:
      "La norme SIA 118 n’est jamais automatique : elle ne s’applique que si le contrat ou le devis la mentionne explicitement. Explications et bonnes pratiques.",
    faq: [
      { q: 'La SIA 118 est-elle une loi suisse ?', a: 'Non. C’est une norme contractuelle privée éditée par la SIA, qui ne s’applique que si le contrat ou le devis y fait explicitement référence.' },
      { q: 'Que se passe-t-il si le devis ne mentionne pas la SIA 118 ?', a: 'Le contrat d’entreprise reste régi par le seul Code des obligations (art. 363 et suivants CO), avec ses propres règles de garantie et de réception.' },
      { q: 'Un particulier peut-il refuser l’application de la SIA 118 ?', a: 'Oui, son intégration résulte d’un accord entre les parties — elle peut être négociée ou remplacée par les règles du CO seul avant signature.' },
    ],
  },
  {
    path: 'blog/qr-facture-obligatoire-2026',
    title: 'QR-facture obligatoire en Suisse : ce qu’il faut savoir en 2026 | Cantia',
    description:
      "Le BVR n’existe plus depuis 2022, la QR-facture est le seul standard. Et depuis fin 2025, un nouveau changement de format menace les QR-factures non conformes.",
    faq: [
      { q: 'Peut-on encore utiliser un bulletin de versement orange en 2026 ?', a: 'Non. Les BVR et BV ne sont plus émis ni acceptés par les banques suisses depuis le 30 septembre 2022.' },
      { q: 'Qu’est-ce qui change avec la version 2.3 de la norme QR-facture ?', a: 'Depuis novembre 2025, seules les adresses structurées sont admises dans le QR-code ; les adresses en texte libre seront rejetées dès le 30 septembre 2026.' },
      { q: 'Quelle est la différence entre IBAN et QR-IBAN ?', a: 'Le QR-IBAN est un numéro dédié utilisé uniquement pour les QR-factures avec référence QR structurée (QRR).' },
    ],
  },
  {
    path: 'blog/delai-paiement-facture-artisan-code-obligations',
    title: 'Délai de paiement d’une facture d’artisan en Suisse | Cantia',
    description:
      "Le Code des obligations ne fixe pas de délai de paiement légal fixe — 30 jours est l’usage, mais tout dépend de ce qui figure sur votre facture.",
    faq: [
      { q: 'La Suisse impose-t-elle un délai de paiement légal de 30 jours ?', a: 'Non. Le Code des obligations ne fixe pas de délai par défaut ; 30 jours est un usage courant à mentionner explicitement sur la facture.' },
      { q: 'Peut-on réclamer des intérêts de retard sans les avoir mentionnés sur la facture ?', a: 'Oui, l’intérêt moratoire de 5 % l’an (art. 104 CO) s’applique de plein droit dès que le débiteur est en demeure.' },
      { q: 'Que faire si une facture ne précise aucune échéance ?', a: 'La créance est en principe exigible immédiatement ; il est recommandé d’envoyer une mise en demeure écrite avec une échéance claire.' },
    ],
  },
  {
    path: 'blog/avs-ai-independant-batiment',
    title: 'AVS/AI pour un indépendant du bâtiment : comment ça marche | Cantia',
    description:
      "Cotisations AVS/AI/APG obligatoires dès 18 ans pour tout indépendant suisse, calculées sur le revenu net et dégressives sous CHF 60’500/an.",
    faq: [
      { q: 'À partir de quel âge un indépendant doit-il cotiser à l’AVS/AI ?', a: 'Dès 18 ans révolus, l’affiliation à l’AVS/AI/APG est obligatoire pour toute activité lucrative indépendante en Suisse.' },
      { q: 'Le taux de cotisation AVS/AI est-il le même pour tous les indépendants ?', a: 'Non — il est dégressif sous un revenu annuel d’environ CHF 60’500, puis atteint un taux plein d’environ 10 % au-delà.' },
      { q: 'Faut-il cotiser même sans bénéfice une année donnée ?', a: 'Oui, une cotisation minimale annuelle reste due même à revenu très faible ou nul.' },
    ],
  },
  {
    path: 'blog/lpp-deuxieme-pilier-independant-batiment',
    title: 'LPP pour un indépendant du bâtiment : obligatoire ou pas ? | Cantia',
    description:
      "Le 2e pilier (LPP) n’est pas obligatoire pour un indépendant suisse — sauf exceptions sectorielles liées à la SUVA dans certains métiers du bâtiment.",
    faq: [
      { q: 'Un indépendant du bâtiment doit-il obligatoirement cotiser au 2e pilier ?', a: 'Non, en règle générale la LPP reste facultative pour tout indépendant en Suisse.' },
      { q: 'La SUVA peut-elle imposer une assurance à un indépendant sans employé ?', a: 'Dans certains métiers du bâtiment à risque, l’affiliation LAA/SUVA peut être obligatoire même pour l’indépendant lui-même.' },
      { q: 'Que devient l’obligation LPP dès qu’on engage un premier salarié ?', a: 'Dès le premier employé, l’employeur doit l’affilier à la LAA obligatoirement, et à la LPP dès que son salaire dépasse le seuil d’entrée.' },
    ],
  },
  {
    path: 'blog/bexio-vs-cantia-logiciel-batiment',
    title: 'Bexio vs Cantia : quel logiciel pour une entreprise du bâtiment ? | Cantia',
    description:
      "Bexio est une comptabilité généraliste suisse. Cantia est pensée spécifiquement pour le chantier : devis dicté à la voix, rentabilité par projet, QR-facture native.",
    faq: [
      { q: 'Cantia peut-il remplacer complètement Bexio ?', a: 'Cantia n’est pas un logiciel de comptabilité générale — pour la tenue comptable complète, la plupart des entreprises gardent un outil dédié ou une fiduciaire.' },
      { q: 'Bexio propose-t-il un module chantier ou rentabilité par projet ?', a: 'Non — Bexio est un ERP généraliste pour PME suisses, sans fonctionnalité dédiée au suivi de chantier.' },
      { q: 'Peut-on utiliser Cantia et Bexio en parallèle ?', a: 'Oui, c’est une combinaison fréquente : Cantia pour le pilotage quotidien des chantiers, Bexio pour la comptabilité générale.' },
    ],
  },
  {
    path: 'blog/integration-bexio-cantia-synchronisation-automatique',
    title: 'Cantia x Bexio : la connexion native qui supprime la double saisie | Cantia',
    description:
      "Cantia se connecte directement à Bexio via son API officielle : clients importés, factures envoyées en un clic, statuts de paiement tenus à jour automatiquement.",
    faq: [
      { q: 'L’intégration Bexio est-elle payante en plus de mon abonnement ?', a: 'Non — elle est incluse automatiquement à partir du plan Équipe, sans coût ni module supplémentaire à activer.' },
      { q: 'Cantia peut-il envoyer une facture définitive à mon client via Bexio ?', a: 'Non. Chaque facture est envoyée vers Bexio en brouillon uniquement — la finalisation reste toujours manuelle côté Bexio.' },
      { q: 'Que se passe-t-il si je déconnecte l’intégration ?', a: 'Les jetons d’accès Bexio sont immédiatement révoqués et aucune donnée n’est plus échangée entre les deux outils.' },
    ],
  },
  {
    path: 'blog/suivre-rentabilite-chantier-sans-excel',
    title: 'Suivre la rentabilité d’un chantier sans tableur Excel | Cantia',
    description:
      "Un tableau Excel de suivi de chantier casse dès qu’une formule change ou qu’une ligne est oubliée. Une méthode plus fiable pour connaître sa rentabilité en temps réel.",
    faq: [
      { q: 'Comment calculer la rentabilité réelle d’un chantier ?', a: 'En comparant le montant vendu au client (devis accepté) au coût réel : heures travaillées, matériel acheté et factures de sous-traitants.' },
      { q: 'Pourquoi un suivi Excel de chantier finit-il souvent abandonné ?', a: 'Parce qu’il repose sur une saisie manuelle a posteriori, fragile aux erreurs de formule et sans lien automatique avec le devis initial.' },
      { q: 'À quel moment du chantier faut-il suivre la rentabilité ?', a: 'Idéalement en continu, dès le démarrage — un suivi fait seulement à la clôture arrive trop tard pour corriger un dépassement.' },
    ],
  },
  {
    path: 'blog/calculer-heures-travail-ouvrier-minutes-decimales',
    title: 'Calculer des heures de travail : pourquoi 4h45 n’est pas 4,45 | Cantia',
    description:
      "Un ouvrier qui a travaillé de 8h à 12h45 a fait 4h45 — pas 4,45 heures décimales (qui vaudrait 4h27). Une erreur de saisie RH fréquente et coûteuse.",
    faq: [
      { q: 'Comment convertir 4h45 de travail en heures décimales ?', a: '45 minutes correspondent à 0,75 heure. 4h45 de travail équivaut donc à 4,75 heures décimales, pas 4,45.' },
      { q: 'Pourquoi tant d’erreurs de paie viennent-elles de la saisie des heures ?', a: 'Parce que la façon naturelle d’écrire une durée ressemble à un nombre décimal, alors que les chiffres après le séparateur représentent des minutes (base 60).' },
      { q: 'Quelle est la méthode la plus sûre pour noter des heures de chantier ?', a: 'Saisir directement l’heure de début et de fin plutôt qu’une durée calculée à la main.' },
    ],
  },
  {
    path: 'blog/sous-traitant-batiment-suisse-contrat-facturation',
    title: 'Sous-traitant bâtiment en Suisse : contrat et facturation | Cantia',
    description:
      "L’entrepreneur principal reste responsable envers le client même quand le travail est sous-traité. Les points à verrouiller avant de sous-traiter.",
    faq: [
      { q: 'Qui est responsable envers le client en cas de malfaçon d’un sous-traitant ?', a: 'L’entrepreneur principal reste responsable envers le client final ; il peut ensuite se retourner contre son sous-traitant.' },
      { q: 'Faut-il vérifier les assurances d’un sous-traitant avant de l’engager ?', a: 'Oui, notamment sa responsabilité civile professionnelle et son affiliation aux assurances sociales pour son personnel.' },
      { q: 'Le contrat de sous-traitance doit-il reprendre la norme SIA 118 du contrat principal ?', a: 'C’est recommandé lorsque le contrat principal y fait lui-même référence, pour éviter un décalage de garanties.' },
    ],
  },
  {
    path: 'blog/duree-conservation-devis-factures-suisse',
    title: 'Combien de temps conserver devis et factures en Suisse | Cantia',
    description:
      "Le Code des obligations (art. 958f) impose une conservation de 10 ans pour les pièces comptables, factures incluses — délai qui court depuis la fin de l’exercice.",
    faq: [
      { q: 'Pendant combien de temps une entreprise suisse doit-elle garder ses factures ?', a: 'Dix ans, conformément à l’art. 958f du Code des obligations.' },
      { q: 'Le délai de 10 ans court-il depuis la date de la facture ?', a: 'Non — il court depuis la fin de l’exercice comptable dans lequel la facture s’inscrit.' },
      { q: 'Peut-on conserver ses factures uniquement en format numérique ?', a: 'Oui, à condition que le lien avec les transactions concernées soit garanti et l’accessibilité assurée pendant toute la durée légale.' },
    ],
  },
  {
    path: 'blog/rediger-devis-qui-inspire-confiance-client',
    title: 'Rédiger un devis qui inspire confiance à un client | Cantia',
    description:
      "Un devis clair, précis et bien présenté rassure autant qu’un prix compétitif. Les éléments concrets qui font la différence aux yeux d’un client particulier.",
    faq: [
      { q: 'Faut-il détailler chaque poste d’un devis ou donner un prix global ?', a: 'Le détail poste par poste est presque toujours préférable : il rassure le client sur ce qui est réellement inclus.' },
      { q: 'Comment gérer les imprévus possibles sur un devis de rénovation ?', a: 'En les mentionnant explicitement comme exclusions ou via une clause claire de facturation complémentaire.' },
      { q: 'La signature électronique d’un devis a-t-elle une valeur en Suisse ?', a: 'Une signature électronique simple vaut acceptation contractuelle dans la plupart des cas pratiques du bâtiment.' },
    ],
  },
  {
    path: 'blog/facturer-acompte-suisse-securiser-solde',
    title: 'Facturer un acompte sans finir à courir après le solde | Cantia',
    description:
      "Un acompte mal structuré protège rarement l’entreprise. Comment répartir les paiements sur un chantier pour ne jamais avancer plus que ce qui est déjà couvert.",
    faq: [
      { q: 'Quel pourcentage d’acompte demander sur un chantier en Suisse ?', a: 'Il n’existe pas de règle légale fixe — 20 à 30 % à la signature est courant, mais l’échéancier complet doit couvrir les dépenses engagées à chaque étape.' },
      { q: 'Un acompte est-il remboursable si le client annule le chantier ?', a: 'Cela dépend des conditions figurant sur le devis signé — une clause d’annulation explicite évite les litiges.' },
      { q: 'Peut-on facturer plusieurs acomptes intermédiaires sur un même chantier ?', a: 'Oui, et c’est recommandé sur les chantiers de plusieurs semaines pour éviter d’avancer trop de trésorerie.' },
    ],
  },
  {
    path: 'blog/relancer-client-facture-impayee-sans-perdre-client',
    title: 'Relancer un client qui ne paie pas, sans perdre le client | Cantia',
    description:
      "La plupart des retards de paiement ne sont pas de la mauvaise foi. Une méthode de relance en trois temps qui récupère l’argent sans casser la relation.",
    faq: [
      { q: 'Combien de temps attendre avant de relancer une facture impayée ?', a: 'Un premier rappel neutre dès le lendemain de l’échéance dépassée est raisonnable.' },
      { q: 'Faut-il mentionner l’intérêt moratoire dès la première relance ?', a: 'Mieux vaut le garder pour la relance ferme, une semaine après le premier rappel.' },
      { q: 'Un plan de paiement en plusieurs fois affaiblit-il la position de l’entreprise ?', a: 'Non, à condition qu’il soit formalisé par écrit avec des dates précises.' },
    ],
  },
  {
    path: 'blog/validite-devis-signe-prix-qui-bouge',
    title: 'Un devis signé engage-t-il si le prix du matériel a changé ? | Cantia',
    description:
      "Un devis sans date de validité engage l’entreprise sans limite dans le temps, même si le prix du matériel a doublé depuis. La clause qui manque sur la plupart des devis.",
    faq: [
      { q: 'Un devis sans date de validité engage-t-il indéfiniment l’entreprise ?', a: 'En principe oui, tant qu’il n’a pas été retiré ou remplacé — d’où l’importance d’une durée de validité explicite.' },
      { q: 'Peut-on répercuter une hausse du prix des matériaux sur un devis déjà signé ?', a: 'Seulement si une clause de révision de prix le prévoit, ou par avenant négocié avec le client.' },
      { q: 'Quelle durée de validité choisir pour un devis de rénovation ?', a: '30 jours est courant pour des matériaux volatils, jusqu’à 90 jours pour des prestations en main-d’œuvre.' },
    ],
  },
  {
    path: 'blog/garantie-travaux-construction-2-ou-5-ans',
    title: 'Garantie travaux de construction en Suisse : 2, 5 ou 10 ans | Cantia',
    description:
      "La garantie légale pour un ouvrage immobilier est de 5 ans, pas 2 — et un changement de droit entré en vigueur en 2026 réduit le délai pour signaler un défaut à 60 jours.",
    faq: [
      { q: 'La garantie sur des travaux de construction est-elle de 2 ans ou 5 ans en Suisse ?', a: '5 ans pour tout ouvrage immobilier ou fixé au bâtiment (art. 371 al. 2 CO). 2 ans seulement pour les objets mobiliers non intégrés.' },
      { q: 'Depuis quand court le délai de garantie de 5 ans ?', a: 'Depuis la réception de l’ouvrage par le client, pas depuis la date de la facture.' },
      { q: 'Quel est le nouveau délai pour signaler un défaut en 2026 ?', a: 'La réforme entrée en vigueur en 2026 fixe un délai de 60 jours pour notifier un défaut après sa découverte.' },
    ],
  },
  {
    path: 'blog/defaut-construction-decouvert-apres-reception-qui-paie',
    title: 'Défaut découvert après réception du chantier : qui paie ? | Cantia',
    description:
      "Un défaut caché découvert des mois après la réception reste à la charge de l’entrepreneur s’il est signalé à temps. Ce que change la réforme du droit de la garantie en 2026.",
    faq: [
      { q: 'Un client peut-il réclamer un défaut découvert un an après la réception ?', a: 'Oui, s’il s’agit d’un défaut caché signalé dans les 60 jours suivant sa découverte, dans le délai de prescription de 5 ans.' },
      { q: 'Que se passe-t-il si un défaut apparent n’a pas été signalé à la réception ?', a: 'Il est en principe réputé accepté par le client, sauf clause contraire.' },
      { q: 'Quel est le délai pour signaler un défaut caché depuis la réforme 2026 ?', a: '60 jours à compter de sa découverte.' },
    ],
  },
  {
    path: 'blog/assurance-rc-professionnelle-batiment-obligatoire',
    title: 'RC professionnelle dans le bâtiment : obligatoire en Suisse ? | Cantia',
    description:
      "Aucune loi fédérale unique n’impose la RC professionnelle à tout artisan — mais plusieurs cantons et donneurs d’ordre l’exigent de fait pour certains métiers. Le point clair.",
    faq: [
      { q: 'La RC professionnelle est-elle obligatoire pour tout artisan suisse ?', a: 'Non, mais plusieurs cantons l’exigent pour certains métiers réglementés, et de nombreux donneurs d’ordre la demandent systématiquement.' },
      { q: 'La RC professionnelle remplace-t-elle la garantie décennale d’un chantier ?', a: 'Non, ce sont deux mécanismes différents : la garantie légale couvre l’ouvrage, la RC pro couvre les dommages à des tiers.' },
      { q: 'Que risque une entreprise sans RC professionnelle en cas de sinistre ?', a: 'Le patrimoine de l’entreprise, voire personnel pour une entreprise individuelle, peut être directement engagé.' },
    ],
  },
  {
    path: 'blog/permis-construire-renovation-quand-necessaire',
    title: 'Permis de construire pour une rénovation : quand c’est nécessaire | Cantia',
    description:
      "Refaire une cuisine ou une salle de bains ne demande en principe pas de permis. Dès que la structure ou l’aspect extérieur changent, la donne change — selon le canton.",
    faq: [
      { q: 'Refaire une cuisine ou une salle de bains nécessite-t-il un permis ?', a: 'En principe non, tant que la structure porteuse et l’usage des locaux ne sont pas modifiés.' },
      { q: 'Quels travaux nécessitent presque toujours un permis ?', a: 'Tout ce qui touche à un mur porteur, à l’aspect extérieur ou à l’affectation d’un local.' },
      { q: 'Les règles de permis sont-elles les mêmes dans tous les cantons ?', a: 'Non, chaque canton fixe ses propres seuils de dispense et procédures.' },
    ],
  },
  {
    path: 'blog/contrat-entreprise-vs-mandat-artisan',
    title: 'Contrat d’entreprise vs mandat : la différence pour un artisan | Cantia',
    description:
      "Un artisan qui pose du carrelage est sous contrat d’entreprise (obligation de résultat). Un architecte qui conseille est souvent sous mandat (obligation de moyens).",
    faq: [
      { q: 'Un artisan du bâtiment travaille-t-il sous contrat d’entreprise ou mandat ?', a: 'Presque toujours sous contrat d’entreprise (art. 363 CO), qui engage sur un résultat.' },
      { q: 'Quelle est la principale différence pratique entre les deux régimes ?', a: 'Le contrat d’entreprise garantit un résultat ; le mandat n’engage que sur les moyens mis en œuvre.' },
      { q: 'Un même chantier peut-il combiner les deux types de contrat ?', a: 'Oui, un architecte sous mandat et des entreprises sous contrat d’entreprise coexistent fréquemment.' },
    ],
  },
  {
    path: 'blog/salaire-minimum-cct-construction-suisse',
    title: 'Salaire minimum bâtiment en Suisse : ce que fixe la CCT | Cantia',
    description:
      "Le salaire minimum du gros œuvre suisse est fixé par la Convention nationale du secteur principal de la construction, pas par une loi fédérale — et la CCT 2026-2031 change plusieurs règles.",
    faq: [
      { q: 'Existe-t-il un salaire minimum légal fédéral en Suisse ?', a: 'Non — dans le bâtiment, ce sont les CCT de branche qui fixent des minima contraignants.' },
      { q: 'Le salaire minimum du bâtiment est-il le même partout en Suisse ?', a: 'Non, il varie selon la région salariale et la qualification.' },
      { q: 'Qu’est-ce qui change avec la CCT construction 2026 ?', a: 'Les salaires restent globalement stables pour 2026 ; le vrai changement porte sur le régime des heures supplémentaires.' },
    ],
  },
  {
    path: 'blog/heures-supplementaires-batiment-majoration-25',
    title: 'Heures supplémentaires bâtiment : ce qui change avec la CCT 2026 | Cantia',
    description:
      "La nouvelle convention collective de la construction change le calcul des heures supplémentaires : jusqu’à 100h reportables, majoration de 25 % au-delà, seuil de 50h incluant les trajets.",
    faq: [
      { q: 'Le temps de trajet compte-t-il dans le calcul des heures supplémentaires ?', a: 'Oui depuis la CCT 2026-2031 : travail et trajets cumulés au-delà de 50h/semaine sont du travail supplémentaire.' },
      { q: 'Combien d’heures peut-on reporter sur l’année suivante ?', a: 'Jusqu’à 100 heures, au-delà elles doivent être payées avec une majoration de 25 %.' },
      { q: 'Heures supplémentaires et heures complémentaires sont-elles la même chose ?', a: 'Non, ce sont deux régimes de compensation distincts.' },
    ],
  },
  {
    path: 'blog/indemnites-kilometriques-2026-nouveau-taux',
    title: 'Indemnités kilométriques 2026 : le taux qui vient de changer | Cantia',
    description:
      "L’Administration fédérale des contributions relève le taux forfaitaire de CHF 0,70 à CHF 0,75/km au 1er janvier 2026 — avec une nouvelle obligation de déclaration.",
    faq: [
      { q: 'Quel est le nouveau taux d’indemnité kilométrique en 2026 ?', a: 'CHF 0,75 par kilomètre depuis le 1er janvier 2026, contre CHF 0,70 auparavant.' },
      { q: 'Une entreprise doit-elle obligatoirement appliquer ce taux ?', a: 'Non, elle reste libre de fixer un taux différent — CHF 0,75/km sert de référence par défaut.' },
      { q: 'Qu’est-ce qui doit désormais figurer sur le certificat de salaire ?', a: 'Une croix à la lettre F signalant le versement d’une indemnité forfaitaire véhicule.' },
    ],
  },
  {
    path: 'blog/calculer-13e-salaire-prorata-employe',
    title: 'Calculer le 13e salaire au prorata en cours d’année | Cantia',
    description:
      "Un employé engagé en avril n’a pas droit à un 13e salaire complet en décembre — le calcul au prorata se fait sur les mois réellement travaillés.",
    faq: [
      { q: 'Comment calculer un 13e salaire pour un employé arrivé en cours d’année ?', a: 'En multipliant le 13e salaire plein par le nombre de mois travaillés divisé par 12.' },
      { q: 'Un employé parti en cours d’année a-t-il droit à un 13e salaire au prorata ?', a: 'Oui, c’est une créance due au moment de son départ.' },
      { q: 'Une absence maladie réduit-elle le 13e salaire au prorata ?', a: 'Cela dépend du contrat et de la CCT applicable.' },
    ],
  },
  {
    path: 'blog/chantier-complet-peut-etre-en-perte-taux-horaire',
    title: 'Un chantier « réussi » peut quand même être en perte | Cantia',
    description:
      "Un chantier livré dans les temps, payé intégralement, peut malgré tout être en perte réelle si le coût horaire employé n’a jamais été comparé aux heures effectivement passées.",
    faq: [
      { q: 'Comment un chantier payé intégralement peut-il être en perte ?', a: 'Si les heures réellement passées dépassent significativement les heures devisées.' },
      { q: 'Pourquoi ce type de perte passe-t-il souvent inaperçu ?', a: 'Parce que la comptabilité générale reste positive grâce à d’autres chantiers plus rentables.' },
      { q: 'À quel moment faut-il vérifier si un chantier dérape en heures ?', a: 'En cours de chantier, pas à la clôture.' },
    ],
  },
  {
    path: 'blog/gerer-plusieurs-chantiers-en-parallele-methode',
    title: 'Gérer plusieurs chantiers en parallèle sans rien perdre | Cantia',
    description:
      "Passer de un à trois chantiers simultanés change la nature du travail : ce n’est plus une question de bras, c’est une question de mémoire et de coordination.",
    faq: [
      { q: 'Pourquoi gérer plusieurs chantiers est-il plus difficile que multiplier un seul chantier ?', a: 'Parce que la difficulté est la coordination et la mémoire des informations, pas la charge de travail.' },
      { q: 'Quel est le signe qu’une entreprise a besoin d’un meilleur système de suivi ?', a: 'Des questions récurrentes comme « c’était pour quel chantier ? ».' },
      { q: 'Un planning WhatsApp suffit-il pour gérer plusieurs chantiers ?', a: 'Ça fonctionne un temps, mais l’information s’y perd vite sans structure par chantier.' },
    ],
  },
  {
    path: 'blog/whatsapp-gestion-equipe-chantier-limites',
    title: 'WhatsApp pour gérer une équipe de chantier : les limites | Cantia',
    description:
      "WhatsApp fonctionne très bien pour deux ou trois personnes. Au-delà, l’information se noie dans le défilement des messages — voici pourquoi, et ce qui prend le relais.",
    faq: [
      { q: 'WhatsApp suffit-il pour gérer une petite équipe de chantier ?', a: 'Pour deux ou trois personnes et un chantier à la fois, oui.' },
      { q: 'Quel est le principal problème de WhatsApp pour plusieurs chantiers ?', a: 'L’absence de structure : aucun lien entre un message et le chantier concerné.' },
      { q: 'Faut-il abandonner WhatsApp complètement ?', a: 'Pas nécessairement — il reste efficace pour l’urgence ponctuelle.' },
    ],
  },
  {
    path: 'blog/devis-oral-valeur-legale-suisse',
    title: 'Devis accepté à l’oral : ça engage, mais ça ne se prouve pas | Cantia',
    description:
      "En droit suisse, un accord oral vaut contrat — le Code des obligations n’exige aucune forme écrite par défaut. Le problème n’est jamais la validité, c’est la preuve.",
    faq: [
      { q: 'Un accord oral pour des travaux est-il valable en droit suisse ?', a: 'Oui — l’art. 11 CO n’exige aucune forme particulière par défaut pour un contrat d’entreprise.' },
      { q: 'Quel est le principal risque d’un devis accepté uniquement à l’oral ?', a: 'La preuve, pas la validité : en cas de désaccord, il devient difficile de démontrer ce qui a été dit.' },
      { q: 'Un simple message écrit suffit-il à sécuriser un accord oral ?', a: 'Dans la majorité des cas pratiques, oui.' },
    ],
  },
  {
    path: 'blog/signature-electronique-devis-suisse-valeur-legale',
    title: 'Signer un devis en ligne : ce que ça vaut devant la loi | Cantia',
    description:
      "La signature électronique simple vaut acceptation contractuelle pour la quasi-totalité des devis du bâtiment. La signature qualifiée n’est nécessaire que dans des cas précis.",
    faq: [
      { q: 'Une signature électronique simple suffit-elle pour un devis de travaux ?', a: 'Oui, dans la quasi-totalité des cas.' },
      { q: 'Quand faut-il une signature électronique qualifiée plutôt que simple ?', a: 'Uniquement pour les actes exigeant légalement une forme écrite qualifiée, rare pour un devis du bâtiment.' },
      { q: 'Un devis signé électroniquement vaut-il plus qu’un PDF imprimé et signé à la main ?', a: 'Les deux ont une valeur de preuve comparable pour un contrat sans forme requise.' },
    ],
  },
  {
    path: 'blog/client-refuse-payer-solde-final-que-faire',
    title: 'Un client refuse de payer le solde final : la méthode | Cantia',
    description:
      "Un refus de paiement sur le solde final n’est presque jamais définitif — c’est souvent un désaccord sur un point précis. Distinguer les deux change toute la stratégie.",
    faq: [
      { q: 'Un client peut-il retenir tout le solde pour un défaut mineur ?', a: 'Une retenue doit rester proportionnée au défaut réel.' },
      { q: 'Quelle est la première étape face à un refus de paiement du solde final ?', a: 'Demander par écrit la raison précise du refus.' },
      { q: 'À quel moment envisager une procédure de poursuite ?', a: 'En dernier recours, après une mise en demeure formelle restée sans réponse.' },
    ],
  },
  {
    path: 'blog/avenant-chantier-plus-value-moins-value',
    title: 'Facturer un avenant en cours de chantier sans se faire piéger | Cantia',
    description:
      "Un client qui demande un changement en cours de chantier ne signe presque jamais d’avenant écrit sur le moment — ce qui transforme un service rendu en travail gratuit.",
    faq: [
      { q: 'Faut-il facturer une petite plus-value demandée en cours de chantier ?', a: 'Oui, systématiquement, pour maintenir une référence claire.' },
      { q: 'Quand faut-il faire valider le prix d’un avenant ?', a: 'Avant de démarrer le travail supplémentaire, pas après.' },
      { q: 'Une moins-value doit-elle aussi être documentée par écrit ?', a: 'Oui, pour éviter toute contestation ultérieure sur le montant final.' },
    ],
  },
  {
    path: 'blog/travail-au-noir-batiment-suisse-risques-controles',
    title: 'Travail au noir dans le bâtiment : ce que risque une entreprise | Cantia',
    description:
      "Le secteur de la construction fait partie des branches les plus contrôlées par la LTN. Plus de 14’000 contrôles d’entreprises ont eu lieu en 2025.",
    faq: [
      { q: 'La construction est-elle particulièrement contrôlée en Suisse ?', a: 'Oui, c’est l’une des branches prioritaires des contrôles LTN.' },
      { q: 'Quelle est la sanction la plus lourde en cas de travail au noir constaté ?', a: 'L’exclusion des marchés publics et la suppression d’aides financières.' },
      { q: 'Une entreprise risque-t-elle quelque chose si son sous-traitant est en infraction ?', a: 'Elle peut se retrouver associée au problème sur son propre chantier.' },
    ],
  },
  {
    path: 'blog/assurance-perte-de-gain-maladie-independant-batiment',
    title: 'Arrêt maladie indépendant : ce qui n’est PAS couvert | Cantia',
    description:
      "La LAMal paie les soins, jamais le revenu perdu. Sans assurance perte de gain maladie souscrite volontairement, un indépendant en arrêt n’a droit à aucun revenu de remplacement.",
    faq: [
      { q: 'La LAMal couvre-t-elle la perte de revenu en cas de maladie pour un indépendant ?', a: 'Non, elle ne couvre que les soins médicaux.' },
      { q: 'Un indépendant est-il obligé de souscrire une assurance perte de gain maladie ?', a: 'Non, cette assurance reste facultative.' },
      { q: 'Que se passe-t-il pour un indépendant sans couverture en cas d’arrêt prolongé ?', a: 'Il ne perçoit aucun revenu de remplacement.' },
    ],
  },
  {
    path: 'blog/photos-chantier-preuve-juridique-litige',
    title: 'Photos de chantier : la preuve la plus solide, si bien prise | Cantia',
    description:
      "Une photo de chantier vaut comme preuve devant un tribunal civil suisse — à condition d’être datée, contextualisée et conservée correctement.",
    faq: [
      { q: 'Une photo de chantier a-t-elle une vraie valeur de preuve devant un tribunal ?', a: 'Oui, si elle est datée de façon fiable et contextualisée.' },
      { q: 'À quels moments du chantier est-il le plus utile de prendre des photos ?', a: 'Avant travaux, avant fermeture d’éléments, et à la réception finale.' },
      { q: 'Pourquoi des photos sur des téléphones personnels sont-elles peu utilisables ?', a: 'Par manque de centralisation et d’horodatage fiable.' },
    ],
  },
  {
    path: 'blog/difference-devis-offre-facture-pro-forma',
    title: 'Devis, offre, facture pro forma : trois usages différents | Cantia',
    description:
      "Les trois termes s’utilisent souvent l’un pour l’autre dans le bâtiment suisse alors qu’ils n’engagent pas de la même façon.",
    faq: [
      { q: 'Un devis et une offre sont-ils la même chose dans le bâtiment ?', a: 'Oui dans la pratique.' },
      { q: 'Une facture pro forma engage-t-elle le client à payer ?', a: 'Non, c’est un document purement informatif.' },
      { q: 'Quelle est la différence entre un devis accepté et une vraie facture ?', a: 'Le devis accepté forme le contrat ; la facture crée une créance exigible.' },
    ],
  },
  {
    path: 'blog/logiciel-gestion-chantier-independant-seul',
    title: 'Logiciel de gestion de chantier en solo : utile ou pas ? | Cantia',
    description:
      "La plupart des outils de gestion de chantier ciblent des équipes. Un indépendant seul a des besoins différents mais tout aussi réels.",
    faq: [
      { q: 'Un logiciel de gestion de chantier est-il utile pour un indépendant sans équipe ?', a: 'Oui, surtout pour le temps administratif récupéré.' },
      { q: 'À partir de combien de devis par mois l’outil devient-il rentable ?', a: 'Dès quelques devis mensuels.' },
      { q: 'Quelles fonctionnalités restent inutiles pour un indépendant seul ?', a: 'Un planning d’équipe multi-personnes ou un système de permissions par rôle.' },
    ],
  },
  {
    path: 'blog/contrat-ecrit-petits-travaux-quand-necessaire',
    title: 'Petits travaux : quand un écrit devient nécessaire | Cantia',
    description:
      "Aucun seuil légal n’impose l’écrit pour un contrat d’entreprise en Suisse. Mais un seuil pratique existe bel et bien.",
    faq: [
      { q: 'Existe-t-il un montant à partir duquel un contrat écrit devient obligatoire ?', a: 'Non, aucun seuil légal n’existe en droit suisse.' },
      { q: 'Pourquoi formaliser par écrit même de petits travaux ?', a: 'Parce que le coût d’un désaccord de mémoire dépasse vite l’effort de rédaction.' },
      { q: 'Un simple SMS de confirmation suffit-il ?', a: 'Dans la plupart des cas pratiques, oui.' },
    ],
  },
  {
    path: 'blog/appel-offres-marches-publics-batiment-suisse',
    title: 'Marchés publics du bâtiment : ce qu’il faut savoir | Cantia',
    description:
      "Dès CHF 2 millions pour des travaux de construction, un marché public doit être publié sur SIMAP selon les seuils AIMP.",
    faq: [
      { q: 'À partir de quel montant un marché de construction doit-il être publié sur SIMAP ?', a: 'Autour de CHF 2 millions selon les seuils AIMP.' },
      { q: 'Les petits chantiers publics sont-ils accessibles aux petites entreprises ?', a: 'Oui, via des procédures de gré à gré sous le seuil de publication.' },
      { q: 'Le prix est-il le seul critère d’adjudication ?', a: 'Non, les critères sont généralement pondérés.' },
    ],
  },
  {
    path: 'blog/estimer-chantier-a-distance-devis-photo',
    title: 'Estimer un chantier à distance : jusqu’où c’est raisonnable | Cantia',
    description:
      "Un déplacement pour chaque demande de prix coûte du temps. Certaines estimations à distance sont fiables ; d’autres sont un pari risqué.",
    faq: [
      { q: 'Peut-on établir un devis ferme uniquement sur la base de photos ?', a: 'C’est risqué pour tout ce qui touche à l’état structurel existant.' },
      { q: 'Quels travaux se prêtent le mieux à une estimation à distance ?', a: 'Les remplacements à l’identique avec dimensions mesurables.' },
      { q: 'Comment limiter le risque d’une estimation à distance fausse ?', a: 'En la présentant comme indicative, non contractuelle.' },
    ],
  },
  {
    path: 'blog/resiliation-contrat-entreprise-chantier-en-cours',
    title: 'Résiliation d’un contrat d’entreprise en cours de chantier (art. 377 CO) | Cantia',
    description:
      "Un maître d’ouvrage peut résilier un contrat d’entreprise à tout moment, même en plein chantier — mais l’art. 377 CO lui impose de vous indemniser intégralement.",
    faq: [
      { q: 'Un client peut-il résilier un contrat de chantier sans raison ?', a: 'Oui, l’art. 377 CO le permet à tout moment tant que l’ouvrage n’est pas terminé.' },
      { q: 'Que doit payer le client qui résilie un chantier en cours ?', a: 'Le travail déjà exécuté, les dépenses engagées, et le gain manqué sur la part non réalisée.' },
      { q: 'Faut-il un motif écrit pour que la résiliation soit valable ?', a: 'Non, mais une notification claire et datée fixe le point de départ du calcul de l’indemnisation.' },
    ],
  },
  {
    path: 'blog/hypotheque-legale-artisans-entrepreneurs-suisse',
    title: 'Hypothèque légale des artisans et entrepreneurs : délai de 4 mois | Cantia',
    description:
      "L’hypothèque légale (art. 837 CC) garantit le paiement de vos travaux sur l’immeuble lui-même — mais elle doit être inscrite au registre foncier dans un délai de 4 mois.",
    faq: [
      { q: 'Qu’est-ce que l’hypothèque légale des artisans et entrepreneurs ?', a: 'Un droit de gage sur l’immeuble construit ou rénové, garantissant le paiement des travaux.' },
      { q: 'Quel est le délai pour l’inscrire ?', a: 'Quatre mois à compter de l’achèvement des travaux, sinon le droit s’éteint définitivement.' },
      { q: 'Un sous-traitant peut-il demander une hypothèque légale ?', a: 'Oui, indépendamment d’un lien contractuel direct avec le propriétaire de l’immeuble.' },
    ],
  },
  {
    path: 'blog/reception-travaux-proces-verbal-chantier',
    title: 'Réception des travaux : pourquoi le procès-verbal est essentiel | Cantia',
    description:
      "La réception des travaux déclenche le délai de garantie et fige les défauts constatés. Sans procès-verbal écrit, ce moment charnière devient impossible à prouver.",
    faq: [
      { q: 'La réception des travaux doit-elle obligatoirement être écrite ?', a: 'Pas de formalisme strict, mais sans écrit, prouver la date et les défauts devient très difficile.' },
      { q: 'Que se passe-t-il si le client refuse de signer le procès-verbal ?', a: 'L’entrepreneur peut l’établir unilatéralement et le notifier au client.' },
      { q: 'Quel est l’effet principal de la réception sur les garanties ?', a: 'Elle déclenche le point de départ du délai de garantie (2 ou 5 ans).' },
    ],
  },
  {
    path: 'blog/poursuite-facture-impayee-procedure-suisse',
    title: 'Facture impayée : la procédure de poursuite en Suisse | Cantia',
    description:
      "Réquisition de poursuite, commandement de payer, opposition, mainlevée : voici comment fonctionne une poursuite pour facture impayée, étape par étape.",
    faq: [
      { q: 'Faut-il un avocat pour lancer une poursuite en Suisse ?', a: 'Non, pour une créance simple et documentée, la démarche se fait sans représentation obligatoire.' },
      { q: 'Que se passe-t-il en cas d’opposition au commandement de payer ?', a: 'Il faut demander la mainlevée au tribunal pour la faire lever.' },
      { q: 'Une poursuite garantit-elle d’être payé ?', a: 'Non, elle peut se terminer par un acte de défaut de biens si le débiteur est insolvable.' },
    ],
  },
  {
    path: 'blog/mentions-obligatoires-facture-suisse-tva',
    title: 'Facture suisse : les mentions obligatoires côté TVA | Cantia',
    description:
      "Numéro TVA, taux applicable, date de prestation, référence QR : une facture incomplète peut être refusée en comptabilité ou contestée par un client.",
    faq: [
      { q: 'Le numéro IDE est-il obligatoire sur toute facture suisse ?', a: 'Oui, dès qu’une entreprise est assujettie à la TVA.' },
      { q: 'Quel taux de TVA s’applique aux travaux du bâtiment en Suisse ?', a: 'Le taux normal de 8,1 % s’applique à la majorité des prestations du bâtiment.' },
      { q: 'Une facture sans TVA détaillée est-elle valable ?', a: 'Au-delà de CHF 400.-, le taux et le montant de TVA doivent apparaître clairement.' },
    ],
  },
  {
    path: 'blog/devis-gratuit-ou-payant-que-dit-la-loi',
    title: 'Devis gratuit ou payant : ce que la loi suisse impose (rien) | Cantia',
    description:
      "Aucune loi suisse n’oblige un artisan à établir un devis gratuit — c’est un usage du marché, pas une obligation légale.",
    faq: [
      { q: 'La loi suisse oblige-t-elle à faire des devis gratuits ?', a: 'Non, aucune loi ne l’impose — c’est un usage du marché.' },
      { q: 'Peut-on déduire le prix d’un devis facturé du montant final ?', a: 'Oui, c’est une pratique courante et bien acceptée par les clients.' },
      { q: 'Faut-il prévenir le client avant de facturer un devis ?', a: 'Oui, dans les faits c’est indispensable pour éviter un litige commercial.' },
    ],
  },
  {
    path: 'blog/licenciement-ouvrier-batiment-delai-conge-cct',
    title: 'Licenciement dans le bâtiment : délais de congé CCT et CO | Cantia',
    description:
      "Le délai de congé d’un ouvrier du bâtiment dépend de son ancienneté et de la CCT applicable — se tromper expose à devoir indemniser la différence.",
    faq: [
      { q: 'Quel est le délai de congé légal pour 3 ans d’ancienneté ?', a: 'Deux mois pour la fin d’un mois selon l’art. 335c CO, sauf disposition CCT plus favorable.' },
      { q: 'Peut-on licencier un employé en arrêt maladie ?', a: 'Non, le congé donné pendant une période de protection est nul.' },
      { q: 'La CCT peut-elle prévoir un délai plus long que le CO ?', a: 'Oui, et dans ce cas elle prime sur le régime légal supplétif.' },
    ],
  },
  {
    path: 'blog/accident-travail-chantier-obligations-employeur-suva',
    title: 'Accident de travail sur chantier : obligations envers la SUVA | Cantia',
    description:
      "Déclaration dans les délais, salaire pendant l’incapacité, reprise du travail : un accident de chantier déclenche des obligations précises pour l’employeur.",
    faq: [
      { q: 'Qui paie le salaire les premiers jours après un accident ?', a: 'L’employeur continue à verser le salaire durant une courte période, avant la prise en charge SUVA.' },
      { q: 'Faut-il déclarer un accident même léger à la SUVA ?', a: 'Oui, dès qu’il entraîne une incapacité de travail ou des soins médicaux.' },
      { q: 'La SUVA est-elle obligatoire dans la construction ?', a: 'Oui, sans possibilité de choisir un autre assureur pour cette couverture.' },
    ],
  },
  {
    path: 'blog/apprenti-batiment-salaire-obligations-employeur',
    title: 'Apprenti dans le bâtiment : salaire et obligations employeur | Cantia',
    description:
      "Former un apprenti implique un salaire progressif fixé par la CCT, un encadrement pédagogique réel et une autorisation cantonale.",
    faq: [
      { q: 'Le salaire d’un apprenti du bâtiment est-il négociable ?', a: 'Non, il suit une grille fixée par la CCT du métier, progressive selon l’année de formation.' },
      { q: 'Faut-il une autorisation pour former un apprenti ?', a: 'Oui, une autorisation de former délivrée par l’autorité cantonale compétente.' },
      { q: 'Un apprenti a-t-il droit à un 13e salaire prorata ?', a: 'En général oui, selon les mêmes règles que les employés qualifiés.' },
    ],
  },
  {
    path: 'blog/vacances-non-prises-fin-annee-batiment-cct',
    title: 'Vacances non prises en fin d’année dans le bâtiment | Cantia',
    description:
      "Le solde de vacances non prises pose une vraie question de droit du travail — les vacances doivent être prises en nature, pas simplement payées.",
    faq: [
      { q: 'Peut-on payer les vacances non prises au lieu de les faire poser ?', a: 'En principe non tant que les rapports de travail durent, sauf cas particuliers.' },
      { q: 'Un employé peut-il reporter ses vacances sur l’année suivante ?', a: 'Oui, dans une mesure raisonnable, mais pas indéfiniment.' },
      { q: 'Qui décide de la date des vacances ?', a: 'L’employeur, en tenant compte des désirs de l’employé dans la mesure compatible avec l’entreprise.' },
    ],
  },
  {
    path: 'blog/calculer-prix-horaire-reel-ouvrier-batiment',
    title: 'Le vrai coût horaire d’un ouvrier du bâtiment | Cantia',
    description:
      "Un devis chiffré sur le seul salaire brut sous-estime systématiquement le vrai coût horaire — charges sociales et temps non facturable doivent entrer dans le calcul.",
    faq: [
      { q: 'Faut-il inclure les charges sociales dans le calcul du coût horaire ?', a: 'Oui, elles représentent généralement 15 à 20 % du salaire brut.' },
      { q: 'Combien d’heures un ouvrier travaille-t-il réellement par an ?', a: 'Autour de 1750 heures facturables en moyenne, une fois absences déduites.' },
      { q: 'Pourquoi le taux horaire de référence est-il souvent trop bas ?', a: 'Parce qu’il est hérité d’une pratique ancienne jamais recalculée.' },
    ],
  },
  {
    path: 'blog/pourquoi-entreprises-batiment-font-faillite-suisse',
    title: 'Pourquoi des entreprises du bâtiment en activité font faillite | Cantia',
    description:
      "Avoir du travail ne suffit pas — les causes les plus fréquentes de faillite dans le bâtiment sont un problème de trésorerie et de marge invisible.",
    faq: [
      { q: 'Un bon carnet de commandes protège-t-il de la faillite ?', a: 'Non, la cause la plus fréquente est un problème de trésorerie ou de marge non mesurée.' },
      { q: 'Pourquoi un chantier rentable peut-il créer une rupture de trésorerie ?', a: 'Parce que les charges se paient mensuellement alors que les clients règlent à 30-90 jours.' },
      { q: 'Quel est le meilleur indicateur de santé financière ?', a: 'La rentabilité mesurée chantier par chantier, pas le chiffre d’affaires global.' },
    ],
  },
  {
    path: 'blog/retard-chantier-meteo-obligations-contractuelles',
    title: 'Retard de chantier causé par la météo : qui est responsable ? | Cantia',
    description:
      "Un délai contractuel dépassé à cause d’intempéries n’est pas automatiquement une faute de l’entrepreneur — mais encore faut-il pouvoir le prouver.",
    faq: [
      { q: 'Un entrepreneur est-il responsable d’un retard causé par la météo ?', a: 'En principe non, tant que le retard reste raisonnable et a été communiqué au client.' },
      { q: 'Faut-il prévenir le client d’un retard dès qu’il devient probable ?', a: 'Oui, c’est la meilleure protection contractuelle.' },
      { q: 'Un relevé météo officiel suffit-il à justifier un retard ?', a: 'Une trace datée de ce qui s’est passé sur le chantier est souvent plus convaincante.' },
    ],
  },
  {
    path: 'blog/excel-vs-logiciel-gestion-chantier-limites',
    title: 'Excel pour gérer ses chantiers : jusqu’où ça tient | Cantia',
    description:
      "Excel fonctionne bien à petite échelle — jusqu’à ce qu’un deuxième employé le modifie en même temps, ou qu’un devis oublié coûte cher.",
    faq: [
      { q: 'Excel est-il suffisant pour une petite entreprise du bâtiment ?', a: 'Pour un usage ponctuel oui, mais les limites deviennent vite problématiques à l’échelle.' },
      { q: 'Quel est le principal risque d’Excel pour la gestion de chantier ?', a: 'L’absence de trace fiable des modifications et de lien automatique devis-facture-paiement.' },
      { q: 'À partir de quand faut-il un vrai logiciel de gestion ?', a: 'Dès que plusieurs chantiers ou plusieurs personnes accèdent aux mêmes informations en même temps.' },
    ],
  },
  {
    path: 'blog/combien-coute-logiciel-gestion-chantier-roi',
    title: 'Logiciel de gestion de chantier : ce qu’il coûte et rapporte | Cantia',
    description:
      "Le prix affiché d’un abonnement n’est qu’une partie du calcul — voici comment évaluer le retour réel d’un logiciel de gestion pour une entreprise du bâtiment.",
    faq: [
      { q: 'Comment évaluer si un logiciel de gestion est rentable ?', a: 'En comparant le temps administratif perdu, valorisé au taux horaire réel, au coût de l’abonnement.' },
      { q: 'Quel est le principal gain d’un logiciel de gestion ?', a: 'Le temps administratif récupéré sur les devis, factures et rapprochements manuels.' },
      { q: 'Un abonnement payant est-il nécessaire dès le départ ?', a: 'Pas forcément, un plan gratuit permet souvent de mesurer le gain réel avant d’investir.' },
    ],
  },
  {
    path: 'blog/assurance-chantier-tous-risques-ectr-obligatoire',
    title: 'Assurance chantier tous risques (ECTR) : obligatoire ou pas ? | Cantia',
    description:
      "Contrairement à la RC professionnelle, l’ECTR n’est imposée par aucune loi fédérale — mais son absence peut coûter très cher en cas de sinistre.",
    faq: [
      { q: 'L’ECTR est-elle obligatoire en Suisse ?', a: 'Non, aucune loi fédérale ne l’impose, mais son absence expose fortement les intervenants.' },
      { q: 'Qui souscrit généralement l’ECTR ?', a: 'Le plus souvent le maître d’ouvrage, au bénéfice de tous les intervenants du chantier.' },
      { q: 'L’ECTR remplace-t-elle la RC professionnelle ?', a: 'Non, ce sont deux couvertures différentes.' },
    ],
  },
  {
    path: 'blog/planning-chantier-eviter-conflits-ressources',
    title: 'Conflits de planning entre chantiers : comment les éviter | Cantia',
    description:
      "Un ouvrier ou une machine réservés deux fois le même jour sur deux chantiers différents — un classique quand le planning vit dans plusieurs têtes.",
    faq: [
      { q: 'Pourquoi les conflits de planning arrivent-ils même en équipe organisée ?', a: 'Parce que le planning existe souvent dans plusieurs endroits séparés, sans vue partagée.' },
      { q: 'Quel est le vrai coût d’un conflit de planning ?', a: 'Un trajet perdu, un client mécontent, et une improvisation plus coûteuse que le temps gagné.' },
      { q: 'Un planning centralisé suffit-il à éviter tous les conflits ?', a: 'Il réduit fortement le risque, à condition d’être mis à jour dès qu’un changement survient.' },
    ],
  },
  {
    path: 'blog/application-hors-ligne-chantier-pourquoi-important',
    title: 'Application de chantier sans réseau : le mode hors ligne | Cantia',
    description:
      "Un sous-sol en béton, une vallée mal couverte, un chantier isolé — le réseau mobile n’est jamais garanti sur un chantier.",
    faq: [
      { q: 'Pourquoi le réseau mobile n’est-il pas fiable sur un chantier ?', a: 'Structures en béton, sous-sols, zones rurales ou saturation locale du réseau.' },
      { q: 'Que se passe-t-il sans mode hors ligne ?', a: 'Photos et rapports risquent d’être perdus, poussant l’équipe à abandonner l’outil.' },
      { q: 'Un vrai mode hors ligne synchronise-t-il automatiquement ?', a: 'Oui, dès que le réseau revient, sans action manuelle de l’utilisateur.' },
    ],
  },
  {
    path: 'blog/facturation-heures-regie-batiment-comment-faire',
    title: 'Facturer en régie dans le bâtiment sans être contesté | Cantia',
    description:
      "Un travail facturé au temps passé plutôt qu’à prix fixe expose davantage à la contestation client — sauf si le détail est réellement traçable.",
    faq: [
      { q: 'Une facture en régie doit-elle détailler les heures jour par jour ?', a: 'Oui, un total global sans détail est bien plus contestable qu’un relevé précis.' },
      { q: 'Faut-il un accord écrit avant de facturer en régie ?', a: 'Pas obligatoire légalement, mais fortement recommandé pour éviter les litiges.' },
      { q: 'Comment se protéger si un client conteste les heures facturées ?', a: 'Avec un relevé d’heures horodaté, saisi au fur et à mesure.' },
    ],
  },
  {
    path: 'blog/sous-effectif-chantier-recruter-ou-sous-traiter',
    title: 'Manque de main-d’œuvre : recruter ou sous-traiter ? | Cantia',
    description:
      "Refuser des chantiers faute de personnel est un mauvais calcul, mais recruter trop vite en est un autre — voici comment trancher.",
    faq: [
      { q: 'Comment savoir s’il faut recruter plutôt que sous-traiter ?', a: 'Si la surcharge est structurelle et concerne une compétence centrale au métier.' },
      { q: 'Quel est le principal risque d’un recrutement précipité ?', a: 'Un salaire fixe qui pèse sur la trésorerie une fois le pic d’activité retombé.' },
      { q: 'La sous-traitance est-elle adaptée à un besoin ponctuel ?', a: 'Oui, elle convient bien à un pic limité dans le temps sans engagement long terme.' },
    ],
  },
  {
    path: 'blog/meilleur-logiciel-devis-facture-batiment-suisse-2026',
    title: 'Meilleur logiciel de devis et facturation bâtiment Suisse | Cantia',
    description:
      "QR-facture native, catalogue de prix, suivi par chantier, hors-ligne sur le terrain : les critères concrets pour choisir un logiciel de devis et facturation adapté au bâtiment suisse.",
    faq: [
      { q: 'Un logiciel de facturation généraliste suffit-il pour une entreprise du bâtiment ?', a: 'Rarement — la plupart n’ont pas de QR-facture native ni de lien devis/chantier.' },
      { q: 'Quel est le critère le plus important pour un logiciel bâtiment en Suisse ?', a: 'La QR-facture native conforme, couplée à un suivi par chantier.' },
      { q: 'Le logiciel doit-il fonctionner hors connexion ?', a: 'Idéalement oui, le réseau n’est jamais garanti sur un chantier.' },
    ],
  },
  {
    path: 'blog/logiciel-facturation-qr-facture-comparatif-suisse',
    title: 'Logiciel de facturation QR-facture : comparatif Suisse | Cantia',
    description:
      "Beaucoup d'outils affichent « QR-facture compatible » sans respecter la norme dans le détail — voici ce qui distingue un vrai support d'un module bricolé.",
    faq: [
      { q: 'Quelle est la différence entre IBAN et QR-IBAN ?', a: 'Le QR-IBAN est dédié aux QR-factures avec référence QR structurée (QRR).' },
      { q: 'Pourquoi une QR-facture peut-elle échouer au scan ?', a: 'Une adresse non structurée ou une zone de quiétude insuffisante peuvent bloquer le scan.' },
      { q: 'Depuis quand l’adresse structurée est-elle obligatoire ?', a: 'Depuis la norme 2.3 en novembre 2025, obligatoire dès le 30 septembre 2026.' },
    ],
  },
  {
    path: 'blog/crm-artisan-batiment-pourquoi-utile',
    title: 'CRM pour artisan du bâtiment : utile ou superflu ? | Cantia',
    description:
      "Un artisan qui gère 30, 50 ou 100 clients a le même problème de mémoire qu'un commercial — voici quand un CRM devient réellement utile.",
    faq: [
      { q: 'Un artisan indépendant a-t-il besoin d’un CRM ?', a: 'Dès qu’il devient difficile de se souvenir de l’historique de chaque client sans chercher dans ses e-mails.' },
      { q: 'Quelle est la différence entre un CRM et un carnet d’adresses ?', a: 'Un CRM relie l’historique complet (devis, factures, chantiers) à chaque client.' },
      { q: 'Faut-il un logiciel séparé pour le CRM et la facturation ?', a: 'Pas nécessairement, un outil qui relie nativement les deux évite la double saisie.' },
    ],
  },
  {
    path: 'blog/duree-validite-devis-non-signe-combien-temps',
    title: 'Combien de temps un devis reste valable en Suisse | Cantia',
    description:
      "Sans mention explicite, un devis non signé n'a pas de durée de validité légale fixe — ce qui expose l'entreprise à devoir honorer un ancien prix.",
    faq: [
      { q: 'Un devis a-t-il une durée de validité légale fixe en Suisse ?', a: 'Non, sans mention explicite le devis peut rester valable indéfiniment.' },
      { q: 'Quelle durée de validité choisir pour un devis de travaux ?', a: '30 jours est l’usage le plus courant dans le bâtiment suisse.' },
      { q: 'Que se passe-t-il si un client accepte un devis après sa date de validité ?', a: 'L’entreprise peut demander une réévaluation du prix.' },
    ],
  },
  {
    path: 'blog/note-de-credit-facture-rectificative-suisse',
    title: 'Corriger une facture envoyée : note de crédit en Suisse | Cantia',
    description:
      "Une erreur sur une facture déjà envoyée ne se corrige jamais en éditant le PDF original — voici la bonne méthode, conforme à la comptabilité suisse.",
    faq: [
      { q: 'Peut-on modifier une facture déjà envoyée à un client ?', a: 'Non, toute correction doit passer par une note de crédit suivie d’une nouvelle facture.' },
      { q: 'Qu’est-ce qu’une note de crédit exactement ?', a: 'Un document qui annule tout ou partie d’une facture déjà émise.' },
      { q: 'Faut-il une note de crédit pour une simple faute de frappe ?', a: 'Pas nécessairement si le montant et la TVA ne changent pas.' },
    ],
  },
  {
    path: 'blog/prescription-facture-impayee-delai-10-ans',
    title: 'Prescription d’une facture impayée en Suisse : le délai | Cantia',
    description:
      "Une créance contractuelle se prescrit en principe par 10 ans en Suisse — mais des actes interruptifs existent, à ne jamais laisser filer.",
    faq: [
      { q: 'Au bout de combien de temps une créance se prescrit-elle en Suisse ?', a: 'En principe 10 ans pour une créance contractuelle (art. 127 CO).' },
      { q: 'Une relance amiable interrompt-elle la prescription ?', a: 'Non, seuls une poursuite, une reconnaissance de dette ou une action en justice l’interrompent.' },
      { q: 'Que se passe-t-il quand une créance est prescrite ?', a: 'Le débiteur peut légalement refuser de payer en invoquant la prescription.' },
    ],
  },
  {
    path: 'blog/numerotation-facture-obligations-legales-suisse',
    title: 'Numérotation des factures en Suisse : la continuité | Cantia',
    description:
      "Un numéro de facture sauté ou réutilisé attire immédiatement l'attention lors d'un contrôle fiscal — la continuité numérique est l'un des premiers points vérifiés.",
    faq: [
      { q: 'La numérotation continue des factures est-elle obligatoire en Suisse ?', a: 'L’AFC attend une série chronologique et traçable, vérifiée en cas de contrôle.' },
      { q: 'Peut-on réutiliser un numéro de facture annulée ?', a: 'Non, une facture annulée doit rester identifiable avec une note de crédit associée.' },
      { q: 'Que risque une entreprise avec une numérotation désordonnée ?', a: 'Un contrôle fiscal peut interpréter les incohérences comme un signe de dissimulation.' },
    ],
  },
  {
    path: 'blog/difference-sia-108-sia-118-devis-contrat',
    title: 'SIA 108 vs SIA 118 : deux normes, deux rôles différents | Cantia',
    description:
      "La SIA 118 régit les relations avec l'entrepreneur, la SIA 108 celles avec les mandataires — les confondre expose à appliquer les mauvaises règles.",
    faq: [
      { q: 'Quelle norme SIA s’applique à un artisan qui exécute des travaux ?', a: 'La SIA 118, qui régit le contrat d’entreprise.' },
      { q: 'Les normes SIA s’appliquent-elles automatiquement à un chantier ?', a: 'Non, elles doivent être explicitement mentionnées dans le contrat ou le devis.' },
      { q: 'Quelle est la différence de régime entre les deux normes ?', a: 'La SIA 118 repose sur une obligation de résultat, la SIA 108 sur une obligation de moyens.' },
    ],
  },
  {
    path: 'blog/degats-voisinage-chantier-qui-est-responsable',
    title: 'Dégâts au voisinage causés par un chantier : qui paie ? | Cantia',
    description:
      "Une fissure chez le voisin après des travaux, de la poussière sur une façade : la responsabilité n'est pas automatique, et se prouve avec un état des lieux préalable.",
    faq: [
      { q: 'Qui est responsable des dégâts causés à un voisin par un chantier ?', a: 'L’entrepreneur répond de sa propre exécution fautive.' },
      { q: 'Comment se protéger contre une accusation de dégât non fondée ?', a: 'En réalisant un état des lieux contradictoire, avec photos datées, avant travaux.' },
      { q: 'L’assurance RC professionnelle couvre-t-elle les dégâts au voisinage ?', a: 'En général oui, si le dommage est correctement documenté.' },
    ],
  },
  {
    path: 'blog/retenue-de-garantie-chantier-consignation',
    title: 'Retenue de garantie sur un chantier : ce qu’elle couvre | Cantia',
    description:
      "Un maître d'ouvrage retient parfois 5 à 10 % du montant final — une pratique qui n'est pas automatique et doit être négociée, pas subie.",
    faq: [
      { q: 'Un maître d’ouvrage peut-il imposer une retenue sans accord préalable ?', a: 'Non, elle doit être négociée et acceptée explicitement.' },
      { q: 'Quel pourcentage est généralement retenu sur un chantier ?', a: 'Entre 5 et 10 % du montant final selon ce qui a été négocié.' },
      { q: 'Existe-t-il une alternative à la retenue en espèces ?', a: 'Oui, une garantie bancaire à première demande.' },
    ],
  },
  {
    path: 'blog/litige-chantier-mediation-ou-tribunal',
    title: 'Litige de chantier : médiation, conciliation ou tribunal | Cantia',
    description:
      "Le tribunal n'est presque jamais la première étape logique — une procédure de conciliation est même obligatoire avant la plupart des actions civiles.",
    faq: [
      { q: 'Faut-il obligatoirement passer par une conciliation avant un procès en Suisse ?', a: 'Oui, pour la majorité des litiges civils, c’est une condition de recevabilité.' },
      { q: 'La médiation est-elle obligatoire pour un litige de chantier ?', a: 'Non, elle est volontaire, contrairement à la conciliation.' },
      { q: 'Qu’est-ce qui accélère le plus une conciliation ?', a: 'Un dossier documentaire solide (devis, échanges, photos).' },
    ],
  },
  {
    path: 'blog/certificat-de-travail-obligation-employeur-batiment',
    title: 'Certificat de travail dans le bâtiment : une obligation | Cantia',
    description:
      "Un employé quittant l'entreprise a le droit d'exiger un certificat de travail à tout moment — le refuser expose l'employeur à un litige.",
    faq: [
      { q: 'Un employeur peut-il refuser de délivrer un certificat de travail ?', a: 'Non, c’est un droit de l’employé prévu par l’art. 330a CO.' },
      { q: 'Quelle est la différence entre certificat complet et attestation simple ?', a: 'Le certificat complet inclut une appréciation, l’attestation non.' },
      { q: 'Peut-on mentionner une maladie dans un certificat de travail ?', a: 'Non, sauf lien direct avec la prestation de travail.' },
    ],
  },
  {
    path: 'blog/demission-employe-batiment-preavis-a-respecter',
    title: 'Démission d’un employé du bâtiment : le délai de préavis | Cantia',
    description:
      "Le préavis de démission suit les mêmes règles que le licenciement — un employé qui part sans le respecter expose l'entreprise à un manque organisationnel.",
    faq: [
      { q: 'Le délai de préavis est-il le même pour une démission et un licenciement ?', a: 'Oui, l’art. 335c CO fixe le même régime dans les deux sens.' },
      { q: 'Que peut faire un employeur si un employé part sans préavis ?', a: 'Il peut réclamer une indemnité équivalente au salaire du délai non respecté.' },
      { q: 'Un employé peut-il partir immédiatement pour justes motifs ?', a: 'Oui, mais cela exige des motifs sérieux et documentés.' },
    ],
  },
  {
    path: 'blog/travailleur-temporaire-interimaire-batiment-regles',
    title: 'Intérimaire dans le bâtiment : règles et pièges à éviter | Cantia',
    description:
      "L'intérim permet d'absorber un pic d'activité rapidement, mais implique une entreprise de location de services soumise à autorisation.",
    faq: [
      { q: 'Peut-on prêter du personnel entre entreprises sans agence ?', a: 'Non, un vrai prêt de main-d’œuvre nécessite une entreprise de location de services autorisée.' },
      { q: 'Un intérimaire est-il soumis à la CCT du chantier ?', a: 'Oui, au même titre qu’un employé fixe.' },
      { q: 'Pourquoi un intérimaire coûte-t-il plus cher à l’heure ?', a: 'Le tarif inclut déjà salaire, charges sociales et marge de l’agence.' },
    ],
  },
  {
    path: 'blog/calculer-prix-de-revient-chantier-batiment',
    title: 'Prix de revient d’un chantier : la méthode de calcul | Cantia',
    description:
      "Le montant facturé n'est pas le prix de revient. Sans additionner main-d'œuvre réelle, matériaux et sous-traitance, impossible de savoir si un chantier a été rentable.",
    faq: [
      { q: 'Le montant facturé est-il le même que le prix de revient ?', a: 'Non, le prix de revient additionne le coût réel de tous les postes.' },
      { q: 'Pourquoi calculer le prix de revient chantier par chantier ?', a: 'Un chiffre d’affaires positif peut masquer des chantiers individuellement perdants.' },
      { q: 'Quelle est la composante la plus souvent sous-estimée ?', a: 'La main-d’œuvre réelle au coût horaire complet.' },
    ],
  },
  {
    path: 'blog/previsionnel-tresorerie-entreprise-batiment',
    title: 'Prévisionnel de trésorerie pour une entreprise du bâtiment | Cantia',
    description:
      "Pas besoin d'un plan financier complexe pour anticiper un creux de trésorerie — un prévisionnel à 30-60-90 jours suffit à voir venir les problèmes.",
    faq: [
      { q: 'Un prévisionnel de trésorerie doit-il être complexe ?', a: 'Non, un prévisionnel simple à 30-60-90 jours suffit pour une PME.' },
      { q: 'À quelle fréquence mettre à jour un prévisionnel ?', a: 'Idéalement à chaque nouvelle facture ou paiement reçu.' },
      { q: 'Quel est le principal bénéfice d’un prévisionnel ?', a: 'Repérer un creux plusieurs semaines à l’avance pour agir à temps.' },
    ],
  },
  {
    path: 'blog/checklist-ouverture-chantier-artisan',
    title: 'Checklist d’ouverture de chantier : avant le premier jour | Cantia',
    description:
      "Un chantier qui démarre mal coûte du temps et de l'argent à rattraper. Une checklist simple évite l'essentiel des mauvaises surprises.",
    faq: [
      { q: 'Pourquoi documenter l’état des lieux avant le chantier ?', a: 'Pour se protéger en cas de contestation ultérieure sur l’état préexistant.' },
      { q: 'Faut-il attendre l’acompte avant de démarrer ?', a: 'C’est fortement recommandé pour éviter un risque financier évitable.' },
      { q: 'Quelle est la cause la plus fréquente de faux départ de chantier ?', a: 'Un point administratif ou logistique oublié.' },
    ],
  },
  {
    path: 'blog/checklist-cloture-chantier-avant-facturation',
    title: 'Checklist de fin de chantier avant la facture finale | Cantia',
    description:
      "Une facture finale envoyée trop vite ouvre la porte à des contestations évitables. Voici les points à cocher avant de clôturer un chantier.",
    faq: [
      { q: 'Pourquoi documenter la réception avant la facture finale ?', a: 'Elle déclenche le délai de garantie et fige les défauts constatés.' },
      { q: 'Que risque-t-on à oublier des travaux supplémentaires ?', a: 'Une perte financière directe et une difficulté à les réclamer après coup.' },
      { q: 'Faut-il archiver le dossier après la facturation finale ?', a: 'Oui, il reste utile pendant toute la période de garantie.' },
    ],
  },
  {
    path: 'telechargement',
    title: 'Télécharger Cantia | App mobile & web',
    description:
      "Cantia fonctionne comme une application web installable, sur ordinateur comme sur téléphone. Applications natives iOS et Android bientôt disponibles.",
  },
  {
    path: 'mentions-legales',
    title: 'Mentions légales | Cantia',
    description: "Mentions légales de Cantia, logiciel de gestion de chantier pour le bâtiment suisse.",
  },
  {
    path: 'confidentialite',
    title: 'Politique de confidentialité | Cantia',
    description:
      "Politique de confidentialité de Cantia : données collectées, hébergement en Suisse, droits des utilisateurs.",
  },
];

// Turns "rapports-chantier" into "Rapports chantier" for a breadcrumb label
// — not shown to visitors, just needs to be a reasonable name for the node.
function humanizeSegment(segment) {
  const words = segment.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function jsonLdFor(url, description, faq) {
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Cantia',
      url: `${SITE}/`,
      logo: OG_IMAGE,
      email: 'info@cantia.ch',
      areaServed: { '@type': 'Country', name: 'Switzerland' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cantia',
      operatingSystem: 'Android, iOS, Web',
      applicationCategory: 'BusinessApplication',
      description,
      url,
      image: OG_IMAGE,
      publisher: { '@id': `${SITE}/#organization` },
      offers: { '@type': 'AggregateOffer', priceCurrency: 'CHF', lowPrice: '0', offerCount: '3' },
    },
  ];
  if (url === `${SITE}/`) {
    // Homepage only — lets Google understand the site as a whole (and is
    // the prerequisite for a sitelinks search box, though that's Google's
    // call, not something this markup can force).
    graph.push({
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Cantia',
      url: `${SITE}/`,
      inLanguage: 'fr-CH',
      publisher: { '@id': `${SITE}/#organization` },
    });
  } else {
    // Every other page gets a breadcrumb back to the homepage — cheap,
    // accurate (it's literally the URL structure), and one of the few
    // structured-data types safe to add without any real risk of a
    // manual-action penalty for fabricated content.
    const segments = url.replace(SITE, '').split('/').filter(Boolean);
    const items = [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` }];
    let acc = '';
    segments.forEach((seg, i) => {
      acc += `/${seg}`;
      items.push({ '@type': 'ListItem', position: i + 2, name: humanizeSegment(seg), item: `${SITE}${acc}` });
    });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items });
  }
  // Matches the visible FAQ section rendered on the same page
  // (components/SolutionPage.tsx) — Google requires structured data to
  // reflect content actually shown to visitors, not hidden-only markup.
  if (faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
