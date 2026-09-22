import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-echafaudeur-suisse',
  question: 'Comment établir devis et factures en tant qu’échafaudeur en Suisse ?',
  title: 'Devis et facturation pour un échafaudeur en Suisse',
  description:
    'Location à la durée, montage et démontage, dépassement de délai, contrôle de sécurité : comment établir devis et factures en tant qu’échafaudeur en Suisse.',
  excerpt:
    'Le devis d’un échafaudeur combine deux logiques bien distinctes, montage et location à la durée, et c’est souvent la seconde qui pose problème quand le chantier prend du retard.',
  category: 'Métiers du bâtiment',
  keywords: ['devis échafaudeur suisse', 'facturation location échafaudage', 'prix montage échafaudage chantier'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La facturation d’un échafaudeur repose sur un modèle particulier, à mi-chemin entre la prestation de service et la location de matériel : le montage et le démontage sont généralement facturés en forfait, tandis que la mise à disposition de l’échafaudage l’est à la durée. Cette double composante demande un devis structuré différemment des autres métiers du bâtiment.',
    },
    { type: 'h2', text: 'Deux composantes distinctes dans le devis' },
    {
      type: 'table',
      headers: ['Poste', 'Base de calcul', 'Remarque'],
      rows: [
        ['Montage', 'Forfait selon surface et hauteur', 'Dépend de l’accessibilité du site'],
        ['Location à la durée', 'Prix par semaine ou par mois', 'Durée initiale à définir avec le client'],
        ['Démontage', 'Forfait, souvent lié au montage', 'Généralement inclus dans le même poste'],
        ['Dépassement de durée', 'Tarif journalier ou hebdomadaire supplémentaire', 'À prévoir explicitement dans le devis'],
      ],
    },
    { type: 'h2', text: 'Le dépassement de durée, une clause à ne jamais oublier' },
    {
      type: 'p',
      text: 'Un chantier prend souvent du retard pour des raisons qui n’ont rien à voir avec l’échafaudeur : météo, retard d’un autre corps de métier, modification de projet. Si le devis ne prévoit pas explicitement un tarif de dépassement, l’entreprise se retrouve soit à immobiliser son matériel gratuitement, soit à devoir négocier un supplément en pleine tension avec le client. Une clause claire, avec un tarif journalier ou hebdomadaire au-delà de la durée initiale, évite ce point de friction récurrent dans le métier.',
    },
    { type: 'h2', text: 'Une responsabilité de sécurité qui pèse sur le devis' },
    {
      type: 'p',
      text: 'Le montage d’un échafaudage engage la sécurité de tous les corps de métier qui l’utiliseront ensuite. Un contrôle de conformité avant mise à disposition, avec documentation à l’appui, fait généralement partie intégrante de la prestation et doit être valorisé dans le prix, pas traité comme une formalité gratuite. Ce contrôle s’inscrit dans le cadre plus large des exigences de sécurité applicables sur les chantiers suisses, notamment celles définies par la SUVA.',
    },
    {
      type: 'callout',
      title: 'Le matériel immobilisé sans facturation est une perte silencieuse',
      text: 'Un échafaudage qui reste en place trois semaines de plus que prévu sans clause de dépassement, c’est du matériel qui ne tourne pas sur un autre chantier. Cette perte ne se voit pas sur une facture, mais elle pèse directement sur la rentabilité de l’entreprise.',
    },
    {
      type: 'cta',
      title: 'Un devis qui sépare montage, location et dépassement',
      text: 'Cantia permet de structurer un devis d’échafaudage en plusieurs postes distincts et de facturer automatiquement un dépassement de durée constaté sur le chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment facturer un échafaudage qui reste plus longtemps que prévu sur un chantier ?',
      answer:
        'Le devis initial doit prévoir une clause de dépassement de durée, avec un tarif journalier ou hebdomadaire au-delà de la période contractuelle. Sans cette clause, la négociation devient plus difficile une fois le chantier en cours.',
    },
    {
      question: 'Qui est responsable si un échafaudage n’est pas conforme aux normes de sécurité ?',
      answer:
        'L’entreprise qui monte l’échafaudage porte généralement la responsabilité de sa conformité au moment de la mise à disposition. Un contrôle documenté avant remise au client protège l’échafaudeur en cas de contrôle ou d’incident ultérieur.',
    },
    {
      question: 'Le démontage est-il toujours inclus dans le prix du montage ?',
      answer:
        'C’est généralement le cas dans la plupart des devis d’échafaudage, mais il vaut mieux le préciser explicitement dans le devis pour éviter toute ambiguïté, notamment si le démontage doit intervenir dans des conditions différentes de celles prévues au montage.',
    },
  ],
  relatedSlugs: [
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'checklist-ouverture-chantier-artisan',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
  relatedTradeSlug: 'echafaudeur',
};
