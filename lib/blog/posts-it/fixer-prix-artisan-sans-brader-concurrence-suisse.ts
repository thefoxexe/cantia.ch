import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'fixer-prix-artisan-sans-brader-concurrence-suisse',
  question: 'Come deve un artigiano fissare i propri prezzi senza svenderli di fronte a una concorrenza più economica?',
  title: 'Fissare i propri prezzi senza svenderli, anche di fronte a una concorrenza più economica',
  description:
    'Abbassare sistematicamente i prezzi per restare competitivi finisce sempre per fragilizzare l’impresa. Come costruire un prezzo difendibile e giustificarlo di fronte a un cliente che confronta preventivi.',
  excerpt:
    'Un artigiano che allinea sistematicamente i propri prezzi al preventivo più economico ricevuto dal cliente finisce sempre per lavorare di più, guadagnando meno. E ciò non è quasi mai sostenibile nel tempo.',
  category: 'Croissance & acquisition',
  keywords: ['fissare prezzi artigiano edilizia', 'concorrenza prezzi costruzione Svizzera', 'non svendere i preventivi', 'giustificare prezzo cantiere cliente', 'strategia tariffaria impresa edilizia'],
  publishedAt: '2026-09-11',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Di fronte a un preventivo concorrente più economico, la reazione istintiva è spesso quella di allinearsi per non perdere il cliente. È una strategia che raramente funziona nel lungo periodo, perché un prezzo costruito su un calcolo reale del costo di produzione e del margine non può scendere indefinitamente senza finire per lavorare in perdita, anche senza accorgersene immediatamente.',
    },
    { type: 'h2', text: 'Un prezzo difendibile parte sempre dal costo reale' },
    {
      type: 'list',
      items: [
        'Il costo orario reale del team (salario, contributi sociali, assicurazioni, tempo improduttivo), e non il solo salario netto versato',
        'Il costo dei materiali con il margine di scarto e movimentazione',
        'Le spese fisse dell’impresa (veicolo, assicurazione RC, software, officina) ripartite sull’attività fatturabile',
        'Un margine di profitto reale, non solo quanto basta per coprire i costi',
      ],
    },
    {
      type: 'stat',
      value: '10-15 %',
      label: 'margine di profitto netto generalmente ricercato da un’impresa edile sana, dopo la copertura di tutti i costi reali',
    },
    { type: 'h2', text: 'Giustificare un prezzo piuttosto che difenderlo' },
    {
      type: 'p',
      text: 'Di fronte a un cliente che confronta, spiegare concretamente cosa copre il prezzo (qualità dei materiali scelti, garanzia, assicurazione, tempi di realizzazione) funziona meglio di una semplice difesa della cifra. Un cliente che capisce perché un prezzo è quello che è accetta spesso di pagare di più per la tranquillità, in particolare per un cantiere importante come una ristrutturazione.',
    },
    {
      type: 'callout',
      title: 'Un preventivo più economico nasconde a volte delle voci mancanti',
      text: 'È utile, senza denigrare un collega, aiutare il cliente a confrontare ciò che ogni preventivo copre realmente (smaltimento dei rifiuti, garanzia, assicurazione) piuttosto che la sola cifra finale, spesso ingannevole se le prestazioni confrontate non sono equivalenti.',
    },
    {
      type: 'cta',
      title: 'Conoscere il proprio vero costo di produzione prima di fissare un prezzo',
      text: 'Cantia calcola la redditività reale di ogni cantiere (preventivato vs costo reale), per fissare prezzi che coprano davvero i costi dell’impresa, non solo ciò che sembra ragionevole a prima vista.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna allinearsi al preventivo più economico di un concorrente?',
      answer:
        'Generalmente no. Un prezzo costruito su un calcolo reale del costo di produzione e del margine non può allinearsi indefinitamente a un’offerta più economica senza finire per lavorare in perdita.',
    },
    {
      question: 'Come giustificare un prezzo più elevato rispetto a un preventivo concorrente?',
      answer:
        'Spiegando concretamente cosa copre il prezzo (qualità dei materiali, garanzia, assicurazione, tempi) piuttosto che difendendo semplicemente la cifra senza contesto.',
    },
    {
      question: 'Quale margine di profitto deve puntare un’impresa edile?',
      answer:
        'Generalmente tra il 10 e il 15% netto dopo la copertura di tutti i costi reali (manodopera, materiali, spese fisse): un prezzo che non genera alcun margine non è sostenibile nel tempo.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-de-revient-chantier-batiment',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'calculer-prix-horaire-reel-ouvrier-batiment',
  ],
};
