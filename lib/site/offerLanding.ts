// The quote page in German (/de/offerte-erstellen) and Italian
// (/it/creare-preventivo): the page Google should show for « offerte
// erstellen », « offerten programm », « preventivo gratuito »… (SEO audit,
// November 2026). The French quote page stays /solutions/devis. Every claim
// is a feature that exists in Cantia; no figure, no customer, no review.

export type OfferLocale = 'de' | 'it';

export interface OfferLandingCopy {
  seoTitle: string;
  seoDescription: string;
  crumbSoftware: string;
  crumb: string;
  kicker: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  tryCta: string;
  templateCta: string;
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  autoEyebrow: string;
  autoTitle: string;
  autoText: string;
  autoPoints: { title: string; text: string }[];
  contentEyebrow: string;
  contentTitle: string;
  contentIntro: string;
  contentItems: { label: string; text: string }[];
  contentNote: string;
  templateEyebrow: string;
  templateTitle: string;
  templateText: string;
  templateFile: string;
  templateLink: string;
  templateHint: string;
  invoiceEyebrow: string;
  invoiceTitle: string;
  invoiceText: string;
  invoiceLink: string;
  compareEyebrow: string;
  compareTitle: string;
  compareIntro: string;
  compareCols: [string, string, string];
  compareRows: { label: string; values: [string, string, string] }[];
  faqEyebrow: string;
  faqTitle: string;
  faq: { question: string; answer: string }[];
  relatedTitle: string;
  related: { href: string; label: string }[];
  closingTitle: string;
  closingText: string;
}

