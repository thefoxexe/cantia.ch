import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'combien-coute-logiciel-gestion-chantier-roi',
  question: 'Was kostet eine Baustellen-Verwaltungssoftware wirklich, und ab wann rechnet sie sich?',
  title: 'Baustellen-Verwaltungssoftware: was sie wirklich kostet, und was sie einbringt',
  description:
    'Der angezeigte Abo-Preis ist nur ein Teil der Rechnung. So lässt sich der tatsächliche Nutzen einer Verwaltungssoftware für ein Bauunternehmen beurteilen, jenseits der monatlichen Kosten.',
  excerpt:
    'Die eigentliche Frage lautet nie «wie viel kostet es pro Monat», sondern «wie viel Verwaltungszeit gewinnt man dadurch zurück». Diese zweite Rechnung verändert die Perspektive komplett.',
  category: 'Comparatifs & outils',
  keywords: ['Kosten Baustellensoftware', 'ROI Bausoftware Schweiz', 'Preis Abo Baubranche', 'Rentabilität digitales Tool', 'Zeitersparnis Verwaltung Baustelle'],
  publishedAt: '2026-07-16',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein monatliches Abo für ein paar Dutzend Franken wirkt auf den ersten Blick leicht zu beurteilen: Das ist in Wirklichkeit trügerisch, denn es sagt nichts über die tatsächliche Zeitersparnis aus, die es bringt. Die richtige Rechnung lautet nicht «wie viel kostet es», sondern «wie viel Verwaltungszeit gewinnt dieses Tool zurück», umgerechnet in Stunden, die der Chef oder ein Mitarbeiter für etwas anderes als Nacherfassung nutzen kann.',
    },
    { type: 'h2', text: 'Was Verwaltungszeit ohne dediziertes Tool kostet' },
    {
      type: 'list',
      items: [
        'Eine bereits erstellte Offerte für einen ähnlichen Kunden noch einmal abtippen, mangels zentralem Preiskatalog',
        'Eine Rechnung anhand von Papiernotizen oder eines WhatsApp-Verlaufs rekonstruieren',
        'Erhaltene Zahlungen manuell mit versendeten Rechnungen abgleichen',
        'Ein altes Dokument oder eine frühere Kundenreferenz in einem überfüllten E-Mail-Postfach suchen',
      ],
    },
    {
      type: 'stat',
      value: '5-8 Std.',
      label: 'wöchentliche Verwaltungszeit, die ein kleines Unternehmen typischerweise zurückgewinnt, wenn Offerten, Rechnungen und Katalog in einem einzigen Tool zentralisiert werden',
    },
    { type: 'h2', text: 'Wie man den echten Return on Investment berechnet' },
    {
      type: 'p',
      text: 'Eine einfache Methode: den aktuellen wöchentlichen Verwaltungsaufwand schätzen, ihn mit dem tatsächlichen Stundensatz der Person multiplizieren, die diese Arbeit erledigt (oft der Chef selbst, dessen Stunde einen hohen Wert hat), und diesen Betrag mit den monatlichen Abo-Kosten vergleichen. In den allermeisten Fällen wird die Rentabilitätsschwelle bereits nach wenigen zurückgewonnenen Stunden pro Monat erreicht, meist schon vor Ende des ersten Nutzungsmonats.',
    },
    {
      type: 'callout',
      title: 'Die wahren versteckten Kosten sind nicht das Tool, sondern das fehlende Tool',
      text: 'Eine falsch erstellte QR-Rechnung, die eine Zahlung verzögert, eine vergessene Offerte, die nie nachgefasst wird, ein schlecht verfolgter Anzahlungsbetrag: Diese unsichtbaren Verluste übersteigen oft, und zwar deutlich, die Kosten eines monatlichen Abos.',
    },
    {
      type: 'cta',
      title: '14 Tage Testphase, um den Nutzen vor der Investition zu prüfen',
      text: 'Cantia lässt sich 14 Tage unter realen Bedingungen testen, inklusive Offerten, QR-Rechnungen und Preiskatalog, was es erlaubt, die zurückgewonnene Zeit konkret zu messen, bevor man sich entscheidet.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie lässt sich beurteilen, ob eine Baustellen-Verwaltungssoftware rentabel ist?',
      answer:
        'Indem man die aktuell wöchentlich verlorene Verwaltungszeit, bewertet zum tatsächlichen Stundensatz der betreffenden Person, mit den monatlichen Abo-Kosten vergleicht. Dabei zeigt sich, dass die Rentabilitätsschwelle fast immer sehr schnell erreicht wird.',
    },
    {
      question: 'Was ist der Hauptnutzen einer Verwaltungssoftware für ein kleines Unternehmen?',
      answer:
        'Die zurückgewonnene Verwaltungszeit: Neu abgetippte Offerten, von Hand rekonstruierte Rechnungen oder manuell abgeglichene Zahlungen sind Aufgaben, die ein dediziertes Tool automatisiert oder zentralisiert.',
    },
    {
      question: 'Braucht es von Anfang an ein kostenpflichtiges Abo?',
      answer:
        'Nicht sofort. Eine 14-tägige Testphase mit den wichtigsten Funktionen (Offerten, Rechnungen, Katalog) erlaubt es oft, den tatsächlichen Nutzen zu messen, bevor man sich für einen kostenpflichtigen Plan entscheidet.',
    },
  ],
  relatedSlugs: [
    'excel-vs-logiciel-gestion-chantier-limites',
    'logiciel-gestion-chantier-independant-seul',
    'bexio-vs-cantia-logiciel-batiment',
  ],
};
