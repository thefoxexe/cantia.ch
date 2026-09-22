import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-bris-machine-outillage-chantier',
  question: 'Faut-il assurer son outillage et ses machines contre le bris et le vol sur chantier ?',
  title: 'Assurance bris de machine et vol d’outillage sur chantier',
  description:
    'Pourquoi l’outillage laissé sur chantier attire le vol, la différence entre assurance choses classique et couverture outillage mobile, et ce qu’il faut vérifier avant de signer.',
  excerpt:
    'Une perceuse oubliée dans une remorque, une bétonnière sur un chantier non gardé la nuit : l’outillage mobile est l’un des risques les plus sous-estimés du métier.',
  category: 'Juridique & normes',
  keywords: [
    'assurance outillage chantier suisse',
    'assurance bris de machine batiment',
    'vol outillage chantier assurance',
  ],
  publishedAt: '2026-10-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier n’est jamais un espace vraiment sécurisé. Il est accessible, souvent isolé le soir et le week-end, et rempli d’outils faciles à revendre. C’est précisément ce qui en fait une cible récurrente pour le vol, bien plus que le dépôt ou l’atelier de l’entreprise, qui lui reste fermé et surveillé.',
    },
    { type: 'h2', text: 'Pourquoi l’outillage sur chantier est une cible fréquente' },
    {
      type: 'list',
      items: [
        'Le matériel reste sur place la nuit et le week-end, parfois plusieurs semaines sur un même chantier.',
        'Les outils électroportatifs et petites machines sont faciles à transporter et à revendre rapidement.',
        'Un chantier ouvert, avec de nombreux intervenants, rend difficile de savoir qui a accès et à quel moment.',
        'Le bris accidentel s’ajoute au vol : chute, choc, exposition à la pluie ou à la poussière abîment aussi le matériel.',
      ],
    },
    { type: 'h2', text: 'Assurance choses de l’entreprise et couverture outillage mobile : deux choses différentes' },
    {
      type: 'p',
      text: 'Une police d’assurance choses classique couvre en général le mobilier, les machines et le stock situés dans les locaux de l’entreprise, atelier ou dépôt. Elle ne couvre généralement pas, ou très partiellement, le matériel qui sort de ces locaux pour aller sur chantier. C’est là qu’intervient une couverture spécifique pour l’outillage mobile, pensée précisément pour un matériel qui se déplace en permanence entre plusieurs sites.',
    },
    { type: 'h2', text: 'Ce qu’il faut vérifier avant de souscrire' },
    {
      type: 'table',
      headers: ['Point à vérifier', 'Pourquoi c’est important'],
      rows: [
        ['Couverture hors des locaux de l’entreprise', 'Sans cette extension, le matériel n’est souvent pas couvert une fois sur chantier.'],
        ['Valeur à neuf ou vétusté déduite', 'La vétusté déduite peut fortement réduire l’indemnisation d’un outil de quelques années.'],
        ['Plafond par objet et plafond total', 'Une machine coûteuse peut dépasser le plafond par objet sans extension spécifique.'],
        ['Franchise applicable', 'Une franchise élevée sur du petit outillage peut rendre certains sinistres non rentables à déclarer.'],
      ],
    },
    {
      type: 'callout',
      title: 'Le détail qui change tout : la valeur déclarée',
      text: 'Beaucoup d’entreprises sous-déclarent la valeur totale de leur parc d’outillage pour payer une prime plus basse. En cas de sinistre important, l’assureur peut appliquer une règle proportionnelle et réduire l’indemnisation à due proportion de la sous-assurance. Mieux vaut réévaluer la liste du matériel au moins une fois par an.',
    },
    {
      type: 'cta',
      title: 'Gardez une trace de votre matériel, pas seulement une assurance',
      text: 'En cas de vol ou de bris, un dossier de sinistre avance plus vite avec une liste claire du matériel utilisé par chantier. Cantia garde l’historique de chaque chantier au même endroit, factures et matériel compris.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'L’assurance de l’entreprise couvre-t-elle automatiquement le vol sur chantier ?',
      answer:
        'Pas toujours. Une police d’assurance choses standard couvre en général le matériel dans les locaux de l’entreprise, pas systématiquement sur chantier. Il faut vérifier ou ajouter une extension outillage mobile.',
    },
    {
      question: 'Faut-il assurer chaque outil individuellement ?',
      answer:
        'Non, la plupart des contrats fonctionnent avec une valeur totale déclarée pour l’ensemble du parc, complétée par un plafond par objet pour les machines les plus coûteuses. L’important est de tenir cette liste à jour.',
    },
    {
      question: 'Le bris accidentel est-il couvert de la même façon que le vol ?',
      answer:
        'Généralement non, ce sont souvent deux garanties distinctes dans le contrat, avec des conditions et parfois des franchises différentes. Il faut vérifier que les deux sont bien incluses, pas seulement le vol.',
    },
  ],
  relatedSlugs: [
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'assurance-transport-materiel-chantier',
    'leasing-machines-vehicules-chantier-suisse',
  ],
};
