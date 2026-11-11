// cantia.ch/comparatifs (and /de, /it): the hub of the comparison articles.
// What each tool is said to be for is taken from the articles themselves
// (lib/blog/posts*/); a card only links to an article published in that
// language (components/site/InnerPages.tsx ComparePage checks it).

type Locale = 'fr' | 'de' | 'it';

export interface CompareRow {
  tool: string;
  // Base slug of the article (lib/blog/posts/<slug>.ts).
  slug: string;
  forWhom: string;
  withCantia: string;
}

export interface CompareCopy {
  seoTitle: string;
  seoDescription: string;
  crumb: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  tableEyebrow: string;
  tablePlain: string;
  tableText: string;
  head: [string, string, string];
  rows: CompareRow[];
  read: string;
  vs: string;
  noArticle: string;
  cardsEyebrow: string;
  cardsPlain: string;
  cardsText: string;
  guideLabel: string;
  guideTitle: string;
  guideText: string;
  guideRead: string;
  importStrong: string;
  importText: string;
  importLink: string;
  faqEyebrow: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
}

const fr: CompareCopy = {
  seoTitle: 'Comparatifs : Cantia, Bexio, Klara, Crésus, WinBiz | Cantia',
  seoDescription: 'Cantia comparé aux logiciels suisses de gestion et au tableur : à qui s’adresse chaque outil, ce qu’il fait bien et quand l’associer à Cantia.',
  crumb: 'Comparatifs',
  eyebrow: 'Comparatifs',
  h1Plain: 'Cantia face aux autres outils.',
  h1Accent: 'Sans détour.',
  lead: 'Bexio, Klara, Crésus, WinBiz ou un tableur : chaque outil a été pensé pour un usage précis. Voici, pour chacun, à qui il s’adresse et ce que Cantia apporte aux entreprises qui travaillent par projets.',
  tableEyebrow: 'En un coup d’œil',
  tablePlain: 'À chaque outil son usage.',
  tableText: 'Le détail, avec un tableau critère par critère, se trouve dans chaque comparatif.',
  head: ['Outil', 'Pensé pour', 'Avec Cantia'],
  rows: [
    { tool: 'Bexio', slug: 'bexio-vs-cantia-logiciel-batiment', forWhom: 'La comptabilité et la facturation des PME suisses, tous secteurs confondus.', withCantia: 'Connexion native : clients, articles, factures et statuts de paiement synchronisés.' },
    { tool: 'Klara', slug: 'cantia-vs-klara', forWhom: 'La comptabilité et la facturation des indépendants et petites entreprises, tous secteurs.', withCantia: 'Pas de connexion directe. Vos données se reprennent par fichier Excel ou CSV.' },
    { tool: 'Crésus', slug: 'cantia-vs-cresus-facturation', forWhom: 'Une facturation simple et abordable, historiquement sur Windows.', withCantia: 'Pas de connexion directe. Vos données se reprennent par fichier Excel ou CSV.' },
    { tool: 'WinBiz', slug: 'cantia-vs-winbiz', forWhom: 'La comptabilité, la facturation et la gestion des PME, depuis un poste de travail fixe.', withCantia: 'Pas de connexion directe. Vos données se reprennent par fichier Excel ou CSV.' },
    { tool: 'Excel', slug: 'excel-vs-logiciel-gestion-chantier-limites', forWhom: 'Des tableaux souples, à tenir et à recopier à la main.', withCantia: 'Vos fichiers .xlsx, .xls et .csv s’importent directement.' },
  ],
  read: 'Lire le comparatif',
  vs: 'Cantia ou {tool} ?',
  noArticle: 'Comparatif disponible en français',
  cardsEyebrow: 'Les comparatifs détaillés',
  cardsPlain: 'Critère par critère.',
  cardsText: 'Chaque article décrit ce que l’autre outil fait bien, ce qui manque pour un travail par projets, et les cas où les deux se complètent.',
  guideLabel: 'Guide',
  guideTitle: 'Choisir son logiciel de devis et factures',
  guideText: 'Les critères qui comptent vraiment pour une entreprise du bâtiment en Suisse, avant de comparer les fonctions.',
  guideRead: 'Lire le guide',
  importStrong: 'Vous changez d’outil ?',
  importText: 'Contacts, projets, devis, factures et dépenses s’importent depuis un fichier Excel ou CSV. Vos données actuelles ne sont jamais écrasées.',
  importLink: 'Voir comment',
  faqEyebrow: 'Questions fréquentes',
  faqTitle: 'Avant de choisir.',
  faq: [
    { q: 'Cantia remplace-t-il un logiciel de comptabilité ?', a: 'Cantia tient une comptabilité en partie double générée automatiquement à partir des factures, encaissements, dépenses et salaires, avec le décompte TVA et un assistant de bouclement annuel. Votre fiduciaire peut y accéder avec Cantia Accounting. Si vous préférez garder Bexio pour la comptabilité, les deux se synchronisent.' },
    { q: 'Peut-on reprendre ses données d’un autre logiciel ?', a: 'Oui. Exportez vos contacts, projets, devis, factures ou dépenses en Excel ou CSV : Cantia associe les colonnes aux bons champs, vous vérifiez, puis vous importez. Les devis et factures repris gardent leur montant total, pour l’historique.' },
    { q: 'Comment ces comparatifs sont-ils rédigés ?', a: 'Ils sont écrits par l’équipe Cantia, à partir du positionnement public de chaque outil, en indiquant aussi ce qu’il fait bien. Les fonctions évoluent : vérifiez toujours auprès de chaque éditeur avant de choisir.' },
  ],
};

