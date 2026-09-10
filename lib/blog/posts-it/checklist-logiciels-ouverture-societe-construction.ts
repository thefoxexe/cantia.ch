import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-logiciels-ouverture-societe-construction',
  question: 'Esiste una checklist dei software da mettere in atto all’apertura di una società di costruzioni?',
  title: 'Checklist software per l’apertura di una società di costruzioni',
  description:
    'Un elenco concreto e ordinato degli strumenti digitali da mettere in atto al momento della creazione della propria società di costruzioni, senza dimenticare nulla né equipaggiarsi inutilmente.',
  excerpt:
    'Tra l’iscrizione al registro di commercio e il primo cantiere, c’è una finestra breve per mettere in atto i propri strumenti digitali. Meglio avere una checklist a portata di mano piuttosto che improvvisare.',
  category: 'Comparatifs & outils',
  keywords: ['checklist software apertura società costruzioni', 'elenco strumenti creazione impresa edile', 'preparare software prima primo cantiere', 'setup digitale nuova impresa costruzioni', 'pratiche software creazione società'],
  publishedAt: '2026-08-01',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Tra la creazione ufficiale di una società di costruzioni e il primo cantiere fatturato, il tempo spesso stringe. Una checklist chiara evita di improvvisare all’ultimo momento, o peggio, di scoprire una lacuna quando il primo cliente è già in attesa.',
    },
    { type: 'h2', text: 'La checklist, in ordine' },
    {
      type: 'list',
      items: [
        '1. Scegliere e configurare uno strumento di preventivi/fatture, con le coordinate bancarie e l’aliquota IVA corrette',
        '2. Creare un catalogo prezzi di base per le prestazioni più comuni dell’impresa',
        '3. Mettere in atto un mezzo per documentare i cantieri (foto, avanzamento)',
        '4. Verificare l’accesso mobile completo, per non dipendere da una postazione fissa',
        '5. Prevedere uno spazio per archiviare i documenti legali e contrattuali fin dal primo cantiere',
      ],
    },
    {
      type: 'stat',
      value: '< 1 giorno',
      label: 'tempo generalmente necessario per configurare uno strumento gestionale di base (coordinate, catalogo prezzi iniziale) prima del primo preventivo',
    },
    { type: 'h2', text: 'Non aspettare il primo cliente per testare lo strumento' },
    {
      type: 'p',
      text: 'Creare un preventivo fittizio o una fattura di prova prima del lancio ufficiale permette di individuare i punti da correggere (impaginazione, informazioni mancanti) senza che ciò impatti su un vero cliente.',
    },
    {
      type: 'callout',
      title: 'Il catalogo prezzi si costruisce meglio in modo progressivo',
      text: 'Non serve avere un catalogo completo fin dal primo giorno. Aggiungerlo man mano con i primi preventivi, prestazione dopo prestazione, resta più realistico che anticipare tutto in una volta.',
    },
    {
      type: 'cta',
      title: 'Pronto a fatturare fin dal primo utilizzo',
      text: 'Cantia si configura in pochi minuti (coordinate, catalogo prezzi, primi preventivi) ancor prima dell’arrivo del primo cliente.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Qual è la prima tappa a livello software all’apertura di una società di costruzioni?',
      answer:
        'Configurare uno strumento di preventivi/fatture con le coordinate bancarie e l’aliquota IVA corrette, ancor prima di creare un catalogo prezzi completo.',
    },
    {
      question: 'Serve un catalogo prezzi completo fin dall’apertura della società?',
      answer:
        'No: può essere costruito progressivamente, prestazione dopo prestazione, man mano con i primi preventivi reali piuttosto che essere anticipato interamente in anticipo.',
    },
    {
      question: 'È utile testare lo strumento prima del primo vero cliente?',
      answer:
        'Sì, creare un preventivo o una fattura di prova permette di individuare le correzioni necessarie senza impatto su un vero cliente.',
    },
  ],
  relatedSlugs: [
    'checklist-ouverture-chantier-artisan',
    'demarrer-entreprise-batiment-outils-indispensables',
    'quel-logiciel-choisir-demarrer-entreprise-construction',
  ],
};
