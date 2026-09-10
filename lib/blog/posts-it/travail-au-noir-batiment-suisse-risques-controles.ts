import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'travail-au-noir-batiment-suisse-risques-controles',
  question: 'Quali sono i rischi del lavoro nero nell’edilizia in Svizzera?',
  title: 'Lavoro nero nell’edilizia: cosa rischia davvero un’azienda',
  description:
    'Il settore edile è tra i rami più controllati dalla LLN. Più di 14’000 controlli aziendali sono stati effettuati nel 2025: le sanzioni vanno ben oltre la multa.',
  excerpt:
    'L’edilizia figura tra i rami più controllati della Svizzera. E la sanzione più pesante non è la multa. È l’esclusione dagli appalti pubblici.',
  category: 'Juridique & normes',
  keywords: ['lavoro nero', 'lln', 'controllo cantiere', 'sanzioni edilizia', 'seco'],
  publishedAt: '2026-04-30',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'L’edilizia non è un settore controllato «come gli altri» in Svizzera. È uno dei rami più mirati dalle ispezioni legate alla legge contro il lavoro nero. Nel 2025, circa 14’450 controlli aziendali sono stati condotti a livello nazionale, con l’alberghiero-ristorazione e l’edilizia esplicitamente citati tra i settori prioritari.',
    },
    { type: 'h2', text: 'Cosa copre esattamente la LLN' },
    {
      type: 'p',
      text: 'La legge federale del 17 giugno 2005 concernente provvedimenti in materia di lotta contro il lavoro nero (LLN), con la sua ordinanza d’applicazione (OLN), mira ad assicurare che gli obblighi di notifica e autorizzazione legati al diritto delle assicurazioni sociali, al diritto degli stranieri e all’imposta alla fonte siano correttamente rispettati, non solo in caso di assenza totale di dichiarazione, ma anche per dichiarazioni parziali o incomplete.',
    },
    {
      type: 'callout',
      title: 'La sanzione più pesante non è finanziaria',
      text: 'Oltre alle multe, una condanna passata in giudicato per violazione grave o ripetuta può comportare l’esclusione di un’azienda dagli appalti pubblici e la soppressione o riduzione di aiuti finanziari pubblici (due conseguenze che spesso pesano di più, sul lungo periodo, della multa stessa) per un’azienda che lavora con enti pubblici.',
    },
    { type: 'h2', text: 'Cosa fa scattare un controllo su un cantiere' },
    {
      type: 'list',
      items: [
        'Un controllo improvviso diretto sul cantiere da parte di ispettori cantonali o paritetici',
        'Una segnalazione (concorrente, vicino, ex dipendente) che fa scattare una verifica mirata',
        'Un controllo incrociato durante un’ispezione legata a un’altra azienda dello stesso cantiere (in particolare un subappaltatore)',
      ],
    },
    { type: 'h2', text: 'Proteggersi, dal lato dell’azienda principale' },
    {
      type: 'p',
      text: 'Il rischio non si limita ai propri dipendenti: un’azienda che ricorre a un subappaltatore in difetto di notifica può ritrovarsi associata al problema sul proprio stesso cantiere, anche senza colpa diretta. Verificare che un subappaltatore sia in regola (affiliazione alle assicurazioni sociali, autorizzazioni per il personale straniero se del caso) prima di firmare protegge da questo effetto di contaminazione.',
    },
    {
      type: 'p',
      text: 'Per l’azienda stessa, la migliore protezione resta la più semplice: un’affiliazione aggiornata di ogni collaboratore, contratti di lavoro in piena regola, e una traccia chiara delle ore effettivamente lavorate. È il tipo di documentazione che un controllo richiede per primo.',
    },
    {
      type: 'cta',
      title: 'Le ore del team, tracciate per cantiere',
      text: 'Il modulo RH & Salaires di Cantia conserva uno storico chiaro delle ore lavorate da ogni collaboratore, cantiere per cantiere, il che offre una base solida in caso di controllo.',
      buttonLabel: 'Scoprire RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'L’edilizia è particolarmente controllata in Svizzera?',
      answer:
        'Sì, è uno dei rami esplicitamente citati come prioritario nei controlli LLN, insieme all’alberghiero-ristorazione, con decine di migliaia di persone controllate ogni anno.',
    },
    {
      question: 'Qual è la sanzione più pesante in caso di lavoro nero accertato?',
      answer:
        'Oltre alle multe, una condanna per violazione grave o ripetuta può comportare l’esclusione dagli appalti pubblici e la soppressione di aiuti finanziari: conseguenze spesso più pesanti sul lungo periodo.',
    },
    {
      question: 'Un’azienda rischia qualcosa se il suo subappaltatore è in infrazione?',
      answer:
        'Può ritrovarsi associata al problema sul proprio stesso cantiere anche senza colpa diretta. Da qui l’interesse di verificare la conformità di un subappaltatore prima di ingaggiarlo.',
    },
  ],
  relatedSlugs: [
    'sous-traitant-batiment-suisse-contrat-facturation',
    'salaire-minimum-cct-construction-suisse',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
