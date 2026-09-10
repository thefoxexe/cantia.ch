import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'photos-chantier-preuve-juridique-litige',
  question: 'Come possono le foto di cantiere servire da prova in caso di controversia?',
  title: 'Foto di cantiere: la prova più solida, se scattata bene',
  description:
    'A condizione di essere datata, contestualizzata e conservata correttamente, una foto di cantiere vale come prova davanti a un tribunale civile svizzero. Una foto sola, senza questi elementi, vale molto meno.',
  excerpt:
    'Una foto scattata al momento giusto può chiudere una controversia sulla garanzia con un solo elemento. La stessa foto, senza data né contesto, non vale quasi nulla davanti a un giudice.',
  category: 'Chantier & rentabilité',
  keywords: ['foto cantiere', 'prova controversia', 'garanzia costruzione', 'geolocalizzazione', 'documentazione cantiere'],
  publishedAt: '2026-05-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente contesta, otto mesi dopo la consegna, lo stato di un muro prima dei lavori. Un’azienda che ha una foto datata di quella stessa zona, scattata il primo giorno del cantiere, risolve il disaccordo in pochi secondi. Un’azienda che non ne ha si ritrova a discutere di memoria contro memoria, che è la posizione più debole possibile in caso di controversia.',
    },
    { type: 'h2', text: 'Cosa fa sì che una foto «valga» come prova' },
    {
      type: 'list',
      items: [
        'Una data e un’ora affidabili: una datazione manipolabile a posteriori (metadati modificabili) pesa meno di un sistema che la registra automaticamente al momento dello scatto',
        'Un contesto chiaro su cosa mostra: quale locale, quale fase del cantiere, idealmente una geolocalizzazione che confermi il luogo esatto',
        'Una conservazione nel tempo che garantisca che non abbia potuto essere sostituita o modificata tra lo scatto e la sua presentazione in caso di controversia',
      ],
    },
    { type: 'h2', text: 'I momenti del cantiere in cui una foto cambia tutto' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Prima dei lavori: stato iniziale dei luoghi, utile in caso di contestazione su ciò che preesisteva',
        'Nelle fasi chiave (prima della chiusura di un muro, prima del getto di un massetto): prova che ciò che non è più visibile dopo era conforme',
        'Alla consegna: stato finale, riferimento diretto per qualsiasi reclamo successivo',
        'Se un difetto viene constatato più tardi: datazione precisa del momento della scoperta, rilevante per il termine di segnalazione di 60 giorni',
      ],
    },
    {
      type: 'callout',
      title: 'Il punto che rende inutilizzabile la maggior parte degli archivi fotografici',
      text: 'Foto conservate sui telefoni personali di più collaboratori, senza centralizzazione né datazione affidabile, non costituiscono quasi mai una prova solida, anche se la foto stessa esiste effettivamente da qualche parte. Ciò che conta non è solo la foto, è la sua tracciabilità.',
    },
    {
      type: 'p',
      text: 'Questo è particolarmente vero dopo la riforma del diritto di garanzia del 2026 (termine di 60 giorni per segnalare un difetto occulto): un’azienda in grado di dimostrare precisamente quando è comparso un difetto (o che non era visibile prima) si ritrova in una posizione molto migliore di un’azienda che può solo affermarlo.',
    },
    {
      type: 'cta',
      title: 'Ogni foto, datata e geolocalizzata automaticamente',
      text: 'I rapporti di cantiere di Cantia datano e geolocalizzano automaticamente ogni foto scattata, classificata per cantiere. La prova esiste già, senza ulteriori passaggi nel momento in cui diventa utile.',
      buttonLabel: 'Scoprire i rapporti di cantiere',
    },
  ],
  faq: [
    {
      question: 'Una foto di cantiere ha un vero valore probatorio davanti a un tribunale?',
      answer:
        'Sì, a condizione di essere datata in modo affidabile, contestualizzata (quale luogo, quale fase) e conservata senza possibilità di modifica a posteriori.',
    },
    {
      question: 'In quali momenti del cantiere è più utile scattare foto?',
      answer:
        'Sono i momenti più utili in caso di controversia successiva, ossia prima dei lavori, prima della chiusura di elementi che non resteranno più visibili dopo, e alla consegna finale.',
    },
    {
      question: 'Perché le foto conservate su telefoni personali sono poco utilizzabili?',
      answer:
        'Perché spesso mancano di centralizzazione e di datazione affidabile, il che indebolisce il loro valore probatorio anche se il contenuto della foto è pertinente.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'garantie-travaux-construction-2-ou-5-ans',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
