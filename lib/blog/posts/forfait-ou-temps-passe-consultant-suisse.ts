import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'forfait-ou-temps-passe-consultant-suisse',
  question: 'Consultant : faut-il facturer au forfait ou au temps passé ?',
  title: 'Forfait ou temps passé : comment un consultant doit facturer',
  description:
    'Avantages et risques du forfait, du temps passé et du budget plafonné pour un consultant indépendant en Suisse, avec la façon de suivre le mandat dans les deux cas.',
  excerpt:
    'Le forfait rassure le client, le temps passé protège le consultant. Le bon choix dépend surtout de ce que vous savez du mandat au moment de l’offre.',
  category: 'Services & autres métiers',
  keywords: ['consultant forfait ou régie', 'facturer au temps passé', 'honoraires consultant Suisse', 'offre de mandat', 'budget plafonné'],
  publishedAt: '2026-10-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Le choix du mode de facturation se fait dans l’offre, mais il se paie pendant tout le mandat. Trois formules couvrent l’essentiel des cas.',
    },
    { type: 'h2', text: 'Les trois formules' },
    {
      type: 'table',
      headers: ['Formule', 'Pour le client', 'Pour vous', 'Quand l’utiliser'],
      rows: [
        ['Forfait', 'Prix connu d’avance', 'Risque de dépassement', 'Livrable clair, périmètre stable'],
        ['Temps passé', 'Paie ce qui est fait', 'Pas de risque de dépassement', 'Périmètre flou, accompagnement'],
        ['Budget plafonné', 'Plafond rassurant', 'Dépassement à renégocier', 'Mandat exploratoire'],
      ],
    },
    { type: 'h2', text: 'Au forfait : définir où le mandat s’arrête' },
    {
      type: 'p',
      text: 'Un forfait n’est rentable que si le périmètre est écrit : livrables, nombre de séances, ce qui n’est pas compris, et le tarif des prestations supplémentaires. Toute demande hors périmètre devient un avenant accepté par le client.',
    },
    { type: 'h2', text: 'Au temps passé : rendre le temps lisible' },
    {
      type: 'p',
      text: 'Le client accepte d’autant mieux une facture au temps passé qu’il comprend ce qu’il paie. Une ligne par date avec une description courte suffit. Notez le temps le jour même : reconstitué en fin de mois, il est toujours sous-estimé.',
    },
    {
      type: 'callout',
      title: 'Dans les deux cas, mesurer',
      text: 'Même au forfait, suivez vos heures par mandat. C’est la seule façon de savoir si votre prix était juste et de mieux chiffrer le prochain.',
    },
    { type: 'h2', text: 'Prévenir avant de dépasser' },
    {
      type: 'p',
      text: 'Avec un forfait ou un budget plafonné, parlez au client quand une part importante du budget est consommée, pas au moment de la facture. Une alerte à mi-parcours ouvre une discussion ; une surprise à la fin ouvre un litige.',
    },
    {
      type: 'cta',
      title: 'Le temps par mandat, comparé à l’offre',
      text: 'Avec Cantia, vous saisissez votre temps sur le mandat, voyez la part du budget consommée et préparez la facture depuis l’offre ou les heures. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Quel mode de facturation préfèrent les clients ?',
      answer: 'Beaucoup préfèrent le forfait pour la prévisibilité. Le budget plafonné est un bon compromis quand le périmètre n’est pas encore clair.',
    },
    {
      question: 'Faut-il suivre son temps même au forfait ?',
      answer: 'Oui, pour savoir si le forfait était rentable et pour chiffrer correctement les mandats suivants.',
    },
    {
      question: 'Comment facturer une demande hors périmètre ?',
      answer: 'Par un supplément ou un avenant chiffré, accepté par le client avant d’être réalisé.',
    },
  ],
  relatedSlugs: ['facturer-support-informatique-temps-passe', 'formateur-independant-suisse-tva-facture', 'relancer-client-facture-impayee-sans-perdre-client'],
  relatedTradeSlug: 'consultant',
};
