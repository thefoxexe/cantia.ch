import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-transport-materiel-chantier',
  question: 'Faut-il une assurance pour le transport de matériel et marchandises vers un chantier ?',
  title: 'Faut-il assurer le transport de matériel et marchandises vers le chantier',
  description:
    'Les risques pendant le transport de matériel vers un chantier, la différence entre assurance du véhicule et assurance des marchandises transportées, et quand ça devient pertinent.',
  excerpt:
    'Le camion est assuré, mais ce qu’il transporte ne l’est pas toujours. Beaucoup d’entrepreneurs découvrent la différence au moment d’un accident, trop tard.',
  category: 'Juridique & normes',
  keywords: [
    'assurance transport marchandises chantier',
    'assurance marchandises transportees batiment',
    'assurance camion materiel entreprise construction',
  ],
  publishedAt: '2026-10-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un camion qui part chargé de matériel, de carrelage ou de machines vers un chantier prend deux risques en même temps : un risque sur le véhicule lui-même, et un risque sur ce qu’il transporte. Ces deux risques ne sont pas couverts par le même contrat, et confondre les deux est l’une des erreurs les plus fréquentes.',
    },
    { type: 'h2', text: 'Les risques pendant le transport' },
    {
      type: 'list',
      items: [
        'Un accident de la route endommageant ou détruisant tout ou partie du chargement.',
        'Un dommage au matériel pendant le chargement ou le déchargement, même sans accident.',
        'Le vol du véhicule chargé, garé sur un parking ou près d’un chantier non surveillé.',
        'Une avarie liée aux conditions de transport, par exemple pour du matériel sensible à l’humidité ou aux chocs.',
      ],
    },
    { type: 'h2', text: 'Assurance véhicule et assurance marchandises transportées : deux contrats distincts' },
    {
      type: 'p',
      text: 'L’assurance du véhicule, responsabilité civile et casco, couvre le camion ou l’utilitaire lui-même : la carrosserie, le moteur, les dommages causés à des tiers. Elle ne couvre généralement pas la valeur du chargement en cas de sinistre. C’est le rôle d’une assurance marchandises transportées, parfois appelée assurance transport, qui indemnise la valeur du matériel endommagé ou perdu pendant le trajet, indépendamment de qui est responsable de l’accident.',
    },
    { type: 'h2', text: 'Quand cette assurance devient pertinente' },
    {
      type: 'p',
      text: 'Pour de petits trajets avec du matériel courant et peu de valeur, le risque financier reste limité et beaucoup d’entreprises l’assument sans assurance dédiée. La question devient sérieuse dès que la valeur du chargement grimpe : machines de chantier, matériaux nobles, équipements techniques, ou dès que les trajets sont fréquents et sur de longues distances. Plus la fréquence et la valeur transportée augmentent, plus une assurance dédiée devient une couverture qui se justifie économiquement, pas juste un réflexe de prudence.',
    },
    {
      type: 'callout',
      title: 'Vérifier qui transporte, pas seulement quoi',
      text: 'Si le transport est confié à un sous-traitant ou à un transporteur externe, sa propre assurance responsabilité civile de transporteur peut avoir des limites d’indemnisation bien inférieures à la valeur réelle du matériel confié. Le vérifier avant d’envoyer un chargement coûteux évite une mauvaise surprise en cas de sinistre.',
    },
    {
      type: 'cta',
      title: 'Suivez la valeur de vos chantiers, pas seulement leur avancement',
      text: 'Savoir combien de matériel et de matériaux sont engagés sur un chantier en cours aide aussi à évaluer le bon niveau de couverture. Cantia centralise devis, matériel facturé et suivi de chantier au même endroit.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'L’assurance du camion suffit-elle à couvrir le matériel transporté ?',
      answer:
        'Non, en général l’assurance du véhicule couvre le camion lui-même, pas la valeur de ce qu’il transporte. Une assurance marchandises transportées, distincte, est nécessaire pour couvrir le chargement.',
    },
    {
      question: 'Faut-il assurer chaque trajet individuellement ?',
      answer:
        'Non, la plupart des contrats fonctionnent sur une base annuelle avec un plafond par trajet ou par sinistre, pas au coup par coup. C’est plus simple à gérer pour une entreprise qui transporte régulièrement du matériel.',
    },
    {
      question: 'Que se passe-t-il si le transport est sous-traité à un tiers ?',
      answer:
        'La responsabilité et la couverture dépendent alors du contrat du transporteur, dont les plafonds d’indemnisation sont parfois inférieurs à la valeur réelle transportée. Il vaut mieux le vérifier avant d’envoyer un chargement de valeur.',
    },
  ],
  relatedSlugs: [
    'assurance-bris-machine-outillage-chantier',
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'leasing-machines-vehicules-chantier-suisse',
  ],
};
