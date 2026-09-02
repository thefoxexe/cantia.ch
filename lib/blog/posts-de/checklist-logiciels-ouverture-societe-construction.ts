import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-logiciels-ouverture-societe-construction',
  question: 'Gibt es eine Checkliste für die Software, die bei der Gründung eines Bauunternehmens eingerichtet werden sollte?',
  title: 'Software-Checkliste für die Gründung eines Bauunternehmens',
  description:
    'Eine konkrete, geordnete Liste der digitalen Werkzeuge, die bei der Gründung eines Bauunternehmens eingerichtet werden sollten, ohne etwas zu vergessen oder sich unnötig auszustatten.',
  excerpt:
    'Zwischen dem Handelsregistereintrag und der ersten Baustelle bleibt nur ein kurzes Zeitfenster, um die digitalen Werkzeuge einzurichten. Da hilft eine Checkliste mehr als Improvisation.',
  category: 'Comparatifs & outils',
  keywords: ['software checkliste gründung bauunternehmen', 'werkzeuge liste firmengründung bau', 'software vorbereiten vor erster baustelle', 'digitales setup neues bauunternehmen', 'software schritte firmengründung'],
  publishedAt: '2026-08-01',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Zwischen der offiziellen Gründung eines Bauunternehmens und der ersten fakturierten Baustelle drängt oft die Zeit. Eine klare Checkliste verhindert, in Eile improvisieren zu müssen — oder schlimmer, eine Lücke erst zu entdecken, wenn der erste Kunde schon wartet.',
    },
    { type: 'h2', text: 'Die Checkliste, der Reihe nach' },
    {
      type: 'list',
      items: [
        '1. Ein Offerten-/Rechnungswerkzeug wählen und einrichten, mit den korrekten Bankangaben und dem richtigen MWST-Satz',
        '2. Einen Basis-Preiskatalog für die häufigsten Leistungen des Unternehmens erstellen',
        '3. Ein Mittel zur Dokumentation der Baustellen einrichten (Fotos, Fortschritt)',
        '4. Den vollständigen mobilen Zugriff prüfen, um nicht von einem festen Büro abhängig zu sein',
        '5. Einen Speicherplatz vorsehen, um rechtliche und vertragliche Dokumente ab der ersten Baustelle zu archivieren',
      ],
    },
    {
      type: 'stat',
      value: '< 1 Tag',
      label: 'in der Regel benötigte Zeit, um ein grundlegendes Verwaltungswerkzeug (Angaben, Anfangs-Preiskatalog) vor der ersten Offerte einzurichten',
    },
    { type: 'h2', text: 'Nicht auf den ersten Kunden warten, um das Werkzeug zu testen' },
    {
      type: 'p',
      text: 'Eine fiktive Offerte oder eine Testrechnung vor dem offiziellen Start zu erstellen, hilft, Anpassungspunkte (Layout, fehlende Angaben) zu erkennen, ohne dass ein echter Kunde davon betroffen ist.',
    },
    {
      type: 'callout',
      title: 'Der Preiskatalog entsteht besser schrittweise',
      text: 'Man braucht am ersten Tag keinen vollständigen Katalog. Ihn im Verlauf der ersten Offerten, Leistung für Leistung, zu ergänzen, ist realistischer, als alles auf einmal vorwegzunehmen.',
    },
    {
      type: 'cta',
      title: 'Bereit zu fakturieren ab der ersten Nutzung',
      text: 'Cantia lässt sich in wenigen Minuten einrichten (Angaben, Preiskatalog, erste Offerten) — noch bevor der erste Kunde kommt.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Was ist der erste Software-Schritt bei der Gründung eines Bauunternehmens?',
      answer:
        'Ein Offerten-/Rechnungswerkzeug mit den korrekten Bankangaben und dem richtigen MWST-Satz einrichten, noch bevor ein vollständiger Preiskatalog erstellt wird.',
    },
    {
      question: 'Braucht es einen vollständigen Preiskatalog bereits bei der Firmengründung?',
      answer:
        'Nein: Er kann schrittweise aufgebaut werden, Leistung für Leistung, im Verlauf der ersten echten Offerten, statt vollständig im Voraus vorbereitet zu werden.',
    },
    {
      question: 'Ist es sinnvoll, das Werkzeug vor dem ersten echten Kunden zu testen?',
      answer:
        'Ja, eine Test-Offerte oder -Rechnung zu erstellen hilft, nötige Anpassungen zu erkennen, ohne einen echten Kunden zu betreffen.',
    },
  ],
  relatedSlugs: [
    'checklist-ouverture-chantier-artisan',
    'demarrer-entreprise-batiment-outils-indispensables',
    'quel-logiciel-choisir-demarrer-entreprise-construction',
  ],
};