const de: CompareCopy = {
  seoTitle: 'Vergleiche: Cantia, Bexio, Klara, Crésus, WinBiz | Cantia',
  seoDescription: 'Cantia im Vergleich mit Schweizer Verwaltungssoftware und Tabellen: für wen jedes Tool gedacht ist, was es gut macht und wann es zu Cantia passt.',
  crumb: 'Vergleiche',
  eyebrow: 'Vergleiche',
  h1Plain: 'Cantia im Vergleich.',
  h1Accent: 'Ohne Umwege.',
  lead: 'Bexio, Klara, Crésus, WinBiz oder eine Tabelle: Jedes Tool wurde für einen bestimmten Zweck entwickelt. Hier sehen Sie, für wen es gedacht ist und was Cantia Unternehmen bringt, die in Projekten arbeiten.',
  tableEyebrow: 'Auf einen Blick',
  tablePlain: 'Jedes Tool hat seinen Zweck.',
  tableText: 'Die Details mit einer Tabelle Kriterium für Kriterium finden Sie in jedem Vergleich.',
  head: ['Tool', 'Gedacht für', 'Mit Cantia'],
  rows: [
    { tool: 'Bexio', slug: 'bexio-vs-cantia-logiciel-batiment', forWhom: 'Buchhaltung und Fakturierung von Schweizer KMU, branchenübergreifend.', withCantia: 'Native Verbindung: Kunden, Artikel, Rechnungen und Zahlungsstatus werden synchronisiert.' },
    { tool: 'Klara', slug: 'cantia-vs-klara', forWhom: 'Buchhaltung und Fakturierung von Selbständigen und kleinen Unternehmen, alle Branchen.', withCantia: 'Keine direkte Verbindung. Ihre Daten lassen sich per Excel- oder CSV-Datei übernehmen.' },
    { tool: 'Crésus', slug: 'cantia-vs-cresus-facturation', forWhom: 'Einfache und günstige Fakturierung, ursprünglich unter Windows.', withCantia: 'Keine direkte Verbindung. Ihre Daten lassen sich per Excel- oder CSV-Datei übernehmen.' },
    { tool: 'WinBiz', slug: 'cantia-vs-winbiz', forWhom: 'Buchhaltung, Fakturierung und Verwaltung von KMU, an einem festen Arbeitsplatz.', withCantia: 'Keine direkte Verbindung. Ihre Daten lassen sich per Excel- oder CSV-Datei übernehmen.' },
    { tool: 'Excel', slug: 'excel-vs-logiciel-gestion-chantier-limites', forWhom: 'Flexible Tabellen, die von Hand geführt und abgeschrieben werden.', withCantia: 'Ihre .xlsx-, .xls- und .csv-Dateien lassen sich direkt importieren.' },
  ],
  read: 'Zum Vergleich',
  vs: 'Cantia oder {tool}?',
  noArticle: 'Vergleich auf Französisch verfügbar',
  cardsEyebrow: 'Die ausführlichen Vergleiche',
  cardsPlain: 'Kriterium für Kriterium.',
  cardsText: 'Jeder Artikel beschreibt, was das andere Tool gut macht, was für die Arbeit in Projekten fehlt und wann sich beide ergänzen.',
  guideLabel: 'Ratgeber',
  guideTitle: 'Die richtige Software für Offerten und Rechnungen',
  guideText: 'Die Kriterien, die für ein Schweizer Bauunternehmen wirklich zählen, bevor man Funktionen vergleicht.',
  guideRead: 'Zum Ratgeber',
  importStrong: 'Sie wechseln das Tool?',
  importText: 'Kontakte, Projekte, Offerten, Rechnungen und Ausgaben lassen sich aus einer Excel- oder CSV-Datei importieren. Bestehende Daten werden nie überschrieben.',
  importLink: 'So funktioniert es',
  faqEyebrow: 'Häufige Fragen',
  faqTitle: 'Vor der Wahl.',
  faq: [
    { q: 'Ersetzt Cantia eine Buchhaltungssoftware?', a: 'Cantia führt eine doppelte Buchhaltung, die automatisch aus Rechnungen, Zahlungen, Ausgaben und Löhnen entsteht, mit MWST-Abrechnung und einem Assistenten für den Jahresabschluss. Ihre Treuhand greift über Cantia Accounting darauf zu. Wenn Sie Bexio für die Buchhaltung behalten möchten, werden beide synchronisiert.' },
    { q: 'Kann ich meine Daten aus einer anderen Software übernehmen?', a: 'Ja. Exportieren Sie Kontakte, Projekte, Offerten, Rechnungen oder Ausgaben als Excel oder CSV: Cantia ordnet die Spalten den richtigen Feldern zu, Sie prüfen und importieren. Übernommene Offerten und Rechnungen behalten ihren Gesamtbetrag, für den Verlauf.' },
    { q: 'Wie entstehen diese Vergleiche?', a: 'Sie werden vom Cantia-Team geschrieben, auf Grundlage der öffentlichen Positionierung jedes Tools, und nennen auch, was es gut macht. Funktionen entwickeln sich: Prüfen Sie vor der Wahl immer beim jeweiligen Anbieter.' },
  ],
};

