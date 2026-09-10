import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'travailleur-temporaire-interimaire-batiment-regles',
  question: 'Ricorrere a un lavoratore interinale nell’edilizia: quali regole e quali trappole evitare?',
  title: 'Lavoratore temporaneo nell’edilizia: cosa sapere prima di ricorrervi',
  description:
    'Il lavoro interinale permette di assorbire rapidamente un picco di attività, ma implica un’impresa di collocamento di personale soggetta ad autorizzazione, e regole di coordinamento con la CCT del cantiere.',
  excerpt:
    'Un lavoratore interinale costa più caro all’ora di un dipendente fisso, ma evita l’impegno di un’assunzione. Bisogna però conoscere le regole affinché resti un vero guadagno, non un rischio nascosto.',
  category: 'RH & salaires',
  keywords: ['interinale edilizia', 'lavoratore temporaneo costruzione', 'collocamento di personale settore edile', 'agenzia interinale cantiere', 'manodopera temporanea svizzera'],
  publishedAt: '2026-07-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ricorrere a un lavoratore temporaneo per assorbire un picco di attività è comune nell’edilizia. L’operazione passa tuttavia legalmente attraverso un’impresa di collocamento di personale, soggetta ad autorizzazione cantonale e federale, e non attraverso un semplice accordo informale tra due imprese.',
    },
    { type: 'h2', text: 'Cosa distingue il lavoro interinale da un semplice prestito di personale' },
    {
      type: 'list',
      items: [
        'Un’impresa di collocamento di personale deve possedere un’autorizzazione ufficiale per collocare personale (un prestito informale di manodopera tra due imprese edili non ha questo statuto legale)',
        'Il contratto di lavoro lega l’interinale all’agenzia di collocamento, non all’impresa che lo accoglie sul cantiere: è l’agenzia che rimane responsabile del salario e degli oneri sociali',
        'L’impresa utilizzatrice deve comunque rispettare le stesse regole di sicurezza sul lavoro previste per i propri dipendenti',
      ],
    },
    { type: 'h2', text: 'Il coordinamento con la CCT del cantiere' },
    {
      type: 'p',
      text: 'Un interinale collocato su un cantiere di costruzione resta soggetto alle condizioni del contratto collettivo di lavoro applicabile al settore, allo stesso titolo di un dipendente fisso, il che obbliga l’agenzia di collocamento a tenerne conto nel salario versato e spiega in parte il costo orario più elevato fatturato all’impresa utilizzatrice.',
    },
    {
      type: 'callout',
      title: 'Il costo orario indicato include già gli oneri: confrontarlo direttamente con il salario di un dipendente fisso è fuorviante',
      text: 'La tariffa fatturata da un’agenzia di collocamento copre il salario, gli oneri sociali e il proprio margine. Il confronto pertinente è con il costo orario completo di un dipendente fisso, non con il suo solo salario lordo.',
    },
    { type: 'h2', text: 'Quando il lavoro interinale ha davvero senso' },
    {
      type: 'list',
      items: [
        'Un picco di attività puntuale e limitato nel tempo, su uno o due cantieri precisi',
        'Una sostituzione rapida in caso di assenza imprevista, senza il tempo di assumere direttamente',
        'Un test del volume di attività prima di decidere un’assunzione stabile',
      ],
    },
    {
      type: 'cta',
      title: 'Tenere traccia delle ore di un rinforzo temporaneo come quelle del team fisso',
      text: 'Il modulo Ore & Salari di Cantia permette di seguire l’attività di ogni collaboratore su un cantiere, rinforzo temporaneo compreso, senza doppio sistema parallelo.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Si può prestare personale tra due imprese edili senza passare per un’agenzia?',
      answer:
        'Un vero prestito di manodopera richiede un’impresa di collocamento di personale autorizzata. Un accordo informale senza questo statuto legale non è conforme.',
    },
    {
      question: 'Un interinale è soggetto alla CCT del cantiere in cui lavora?',
      answer:
        'Sì, le condizioni del contratto collettivo applicabile al settore si applicano a lui allo stesso titolo di un dipendente fisso, cosa che l’agenzia di collocamento deve ripercuotere nel suo salario.',
    },
    {
      question: 'Perché un interinale costa più caro all’ora di un dipendente fisso?',
      answer:
        'La tariffa fatturata include già il salario, gli oneri sociali e il margine dell’agenzia, il che rende pertinente il confronto con il costo orario completo di un dipendente, piuttosto che con il suo solo salario lordo.',
    },
  ],
  relatedSlugs: [
    'sous-effectif-chantier-recruter-ou-sous-traiter',
    'salaire-minimum-cct-construction-suisse',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
