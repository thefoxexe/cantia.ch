import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'accident-travail-chantier-obligations-employeur-suva',
  question: 'Un ouvrier a un accident sur le chantier : quelles sont les obligations immédiates de l’employeur envers la SUVA ?',
  title: 'Accident de travail sur un chantier : les obligations de l’employeur envers la SUVA',
  description:
    'Déclaration dans les délais, salaire pendant l’incapacité, reprise du travail : un accident de chantier déclenche des obligations précises pour l’employeur du bâtiment, assuré obligatoirement à la SUVA.',
  excerpt:
    'Le bâtiment est un secteur à risque, si bien que les règles de déclaration et de suivi de la SUVA y sont plus strictes qu’ailleurs. Une déclaration tardive ou mal remplie peut retarder l’indemnisation de l’employé.',
  category: 'RH & salaires',
  keywords: ['accident travail chantier', 'SUVA obligations employeur', 'déclaration accident construction', 'incapacité travail ouvrier', 'assurance accident bâtiment'],
  publishedAt: '2026-08-06',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Toute entreprise du secteur de la construction en Suisse est obligatoirement assurée auprès de la SUVA pour les accidents professionnels : contrairement à d’autres branches, aucun choix d’assureur n’est possible sur ce point. Cela s’accompagne d’obligations précises dès qu’un accident survient sur un chantier, professionnel ou non professionnel selon le statut de l’employé.',
    },
    { type: 'h2', text: 'Les 3 réflexes immédiats' },
    {
      type: 'list',
      items: [
        'Déclarer l’accident à la SUVA sans délai, même en cas de doute sur la gravité, en utilisant le formulaire de déclaration d’accident (LAA) prévu à cet effet',
        'Continuer à verser le salaire pendant les 2 premiers jours (voire plus selon le contrat), avant la prise en charge par l’assurance à 80 % du salaire assuré',
        'Documenter les circonstances de l’accident pendant qu’elles sont encore fraîches, en notant le lieu exact, l’heure et les témoins présents sur le chantier',
        'Vérifier que l’employé accidenté était bien inscrit et affilié au moment des faits, en particulier pour un intérimaire ou un nouvel embauché',
      ],
    },
    {
      type: 'callout',
      title: 'La documentation du chantier au moment des faits fait toute la différence',
      text: 'En cas de contestation ultérieure sur les circonstances (accident professionnel vs non professionnel, faute d’un tiers, respect des consignes de sécurité), avoir une trace précise de qui était présent et de l’état du chantier ce jour-là sécurise autant l’employeur que l’employé.',
    },
    { type: 'h2', text: 'Le retour au travail n’est pas automatique' },
    {
      type: 'p',
      text: 'La reprise se fait sur certificat médical, parfois à temps partiel ou avec des restrictions temporaires (pas de port de charges, pas de travail en hauteur). L’employeur doit alors pouvoir adapter le poste ou l’affectation en conséquence, ce qui suppose souvent de réorganiser temporairement les équipes sur les chantiers en cours.',
    },
    {
      type: 'cta',
      title: 'Une équipe et des chantiers visibles d’un coup d’œil',
      text: 'Le planning d’équipe de Cantia permet de réorganiser rapidement les affectations si un membre de l’équipe doit être temporairement déchargé après un accident.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qui paie le salaire les premiers jours après un accident de travail ?',
      answer:
        'L’employeur continue à verser le salaire durant une courte période initiale (généralement 2 jours), avant que la SUVA ne prenne le relais à hauteur de 80 % du salaire assuré.',
    },
    {
      question: 'Faut-il déclarer un accident même léger à la SUVA ?',
      answer:
        'Oui, il est recommandé de déclarer tout accident dès qu’il entraîne une incapacité de travail ou des soins médicaux, même en cas de doute initial sur la gravité.',
    },
    {
      question: 'La SUVA est-elle obligatoire dans le secteur de la construction ?',
      answer:
        'Oui, les entreprises de construction sont légalement tenues d’assurer leurs employés contre les accidents auprès de la SUVA, sans possibilité de choisir un autre assureur pour cette couverture.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'salaire-minimum-cct-construction-suisse',
    'photos-chantier-preuve-juridique-litige',
  ],
};
