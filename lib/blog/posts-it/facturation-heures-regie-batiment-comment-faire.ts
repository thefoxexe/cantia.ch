import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturation-heures-regie-batiment-comment-faire',
  question: 'Come fatturare correttamente lavori in economia (a ore) nell’edilizia?',
  title: 'Fatturare in economia nell’edilizia: cosa serve sulla fattura per non essere contestati',
  description:
    'Un lavoro fatturato a ore piuttosto che a prezzo fisso espone maggiormente alla contestazione del cliente, a meno che il dettaglio delle ore, delle persone e dei compiti sia realmente tracciabile.',
  excerpt:
    'Senza un preventivo a prezzo fisso su cui appoggiarsi, una fattura in economia si basa interamente sulla fiducia del cliente nel numero di ore dichiarato. Questa fiducia si costruisce con il dettaglio, non con un totale tondo.',
  category: 'Devis & facturation',
  keywords: ['fatturazione in economia edilizia', 'fattura ore lavorate', 'lavori a ore', 'contestazione fattura in economia', 'monitoraggio ore cantiere'],
  publishedAt: '2026-07-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La fatturazione in economia, ossia sul tempo realmente impiegato piuttosto che su un prezzo fisso concordato in anticipo, è comune per lavori difficili da preventivare in anticipo: riparazioni, imprevisti scoperti in corso d’opera, piccoli interventi. Il problema non è mai il principio, è la prova: senza un dettaglio sufficiente, un cliente può contestare il numero di ore fatturate senza che vi sia una base oggettiva per decidere.',
    },
    { type: 'h2', text: 'Cosa deve dettagliare una fattura in economia' },
    {
      type: 'list',
      items: [
        'La data di ogni intervento, non solo un periodo globale',
        'Il numero di ore per persona, non un totale aggregato senza dettaglio',
        'La natura precisa del lavoro svolto ogni giorno, non una descrizione generica ripetuta',
        'La tariffa oraria applicata, coerente con quanto comunicato al cliente prima dell’inizio dei lavori',
      ],
    },
    {
      type: 'callout',
      title: 'Avvisare il cliente del principio dell’economia prima di iniziare resta la miglior protezione',
      text: 'Anche senza preventivo a prezzo fisso, un accordo scritto preliminare sulla tariffa oraria e sul principio della fatturazione a ore evita l’essenziale delle contestazioni. La confusione nasce quasi sempre da un silenzio iniziale, non da un vero disaccordo sulla tariffa.',
    },
    { type: 'h2', text: 'Il monitoraggio delle ore è la vostra miglior prova' },
    {
      type: 'p',
      text: 'Un rilevamento ore con data e ora, inserito man mano piuttosto che ricostruito a memoria a fine mese, trasforma una fattura in economia contestabile in un documento difficile da rimettere in discussione. È anche ciò che protegge l’azienda se un cliente chiede, settimane più tardi, di giustificare una fattura già inviata.',
    },
    {
      type: 'cta',
      title: 'Ore monitorate, fatturate senza perdita di dettaglio',
      text: 'Il modulo Ore & Salari di Cantia collega il monitoraggio delle ore per cantiere direttamente alla fatturazione, così il dettaglio per giorno e per persona resta sempre disponibile in caso di domanda del cliente.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Una fattura in economia deve dettagliare le ore giorno per giorno?',
      answer:
        'Sì, è fortemente raccomandato, perché un totale globale senza dettaglio per data e per persona è molto più facilmente contestabile di un rilevamento preciso.',
    },
    {
      question: 'Serve un accordo scritto prima di fatturare lavori in economia?',
      answer:
        'Non è un obbligo legale rigoroso, ma informare il cliente del principio e della tariffa oraria prima di iniziare evita l’essenziale delle controversie successive.',
    },
    {
      question: 'Come proteggersi se un cliente contesta il numero di ore fatturate?',
      answer:
        'Appoggiandosi a un rilevamento ore con data e ora e dettagliato per compito, inserito man mano piuttosto che ricostruito in seguito a memoria.',
    },
  ],
  relatedSlugs: [
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
