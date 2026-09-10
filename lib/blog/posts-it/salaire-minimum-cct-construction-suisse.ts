import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'salaire-minimum-cct-construction-suisse',
  question: 'Qual è il salario minimo nell’edilizia in Svizzera (CCL edilizia)?',
  title: 'Salario minimo edilizia in Svizzera: cosa fissa il CCL',
  description:
    'Il salario minimo del settore principale dell’edilizia svizzera è fissato dal Contratto nazionale mantello per l’edilizia, non da una legge federale. Il CCL 2026-2031 cambia peraltro diverse regole.',
  excerpt:
    'Non esiste un salario minimo legale federale in Svizzera: nell’edilizia, è il contratto collettivo di settore a fissare le soglie minime, e queste sono appena cambiate per il 2026.',
  category: 'RH & salaires',
  keywords: ['salario minimo', 'ccl edilizia', 'contratto collettivo', 'settore principale', 'salario edilizia svizzera'],
  publishedAt: '2026-03-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La Svizzera non ha un salario minimo legale federale. Alcuni cantoni ne fissano uno per l’economia generale, ma nel settore principale dell’edilizia, ciò che conta davvero è il Contratto nazionale mantello per l’edilizia (CN), un CCL esteso che si impone alla quasi totalità delle aziende del ramo, aderenti o meno.',
    },
    { type: 'h2', text: 'Una soglia per mestiere e per regione, non una cifra unica' },
    {
      type: 'p',
      text: 'Il salario minimo varia a seconda della qualifica (operaio non qualificato, qualificato, capocantiere) e della regione salariale, poiché i cantoni o le zone non sono tutti allineati sullo stesso barema. Un operaio qualificato a Ginevra e lo stesso profilo in una zona rurale di un altro cantone non partono dallo stesso minimo garantito.',
    },
    {
      type: 'callout',
      title: 'Cosa cambia con il CCL 2026-2029/2031',
      text: 'Per il 2026, i salari minimi restano globalmente invariati rispetto al 2025 (l’adeguamento al rincaro di +0,2% essendo integrato), con una vera rivalutazione prevista dal 2027. In compenso, il nuovo contratto modifica seriamente il regime delle ore straordinarie (un punto che ha molto più impatto sulla busta paga reale rispetto a un adeguamento della soglia salariale).',
    },
    { type: 'h2', text: 'Il secondo settore segue i propri CCL' },
    {
      type: 'p',
      text: 'Il Contratto nazionale del settore principale copre il grezzo (muratura, genio civile). Altri mestieri (intonacatura-pittura, falegnameria, impianti sanitari, elettricità) rientrano in contratti collettivi distinti, con propri minimi e proprie regole. Un imprenditore che impiega più mestieri può ritrovarsi ad applicare più CCL diversi a seconda della mansione ricoperta da ogni collaboratore.',
    },
    { type: 'h2', text: 'Dove verificare la cifra corretta' },
    {
      type: 'list',
      items: [
        'Il contratto applicabile dipende dal mestiere effettivamente esercitato, non solo dal titolo della posizione sul contratto',
        'I baremi si aggiornano ogni anno, quindi una cifra appresa due anni fa non è mai un valore sicuro',
        'Le casse di compensazione e le associazioni professionali del settore pubblicano ogni anno le griglie salariali aggiornate',
      ],
    },
    {
      type: 'cta',
      title: 'Gli stipendi del team, una tariffa per persona',
      text: 'Il modulo RH & Stipendi di Cantia permette di configurare una tariffa oraria per dipendente, pratico per riflettere baremi CCL che variano a seconda della qualifica e del mestiere.',
      buttonLabel: 'Scoprire RH & Stipendi',
    },
  ],
  faq: [
    {
      question: 'Esiste un salario minimo legale federale in Svizzera?',
      answer:
        'No, la Confederazione non fissa un salario minimo nazionale. Nell’edilizia, sono i contratti collettivi di lavoro (CCL) di settore a fissare minimi vincolanti.',
    },
    {
      question: 'Il salario minimo dell’edilizia è lo stesso ovunque in Svizzera?',
      answer:
        'No, il Contratto nazionale del settore principale dell’edilizia fissa minimi diversi a seconda della regione salariale e della qualifica dell’operaio.',
    },
    {
      question: 'Cosa cambia con il CCL edilizia 2026?',
      answer:
        'I salari minimi restano globalmente stabili per il 2026, con una vera rivalutazione prevista dal 2027. Il cambiamento più significativo riguarda il regime delle ore straordinarie (riporto annuo plafonato, maggiorazione del 25% oltre la soglia).',
    },
  ],
  relatedSlugs: [
    'heures-supplementaires-batiment-majoration-25',
    'calculer-13e-salaire-prorata-employe',
    'indemnites-kilometriques-2026-nouveau-taux',
  ],
};
