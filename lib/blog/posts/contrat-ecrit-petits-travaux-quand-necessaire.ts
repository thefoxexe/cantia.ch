import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'contrat-ecrit-petits-travaux-quand-necessaire',
  question: 'Faut-il un contrat écrit même pour de petits travaux en Suisse ?',
  title: 'Petits travaux : à partir de quel montant un écrit devient nécessaire',
  description:
    'Aucun seuil légal n’impose l’écrit pour un contrat d’entreprise en Suisse. Mais un seuil pratique existe bel et bien, et il tient à ce qui devient difficile à prouver de mémoire.',
  excerpt:
    'La loi n’impose aucun seuil pour exiger un écrit. Le seuil qui compte vraiment n’est pas légal : c’est celui à partir duquel un désaccord de mémoire coûte cher.',
  category: 'Juridique & normes',
  keywords: ['contrat écrit', 'petits travaux', 'devis obligatoire', 'dépannage', 'seuil pratique'],
  publishedAt: '2026-05-18',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un robinet réparé en dix minutes ne demande évidemment pas de contrat signé en trois exemplaires. Un chantier de rénovation à CHF 40’000 n’attend évidemment pas la même légèreté. Entre les deux, où se situe le seuil ? La réponse n’est pas dans la loi, mais dans le bon sens, et elle vaut la peine d’être posée clairement une fois pour toutes.',
    },
    { type: 'h2', text: 'Ce que dit (et ne dit pas) la loi' },
    {
      type: 'p',
      text: 'Aucun seuil légal n’existe en droit suisse pour imposer une forme écrite à un contrat d’entreprise, quel que soit le montant. Un devis à CHF 200 ou à CHF 200’000 a exactement la même validité juridique s’il est accepté à l’oral. Ce qui change avec le montant, ce n’est pas la validité, mais le coût d’un désaccord si l’écrit manque.',
    },
    {
      type: 'callout',
      title: 'Le vrai critère : ce qu’un désaccord coûterait',
      text: 'Pour une intervention de moins d’une heure à faible montant, un désaccord de mémoire coûte peu, car la perte potentielle reste gérable. Dès qu’un chantier dépasse quelques centaines de francs ou s’étale sur plusieurs jours, le coût d’un malentendu (sur le prix, le périmètre, le délai) devient suffisant pour justifier une trace écrite systématique, même minimale.',
    },
    { type: 'h2', text: 'Un repère pratique, pas une règle légale' },
    {
      type: 'list',
      items: [
        'Dépannage ponctuel, quelques dizaines à une centaine de francs : un accord oral suffit dans la grande majorité des cas',
        'Intervention d’une demi-journée ou plus, ou montant à plusieurs centaines de francs : un devis écrit, même sommaire, protège les deux parties',
        'Chantier de plusieurs jours ou plusieurs corps de métier : un devis détaillé devient indispensable, pas seulement recommandé',
      ],
    },
    { type: 'h2', text: 'Le compromis rapide qui couvre l’essentiel' },
    {
      type: 'p',
      text: 'Même pour une petite intervention, un message texte envoyé après coup (« intervention du [date], remplacement de [élément], CHF [montant] ») suffit à transformer un accord oral fragile en trace exploitable, sans passer par un document formel. C’est le minimum qui change tout en cas de contestation ultérieure, pour un coût de rédaction proche de zéro.',
    },
    {
      type: 'cta',
      title: 'Un devis, même pour une petite intervention, en quelques minutes',
      text: 'Cantia permet de générer un devis rapide et chiffré même pour une petite intervention. La trace existe alors sans ralentir le rythme d’une journée chargée.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Existe-t-il un montant à partir duquel un contrat écrit devient légalement obligatoire ?',
      answer:
        'Non, aucun seuil légal n’existe en droit suisse pour un contrat d’entreprise : un accord oral reste valable quel que soit le montant.',
    },
    {
      question: 'Pourquoi formaliser par écrit même de petits travaux ?',
      answer:
        'Parce que le coût d’un désaccord de mémoire (sur le prix, le périmètre ou le délai) dépasse rapidement l’effort de rédiger une trace écrite, même minimale.',
    },
    {
      question: 'Un simple SMS de confirmation suffit-il à sécuriser un petit chantier ?',
      answer:
        'Dans la plupart des cas pratiques, oui, car un message confirmant la date, la prestation et le montant transforme un accord oral fragile en preuve exploitable.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'difference-devis-offre-facture-pro-forma',
    'signature-electronique-devis-suisse-valeur-legale',
  ],
};
