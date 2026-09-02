import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-cloture-chantier-avant-facturation',
  question: 'Was ist vor dem Abschluss einer Baustelle und dem Versand der Schlussrechnung zu prüfen?',
  title: 'Checkliste für das Bauende: was vor dem Versand der Schlussrechnung zu prüfen ist',
  description:
    'Eine zu schnell versendete Schlussrechnung, ohne dokumentierte Abnahme oder Überprüfung der Kalkulation, öffnet die Tür für vermeidbare Beanstandungen. Hier die Punkte, die vor dem Abschluss zu prüfen sind.',
  excerpt:
    'Die Schlussrechnung ist nicht einfach das letzte Dokument der Baustelle: Sie ist es, das die Kundenbeziehung festschreibt. Besser mit Methode vorbereiten, als sie später korrigieren zu müssen.',
  category: 'Chantier & rentabilité',
  keywords: ['checkliste bauende', 'baustelle abschliessen', 'schlussrechnung bau', 'prüfung vor rechnungsstellung', 'ende der bauarbeiten'],
  publishedAt: '2026-06-10',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Schlussrechnung einer Baustelle ist nicht nur das letzte Verwaltungsdokument. Sie ist es, das die Beziehung zum Kunden festschreibt, die Garantiefrist auslöst und häufig das Dossier abschliesst. Sie ohne strukturierte Prüfung zu versenden öffnet die Tür für vermeidbare Fehler: vergessene Zusatzarbeiten, falsch abgezogene Anzahlung, nicht dokumentierte Abnahme.',
    },
    { type: 'h2', text: 'Vor dem Versand der Schlussrechnung' },
    {
      type: 'list',
      items: [
        'Abnahme der Arbeiten durchgeführt und dokumentiert (Protokoll oder datierter Fotorapport)',
        'Alle während der Bauzeit akzeptierten Zusatzarbeiten korrekt in die Schlussabrechnung integriert',
        'Bereits geleistete Anzahlungen korrekt vom Schlussbetrag abgezogen',
        'Bei der Abnahme festgestellte allfällige Mängel notiert und, falls nötig, vor der Fakturierung des Restbetrags behandelt',
        'Betrag, MWST und QR-Rechnungs-Angaben ein letztes Mal vor dem Versand geprüft',
      ],
    },
    { type: 'h2', text: 'Nach dem Versand' },
    {
      type: 'list',
      items: [
        'Eine Garantiehinweis an den Kunden gesendet, mit Beginn- und Enddatum der geltenden Frist',
        'Das vollständige Baustellendossier archiviert (Offerte, Rechnungen, Fotos, Korrespondenz) als künftige Referenz',
        'Ein allfälliger Garantierückbehalt mit dem vorgesehenen Freigabedatum notiert',
      ],
    },
    {
      type: 'callout',
      title: 'Eine zu schnell versendete Schlussrechnung kostet oft mehr als ein Tag Verzögerung',
      text: 'Vergessene Zusatzarbeiten oder eine falsch abgezogene Anzahlung schlagen sich direkt in verlorenem Geld nieder, während wenige Minuten strukturierter Prüfung diesen Verlust fast immer vermeiden.',
    },
    {
      type: 'cta',
      title: 'Ein vollständiges Baustellendossier, bereit für die Schlussrechnung',
      text: 'Cantia verknüpft Offerte, Anzahlungen, Zusatzarbeiten und Fotos mit derselben Baustelle, sodass sich die Schlussrechnung vorbereiten lässt, ohne den Verlauf von Hand zu rekonstruieren.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum sollte man die Abnahme vor dem Versand der Schlussrechnung dokumentieren?',
      answer:
        'Weil sie die Garantiefrist auslöst und die festgestellten Mängel festschreibt. Ohne datiertes Dokument wird dieser Moment im Streitfall unmöglich zu beweisen.',
    },
    {
      question: 'Was riskiert man, wenn Zusatzarbeiten in der Schlussabrechnung vergessen werden?',
      answer:
        'Einen direkten finanziellen Verlust, wenn die Abrechnung sie nicht enthält, sowie Schwierigkeiten, sie im Nachhinein einzufordern, sobald die Schlussrechnung versendet und akzeptiert wurde.',
    },
    {
      question: 'Muss das Baustellendossier nach der Schlussrechnung archiviert werden?',
      answer:
        'Ja, ein vollständiges Dossier (Offerte, Rechnungen, Fotos, Korrespondenz) bleibt während der gesamten Garantiefrist und darüber hinaus nützlich, falls es zu einem Streitfall oder einer späteren Kundenanfrage kommt.',
    },
  ],
  relatedSlugs: [
    'checklist-ouverture-chantier-artisan',
    'reception-travaux-proces-verbal-chantier',
    'avenant-chantier-plus-value-moins-value',
  ],
};
