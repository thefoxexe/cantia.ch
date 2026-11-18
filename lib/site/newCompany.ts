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
  // SEO audit, November 2026: the page answers what new companies search
  // (« logiciel de facturation »…), the offer comes second.
  howCta: string;
  reassurance: string;
  timelineEyebrow: string;
  timelineTitle: string;
  timeline: { when: string; title: string; text: string }[];
  compareEyebrow: string;
  compareTitle: string;
  compareCols: [string, string];
  compareRows: { label: string; values: [string, string] }[];
  guideEyebrow: string;
  guideTitle: string;
  guide: { href: string; label: string }[];
  finalTitle: string;
  finalText: string;
};

export const NEW_COMPANY_COPY: Record<'fr' | 'de' | 'it', Copy> = {
  fr: {
    seoTitle: "Logiciel de facturation nouvelle entreprise : 3 mois offerts",
    seoDescription:
      "Vous créez votre entreprise en Suisse ? Devis, factures QR, heures et TVA dans un seul logiciel. 3 mois offerts au lieu de 14 jours, sans engagement.",
    crumb: 'Nouvelle entreprise',
    eyebrow: 'Pour les entreprises qui démarrent',
    h1Plain: "Le logiciel de devis et factures pour votre nouvelle entreprise.",
    h1Accent: "3 mois offerts pour démarrer.",
    lead:
      'Les premiers mois, on n’a ni le temps ni l’envie de monter une administration. Pour les nouvelles entreprises, Cantia est offert pendant 3 mois au lieu des 14 jours d’essai habituels.',
    cta: "Demander mes 3 mois offerts",
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
      { q: "Je n’ai pas encore de numéro IDE, puis-je commencer ?", a: "Oui. Le numéro IDE se renseigne quand vous l’avez, dans les informations de l’entreprise ; il apparaît ensuite sur vos devis et factures." },
      { q: "Dois-je être inscrit à la TVA ?", a: "Non, ce n’est pas nécessaire pour utiliser Cantia. Le taux de TVA appliqué se règle dans les paramètres ; quand vous devenez assujetti, le décompte se prépare à partir de vos factures." },
      { q: "Puis-je importer mes premiers clients ?", a: "Oui : clients et catalogue s’importent depuis un fichier Excel ou CSV." },
    ],
    howCta: "Voir comment ça marche",
    reassurance: "Sans engagement · Rien n’est débité pendant les 3 mois · Données hébergées à Zurich",
    timelineEyebrow: "Vos 90 premiers jours",
    timelineTitle: "Du premier devis au premier bilan.",
    timeline: [{"when": "Semaine 1", "title": "Le premier devis part", "text": "Entreprise, logo et premières positions configurés. Le client signe le devis en ligne, sans créer de compte."}, {"when": "Mois 1", "title": "Les premières factures sont payées", "text": "Factures QR envoyées depuis le devis signé, paiements suivis, relances préparées pour celles qui traînent."}, {"when": "Mois 3", "title": "Vous savez où vous en êtes", "text": "Facturé, encaissé, factures ouvertes : tout est au même endroit, et vous choisissez la formule qui vous convient."}],
    compareEyebrow: "Excel ou logiciel ?",
    compareTitle: "Pour une entreprise qui démarre.",
    compareCols: ["Excel / Word", "Cantia"],
    compareRows: [{"label": "Premier devis", "values": ["Un modèle à mettre en page", "Prêt en quelques minutes, à vos couleurs"]}, {"label": "Facture QR", "values": ["Bulletin QR à générer à part", "Inclus dans chaque facture"]}, {"label": "Signature du client", "values": ["Impression et scan", "En ligne, sans compte"]}, {"label": "Factures ouvertes", "values": ["À suivre à la main", "Suivies et relancées"]}, {"label": "Coût", "values": ["Souvent déjà installé", "3 mois offerts, puis dès CHF 39.– / mois"]}],
    guideEyebrow: "Le guide pour démarrer",
    guideTitle: "Créer son entreprise du bâtiment, étape par étape.",
    guide: [{"href": "/blog/creer-entreprise-batiment-suisse-guide-complet", "label": "Créer son entreprise du bâtiment en Suisse : le guide complet"}, {"href": "/blog/raison-individuelle-sarl-sa-quel-statut-batiment", "label": "Raison individuelle, Sàrl ou SA ?"}, {"href": "/blog/immatriculer-entreprise-construction-registre-commerce", "label": "Inscription au registre du commerce"}, {"href": "/blog/avs-ai-independant-batiment", "label": "AVS et assurances d’un indépendant"}, {"href": "/blog/cout-creation-entreprise-construction-suisse", "label": "Combien coûte la création d’une entreprise"}, {"href": "/blog/calculer-prix-horaire-reel-ouvrier-batiment", "label": "Calculer son vrai prix horaire"}, {"href": "/blog/modele-devis-gratuit-artisan-batiment-suisse", "label": "Modèle de devis gratuit"}, {"href": "/blog/etablir-certificat-salaire-lohnausweis-premier-employe", "label": "Le premier employé : certificat de salaire"}, {"href": "/blog/trouver-clients-artisan-batiment-suisse", "label": "Trouver ses premiers clients"}],
    finalTitle: "Votre premier devis, cette semaine.",
    finalText: "3 mois offerts pour les nouvelles entreprises, au lieu des 14 jours d’essai habituels. Sans engagement.",
  },
  de: {
    seoTitle: "Rechnungsprogramm für Neugründer: 3 Monate gratis",
    seoDescription:
      "Sie gründen Ihr Unternehmen in der Schweiz? Offerten, QR-Rechnungen, Stunden und MWST in einer Software. 3 Monate statt 14 Tage, ohne Verpflichtung.",
    crumb: 'Neues Unternehmen',
    eyebrow: 'Für Unternehmen am Start',
    h1Plain: "Die Software für Offerten und Rechnungen Ihres neuen Unternehmens.",
    h1Accent: "3 Monate gratis zum Start.",
    lead:
      'In den ersten Monaten fehlt die Zeit für eine eigene Administration. Neue Unternehmen erhalten Cantia 3 Monate geschenkt, statt der üblichen 14 Tage Testphase.',
    cta: "Meine 3 Monate anfordern",
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
      { q: "Ich habe noch keine UID-Nummer. Kann ich trotzdem starten?", a: "Ja. Die UID-Nummer tragen Sie in den Unternehmensangaben ein, sobald Sie sie haben; danach erscheint sie auf Offerten und Rechnungen." },
      { q: "Muss ich mehrwertsteuerpflichtig sein?", a: "Nein, das ist für Cantia nicht nötig. Der MWST-Satz wird in den Einstellungen festgelegt; sobald Sie pflichtig sind, wird die Abrechnung aus Ihren Rechnungen vorbereitet." },
      { q: "Kann ich meine ersten Kunden importieren?", a: "Ja: Kunden und Katalog lassen sich aus einer Excel- oder CSV-Datei importieren." },
    ],
    howCta: "So funktioniert es",
    reassurance: "Ohne Verpflichtung · In den 3 Monaten wird nichts belastet · Daten in Zürich gespeichert",
    timelineEyebrow: "Ihre ersten 90 Tage",
    timelineTitle: "Von der ersten Offerte zur ersten Bilanz.",
    timeline: [{"when": "Woche 1", "title": "Die erste Offerte geht raus", "text": "Unternehmen, Logo und erste Positionen eingerichtet. Der Kunde unterschreibt die Offerte online, ohne Konto."}, {"when": "Monat 1", "title": "Die ersten Rechnungen sind bezahlt", "text": "QR-Rechnungen aus der unterschriebenen Offerte, Zahlungen verfolgt, Mahnungen für säumige Kunden vorbereitet."}, {"when": "Monat 3", "title": "Sie wissen, wo Sie stehen", "text": "Fakturiert, bezahlt, offen: alles an einem Ort, und Sie wählen den passenden Plan."}],
    compareEyebrow: "Excel oder Software?",
    compareTitle: "Für ein Unternehmen am Start.",
    compareCols: ["Excel / Word", "Cantia"],
    compareRows: [{"label": "Erste Offerte", "values": ["Vorlage selbst gestalten", "In wenigen Minuten, in Ihren Farben"]}, {"label": "QR-Rechnung", "values": ["QR-Teil separat erstellen", "In jeder Rechnung enthalten"]}, {"label": "Unterschrift des Kunden", "values": ["Ausdrucken und scannen", "Online, ohne Konto"]}, {"label": "Offene Rechnungen", "values": ["Von Hand verfolgen", "Verfolgt und gemahnt"]}, {"label": "Kosten", "values": ["Oft schon vorhanden", "3 Monate gratis, dann ab CHF 39.– / Monat"]}],
    guideEyebrow: "Der Leitfaden zum Start",
    guideTitle: "Ein Bauunternehmen gründen, Schritt für Schritt.",
    guide: [{"href": "/de/blog/bauunternehmen-gruenden-schweiz", "label": "Ein Bauunternehmen in der Schweiz gründen"}, {"href": "/de/blog/stundenkosten-bauarbeiter-berechnen", "label": "Den echten Stundenansatz berechnen"}, {"href": "/de/offerte-erstellen", "label": "Die erste Offerte erstellen (mit Vorlage)"}, {"href": "/de/blog/qr-rechnung-obligatorisch-schweiz", "label": "QR-Rechnung: was gilt"}, {"href": "/de/blog/lohnausweis-erstellen-erster-mitarbeiter", "label": "Der erste Mitarbeiter: Lohnausweis"}, {"href": "/de/blog/kunden-finden-handwerker", "label": "Die ersten Kunden finden"}, {"href": "/de/blog/software-bauunternehmen-schweiz-auswahl", "label": "Welche Software zum Start?"}],
    finalTitle: "Ihre erste Offerte, diese Woche.",
    finalText: "3 Monate gratis für neue Unternehmen, statt der üblichen 14 Tage Testphase. Ohne Verpflichtung.",
  },
  it: {
    seoTitle: "Software di fatturazione per nuove imprese: 3 mesi gratis",
    seoDescription:
      "State aprendo la vostra impresa in Svizzera? Preventivi, fatture QR, ore e IVA in un solo software. 3 mesi invece di 14 giorni, senza impegno.",
    crumb: 'Nuova impresa',
    eyebrow: 'Per le imprese che iniziano',
    h1Plain: "Il software di preventivi e fatture per la vostra nuova impresa.",
    h1Accent: "3 mesi gratis per iniziare.",
    lead:
      'Nei primi mesi manca il tempo per costruire un’amministrazione. Per le nuove imprese Cantia è offerto per 3 mesi invece dei soliti 14 giorni di prova.',
    cta: "Richiedere i miei 3 mesi",
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
      { q: "Non ho ancora un numero IDI, posso iniziare?", a: "Sì. Il numero IDI si inserisce nei dati dell’impresa quando lo avete; poi compare su preventivi e fatture." },
      { q: "Devo essere assoggettato all’IVA?", a: "No, non è necessario per usare Cantia. L’aliquota IVA si imposta nelle impostazioni; quando diventate assoggettati, il rendiconto si prepara dalle vostre fatture." },
      { q: "Posso importare i miei primi clienti?", a: "Sì: clienti e catalogo si importano da un file Excel o CSV." },
    ],
    howCta: "Come funziona",
    reassurance: "Senza impegno · Nulla viene addebitato nei 3 mesi · Dati ospitati a Zurigo",
    timelineEyebrow: "I vostri primi 90 giorni",
    timelineTitle: "Dal primo preventivo al primo bilancio.",
    timeline: [{"when": "Settimana 1", "title": "Parte il primo preventivo", "text": "Impresa, logo e prime voci configurati. Il cliente firma il preventivo online, senza creare un conto."}, {"when": "Mese 1", "title": "Le prime fatture sono pagate", "text": "Fatture QR dal preventivo firmato, pagamenti seguiti, solleciti pronti per chi ritarda."}, {"when": "Mese 3", "title": "Sapete a che punto siete", "text": "Fatturato, incassato, aperto: tutto in un unico posto, e scegliete il piano giusto."}],
    compareEyebrow: "Excel o software?",
    compareTitle: "Per un’impresa che inizia.",
    compareCols: ["Excel / Word", "Cantia"],
    compareRows: [{"label": "Primo preventivo", "values": ["Un modello da impaginare", "Pronto in pochi minuti, nei vostri colori"]}, {"label": "Fattura QR", "values": ["Parte QR da generare a parte", "Inclusa in ogni fattura"]}, {"label": "Firma del cliente", "values": ["Stampa e scansione", "Online, senza conto"]}, {"label": "Fatture aperte", "values": ["Da seguire a mano", "Seguite e sollecitate"]}, {"label": "Costo", "values": ["Spesso già disponibile", "3 mesi gratis, poi da CHF 39.– / mese"]}],
    guideEyebrow: "La guida per iniziare",
    guideTitle: "Aprire un’impresa edile, passo dopo passo.",
    guide: [{"href": "/it/blog/aprire-impresa-edile-svizzera", "label": "Aprire un’impresa edile in Svizzera"}, {"href": "/it/blog/avs-ai-indipendente-edilizia", "label": "AVS e assicurazioni per indipendenti"}, {"href": "/it/blog/costo-orario-operaio-edile", "label": "Calcolare la vera tariffa oraria"}, {"href": "/it/creare-preventivo", "label": "Il primo preventivo (con modello)"}, {"href": "/it/blog/fattura-qr-obbligatoria-svizzera", "label": "Fattura QR: cosa sapere"}, {"href": "/it/blog/certificato-di-salario-primo-dipendente", "label": "Il primo dipendente: certificato di salario"}, {"href": "/it/blog/trovare-clienti-artigiano", "label": "Trovare i primi clienti"}, {"href": "/it/blog/software-impresa-costruzioni-quale-scegliere", "label": "Quale software per iniziare?"}],
    finalTitle: "Il vostro primo preventivo, questa settimana.",
    finalText: "3 mesi gratis per le nuove imprese, invece dei soliti 14 giorni di prova. Senza impegno.",
  },
};
