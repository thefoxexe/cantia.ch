import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-chauffagiste-cvc-suisse',
  question: 'Comment un chauffagiste-installateur CVC doit-il chiffrer un remplacement de chauffage face aux aides cantonales ?',
  title: 'Chauffagiste CVC : chiffrer un remplacement de chaudière entre prix, délai et subvention',
  description:
    'Remplacer un chauffage à mazout ou gaz par une pompe à chaleur implique un devis technique, un délai de livraison souvent long, et fréquemment une subvention cantonale. Comment tout intégrer sans bloquer le client.',
  excerpt:
    'Un devis de remplacement de chauffage n’est presque jamais un simple échange de matériel : c’est un projet technique, un délai de livraison à anticiper, et souvent un dossier de subvention à faire tenir ensemble.',
  category: 'Métiers du bâtiment',
  keywords: ['devis chauffagiste', 'facturation installateur CVC Suisse', 'remplacement chaudière prix', 'pompe à chaleur devis subvention', 'délai livraison chauffage devis'],
  publishedAt: '2026-09-14',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Remplacer une chaudière à mazout ou à gaz par une pompe à chaleur n’est pas qu’une question d’équipement. C’est souvent aussi une adaptation du réseau existant, un délai de livraison qui peut dépasser plusieurs semaines en haute saison, et pour beaucoup de clients, une demande de subvention cantonale qui conditionne leur décision de signer.',
    },
    { type: 'h2', text: 'Ce qu’un devis de remplacement de chauffage doit couvrir' },
    {
      type: 'list',
      items: [
        'Dépose et évacuation de l’ancienne installation, y compris la citerne à mazout le cas échéant',
        'Adaptation du réseau existant (radiateurs, régulation), souvent nécessaire avec une pompe à chaleur',
        'Fourniture et pose de l’équipement neuf, avec le délai de livraison indiqué clairement',
        'Mise en service, réglages et remise d’une documentation technique complète au client',
      ],
    },
    {
      type: 'stat',
      value: '6-12 sem.',
      label: 'délai de livraison courant pour une pompe à chaleur en période de forte demande, à annoncer explicitement au client dès le devis',
    },
    { type: 'h2', text: 'Le devis conditionne souvent la subvention, pas l’inverse' },
    {
      type: 'p',
      text: 'La plupart des programmes cantonaux exigent un devis détaillé avant tout engagement de travaux pour valider une demande de subvention : commencer le chantier avant l’octroi peut annuler le droit à l’aide. Le devis doit donc être suffisamment précis et daté pour servir directement de pièce justificative, sans attendre que le client en redemande un autre pour son dossier.',
    },
    {
      type: 'callout',
      title: 'Un délai de livraison mal communiqué coûte plus cher qu’un prix mal calculé',
      text: 'Un client qui découvre un délai de plusieurs mois après avoir signé, en plein hiver sans chauffage fonctionnel, retient rarement la nuance technique. Communiquer le délai réel dès le devis évite ce type de conflit évitable.',
    },
    {
      type: 'cta',
      title: 'Des devis précis, prêts à appuyer une demande de subvention',
      text: 'Cantia génère des devis détaillés et datés, avec toutes les quantités et prestations nécessaires pour accompagner un dossier de subvention cantonale sans document supplémentaire à produire.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il attendre l’octroi de la subvention avant de commencer les travaux de chauffage ?',
      answer:
        'Généralement oui : la plupart des programmes cantonaux exigent que le devis soit soumis et l’aide accordée avant le début des travaux, sous peine de perdre le droit à la subvention.',
    },
    {
      question: 'Comment communiquer un long délai de livraison de pompe à chaleur au client ?',
      answer:
        'En l’indiquant explicitement et par écrit dès le devis, surtout en haute saison où les délais peuvent dépasser deux à trois mois, ce qui évite tout malentendu une fois le devis signé.',
    },
    {
      question: 'Le devis de chauffage doit-il inclure l’adaptation du réseau existant ?',
      answer:
        'C’est recommandé, en particulier pour un passage à une pompe à chaleur, car les radiateurs et la régulation existants ne sont pas toujours compatibles sans ajustement.',
    },
  ],
  relatedSlugs: [
    'devis-facture-facadier-isolation-suisse',
    'permis-construire-renovation-quand-necessaire',
    'validite-devis-signe-prix-qui-bouge',
  ],
};
