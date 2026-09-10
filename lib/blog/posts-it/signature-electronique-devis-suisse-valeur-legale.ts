import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'signature-electronique-devis-suisse-valeur-legale',
  question: 'Una firma elettronica su un preventivo ha valore legale in Svizzera?',
  title: 'Firmare un preventivo online: cosa vale davvero davanti alla legge',
  description:
    'La firma elettronica semplice vale come accettazione contrattuale per la quasi totalità dei preventivi dell’edilizia. La firma qualificata è necessaria solo in casi precisi, rari in pratica.',
  excerpt:
    'Un cliente che clicca «Accetto» su un link firma tanto quanto con una penna: per la stragrande maggioranza dei preventivi dell’edilizia, la legge svizzera non chiede nient’altro.',
  category: 'Devis & facturation',
  keywords: ['firma elettronica', 'firma online', 'valore legale', 'preventivo firmato', 'firma digitale'],
  publishedAt: '2026-04-20',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente riceve un link, clicca «Accetto», il cantiere parte (senza penna, senza carta stampata). Molti artigiani si chiedono ancora se questo «conti davvero» agli occhi della legge. La risposta è sì, nella stragrande maggioranza dei casi.',
    },
    { type: 'h2', text: 'Tre livelli di firma elettronica, non uno solo' },
    {
      type: 'table',
      headers: ['Tipo', 'Cos’è', 'Caso d’uso tipico'],
      rows: [
        ['Semplice', 'Clic, casella spuntata, convalida datata', 'Preventivi, fatture, la maggior parte dei contratti commerciali'],
        ['Avanzata', 'Identità del firmatario verificata, collegata in modo univoco', 'Contratti a rischio più elevato'],
        ['Qualificata (SES/SEQ ai sensi della SCSE)', 'Certificato qualificato, equivalente alla firma autografa', 'Atti che richiedono legalmente la forma scritta qualificata'],
      ],
    },
    {
      type: 'callout',
      title: 'Il punto che rassicura la maggior parte degli artigiani',
      text: 'Poiché il contratto d’appalto non richiede alcuna forma particolare (vedi l’art. 11 CO), una firma elettronica semplice (un clic datato su un portale) basta a documentare l’accettazione di un preventivo. La firma qualificata è necessaria solo per i rari atti in cui la legge esige specificamente una forma scritta qualificata (per esempio certi atti immobiliari), il che non riguarda quasi mai un preventivo di lavori.',
    },
    { type: 'h2', text: 'Cosa rende solida una firma elettronica semplice' },
    {
      type: 'list',
      items: [
        'Una datazione precisa dell’accettazione, conservata come prova',
        'L’identificazione chiara del documento accettato (versione, importo, data), e non solo un clic isolato senza contesto',
        'Idealmente, una traccia dell’indirizzo email o dell’account che ha convalidato, per ricollegare l’accettazione alla persona giusta',
      ],
    },
    { type: 'h2', text: 'Perché vale meglio di un PDF stampato-firmato-scansionato' },
    {
      type: 'p',
      text: 'Un PDF firmato a mano e poi scansionato non ha in realtà più valore giuridico di un clic datato. Entrambi sono prove di accettazione, né più né meno solide l’una dell’altra per un contratto senza forma richiesta. La vera differenza è pratica: il clic elimina la fase di stampa, riduce l’attrito per il cliente, e lascia una traccia digitale più facile da ritrovare anni dopo rispetto a una scansione smarrita in una casella email.',
    },
    {
      type: 'cta',
      title: 'Firmato online, datato automaticamente',
      text: 'Il portale cliente di Cantia permette al cliente di consultare e firmare il suo preventivo direttamente online, con un’accettazione datata e conservata insieme al documento.',
      buttonLabel: 'Vedere il modulo Preventivi',
    },
  ],
  faq: [
    {
      question: 'Una firma elettronica semplice basta per un preventivo di lavori?',
      answer:
        'Sì, nella quasi totalità dei casi: il contratto d’appalto non richiede alcuna forma particolare, quindi un clic datato basta a documentare l’accettazione.',
    },
    {
      question: 'Quando serve una firma elettronica qualificata piuttosto che semplice?',
      answer:
        'Solo per gli atti in cui la legge esige specificamente una forma scritta qualificata. Si tratta di un caso raro che non riguarda quasi mai un preventivo di lavori edilizi.',
    },
    {
      question: 'Un preventivo firmato elettronicamente vale più di un PDF stampato e firmato a mano?',
      answer:
        'Entrambi hanno un valore probatorio comparabile per un contratto senza forma richiesta. La firma elettronica ha soprattutto il vantaggio pratico di ridurre l’attrito e lasciare una traccia digitale facilmente ritrovabile.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'validite-devis-signe-prix-qui-bouge',
  ],
};
