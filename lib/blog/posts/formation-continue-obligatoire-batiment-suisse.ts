import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'formation-continue-obligatoire-batiment-suisse',
  question: 'Quelles formations continues sont obligatoires dans le bâtiment en Suisse ?',
  title: 'Formation continue dans le bâtiment : ce qui est obligatoire',
  description:
    'Sécurité SUVA, travail en hauteur, conduite d’engins : plusieurs habilitations du bâtiment doivent être recyclées périodiquement. Voici pourquoi les négliger expose l’entreprise en cas d’accident.',
  excerpt:
    'Une habilitation périmée ne se voit pas au quotidien — jusqu’au jour où un accident survient, et où l’assurance ou l’inspection du travail la réclame.',
  category: 'RH & salaires',
  keywords: ['formation continue bâtiment suisse', 'recyclage sécurité chantier', 'habilitations obligatoires construction'],
  publishedAt: '2026-10-08',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Certaines formations dans le bâtiment ne s’acquièrent pas une fois pour toutes. Un certain nombre d’habilitations liées à la sécurité doivent être recyclées à intervalles réguliers, faute de quoi elles perdent leur validité — souvent sans que l’entreprise s’en rende compte avant qu’un contrôle ou un accident ne le révèle.',
    },
    { type: 'h2', text: 'Des exemples fréquents dans le secteur' },
    {
      type: 'p',
      text: 'Le paysage précis des formations à recycler dépend fortement du type de travaux effectués par l’entreprise et évolue régulièrement, mais certains types de formation reviennent généralement dans le secteur de la construction.',
    },
    {
      type: 'list',
      items: [
        'Les formations sécurité liées à la SUVA pour certains travaux considérés à risque particulier',
        'Les habilitations pour le travail en hauteur, généralement soumises à un recyclage périodique',
        'Les permis ou habilitations spécifiques pour la conduite de certains engins de chantier',
        'Les formations liées à la manipulation de produits ou matériaux dangereux, selon le type de chantier',
      ],
    },
    {
      type: 'p',
      text: 'Les intervalles de recyclage et le champ exact de ces obligations varient selon le type d’habilitation et évoluent avec le temps : mieux vaut vérifier la situation précise auprès de la SUVA, de l’association professionnelle du métier concerné ou de l’organisme qui a délivré la formation initiale, plutôt que de se fier à une règle générale approximative.',
    },
    { type: 'h2', text: 'Qui est responsable de les organiser' },
    {
      type: 'p',
      text: 'La responsabilité d’organiser et, en général, de financer ces recyclages revient le plus souvent à l’employeur, dans le cadre plus large de son obligation de garantir la sécurité de ses employés sur le chantier. Cela suppose un minimum de suivi administratif : savoir qui a besoin de quel recyclage, et à quelle échéance, plutôt que de le découvrir après coup.',
    },
    {
      type: 'callout',
      title: 'Le vrai coût se révèle après un accident, pas avant',
      text: 'Une habilitation expirée passe souvent inaperçue au quotidien, sans conséquence visible tant que rien ne se passe. C’est en cas d’accident que son absence pèse réellement — vis-à-vis de l’assurance, de l’inspection du travail, et de la responsabilité de l’entreprise elle-même.',
    },
    {
      type: 'cta',
      title: 'Ne plus perdre le fil des échéances de formation',
      text: 'Entre les chantiers, les devis et les urgences du quotidien, une échéance de recyclage se perd facilement. Cantia permet de garder une vision claire de chaque équipe et de ses tâches, un point d’appui utile pour ne pas laisser filer ces échéances.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Toutes les formations du bâtiment doivent-elles être recyclées périodiquement ?',
      answer:
        'Non, cela concerne surtout les habilitations liées à des travaux considérés à risque particulier, comme le travail en hauteur ou certaines opérations avec des engins spécifiques. La formation de base initiale n’a généralement pas besoin d’être répétée de la même façon.',
    },
    {
      question: 'Qui paie les formations de recyclage dans le bâtiment ?',
      answer:
        'C’est généralement à l’employeur d’organiser et de financer ces formations, dans le cadre de son obligation générale d’assurer la sécurité de ses employés sur les chantiers.',
    },
    {
      question: 'Que risque une entreprise si une habilitation n’est pas à jour lors d’un accident ?',
      answer:
        'La situation peut compliquer la prise en charge par l’assurance et engager davantage la responsabilité de l’entreprise, en particulier si l’accident concerne précisément le type de travaux couvert par l’habilitation expirée.',
    },
  ],
  relatedSlugs: [
    'apprenti-batiment-salaire-obligations-employeur',
    'certificat-de-travail-obligation-employeur-batiment',
    'fideliser-ouvriers-qualifies-penurie-batiment-suisse',
  ],
};
