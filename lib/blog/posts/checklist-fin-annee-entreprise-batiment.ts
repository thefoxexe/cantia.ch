import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-fin-annee-entreprise-batiment',
  question: 'Quelle checklist administrative suivre en fin d’année pour une entreprise du bâtiment ?',
  title: 'Checklist administrative de fin d’année pour une entreprise du bâtiment',
  description:
    'La checklist de fin d’année pour une entreprise du bâtiment en Suisse : impayés, inventaire, certificats de salaire, rentabilité par chantier, acomptes.',
  excerpt:
    'Entre les derniers chantiers à boucler et les fêtes qui approchent, la fin d’année est le moment où l’administratif prend le plus de retard. Voici une checklist pour ne rien oublier.',
  category: 'Chantier & rentabilité',
  keywords: [
    'checklist fin année entreprise bâtiment',
    'clôture comptable artisan',
    'fin d’année entreprise construction suisse',
    'bilan chantier fin année',
  ],
  publishedAt: '2026-10-04',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La fin d’année est le moment où le retard administratif accumulé pendant la haute saison se paie, au sens propre : factures non relancées, matériel jamais inventorié, rentabilité des chantiers jamais analysée. Voici une checklist pour clore l’année sur des bases propres, plutôt que de tout reporter en janvier.',
    },
    { type: 'h2', text: 'Checklist de fin d’année' },
    {
      type: 'list',
      items: [
        'Relancer toutes les factures impayées avant la clôture, plutôt que de les laisser glisser sur l’exercice suivant',
        'Vérifier l’inventaire du matériel et des équipements, et sortir ce qui est hors d’usage ou perdu',
        'Préparer les certificats de salaire pour chaque employé, en vérifiant les éléments variables (heures supplémentaires, primes, 13e salaire)',
        'Faire le point sur la rentabilité de l’année, chantier par chantier, pour identifier ceux qui ont réellement généré de la marge',
        'Planifier les acomptes et jalons de facturation des chantiers en cours pour le début de l’année suivante',
        'Vérifier que les assurances (RC professionnelle, chantier) couvrent bien l’activité prévue pour l’année à venir',
        'Faire l’inventaire des devis en attente de réponse et relancer ceux qui traînent depuis plusieurs semaines',
        'Sauvegarder ou archiver les documents de chantier de l’année (contrats, avenants, rapports de contrôle)',
      ],
    },
    {
      type: 'callout',
      title: 'La rentabilité par chantier révèle plus que le résultat global',
      text: 'Une entreprise peut afficher un résultat annuel correct tout en ayant perdu de l’argent sur plusieurs chantiers, compensés par d’autres très rentables. Sans ce détail chantier par chantier, impossible de savoir quels types de travaux ou quels clients privilégier l’année suivante.',
    },
    {
      type: 'p',
      text: 'Cette checklist n’a pas vocation à remplacer le travail du fiduciaire pour la clôture comptable proprement dite, mais à préparer le terrain : des factures relancées, un inventaire à jour et une rentabilité analysée par chantier rendent la clôture plus rapide et surtout plus utile pour décider de la stratégie de l’année suivante.',
    },
    {
      type: 'cta',
      title: 'Clôturez l’année avec des chiffres clairs',
      text: 'Cantia centralise vos devis, factures et chantiers, pour voir en un coup d’œil votre rentabilité par chantier et vos impayés avant la fin de l’année.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi relancer les impayés avant la clôture plutôt qu’après ?',
      answer:
        'Parce qu’un impayé identifié et relancé avant la clôture peut encore être encaissé sur l’exercice en cours, alors qu’un impayé reporté sur l’année suivante complique le suivi et retarde d’autant la trésorerie disponible.',
    },
    {
      question: 'Comment analyser la rentabilité par chantier en fin d’année ?',
      answer:
        'En comparant, pour chaque chantier, le prix facturé au client avec le coût réel (matériel, heures de main-d’œuvre, sous-traitance), pour identifier les types de chantiers qui génèrent effectivement de la marge.',
    },
    {
      question: 'Cette checklist remplace-t-elle le travail du fiduciaire ?',
      answer:
        'Non, elle prépare le terrain administratif et opérationnel en amont, ce qui rend le travail du fiduciaire sur la clôture comptable proprement dite plus rapide et plus fiable.',
    },
  ],
  relatedSlugs: [
    'previsionnel-tresorerie-entreprise-batiment',
    'checklist-cloture-chantier-avant-facturation',
    'calculer-13e-salaire-prorata-employe',
  ],
};
