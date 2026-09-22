import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-protection-juridique-entreprise-batiment',
  question: 'Une assurance protection juridique est-elle utile pour une entreprise du bâtiment ?',
  title: 'Assurance protection juridique pour une entreprise du bâtiment : utile ou pas',
  description:
    'Ce que couvre en général une protection juridique professionnelle dans le bâtiment, ce qu’elle ne couvre pas, et pourquoi les frais d’avocat dépassent parfois l’enjeu du litige lui-même.',
  excerpt:
    'Un client qui conteste une facture, un fournisseur qui livre du matériel non conforme : le litige en lui-même est rarement le problème. Ce sont les frais pour le régler qui font mal.',
  category: 'Juridique & normes',
  keywords: [
    'assurance protection juridique entreprise batiment',
    'protection juridique professionnelle artisan suisse',
    'litige client entreprise construction',
  ],
  publishedAt: '2026-10-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une protection juridique professionnelle n’empêche aucun litige d’arriver. Elle change simplement qui paie pour le régler. Dans un métier où les désaccords sur la qualité d’un ouvrage, le respect d’un délai ou le montant d’une facture sont fréquents, la question mérite d’être posée sérieusement plutôt que balayée comme une dépense de plus.',
    },
    { type: 'h2', text: 'Ce que couvre en général une protection juridique professionnelle' },
    {
      type: 'list',
      items: [
        'Les litiges avec un client : facture contestée, réclamation pour malfaçon, refus de paiement après réception des travaux.',
        'Les litiges avec un fournisseur ou un sous-traitant : livraison non conforme, matériel défectueux, délai non tenu.',
        'Les litiges liés au bail commercial de l’entreprise, quand elle loue un local ou un dépôt.',
        'Parfois, selon le contrat, les litiges de droit du travail avec un employé, en tant qu’employeur.',
      ],
    },
    { type: 'h2', text: 'Ce qu’elle ne couvre généralement pas' },
    {
      type: 'p',
      text: 'La protection juridique paie les frais pour faire valoir ou défendre un droit : honoraires d’avocat, frais de procédure, parfois frais d’expertise. Elle ne paie pas le dommage lui-même. Si l’entreprise est reconnue responsable d’un défaut sur un ouvrage et doit indemniser le client, c’est la responsabilité civile professionnelle qui intervient, pas la protection juridique. Les deux couvertures répondent à des questions différentes et ne se remplacent pas l’une l’autre.',
    },
    { type: 'h2', text: 'Pourquoi les frais de procédure peuvent dépasser l’enjeu du litige' },
    {
      type: 'p',
      text: 'C’est l’argument central en faveur de cette assurance dans le bâtiment : un litige sur une facture de quelques milliers de francs peut générer des frais d’avocat et de procédure du même ordre de grandeur, voire supérieurs, une fois qu’il faut mandater un avocat, produire une expertise ou aller jusqu’au tribunal. Beaucoup d’entrepreneurs renoncent alors à faire valoir un droit pourtant légitime, simplement parce que le combat coûte plus cher que la somme en jeu.',
    },
    {
      type: 'callout',
      title: 'Le vrai bénéfice n’est pas financier, il est comportemental',
      text: 'Savoir qu’une procédure est couverte change la façon de négocier : une entreprise assurée n’est pas obligée de céder face à un client qui refuse de payer en sachant que le rapport de force financier lui est favorable. C’est souvent ce qui rétablit l’équilibre plus que le remboursement lui-même.',
    },
    {
      type: 'cta',
      title: 'Moins de litiges commencent par de meilleurs devis et de meilleures preuves',
      text: 'Un devis clair, des avenants signés et un historique de chantier documenté sont la meilleure défense avant même d’ouvrir un dossier juridique. Cantia garde toute cette traçabilité au même endroit, prête à être ressortie en cas de désaccord.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'La protection juridique remplace-t-elle la RC professionnelle ?',
      answer:
        'Non. La protection juridique couvre les frais de procédure pour défendre ou faire valoir un droit, tandis que la RC professionnelle couvre le dommage lui-même quand l’entreprise est reconnue responsable. Les deux sont complémentaires, pas interchangeables.',
    },
    {
      question: 'Une petite entreprise du bâtiment a-t-elle vraiment besoin de cette assurance ?',
      answer:
        'Cela dépend surtout de la fréquence des litiges avec les clients et fournisseurs et du montant moyen des factures. Plus les chantiers sont nombreux et les clients particuliers, plus le risque de contestation ponctuelle est élevé.',
    },
    {
      question: 'Les litiges avec les employés sont-ils toujours couverts ?',
      answer:
        'Pas systématiquement : cela dépend du contrat souscrit. Il faut vérifier explicitement si le volet droit du travail, côté employeur, est inclus ou proposé en option auprès de l’assureur.',
    },
  ],
  relatedSlugs: [
    'assurance-rc-professionnelle-batiment-obligatoire',
    'responsabilite-apres-livraison-travaux-assurance',
    'assurance-cyber-pme-batiment-donnees-clients',
  ],
};
