// cantia.ch/nouvelle-entreprise (and /de, /it): new companies get 3 months
// of trial instead of 14 days. They ask for it with the form of the page;
// the admin sends them a personal code from Super Admin (trial_requests,
// supabase/functions/registry-outreach). Only states what the product and
// the offer really are.

type Copy = {
  seoTitle: string;
  seoDescription: string;
  crumb: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  cta: string;
  pricing: string;
  shotAlt: string;
  cardsEyebrow: string;
  cardsPlain: string;
  cardsAccent: string;
  cards: { title: string; text: string }[];
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  formEyebrow: string;
  formPlain: string;
  formAccent: string;
  formText: string;
  form: {
    name: string;
    company: string;
    email: string;
    phone: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    successTitle: string;
    successText: string;
    error: string;
  };
  faqEyebrow: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const NEW_COMPANY_COPY: Record<'fr' | 'de' | 'it', Copy> = {
  fr: {
    seoTitle: 'Nouvelle entreprise : Cantia offert 3 mois | Cantia',
    seoDescription:
      'Votre entreprise démarre ? Devis, factures QR, heures, salaires et TVA : demandez vos 3 mois d’essai offerts au lieu des 14 jours habituels.',
    crumb: 'Nouvelle entreprise',
    eyebrow: 'Pour les entreprises qui démarrent',
    h1Plain: 'Votre entreprise démarre :',
    h1Accent: 'Cantia offert 3 mois',
    lead:
      'Les premiers mois, on n’a ni le temps ni l’envie de monter une administration. Pour les nouvelles entreprises, Cantia est offert pendant 3 mois au lieu des 14 jours d’essai habituels.',
    cta: 'Demander mes 3 mois',
    pricing: 'Voir les plans',
    shotAlt: 'Tableau de bord de Cantia',
    cardsEyebrow: 'Ce qui sert dès le début',
    cardsPlain: 'Les premières factures,',
    cardsAccent: 'sans tableur',
    cards: [
      { title: 'Devis et factures QR', text: 'Le premier devis en quelques minutes, signé en ligne par le client, transformé en facture QR en un clic. Les factures ouvertes sont suivies et relancées.' },
      { title: 'Heures et premiers salaires', text: 'Dès le premier employé : heures saisies sur le téléphone, fiches de salaire et certificat de salaire préparés dans Cantia.' },
      { title: 'TVA quand elle arrive', text: 'Quand l’entreprise devient assujettie, le décompte TVA se prépare à partir des factures, selon la méthode choisie.' },
    ],
    stepsEyebrow: 'Comment ça se passe',
    stepsTitle: 'Trois étapes',
    steps: [
      { title: 'Faites la demande', text: 'Remplissez le formulaire ci-dessous avec le nom de votre entreprise.' },
      { title: 'Recevez votre code', text: 'Nous vous envoyons par e-mail votre code personnel et le lien pour créer votre compte.' },
      { title: 'Démarrez', text: 'Avec ce lien, l’essai passe à 3 mois. Rien n’est débité pendant cette période et vous pouvez arrêter en un clic depuis votre compte.' },
    ],
    formEyebrow: 'Demander les 3 mois',
    formPlain: 'Recevez votre code',
    formAccent: 'par e-mail',
    formText: 'Indiquez votre entreprise et votre adresse e-mail. Nous vous répondons avec votre code personnel, valable 60 jours.',
    form: {
      name: 'Votre nom',
      company: 'Entreprise',
      email: 'E-mail',
      phone: 'Téléphone (facultatif)',
      message: 'Message (facultatif)',
      messagePlaceholder: 'Votre métier, votre région, une question…',
      submit: 'Demander mes 3 mois',
      successTitle: 'Demande reçue',
      successText: 'Vous recevrez votre code par e-mail à l’adresse indiquée.',
      error: 'L’envoi n’a pas fonctionné. Réessayez, ou écrivez-nous à info@cantia.ch.',
    },
    faqEyebrow: 'Questions',
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Qui peut demander les 3 mois ?', a: 'Les nouvelles entreprises. Faites la demande avec le formulaire de cette page : nous vous répondons par e-mail avec votre code personnel.' },
      { q: 'Faut-il une carte bancaire ?', a: 'Oui, comme pour l’essai habituel. Rien n’est débité pendant les 3 mois et l’abonnement peut être arrêté en un clic avant la fin.' },
      { q: 'Que se passe-t-il après les 3 mois ?', a: 'L’abonnement du plan choisi commence au prix affiché sur la page des tarifs, sans engagement. Vous pouvez changer de plan ou arrêter à tout moment.' },
      { q: 'Combien de temps le code est-il valable ?', a: '60 jours à partir de l’envoi : il suffit de créer votre compte avec le lien reçu pendant cette période.' },
    ],
  },
  de: {
    seoTitle: 'Neues Unternehmen: Cantia 3 Monate geschenkt | Cantia',
    seoDescription:
      'Ihr Unternehmen startet? Offerten, QR-Rechnungen, Stunden, Löhne und MWST: Fordern Sie 3 Monate Testphase statt der üblichen 14 Tage an.',
    crumb: 'Neues Unternehmen',
    eyebrow: 'Für Unternehmen am Start',
    h1Plain: 'Ihr Unternehmen startet:',
    h1Accent: 'Cantia 3 Monate geschenkt',
    lead:
      'In den ersten Monaten fehlt die Zeit für eine eigene Administration. Neue Unternehmen erhalten Cantia 3 Monate geschenkt, statt der üblichen 14 Tage Testphase.',
    cta: 'Meine 3 Monate anfordern',
    pricing: 'Pläne ansehen',
    shotAlt: 'Dashboard von Cantia',
    cardsEyebrow: 'Was von Anfang an hilft',
    cardsPlain: 'Die ersten Rechnungen,',
    cardsAccent: 'ohne Tabelle',
    cards: [
      { title: 'Offerten und QR-Rechnungen', text: 'Die erste Offerte in wenigen Minuten, online vom Kunden unterschrieben, mit einem Klick zur QR-Rechnung. Offene Rechnungen werden verfolgt und gemahnt.' },
      { title: 'Stunden und erste Löhne', text: 'Ab dem ersten Mitarbeitenden: Stunden auf dem Telefon erfasst, Lohnabrechnungen und Lohnausweis in Cantia vorbereitet.' },
      { title: 'MWST, wenn sie kommt', text: 'Sobald das Unternehmen mehrwertsteuerpflichtig wird, wird die MWST-Abrechnung aus den Rechnungen vorbereitet, nach der gewählten Methode.' },
    ],
    stepsEyebrow: 'So läuft es',
    stepsTitle: 'Drei Schritte',
    steps: [
      { title: 'Anfrage senden', text: 'Füllen Sie das Formular unten mit dem Namen Ihres Unternehmens aus.' },
      { title: 'Code erhalten', text: 'Wir senden Ihnen Ihren persönlichen Code und den Link zum Erstellen Ihres Kontos per E-Mail.' },
      { title: 'Starten', text: 'Mit diesem Link dauert die Testphase 3 Monate. In dieser Zeit wird nichts belastet, und Sie können jederzeit mit einem Klick in Ihrem Konto kündigen.' },
    ],
    formEyebrow: '3 Monate anfordern',
    formPlain: 'Ihr Code',
    formAccent: 'per E-Mail',
    formText: 'Geben Sie Ihr Unternehmen und Ihre E-Mail-Adresse an. Wir antworten mit Ihrem persönlichen Code, 60 Tage gültig.',
    form: {
      name: 'Ihr Name',
      company: 'Unternehmen',
      email: 'E-Mail',
      phone: 'Telefon (optional)',
      message: 'Nachricht (optional)',
      messagePlaceholder: 'Ihre Branche, Ihre Region, eine Frage…',
      submit: 'Meine 3 Monate anfordern',
      successTitle: 'Anfrage erhalten',
      successText: 'Sie erhalten Ihren Code per E-Mail an die angegebene Adresse.',
      error: 'Das Senden hat nicht funktioniert. Versuchen Sie es nochmals oder schreiben Sie an info@cantia.ch.',
    },
    faqEyebrow: 'Fragen',
    faqTitle: 'Häufige Fragen',
    faq: [
      { q: 'Wer kann die 3 Monate anfordern?', a: 'Neue Unternehmen. Senden Sie die Anfrage mit dem Formular dieser Seite: Wir antworten per E-Mail mit Ihrem persönlichen Code.' },
      { q: 'Braucht es eine Kreditkarte?', a: 'Ja, wie bei der üblichen Testphase. In den 3 Monaten wird nichts belastet, und das Abonnement kann vorher mit einem Klick beendet werden.' },
      { q: 'Was passiert nach den 3 Monaten?', a: 'Das Abonnement des gewählten Plans beginnt zum Preis der Tarifseite, ohne Mindestlaufzeit. Sie können jederzeit wechseln oder kündigen.' },
      { q: 'Wie lange ist der Code gültig?', a: '60 Tage ab dem Versand: Erstellen Sie Ihr Konto in dieser Zeit mit dem erhaltenen Link.' },
    ],
  },
  it: {
    seoTitle: 'Nuova impresa: Cantia offerto per 3 mesi | Cantia',
    seoDescription:
      'La vostra impresa inizia? Preventivi, fatture QR, ore, salari e IVA: chiedete 3 mesi di prova offerti invece dei soliti 14 giorni.',
    crumb: 'Nuova impresa',
    eyebrow: 'Per le imprese che iniziano',
    h1Plain: 'La vostra impresa inizia:',
    h1Accent: 'Cantia offerto per 3 mesi',
    lead:
      'Nei primi mesi manca il tempo per costruire un’amministrazione. Per le nuove imprese Cantia è offerto per 3 mesi invece dei soliti 14 giorni di prova.',
    cta: 'Chiedere i miei 3 mesi',
    pricing: 'Vedere i piani',
    shotAlt: 'Cruscotto di Cantia',
    cardsEyebrow: 'Ciò che serve dall’inizio',
    cardsPlain: 'Le prime fatture,',
    cardsAccent: 'senza tabelle',
    cards: [
      { title: 'Preventivi e fatture QR', text: 'Il primo preventivo in pochi minuti, firmato online dal cliente, trasformato in fattura QR con un clic. Le fatture aperte sono seguite e sollecitate.' },
      { title: 'Ore e primi salari', text: 'Dal primo dipendente: ore registrate sul telefono, conteggi salariali e certificato di salario preparati in Cantia.' },
      { title: 'L’IVA quando arriva', text: 'Quando l’impresa diventa assoggettata, il rendiconto IVA si prepara a partire dalle fatture, secondo il metodo scelto.' },
    ],
    stepsEyebrow: 'Come funziona',
    stepsTitle: 'Tre passi',
    steps: [
      { title: 'Fate la richiesta', text: 'Compilate il modulo qui sotto con il nome della vostra impresa.' },
      { title: 'Ricevete il codice', text: 'Vi inviamo per e-mail il vostro codice personale e il link per creare il conto.' },
      { title: 'Iniziate', text: 'Con questo link la prova passa a 3 mesi. Nulla viene addebitato in questo periodo e potete fermarvi con un clic dal vostro conto.' },
    ],
    formEyebrow: 'Chiedere i 3 mesi',
    formPlain: 'Il vostro codice',
    formAccent: 'per e-mail',
    formText: 'Indicate la vostra impresa e il vostro indirizzo e-mail. Vi rispondiamo con il vostro codice personale, valido 60 giorni.',
    form: {
      name: 'Il vostro nome',
      company: 'Impresa',
      email: 'E-mail',
      phone: 'Telefono (facoltativo)',
      message: 'Messaggio (facoltativo)',
      messagePlaceholder: 'Il vostro mestiere, la vostra regione, una domanda…',
      submit: 'Chiedere i miei 3 mesi',
      successTitle: 'Richiesta ricevuta',
      successText: 'Riceverete il codice per e-mail all’indirizzo indicato.',
      error: 'L’invio non ha funzionato. Riprovate o scriveteci a info@cantia.ch.',
    },
    faqEyebrow: 'Domande',
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'Chi può chiedere i 3 mesi?', a: 'Le nuove imprese. Fate la richiesta con il modulo di questa pagina: vi rispondiamo per e-mail con il vostro codice personale.' },
      { q: 'Serve una carta di credito?', a: 'Sì, come per la prova abituale. Nei 3 mesi non viene addebitato nulla e l’abbonamento può essere fermato prima con un clic.' },
      { q: 'Cosa succede dopo i 3 mesi?', a: 'L’abbonamento del piano scelto inizia al prezzo della pagina tariffe, senza impegno. Potete cambiare piano o disdire in qualsiasi momento.' },
      { q: 'Quanto tempo è valido il codice?', a: '60 giorni dall’invio: basta creare il conto con il link ricevuto in questo periodo.' },
    ],
  },
};
