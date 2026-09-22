import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'onboarding-nouvel-apprenti-premieres-semaines',
  question: 'Comment bien intégrer un apprenti pendant ses premières semaines dans le bâtiment ?',
  title: 'Les premières semaines d’un apprenti : ce qui fait la différence',
  description:
    'Au-delà du salaire et des obligations légales, les premières semaines d’un apprenti déterminent souvent s’il tiendra jusqu’au CFC. Voici comment structurer un vrai accueil sur le chantier.',
  excerpt:
    'Un apprenti qui passe ses trois premières semaines à observer sans jamais toucher un outil décroche presque toujours plus vite que les autres.',
  category: 'RH & salaires',
  keywords: ['intégration apprenti bâtiment', 'accueil apprenti chantier', 'premières semaines apprenti construction'],
  publishedAt: '2026-10-08',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le salaire et les obligations légales d’un contrat d’apprentissage sont une chose ; l’intégration réelle sur le chantier en est une autre, souvent négligée alors qu’elle joue un rôle décisif. Les premières semaines déterminent en grande partie si un apprenti se projette dans le métier ou commence déjà à douter de son choix.',
    },
    { type: 'h2', text: 'Le premier jour ne s’improvise pas' },
    {
      type: 'p',
      text: 'Présenter le chantier, les consignes de sécurité et les règles de base dès le premier jour évite à l’apprenti de se sentir livré à lui-même face à un environnement souvent impressionnant pour quelqu’un qui découvre le métier. Un tour du chantier commenté, même de dix minutes, vaut mieux qu’une simple indication du vestiaire et de l’heure de début.',
    },
    { type: 'h2', text: 'Un référent identifié, pas une équipe diffuse' },
    {
      type: 'p',
      text: 'Désigner clairement une personne référente sur le terrain — pas nécessairement le patron lui-même — donne à l’apprenti un point de repère stable pour poser ses questions, plutôt que de devoir deviner à qui s’adresser au sein d’une équipe changeante. Ce référent n’a pas besoin d’être formellement un formateur au sens administratif du terme, mais doit être identifiable dès le premier jour.',
    },
    {
      type: 'list',
      items: [
        'Présenter le chantier et les consignes de sécurité dès le premier jour, pas de façon diluée sur plusieurs semaines',
        'Désigner un référent clair sur le terrain, disponible pour les questions du quotidien',
        'Doser progressivement la charge entre observation et pratique, sans laisser l’apprenti spectateur trop longtemps',
        'Fixer de petits objectifs atteignables dès les premières semaines, pour donner un sentiment de progression concret',
      ],
    },
    {
      type: 'callout',
      title: 'Trop d’observation démotive autant qu’un excès de pression',
      text: 'Un apprenti qui reste en retrait trop longtemps, à simplement regarder, finit par douter de sa place sur le chantier. L’inverse — trop de responsabilité trop vite — génère l’effet contraire. Le bon dosage se construit semaine après semaine, pas d’un coup.',
    },
    { type: 'h2', text: 'Pourquoi ces premières semaines pèsent autant' },
    {
      type: 'p',
      text: 'Un apprentissage se joue sur plusieurs années, mais la décision implicite de s’y investir vraiment se prend souvent bien plus tôt, parfois en quelques semaines. Un accueil négligé, même sans mauvaise intention de l’entreprise, peut suffire à installer un désengagement difficile à rattraper ensuite — un enjeu d’autant plus sensible dans un secteur qui peine déjà à retenir la relève.',
    },
    {
      type: 'cta',
      title: 'Suivre la progression d’un apprenti au fil des chantiers',
      text: 'Le fil d’actualité par chantier de Cantia permet de documenter concrètement les tâches confiées à chaque apprenti, semaine après semaine, une base utile pour ajuster le dosage entre observation et pratique.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi les premières semaines d’un apprenti sont-elles aussi importantes ?',
      answer:
        'C’est souvent durant cette période que se joue, implicitement, l’engagement réel de l’apprenti envers le métier. Un accueil structuré donne des repères qui rassurent, alors qu’un accueil négligé peut installer un désengagement difficile à corriger par la suite.',
    },
    {
      question: 'Faut-il désigner un référent officiel pour un apprenti ?',
      answer:
        'Ce n’est pas toujours une obligation formelle distincte du formateur responsable au sens légal, mais c’est une bonne pratique concrète : avoir une personne identifiée sur le terrain aide l’apprenti à savoir vers qui se tourner au quotidien.',
    },
    {
      question: 'Quelle différence entre cet accompagnement et les obligations légales de l’entreprise formatrice ?',
      answer:
        'Les obligations légales couvrent le salaire, l’autorisation de former et le suivi pédagogique formel avec l’école professionnelle. L’intégration au quotidien est complémentaire : elle porte sur l’accueil concret sur le chantier, au-delà de ce qu’exige strictement la réglementation.',
    },
  ],
  relatedSlugs: [
    'apprenti-batiment-salaire-obligations-employeur',
    'periode-essai-batiment-duree-legale',
    'fideliser-ouvriers-qualifies-penurie-batiment-suisse',
  ],
};
