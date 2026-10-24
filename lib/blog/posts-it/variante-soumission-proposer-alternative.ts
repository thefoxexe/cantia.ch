import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'variante-soumission-proposer-alternative',
  question: 'Si può proporre una variante in un appalto senza essere esclusi?',
  title: 'Proporre una variante in un capitolato, senza far escludere la propria offerta',
  description:
    'Conoscete una soluzione più economica o più rapida di quella dell’architetto? Come proporla in variante, accanto a un’offerta di base completa, in un appalto privato o pubblico.',
  excerpt:
    'Sostituire la soluzione dell’architetto con la vostra significa rischiare l’esclusione. Proporla accanto significa mostrare il vostro saper fare.',
  category: 'Croissance & acquisition',
  keywords: ['variante capitolato', 'offerta variante appalto pubblico', 'proporre alternativa architetto', 'appalto edilizia svizzera'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Leggendo un capitolato vedete spesso una soluzione migliore: un altro prodotto, una posa più rapida, un dettaglio più durevole. La tentazione è calcolare direttamente la vostra soluzione. È il modo più sicuro per rendere la vostra offerta non confrontabile con le altre.',
    },
    { type: 'h2', text: 'La regola: un’offerta di base completa, la variante accanto' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Compilate tutte le posizioni del capitolato così come sono redatte: è la vostra offerta di base, confrontabile con le altre.',
        'Descrivete la variante a parte: cosa cambia, le posizioni interessate, la differenza di prezzo (in più o in meno) e l’effetto sui termini.',
        'Indicate chiaramente che l’offerta di base resta valida se la variante non viene scelta.',
      ],
    },
    { type: 'h2', text: 'In un appalto pubblico' },
    {
      type: 'p',
      text: 'Il diritto svizzero degli appalti pubblici ammette in linea di principio le varianti in aggiunta all’offerta sul progetto descritto, salvo se il committente le ha limitate o escluse nel bando. Leggete quindi le condizioni: se le varianti sono escluse, non proponetene; se sono ammesse, l’offerta di base completa resta indispensabile.',
    },
    {
      type: 'callout',
      title: 'Una variante ben presentata è un argomento',
      text: 'Una pagina chiara, con il risparmio in cifre e le posizioni interessate, mostra al committente che padroneggiate l’argomento. A prezzi vicini, spesso è ciò che fa la differenza.',
    },
    { type: 'h2', text: 'In un appalto privato' },
    {
      type: 'p',
      text: 'L’architetto è in genere aperto alle proposte, soprattutto se riducono costi o termini. Vale lo stesso principio: consegnate il capitolato completo, poi allegate la variante. Una telefonata prima della scadenza permette a volte di capire se ha una possibilità.',
    },
    { type: 'h2', text: 'Con Cantia (beta)' },
    {
      type: 'p',
      text: 'Compilate l’offerta di base nel PDF originale con Cantia, poi potete duplicare il capitolato per calcolare la vostra variante senza toccare l’offerta di base. Funzione in beta: 1 di prova con Essenziale, 3 al mese con Team, illimitata con Entreprise.',
    },
    {
      type: 'cta',
      title: 'L’offerta di base compilata in pochi minuti',
      text: 'Vi resta il tempo per la variante che farà la differenza.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Si può sostituire un prodotto imposto con un equivalente?',
      answer:
        'Solo se il capitolato lo consente (dicitura «o equivalente») o in variante, accanto all’offerta di base. Sostituire senza dirlo rende l’offerta non confrontabile.',
    },
    {
      question: 'Una variante può costare più dell’offerta di base?',
      answer: 'Sì, se porta qualcos’altro: durata, termini, manutenzione. Spiegate chiaramente cosa guadagna il committente in cambio.',
    },
    {
      question: 'Le varianti sono sempre ammesse negli appalti pubblici?',
      answer: 'No. Sono ammesse in linea di principio, ma il committente può limitarle o escluderle nel bando. Fanno fede le condizioni dell’incarto.',
    },
  ],
  relatedSlugs: ['repondre-appel-offres-public-batiment-etapes', 'appel-offres-marches-publics-batiment-suisse', 'remplir-soumission-pdf-architecte'],
};
