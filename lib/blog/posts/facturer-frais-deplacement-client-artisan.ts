import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturer-frais-deplacement-client-artisan',
  question: 'Faut-il facturer les frais de déplacement à ses clients en tant qu’artisan ?',
  title: 'Faut-il facturer les frais de déplacement à ses clients',
  description:
    'Forfait kilométrique, tarif horaire incluant le trajet, ou gratuité dans un rayon donné : les pratiques courantes pour facturer le déplacement, et comment le rendre transparent.',
  excerpt:
    'Facturer ou non le déplacement n’est pas qu’une question de prix : mal expliqué dans le devis, c’est souvent la ligne qui fait le plus grincer les dents d’un client.',
  category: 'Devis & facturation',
  keywords: ['déplacement', 'facturation', 'devis', 'artisan', 'frais kilométriques'],
  publishedAt: '2026-09-26',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le déplacement fait partie des postes les plus mal compris par les clients — non pas parce que le principe est injuste, mais parce qu’il est rarement expliqué clairement dans le devis.',
    },
    { type: 'h2', text: '1. Trois pratiques courantes' },
    {
      type: 'list',
      items: [
        'Un forfait kilométrique ou un montant fixe par déplacement, souvent utilisé pour les chantiers éloignés du siège de l’entreprise.',
        'Le déplacement inclus dans le tarif horaire général, sans ligne séparée sur le devis — pratique fréquente pour les entreprises qui travaillent surtout dans un rayon proche.',
        'Une gratuité du déplacement dans un rayon défini (par exemple à l’intérieur d’une ville ou d’une région), avec facturation au-delà.',
      ],
    },
    { type: 'h2', text: '2. Quand il est justifié de facturer le déplacement' },
    {
      type: 'p',
      text: 'Facturer le déplacement se justifie particulièrement pour un chantier éloigné du siège de l’entreprise, ou lorsque plusieurs passages sont nécessaires sur un même dossier (visite de chiffrage, intervention, contrôle après travaux). Dans ces cas, ne pas le facturer revient souvent à rogner directement sur la marge du chantier, surtout si les trajets s’accumulent sur un projet qui s’étale dans le temps.',
    },
    { type: 'h2', text: '3. Le rendre transparent pour éviter la contestation' },
    {
      type: 'p',
      text: 'Le principal problème n’est presque jamais le montant du déplacement, mais sa présentation. Un forfait de déplacement qui apparaît comme une ligne surprise sur la facture finale, sans avoir été mentionné dans le devis, génère presque systématiquement une contestation. À l’inverse, une ligne clairement identifiée dès le devis, avec son mode de calcul explicité (forfait fixe, ou au kilomètre), est rarement remise en question.',
    },
    {
      type: 'callout',
      title: 'La règle la plus simple',
      text: 'Que vous facturiez le déplacement ou non, la seule chose qui compte vraiment est la cohérence entre ce qui est annoncé dans le devis et ce qui apparaît sur la facture. Un client accepte presque toujours un forfait déplacement annoncé à l’avance ; il conteste presque toujours une ligne qui apparaît pour la première fois sur la facture.',
    },
    {
      type: 'cta',
      title: 'Un forfait déplacement qui apparaît automatiquement sur chaque devis',
      text: 'Configurez une fois votre forfait ou votre tarif kilométrique dans Cantia, et il s’ajoute automatiquement à chaque nouveau devis, sans ligne oubliée ni surprise pour le client.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on facturer le déplacement même pour un petit chantier ?',
      answer:
        'Oui, rien ne l’interdit, à condition que ce soit annoncé clairement dans le devis ou dans les conditions générales avant l’intervention. C’est la transparence, plus que le montant, qui détermine si le client l’acceptera sans contester.',
    },
    {
      question: 'Vaut-il mieux inclure le déplacement dans le tarif horaire ou le facturer à part ?',
      answer:
        'Les deux approches existent et fonctionnent. Inclure le déplacement dans le tarif horaire simplifie le devis mais peut désavantager l’entreprise sur les chantiers proches ; le facturer à part est plus juste sur la distance mais ajoute une ligne à expliquer au client.',
    },
    {
      question: 'Comment fixer un forfait de déplacement cohérent ?',
      answer:
        'En partant du coût réel (temps de trajet non facturable, carburant, usure du véhicule) plutôt que d’un montant arbitraire copié sur la concurrence. Un forfait par zone de distance est souvent plus simple à gérer qu’un calcul au kilomètre exact.',
    },
  ],
  relatedSlugs: [
    'facturer-depannage-urgent-sans-devis',
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'fixer-prix-artisan-sans-brader-concurrence-suisse',
  ],
};
