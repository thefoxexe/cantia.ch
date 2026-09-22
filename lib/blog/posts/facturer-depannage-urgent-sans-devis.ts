import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturer-depannage-urgent-sans-devis',
  question: 'Combien facturer un dépannage urgent effectué sans devis préalable ?',
  title: 'Combien facturer un dépannage urgent effectué sans devis préalable',
  description:
    'Comment facturer une intervention d’urgence sans devis signé : forfait de déplacement, tarif horaire majoré, documentation de l’intervention et majorations courantes.',
  excerpt:
    'Pas de devis, pas de discussion préalable sur le prix : un dépannage urgent se facture différemment d’un chantier planifié, à condition de le prévoir dans ses conditions générales.',
  category: 'Devis & facturation',
  keywords: ['dépannage', 'urgence', 'facturation', 'devis', 'tarif horaire', 'forfait déplacement'],
  publishedAt: '2026-09-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une fuite qui inonde un appartement un dimanche soir ne laisse pas le temps de préparer un devis en trois exemplaires. Pourtant, l’intervention doit être facturée correctement — et défendable si le client conteste la facture après coup.',
    },
    { type: 'h2', text: '1. Le forfait de déplacement d’urgence' },
    {
      type: 'p',
      text: 'La pratique la plus courante consiste à appliquer un forfait de déplacement spécifique aux interventions urgentes, distinct du déplacement standard, auquel s’ajoute un tarif horaire sur place. Ce forfait couvre le fait de mobiliser une équipe en dehors des horaires ou des plannings prévus, indépendamment du temps réellement passé sur l’intervention.',
    },
    { type: 'h2', text: '2. Documenter l’intervention, même sans devis complet' },
    {
      type: 'list',
      items: [
        'Faire signer un bon d’intervention sur place, même succinct, mentionnant la date, l’heure, la nature du problème et le temps passé.',
        'Prendre des photos avant et après l’intervention, en particulier pour tout dégât existant qui n’est pas de votre fait.',
        'Noter le matériel utilisé et son origine (stock véhicule, achat en urgence chez un fournisseur).',
        'Faire confirmer par le client, même oralement puis par SMS ou email, qu’il a compris qu’aucun devis préalable n’était possible vu l’urgence.',
      ],
    },
    { type: 'h2', text: '3. Les majorations courantes' },
    {
      type: 'p',
      text: 'Une intervention en soirée, le week-end ou un jour férié est souvent facturée avec une majoration par rapport au tarif horaire standard. Le taux exact varie beaucoup d’une entreprise à l’autre et n’est encadré par aucune règle uniforme dans le bâtiment : l’essentiel est de définir ces majorations clairement dans vos conditions générales, et idéalement de les communiquer au client dès le premier contact téléphonique, avant même le déplacement.',
    },
    {
      type: 'callout',
      title: 'Le vrai risque n’est pas le prix, c’est l’absence de trace écrite',
      text: 'La plupart des litiges sur une facture de dépannage urgent ne portent pas sur le montant en tant que tel, mais sur l’absence de preuve que le client a été informé du principe de facturation avant l’intervention. Un simple SMS envoyé avant de partir (« déplacement facturé CHF X, tarif horaire CHF Y sur place ») change complètement le rapport de force en cas de contestation.',
    },
    {
      type: 'cta',
      title: 'Facturez un dépannage urgent en quelques minutes, depuis le chantier',
      text: 'Avec Cantia, transformez un bon d’intervention signé sur le chantier en facture en quelques clics, avec vos tarifs d’urgence et vos majorations déjà paramétrés.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on facturer un dépannage sans avoir fait signer de devis ?',
      answer:
        'Oui, c’est une pratique courante et légale pour les interventions urgentes, à condition de pouvoir démontrer que le client était informé du principe de facturation et, idéalement, d’un ordre de grandeur avant l’intervention. Un bon d’intervention signé sur place reste la meilleure protection.',
    },
    {
      question: 'Quel forfait appliquer pour un déplacement d’urgence ?',
      answer:
        'Il n’existe pas de montant standard imposé : chaque entreprise définit son propre forfait selon sa zone d’intervention et ses coûts réels. L’essentiel est de l’indiquer clairement dans les conditions générales et de le communiquer au client avant le déplacement.',
    },
    {
      question: 'Comment se protéger si le client conteste une facture de dépannage urgent ?',
      answer:
        'En documentant systématiquement l’intervention : bon signé, photos, horodatage, et si possible une trace écrite (SMS ou email) informant le client du principe de facturation avant le déplacement. Ces éléments sont souvent décisifs en cas de désaccord.',
    },
  ],
  relatedSlugs: [
    'facturer-frais-deplacement-client-artisan',
    'fixer-prix-artisan-sans-brader-concurrence-suisse',
    'calculer-prix-horaire-reel-ouvrier-batiment',
  ],
};
