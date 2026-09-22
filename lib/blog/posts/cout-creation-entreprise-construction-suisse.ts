import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cout-creation-entreprise-construction-suisse',
  question: 'Combien coûte réellement la création d’une entreprise de construction en Suisse ?',
  title: 'Combien coûte réellement la création d’une entreprise de construction en Suisse',
  description:
    'Le budget réel pour lancer une entreprise du bâtiment en Suisse : frais d’inscription, assurances, outillage, trésorerie de départ et le poste que presque personne ne budgète.',
  excerpt:
    '« Une raison individuelle, ça ne coûte rien à créer. » C’est vrai pour l’inscription. C’est faux pour tout le reste, et c’est ce reste qui met en danger la première année.',
  category: 'Juridique & normes',
  keywords: [
    'coût création entreprise construction suisse',
    'budget démarrage artisan bâtiment',
    'combien coûte créer une sàrl bâtiment',
    'frais ouverture entreprise bâtiment',
    'trésorerie de départ artisan',
  ],
  publishedAt: '2026-09-10',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: '« Créer une raison individuelle ne coûte rien. » C’est vrai, au sens strict : aucun capital minimum, aucun acte notarié en dessous de CHF 100’000 de chiffre d’affaires. Mais c’est aussi la phrase qui pousse le plus d’artisans à sous-budgéter leur première année, en confondant le coût de l’inscription et le coût réel du démarrage.',
    },
    { type: 'h2', text: '1. Les frais administratifs de création' },
    {
      type: 'table',
      headers: ['Poste', 'Raison individuelle', 'Sàrl'],
      rows: [
        ['Numéro IDE (identification des entreprises)', 'Gratuit', 'Gratuit'],
        ['Inscription au registre du commerce', 'Facultative sous CHF 100’000 de CA, puis obligatoire', 'Obligatoire dès la constitution'],
        ['Acte notarié', 'Non requis', 'Environ CHF 500 à 1’200 selon canton et notaire'],
        ['Frais de registre du commerce', '—', 'Environ CHF 200 à 400'],
        ['Capital social à immobiliser', '—', 'CHF 20’000 (récupérable une fois la société active)'],
        ['Aide d’une plateforme ou fiduciaire (optionnel)', 'Souvent inutile', 'CHF 300 à 900 pour un accompagnement complet'],
      ],
    },
    {
      type: 'p',
      text: 'Sur ce seul poste, une raison individuelle coûte donc proche de zéro, et une Sàrl se situe généralement entre CHF 1’000 et 2’500 tout compris. Ce sont les chiffres que tout le monde a en tête. Le reste, presque personne ne le budgète avant d’en avoir besoin en urgence.',
    },
    { type: 'h2', text: '2. Les assurances : le poste sous-estimé numéro un' },
    {
      type: 'list',
      items: [
        'Assurance responsabilité civile professionnelle : rarement une option en pratique, souvent exigée par les maîtres d’ouvrage et les architectes avant même de signer le premier devis',
        'Assurance accidents (LAA) : obligatoire dès le premier employé, facultative pour l’indépendant seul mais fortement recommandée',
        'Assurance perte de gain maladie : facultative pour un indépendant, mais souvent le seul filet en cas d’arrêt prolongé',
        'Assurance chantier tous risques (ECTR) : ponctuelle, à prévoir dès qu’un chantier engage un montant significatif de matériaux ou d’ouvrage en cours',
      ],
    },
    {
      type: 'callout',
      title: 'Un poste variable, jamais nul',
      text: 'Le montant exact dépend du métier, du chiffre d’affaires assuré et de l’assureur, mais il n’existe pas de scénario réaliste où ce poste peut être ignoré la première année. Demander plusieurs devis d’assurance avant l’ouverture évite une mauvaise surprise dans les premières semaines d’activité.',
    },
    { type: 'h2', text: '3. Outillage, véhicule et équipement de base' },
    {
      type: 'p',
      text: 'Le montant varie énormément selon le corps de métier : un plâtrier-peintre démarre avec un budget outillage sans commune mesure avec celui d’un charpentier ou d’un installateur sanitaire. Le vrai piège n’est pas le montant en lui-même, mais la tentation de tout acheter neuf et d’un coup avant même le premier chantier signé — plutôt que d’équiper progressivement, au rythme des besoins réels.',
    },
    { type: 'h2', text: '4. Les cotisations sociales, dès le premier mois' },
    {
      type: 'p',
      text: 'L’affiliation AVS/AI/APG est obligatoire dès le début de l’activité indépendante, avec des acomptes provisoires calculés sur une estimation du revenu de la première année. Une cotisation minimale reste due même en cas de revenu très faible ou nul. C’est une charge fixe, indépendante du rythme réel d’encaissement des chantiers, qui doit figurer dans la trésorerie de départ dès le premier jour.',
    },
    { type: 'h2', text: '5. Le vrai poste oublié : la trésorerie de démarrage' },
    {
      type: 'p',
      text: 'Le délai entre le premier chantier signé et le premier encaissement réel — devis, exécution, facturation, délai de paiement du client — dépasse souvent 60 à 90 jours. Pendant ce temps, les charges fixes (cotisations, assurances, véhicule, éventuel loyer d’atelier) continuent de tomber. Une entreprise du bâtiment qui démarre sans au moins deux à trois mois de charges fixes en réserve prend un risque de trésorerie bien plus dangereux que n’importe quel poste de la liste ci-dessus.',
    },
    {
      type: 'stat',
      value: '2 à 3 mois',
      label: 'de charges fixes en réserve : le minimum de trésorerie de départ raisonnable avant le premier encaissement',
    },
    {
      type: 'cta',
      title: 'Le seul poste du budget qui doit rester sous contrôle en continu',
      text: 'Cantia suit vos encaissements réels par rapport aux charges à venir, pour voir venir un trou de trésorerie avant qu’il ne devienne un problème.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Combien coûte réellement la création d’une raison individuelle dans le bâtiment ?',
      answer:
        'L’inscription elle-même coûte quasiment rien (numéro IDE gratuit, aucun capital minimum), mais le budget réel de démarrage inclut aussi les assurances, l’outillage et plusieurs mois de trésorerie de charges fixes, souvent plusieurs milliers de francs au total.',
    },
    {
      question: 'Quel est le poste de coût le plus souvent sous-estimé au démarrage ?',
      answer:
        'La trésorerie de départ : le délai entre le premier chantier signé et le premier encaissement réel dépasse souvent deux à trois mois, pendant lesquels les charges fixes continuent de tomber.',
    },
    {
      question: 'Faut-il souscrire une assurance RC professionnelle dès la création de l’entreprise ?',
      answer:
        'Dans la pratique, presque toujours oui : de nombreux maîtres d’ouvrage et architectes l’exigent avant même de signer un premier devis, même quand elle n’est pas légalement obligatoire pour le métier concerné.',
    },
  ],
  relatedSlugs: [
    'creer-entreprise-batiment-suisse-guide-complet',
    'raison-individuelle-sarl-sa-quel-statut-batiment',
    'previsionnel-tresorerie-entreprise-batiment',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
