import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'contrat-entreprise-vs-mandat-artisan',
  question: 'Contrat d’entreprise ou contrat de mandat : quelle différence pour un artisan ?',
  title: 'Contrat d’entreprise vs mandat : ce qui change vraiment pour un artisan',
  description:
    'Un artisan qui pose du carrelage est sous contrat d’entreprise (obligation de résultat). Un architecte qui conseille est souvent sous mandat (obligation de moyens). La différence pèse lourd en cas de litige.',
  excerpt:
    'Deux régimes juridiques, une différence énorme : l’un vous engage sur un résultat, l’autre sur des moyens mis en œuvre. La plupart des artisans ne savent pas dans lequel ils travaillent.',
  category: 'Juridique & normes',
  keywords: ['contrat d’entreprise', 'contrat de mandat', 'obligation de résultat', 'obligation de moyens', 'droit suisse'],
  publishedAt: '2026-03-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un artisan qui pose du carrelage promet un résultat : un sol posé, plat, sans défaut. Un architecte qui conseille sur un projet promet des moyens mis en œuvre avec diligence, pas un résultat garanti. Cette distinction juridique de base change radicalement ce qu’on peut vous reprocher en cas de litige.',
    },
    { type: 'h2', text: 'Contrat d’entreprise : obligation de résultat' },
    {
      type: 'p',
      text: 'Régi par les art. 363 et suivants du Code des obligations, le contrat d’entreprise engage l’entrepreneur sur la livraison d’un ouvrage conforme à ce qui a été convenu, quelles que soient les difficultés rencontrées en cours de route. C’est le régime par défaut de la quasi-totalité des métiers manuels du bâtiment : maçon, électricien, menuisier, peintre, plâtrier. Si le résultat n’est pas atteint, la garantie légale s’applique (voir le régime de 2 à 5 ans selon la nature de l’ouvrage), sans que l’entrepreneur puisse se défendre en disant « j’ai fait de mon mieux ».',
    },
    { type: 'h2', text: 'Contrat de mandat : obligation de moyens' },
    {
      type: 'p',
      text: 'Régi par les art. 394 et suivants CO, le mandat engage seulement à mettre en œuvre les moyens et la diligence attendus d’un professionnel, sans garantir un résultat précis. C’est typiquement le régime d’un architecte en phase de conseil, d’un bureau d’ingénieurs pour une étude, ou d’un maître d’œuvre pour du pilotage. Un architecte peut être dégagé de sa responsabilité s’il démontre avoir agi avec la diligence requise, même si le résultat final déçoit.',
    },
    {
      type: 'callout',
      title: 'Pourquoi ça change tout en cas de litige',
      text: 'Sous contrat d’entreprise, la seule question qui compte est : le résultat promis a-t-il été livré ? Sous mandat, la question devient : les moyens mis en œuvre étaient-ils raisonnables et diligents ? La charge de la preuve et l’angle de défense sont complètement différents. Un artisan qui pense être sous mandat alors qu’il est sous contrat d’entreprise risque donc de se défendre avec les mauvais arguments.',
    },
    { type: 'h2', text: 'Un même chantier peut mélanger les deux' },
    {
      type: 'p',
      text: 'Un architecte qui conçoit et supervise (mandat) fait intervenir des entreprises qui exécutent (contrat d’entreprise) : les deux régimes coexistent alors sur le même projet, chacun s’appliquant au bon acteur. La confusion la plus fréquente : un artisan qui accepte des missions de conseil ou de coordination en plus de son exécution habituelle bascule parfois, sans le savoir, sous un régime de mandat pour cette partie-là de sa prestation.',
    },
    {
      type: 'cta',
      title: 'Un devis qui précise ce qui est promis',
      text: 'Cantia laisse détailler précisément chaque prestation sur le devis. La meilleure protection reste toujours d’écrire noir sur blanc ce qui est livré, quel que soit le régime contractuel applicable.',
      buttonLabel: 'Découvrir le module Devis',
    },
  ],
  faq: [
    {
      question: 'Un artisan du bâtiment travaille-t-il sous contrat d’entreprise ou contrat de mandat ?',
      answer:
        'Presque toujours sous contrat d’entreprise (art. 363 et suivants CO), qui engage sur un résultat ; un architecte en phase de conseil, lui, reste le plus souvent sous mandat.',
    },
    {
      question: 'Quelle est la principale différence pratique entre les deux régimes ?',
      answer:
        'Le contrat d’entreprise engage sur un résultat garanti ; le contrat de mandat engage seulement sur les moyens et la diligence mis en œuvre, sans garantir le résultat final.',
    },
    {
      question: 'Un même chantier peut-il combiner les deux types de contrat ?',
      answer:
        'Oui, fréquemment : un architecte sous mandat pour la conception et le suivi, des entreprises sous contrat d’entreprise pour l’exécution. Chaque acteur relève ainsi du régime adapté à sa mission.',
    },
  ],
  relatedSlugs: [
    'norme-sia-118-devis-obligatoire',
    'garantie-travaux-construction-2-ou-5-ans',
    'permis-construire-renovation-quand-necessaire',
  ],
};
