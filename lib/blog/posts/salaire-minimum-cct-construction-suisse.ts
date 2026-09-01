import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'salaire-minimum-cct-construction-suisse',
  question: 'Quel est le salaire minimum dans le bâtiment en Suisse (CCT construction) ?',
  title: 'Salaire minimum bâtiment en Suisse : ce que fixe la CCT',
  description:
    'Le salaire minimum du gros œuvre suisse est fixé par la Convention nationale du secteur principal de la construction, pas par une loi fédérale. La CCT 2026-2031 change d’ailleurs plusieurs règles.',
  excerpt:
    'Il n’existe pas de salaire minimum légal fédéral en Suisse : dans le bâtiment, c’est la convention collective de branche qui fixe les planchers, et elle vient de changer pour 2026.',
  category: 'RH & salaires',
  keywords: ['salaire minimum', 'cct construction', 'convention collective', 'gros œuvre', 'salaire bâtiment suisse'],
  publishedAt: '2026-03-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La Suisse n’a pas de salaire minimum légal fédéral. Quelques cantons en fixent un pour l’économie générale, mais dans le gros œuvre, ce qui compte vraiment c’est la Convention nationale du secteur principal de la construction (CN), une CCT étendue qui s’impose à la quasi-totalité des entreprises de la branche, adhérentes ou non.',
    },
    { type: 'h2', text: 'Un plancher par métier et par région, pas un chiffre unique' },
    {
      type: 'p',
      text: 'Le salaire minimum varie selon la qualification (ouvrier non qualifié, qualifié, contremaître) et selon la région salariale, car les cantons ou zones ne sont pas tous alignés sur le même barème. Un ouvrier qualifié à Genève et le même profil dans une zone rurale d’un autre canton ne partent pas du même minimum garanti.',
    },
    {
      type: 'callout',
      title: 'Ce qui change avec la CCT 2026-2029/2031',
      text: 'Pour 2026, les salaires minimums restent globalement inchangés par rapport à 2025 (l’ajustement au renchérissement de +0,2 % étant intégré), une vraie revalorisation étant prévue dès 2027. En revanche, la nouvelle convention modifie sérieusement le régime des heures supplémentaires (un point qui a bien plus d’impact sur la fiche de paie réelle qu’un ajustement de plancher salarial).',
    },
    { type: 'h2', text: 'Le second œuvre suit ses propres CCT' },
    {
      type: 'p',
      text: 'La Convention nationale du secteur principal couvre le gros œuvre (maçonnerie, génie civil). D’autres métiers (plâtrerie-peinture, menuiserie, installations sanitaires, électricité) relèvent de conventions collectives distinctes, avec leurs propres minima et leurs propres règles. Un entrepreneur qui emploie plusieurs corps de métier peut se retrouver à appliquer plusieurs CCT différentes selon le poste occupé par chaque collaborateur.',
    },
    { type: 'h2', text: 'Où vérifier le bon chiffre' },
    {
      type: 'list',
      items: [
        'La convention applicable dépend du métier réellement exercé, pas seulement de l’intitulé du poste sur le contrat',
        'Les barèmes se mettent à jour chaque année, donc un chiffre appris il y a deux ans n’est jamais une valeur sûre',
        'Les caisses de compensation et associations professionnelles de la branche publient les grilles salariales à jour chaque année',
      ],
    },
    {
      type: 'cta',
      title: 'Les salaires de l’équipe, un taux par personne',
      text: 'Le module RH & Salaires de Cantia permet de configurer un taux horaire par employé, pratique pour refléter des barèmes CCT qui varient selon la qualification et le métier.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Existe-t-il un salaire minimum légal fédéral en Suisse ?',
      answer:
        'Non, la Confédération ne fixe pas de salaire minimum national. Dans le bâtiment, ce sont les conventions collectives de travail (CCT) de branche qui fixent des minima contraignants.',
    },
    {
      question: 'Le salaire minimum du bâtiment est-il le même partout en Suisse ?',
      answer:
        'Non, la Convention nationale du secteur principal de la construction fixe des minima différents selon la région salariale et la qualification de l’ouvrier.',
    },
    {
      question: 'Qu’est-ce qui change avec la CCT construction 2026 ?',
      answer:
        'Les salaires minimums restent globalement stables pour 2026, une vraie revalorisation étant prévue dès 2027. Le changement le plus significatif porte sur le régime des heures supplémentaires (report annuel plafonné, majoration de 25 % au-delà).',
    },
  ],
  relatedSlugs: [
    'heures-supplementaires-batiment-majoration-25',
    'calculer-13e-salaire-prorata-employe',
    'indemnites-kilometriques-2026-nouveau-taux',
  ],
};
