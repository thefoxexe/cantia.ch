import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'fideliser-ouvriers-qualifies-penurie-batiment-suisse',
  question: 'Comment une entreprise du bâtiment peut-elle fidéliser ses ouvriers qualifiés face à la pénurie de main-d’œuvre ?',
  title: 'Fidéliser ses ouvriers qualifiés quand la main-d’œuvre se fait rare',
  description:
    'Recruter un ouvrier qualifié coûte cher et prend du temps. En garder un déjà formé coûte presque toujours moins cher. Les leviers concrets de fidélisation dans un secteur en tension.',
  excerpt:
    'Dans un secteur où chaque entreprise se dispute les mêmes profils qualifiés, la fidélisation n’est plus un sujet secondaire de ressources humaines : c’est devenu un vrai levier de compétitivité.',
  category: 'Croissance & acquisition',
  keywords: ['fidéliser ouvriers bâtiment', 'pénurie main d’œuvre construction Suisse', 'garder ses employés entreprise bâtiment', 'recrutement chantier difficile', 'turnover ouvrier qualifié'],
  publishedAt: '2026-09-18',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le secteur de la construction fait face à une pénurie structurelle de main-d’œuvre qualifiée dans plusieurs corps de métier en Suisse. Dans ce contexte, remplacer un bon ouvrier qui part chez un concurrent coûte souvent plus cher, en temps et en argent, que les efforts nécessaires pour éviter qu’il ne parte.',
    },
    { type: 'h2', text: 'Ce qui retient vraiment un ouvrier qualifié' },
    {
      type: 'list',
      items: [
        'Un salaire aligné, voire légèrement au-dessus, du marché (la CCT fixe un plancher, pas un plafond)',
        'Une organisation claire des chantiers, sans improvisation permanente qui use l’équipe sur la durée',
        'Des heures correctement comptées et payées, y compris les heures supplémentaires, sans négociation systématique',
        'Une reconnaissance concrète du travail bien fait, pas seulement l’absence de reproches',
      ],
    },
    {
      type: 'stat',
      value: '3-6 mois',
      label: 'délai moyen souvent nécessaire pour recruter et former un remplaçant qualifié dans certains corps de métier du bâtiment en tension',
    },
    { type: 'h2', text: 'La transparence sur les heures compte plus qu’on ne le pense' },
    {
      type: 'p',
      text: 'Un ouvrier qui doit régulièrement réclamer ses heures supplémentaires, ou qui découvre des erreurs sur sa fiche de salaire, perd confiance bien plus vite qu’il ne le montre. Un système clair de saisie des heures, avec un décompte transparent et accessible, réduit ce type de frictions silencieuses qui finissent par pousser un bon élément vers la sortie.',
    },
    {
      type: 'callout',
      title: 'Former un apprenti est aussi une stratégie de fidélisation à long terme',
      text: 'Un apprenti formé en interne, qui connaît déjà les méthodes et l’équipe de l’entreprise, part statistiquement moins souvent qu’un profil recruté à l’extérieur. La formation est ainsi un investissement de fidélisation autant que de compétence.',
    },
    {
      type: 'cta',
      title: 'Des heures et des salaires transparents, sans friction',
      text: 'Cantia permet à chaque employé de saisir ses heures facilement depuis le chantier, avec un décompte clair, afin d’éviter les malentendus sur les heures supplémentaires qui érodent la confiance sur la durée.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi la fidélisation des ouvriers est-elle devenue un enjeu stratégique dans le bâtiment ?',
      answer:
        'Parce que la pénurie de main-d’œuvre qualifiée rend le remplacement d’un bon élément long et coûteux (souvent plusieurs mois entre le départ et la pleine productivité d’un remplaçant).',
    },
    {
      question: 'Le salaire est-il le principal facteur de fidélisation d’un ouvrier qualifié ?',
      answer:
        'C’est un facteur important, mais rarement le seul. L’organisation des chantiers, la transparence sur les heures et la reconnaissance du travail jouent souvent un rôle tout aussi déterminant.',
    },
    {
      question: 'Former un apprenti est-il rentable pour une petite entreprise du bâtiment ?',
      answer:
        'Généralement oui sur la durée : un apprenti formé en interne connaît déjà les méthodes de l’entreprise et présente souvent un taux de départ plus faible qu’un profil recruté en externe.',
    },
  ],
  relatedSlugs: [
    'sous-effectif-chantier-recruter-ou-sous-traiter',
    'heures-supplementaires-batiment-majoration-25',
    'apprenti-batiment-salaire-obligations-employeur',
  ],
};
