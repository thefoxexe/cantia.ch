import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-chantier-tous-risques-ectr-obligatoire',
  question: 'Ist die Bauwesenversicherung (ECTR) obligatorisch, und wer muss sie abschliessen?',
  title: 'Bauwesenversicherung (ECTR): Obligatorisch oder nicht, und wer bei einem Schaden zahlt',
  description:
    'Im Gegensatz zur Betriebshaftpflicht wird die ECTR durch kein Bundesgesetz vorgeschrieben, doch ihr Fehlen kann bei einem Schaden vor der Abnahme sehr teuer werden. Wer sie in der Praxis abschliesst und warum.',
  excerpt:
    'Ein Wasserschaden, der eine laufende Baustelle zerstört, ein Brand, ein Diebstahl von bereits verbautem Material: Ohne ECTR wird aus der Frage «Wer zahlt» schnell ein Konflikt zwischen Bauherrschaft und Unternehmern.',
  category: 'Juridique & normes',
  keywords: ['Bauwesenversicherung Schweiz', 'ECTR Bauversicherung', 'Versicherung Baustellenschaden', 'Schaden laufende Baustelle', 'Bauversicherung Werkvertrag'],
  publishedAt: '2026-08-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Bauwesenversicherung (ECTR, für Entreprise de Construction Tous Risques) deckt Sachschäden am Bauwerk während der Bauphase, vor dessen Abnahme: Brand, Wasserschaden, Sturm, Diebstahl von bereits verbautem Material, sogar unfallbedingte Ausführungsfehler. Im Gegensatz zur Betriebshaftpflicht schreibt kein Bundesgesetz sie vor, doch ihr Fehlen setzt sämtliche Beteiligte einem unverhältnismässigen finanziellen Risiko aus.',
    },
    { type: 'h2', text: 'Wer sie in der Praxis abschliesst' },
    {
      type: 'p',
      text: 'In der Regel schliesst die Bauherrschaft eine ECTR für die gesamte Baustelle ab, zugunsten aller Beteiligten (Architekt, Unternehmen, Subunternehmer). Bei kleineren Baustellen schliessen manche Generalunternehmer oder Hauptunternehmer sie selbst ab und verrechnen die Prämie in ihrer Gesamtofferte.',
    },
    {
      type: 'list',
      items: [
        'Vor Baubeginn prüfen, wer die ECTR abgeschlossen hat, und nie ohne schriftliche Bestätigung von ihrem Bestehen ausgehen',
        'Ein Vertrag, der keine ECTR erwähnt, lässt jeden Beteiligten für sein eigenes Werk im Schadensfall ungeschützt',
        'Die ECTR ersetzt nie die Betriebshaftpflicht des Unternehmers, die ein ganz anderes Risiko abdeckt (ein durch Verschulden verursachter Schaden bei einem Dritten)',
      ],
    },
    {
      type: 'callout',
      title: 'Ohne ECTR fällt ein Schaden vor der Abnahme oft auf den Unternehmer zurück',
      text: 'Solange das Werk nicht abgenommen ist, bleibt der Unternehmer dafür verantwortlich. Ein Brand oder Wasserschaden, der eine laufende Baustelle zerstört, kann ohne ECTR daher einen echten Verlust für das ausführende Unternehmen bedeuten.',
    },
    {
      type: 'cta',
      title: 'Den Zustand der Baustelle vor jedem Schaden dokumentieren',
      text: 'Die Baustellenrapporte von Cantia, mit geolokalisierten und zeitgestempelten Fotos, liefern eine wertvolle faktische Grundlage für jede Schadensmeldung, sei es für die ECTR oder die Betriebshaftpflicht.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist die ECTR in der Schweiz obligatorisch?',
      answer:
        'Nein, kein Bundesgesetz schreibt sie vor, doch ihr Fehlen setzt die Baustellenbeteiligten bei einem Schaden vor der Abnahme stark aus, und manche Bauherrschaften verlangen sie vertraglich.',
    },
    {
      question: 'Wer schliesst die Bauwesenversicherung in der Regel ab?',
      answer:
        'Meist die Bauherrschaft, zugunsten aller Baustellenbeteiligten. Bei kleineren Projekten kann jedoch auch das Hauptunternehmen sie selbst abschliessen.',
    },
    {
      question: 'Ersetzt die ECTR die Betriebshaftpflicht des Unternehmers?',
      answer:
        'Nein, es handelt sich um zwei unterschiedliche Deckungen: Die ECTR deckt Sachschäden an der Baustelle selbst, die Betriebshaftpflicht deckt Schäden, die einem Dritten durch Verschulden des Unternehmers entstehen.',
    },
  ],
  relatedSlugs: [
    'assurance-rc-professionnelle-batiment-obligatoire',
    'reception-travaux-proces-verbal-chantier',
    'defaut-construction-decouvert-apres-reception-qui-paie',
  ],
};
