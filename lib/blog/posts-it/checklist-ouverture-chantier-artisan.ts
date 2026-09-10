import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-ouverture-chantier-artisan',
  question: 'Quale checklist seguire prima di aprire un nuovo cantiere?',
  title: 'Checklist di apertura del cantiere: cosa verificare prima del primo colpo di piccone',
  description:
    'Un cantiere che parte male (autorizzazione mancante, acconto non ricevuto, accesso non previsto) costa tempo e denaro da recuperare. Una checklist semplice evita la maggior parte delle brutte sorprese.',
  excerpt:
    'La maggior parte dei ritardi di cantiere non deriva da un imprevisto tecnico, ma da un aspetto amministrativo o logistico dimenticato prima ancora del primo giorno di lavori.',
  category: 'Chantier & rentabilité',
  keywords: ['checklist apertura cantiere', 'avviare un cantiere edilizia', 'preparazione cantiere costruzione', 'organizzazione inizio cantiere', 'lista verifica cantiere'],
  publishedAt: '2026-06-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cantiere che parte bene si nota raramente. È quello che parte male a costare tempo. La maggior parte dei falsi inizi non deriva da un problema tecnico imprevedibile, ma da un aspetto amministrativo o logistico semplicemente dimenticato prima del primo giorno.',
    },
    { type: 'h2', text: 'Prima del primo giorno di cantiere' },
    {
      type: 'list',
      items: [
        'Preventivo firmato e acconto ricevuto: un cantiere che parte senza acconto incassato assume un rischio finanziario evitabile',
        'Autorizzazioni necessarie ottenute (licenza edilizia se richiesta, autorizzazione di installazione di cantiere secondo il Comune)',
        'Accesso al cantiere confermato (chiavi, codice, orari di accesso se occupato)',
        'Messa in sicurezza della zona (delimitazione, protezione degli elementi esistenti sensibili)',
        'Stato dei luoghi fotografico realizzato, incluso il vicinato immediato se pertinente',
      ],
    },
    { type: 'h2', text: 'Al momento di avviare' },
    {
      type: 'list',
      items: [
        'Team e subappaltatori informati della pianificazione precisa e degli accessi',
        'Attrezzatura e materiali necessari confermati disponibili, non solo ordinati',
        'Un contatto diretto con il cliente stabilito per tutta la durata del cantiere, in caso di domanda urgente',
      ],
    },
    {
      type: 'callout',
      title: 'Lo stato dei luoghi fotografico è la protezione meno costosa del cantiere',
      text: 'Qualche minuto di foto prima dei lavori evita settimane di discussione in caso di contestazione successiva sullo stato preesistente di un elemento del cantiere o del vicinato.',
    },
    {
      type: 'cta',
      title: 'Ogni cantiere documentato fin dal primo giorno',
      text: 'Cantia centralizza preventivo, acconto, team assegnato e foto fin dall’apertura del cantiere, il che fa sì che la checklist si spunti quasi da sola.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Perché documentare lo stato dei luoghi prima dell’inizio del cantiere?',
      answer:
        'Per tutelarsi in caso di contestazione successiva. Senza prova datata dello stato preesistente, diventa impossibile dimostrare che un danno non è stato causato dal cantiere.',
    },
    {
      question: 'Bisogna attendere l’incasso dell’acconto prima di avviare i lavori?',
      answer:
        'È fortemente raccomandato, poiché avviare i lavori senza acconto incassato assume un rischio finanziario evitabile, soprattutto su un cantiere di dimensioni significative.',
    },
    {
      question: 'Qual è la causa più frequente di falso inizio del cantiere?',
      answer:
        'Un aspetto amministrativo o logistico dimenticato (autorizzazione mancante, accesso non confermato) molto più spesso di un vero imprevisto tecnico.',
    },
  ],
  relatedSlugs: [
    'checklist-cloture-chantier-avant-facturation',
    'photos-chantier-preuve-juridique-litige',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
