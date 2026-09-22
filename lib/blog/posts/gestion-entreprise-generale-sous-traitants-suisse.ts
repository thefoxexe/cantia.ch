import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-entreprise-generale-sous-traitants-suisse',
  question: 'Comment gérer une entreprise générale et la coordination de ses sous-traitants en Suisse ?',
  title: 'Gérer une entreprise générale et ses sous-traitants en Suisse',
  description:
    'Prix global, coordination multi-corps de métier, responsabilité vis-à-vis du client : comment une entreprise générale pilote ses sous-traitants et suit sa rentabilité en Suisse.',
  excerpt:
    'L’entreprise générale facture un prix global au client, mais sa rentabilité se joue lot par lot, avec chaque sous-traitant. Voici ce que cela change dans le pilotage du chantier.',
  category: 'Métiers du bâtiment',
  keywords: ['entreprise générale suisse', 'gestion sous-traitants chantier', 'coordination corps de métier facturation'],
  publishedAt: '2026-10-12',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Le modèle économique d’une entreprise générale diffère fondamentalement de celui d’un artisan indépendant : elle facture un prix global au client, mais réalise elle-même peu ou pas des travaux, en confiant chaque lot à des sous-traitants. Sa rentabilité ne dépend donc pas d’une seule marge, mais de la bonne gestion de plusieurs marges simultanées, une par lot sous-traité.',
    },
    { type: 'h2', text: 'Un prix global, mais une rentabilité qui se joue lot par lot' },
    {
      type: 'p',
      text: 'Le client signe un contrat pour un prix global, souvent forfaitaire, quel que soit le nombre de corps de métier impliqués. L’entreprise générale négocie ensuite chaque lot séparément avec ses sous-traitants, en cherchant une marge sur chacun. Un lot mal chiffré ou un sous-traitant qui dépasse son budget se répercute directement sur la rentabilité globale du projet, sans que le client en soit forcément conscient.',
    },
    { type: 'h2', text: 'Les défis spécifiques de la coordination multi-corps de métier' },
    {
      type: 'list',
      items: [
        'Planning multi-lots : un retard sur un corps de métier (gros œuvre, par exemple) retarde généralement en cascade tous les suivants',
        'Responsabilité vis-à-vis du client même pour le travail réalisé par un sous-traitant : le client se retourne vers l’entreprise générale, pas vers le sous-traitant, en cas de défaut',
        'Gestion des interfaces entre lots : un désaccord entre deux sous-traitants sur qui doit réaliser une tâche peut bloquer le chantier',
        'Suivi de multiples contrats de sous-traitance en parallèle, avec des conditions de paiement propres à chacun',
      ],
    },
    { type: 'h2', text: 'Suivre la rentabilité par chantier ET par lot' },
    {
      type: 'p',
      text: 'Un suivi global du chantier ne suffit pas : une entreprise générale doit pouvoir identifier précisément quel lot génère de la marge et lequel en perd, pour ajuster ses négociations futures avec ses sous-traitants et affiner ses prochains devis. Sans ce niveau de détail, un chantier peut sembler rentable globalement tout en cachant un ou deux lots largement déficitaires qui compensent d’autres marges bien négociées.',
    },
    {
      type: 'callout',
      title: 'Le client ne voit qu’un prix, l’entreprise générale doit voir vingt marges',
      text: 'La force du modèle d’entreprise générale, c’est de simplifier la relation pour le client. Mais cette simplicité en façade exige, en coulisses, un suivi financier beaucoup plus fin que celui d’un artisan qui facture directement son propre travail.',
    },
    {
      type: 'cta',
      title: 'Piloter la rentabilité lot par lot, pas seulement chantier par chantier',
      text: 'Cantia permet de suivre les coûts et marges de chaque sous-traitant sur un même chantier, pour identifier immédiatement les lots qui dérapent.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'L’entreprise générale est-elle responsable des malfaçons d’un sous-traitant ?',
      answer:
        'Oui, généralement, vis-à-vis du client. Le contrat lie l’entreprise générale au client, qui n’a pas de lien contractuel direct avec les sous-traitants. L’entreprise générale se retourne ensuite, si besoin, contre son sous-traitant selon les termes de leur propre contrat.',
    },
    {
      question: 'Comment savoir si un lot sous-traité est rentable ou déficitaire ?',
      answer:
        'Il faut comparer, pour chaque lot, le montant facturé au sous-traitant par l’entreprise générale au montant réellement payé à ce sous-traitant, en intégrant les éventuels avenants ou surcoûts. Un suivi chantier par chantier ne suffit pas : le détail doit être fait lot par lot.',
    },
    {
      question: 'Faut-il un contrat écrit avec chaque sous-traitant, même pour un petit lot ?',
      answer:
        'C’est fortement recommandé, quelle que soit la taille du lot. Un contrat écrit clarifie le périmètre, le prix, les délais et les responsabilités, et protège l’entreprise générale en cas de litige avec le sous-traitant ou de réclamation du client.',
    },
  ],
  relatedSlugs: [
    'sous-traitant-batiment-suisse-contrat-facturation',
    'previsionnel-tresorerie-entreprise-batiment',
    'contrat-entreprise-vs-mandat-artisan',
    'devis-facture-genie-civil-suisse',
  ],
  relatedTradeSlug: 'entreprise-generale',
};
