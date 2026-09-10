import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'permis-construire-renovation-quand-necessaire',
  question: 'Serve una licenza edilizia per una ristrutturazione in Svizzera?',
  title: 'Licenza edilizia per una ristrutturazione: quando è necessaria',
  description:
    'Rifare una cucina o un bagno in linea di principio non richiede una licenza. Non appena la struttura, l’aspetto esterno o la destinazione d’uso cambiano, la situazione cambia, e dipende molto dal cantone.',
  excerpt:
    'Rifare un bagno in linea di principio non richiede alcuna licenza. Toccare un muro portante, sì, e il confine tra i due si gioca su dettagli che pochi artigiani verificano prima di iniziare.',
  category: 'Juridique & normes',
  keywords: ['licenza edilizia', 'ristrutturazione', 'procedura di notifica', 'autorizzazione lavori', 'cantone'],
  publishedAt: '2026-03-16',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Una ristrutturazione interna che non tocca né la struttura portante né l’uso dei locali è in linea di principio esente da licenza in Svizzera: rifare una cucina, un bagno, i pavimenti o le pitture generalmente non richiede alcuna autorizzazione. La regola cambia non appena un muro portante, l’aspetto esterno o la destinazione d’uso di un locale entrano in gioco.',
    },
    { type: 'h2', text: 'Cosa passa generalmente senza licenza' },
    {
      type: 'list',
      items: [
        'Ristrutturazione interna senza toccare la struttura (cucina, bagno, rivestimenti, pittura)',
        'Sostituzione identica di impianti esistenti (riscaldamento, sanitari, elettricità)',
        'Piccoli interventi di manutenzione ordinaria',
      ],
    },
    { type: 'h2', text: 'Cosa fa scattare quasi sempre una procedura' },
    {
      type: 'list',
      items: [
        'Qualsiasi modifica che tocchi la struttura portante (muro portante abbattuto o forato)',
        'Un cambiamento dell’aspetto esterno (facciata, tetto, finestre visibili dall’esterno)',
        'Un cambiamento di destinazione d’uso di un locale (trasformare un garage in stanza abitabile, ad esempio)',
        'Qualsiasi questione di sicurezza antincendio modificata dai lavori',
      ],
    },
    {
      type: 'callout',
      title: 'La trappola: «esente da licenza» non significa «esente da notifica»',
      text: 'Anche i piccoli lavori devono spesso essere notificati al comune prima del loro avvio, affinché sia esso stesso a decidere la procedura adeguata (procedura di notifica semplificata, senza deposito pubblico né ricorso dei vicini, oppure procedura completa). Iniziare senza aver notificato, anche per lavori che sarebbero stati esenti da licenza, espone a un fermo cantiere.',
    },
    { type: 'h2', text: 'La vera variabile: il cantone, non la Confederazione' },
    {
      type: 'p',
      text: 'Non esiste una regola federale unica: ogni cantone, talvolta ogni comune, fissa le proprie soglie di esenzione e le proprie procedure. Lo stesso cantiere di ristrutturazione può essere del tutto libero in un cantone e soggetto a notifica semplificata in un altro. Verificare presso il comune prima di impegnarsi costa una visita; non farlo può costare un fermo cantiere in corso d’opera.',
    },
    {
      type: 'p',
      text: 'Su un cantiere che tocca potenzialmente la struttura o l’aspetto esterno, meglio porre la domanda al comune prima del preventivo, non dopo. Un termine procedurale mal anticipato si ripercuote direttamente sulla pianificazione promessa al cliente.',
    },
    {
      type: 'cta',
      title: 'La pianificazione del cantiere, mai persa di vista',
      text: 'La pianificazione del team Cantia collega ogni assegnazione a un cantiere preciso, il che aiuta ad assorbire un ritardo procedurale senza perdere il filo del resto degli impegni.',
      buttonLabel: 'Scoprire la pianificazione del team',
    },
  ],
  faq: [
    {
      question: 'Rifare una cucina o un bagno richiede una licenza edilizia?',
      answer:
        'In linea di principio no, finché la struttura portante e l’uso dei locali non sono modificati. Una notifica al comune può tuttavia restare necessaria a seconda del cantone.',
    },
    {
      question: 'Quali lavori di ristrutturazione richiedono quasi sempre una licenza?',
      answer:
        'Tutto ciò che riguarda un muro portante, l’aspetto esterno dell’edificio, la destinazione d’uso di un locale o la sicurezza antincendio fa generalmente scattare una procedura.',
    },
    {
      question: 'Le regole sulle licenze sono le stesse in tutti i cantoni svizzeri?',
      answer:
        'No, non è così. Ogni cantone, talvolta ogni comune, fissa le proprie soglie di esenzione e procedure: non esiste una regola federale unica per le ristrutturazioni.',
    },
  ],
  relatedSlugs: [
    'contrat-entreprise-vs-mandat-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
    'norme-sia-118-devis-obligatoire',
  ],
};
