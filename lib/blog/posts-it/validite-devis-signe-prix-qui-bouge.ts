import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'validite-devis-signe-prix-qui-bouge',
  question: 'Per quanto tempo un preventivo firmato impegna l’azienda se i prezzi del materiale cambiano?',
  title: 'Un preventivo firmato impegna anche se il prezzo del materiale è cambiato nel frattempo?',
  description:
    'Un preventivo senza data di validità impegna l’azienda senza limite di tempo, anche se il prezzo del materiale è raddoppiato nel frattempo. La clausola che manca sulla maggior parte dei preventivi svizzeri.',
  excerpt:
    'Un preventivo firmato senza data di validità La impegna indefinitamente, anche se il prezzo del legno è raddoppiato nel frattempo. È una riga, non un dettaglio.',
  category: 'Devis & facturation',
  keywords: ['validità preventivo', 'prezzo materiale', 'impegno contrattuale', 'clausola di revisione', 'preventivo firmato'],
  publishedAt: '2026-03-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente tiene un preventivo firmato per sei mesi in un cassetto, poi si presenta dicendo «ho firmato, voglio quel prezzo». Senza data di validità scritta sul documento, ha giuridicamente ragione, anche se il prezzo del materiale è cambiato del 20% nel frattempo.',
    },
    { type: 'h2', text: 'Un preventivo impegna finché non ha una data di fine' },
    {
      type: 'p',
      text: 'Un preventivo accettato dal cliente vale come accettazione di un’offerta: impegna entrambe le parti alle condizioni scritte, senza limite di durata a meno che il documento non ne preveda una. È il principio stesso dell’offerta nel diritto contrattuale svizzero: chi l’ha emessa resta vincolato finché non scade o non viene ritirata.',
    },
    {
      type: 'callout',
      title: 'La riga da non dimenticare mai',
      text: '«Preventivo valido 30 giorni» (o 60, a seconda della natura del cantiere) non è una formula di cortesia. È ciò che impedisce a un cliente di tirare fuori un prezzo bloccato mesi dopo, mentre i Suoi fornitori hanno già rivisto i loro.',
    },
    { type: 'h2', text: 'Cosa fare quando il cantiere inizia dopo la scadenza' },
    {
      type: 'list',
      items: [
        'Se il preventivo è scaduto, un nuovo preventivo (o un supplemento che conferma il prezzo rivisto) deve essere redatto e accettato prima di iniziare',
        'Se il cantiere è già iniziato con il vecchio preventivo, una clausola di revisione prezzi (materiali in particolare) permette di ripercuotere un rincaro documentato senza rinegoziare l’intero contratto',
        'In assenza di clausola, un rincaro significativo e documentato del prezzo di un materiale specifico può talvolta giustificare un supplemento negoziato (ma è una discussione, non un diritto automatico)',
      ],
    },
    { type: 'h2', text: 'Cosa cambia in pratica' },
    {
      type: 'p',
      text: 'Su materiali volatili (legno, metallo, isolanti), una validità di 30 giorni piuttosto che 90 riduce nettamente il rischio di dover assorbire un rincaro su un preventivo rimasto troppo a lungo senza risposta. Su prestazioni di sola manodopera, la validità conta meno, ma non costa mai nulla scriverla.',
    },
    {
      type: 'cta',
      title: 'La validità, mai dimenticata su un preventivo',
      text: 'Ogni preventivo Cantia include automaticamente la sua data di validità, calcolata a partire dai Suoi parametri aziendali. Non serve più pensarci a ogni invio.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un preventivo senza data di validità impegna indefinitamente l’azienda?',
      answer:
        'In linea di principio sì, finché non è stato ritirato o sostituito: ecco perché una durata di validità esplicita (da 30 a 90 giorni a seconda dei casi) deve sempre figurare sul documento.',
    },
    {
      question: 'Si può ripercuotere un rincaro dei prezzi dei materiali su un preventivo già firmato?',
      answer:
        'Solo se una clausola di revisione prezzi lo prevede esplicitamente, o tramite un supplemento negoziato con il cliente (non è mai un diritto automatico in assenza di clausola).',
    },
    {
      question: 'Quale durata di validità scegliere per un preventivo di ristrutturazione?',
      answer:
        '30 giorni è comune per materiali il cui prezzo oscilla, fino a 90 giorni per prestazioni prevalentemente di manodopera. La scelta finale dipende dalla volatilità reale delle voci del preventivo.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'norme-sia-118-devis-obligatoire',
  ],
};
