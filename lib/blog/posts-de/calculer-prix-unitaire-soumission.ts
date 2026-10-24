import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-unitaire-soumission',
  question: 'Wie berechnet man einen korrekten Einheitspreis für ein Leistungsverzeichnis?',
  title: 'Einheitspreise im Leistungsverzeichnis berechnen: die Methode Position für Position',
  description:
    'Arbeit, Material, Maschinen, Gemeinkosten, Risiken und Marge: wie man für jede Position eines Schweizer Leistungsverzeichnisses einen vertretbaren Einheitspreis aufbaut.',
  excerpt:
    'Der Einheitspreis einer Position ist nicht «das, was wir letztes Jahr eingesetzt haben». Er ist eine Berechnung, und die wird für jede Baustelle neu gemacht.',
  category: 'Chantier & rentabilité',
  keywords: ['Einheitspreis Leistungsverzeichnis', 'Einheitspreis berechnen Bau', 'LV kalkulieren', 'Gemeinkosten Baufirma', 'Marge Submission'],
  publishedAt: '2026-10-24',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'In einem Leistungsverzeichnis erwartet jede Position einen Einheitspreis: pro m², m³, Meter, Stück oder pauschal. Multipliziert mit der Menge des Architekten ergibt er den Betrag. Ist der Einheitspreis zu tief, gewinnen Sie den Auftrag und verlieren an jedem verbauten Meter Geld. Ist er zu hoch, verlieren Sie den Auftrag. So bauen Sie ihn auf.',
    },
    { type: 'h2', text: 'Die Bausteine eines Einheitspreises' },
    {
      type: 'list',
      items: [
        'Arbeit: benötigte Zeit pro Einheit × vollständiger Stundensatz (Lohn, Sozialabgaben, Ferien, Feiertage, unproduktive Zeit).',
        'Material: Menge pro Einheit × Einkaufspreis, plus Verlust und Verschnitt.',
        'Maschinen und Werkzeuge: Miete oder Nutzungskosten, auf die Einheit umgelegt.',
        'Gemeinkosten: Büro, Fahrzeuge, Versicherungen, Administration, auf die produktiven Stunden verteilt.',
        'Risiken und Unvorhergesehenes: schwieriger Zugang, Wetter, knappe Fristen, besondere Bestimmungen.',
        'Marge: was dem Unternehmen bleibt, wenn alles bezahlt ist.',
      ],
    },
    { type: 'h2', text: 'Ein Rechenbeispiel' },
    {
      type: 'p',
      text: 'Für ein Backsteinmauerwerk 15 cm pro m², mit einer Leistung von 0,9 Stunden pro m² und einem vollständigen Stundensatz von CHF 78.–:',
    },
    {
      type: 'table',
      headers: ['Element', 'Berechnung', 'CHF / m²'],
      rows: [
        ['Arbeit', '0,9 h × 78.–', '70.20'],
        ['Material', 'Backsteine, Mörtel, 5 % Verlust', '38.50'],
        ['Maschinen', 'Gerüst, Mischer, pro m² umgelegt', '4.80'],
        ['Zwischentotal direkte Kosten', '', '113.50'],
        ['Gemeinkosten 12 %', '113.50 × 12 %', '13.62'],
        ['Marge 8 %', '127.12 × 8 %', '10.17'],
        ['Einheitspreis', '', '137.29'],
      ],
    },
    {
      type: 'callout',
      title: 'Die Zahlen im Beispiel sind Annahmen',
      text: 'Leistungswerte, Stundensatz und Gemeinkostensatz unterscheiden sich stark je nach Unternehmen und Region. Entscheidend ist die Methode: Jeder Ihrer Preise muss sich so aufschlüsseln lassen.',
    },
    { type: 'h2', text: 'Ihr vollständiger Stundensatz, die Schlüsselzahl' },
    {
      type: 'p',
      text: 'Die meisten zu tiefen Preise kommen von einem unterschätzten Stundensatz: Man geht vom Bruttolohn aus und vergisst Abgaben, Ferien, Regentage und Fahrten. Unser Stundensatz-Rechner liefert Ihnen diese Zahl aus Ihren echten Daten.',
    },
    { type: 'h2', text: 'Preise von einem Leistungsverzeichnis zum nächsten wiederverwenden' },
    {
      type: 'p',
      text: 'Dieselbe Position kommt von Baustelle zu Baustelle wieder, mit derselben Nummer, wenn das Leistungsverzeichnis dem NPK folgt. Ein Katalog Ihrer Preise nach Positionsnummer und die Historie dessen, was Sie angeboten haben, sparen Stunden und machen Ihre Angebote einheitlich.',
    },
    {
      type: 'p',
      text: 'Wenn Sie in Cantia ein importiertes Leistungsverzeichnis ausfüllen, werden für jede Position Ihre Katalogpreise und die Preise aus früheren Leistungsverzeichnissen vorgeschlagen. Sie passen an die Baustelle an, und das Original-PDF kommt ausgefüllt zurück. Funktion in der Beta, ab dem Plan Team (3 Leistungsverzeichnisse pro Monat), unbegrenzt im Plan Entreprise.',
    },
    {
      type: 'cta',
      title: 'Ihre Preise, bei jeder Position vorgeschlagen',
      text: 'Importieren Sie das erhaltene Leistungsverzeichnis und kalkulieren Sie mit Ihrem Katalog und Ihrer Historie.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Welchen Gemeinkostensatz soll man anwenden?',
      answer:
        'Er wird aus Ihrer Buchhaltung berechnet: Summe der Kosten, die keiner bestimmten Baustelle zugeordnet sind, geteilt durch das produktive Arbeitsvolumen. Einen allgemeingültigen Satz gibt es nicht; überprüfen Sie ihn jedes Jahr mit dem Jahresabschluss.',
    },
    {
      question: 'Gehören Baustelleninstallationen in die Einheitspreise?',
      answer:
        'Nur wenn das Leistungsverzeichnis keine eigenen Positionen dafür vorsieht. Gibt es Positionen für die Baustelleninstallation, kalkulieren Sie sie dort, sonst bezahlen Sie sie doppelt oder gar nicht.',
    },
    {
      question: 'Wie weiss man, ob ein Einheitspreis richtig war?',
      answer: 'Indem man im Nachhinein die tatsächlich verbrauchten Stunden und das Material mit der ursprünglichen Berechnung vergleicht. Genau dafür ist die Rentabilitätskontrolle pro Baustelle da.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'chantier-complet-peut-etre-en-perte-taux-horaire', 'suivre-rentabilite-chantier-sans-excel'],
  relatedTradeSlug: 'macon',
};
