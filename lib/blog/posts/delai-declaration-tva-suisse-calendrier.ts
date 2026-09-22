import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'delai-declaration-tva-suisse-calendrier',
  question: 'Quelles sont les dates limites de déclaration TVA en Suisse ?',
  title: 'Dates de déclaration TVA en Suisse : le calendrier à ne jamais manquer',
  description:
    'Le rythme des échéances TVA en Suisse selon la méthode choisie, la conséquence d’un dépôt tardif, et comment éviter de rater une échéance quand on gère un chantier.',
  excerpt:
    'Ce n’est jamais le calcul qui pose problème, c’est la date qui passe inaperçue au milieu d’un chantier. Voici le rythme à connaître et la marche à suivre pour ne plus le rater.',
  category: 'Juridique & normes',
  keywords: [
    'date limite déclaration tva suisse',
    'calendrier tva entreprise bâtiment',
    'échéance décompte tva',
    'délai dépôt tva afc',
    'intérêt moratoire tva suisse',
  ],
  publishedAt: '2026-09-21',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La difficulté n’est presque jamais de calculer la TVA due, mais de se souvenir de la date à laquelle le décompte doit être déposé, au milieu d’un planning de chantiers qui ne laisse pas beaucoup de place à l’administratif. Le rythme dépend de la méthode de décompte choisie, et il vaut mieux le fixer une bonne fois dans un agenda que de le redécouvrir à chaque trimestre.',
    },
    { type: 'h2', text: 'Le rythme selon la méthode choisie' },
    {
      type: 'list',
      items: [
        'Méthode effective : décompte généralement trimestriel, soit quatre échéances par année civile.',
        'Taux de la dette fiscale nette (TDFN) : décompte généralement semestriel, soit deux échéances par année.',
        'Décompte mensuel : possible sur demande auprès de l’AFC, notamment pour les entreprises qui préfèrent lisser leur trésorerie plutôt que provisionner un montant plus important tous les trois mois.',
      ],
    },
    { type: 'h2', text: 'Le délai type après la fin de chaque période' },
    {
      type: 'p',
      text: 'Le décompte doit généralement être transmis dans les 60 jours suivant la fin de la période concernée (trimestre, semestre ou mois selon le rythme choisi). Ce délai est une indication habituelle, pas une règle immuable d’une année sur l’autre : la date exacte affichée sur le portail AFC pour chaque entreprise fait foi, et c’est elle qu’il faut suivre, pas une estimation approximative.',
    },
    { type: 'h2', text: 'Ce que coûte un dépôt tardif' },
    {
      type: 'p',
      text: 'Un décompte déposé après l’échéance entraîne généralement un intérêt moratoire sur le montant dû, calculé à partir de la date d’échéance et non de la date de dépôt effectif. Ce coût s’applique même si le montant déclaré est exact, ce qui signifie qu’un décompte estimé déposé à temps, puis corrigé ensuite, coûte souvent moins cher qu’un décompte parfait déposé en retard.',
    },
    {
      type: 'callout',
      title: 'Le bon réflexe : un rappel fixé dès l’inscription à la TVA',
      text: 'Dès l’attribution du numéro TVA, mieux vaut poser dans son agenda les quatre (ou deux) échéances de l’année à venir, avec un rappel une à deux semaines avant chacune. C’est le seul moyen fiable de ne jamais rater une date au milieu d’un chantier chargé.',
    },
    {
      type: 'cta',
      title: 'Ne plus découvrir l’échéance TVA le jour même',
      text: 'Cantia garde une vue d’ensemble sur les factures et les chantiers en cours, pour que la préparation du décompte TVA ne soit jamais une surprise de dernière minute.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Que faire si on sait déjà qu’on ne pourra pas respecter l’échéance TVA ?',
      answer:
        'Il est possible de demander une prolongation de délai auprès de l’AFC avant l’échéance. Cela évite l’intérêt moratoire automatique lié à un dépôt tardif non annoncé.',
    },
    {
      question: 'Le décompte mensuel est-il intéressant pour une petite entreprise du bâtiment ?',
      answer:
        'Il peut l’être pour lisser la trésorerie en évitant de provisionner un gros montant trimestriel, mais il multiplie aussi le nombre de démarches administratives dans l’année. C’est un arbitrage à faire selon la taille de l’équipe comptable.',
    },
    {
      question: 'L’intérêt moratoire s’applique-t-il même pour quelques jours de retard ?',
      answer:
        'Oui, l’intérêt moratoire se calcule généralement dès le lendemain de l’échéance, sans jours de tolérance automatique. Mieux vaut anticiper que compter sur une marge.',
    },
  ],
  relatedSlugs: [
    'declaration-tva-trimestrielle-artisan-suisse',
    'tva-methode-effective-ou-tdfn-batiment',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
