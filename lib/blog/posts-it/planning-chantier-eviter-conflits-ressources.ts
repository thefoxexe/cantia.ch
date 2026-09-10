import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'planning-chantier-eviter-conflits-ressources',
  question: 'Come evitare che una stessa squadra o una stessa macchina siano previste su due cantieri contemporaneamente?',
  title: 'Conflitti di planning tra cantieri: come una piccola impresa li evita davvero',
  description:
    'Un operaio o una macchina prenotati due volte lo stesso giorno su due cantieri diversi: un classico quando il planning vive in più teste o più file separati.',
  excerpt:
    'Non è quasi mai un problema di malavoglia: è un problema di visibilità. Nessuno vede tutto il planning nello stesso posto, quindi nessuno può individuare il conflitto prima che esploda sul campo.',
  category: 'Chantier & rentabilité',
  keywords: ['conflitto planning cantiere', 'gestione squadra edilizia', 'risorse multi-cantiere', 'organizzazione impresa costruzione', 'planning condiviso'],
  publishedAt: '2026-07-13',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Non appena un’azienda gestisce più di due o tre cantieri in parallelo, il rischio di doppia prenotazione diventa reale: un operaio annunciato su un cantiere mentre è già previsto altrove, una betoniera o un ponteggio prenotati due volte lo stesso giorno. Il problema non è quasi mai una mancanza di organizzazione individuale, è piuttosto una mancanza di visibilità condivisa sull’insieme degli impegni.',
    },
    { type: 'h2', text: 'Perché succede, anche in team ben organizzati' },
    {
      type: 'list',
      items: [
        'Il planning esiste, ma in più posti diversi: un’agenda cartacea in ufficio, un file sul computer del titolare, messaggi WhatsApp sparsi con i capisquadra',
        'Una modifica dell’ultimo minuto (ritardo su un cantiere, assenza imprevista) non viene mai riportata automaticamente sugli altri cantieri interessati',
        'Nessuno ha una visione d’insieme simultanea delle persone e del materiale impegnati per tutta la settimana',
      ],
    },
    {
      type: 'callout',
      title: 'Il vero costo di un conflitto di planning non è solo il ritardo',
      text: 'Una squadra spostata d’urgenza da un cantiere all’altro genera anche un tragitto perso, un cliente scontento per uno scarto non annunciato, e spesso un’improvvisazione che costa più cara del tempo che dovrebbe far guadagnare.',
    },
    { type: 'h2', text: 'Ciò che funziona concretamente' },
    {
      type: 'list',
      items: [
        'Un planning unico, visibile da tutto il team, piuttosto che una fonte di informazione per persona',
        'Una vista per persona e per macchina, non solo per cantiere, per individuare un conflitto prima che diventi un problema sul campo',
        'Un aggiornamento in tempo reale, accessibile dal cantiere e non solo dall’ufficio',
      ],
    },
    {
      type: 'cta',
      title: 'Un planning che tutto il team vede, in tempo reale',
      text: 'Il modulo Planning di Cantia centralizza le assegnazioni di squadra e di cantiere in un unico posto accessibile dal campo. Basta con le doppie prenotazioni scoperte troppo tardi.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Perché i conflitti di planning capitano anche in team organizzati?',
      answer:
        'Perché il planning esiste spesso in più posti separati (agenda cartacea, file personale, messaggi) senza visione d’insieme condivisa, piuttosto che per mancanza di organizzazione individuale.',
    },
    {
      question: 'Qual è il vero costo di un conflitto di planning tra due cantieri?',
      answer:
        'Oltre al ritardo diretto, genera spesso un tragitto perso, un cliente scontento per uno scarto non annunciato, e un’improvvisazione dell’ultimo minuto più costosa del tempo inizialmente guadagnato.',
    },
    {
      question: 'Un planning centralizzato basta a evitare tutti i conflitti?',
      answer:
        'Riduce fortemente il rischio offrendo una vista condivisa in tempo reale, ma deve essere aggiornato non appena sopravviene un cambiamento per restare realmente affidabile.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'whatsapp-gestion-equipe-chantier-limites',
    'retard-chantier-meteo-obligations-contractuelles',
  ],
};