export const OFFER_LANDING: Record<OfferLocale, OfferLandingCopy> = {
  de: {
    seoTitle: 'Offerte erstellen: Offertenprogramm für Handwerker | Cantia',
    seoDescription:
      'Offerte erstellen in wenigen Minuten: Positionen diktieren, Preise aus Ihrem Katalog, MWST gerechnet, online unterschrieben. Mit gratis Offerte-Vorlage (PDF).',
    crumbSoftware: 'Software',
    crumb: 'Offerte erstellen',
    kicker: 'Offertenprogramm',
    h1Plain: 'Offerte erstellen in wenigen Minuten',
    h1Accent: 'für Schweizer Handwerker.',
    lead:
      'Diktieren oder tippen Sie Ihre Positionen, Cantia übernimmt Ihre Katalogpreise, rechnet die MWST und erstellt ein sauberes PDF. Der Kunde unterschreibt online, und die angenommene Offerte wird mit einem Klick zur QR-Rechnung.',
    tryCta: 'Cantia 14 Tage testen',
    templateCta: 'Gratis Offerte-Vorlage',
    stepsEyebrow: 'In 3 Schritten',
    stepsTitle: 'So erstellen Sie eine Offerte mit Cantia.',
    steps: [
      { title: '1. Kunde und Gegenstand', text: 'Kunde aus Ihren Kontakten wählen oder neu erfassen, Gegenstand der Arbeiten und Baustelle angeben.' },
      { title: '2. Positionen erfassen', text: 'Positionen diktieren oder tippen. Menge, Einheit und Preis kommen aus Ihrem Katalog, Totale und MWST rechnen sich selbst.' },
      { title: '3. Prüfen, senden, unterschreiben lassen', text: 'PDF in Ihren Farben prüfen und per E-Mail senden. Der Kunde unterschreibt online, ohne Konto zu erstellen.' },
    ],
    autoEyebrow: 'Offerten automatisch erstellen',
    autoTitle: 'Was Cantia Ihnen bei jeder Offerte abnimmt.',
    autoText: 'Ein Offertenprogramm lohnt sich erst, wenn es die wiederkehrende Arbeit übernimmt. Das macht Cantia:',
    autoPoints: [
      { title: 'Sprachdiktat', text: 'Arbeit beschreiben wie einem Kollegen, auf der Baustelle oder im Auto. Die Positionen werden daraus erstellt.' },
      { title: 'Ihr Katalog, Ihre Preise', text: 'Jede erkannte Leistung übernimmt den Preis und die Einheit, die Sie schon verwenden.' },
      { title: 'Vorlagen', text: 'Standardpositionen einmal speichern, jede neue Offerte startet damit. Nur noch die Mengen anpassen.' },
      { title: 'Warnung bei Preisabweichung', text: 'Weicht ein Preis vom Katalog ab, meldet Cantia es vor dem Versand.' },
      { title: 'Status im Blick', text: 'Entwurf, versendet, angenommen oder abgelehnt: der Stand jeder Offerte auf einen Blick.' },
    ],
    contentEyebrow: 'Was muss auf eine Offerte?',
    contentTitle: 'Die Angaben einer klaren Offerte in der Schweiz.',
    contentIntro:
      'Das Gesetz schreibt für eine Offerte wenig vor. Damit sie klar, vergleichbar und verbindlich ist, gehören diese Angaben darauf:',
    contentItems: [
      { label: 'Ihr Unternehmen', text: 'Firma, Adresse, Telefon, E-Mail und, wenn Sie mehrwertsteuerpflichtig sind, Ihre UID / MWST-Nummer.' },
      { label: 'Der Kunde', text: 'Name oder Firma und Adresse, dazu die Adresse der Baustelle, falls sie abweicht.' },
      { label: 'Nummer und Datum', text: 'Eine eindeutige Offertnummer und das Ausstellungsdatum, damit Annahme und Rechnung darauf verweisen.' },
      { label: 'Gültigkeitsdauer', text: 'Bis wann die Offerte gilt. Mit Frist bleibt sie bis zum Ablauf verbindlich (Art. 3 OR); ohne Frist gilt sie nur eine angemessene Zeit.' },
      { label: 'Die Leistungen', text: 'Jede Position mit Beschreibung, Menge, Einheit, Einheitspreis und Total.' },
      { label: 'MWST und Totale', text: 'Total exklusive MWST, MWST-Satz (Normalsatz 8,1 %) und Betrag, Total inklusive MWST.' },
      { label: 'Bedingungen', text: 'Zahlungsbedingungen, Anzahlung, was nicht inbegriffen ist und, wenn vereinbart, der Verweis auf die SIA 118.' },
      { label: 'Annahme', text: 'Feld für Ort, Datum und Unterschrift des Kunden.' },
    ],
    contentNote: 'Die Pflichtangaben einer Rechnung für die MWST sind strenger. Cantia übernimmt sie in die Rechnung, wenn die Offerte angenommen ist.',
    templateEyebrow: 'Offerte-Vorlage',
    templateTitle: 'Gratis Offerte-Vorlage als PDF.',
    templateText:
      'Eine leere Vorlage mit allen Angaben von oben: Unternehmen, Kunde, Nummer, Gültigkeit, Positionen, MWST 8,1 %, Bedingungen und Unterschriften. Zum Ausdrucken oder Ausfüllen, ohne Anmeldung.',
    templateFile: '/downloads/offerte-vorlage-handwerker.pdf',
    templateLink: 'Offerte-Vorlage herunterladen (PDF)',
    templateHint: 'Für die erste Offerte reicht die Vorlage. Ab der zehnten rechnet und erinnert Cantia für Sie.',
    invoiceEyebrow: 'Von der Offerte zur QR-Rechnung',
    invoiceTitle: 'Angenommen heisst: fast schon fakturiert.',
    invoiceText:
      'Unterschreibt der Kunde, wird die Offerte mit einem Klick zur Rechnung mit Schweizer QR-Teil, ohne eine Position neu zu erfassen. Anzahlungen und Nachträge bleiben mit der Offerte verbunden.',
    invoiceLink: 'Rechnungen und QR-Rechnung',
    compareEyebrow: 'Offerten vergleichen',
    compareTitle: 'Excel, Online-Generator oder Offertenprogramm?',
    compareIntro: 'Drei Wege, eine Offerte zu schreiben. Ein ehrlicher Vergleich, damit Sie den passenden wählen.',
    compareCols: ['Excel / Word', 'Online-Generator', 'Cantia'],
    compareRows: [
      { label: 'Kosten', values: ['Meist schon vorhanden', 'Oft gratis', 'Ab CHF 39.– / Monat, 14 Tage Testphase'] },
      { label: 'Ihre Preise', values: ['Von Hand kopieren', 'Bei jeder Offerte neu', 'Aus Ihrem Katalog'] },
      { label: 'Totale und MWST', values: ['Formeln pflegen', 'Automatisch', 'Automatisch'] },
      { label: 'Unterschrift des Kunden', values: ['Ausdrucken, scannen', 'Selten', 'Online, ohne Konto'] },
      { label: 'Offerte zur Rechnung', values: ['Neu abtippen', 'Neu abtippen', 'Ein Klick, mit QR-Rechnung'] },
      { label: 'Überblick über alle Offerten', values: ['Ordner und Dateinamen', 'Kaum', 'Status pro Offerte'] },
    ],
    faqEyebrow: 'Häufige Fragen',
    faqTitle: 'Offerte erstellen: Ihre Fragen.',
    faq: [
      {
        question: 'Wie erstelle ich als Handwerker schnell eine Offerte?',
        answer:
          'Mit Vorlagen und einem Preiskatalog: Die wiederkehrenden Positionen sind schon da, Sie passen nur die Mengen an. In Cantia können Sie die Positionen auch diktieren; Preise, Totale und MWST werden automatisch übernommen.',
      },
      {
        question: 'Wie lange ist eine Offerte in der Schweiz gültig?',
        answer:
          'So lange wie die Frist, die Sie darauf angeben (Art. 3 OR). Ohne Frist bleibt der Anbieter nur eine angemessene Zeit gebunden, deshalb gehört ein «Gültig bis» auf jede Offerte.',
      },
      {
        question: 'Muss die MWST auf der Offerte stehen?',
        answer:
          'Für Privatkunden ist ein Total inklusive MWST am klarsten. Sind Sie mehrwertsteuerpflichtig, zeigen Sie Total exklusive MWST, Satz (8,1 %) und Betrag getrennt; so stimmt die spätere Rechnung mit der Offerte überein.',
      },
      {
        question: 'Gibt es eine kostenlose Offerte-Vorlage?',
        answer: 'Ja, auf dieser Seite: eine leere PDF-Vorlage mit allen üblichen Angaben, ohne Anmeldung herunterladbar.',
      },
      {
        question: 'Was kostet das Offertenprogramm von Cantia?',
        answer:
          'Cantia startet ab CHF 39.– pro Monat, mit 14 Tagen Testphase. Offerten und Rechnungen sind auf jedem Plan unbegrenzt.',
      },
    ],
    relatedTitle: 'Weiterlesen',
    related: [
      { href: '/de/blog/sia-118-offerte-pflicht', label: 'SIA 118 in der Offerte: Pflicht oder nicht?' },
      { href: '/de/blog/offerte-gueltigkeitsdauer-schweiz', label: 'Wie lange ist eine Offerte gültig?' },
      { href: '/de/blog/offerte-gratis-oder-kostenpflichtig', label: 'Offerte gratis oder kostenpflichtig?' },
      { href: '/de/blog/nachtragsofferte-mehrkosten', label: 'Nachtragsofferte: Mehr- und Minderkosten' },
    ],
    closingTitle: 'Die nächste Offerte in wenigen Minuten.',
    closingText: '14 Tage Testphase, danach Offerten und Rechnungen ohne Begrenzung auf jedem Plan.',
  },
  it: {
    seoTitle: 'Creare un preventivo: software per artigiani | Cantia',
    seoDescription:
      'Creare un preventivo in pochi minuti: voci dettate, prezzi dal vostro catalogo, IVA calcolata, firma online. Con modello di preventivo gratuito (PDF).',
    crumbSoftware: 'Software',
    crumb: 'Creare un preventivo',
    kicker: 'Software preventivi',
    h1Plain: 'Creare un preventivo in pochi minuti',
    h1Accent: 'per artigiani e imprese edili svizzere.',
    lead:
      'Dettate o digitate le voci, Cantia riprende i prezzi del vostro catalogo, calcola l’IVA e crea un PDF pulito. Il cliente firma online, e il preventivo accettato diventa una fattura QR con un clic.',
    tryCta: 'Provare Cantia 14 giorni',
    templateCta: 'Modello di preventivo gratuito',
    stepsEyebrow: 'In 3 passi',
    stepsTitle: 'Come creare un preventivo con Cantia.',
    steps: [
      { title: '1. Cliente e oggetto', text: 'Scegliete il cliente dai contatti o createlo, indicate l’oggetto dei lavori e il cantiere.' },
      { title: '2. Le voci', text: 'Dettate o digitate le voci. Quantità, unità e prezzo arrivano dal catalogo, totali e IVA si calcolano da soli.' },
      { title: '3. Controllare, inviare, far firmare', text: 'Controllate il PDF nei vostri colori e inviatelo per e-mail. Il cliente firma online, senza creare un conto.' },
    ],
    autoEyebrow: 'Preventivi automatici',
    autoTitle: 'Quello che Cantia fa per voi a ogni preventivo.',
    autoText: 'Un software per preventivi vale la pena solo se toglie il lavoro ripetitivo. Ecco cosa fa Cantia:',
    autoPoints: [
      { title: 'Dettatura vocale', text: 'Descrivete il lavoro come a un collega, in cantiere o in auto. Le voci vengono create da lì.' },
      { title: 'Il vostro catalogo, i vostri prezzi', text: 'Ogni prestazione riconosciuta riprende il prezzo e l’unità che usate già.' },
      { title: 'Modelli', text: 'Salvate una volta le voci ricorrenti, ogni nuovo preventivo parte da lì. Restano solo le quantità.' },
      { title: 'Avviso in caso di scarto', text: 'Se un prezzo si discosta dal catalogo, Cantia lo segnala prima dell’invio.' },
      { title: 'Stato sempre visibile', text: 'Bozza, inviato, accettato o rifiutato: lo stato di ogni preventivo a colpo d’occhio.' },
    ],
    contentEyebrow: 'Cosa deve contenere un preventivo?',
    contentTitle: 'Le indicazioni di un preventivo chiaro in Svizzera.',
    contentIntro: 'La legge impone poco a un preventivo. Perché sia chiaro, confrontabile e vincolante, ci vogliono queste indicazioni:',
    contentItems: [
      { label: 'La vostra impresa', text: 'Ragione sociale, indirizzo, telefono, e-mail e, se assoggettati all’IVA, il numero IDI / IVA.' },
      { label: 'Il cliente', text: 'Nome o ragione sociale e indirizzo, più l’indirizzo del cantiere se è diverso.' },
      { label: 'Numero e data', text: 'Un numero di preventivo univoco e la data, a cui rinviano accettazione e fattura.' },
      { label: 'Validità', text: 'Fino a quando vale il preventivo. Con un termine resta vincolante fino alla scadenza (art. 3 CO); senza termine solo per un tempo ragionevole.' },
      { label: 'Le prestazioni', text: 'Ogni voce con descrizione, quantità, unità, prezzo unitario e totale.' },
      { label: 'IVA e totali', text: 'Totale IVA esclusa, aliquota (normale 8,1 %) e importo, totale IVA inclusa.' },
      { label: 'Condizioni', text: 'Condizioni di pagamento, acconto, cosa non è incluso e, se concordato, il rinvio alla SIA 118.' },
      { label: 'Accettazione', text: 'Spazio per luogo, data e firma del cliente.' },
    ],
    contentNote: 'Le indicazioni obbligatorie di una fattura ai fini IVA sono più severe. Cantia le riporta nella fattura quando il preventivo è accettato.',
    templateEyebrow: 'Modello di preventivo',
    templateTitle: 'Modello di preventivo gratuito in PDF.',
    templateText:
      'Un modello vuoto con tutte le indicazioni qui sopra: impresa, cliente, numero, validità, voci, IVA 8,1 %, condizioni e firme. Da stampare o compilare, senza registrazione.',
    templateFile: '/downloads/modello-preventivo-edilizia.pdf',
    templateLink: 'Scaricare il modello di preventivo (PDF)',
    templateHint: 'Per il primo preventivo basta il modello. Dal decimo, Cantia calcola e ricorda al posto vostro.',
    invoiceEyebrow: 'Dal preventivo alla fattura QR',
    invoiceTitle: 'Accettato vuol dire: quasi già fatturato.',
    invoiceText:
      'Quando il cliente firma, il preventivo diventa una fattura con la parte QR svizzera con un clic, senza ridigitare nessuna voce. Acconti e aggiunte restano legati al preventivo.',
    invoiceLink: 'Fatture e fattura QR',
    compareEyebrow: 'Confrontare le soluzioni',
    compareTitle: 'Excel, generatore online o software per preventivi?',
    compareIntro: 'Tre modi di scrivere un preventivo. Un confronto onesto, per scegliere quello giusto.',
    compareCols: ['Excel / Word', 'Generatore online', 'Cantia'],
    compareRows: [
      { label: 'Costo', values: ['Spesso già disponibile', 'Spesso gratuito', 'Da CHF 39.– / mese, 14 giorni di prova'] },
      { label: 'I vostri prezzi', values: ['Da copiare a mano', 'Da reinserire ogni volta', 'Dal vostro catalogo'] },
      { label: 'Totali e IVA', values: ['Formule da mantenere', 'Automatici', 'Automatici'] },
      { label: 'Firma del cliente', values: ['Stampa e scansione', 'Raramente', 'Online, senza conto'] },
      { label: 'Dal preventivo alla fattura', values: ['Da ridigitare', 'Da ridigitare', 'Un clic, con fattura QR'] },
      { label: 'Visione su tutti i preventivi', values: ['Cartelle e nomi di file', 'Quasi nulla', 'Stato di ogni preventivo'] },
    ],
    faqEyebrow: 'Domande frequenti',
    faqTitle: 'Creare un preventivo: le vostre domande.',
    faq: [
      {
        question: 'Come creare velocemente un preventivo da artigiano?',
        answer:
          'Con modelli e un catalogo dei prezzi: le voci ricorrenti ci sono già, adattate solo le quantità. In Cantia potete anche dettare le voci; prezzi, totali e IVA vengono ripresi automaticamente.',
      },
      {
        question: 'Per quanto tempo è valido un preventivo in Svizzera?',
        answer:
          'Per il termine che vi indicate (art. 3 CO). Senza termine, chi offre resta vincolato solo per un tempo ragionevole: per questo ogni preventivo dovrebbe indicare «valido fino al».',
      },
      {
        question: 'L’IVA deve figurare sul preventivo?',
        answer:
          'Per un cliente privato, il totale IVA inclusa è il più chiaro. Se siete assoggettati, mostrate totale IVA esclusa, aliquota (8,1 %) e importo separati: così la fattura corrisponde al preventivo.',
      },
      {
        question: 'Esiste un modello di preventivo gratuito?',
        answer: 'Sì, su questa pagina: un modello PDF vuoto con tutte le indicazioni abituali, scaricabile senza registrazione.',
      },
      {
        question: 'Quanto costa Cantia per i preventivi?',
        answer: 'Cantia parte da CHF 39.– al mese, con 14 giorni di prova. Preventivi e fatture sono illimitati su ogni piano.',
      },
    ],
    relatedTitle: 'Da leggere',
    related: [
      { href: '/it/blog/norma-sia-118-preventivo', label: 'La norma SIA 118 è obbligatoria su un preventivo?' },
      { href: '/it/blog/validita-preventivo-svizzera', label: 'Per quanto tempo è valido un preventivo?' },
      { href: '/it/blog/preventivo-gratuito-o-a-pagamento', label: 'Preventivo gratuito o a pagamento?' },
      { href: '/it/blog/fatturare-variante-cantiere', label: 'Fatturare una variante durante il cantiere' },
    ],
    closingTitle: 'Il prossimo preventivo in pochi minuti.',
    closingText: '14 giorni di prova, poi preventivi e fatture senza limiti su ogni piano.',
  },
};
