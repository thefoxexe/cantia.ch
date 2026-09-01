import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-heures-travail-ouvrier-minutes-decimales',
  question: 'Comment calculer des heures de travail comme "4h45" sans se tromper en décimal ?',
  title: 'Calculer des heures de travail : pourquoi 4h45 n’est pas 4,45',
  description:
    'Un ouvrier qui a travaillé de 8h à 12h45 a fait 4h45, et non 4,45 heures décimales (qui vaudrait 4h27). Voici pourquoi cette confusion coûte cher sur une fiche de salaire.',
  excerpt:
    '4h45 de travail n’est pas 4,45 heures. C’est l’erreur de saisie RH la plus fréquente du bâtiment : sans doute celle qui fausse le plus de fiches de paie, sans que personne s’en aperçoive.',
  category: 'RH & salaires',
  keywords: ['heures de travail', 'décompte heures', 'salaire horaire', 'rh bâtiment', 'fiche de paie'],
  publishedAt: '2026-02-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un ouvrier commence à 8h00, termine à 12h45. Combien d’heures a-t-il travaillé ? « 4h45 » est la bonne réponse instinctive. Le problème arrive dès qu’il faut la taper dans un tableur ou un logiciel de paie : 4h45 n’est pas 4,45 en écriture décimale, et cette confusion produit des fiches de salaire fausses sans qu’aucun signal d’alarme ne se déclenche.',
    },
    { type: 'h2', text: 'Le piège du séparateur' },
    {
      type: 'p',
      text: '45 minutes valent 45/60 d’heure, soit 0,75 heure décimal. 4h45 de travail équivaut donc à 4,75 heures décimales, pas 4,45. L’erreur vient d’une confusion très naturelle : on écrit « 4.45 » en pensant aux minutes affichées sur une montre, sans convertir mentalement en centièmes d’heure.',
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
      title: 'Pourquoi ça coûte réellement de l’argent',
      text: 'Sur une fiche de salaire mensuelle cumulant des dizaines d’entrées, une conversion ratée sur chaque ligne fait dériver le total de plusieurs heures sans qu’aucune erreur individuelle ne saute aux yeux. Le salaire versé finit faux (trop haut ou trop bas), et personne ne sait pourquoi les chiffres ne collent plus.',
    },
    { type: 'h2', text: 'Deux façons fiables de noter une durée' },
    {
      type: 'list',
      items: [
        'Toujours noter en heures et minutes explicites : « 4h45 », jamais un nombre ambigu seul',
        'Si un champ décimal est vraiment nécessaire, convertir systématiquement les minutes en soixantièmes avant de taper le nombre (45 min = 0,75, jamais 0,45)',
        'Le plus fiable reste de saisir l’heure de début et l’heure de fin (« 8h00 » à « 12h45 ») et de laisser le total se calculer automatiquement, ce qui élimine complètement l’erreur humaine',
      ],
    },
    { type: 'h2', text: 'Ce que ça implique pour un outil RH bâtiment' },
    {
      type: 'p',
      text: 'Un bon outil de suivi d’heures doit accepter la façon dont les gens écrivent naturellement une durée (« 4.45 » pour dire 4h45), plutôt que d’imposer une saisie en décimal pur qui ne correspond à aucune habitude réelle sur un chantier. C’est un détail d’ergonomie minuscule qui évite des dizaines de petites erreurs de paie chaque mois, mois après mois.',
    },
    {
      type: 'cta',
      title: 'Les heures se saisissent comme on les pense',
      text: 'Dans le module RH & Salaires de Cantia, « 4.45 » saisi dans le champ Heures est compris comme 4h45 (jamais comme une fraction décimale), exactement comme les champs de début et de fin de journée.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Comment convertir 4h45 de travail en heures décimales ?',
      answer:
        '45 minutes correspondent à 45/60 = 0,75 heure. 4h45 de travail équivaut donc à 4,75 heures décimales, et non à 4,45, qui correspondrait en réalité à 4h27.',
    },
    {
      question: 'Pourquoi tant d’erreurs de paie viennent-elles de la saisie des heures ?',
      answer:
        'Parce que la façon naturelle d’écrire une durée ("4h45", tapé "4.45") ressemble visuellement à un nombre décimal, alors que les chiffres après le séparateur représentent des minutes (base 60) et non des centièmes (base 100).',
    },
    {
      question: 'Quelle est la méthode la plus sûre pour noter des heures de chantier ?',
      answer:
        'Saisir directement l’heure de début et l’heure de fin plutôt qu’une durée totale calculée à la main : le total se calcule alors automatiquement, sans risque de confusion entre minutes et décimales.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
