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
  title: 'Cantia — Gestion de chantier pour artisans et entreprises du bâtiment (Suisse)',
  description:
    "Rapports de chantier, devis, photos géolocalisées, documents et levés cadastraux suisses — tout au même endroit. Le logiciel de gestion de chantier pensé pour le bâtiment en Suisse.",
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
