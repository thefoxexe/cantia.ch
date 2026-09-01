import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'fixer-prix-artisan-sans-brader-concurrence-suisse',
  question: 'Comment un artisan doit-il fixer ses prix sans les brader face à une concurrence moins chère ?',
  title: 'Fixer ses prix sans les brader, même face à une concurrence moins chère',
  description:
    'Baisser systématiquement ses prix pour rester compétitif finit toujours par fragiliser l’entreprise. Comment construire un prix défendable et le justifier face à un client qui compare des devis.',
  excerpt:
    'Un artisan qui aligne systématiquement ses prix sur le devis le moins cher reçu par le client finit toujours par travailler plus, pour gagner moins. Et ce n’est presque jamais soutenable sur la durée.',
  category: 'Croissance & acquisition',
  keywords: ['fixer prix artisan bâtiment', 'concurrence prix construction Suisse', 'ne pas brader ses devis', 'justifier prix chantier client', 'stratégie tarifaire entreprise bâtiment'],
  publishedAt: '2026-09-11',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Face à un devis concurrent moins cher, la réaction instinctive est souvent de s’aligner pour ne pas perdre le client. C’est une stratégie qui fonctionne rarement à long terme, car un prix construit sur un calcul réel de coût de revient et de marge ne peut pas descendre indéfiniment sans finir par travailler à perte, même sans s’en rendre compte immédiatement.',
    },
    { type: 'h2', text: 'Un prix défendable part toujours du coût réel' },
    {
      type: 'list',
      items: [
        'Le coût horaire réel de l’équipe (salaire, charges sociales, assurances, temps improductif), et non le seul salaire net versé',
        'Le coût des matériaux avec la marge de casse et de manutention',
        'Les frais fixes de l’entreprise (véhicule, assurance RC, logiciel, atelier) répartis sur l’activité facturable',
        'Une marge bénéficiaire réelle, pas seulement de quoi couvrir les coûts',
      ],
    },
    {
      type: 'stat',
      value: '10-15 %',
      label: 'marge bénéficiaire nette généralement visée par une entreprise du bâtiment saine, après couverture de tous les coûts réels',
    },
    { type: 'h2', text: 'Justifier un prix plutôt que le défendre' },
    {
      type: 'p',
      text: 'Face à un client qui compare, expliquer concrètement ce que le prix couvre (qualité des matériaux choisis, garantie, assurance, délai de réalisation) fonctionne mieux qu’une simple défense du chiffre. Un client qui comprend pourquoi un prix est ce qu’il est accepte souvent de payer plus cher pour la tranquillité d’esprit, en particulier sur un chantier important comme une rénovation.',
    },
    {
      type: 'callout',
      title: 'Un devis moins cher cache parfois des postes manquants',
      text: 'Il est utile, sans dénigrer un confrère, d’aider le client à comparer ce que chaque devis couvre réellement (évacuation des déchets, garantie, assurance) plutôt que le seul chiffre final, souvent trompeur si les prestations comparées ne sont pas équivalentes.',
    },
    {
      type: 'cta',
      title: 'Connaître son vrai coût de revient avant de fixer un prix',
      text: 'Cantia calcule la rentabilité réelle de chaque chantier (devisé vs coût réel), pour fixer des prix qui couvrent vraiment les coûts de l’entreprise, pas seulement ce qui semble raisonnable au premier coup d’œil.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il s’aligner sur le devis le moins cher d’un concurrent ?',
      answer:
        'Généralement non. Un prix construit sur un calcul réel de coût de revient et de marge ne peut pas s’aligner indéfiniment sur une offre moins chère sans finir par travailler à perte.',
    },
    {
      question: 'Comment justifier un prix plus élevé qu’un devis concurrent ?',
      answer:
        'En expliquant concrètement ce que le prix couvre (qualité des matériaux, garantie, assurance, délai) plutôt qu’en défendant simplement le chiffre sans contexte.',
    },
    {
      question: 'Quelle marge bénéficiaire une entreprise du bâtiment doit-elle viser ?',
      answer:
        'Généralement entre 10 et 15 % nets après couverture de tous les coûts réels (main-d’œuvre, matériaux, frais fixes) : un prix qui ne dégage aucune marge n’est pas soutenable dans la durée.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-de-revient-chantier-batiment',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'calculer-prix-horaire-reel-ouvrier-batiment',
  ],
};
