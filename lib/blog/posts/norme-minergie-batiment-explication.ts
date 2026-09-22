import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'norme-minergie-batiment-explication',
  question: 'Qu’est-ce que la norme Minergie et que doit en savoir un artisan du bâtiment ?',
  title: 'Norme Minergie : ce qu’un artisan doit savoir',
  description:
    'Minergie n’est pas une loi mais un label suisse de construction basse consommation. Voici ce que ça change concrètement pour un artisan qui exécute des travaux sur un bâtiment labellisé.',
  excerpt:
    'Minergie n’oblige aucune entreprise par la loi. Mais dès qu’un maître d’ouvrage vise le label, la façon de poser une isolation ou de traiter une jonction change vraiment.',
  category: 'Juridique & normes',
  keywords: ['norme minergie explication', 'label minergie bâtiment', 'minergie artisan travaux'],
  publishedAt: '2026-10-07',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Minergie revient constamment dans les conversations de chantier en Suisse, souvent sans que tout le monde sache précisément de quoi il s’agit. Contrairement à une idée répandue, ce n’est pas une norme légale obligatoire : c’est un label suisse privé, qui certifie qu’un bâtiment neuf ou rénové atteint un niveau de consommation énergétique nettement inférieur à la moyenne, sur la base d’exigences de construction précises.',
    },
    { type: 'h2', text: 'Un label, plusieurs niveaux d’exigence' },
    {
      type: 'p',
      text: 'Il existe plusieurs variantes du label, qui ne visent pas exactement les mêmes objectifs. Minergie standard reste la base, centrée sur la performance énergétique du bâtiment. Minergie-P va plus loin, avec des exigences renforcées proches du standard « bâtiment passif ». Minergie-ECO ajoute une dimension supplémentaire : la santé des occupants et l’impact écologique des matériaux utilisés, au-delà de la seule consommation d’énergie.',
    },
    {
      type: 'list',
      items: [
        'Minergie : niveau de base, centré sur une faible consommation d’énergie et un renouvellement d’air maîtrisé',
        'Minergie-P : exigences renforcées, généralement associées à une isolation et une étanchéité à l’air très poussées',
        'Minergie-ECO : ajoute des critères sur la santé (lumière, bruit, matériaux) et l’écologie de la construction',
      ],
    },
    { type: 'h2', text: 'Ce que ça change concrètement sur le chantier' },
    {
      type: 'p',
      text: 'Pour un artisan qui intervient sur un chantier visant le label, la différence se joue surtout dans la qualité d’exécution, pas dans le choix des matériaux eux-mêmes. L’étanchéité à l’air est un point particulièrement sensible : une jonction mal traitée autour d’une fenêtre ou d’un passage de gaine peut suffire à compromettre le résultat final, même si l’isolant posé est le bon. La qualité de pose compte souvent plus que la marque du produit.',
    },
    {
      type: 'callout',
      title: 'Le contrôle final ne pardonne pas l’approximation',
      text: 'Un bâtiment visant le label Minergie fait généralement l’objet d’un contrôle ou d’une certification par un professionnel agréé avant validation. Une malfaçon découverte à ce stade — souvent invisible à l’œil nu, comme une fuite d’air derrière un doublage — peut obliger à rouvrir des finitions déjà posées.',
    },
    { type: 'h2', text: 'Ce qu’il faut retenir en tant qu’entreprise' },
    {
      type: 'list',
      items: [
        'Se renseigner explicitement auprès du maître d’ouvrage ou de l’architecte si le chantier vise un label, avant de commencer les travaux',
        'Soigner particulièrement les jonctions et traversées, souvent le point faible réel de l’étanchéité à l’air',
        'Anticiper qu’un contrôle final indépendant peut être exigé avant réception, avec un impact possible sur le calendrier',
        'Ne pas confondre Minergie, un label de construction, avec le CECB/GEAK, qui est un certificat énergétique cantonal',
      ],
    },
    {
      type: 'cta',
      title: 'Documenter la qualité d’exécution, chantier après chantier',
      text: 'Sur un chantier labellisé, la traçabilité de ce qui a été posé et comment compte autant que le résultat final. Avec Cantia, photos, notes et suivi par étape restent rattachés au bon chantier, prêts à être montrés en cas de contrôle.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Minergie est-il obligatoire en Suisse ?',
      answer:
        'Non, c’est un label privé et volontaire, pas une obligation légale. Certains cantons ou communes peuvent toutefois l’exiger ou le favoriser dans le cadre de certains projets, notamment pour bénéficier de conditions particulières.',
    },
    {
      question: 'Quelle différence entre Minergie et Minergie-ECO ?',
      answer:
        'Minergie de base porte sur la consommation d’énergie du bâtiment. Minergie-ECO ajoute des critères sur la santé des occupants et l’impact écologique des matériaux, en plus des exigences énergétiques du label standard.',
    },
    {
      question: 'Un artisan doit-il être certifié pour travailler sur un chantier Minergie ?',
      answer:
        'Pas systématiquement, mais une exécution soignée et conforme aux exigences du label est indispensable, car un contrôle final par un professionnel agréé est généralement requis avant la validation du label.',
    },
  ],
  relatedSlugs: [
    'certificat-energetique-cantonal-geak-batiment',
    'programme-batiments-subvention-renovation-suisse',
    'prix-isolation-facade-m2-suisse',
    'bilan-carbone-chantier-construction-suisse',
  ],
};
