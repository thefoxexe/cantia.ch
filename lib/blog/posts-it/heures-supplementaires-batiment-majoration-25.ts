import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'heures-supplementaires-batiment-majoration-25',
  question: 'Come funzionano le ore straordinarie nell’edilizia in Svizzera?',
  title: 'Ore straordinarie edilizia: cosa è cambiato con il CCL 2026',
  description:
    'Il nuovo contratto collettivo dell’edilizia cambia il calcolo delle ore straordinarie: fino a 100h riportabili, maggiorazione del 25% oltre, e una nuova soglia settimanale di 50h che include gli spostamenti.',
  excerpt:
    'Il CCL edilizia 2026 cambia una regola che quasi nessuno ha ancora integrato: le ore di spostamento contano ormai nel calcolo delle ore straordinarie.',
  category: 'RH & salaires',
  keywords: ['ore straordinarie', 'maggiorazione 25%', 'ccl edilizia', 'tempo di spostamento', 'compensazione ore'],
  publishedAt: '2026-03-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Il nuovo Contratto nazionale mantello del settore principale dell’edilizia, in vigore per il periodo 2026-2031, cambia una regola che tocca direttamente la busta paga di ogni operaio: il calcolo delle ore straordinarie integra ormai esplicitamente il tempo di spostamento, non solo il tempo di lavoro effettivo sul cantiere.',
    },
    { type: 'h2', text: 'La nuova regola: 50 ore, spostamenti inclusi' },
    {
      type: 'p',
      text: 'Tutte le ore di lavoro e di spostamento che, cumulate, superano 50 ore in una settimana sono ormai considerate lavoro straordinario. Sono retribuite il mese successivo al salario di base maggiorato del 25%. Un cantiere lontano che aggiunge un’ora di spostamento ogni giorno può far scivolare una settimana «normale» di 45h di lavoro effettivo nel regime delle ore straordinarie, semplicemente a causa dello spostamento.',
    },
    {
      type: 'callout',
      title: 'Il riporto del saldo, plafonato a 100 ore',
      text: 'Le ore che non superano questo plafond di 50h/settimana possono essere riportate da un anno all’altro, fino a un massimo di 100 ore. Oltre questo cumulo, le ore eccedenti devono essere pagate con la maggiorazione del 25%: è impossibile lasciarle accumulare indefinitamente in un contatore.',
    },
    { type: 'h2', text: 'Cosa implica per la gestione RH quotidiana' },
    {
      type: 'list',
      items: [
        'Il tempo di spostamento verso un cantiere lontano deve essere tracciato separatamente dal tempo di lavoro, per poterli sommare correttamente',
        'Un contatore di ore straordinarie che supera le 100h riportate deve far scattare un pagamento, non solo una nota per più tardi',
        'La maggiorazione del 25% si applica sul salario di base (un dettaglio di calcolo che si sbaglia facilmente su una busta paga costruita a mano)',
      ],
    },
    { type: 'h2', text: 'Distinguere ore straordinarie e ore complementari' },
    {
      type: 'p',
      text: 'Le «ore straordinarie» ai sensi del CCL (oltre la durata normale e la soglia di 50h) non vanno confuse con le «ore complementari» di un lavoratore a tempo parziale che resta sotto la durata normale a tempo pieno. I due regimi di compensazione non sono identici, e confonderli è una fonte classica di errore in busta paga.',
    },
    {
      type: 'cta',
      title: 'Il calcolo delle ore, senza destreggiarsi tra due fogli di calcolo',
      text: 'Il modulo RH & Stipendi di Cantia segue le ore per cantiere e per dipendente man mano, il che costituisce la base più affidabile per individuare un superamento prima che si accumuli su più mesi.',
      buttonLabel: 'Scoprire RH & Stipendi',
    },
  ],
  faq: [
    {
      question: 'Il tempo di spostamento conta nel calcolo delle ore straordinarie?',
      answer:
        'Sì, dal CCL edilizia 2026-2031: tutte le ore di lavoro e di spostamento che superano cumulativamente 50h a settimana sono considerate lavoro straordinario.',
    },
    {
      question: 'Quante ore straordinarie si possono riportare all’anno successivo?',
      answer:
        'Fino a 100 ore. Oltre questo plafond, le ore eccedenti devono essere pagate il mese successivo con una maggiorazione del 25% sul salario di base.',
    },
    {
      question: 'Ore straordinarie e ore complementari sono la stessa cosa?',
      answer:
        'No, poiché le ore complementari riguardano un lavoratore a tempo parziale che resta sotto la durata normale a tempo pieno, con un regime di compensazione distinto da quello delle ore straordinarie propriamente dette.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'indemnites-kilometriques-2026-nouveau-taux',
  ],
};
