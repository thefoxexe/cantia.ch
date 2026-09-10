import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'litige-chantier-mediation-ou-tribunal',
  question: 'Un disaccordo su un cantiere degenera: bisogna andare direttamente in tribunale o esistono altre opzioni?',
  title: 'Controversia di cantiere: come scegliere tra mediazione, conciliazione e tribunale',
  description:
    'Il tribunale non è quasi mai la prima tappa logica di una controversia di cantiere in Svizzera. Una procedura di conciliazione è addirittura obbligatoria prima della maggior parte delle azioni civili.',
  excerpt:
    'Molti imprenditori pensano subito alla causa legale alla prima tensione con un cliente. In pratica, esistono diverse tappe più rapide e meno costose prima di arrivarci, e alcune sono addirittura obbligatorie.',
  category: 'Juridique & normes',
  keywords: ['controversia cantiere mediazione', 'conciliazione tribunale costruzione', 'risoluzione conflitto cantiere', 'procedura civile Svizzera edilizia', 'controversia cliente artigiano'],
  publishedAt: '2026-06-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un disaccordo sulla qualità dei lavori, un saldo contestato, un termine non rispettato: le tensioni fanno parte del mestiere. Ma andare direttamente in tribunale non è né la prima opzione, né sempre immediatamente possibile: il diritto di procedura civile svizzero impone in linea di principio un tentativo di conciliazione prima della maggior parte delle azioni civili.',
    },
    { type: 'h2', text: 'Le tappe, nell’ordine logico' },
    {
      type: 'list',
      items: [
        'Discussione diretta e scritta con il cliente (spesso trascurata, ma risolve la maggior parte delle divergenze senza costi)',
        'Mediazione privata: un terzo neutrale facilita il dialogo, senza imporre una decisione (rapida e poco costosa, ma richiede l’accordo di entrambe le parti)',
        'Conciliazione davanti all’autorità competente: obbligatoria prima della maggior parte delle cause civili in Svizzera per le controversie di basso e medio valore',
        'Procedura giudiziaria: solo se la conciliazione fallisce o se l’importo in gioco supera le soglie di competenza semplificata',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Saltare la tappa di conciliazione obbligatoria fa respingere la richiesta davanti al tribunale',
      text: 'Per la maggior parte delle controversie civili, un’autorizzazione a procedere rilasciata dopo il tentativo di conciliazione è una condizione di ricevibilità: senza di essa, il tribunale non può semplicemente entrare nel merito.',
    },
    { type: 'h2', text: 'Cosa determina la via migliore' },
    {
      type: 'list',
      items: [
        'L’importo in gioco: per una piccola controversia, il costo di una causa supera spesso l’effettiva posta finanziaria',
        'La qualità della relazione con il cliente: un accordo amichevole preserva una relazione commerciale, una causa la chiude definitivamente',
        'La solidità del fascicolo: prove scritte chiare (preventivi, scambi, foto) rendono una conciliazione molto più rapida',
      ],
    },
    {
      type: 'p',
      text: 'In quasi tutti i casi, la solidità del fascicolo documentale pesa più dell’argomentazione orale. Uno storico chiaro di preventivi, fatture, scambi e foto del cantiere accelera considerevolmente qualsiasi di queste tappe.',
    },
    {
      type: 'cta',
      title: 'Un fascicolo solido, pronto in caso di controversia',
      text: 'Cantia centralizza preventivi, fatture, scambi e foto per cantiere, così che lo storico completo rimanga disponibile se una conciliazione o una procedura si rendesse necessaria.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna obbligatoriamente passare per una conciliazione prima di una causa in Svizzera?',
      answer:
        'Sì, per la maggior parte delle controversie civili, un tentativo di conciliazione è una condizione di ricevibilità prima di poter adire il tribunale.',
    },
    {
      question: 'La mediazione è obbligatoria per una controversia di cantiere?',
      answer:
        'No, la mediazione privata è un passo volontario che richiede l’accordo di entrambe le parti, a differenza della conciliazione che è imposta dalla procedura.',
    },
    {
      question: 'Cosa accelera di più una conciliazione o una controversia?',
      answer:
        'Un fascicolo documentale solido (preventivi firmati, scambi scritti, foto datate del cantiere) pesa quasi sempre più dell’argomentazione orale.',
    },
  ],
  relatedSlugs: [
    'client-refuse-payer-solde-final-que-faire',
    'photos-chantier-preuve-juridique-litige',
    'resiliation-contrat-entreprise-chantier-en-cours',
  ],
};
