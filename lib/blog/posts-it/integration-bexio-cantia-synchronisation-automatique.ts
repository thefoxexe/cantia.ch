import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'integration-bexio-cantia-synchronisation-automatique',
  question: 'Come funziona l’integrazione nativa tra Cantia e Bexio?',
  title: 'Cantia x Bexio: la connessione nativa che elimina la doppia registrazione',
  description:
    'Cantia si collega direttamente a Bexio tramite la sua API ufficiale: clienti importati, fatture inviate con un clic, stati di pagamento tenuti aggiornati automaticamente.',
  excerpt:
    'Basta ribattere ogni fattura in Bexio dopo averla creata in Cantia. La connessione si fa con un clic da Account → Integrazioni, e resta aggiornata da sola.',
  category: 'Comparatifs & outils',
  keywords: ['bexio', 'integrazione bexio', 'sincronizzazione contabilità', 'api bexio', 'fattura automatica'],
  publishedAt: '2026-08-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Molte aziende dell’edilizia gestiscono i loro cantieri in Cantia e affidano la contabilità a Bexio, a una fiduciaria che lo utilizza, o a entrambi. Finora, questo significava una cosa: aprire una fattura completata in Cantia, poi ribatterla a mano in Bexio affinché la contabilità ne fosse a conoscenza. Due sistemi, un’unica verità, e qualcuno che deve fare da ponte tra i due a mano, fattura dopo fattura.',
    },
    {
      type: 'p',
      text: 'Non è più necessario. Cantia ora si collega direttamente a Bexio tramite la sua API ufficiale. Una volta effettuata la connessione, i clienti, le impostazioni di fatturazione e lo stato di pagamento di ogni fattura circolano automaticamente tra i due sistemi: senza esportazione, senza copia-incolla, senza rischio di scostamento tra ciò che dice Cantia e ciò che dice Bexio.',
    },
    { type: 'h2', text: 'Cosa si sincronizza, concretamente' },
    {
      type: 'list',
      items: [
        'I vostri clienti Bexio vengono importati in Cantia fin dalla connessione, poi tenuti aggiornati a ogni sincronizzazione, evitando di creare un cliente su entrambi i lati',
        'Le impostazioni di fatturazione (valuta, coordinate bancarie, modalità IVA, modalità di pagamento) vengono recuperate da Bexio, mai inserite due volte né indovinate',
        'Una fattura Cantia si invia a Bexio con un clic dal suo dettaglio. Vi arriva come bozza, pronta per essere verificata prima di qualsiasi invio o dichiarazione',
        'Lo stato di pagamento percorre il tragitto inverso: non appena una fattura è pagata in Bexio, Cantia lo sa entro l’ora successiva, senza azione manuale',
      ],
    },
    {
      type: 'callout',
      title: 'Ogni fattura esiste una sola volta lato Bexio',
      text: 'Rinviare una fattura già sincronizzata non crea mai un duplicato: Cantia ritrova la fattura Bexio corrispondente e la aggiorna. Potete risincronizzare quante volte necessario senza mai inquinare la vostra contabilità.',
    },
    { type: 'h2', text: 'Connettersi: due minuti, un amministratore' },
    {
      type: 'p',
      text: 'La connessione si effettua da Account → Integrazioni. Un amministratore dell’organizzazione clicca su «Connetti Bexio», accede al suo account Bexio come al solito e autorizza l’accesso. Si tratta del meccanismo di autenticazione ufficiale di Bexio (OAuth), lo stesso utilizzato dalle altre integrazioni terze della piattaforma. Cantia non vede mai la vostra password Bexio e non memorizza alcuna credenziale in chiaro: soltanto un token d’accesso revocabile in qualsiasi momento, da un lato come dall’altro.',
    },
    {
      type: 'p',
      text: 'Una volta connessi, una sincronizzazione automatica gira ogni ora per tenere aggiornati gli stati di pagamento, e un pulsante «Sincronizza ora» resta disponibile per forzare un aggiornamento immediato dalle impostazioni di integrazione.',
    },
    { type: 'h2', text: 'Cosa Cantia non fa al posto di Bexio' },
    {
      type: 'p',
      text: 'Cantia non finalizza né invia mai una fattura al cliente al vostro posto lato Bexio, e non elimina mai nulla lato Bexio: ogni fattura arriva come bozza, affinché la contabilità mantenga il controllo finale. Cantia resta ciò che è sempre stato (lo strumento del cantiere, non un software di contabilità generale), e Bexio resta responsabile della tenuta contabile, delle dichiarazioni IVA e di tutto ciò che riguarda la chiusura dei conti.',
    },
    {
      type: 'table',
      headers: ['', 'Prima', 'Con l’integrazione'],
      rows: [
        ['Creare un cliente', 'Una volta in Cantia, una volta in Bexio', 'Importato automaticamente, una sola volta'],
        ['Inviare una fattura in contabilità', 'Ribattuta a mano in Bexio', 'Inviata con un clic dalla fattura'],
        ['Sapere se una fattura è pagata', 'Da verificare manualmente in Bexio', 'Aggiornato automaticamente, ogni ora'],
        ['Rischio di duplicato o scostamento', 'Reale, a ogni reinserimento', 'Eliminato: ogni fattura esiste una sola volta'],
      ],
    },
    {
      type: 'cta',
      title: 'Disponibile dal piano Entreprise',
      text: 'L’integrazione Bexio è inclusa automaticamente a partire dal piano Entreprise, senza modulo da attivare separatamente. Collegatela in due minuti da Account → Integrazioni.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'L’integrazione Bexio è a pagamento oltre al mio abbonamento?',
      answer:
        'No. È inclusa automaticamente a partire dal piano Entreprise (e disponibile sul piano Sur devis), senza costo né modulo supplementare da attivare.',
    },
    {
      question: 'Cantia può inviare una fattura definitiva al mio cliente tramite Bexio?',
      answer:
        'No. Ogni fattura viene inviata a Bexio solo come bozza: siete sempre voi, o la vostra fiduciaria, a decidere della sua finalizzazione lato Bexio.',
    },
    {
      question: 'Cosa succede se disconnetto l’integrazione?',
      answer:
        'I token d’accesso Bexio vengono immediatamente revocati e nessun dato viene più scambiato. I clienti già importati e le fatture già inviate restano invariati su entrambi i lati.',
    },
    {
      question: 'Bisogna reinserire i miei clienti esistenti in Bexio perché funzioni?',
      answer:
        'No. I vostri clienti Bexio esistenti vengono importati automaticamente in Cantia fin dalla connessione, nel senso da Bexio verso Cantia.',
    },
  ],
  relatedSlugs: ['bexio-vs-cantia-logiciel-batiment', 'suivre-rentabilite-chantier-sans-excel', 'qr-facture-obligatoire-2026'],
};
