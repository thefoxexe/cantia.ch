import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'chantier-complet-peut-etre-en-perte-taux-horaire',
  question: 'Pourquoi un chantier terminé et payé peut quand même être en perte ?',
  title: 'Un chantier « réussi » peut quand même être en perte : voici pourquoi',
  description:
    'Un chantier livré dans les temps, payé intégralement, peut malgré tout être en perte réelle si le coût horaire employé n’a jamais été comparé aux heures effectivement passées.',
  excerpt:
    'Le chantier est livré, le client content, la facture payée. Et pourtant l’entreprise a peut-être perdu de l’argent dessus — sans qu’aucun signal ne l’ait montré.',
  category: 'Chantier & rentabilité',
  keywords: ['chantier en perte', 'rentabilité chantier', 'coût horaire', 'devisé vs réel', 'marge réelle'],
  publishedAt: '2026-04-06',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le client est content, le paiement est arrivé, le chantier suivant démarre déjà. Tout indique un succès — sauf un chiffre que personne n’a regardé : combien d’heures ont vraiment été passées, comparées à ce qui avait été devisé. C’est là que se cache la perte que le sentiment de « chantier réussi » masque presque toujours.',
    },
    { type: 'h2', text: 'Le piège du raisonnement « j’ai été payé donc j’ai gagné »' },
    {
      type: 'p',
      text: 'Être payé le montant du devis ne veut rien dire sur la rentabilité si le devis lui-même sous-estimait les heures nécessaires. Un chantier devisé sur 40h de main-d’œuvre qui en a réellement demandé 58 n’a pas généré la marge attendue, même si le client a payé exactement le montant convenu — l’écart d’heures a simplement été absorbé en silence, sans que la facture n’en dise rien.',
    },
    {
      type: 'callout',
      title: 'Le calcul que presque personne ne fait',
      text: 'Marge réelle = prix vendu − (heures réellement passées × coût horaire réel) − matériel réellement acheté − sous-traitance réellement facturée. Sans ce calcul spécifique par chantier, une entreprise peut sembler rentable en fin d’année tout en ayant, chantier par chantier, systématiquement sous-estimé ses heures.',
    },
    { type: 'h2', text: 'Pourquoi ça passe inaperçu' },
    {
      type: 'list',
      items: [
        'La comptabilité générale de l’entreprise reste positive tant qu’un autre chantier plus rentable compense la perte du premier — la perte individuelle se noie dans la moyenne',
        'Sans suivi des heures chantier par chantier, il n’existe simplement aucun chiffre à comparer au devis initial',
        'Un dépassement d’heures étalé sur plusieurs semaines ne saute jamais aux yeux comme le ferait un dépassement d’un seul jour',
      ],
    },
    { type: 'h2', text: 'Le signal à surveiller, pas après coup' },
    {
      type: 'p',
      text: 'Le moment utile pour détecter ce type de perte n’est pas la clôture du chantier, c’est le milieu — quand les heures déjà passées approchent déjà ce qui avait été devisé pour l’ensemble. À ce stade, il reste encore une marge de manœuvre : réorganiser, accélérer, ou à défaut, comprendre pour le prochain devis similaire.',
    },
    {
      type: 'p',
      text: 'Sur la durée, c’est ce chiffre-là qui distingue une entreprise qui grandit d’une entreprise qui tourne sans jamais s’enrichir : pas le chiffre d’affaires facturé, mais l’écart moyen entre heures devisées et heures réelles, chantier après chantier.',
    },
    {
      type: 'cta',
      title: 'La marge réelle, visible chantier par chantier',
      text: 'Le module Rentabilité de Cantia compare automatiquement le devisé et le réel — heures, matériel, sous-traitance — pour repérer un dépassement avant la clôture, pas après.',
      buttonLabel: 'Découvrir la rentabilité par chantier',
    },
  ],
  faq: [
    {
      question: 'Comment un chantier payé intégralement peut-il être en perte ?',
      answer:
        'Si les heures réellement passées dépassent significativement les heures devisées, le coût réel de la main-d’œuvre peut dépasser la marge prévue, même si le client a payé le montant exact du devis.',
    },
    {
      question: 'Pourquoi ce type de perte passe-t-il souvent inaperçu ?',
      answer:
        'Parce que la comptabilité générale de l’entreprise peut rester positive grâce à d’autres chantiers plus rentables, et parce que sans suivi précis des heures par chantier, il n’existe aucun chiffre à comparer au devis initial.',
    },
    {
      question: 'À quel moment faut-il vérifier si un chantier dérape en heures ?',
      answer:
        'En cours de chantier, pas à la clôture — un suivi continu permet encore d’ajuster, alors qu’un constat fait après la fin des travaux ne sert plus qu’à comprendre ce qui s’est passé.',
    },
  ],
  relatedSlugs: [
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
    'gerer-plusieurs-chantiers-en-parallele-methode',
  ],
};
