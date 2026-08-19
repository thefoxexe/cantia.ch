import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-heures-travail-ouvrier-minutes-decimales',
  question: 'Comment calculer des heures de travail comme "4h45" sans se tromper en décimal ?',
  title: 'Calculer des heures de travail : pourquoi 4h45 n’est pas 4,45',
  description:
    'Un ouvrier qui a travaillé de 8h à 12h45 a fait 4h45 — pas 4,45 heures décimales (qui vaudrait 4h27). Voici pourquoi cette confusion coûte cher sur une fiche de salaire.',
  excerpt:
    '4h45 de travail, ce n’est pas 4,45 heures. La confusion entre minutes et centièmes d’heure est l’erreur de saisie RH la plus fréquente dans le bâtiment — et la plus coûteuse.',
  category: 'RH & salaires',
  keywords: ['heures de travail', 'décompte heures', 'salaire horaire', 'rh bâtiment', 'fiche de paie'],
  publishedAt: '2026-02-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un ouvrier commence à 8h00 et termine à 12h45. Combien d’heures a-t-il travaillé ? La réponse instinctive — "4h45" — est la bonne. Mais dès qu’il faut la transcrire dans un tableur ou un logiciel de paie, une confusion classique s’installe : 4h45 n’est pas 4,45 en écriture décimale.',
    },
    { type: 'h2', text: 'Le piège du séparateur' },
    {
      type: 'p',
      text: '45 minutes représentent 45/60 d’heure, soit 0,75 heure décimal — donc 4h45 de travail équivaut à 4,75 heures décimales, pas 4,45. L’erreur vient du fait que la plupart des gens écrivent naturellement "4.45" ou "4,45" en pensant aux minutes affichées sur une montre, sans faire mentalement la conversion en centièmes d’heure.',
    },
    {
      type: 'table',
      headers: ['Ce qu’on écrit (minutes)', 'Ce que ça veut dire', 'Équivalent décimal correct'],
      rows: [
        ['4.15', '4h15', '4.25'],
        ['4.30', '4h30', '4.50'],
        ['4.45', '4h45', '4.75'],
        ['7.50', '7h50', '7.83'],
      ],
    },
    {
      type: 'callout',
      title: 'Pourquoi ça coûte cher',
      text: 'Sur une fiche de salaire mensuelle cumulant des dizaines d’entrées d’heures, une conversion minutes/décimal ratée sur chaque ligne peut faire dériver le total de plusieurs heures sans qu’aucune erreur individuelle ne saute aux yeux — le salaire versé est alors faux, dans un sens ou dans l’autre.',
    },
    { type: 'h2', text: 'Deux façons fiables de noter des heures' },
    {
      type: 'list',
      items: [
        'Toujours noter en heures et minutes explicites : "4h45", jamais un nombre ambigu seul',
        'Si un champ décimal est vraiment nécessaire, convertir systématiquement les minutes en soixantièmes avant de taper le nombre (45 min = 0,75, pas 0,45)',
        'Le plus fiable reste de saisir directement l’heure de début et l’heure de fin ("8h00" à "12h45") et de laisser le calcul du total se faire automatiquement — la source d’erreur humaine disparaît complètement',
      ],
    },
    { type: 'h2', text: 'Ce que ça veut dire pour un logiciel RH bâtiment' },
    {
      type: 'p',
      text: 'Un bon outil de suivi d’heures doit accepter la façon dont les gens écrivent naturellement une durée — "4.45" pour dire 4h45 — plutôt que d’imposer une saisie en décimal pur qui ne correspond à aucune habitude réelle sur un chantier. C’est un détail d’ergonomie qui évite des dizaines de petites erreurs de paie chaque mois.',
    },
    {
      type: 'cta',
      title: 'Les heures se saisissent comme on les pense',
      text: 'Dans le module RH & Salaires de Cantia, "4.45" saisi dans le champ Heures est automatiquement compris comme 4h45 — jamais comme une fraction décimale d’heure — exactement comme les champs de début et de fin de journée.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Comment convertir 4h45 de travail en heures décimales ?',
      answer:
        '45 minutes correspondent à 45/60 = 0,75 heure. 4h45 de travail équivaut donc à 4,75 heures décimales — pas 4,45, qui correspondrait en réalité à 4h27.',
    },
    {
      question: 'Pourquoi tant d’erreurs de paie viennent-elles de la saisie des heures ?',
      answer:
        'Parce que la façon naturelle d’écrire une durée ("4h45", tapé "4.45") ressemble visuellement à un nombre décimal, alors que les chiffres après le séparateur représentent des minutes (base 60) et non des centièmes (base 100).',
    },
    {
      question: 'Quelle est la méthode la plus sûre pour noter des heures de chantier ?',
      answer:
        'Saisir directement l’heure de début et l’heure de fin plutôt qu’une durée totale calculée à la main — le total se calcule alors automatiquement, sans risque de confusion entre minutes et décimales.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
