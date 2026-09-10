import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'reception-travaux-proces-verbal-chantier',
  question: 'Serve un verbale di consegna dei lavori, e perché è il documento più importante del cantiere?',
  title: 'Consegna dei lavori: perché il verbale protegge tanto il cliente quanto l’imprenditore',
  description:
    'La consegna dei lavori fa scattare il termine di garanzia, trasferisce i rischi e fissa i difetti constatati. Senza verbale scritto, questo momento cruciale diventa impossibile da dimostrare.',
  excerpt:
    'Molti cantieri si concludono senza alcun documento formale: solo chiavi consegnate e un ultimo acconto pagato. È esattamente il momento in cui una controversia diventa impossibile da dirimere per mancanza di prova.',
  category: 'Juridique & normes',
  keywords: ['consegna dei lavori', 'verbale cantiere', 'garanzia costruzione', 'difetti cantiere', 'fine cantiere'],
  publishedAt: '2026-08-21',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La consegna dei lavori è il momento giuridico in cui il committente accetta l’opera così come viene consegnata. Non è una formalità accessoria: è l’evento che fa scattare il termine di garanzia, trasferisce i rischi dall’imprenditore al cliente, e fissa l’elenco dei difetti constatati in quell’istante preciso. Tutto ciò che non viene segnalato alla consegna diventa infatti più difficile da far valere in seguito.',
    },
    { type: 'h2', text: 'Cosa deve contenere il verbale' },
    {
      type: 'list',
      items: [
        'La data esatta della consegna, punto di partenza del termine di garanzia',
        'L’elenco preciso dei difetti constatati quel giorno, con la loro ubicazione',
        'La firma di entrambe le parti (senza di essa, il documento non prova nulla in caso di disaccordo)',
        'La menzione esplicita di una consegna senza riserve se non viene constatato alcun difetto',
      ],
    },
    { type: 'h2', text: 'Cosa succede senza verbale scritto' },
    {
      type: 'p',
      text: 'In assenza di un documento formale, la consegna può essere considerata tacita, come nel caso in cui il cliente utilizza l’opera senza riserve. Il problema non è giuridico ma pratico: senza data scritta, è impossibile dimostrare precisamente quando è iniziato a decorrere il termine di garanzia, né quali difetti esistessero già in quel momento piuttosto che comparsi dopo a causa di un uso normale.',
    },
    {
      type: 'callout',
      title: 'Un cliente che rifiuta di firmare non impedisce alla consegna di avere luogo',
      text: 'Anche stabilito unilateralmente dall’imprenditore e semplicemente notificato al cliente, un verbale resta largamente preferibile all’assenza totale di traccia scritta del momento della consegna.',
    },
    {
      type: 'p',
      text: 'Un rapporto di fine cantiere con foto datate, inviato al cliente al momento della consegna delle chiavi, svolge in pratica lo stesso ruolo protettivo di un verbale formale: fissa una data, documenta lo stato dell’opera, e dà una base fattuale in caso di contestazione successiva.',
    },
    {
      type: 'cta',
      title: 'Un rapporto di fine cantiere in pochi minuti',
      text: 'Cantia genera un rapporto PDF con foto geolocalizzate e datate, inviabile al cliente direttamente dal cantiere. Tutto il necessario per documentare correttamente ogni consegna di lavori.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'La consegna dei lavori deve obbligatoriamente essere scritta?',
      answer:
        'La legge non impone un formalismo rigido, ma senza documento scritto e datato, dimostrare il momento esatto della consegna e i difetti constatati diventa molto difficile in caso di controversia.',
    },
    {
      question: 'Cosa succede se il cliente rifiuta di firmare il verbale?',
      answer:
        'Anche stabilito unilateralmente e semplicemente notificato al cliente, il documento resta una prova ben più solida dell’assenza totale di traccia scritta.',
    },
    {
      question: 'Qual è l’effetto principale della consegna sulle garanzie?',
      answer:
        'Fa scattare il punto di partenza del termine di garanzia (generalmente 2 o 5 anni a seconda del tipo di difetto) e fissa l’elenco dei difetti già noti in quel momento.',
    },
  ],
  relatedSlugs: [
    'garantie-travaux-construction-2-ou-5-ans',
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'photos-chantier-preuve-juridique-litige',
  ],
};
