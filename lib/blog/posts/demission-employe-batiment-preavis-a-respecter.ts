import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'demission-employe-batiment-preavis-a-respecter',
  question: 'Un employé du bâtiment démissionne : quel délai de préavis doit-il respecter ?',
  title: 'Démission d’un employé du bâtiment : le délai de préavis à respecter (et ce qui se passe s’il ne l’est pas)',
  description:
    'Le préavis de démission suit les mêmes règles que le licenciement. Un employé qui part sans le respecter expose toutefois l’entreprise à un manque organisationnel qu’elle peut, dans certains cas, faire valoir.',
  excerpt:
    'Un ouvrier qui annonce son départ « pour dans deux semaines » ne peut pas toujours partir aussi vite, car le délai de préavis fonctionne dans les deux sens, employeur comme employé.',
  category: 'RH & salaires',
  keywords: ['démission employé préavis', 'délai congé démission bâtiment', 'préavis employé construction', 'départ employé sans préavis', 'CCT construction démission'],
  publishedAt: '2026-06-29',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Le délai de préavis en cas de démission suit exactement les mêmes règles que celui applicable à un licenciement (art. 335c CO, sauf disposition CCT plus favorable). Il n’existe pas de régime plus souple pour un employé qui décide lui-même de partir : un ouvrier annonçant un départ immédiat ou « dans deux semaines », sans que ce délai soit contractuellement compatible, reste en principe tenu par le préavis normal.',
    },
    { type: 'h2', text: 'Les délais applicables (sauf CCT plus favorable)' },
    {
      type: 'table',
      headers: ['Ancienneté', 'Délai de préavis'],
      rows: [
        ['Pendant le temps d’essai', '7 jours'],
        ['1re année de service', '1 mois pour la fin d’un mois'],
        ['2e à 9e année de service', '2 mois pour la fin d’un mois'],
        ['Dès la 10e année de service', '3 mois pour la fin d’un mois'],
      ],
    },
    { type: 'h2', text: 'Que faire si un employé part sans respecter son préavis' },
    {
      type: 'list',
      items: [
        'L’employeur peut réclamer une indemnité correspondant au salaire que l’employé aurait perçu s’il avait respecté le délai',
        'Si l’absence cause un dommage supplémentaire concret (retard de chantier facturable, pénalité contractuelle), il peut aussi le réclamer, à condition de le documenter',
        'En pratique, ce recours est rarement exercé jusqu’au bout, mais son existence pèse dans la négociation d’un départ anticipé à l’amiable',
      ],
    },
    {
      type: 'callout',
      title: 'Un départ anticipé négocié reste presque toujours préférable à un conflit',
      text: 'Accepter un préavis raccourci en échange d’une transition organisée (passation, formation d’un remplaçant) coûte souvent moins cher à l’entreprise qu’un recours juridique théorique contre un employé déjà parti.',
    },
    {
      type: 'cta',
      title: 'Anticiper un départ sans perdre le fil des chantiers',
      text: 'Le planning d’équipe de Cantia permet de réorganiser rapidement les affectations dès qu’un départ est annoncé, sans attendre le dernier moment.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le délai de préavis est-il le même pour une démission et un licenciement ?',
      answer:
        'Oui, l’art. 335c CO fixe le même régime dans les deux sens, sauf disposition plus favorable prévue par une CCT applicable.',
    },
    {
      question: 'Que peut faire un employeur si un employé part sans respecter son préavis ?',
      answer:
        'Il peut réclamer une indemnité équivalente au salaire du délai non respecté, et un dédommagement supplémentaire si un dommage concret et documenté en résulte.',
    },
    {
      question: 'Un employé peut-il partir immédiatement en invoquant de justes motifs ?',
      answer:
        'Oui, une résiliation immédiate pour justes motifs (harcèlement, non-paiement du salaire) reste possible, mais elle exige des motifs sérieux et documentés, sans quoi elle expose l’employé lui-même à des conséquences.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'certificat-de-travail-obligation-employeur-batiment',
    'sous-effectif-chantier-recruter-ou-sous-traiter',
  ],
};
