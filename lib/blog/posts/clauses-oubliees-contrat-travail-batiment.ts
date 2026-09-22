import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'clauses-oubliees-contrat-travail-batiment',
  question: 'Quelles clauses sont souvent oubliées dans un contrat de travail du bâtiment ?',
  title: 'Les clauses qu’on oublie dans un contrat de travail du bâtiment',
  description:
    'Mobilité entre chantiers, indemnités de déplacement, heures supplémentaires, matériel de service : les clauses fréquemment oubliées dans un contrat de travail du bâtiment.',
  excerpt:
    'Un contrat de travail copié d’un modèle générique oublie presque toujours les particularités du bâtiment : chantiers multiples, véhicule de service, heures qui débordent.',
  category: 'RH & salaires',
  keywords: ['contrat de travail', 'clauses', 'bâtiment', 'RH', 'employeur'],
  publishedAt: '2026-09-27',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup de contrats de travail dans le bâtiment sont rédigés à partir d’un modèle générique trouvé en ligne, sans être adaptés aux réalités du secteur. Résultat : des clauses essentielles manquent, et elles resurgissent au pire moment, lors d’un désaccord.',
    },
    { type: 'h2', text: '1. Les clauses les plus souvent oubliées' },
    {
      type: 'list',
      items: [
        'La clause de mobilité ou de lieu de travail variable, précisant que l’employé peut être affecté à différents chantiers dans une zone géographique définie, et non à une seule adresse fixe.',
        'Les indemnités kilométriques et de déplacement, avec leur mode de calcul (forfait, montant au kilomètre, ou temps de trajet inclus dans les heures de travail).',
        'Le régime des heures supplémentaires : comment elles sont comptabilisées, si elles sont compensées en temps libre ou payées, et avec quelle majoration éventuelle.',
        'L’usage du matériel et du véhicule de service en dehors des heures de travail, y compris les responsabilités en cas de dommage ou de vol.',
        'Une clause de non-concurrence, pertinente surtout pour les postes avec accès à la clientèle ou à des informations sensibles sur les chantiers de l’entreprise.',
      ],
    },
    { type: 'h2', text: '2. Pourquoi ces oublis coûtent cher plus tard' },
    {
      type: 'p',
      text: 'Une clause de mobilité absente peut par exemple donner lieu à une contestation lorsque l’employeur affecte un employé à un chantier éloigné de son domicile habituel. De même, l’absence de règle claire sur les heures supplémentaires transforme souvent un désaccord ponctuel en conflit prolongé, faute de référence écrite à laquelle se rattacher.',
    },
    { type: 'h2', text: '3. Un contrat type ne suffit jamais tout seul' },
    {
      type: 'p',
      text: 'Un modèle de contrat générique peut servir de base, mais il doit systématiquement être relu et complété pour refléter la réalité de l’entreprise : nombre de chantiers, zone géographique couverte, usage réel du véhicule de service. Un contrat mal adapté au secteur du bâtiment protège rarement l’employeur autant qu’il le pense.',
    },
    {
      type: 'callout',
      title: 'La clause qui évite le plus de conflits',
      text: 'Sur les chantiers, la clause de mobilité est probablement celle qui évite le plus de désaccords au quotidien. Sans elle, chaque affectation à un nouveau chantier éloigné peut techniquement être contestée comme une modification unilatérale du contrat.',
    },
    {
      type: 'cta',
      title: 'Des dossiers employés complets, chantier par chantier',
      text: 'Cantia centralise les informations RH de vos équipes et le suivi des affectations chantier, pour que chaque clause de mobilité ou d’heures supplémentaires corresponde à la réalité du terrain.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi la clause de mobilité est-elle importante dans le bâtiment ?',
      answer:
        'Parce que, contrairement à un poste de bureau, un employé du bâtiment travaille rarement toujours au même endroit. Sans clause précisant une zone géographique d’affectation, chaque changement de chantier éloigné peut être contesté comme une modification du contrat initial.',
    },
    {
      question: 'Faut-il préciser le régime des heures supplémentaires dans le contrat ?',
      answer:
        'C’est fortement recommandé, en complément de ce que prévoit la CCT applicable. Préciser comment les heures supplémentaires sont comptabilisées et compensées évite la plupart des désaccords, en particulier sur les chantiers avec des délais serrés.',
    },
    {
      question: 'Un modèle de contrat trouvé en ligne est-il suffisant pour une entreprise du bâtiment ?',
      answer:
        'Rarement en l’état. Un modèle générique doit être adapté aux spécificités du secteur (mobilité, véhicule de service, indemnités de déplacement) pour offrir une protection réelle, tant à l’employeur qu’à l’employé.',
    },
  ],
  relatedSlugs: [
    'periode-essai-batiment-duree-legale',
    'travailleur-temporaire-interimaire-batiment-regles',
    'licenciement-ouvrier-batiment-delai-conge-cct',
  ],
};
