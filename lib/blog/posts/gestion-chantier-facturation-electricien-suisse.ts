import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-chantier-facturation-electricien-suisse',
  question: 'Comment un électricien indépendant doit-il gérer ses devis, ses heures et sa facturation ?',
  title: 'Électricien indépendant : gérer devis, heures et facturation sans y perdre ses soirées',
  description:
    'Entre les points électriques à chiffrer, les heures réparties sur plusieurs chantiers dans la même journée et les contrôles NIBT à ne pas oublier, la gestion administrative d’un électricien a ses pièges. Méthode concrète.',
  excerpt:
    'Un électricien change souvent de chantier trois ou quatre fois par jour. La vraie difficulté n’est donc pas de chiffrer un point électrique, mais de retrouver le soir qui a fait quoi, où, et combien de temps.',
  category: 'Métiers du bâtiment',
  keywords: ['devis électricien indépendant', 'facturation électricien Suisse', 'gestion chantier électricité', 'logiciel électricien bâtiment', 'heures électricien plusieurs chantiers'],
  publishedAt: '2026-08-30',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un plombier ou un maçon reste souvent une journée entière sur le même chantier. Un électricien, lui, enchaîne fréquemment plusieurs interventions courtes dans la même journée (un dépannage le matin, une mise en conformité l’après-midi, un rendez-vous devis en fin de journée). La difficulté n’est donc pas seulement de bien chiffrer, mais de ne perdre aucune heure entre deux déplacements.',
    },
    { type: 'h2', text: 'Chiffrer par point, par circuit, ou au forfait ?' },
    {
      type: 'list',
      items: [
        'Points électriques (prises, interrupteurs, luminaires) : prix unitaire, pratique pour les devis de rénovation détaillés',
        'Circuits complets (tableau, mise à la terre, protection différentielle) : au forfait, car le temps varie peu d’une installation standard à l’autre',
        'Dépannage et intervention d’urgence : en régie horaire, avec un minimum facturable clairement annoncé au client',
        'Mise en conformité NIBT : au forfait après visite, jamais à l’aveugle par téléphone',
      ],
    },
    { type: 'h2', text: 'Le vrai coût caché : le temps entre deux chantiers' },
    {
      type: 'p',
      text: 'Un déplacement non facturé, multiplié par trois ou quatre chantiers par jour, représente rapidement une demi-journée de travail non valorisée par semaine. La question n’est pas seulement de facturer le trajet (certains le font, d’autres l’intègrent au taux horaire), mais de le compter au moins comme un temps non disponible pour d’autres missions, pour ne pas sur-réserver sa propre journée.',
    },
    {
      type: 'stat',
      value: '3-4',
      label: 'chantiers différents traités en moyenne dans une même journée par un électricien indépendant en intervention courante',
    },
    {
      type: 'callout',
      title: 'Le contrôle NIBT n’est pas une option facultative sur le devis',
      text: 'Une installation électrique modifiée ou créée doit être annoncée et contrôlée conformément à l’inspection des installations électriques (NIBT). Oublier ce point sur le devis, c’est risquer de le facturer dans l’urgence : le prix obtenu est alors souvent moins bon, et inférieur à ce que ça coûte réellement en temps.',
    },
    {
      type: 'cta',
      title: 'Vos heures, saisies chantier par chantier, en quelques secondes',
      text: 'Cantia permet de pointer ses heures directement depuis le téléphone entre deux interventions, chantier par chantier, ce qui permet de retrouver en fin de mois exactement qui a fait quoi, sans reconstituer la journée de mémoire.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il facturer un devis d’électricité au point ou au forfait ?',
      answer:
        'Les deux se combinent : le prix unitaire par point électrique convient aux rénovations détaillées, le forfait convient mieux aux circuits complets standardisés (tableau, mise à la terre) où le temps varie peu.',
    },
    {
      question: 'Comment un électricien facture-t-il ses déplacements entre plusieurs chantiers ?',
      answer:
        'Il n’existe pas de règle unique : certains l’intègrent au taux horaire, d’autres le facturent séparément. L’essentiel est de le décider clairement à l’avance et de le communiquer au client, pas de l’absorber silencieusement dans la marge.',
    },
    {
      question: 'Le contrôle NIBT doit-il figurer sur le devis d’électricité ?',
      answer:
        'Oui, car toute installation créée ou modifiée doit être annoncée et contrôlée. L’intégrer au devis dès le départ évite une facturation d’urgence, moins avantageuse, une fois le chantier terminé.',
    },
  ],
  relatedSlugs: [
    'application-hors-ligne-chantier-pourquoi-important',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'facturation-heures-regie-batiment-comment-faire',
  ],
  relatedTradeSlug: 'electricien',
};
