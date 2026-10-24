import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'erreurs-soumission-qui-coutent-le-marche',
  question: 'Quelles erreurs font perdre une soumission dans le bâtiment ?',
  title: 'Soumissions : les 8 erreurs qui coûtent le marché (ou la marge)',
  description:
    'Position oubliée, report de page faux, unité mal lue, escompte au mauvais endroit : les erreurs qui font écarter une soumission ou la gagner à perte, et comment les éviter.',
  excerpt:
    'On perd rarement une soumission parce qu’on était trop cher de 2 %. On la perd, ou on la gagne à perte, à cause d’une ligne vide ou d’un report faux.',
  category: 'Devis & facturation',
  keywords: ['erreur soumission', 'soumission bâtiment', 'offre écartée', 'report de page soumission', 'contrôle soumission'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une soumission se joue sur le prix, mais aussi sur la rigueur. Une offre incomplète peut être écartée avant même d’être comparée, et une erreur de calcul découverte après l’adjudication se paie sur toute la durée du chantier. Voici les erreurs qui reviennent le plus souvent, et le contrôle simple qui les évite.',
    },
    { type: 'h2', text: '1. Une position laissée sans prix' },
    {
      type: 'p',
      text: 'C’est l’erreur la plus fréquente sur un document de plusieurs dizaines de pages. Selon le contexte, la position vide est lue comme incluse gratuitement, ou rend l’offre incomplète. Comptez les positions sans prix avant l’envoi : le chiffre doit être zéro, sauf positions que vous excluez volontairement par écrit.',
    },
    { type: 'h2', text: '2. Un report de page faux' },
    {
      type: 'p',
      text: 'Sur papier, le sous-total de chaque page est reporté en haut de la suivante. Une seule erreur de recopie décale tout le chapitre et le total. Un outil qui calcule les reports à partir des montants supprime ce risque.',
    },
    { type: 'h2', text: '3. Une unité mal lue' },
    {
      type: 'p',
      text: 'Prix au m² alors que la position est au m³, au mètre linéaire au lieu de la pièce, à l’heure au lieu du forfait : l’écart peut être d’un facteur dix. Lisez l’unité de chaque position avant d’y reporter un prix de votre catalogue.',
    },
    { type: 'h2', text: '4. Modifier les quantités du document' },
    {
      type: 'p',
      text: 'Les quantités servent à comparer les offres entre elles. Si vous estimez qu’une quantité est fausse, dites-le dans une remarque ou un courrier, mais ne changez pas la ligne. Les seules quantités que vous remplissez sont celles que la position vous demande d’indiquer.',
    },
    { type: 'h2', text: '5. Rabais et escompte au mauvais endroit' },
    {
      type: 'p',
      text: 'Le rabais réduit le prix de l’offre ; l’escompte récompense un paiement rapide. Les appliquer dans le mauvais ordre, ou appliquer la TVA avant eux, change le total. Suivez l’ordre prévu par le récapitulatif de la soumission.',
    },
    { type: 'h2', text: '6. Oublier les conditions particulières' },
    {
      type: 'p',
      text: 'Les premières pages contiennent souvent ce qui coûte le plus cher : délais d’exécution, pénalités, installations de chantier à charge de l’entreprise, horaires restreints, évacuation des déchets. Un prix unitaire juste peut devenir perdant si ces conditions ne sont pas intégrées.',
    },
    { type: 'h2', text: '7. Rendre un autre document que celui demandé' },
    {
      type: 'p',
      text: 'Un devis dans votre propre format, un tableau Excel à la place du formulaire : la comparaison devient difficile et, sur un marché public, l’offre peut être jugée non conforme. Rendez le document d’origine complété, avec les annexes demandées.',
    },
    { type: 'h2', text: '8. Rendre en retard' },
    {
      type: 'p',
      text: 'Sur un marché public, une offre arrivée après l’échéance est en principe écartée, même excellente. Notez la date et l’heure limites dès la réception, et visez un envoi la veille.',
    },
    {
      type: 'callout',
      title: 'Le contrôle en 5 minutes avant d’envoyer',
      text: 'Positions sans prix : zéro. Total des chapitres égal au récapitulatif. Rabais, escompte et TVA dans l’ordre du document. Date, signature, annexes. Date et heure de dépôt respectées.',
    },
    { type: 'h2', text: 'Avec Cantia (bêta)' },
    {
      type: 'p',
      text: 'Cantia reprend les positions du PDF reçu et ne vous laisse remplir que les prix : les quantités du document restent intactes, les montants, reports et totaux sont calculés, et le récapitulatif montre ce qui reste à chiffrer. Le PDF d’origine ressort rempli. En bêta : 1 soumission d’essai avec Essentiel, 3 par mois avec Équipe, illimité avec Entreprise.',
    },
    {
      type: 'cta',
      title: 'Zéro report faux sur votre prochaine soumission',
      text: 'Importez le PDF, mettez vos prix, Cantia calcule et remplit le document d’origine.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'Une offre avec une position vide est-elle automatiquement écartée ?',
      answer:
        'Pas toujours, mais c’est un risque réel : selon les règles de l’appel d’offres, elle peut être considérée comme incomplète. Sur un marché privé, l’architecte vous demandera au mieux de compléter, au pire comparera en considérant la position comme incluse.',
    },
    {
      question: 'Peut-on corriger une soumission après l’avoir rendue ?',
      answer:
        'Sur un marché public, les modifications après dépôt sont très encadrées et le prix ne se renégocie en principe pas librement. Mieux vaut contrôler avant l’envoi que compter sur une correction après.',
    },
    {
      question: 'Comment éviter les erreurs de report de page ?',
      answer: 'En ne les faisant pas à la main : un tableur ou un outil qui calcule les montants et reporte les sous-totaux automatiquement supprime ce risque.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'rabais-escompte-tva-ordre-soumission', 'repondre-appel-offres-public-batiment-etapes'],
};
