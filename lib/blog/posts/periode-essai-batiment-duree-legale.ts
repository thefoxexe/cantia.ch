import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'periode-essai-batiment-duree-legale',
  question: 'Quelle est la durée légale de la période d’essai dans le bâtiment en Suisse ?',
  title: 'Période d’essai dans le bâtiment : durée légale et ce qu’on peut y faire',
  description:
    'Durée légale de la période d’essai selon le Code des obligations, possibilité de la prolonger contractuellement, délai de congé raccourci, et spécificités CCT bâtiment.',
  excerpt:
    'La période d’essai protège les deux parties, mais seulement si elle est formalisée par écrit — un oubli fréquent qui coûte cher en cas de désaccord.',
  category: 'RH & salaires',
  keywords: ['période d’essai', 'contrat de travail', 'bâtiment', 'code des obligations', 'délai de congé'],
  publishedAt: '2026-09-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La période d’essai est souvent traitée comme une formalité de contrat de travail, alors qu’elle a des conséquences juridiques concrètes, en particulier sur le délai de congé applicable en cas de rupture.',
    },
    { type: 'h2', text: '1. Le régime légal par défaut' },
    {
      type: 'p',
      text: 'Selon le Code des obligations, si le contrat de travail ne précise rien, le premier mois d’emploi est considéré comme période d’essai. Les parties peuvent toutefois convenir contractuellement d’une durée différente, généralement jusqu’à un maximum de trois mois. Il est également possible de supprimer la période d’essai par accord écrit, ou de la prolonger en cas d’absence du travailleur (maladie, accident) pendant cette période, dans les limites prévues par la loi.',
    },
    { type: 'h2', text: '2. Un délai de congé raccourci pendant l’essai' },
    {
      type: 'p',
      text: 'Pendant la période d’essai, le délai de congé est nettement plus court que pendant le reste du contrat, ce qui permet à l’employeur comme à l’employé de mettre fin rapidement à une collaboration qui ne convient pas. Ce délai raccourci, généralement de quelques jours, est fixé par la loi sauf accord contraire dans le contrat, et cesse de s’appliquer dès la fin de la période d’essai.',
    },
    { type: 'h2', text: '3. Les spécificités liées à la CCT du secteur' },
    {
      type: 'p',
      text: 'La convention collective de travail du secteur principal de la construction peut prévoir des dispositions particulières sur la période d’essai, notamment pour certaines catégories de travailleurs. Comme ces règles peuvent varier et évoluer, il est recommandé de vérifier les dispositions applicables auprès de votre commission paritaire ou de votre association professionnelle avant de rédiger un contrat, plutôt que de se fier uniquement au régime légal général.',
    },
    {
      type: 'callout',
      title: 'Pourquoi l’écrit protège les deux parties',
      text: 'Sans clause écrite précisant la durée de la période d’essai, c’est le régime par défaut d’un mois qui s’applique, ce qui laisse peu de temps pour évaluer sérieusement un nouvel employé sur un chantier. À l’inverse, une clause claire dès l’embauche évite toute contestation sur le délai de congé applicable en cas de rupture précoce.',
    },
    {
      type: 'cta',
      title: 'Des contrats de travail chantier prêts à signer, sans clause oubliée',
      text: 'Cantia vous aide à centraliser les dossiers RH de vos employés — contrats, dates clés, périodes d’essai — pour ne plus jamais partir d’une feuille blanche à chaque embauche.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est la durée maximale de la période d’essai dans le bâtiment ?',
      answer:
        'Le régime légal par défaut est d’un mois si rien n’est précisé au contrat, mais les parties peuvent convenir par écrit d’une durée allant généralement jusqu’à trois mois. Vérifiez également les éventuelles dispositions spécifiques de la CCT applicable à votre entreprise.',
    },
    {
      question: 'Peut-on prolonger la période d’essai en cas de maladie de l’employé ?',
      answer:
        'Oui, une absence pour cause de maladie, accident ou service obligatoire pendant la période d’essai peut la prolonger d’une durée équivalente, dans les limites prévues par la loi. Cela permet à l’employeur de disposer réellement du temps d’essai prévu au contrat.',
    },
    {
      question: 'Le délai de congé est-il le même pendant et après la période d’essai ?',
      answer:
        'Non, le délai de congé pendant la période d’essai est nettement plus court que celui applicable une fois l’essai terminé. Il est recommandé de vérifier le délai exact prévu par le contrat et, le cas échéant, par la CCT applicable.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'demission-employe-batiment-preavis-a-respecter',
    'clauses-oubliees-contrat-travail-batiment',
  ],
};
