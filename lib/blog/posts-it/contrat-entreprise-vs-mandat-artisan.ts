import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'contrat-entreprise-vs-mandat-artisan',
  question: 'Contratto d’appalto o contratto di mandato: quale differenza per un artigiano?',
  title: 'Contratto d’appalto vs mandato: cosa cambia davvero per un artigiano',
  description:
    'Un artigiano che posa piastrelle è sotto contratto d’appalto (obbligo di risultato). Un architetto che consiglia è spesso sotto mandato (obbligo di mezzi). La differenza pesa molto in caso di controversia.',
  excerpt:
    'Due regimi giuridici, una differenza enorme: l’uno La impegna su un risultato, l’altro sui mezzi messi in campo. La maggior parte degli artigiani non sa sotto quale regime lavora.',
  category: 'Juridique & normes',
  keywords: ['contratto d’appalto', 'contratto di mandato', 'obbligo di risultato', 'obbligo di mezzi', 'diritto svizzero'],
  publishedAt: '2026-03-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un artigiano che posa piastrelle promette un risultato: un pavimento posato, piano, senza difetti. Un architetto che consiglia su un progetto promette mezzi messi in campo con diligenza, non un risultato garantito. Questa distinzione giuridica di base cambia radicalmente ciò che gli si può rimproverare in caso di controversia.',
    },
    { type: 'h2', text: 'Contratto d’appalto: obbligo di risultato' },
    {
      type: 'p',
      text: 'Disciplinato dagli art. 363 e seguenti del Codice delle obbligazioni, il contratto d’appalto impegna l’imprenditore sulla consegna di un’opera conforme a quanto convenuto, quali che siano le difficoltà incontrate lungo il percorso. È il regime predefinito di quasi tutti i mestieri manuali dell’edilizia: muratore, elettricista, falegname, pittore, intonacatore. Se il risultato non è raggiunto, si applica la garanzia legale (vedi il regime da 2 a 5 anni a seconda della natura dell’opera), senza che l’imprenditore possa difendersi dicendo «ho fatto del mio meglio».',
    },
    { type: 'h2', text: 'Contratto di mandato: obbligo di mezzi' },
    {
      type: 'p',
      text: 'Disciplinato dagli art. 394 e seguenti CO, il mandato impegna solo a mettere in atto i mezzi e la diligenza attesi da un professionista, senza garantire un risultato preciso. È tipicamente il regime di un architetto in fase di consulenza, di uno studio di ingegneria per uno studio, o di un direttore lavori per la gestione. Un architetto può essere sollevato dalla propria responsabilità se dimostra di aver agito con la diligenza richiesta, anche se il risultato finale delude.',
    },
    {
      type: 'callout',
      title: 'Perché questo cambia tutto in caso di controversia',
      text: 'Sotto contratto d’appalto, l’unica domanda che conta è: il risultato promesso è stato consegnato? Sotto mandato, la domanda diventa: i mezzi messi in campo erano ragionevoli e diligenti? L’onere della prova e l’angolo di difesa sono completamente diversi. Un artigiano che pensa di essere sotto mandato mentre è sotto contratto d’appalto rischia quindi di difendersi con gli argomenti sbagliati.',
    },
    { type: 'h2', text: 'Uno stesso cantiere può mescolare entrambi' },
    {
      type: 'p',
      text: 'Un architetto che progetta e supervisiona (mandato) coinvolge aziende che eseguono (contratto d’appalto): i due regimi coesistono quindi sullo stesso progetto, ciascuno applicandosi all’attore giusto. La confusione più frequente: un artigiano che accetta incarichi di consulenza o di coordinamento oltre alla sua esecuzione abituale passa talvolta, senza saperlo, sotto un regime di mandato per quella parte della sua prestazione.',
    },
    {
      type: 'cta',
      title: 'Un preventivo che precisa cosa viene promesso',
      text: 'Cantia permette di dettagliare con precisione ogni prestazione sul preventivo. La miglior protezione resta sempre scrivere nero su bianco cosa viene consegnato, qualunque sia il regime contrattuale applicabile.',
      buttonLabel: 'Scoprire il modulo Preventivi',
    },
  ],
  faq: [
    {
      question: 'Un artigiano dell’edilizia lavora sotto contratto d’appalto o contratto di mandato?',
      answer:
        'Quasi sempre sotto contratto d’appalto (art. 363 e seguenti CO), che impegna su un risultato; un architetto in fase di consulenza, invece, resta il più delle volte sotto mandato.',
    },
    {
      question: 'Qual è la principale differenza pratica tra i due regimi?',
      answer:
        'Il contratto d’appalto impegna su un risultato garantito; il contratto di mandato impegna solo sui mezzi e sulla diligenza messi in campo, senza garantire il risultato finale.',
    },
    {
      question: 'Uno stesso cantiere può combinare i due tipi di contratto?',
      answer:
        'Sì, frequentemente: un architetto sotto mandato per la progettazione e il seguito, aziende sotto contratto d’appalto per l’esecuzione. Ogni attore rientra così nel regime adatto al suo incarico.',
    },
  ],
  relatedSlugs: [
    'norme-sia-118-devis-obligatoire',
    'garantie-travaux-construction-2-ou-5-ans',
    'permis-construire-renovation-quand-necessaire',
  ],
};
