import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'validite-devis-signe-prix-qui-bouge',
  question: 'Combien de temps un devis signé engage-t-il l’entreprise si les prix du matériel bougent ?',
  title: 'Un devis signé engage-t-il si le prix du matériel a changé depuis ?',
  description:
    'Un devis sans date de validité engage l’entreprise sans limite dans le temps, même si le prix du matériel a doublé depuis. La clause qui manque sur la plupart des devis suisses.',
  excerpt:
    'Un devis signé sans date de validité vous engage indéfiniment, y compris si le prix du bois a doublé entre-temps. C’est une ligne, pas un détail.',
  category: 'Devis & facturation',
  keywords: ['validité devis', 'prix matériel', 'engagement contractuel', 'clause de révision', 'devis signé'],
  publishedAt: '2026-03-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un client garde un devis signé six mois dans un tiroir, puis débarque en disant « j’ai signé, je veux ce prix ». Sans date de validité écrite sur le document, il a juridiquement raison — même si le prix du matériau a bougé de 20 % entre-temps.',
    },
    { type: 'h2', text: 'Un devis engage tant qu’il n’a pas de date de fin' },
    {
      type: 'p',
      text: 'Un devis accepté par le client vaut acceptation d’une offre — il engage les deux parties aux conditions écrites, sans limite de durée sauf si le document en prévoit une. C’est le principe même de l’offre en droit des contrats suisse : celui qui l’a émise reste lié jusqu’à ce qu’elle expire ou soit retirée.',
    },
    {
      type: 'callout',
      title: 'La ligne à ne jamais oublier',
      text: '« Devis valable 30 jours » (ou 60, selon la nature du chantier) n’est pas une formule de politesse. C’est ce qui empêche un client de ressortir un prix figé des mois plus tard, pendant que vos fournisseurs ont déjà révisé les leurs.',
    },
    { type: 'h2', text: 'Que faire quand le chantier démarre après l’expiration' },
    {
      type: 'list',
      items: [
        'Si le devis a expiré, un nouveau devis (ou un avenant confirmant le prix révisé) doit être établi et accepté avant de démarrer',
        'Si le chantier a déjà commencé sous l’ancien devis, une clause de révision de prix (matériaux notamment) permet de répercuter une hausse documentée sans renégocier tout le contrat',
        'À défaut de clause, une hausse significative et documentée du prix d’un matériau spécifique peut parfois justifier un avenant négocié (mais c’est une discussion, pas un droit automatique)',
      ],
    },
    { type: 'h2', text: 'Ce que ça change en pratique' },
    {
      type: 'p',
      text: 'Sur des matériaux volatils (bois, métal, isolants), une validité de 30 jours plutôt que 90 réduit nettement le risque de devoir absorber une hausse sur un devis resté trop longtemps sans réponse. Sur des prestations de main-d’œuvre pure, la validité compte moins — mais ne coûte jamais rien à écrire.',
    },
    {
      type: 'cta',
      title: 'La validité, jamais oubliée sur un devis',
      text: 'Chaque devis Cantia inclut automatiquement sa date de validité, calculée depuis vos paramètres d’entreprise. Plus besoin d’y penser à chaque envoi.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un devis sans date de validité engage-t-il indéfiniment l’entreprise ?',
      answer:
        'En principe oui, tant qu’il n’a pas été retiré ou remplacé : c’est pourquoi une durée de validité explicite (30 à 90 jours selon les cas) doit toujours figurer sur le document.',
    },
    {
      question: 'Peut-on répercuter une hausse du prix des matériaux sur un devis déjà signé ?',
      answer:
        'Seulement si une clause de révision de prix le prévoit explicitement, ou par un avenant négocié avec le client (ce n’est jamais un droit automatique en l’absence de clause).',
    },
    {
      question: 'Quelle durée de validité choisir pour un devis de rénovation ?',
      answer:
        '30 jours est courant pour des matériaux dont le prix bouge, jusqu’à 90 jours pour des prestations principalement en main-d’œuvre. Le choix final se fait selon la volatilité réelle des postes du devis.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'norme-sia-118-devis-obligatoire',
  ],
};
