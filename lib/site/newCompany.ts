// cantia.ch/nouvelle-entreprise (and /de, /it): the offer for companies that
// have just been entered in the commercial register, 3 months of trial
// instead of 14 days with the code NOUVELLE (trial_offer_codes, multi_use).
// Only states what the product and the offer really are.

export const NEW_COMPANY_CODE = 'NOUVELLE';

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
  paper: { tag: string; title: string; sub: string; lines: string[]; caption: string };
  cardsEyebrow: string;
  cardsPlain: string;
  cardsAccent: string;
  cards: { title: string; text: string }[];
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faqEyebrow: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const NEW_COMPANY_COPY: Record<'fr' | 'de' | 'it', Copy> = {
  fr: {
    seoTitle: 'Nouvelle entreprise : Cantia offert 3 mois | Cantia',
    seoDescription:
      'Entreprise inscrite au registre du commerce depuis peu ? Devis, factures QR, heures, salaires et TVA : 3 mois d’essai au lieu de 14 jours avec le code NOUVELLE.',
    crumb: 'Nouvelle entreprise',
    eyebrow: 'Pour les entreprises qui démarrent',
    h1Plain: 'Votre entreprise démarre :',
    h1Accent: 'Cantia offert 3 mois',
    lead:
      'Les premiers mois, on n’a ni le temps ni l’envie de monter une administration. Pour les entreprises inscrites au registre du commerce depuis moins de 12 mois, l’essai passe de 14 jours à 3 mois, sur tous les plans.',
    cta: 'Démarrer avec 3 mois offerts',
    pricing: 'Voir les plans',
    paper: {
      tag: 'Code',
      title: 'NOUVELLE',
      sub: '3 mois d’essai au lieu de 14 jours',
      lines: ['Tous les plans', 'Rien n’est débité pendant 3 mois', 'Résiliable en un clic'],
      caption: 'Le code s’applique tout seul avec le lien ci-contre.',
    },
    cardsEyebrow: 'Ce qui sert dès le début',
    cardsPlain: 'Les premières factures,',
    cardsAccent: 'sans tableur',
    cards: [
      { title: 'Devis et factures QR', text: 'Le premier devis en quelques minutes, signé en ligne par le client, transformé en facture QR en un clic. Les factures ouvertes sont suivies et relancées.' },
      { title: 'Heures et premiers salaires', text: 'Dès le premier employé : heures saisies sur le téléphone, fiches de salaire et certificat de salaire préparés dans Cantia.' },
      { title: 'TVA quand elle arrive', text: 'Quand l’entreprise devient assujettie, le décompte TVA se prépare à partir des factures, selon la méthode choisie.' },
    ],
    stepsEyebrow: 'Comment en profiter',
    stepsTitle: 'Trois étapes',
    steps: [
      { title: 'Créez votre compte', text: 'Avec le lien de cette page, le code NOUVELLE est déjà enregistré. Vous pouvez aussi le saisir au moment de choisir votre plan.' },
      { title: 'Choisissez votre plan', text: 'L’essai affiché passe à 3 mois. La carte est demandée, mais rien n’est débité avant la fin des 3 mois.' },
      { title: 'Travaillez, puis décidez', text: 'Vous continuez avec le plan choisi, ou vous arrêtez en un clic depuis votre compte avant la fin des 3 mois.' },
    ],
    faqEyebrow: 'Questions',
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Qui peut profiter des 3 mois offerts ?', a: 'Les entreprises inscrites au registre du commerce depuis moins de 12 mois, raisons individuelles comprises. L’offre vaut pour un nouveau compte Cantia.' },
      { q: 'Faut-il une carte bancaire ?', a: 'Oui, comme pour l’essai habituel. Rien n’est débité pendant les 3 mois et l’abonnement peut être arrêté en un clic avant la fin.' },
      { q: 'Que se passe-t-il après les 3 mois ?', a: 'L’abonnement du plan choisi commence au prix affiché sur la page des tarifs, sans engagement. Vous pouvez changer de plan ou arrêter à tout moment.' },
      { q: 'Mon entreprise n’est pas encore inscrite au registre, puis-je commencer ?', a: 'Oui. Vous pouvez créer votre compte et préparer vos premiers documents ; l’offre vaut pour les entreprises qui démarrent leur activité.' },
    ],
  },
  de: {
    seoTitle: 'Neues Unternehmen: Cantia 3 Monate geschenkt | Cantia',
    seoDescription:
      'Unternehmen neu im Handelsregister? Offerten, QR-Rechnungen, Stunden, Löhne und MWST: 3 Monate Testphase statt 14 Tage mit dem Code NOUVELLE.',
    crumb: 'Neues Unternehmen',
    eyebrow: 'Für Unternehmen am Start',
    h1Plain: 'Ihr Unternehmen startet:',
    h1Accent: 'Cantia 3 Monate geschenkt',
    lead:
      'In den ersten Monaten fehlt die Zeit für eine eigene Administration. Für Unternehmen, die seit weniger als 12 Monaten im Handelsregister eingetragen sind, dauert die Testphase 3 Monate statt 14 Tage, auf allen Plänen.',
    cta: 'Mit 3 Monaten gratis starten',
    pricing: 'Pläne ansehen',
    paper: {
      tag: 'Code',
      title: 'NOUVELLE',
      sub: '3 Monate Testphase statt 14 Tage',
      lines: ['Alle Pläne', '3 Monate lang wird nichts belastet', 'Mit einem Klick kündbar'],
      caption: 'Mit dem Link nebenan wird der Code automatisch angewendet.',
    },
    cardsEyebrow: 'Was von Anfang an hilft',
    cardsPlain: 'Die ersten Rechnungen,',
    cardsAccent: 'ohne Tabelle',
    cards: [
      { title: 'Offerten und QR-Rechnungen', text: 'Die erste Offerte in wenigen Minuten, online vom Kunden unterschrieben, mit einem Klick zur QR-Rechnung. Offene Rechnungen werden verfolgt und gemahnt.' },
      { title: 'Stunden und erste Löhne', text: 'Ab dem ersten Mitarbeitenden: Stunden auf dem Telefon erfasst, Lohnabrechnungen und Lohnausweis in Cantia vorbereitet.' },
      { title: 'MWST, wenn sie kommt', text: 'Sobald das Unternehmen mehrwertsteuerpflichtig wird, wird die MWST-Abrechnung aus den Rechnungen vorbereitet, nach der gewählten Methode.' },
    ],
    stepsEyebrow: 'So geht es',
    stepsTitle: 'Drei Schritte',
    steps: [
      { title: 'Konto erstellen', text: 'Mit dem Link dieser Seite ist der Code NOUVELLE bereits hinterlegt. Sie können ihn auch bei der Wahl des Plans eingeben.' },
      { title: 'Plan wählen', text: 'Die Testphase wird auf 3 Monate verlängert. Die Karte wird verlangt, belastet wird aber erst nach den 3 Monaten.' },
      { title: 'Arbeiten, dann entscheiden', text: 'Sie bleiben beim gewählten Plan oder kündigen vor Ablauf der 3 Monate mit einem Klick in Ihrem Konto.' },
    ],
    faqEyebrow: 'Fragen',
    faqTitle: 'Häufige Fragen',
    faq: [
      { q: 'Wer erhält die 3 Monate geschenkt?', a: 'Unternehmen, die seit weniger als 12 Monaten im Handelsregister eingetragen sind, Einzelunternehmen eingeschlossen. Das Angebot gilt für ein neues Cantia-Konto.' },
      { q: 'Braucht es eine Kreditkarte?', a: 'Ja, wie bei der üblichen Testphase. In den 3 Monaten wird nichts belastet, und das Abonnement kann vorher mit einem Klick beendet werden.' },
      { q: 'Was passiert nach den 3 Monaten?', a: 'Das Abonnement des gewählten Plans beginnt zum Preis der Tarifseite, ohne Mindestlaufzeit. Sie können jederzeit wechseln oder kündigen.' },
      { q: 'Mein Unternehmen ist noch nicht eingetragen, kann ich trotzdem starten?', a: 'Ja. Sie können Ihr Konto erstellen und die ersten Dokumente vorbereiten; das Angebot gilt für Unternehmen, die ihre Tätigkeit aufnehmen.' },
    ],
  },
  it: {
    seoTitle: 'Nuova impresa: Cantia offerto per 3 mesi | Cantia',
    seoDescription:
      'Impresa appena iscritta al registro di commercio? Preventivi, fatture QR, ore, salari e IVA: 3 mesi di prova invece di 14 giorni con il codice NOUVELLE.',
    crumb: 'Nuova impresa',
    eyebrow: 'Per le imprese che iniziano',
    h1Plain: 'La vostra impresa inizia:',
    h1Accent: 'Cantia offerto per 3 mesi',
    lead:
      'Nei primi mesi manca il tempo per costruire un’amministrazione. Per le imprese iscritte al registro di commercio da meno di 12 mesi, la prova passa da 14 giorni a 3 mesi, su tutti i piani.',
    cta: 'Iniziare con 3 mesi offerti',
    pricing: 'Vedere i piani',
    paper: {
      tag: 'Codice',
      title: 'NOUVELLE',
      sub: '3 mesi di prova invece di 14 giorni',
      lines: ['Tutti i piani', 'Nessun addebito per 3 mesi', 'Disdicibile con un clic'],
      caption: 'Con il link qui accanto il codice si applica da solo.',
    },
    cardsEyebrow: 'Ciò che serve dall’inizio',
    cardsPlain: 'Le prime fatture,',
    cardsAccent: 'senza tabelle',
    cards: [
      { title: 'Preventivi e fatture QR', text: 'Il primo preventivo in pochi minuti, firmato online dal cliente, trasformato in fattura QR con un clic. Le fatture aperte sono seguite e sollecitate.' },
      { title: 'Ore e primi salari', text: 'Dal primo dipendente: ore registrate sul telefono, conteggi salariali e certificato di salario preparati in Cantia.' },
      { title: 'L’IVA quando arriva', text: 'Quando l’impresa diventa assoggettata, il rendiconto IVA si prepara a partire dalle fatture, secondo il metodo scelto.' },
    ],
    stepsEyebrow: 'Come approfittarne',
    stepsTitle: 'Tre passi',
    steps: [
      { title: 'Create il vostro conto', text: 'Con il link di questa pagina il codice NOUVELLE è già registrato. Potete anche inserirlo al momento di scegliere il piano.' },
      { title: 'Scegliete il piano', text: 'La prova passa a 3 mesi. La carta è richiesta, ma nulla viene addebitato prima della fine dei 3 mesi.' },
      { title: 'Lavorate, poi decidete', text: 'Continuate con il piano scelto, oppure vi fermate con un clic dal vostro conto prima della fine dei 3 mesi.' },
    ],
    faqEyebrow: 'Domande',
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'Chi può approfittare dei 3 mesi offerti?', a: 'Le imprese iscritte al registro di commercio da meno di 12 mesi, ditte individuali comprese. L’offerta vale per un nuovo conto Cantia.' },
      { q: 'Serve una carta di credito?', a: 'Sì, come per la prova abituale. Nei 3 mesi non viene addebitato nulla e l’abbonamento può essere fermato prima con un clic.' },
      { q: 'Cosa succede dopo i 3 mesi?', a: 'L’abbonamento del piano scelto inizia al prezzo della pagina tariffe, senza impegno. Potete cambiare piano o disdire in qualsiasi momento.' },
      { q: 'La mia impresa non è ancora iscritta, posso iniziare?', a: 'Sì. Potete creare il conto e preparare i primi documenti; l’offerta vale per le imprese che avviano la loro attività.' },
    ],
  },
};