const it: CompareCopy = {
  seoTitle: 'Confronti: Cantia, Bexio, Klara, Crésus, WinBiz | Cantia',
  seoDescription: 'Cantia a confronto con i software svizzeri di gestione e il foglio di calcolo: a chi si rivolge ogni strumento, cosa fa bene e quando abbinarlo a Cantia.',
  crumb: 'Confronti',
  eyebrow: 'Confronti',
  h1Plain: 'Cantia a confronto.',
  h1Accent: 'Senza giri di parole.',
  lead: 'Bexio, Klara, Crésus, WinBiz o un foglio di calcolo: ogni strumento è stato pensato per un uso preciso. Ecco, per ciascuno, a chi si rivolge e cosa porta Cantia alle aziende che lavorano per progetti.',
  tableEyebrow: 'In sintesi',
  tablePlain: 'A ogni strumento il suo uso.',
  tableText: 'Il dettaglio, con una tabella criterio per criterio, si trova in ogni confronto.',
  head: ['Strumento', 'Pensato per', 'Con Cantia'],
  rows: [
    { tool: 'Bexio', slug: 'bexio-vs-cantia-logiciel-batiment', forWhom: 'La contabilità e la fatturazione delle PMI svizzere, in tutti i settori.', withCantia: 'Collegamento nativo: clienti, articoli, fatture e stati di pagamento sincronizzati.' },
    { tool: 'Klara', slug: 'cantia-vs-klara', forWhom: 'La contabilità e la fatturazione di indipendenti e piccole aziende, in tutti i settori.', withCantia: 'Nessun collegamento diretto. I vostri dati si riprendono con un file Excel o CSV.' },
    { tool: 'Crésus', slug: 'cantia-vs-cresus-facturation', forWhom: 'Una fatturazione semplice ed economica, storicamente su Windows.', withCantia: 'Nessun collegamento diretto. I vostri dati si riprendono con un file Excel o CSV.' },
    { tool: 'WinBiz', slug: 'cantia-vs-winbiz', forWhom: 'La contabilità, la fatturazione e la gestione delle PMI, da una postazione fissa.', withCantia: 'Nessun collegamento diretto. I vostri dati si riprendono con un file Excel o CSV.' },
    { tool: 'Excel', slug: 'excel-vs-logiciel-gestion-chantier-limites', forWhom: 'Tabelle flessibili, da tenere e ricopiare a mano.', withCantia: 'I vostri file .xlsx, .xls e .csv si importano direttamente.' },
  ],
  read: 'Leggere il confronto',
  vs: 'Cantia o {tool}?',
  noArticle: 'Confronto disponibile in francese',
  cardsEyebrow: 'I confronti dettagliati',
  cardsPlain: 'Criterio per criterio.',
  cardsText: 'Ogni articolo descrive cosa fa bene l’altro strumento, cosa manca per lavorare per progetti e i casi in cui i due si completano.',
  guideLabel: 'Guida',
  guideTitle: 'Scegliere il software per preventivi e fatture',
  guideText: 'I criteri che contano davvero per un’azienda edile in Svizzera, prima di confrontare le funzioni.',
  guideRead: 'Leggere la guida',
  importStrong: 'Cambiate strumento?',
  importText: 'Contatti, progetti, preventivi, fatture e spese si importano da un file Excel o CSV. I dati attuali non vengono mai sovrascritti.',
  importLink: 'Vedere come',
  faqEyebrow: 'Domande frequenti',
  faqTitle: 'Prima di scegliere.',
  faq: [
    { q: 'Cantia sostituisce un software di contabilità?', a: 'Cantia tiene una contabilità in partita doppia generata automaticamente da fatture, incassi, spese e salari, con il rendiconto IVA e un assistente per la chiusura annuale. La vostra fiduciaria vi accede con Cantia Accounting. Se preferite mantenere Bexio per la contabilità, i due si sincronizzano.' },
    { q: 'Si possono riprendere i dati da un altro software?', a: 'Sì. Esportate contatti, progetti, preventivi, fatture o spese in Excel o CSV: Cantia associa le colonne ai campi giusti, voi verificate e importate. Preventivi e fatture ripresi conservano il loro importo totale, per lo storico.' },
    { q: 'Come sono scritti questi confronti?', a: 'Sono scritti dal team Cantia, a partire dal posizionamento pubblico di ogni strumento, indicando anche cosa fa bene. Le funzioni evolvono: verificate sempre presso ogni editore prima di scegliere.' },
  ],
};

export const COMPARE_COPY: Record<Locale, CompareCopy> = { fr, de, it };

// The buyer's guide shown under the comparison cards.
export const COMPARE_GUIDE_SLUG = 'meilleur-logiciel-devis-facture-batiment-suisse-2026';
