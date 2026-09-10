import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'vitesse-reponse-devis-taux-conversion-batiment',
  question: 'Perché la velocità di risposta a una richiesta di preventivo influenza così tanto il tasso di conversione?',
  title: 'La velocità di risposta a un preventivo converte più del prezzo',
  description:
    'Un cliente che contatta più artigiani contemporaneamente sceglie molto spesso chi risponde per primo, ancor prima di confrontare i prezzi nel dettaglio. Come strutturare la propria organizzazione per non perdere più questo tipo di cliente.',
  excerpt:
    'Il prezzo più basso non vince sempre il preventivo: chi risponde per primo, con un preventivo chiaro e professionale, si aggiudica spesso il cliente prima ancora che gli altri abbiano finito la loro stima.',
  category: 'Croissance & acquisition',
  keywords: ['velocità risposta preventivo', 'tasso di conversione preventivo edilizia', 'rispondere rapidamente cliente artigiano', 'perdere un cliente preventivo lento', 'tempi invio preventivo cantiere'],
  publishedAt: '2026-09-05',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente che ha bisogno di lavori raramente contatta un solo artigiano. Confronta, quasi sempre tra due e quattro imprese per la stessa richiesta. Chi risponde per primo ottiene un vantaggio reale: fissa il punto di riferimento con cui gli altri dovranno confrontarsi, invece del contrario.',
    },
    { type: 'h2', text: 'Cosa si gioca nelle prime 24 ore' },
    {
      type: 'list',
      items: [
        'Il cliente tiene a mente la prima impresa che ha reagito, anche se invia il preventivo completo solo qualche giorno dopo',
        'Una conferma di ricezione rapida ("ho ricevuto la sua richiesta, Le risponderò entro 48 ore") rassicura quanto un preventivo completo immediato',
        'Dopo diversi giorni senza risposta, un cliente raramente sollecita di nuovo. Passa semplicemente all’artigiano successivo sulla sua lista',
      ],
    },
    {
      type: 'stat',
      value: '< 1h',
      label: 'tempo di prima risposta considerato eccellente per una richiesta di preventivo in entrata (anche solo una semplice conferma di ricezione, senza il calcolo completo)',
    },
    { type: 'h2', text: 'Veloce non significa affrettato' },
    {
      type: 'p',
      text: 'La velocità riguarda la prima reazione, non necessariamente il preventivo completo e calcolato. Quest’ultimo merita sempre di essere elaborato con cura. La buona pratica consiste nel separare le due cose: una conferma di ricezione rapida che mostri che la richiesta è stata presa in carico, poi un preventivo ben ponderato inviato entro un termine ragionevole comunicato al cliente.',
    },
    {
      type: 'callout',
      title: 'Un preventivo inviato dal cantiere batte un preventivo inviato la sera in ufficio',
      text: 'Poter calcolare e inviare un preventivo semplice direttamente dal luogo del sopralluogo, ancor prima di risalire in auto, offre un vantaggio di velocità difficile da recuperare per un concorrente che torna in ufficio per reinserire tutto.',
    },
    {
      type: 'cta',
      title: 'Un preventivo pronto da inviare prima ancora di lasciare il cantiere',
      text: 'Con Cantia, un preventivo si costruisce e si invia direttamente dal telefono, con il catalogo prezzi a supporto. Non serve più aspettare il ritorno in ufficio per rispondere a una richiesta.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Perché la velocità di risposta conta più del prezzo su un preventivo?',
      answer:
        'Perché un cliente confronta generalmente più artigiani in parallelo e ricorda spesso chi ha reagito per primo, ancor prima di aver confrontato i prezzi nel dettaglio tra tutte le offerte ricevute.',
    },
    {
      question: 'Bisogna inviare un preventivo completo immediatamente per convertire un cliente?',
      answer:
        'Non necessariamente: una conferma di ricezione rapida seguita da un preventivo ben ponderato entro un termine comunicato funziona generalmente meglio di un preventivo affrettato inviato in fretta.',
    },
    {
      question: 'Quanto tempo aspetta in media un cliente prima di sollecitare di nuovo un artigiano senza risposta?',
      answer:
        'Molto poco in realtà. La maggior parte dei clienti non sollecita di nuovo e passa direttamente all’impresa successiva sulla sua lista dopo qualche giorno di silenzio.',
    },
  ],
  relatedSlugs: [
    'trouver-clients-artisan-batiment-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'estimer-chantier-a-distance-devis-photo',
  ],
};
