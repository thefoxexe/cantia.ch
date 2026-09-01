import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-chantier-devis-couvreur-toiture-suisse',
  question: 'Comment un couvreur doit-il chiffrer un devis de toiture en tenant compte de la météo et de la sécurité ?',
  title: 'Couvreur : chiffrer une toiture sans se faire rattraper par la météo',
  description:
    'Un chantier de toiture dépend directement de la météo et impose des mesures de sécurité qui ont un coût réel. Comment les intégrer au devis sans les cacher dans une marge invisible.',
  excerpt:
    'Aucun autre métier du bâtiment n’est aussi directement exposé à la météo que la couverture. Un devis de toiture qui ne prévoit ni marge météo ni coût de sécurité prend donc un pari qu’il finit souvent par perdre.',
  category: 'Métiers du bâtiment',
  keywords: ['devis couvreur', 'facturation toiture Suisse', 'prix rénovation toiture', 'sécurité chantier toiture', 'devis charpente couverture'],
  publishedAt: '2026-09-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier de toiture ne peut pas avancer sous la pluie, ni parfois sous un vent trop fort. Un devis qui ne provisionne pas ce risque météo transforme chaque intempérie en perte sèche pour l’entreprise, car le client, lui, ne paie que le travail réellement effectué.',
    },
    { type: 'h2', text: 'Ce qui doit apparaître explicitement au devis' },
    {
      type: 'list',
      items: [
        'Dépose de la couverture existante et évacuation des déchets (souvent sous-évaluée)',
        'Charpente : réparation ou renfort éventuel, à chiffrer après inspection, jamais à l’aveugle',
        'Couverture neuve (tuiles, ardoises, bac acier) avec le coût de la sécurisation du chantier inclus',
        'Zinguerie, gouttières et évacuations (un poste distinct souvent oublié dans le prix global "toiture")',
      ],
    },
    { type: 'h2', text: 'Le coût de la sécurité n’est pas négociable' },
    {
      type: 'p',
      text: 'Échafaudage, ligne de vie, garde-corps périphérique : ces dispositifs de sécurité en hauteur ont un coût réel de location et de montage, qui doit apparaître clairement au devis plutôt que d’être absorbé silencieusement dans le prix au m² de couverture. Sinon, la tentation existe de les réduire sur les chantiers les plus serrés financièrement.',
    },
    {
      type: 'stat',
      value: '5-10 %',
      label: 'part du budget d’un chantier de toiture typiquement consacrée aux dispositifs de sécurité en hauteur (échafaudage, ligne de vie, protections)',
    },
    {
      type: 'callout',
      title: 'Une clause météo protège la relation client autant que la marge',
      text: 'Prévoir explicitement au devis qu’un arrêt météo décale le planning sans pénalité évite une négociation tendue en plein chantier : le client comprend en effet mieux un report annoncé à l’avance qu’un retard découvert sur place.',
    },
    {
      type: 'cta',
      title: 'Suivez l’avancement du chantier depuis le téléphone, même en hauteur',
      text: 'Cantia permet d’ajouter photos et rapports d’avancement directement depuis le chantier, ce qui est utile pour documenter un arrêt météo ou un imprévu de charpente découvert en cours de dépose.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment intégrer le risque météo dans un devis de toiture ?',
      answer:
        'En prévoyant explicitement une clause de report sans pénalité en cas d’intempérie empêchant le travail en hauteur. Cela protège l’entreprise et évite une négociation tendue en plein chantier.',
    },
    {
      question: 'Faut-il facturer séparément les dispositifs de sécurité sur un chantier de toiture ?',
      answer:
        'C’est recommandé : échafaudage, ligne de vie et garde-corps ont un coût réel de location et de montage qui doit rester visible, plutôt que d’être dilué dans le prix au m² de couverture.',
    },
    {
      question: 'Peut-on chiffrer une réparation de charpente sans inspection préalable ?',
      answer:
        'Non, ou seulement de manière très approximative, car l’état réel d’une charpente n’est souvent visible qu’après dépose de la couverture existante, d’où l’intérêt d’une inspection avant devis définitif.',
    },
  ],
  relatedSlugs: [
    'retard-chantier-meteo-obligations-contractuelles',
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'application-hors-ligne-chantier-pourquoi-important',
  ],
};
