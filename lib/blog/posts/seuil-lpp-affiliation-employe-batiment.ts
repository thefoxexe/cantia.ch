import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'seuil-lpp-affiliation-employe-batiment',
  question: 'À partir de quel salaire un employé du bâtiment doit-il être affilié à la LPP ?',
  title: 'À partir de quel salaire un employé doit-il être affilié à la LPP',
  description:
    'Le seuil d’entrée LPP, la coordination avec l’AVS, et les démarches concrètes de l’employeur pour affilier correctement un employé du bâtiment à la prévoyance professionnelle.',
  excerpt:
    'La question revient dès le premier employé engagé à un salaire suffisant. Le principe est simple, le montant précis change chaque année : voici comment ne pas se tromper.',
  category: 'Juridique & normes',
  keywords: [
    'seuil lpp affiliation employé',
    'salaire minimum lpp bâtiment',
    'affiliation caisse lpp employeur',
    'deuxième pilier employé bâtiment',
    'coordination avs lpp',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Dès qu’un employé du bâtiment dépasse un certain niveau de salaire annuel, son affiliation au deuxième pilier (LPP) devient obligatoire pour l’employeur. Le principe est clair dans la loi, mais le montant exact du seuil d’entrée est fixé chaque année par la Confédération et évolue périodiquement : mieux vaut toujours le vérifier auprès de sa caisse LPP au moment d’engager plutôt que de se fier à un chiffre retenu d’une année précédente.',
    },
    { type: 'h2', text: 'Le mécanisme du seuil d’entrée' },
    {
      type: 'p',
      text: 'La LPP prévoit un seuil de salaire annuel en dessous duquel l’affiliation n’est pas obligatoire, et au-dessus duquel elle le devient. Ce seuil est révisé périodiquement par la Confédération, ce qui signifie que le chiffre exact d’une année n’est pas garanti l’année suivante. La règle pratique la plus sûre est de demander directement à sa caisse LPP, ou à sa fiduciaire, le seuil applicable pour l’année en cours avant d’engager un nouvel employé.',
    },
    { type: 'h2', text: 'La déduction de coordination, un mécanisme lié' },
    {
      type: 'p',
      text: 'Le salaire assuré dans la LPP n’est pas le salaire brut total : une déduction de coordination est appliquée, car une partie du revenu est déjà couverte par l’AVS/AI. Le salaire assuré correspond donc à la part du salaire qui dépasse cette déduction, jusqu’à un plafond lui aussi révisé périodiquement. Ce détail explique pourquoi deux employés avec des salaires proches peuvent avoir des cotisations LPP sensiblement différentes.',
    },
    { type: 'h2', text: 'Les démarches concrètes pour l’employeur' },
    {
      type: 'list',
      items: [
        'Affilier l’entreprise à une caisse de pension (institution LPP), une obligation dès le premier employé concerné, si ce n’est pas déjà fait pour l’entreprise.',
        'Annoncer chaque nouvel employé dont le salaire dépasse le seuil d’entrée, dès l’engagement.',
        'Retenir la part employé sur le salaire mensuel et verser la part employeur, généralement au moins équivalente à la part employé selon la loi.',
        'Vérifier chaque année, au moment d’une augmentation de salaire, si un employé jusque-là sous le seuil ne le dépasse pas désormais.',
      ],
    },
    {
      type: 'callout',
      title: 'Le cas fréquent dans le bâtiment : plusieurs emplois à temps partiel',
      text: 'Un employé qui cumule plusieurs emplois à temps partiel peut, pris séparément, rester sous le seuil chez chaque employeur sans jamais atteindre l’affiliation obligatoire nulle part. C’est un angle mort fréquent dans le secteur, à signaler à l’employé concerné, qui peut demander une affiliation volontaire dans certains cas.',
    },
    {
      type: 'cta',
      title: 'La paie, sans recalculer chaque seuil à la main',
      text: 'Cantia garde la trace des salaires par employé, pour repérer facilement le moment où une augmentation fait franchir un seuil réglementaire comme celui de la LPP.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le seuil d’entrée LPP est-il le même pour tous les employeurs ?',
      answer:
        'Oui, c’est un seuil fixé au niveau fédéral, applicable de la même façon à toutes les entreprises suisses, quel que soit leur secteur. Seul son montant est révisé chaque année.',
    },
    {
      question: 'Un employé en dessous du seuil peut-il quand même être affilié à la LPP ?',
      answer:
        'Oui, une affiliation volontaire reste possible dans certains cas, notamment via une institution supplétive, même si elle n’est pas imposée par la loi en dessous du seuil.',
    },
    {
      question: 'Qui paie la part employeur de la LPP ?',
      answer:
        'L’employeur doit verser une part au moins équivalente à celle retenue sur le salaire de l’employé, selon les règles fixées par la loi et le règlement de la caisse de pension choisie.',
    },
  ],
  relatedSlugs: [
    'lpp-deuxieme-pilier-independant-batiment',
    'avs-ai-independant-batiment',
    'etablir-certificat-salaire-lohnausweis-premier-employe',
  ],
};
