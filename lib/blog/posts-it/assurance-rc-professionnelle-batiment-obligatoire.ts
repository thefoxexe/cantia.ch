import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-rc-professionnelle-batiment-obligatoire',
  question: 'L’assicurazione di responsabilità civile professionale è obbligatoria nell’edilizia in Svizzera?',
  title: 'RC professionale nell’edilizia: obbligatoria o no in Svizzera?',
  description:
    'Nessuna legge federale unica impone la RC professionale a ogni artigiano: diversi cantoni e committenti la esigono comunque di fatto per alcuni mestieri. Il punto chiaro.',
  excerpt:
    'Non esiste una legge federale unica che imponga la RC professionale a ogni artigiano. Ciò che la impone in pratica è spesso il cantone o il committente, e talvolta un sinistro che si scopre troppo tardi non essere coperto.',
  category: 'Juridique & normes',
  keywords: ['rc professionale', 'assicurazione edilizia', 'responsabilità civile', 'assicurazione obbligatoria', 'artigiano svizzero'],
  publishedAt: '2026-03-12',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: '«È obbligatoria, no?» La risposta onesta è che non esiste un’unica legge federale che imponga la RC professionale a ogni artigiano dell’edilizia. Ciò che la rende obbligatoria in pratica varia a seconda del cantone, del mestiere esatto, e spesso del committente stesso.',
    },
    { type: 'h2', text: 'Cosa copre realmente la RC professionale' },
    {
      type: 'p',
      text: 'I danni causati a terzi nell’esercizio dell’attività professionale (corporali, materiali, immateriali), nonché le spese di difesa in caso di procedimento. Un danno da infiltrazione d’acqua causato da un errore di posa, un ponteggio che danneggia la proprietà vicina, un errore di calcolo che compromette la struttura: è esattamente il tipo di sinistro che questa assicurazione copre, e che la garanzia decennale del cantiere non copre allo stesso modo.',
    },
    {
      type: 'callout',
      title: 'Dove diventa obbligatoria di fatto',
      text: 'Diversi cantoni la impongono esplicitamente per alcuni mestieri regolamentati dell’edilizia. Architetti e ingegneri vi sono praticamente sempre tenuti. E anche senza obbligo legale diretto, un direttore lavori, una società di gestione immobiliare o un bando pubblico la esigono quasi sistematicamente come condizione di ammissione. Diventa quindi obbligatoria nei fatti, anche senza un testo di legge che la nomini.',
    },
    { type: 'h2', text: 'Il rischio di non averla' },
    {
      type: 'list',
      items: [
        'Un sinistro importante senza copertura impegna il patrimonio personale dell’impresa individuale, non solo la sua liquidità',
        'Un direttore lavori che esige un’attestazione assicurativa può rifiutare un’offerta senza di essa, ancor prima di esaminare il prezzo',
        'Alcuni fornitori o banche la richiedono anche all’apertura di un conto professionale o di una linea di credito',
      ],
    },
    { type: 'h2', text: 'Verificare prima di firmare, non dopo un sinistro' },
    {
      type: 'p',
      text: 'Il riflesso più utile non è chiedersi «sono obbligato?» ma «cosa rischio realmente se questo non è coperto?». Su un mestiere a rischio fisico (ponteggio, tetto, movimento terra), la risposta pende quasi sempre verso la sottoscrizione, che sia obbligatoria o meno sulla carta.',
    },
    {
      type: 'cta',
      title: 'Gestire il cantiere, non la burocrazia assicurativa',
      text: 'Cantia centralizza preventivi, fatture e subappaltatori per cantiere, per concentrarsi sul lavoro piuttosto che sulla ricerca del documento giusto nel momento sbagliato.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'La RC professionale è obbligatoria per ogni artigiano svizzero?',
      answer:
        'No, non esiste un’unica legge federale che la imponga a tutti i mestieri dell’edilizia. Diversi cantoni la richiedono però per alcuni mestieri regolamentati, e numerosi committenti la richiedono sistematicamente.',
    },
    {
      question: 'La RC professionale sostituisce la garanzia decennale di un cantiere?',
      answer:
        'No, sono due meccanismi diversi: la garanzia legale (art. 371 CO) copre i difetti dell’opera stessa, la RC professionale copre i danni causati a terzi durante l’esecuzione dei lavori.',
    },
    {
      question: 'Cosa rischia un’azienda senza RC professionale in caso di sinistro importante?',
      answer:
        'In mancanza di un’assicurazione intermedia per assorbire il costo, il patrimonio dell’azienda, persino personale per un’impresa individuale, può essere direttamente coinvolto per coprire i danni.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'sous-traitant-batiment-suisse-contrat-facturation',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
};
