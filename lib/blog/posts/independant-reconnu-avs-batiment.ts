import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'independant-reconnu-avs-batiment',
  question: 'Qu’est-ce que ça change d’être reconnu comme indépendant par l’AVS dans le bâtiment ?',
  title: 'Indépendant reconnu par l’AVS dans le bâtiment : ce que ça change vraiment',
  description:
    'Les critères de reconnaissance du statut d’indépendant par la caisse de compensation AVS, et le risque de requalification pour les sous-traitants du bâtiment qui ne sont pas reconnus.',
  excerpt:
    'Se déclarer indépendant ne suffit pas : c’est la caisse de compensation qui tranche, sur la base de critères précis. Et pour un sous-traitant non reconnu, les conséquences peuvent remonter jusqu’à l’entreprise cliente.',
  category: 'Juridique & normes',
  keywords: [
    'indépendant reconnu avs bâtiment',
    'statut indépendant caisse de compensation',
    'sous-traitant salarié déguisé bâtiment',
    'critères reconnaissance indépendant avs',
    'requalification indépendant salarié',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Dans le bâtiment, beaucoup de sous-traitants travaillent en raison individuelle sans avoir vérifié un point pourtant décisif : la caisse de compensation AVS doit officiellement reconnaître leur statut d’indépendant. Ce n’est pas automatique du simple fait de facturer sous un numéro d’entreprise, et l’absence de reconnaissance peut avoir des conséquences pour l’entreprise cliente, pas seulement pour le sous-traitant lui-même.',
    },
    { type: 'h2', text: 'Les critères que la caisse de compensation vérifie' },
    {
      type: 'list',
      items: [
        'Le nombre de clients : travailler pour un seul donneur d’ordre de façon quasi exclusive et durable est un signal fort de salariat déguisé plutôt que d’indépendance réelle.',
        'Le risque entrepreneurial propre : facturer au forfait, assumer les malfaçons et les délais, investir dans son propre matériel plutôt que d’utiliser celui du donneur d’ordre.',
        'L’autonomie d’organisation : fixer soi-même ses horaires, ses méthodes de travail et l’ordre de ses chantiers, plutôt que d’être intégré à l’organisation du client comme un salarié.',
        'La possession de son propre matériel et de sa propre assurance responsabilité civile professionnelle, plutôt que de dépendre entièrement de l’équipement du donneur d’ordre.',
      ],
    },
    { type: 'h2', text: 'Ce qui se passe quand la reconnaissance est refusée' },
    {
      type: 'p',
      text: 'Si la caisse de compensation estime que l’activité relève en réalité d’un rapport de salariat déguisé, le sous-traitant peut être requalifié en salarié rétroactivement. Les cotisations sociales (AVS/AI/APG, et potentiellement LAA) qui auraient dû être prélevées sur cette période deviennent alors dues, et c’est souvent l’entreprise cliente, considérée comme employeur de fait, qui doit les régulariser, avec les intérêts moratoires correspondants.',
    },
    { type: 'h2', text: 'Pourquoi c’est un risque sous-estimé pour les entreprises générales' },
    {
      type: 'p',
      text: 'Une entreprise du bâtiment qui fait régulièrement appel au même sous-traitant, pour l’essentiel de son activité, s’expose à ce risque même si le contrat est présenté comme de la sous-traitance. Vérifier que chaque sous-traitant régulier dispose bien d’une attestation de reconnaissance AVS à jour, et travaille pour plusieurs clients, n’est pas une formalité superflue : c’est une protection directe contre un redressement de cotisations qui peut porter sur plusieurs années.',
    },
    {
      type: 'callout',
      title: 'L’attestation AVS d’indépendant se demande, elle ne se suppose pas',
      text: 'Un sous-traitant peut demander une attestation formelle de reconnaissance d’indépendant à sa caisse de compensation. C’est ce document, pas la simple existence d’une raison individuelle au registre du commerce, qui protège réellement en cas de contrôle.',
    },
    {
      type: 'cta',
      title: 'Des sous-traitants suivis chantier par chantier, pas seulement facture par facture',
      text: 'Cantia garde la trace de qui intervient sur quel chantier et pour quelle mission, un historique utile pour démontrer la nature réelle d’une relation de sous-traitance en cas de contrôle.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un sous-traitant avec un seul client est-il automatiquement requalifié en salarié ?',
      answer:
        'Pas automatiquement, mais c’est l’un des critères les plus lourds examinés par la caisse de compensation. Travailler pour un seul donneur d’ordre de façon durable augmente fortement le risque de requalification si les autres critères d’indépendance ne sont pas non plus réunis.',
    },
    {
      question: 'Qui paie les cotisations en cas de requalification rétroactive ?',
      answer:
        'En général, l’entreprise cliente est considérée comme l’employeur de fait et doit régulariser les cotisations sociales dues sur la période concernée, avec les intérêts moratoires. C’est pour cela que le risque pèse aussi sur le donneur d’ordre, pas uniquement sur le sous-traitant.',
    },
    {
      question: 'Comment vérifier qu’un sous-traitant est bien reconnu comme indépendant par l’AVS ?',
      answer:
        'En lui demandant son attestation de reconnaissance d’indépendant délivrée par sa caisse de compensation. C’est un document officiel, distinct d’une simple inscription au registre du commerce.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'travail-au-noir-batiment-suisse-risques-controles',
    'creer-entreprise-batiment-suisse-guide-complet',
  ],
};
