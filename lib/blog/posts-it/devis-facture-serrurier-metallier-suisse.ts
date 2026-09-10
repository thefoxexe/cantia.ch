import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-serrurier-metallier-suisse',
  question: 'Come deve calcolare un fabbro-metallurgico un preventivo tra fabbricazione su misura e riparazione urgente?',
  title: 'Fabbro-metallurgico: calcolare tra opera su misura e riparazione d’urgenza',
  description:
    'Un parapetto su misura si progetta con calma, una porta forzata si ripara entro un’ora: il fabbro-serramentista vive entrambe le logiche in parallelo. Come strutturarle senza confonderle.',
  excerpt:
    'Tra un cancello in acciaio fabbricato in diverse settimane e una serratura cambiata d’urgenza un sabato sera, il fabbro-metallurgico deve far convivere due modi di fatturare radicalmente diversi.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo fabbro metallurgico', 'fatturazione riparazione serratura', 'prezzo opera metallica su misura', 'preventivo parapetto cancello', 'tariffa fabbro urgenza Svizzera'],
  publishedAt: '2026-09-15',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La costruzione metallica su misura (parapetti, cancelli, scale, strutture) segue il ritmo di un cantiere classico: presa di misure, progettazione, fabbricazione in laboratorio, posa. La riparazione di serrature (porta bloccata, serratura forzata, chiave rotta) segue un ritmo totalmente diverso: intervento immediato, spesso fuori dagli orari normali, senza il tempo di preparare un preventivo dettagliato in anticipo.',
    },
    { type: 'h2', text: 'Opera su misura: un preventivo che segue la fabbricazione' },
    {
      type: 'list',
      items: [
        'Presa di misure e disegno tecnico, particolarmente importante su strutture portanti',
        'Fornitura di materia (acciaio, inox, alluminio), il cui prezzo può variare tra l’ordine e la consegna',
        'Lavorazione e saldatura in laboratorio, calcolabile a tempo o a pezzo secondo la complessità',
        'Posa, fissaggio e finiture (verniciatura, zincatura) in loco',
      ],
    },
    { type: 'h2', text: 'Riparazione: una tariffa annunciata prima di intervenire, anche sotto pressione' },
    {
      type: 'p',
      text: 'Una persona bloccata davanti alla propria porta non è in posizione di negoziare serenamente un prezzo. Annunciare chiaramente la tariffa di spostamento e intervento prima di recarsi sul posto, piuttosto che fatturare a posteriori, protegge il cliente da una brutta sorpresa e protegge il fabbro da una contestazione successiva del prezzo.',
    },
    {
      type: 'stat',
      value: '30-50 %',
      label: 'maggiorazione comune applicata su un intervento di riparazione di serrature d’urgenza fuori dagli orari normali, rispetto a un appuntamento pianificato',
    },
    {
      type: 'callout',
      title: 'La variazione del prezzo dell’acciaio merita una clausola nel preventivo',
      text: 'Su un’opera su misura la cui fabbricazione si estende su diverse settimane, una clausola di revisione del prezzo della materia evita di dover assorbire da soli un aumento del corso dell’acciaio intervenuto tra il preventivo e l’ordine reale.',
    },
    {
      type: 'cta',
      title: 'Fatturi una riparazione dal marciapiede, in pochi minuti',
      text: 'Cantia permette di emettere una fattura direttamente dal telefono subito dopo un intervento di riparazione, senza bisogno di rientrare in laboratorio per non dimenticare di fatturarla.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Come fatturare una riparazione di serratura d’urgenza senza preventivo preventivo?',
      answer:
        'Annunciando chiaramente la tariffa di spostamento e intervento prima di recarsi sul posto, oralmente o per messaggio, piuttosto che stabilire la fattura a posteriori senza accordo preventivo sul prezzo.',
    },
    {
      question: 'Si può maggiorare la tariffa di una riparazione di serratura fuori dagli orari normali?',
      answer:
        'Sì, è una pratica comune (generalmente tra il 30 e il 50 % di maggiorazione), a condizione che il cliente ne sia informato prima dell’intervento, non solo sulla fattura finale.',
    },
    {
      question: 'Bisogna prevedere una clausola di revisione del prezzo su un’opera metallica su misura?',
      answer:
        'È consigliato quando la fabbricazione si estende su diverse settimane, poiché il corso delle materie prime come l’acciaio può variare sensibilmente tra il preventivo e l’ordine reale.',
    },
  ],
  relatedSlugs: [
    'devis-facture-plombier-sanitaire-suisse',
    'facturer-acompte-suisse-securiser-solde',
    'devis-charpente-bois-facturation-suisse',
  ],
};
