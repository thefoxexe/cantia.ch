import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'vacances-non-prises-fin-annee-batiment-cct',
  question: 'Que faire des jours de vacances non pris par un employé du bâtiment en fin d’année ?',
  title: 'Vacances non prises en fin d’année dans le bâtiment : report, paiement ou perte ?',
  description:
    'Le solde de vacances non prises pose une vraie question de trésorerie et de droit du travail pour les entreprises du bâtiment : voici les règles à connaître avant de trancher.',
  excerpt:
    'Un solde de vacances qui s’accumule d’année en année n’est jamais anodin : soit il représente une dette envers l’employé, soit il révèle un problème d’organisation qui va se répéter.',
  category: 'RH & salaires',
  keywords: ['vacances non prises', 'solde vacances employé', 'droit travail bâtiment', 'CCT construction vacances', 'gestion RH chantier'],
  publishedAt: '2026-07-31',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Le principe de base du droit suisse est clair : les vacances doivent être prises en nature, et ne peuvent en principe pas être remplacées par une prestation en argent tant que les rapports de travail durent (art. 329d CO). Un employeur qui « paie » systématiquement les vacances non prises au lieu de les faire poser prend un risque juridique, même si la pratique reste répandue dans certaines petites structures.',
    },
    { type: 'h2', text: 'Pourquoi la compensation en argent est risquée' },
    {
      type: 'p',
      text: 'Le paiement en espèces des vacances en cours de contrat est admis seulement dans des cas très limités, typiquement un emploi de courte durée ou irrégulier où le repos effectif n’est pas praticable. Pour un employé en poste stable dans le bâtiment, ce n’est en principe pas la règle, et un contrôle ultérieur peut requalifier ces paiements et exiger malgré tout que les jours soient effectivement pris ou compensés.',
    },
    {
      type: 'list',
      items: [
        'Le report d’une année sur l’autre est possible s’il reste raisonnable et ne s’accumule pas indéfiniment',
        'L’employeur a le droit de fixer la date des vacances en tenant compte des désirs de l’employé, dans la mesure compatible avec l’entreprise',
        'À la fin des rapports de travail, le solde non pris doit être payé, cette fois-ci en argent',
        'Une CCT sectorielle peut fixer des règles complémentaires sur le report ou la planification',
      ],
    },
    {
      type: 'callout',
      title: 'Le vrai enjeu opérationnel : planifier les vacances avant la fin d’année',
      text: 'Un solde qui explose en décembre traduit souvent un manque de visibilité sur le planning de chantier. L’employeur hésite à libérer du monde par peur de retarder les travaux en cours.',
    },
    {
      type: 'cta',
      title: 'Un planning d’équipe qui anticipe les absences',
      text: 'Le module Planning de Cantia donne une vue claire des chantiers en cours et de l’équipe disponible. De quoi planifier les vacances sans se retrouver à court de main-d’œuvre en pleine saison.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on payer les vacances non prises au lieu de les faire poser ?',
      answer:
        'Sauf cas particuliers comme un emploi de courte durée, la réponse est non tant que les rapports de travail durent. Le paiement en argent devient la règle uniquement à la fin du contrat.',
    },
    {
      question: 'Un employé peut-il reporter ses vacances sur l’année suivante ?',
      answer:
        'Oui, dans une mesure raisonnable, mais un solde qui s’accumule indéfiniment d’année en année n’est pas conforme à l’esprit de la loi, qui veut un repos effectif régulier.',
    },
    {
      question: 'Qui décide de la date des vacances : l’employeur ou l’employé ?',
      answer:
        'L’employeur fixe la date en tenant compte des désirs de l’employé dans la mesure compatible avec les besoins de l’entreprise. Ce n’est pas un droit unilatéral de l’un ou de l’autre.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'calculer-13e-salaire-prorata-employe',
    'gerer-plusieurs-chantiers-en-parallele-methode',
  ],
};
