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
