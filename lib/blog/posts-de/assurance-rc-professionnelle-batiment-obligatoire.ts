import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-rc-professionnelle-batiment-obligatoire',
  question: 'Ist die Berufshaftpflichtversicherung im Bauwesen in der Schweiz obligatorisch?',
  title: 'Betriebshaftpflicht im Bauwesen: Obligatorisch oder nicht in der Schweiz?',
  description:
    'Kein einziges Bundesgesetz schreibt die Betriebshaftpflicht für jeden Handwerker vor: Mehrere Kantone und Auftraggeber verlangen sie dennoch faktisch für bestimmte Berufe. Die klare Übersicht.',
  excerpt:
    'Es gibt kein einheitliches Bundesgesetz, das die Betriebshaftpflicht für jeden Handwerker im Bauwesen vorschreibt. Was sie in der Praxis vorschreibt, ist oft der Kanton oder der Auftraggeber, und manchmal ein Schaden, bei dem man zu spät entdeckt, nicht versichert zu sein.',
  category: 'Juridique & normes',
  keywords: ['Betriebshaftpflicht Bauwesen', 'Berufshaftpflicht Bau Schweiz', 'Haftpflichtversicherung Bau', 'obligatorische Versicherung Handwerk', 'Handwerker Versicherung Schweiz'],
  publishedAt: '2026-03-12',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: '«Das ist doch obligatorisch, oder?» Die ehrliche Antwort ist: Es gibt kein einziges Bundesgesetz, das die Betriebshaftpflicht für jeden Handwerker im Bauwesen vorschreibt. Was sie in der Praxis faktisch obligatorisch macht, variiert je nach Kanton, genauem Beruf und oft der Bauherrschaft selbst.',
    },
    { type: 'h2', text: 'Was die Betriebshaftpflicht tatsächlich deckt' },
    {
      type: 'p',
      text: 'Schäden, die Dritten in Ausübung der beruflichen Tätigkeit zugefügt werden (Personen-, Sach-, Vermögensschäden), sowie die Kosten der Rechtsverteidigung in einem Verfahren. Ein durch einen Verlegefehler verursachter Wasserschaden, ein Gerüst, das das Eigentum des Nachbarn beschädigt, ein Rechenfehler, der die Statik gefährdet: genau das ist die Art von Schaden, die diese Versicherung deckt, und die die Baugewährleistung eines Werks nicht auf dieselbe Weise abdeckt.',
    },
    {
      type: 'callout',
      title: 'Wo sie faktisch obligatorisch wird',
      text: 'Mehrere Kantone schreiben sie ausdrücklich für bestimmte reglementierte Bauberufe vor. Architekten und Ingenieure sind praktisch immer dazu verpflichtet. Und selbst ohne direkte gesetzliche Pflicht verlangt sie eine Bauleitung, eine Verwaltung oder eine öffentliche Ausschreibung fast systematisch als Zulassungsbedingung. Sie wird damit faktisch obligatorisch, selbst ohne Gesetzestext, der sie beim Namen nennt.',
    },
    { type: 'h2', text: 'Das Risiko, keine zu haben' },
    {
      type: 'list',
      items: [
        'Ein grosser Schaden ohne Deckung belastet das Vermögen des Einzelunternehmens, nicht nur dessen Liquidität – bei einer Einzelfirma sogar das persönliche Vermögen',
        'Eine Bauleitung, die einen Versicherungsnachweis verlangt, kann eine Offerte ohne diesen ablehnen, noch bevor der Preis überhaupt geprüft wird',
        'Auch manche Lieferanten oder Banken verlangen ihn bei der Eröffnung eines Geschäftskontos oder einer Kreditlinie',
      ],
    },
    { type: 'h2', text: 'Vor der Unterschrift prüfen, nicht nach einem Schaden' },
    {
      type: 'p',
      text: 'Die nützlichste Frage lautet nicht «Bin ich verpflichtet?», sondern «Was riskiere ich tatsächlich, wenn das nicht gedeckt ist?». Bei einem körperlich riskanten Beruf (Gerüstbau, Dach, Erdarbeiten) fällt die Antwort fast immer zugunsten eines Abschlusses aus, ob nun auf dem Papier obligatorisch oder nicht.',
    },
    {
      type: 'cta',
      title: 'Die Baustelle steuern, nicht den Versicherungspapierkram verwalten',
      text: 'Cantia zentralisiert Offerten, Rechnungen und Subunternehmer pro Baustelle, um sich auf die Arbeit zu konzentrieren statt auf die Suche nach dem richtigen Dokument im falschen Moment.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist die Betriebshaftpflicht für jeden Schweizer Handwerker obligatorisch?',
      answer:
        'Nein, es gibt kein einheitliches Bundesgesetz, das sie für alle Bauberufe vorschreibt. Mehrere Kantone verlangen sie jedoch für bestimmte reglementierte Berufe, und zahlreiche Auftraggeber fordern sie systematisch.',
    },
    {
      question: 'Ersetzt die Betriebshaftpflicht die Baugewährleistung einer Baustelle?',
      answer:
        'Nein, es sind zwei unterschiedliche Mechanismen: Die gesetzliche Gewährleistung (Art. 371 OR) deckt Mängel am Werk selbst, die Betriebshaftpflicht deckt Schäden, die Dritten während der Ausführung der Arbeiten zugefügt werden.',
    },
    {
      question: 'Was riskiert ein Unternehmen ohne Betriebshaftpflicht bei einem grossen Schaden?',
      answer:
        'Mangels Zwischenversicherung zur Absorption der Kosten kann das Vermögen des Unternehmens – bei einer Einzelfirma sogar das persönliche Vermögen – direkt zur Deckung der Schäden herangezogen werden.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'sous-traitant-batiment-suisse-contrat-facturation',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
};
