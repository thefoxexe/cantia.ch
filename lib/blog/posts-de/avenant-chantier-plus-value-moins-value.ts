import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'avenant-chantier-plus-value-moins-value',
  question: 'Wie stellt man einen Nachtrag (Mehr- oder Minderleistung) während der Bauzeit in Rechnung?',
  title: 'Einen Nachtrag während der Bauzeit fakturieren, ohne in die Falle zu tappen',
  description:
    'Ein Kunde, der eine Änderung während der Bauzeit verlangt, unterschreibt so gut wie nie im Moment selbst einen schriftlichen Nachtrag. Genau das macht aus einer erbrachten Leistung Gratisarbeit.',
  excerpt:
    '«Wenn Sie schon dabei sind, machen Sie doch gleich noch das»: der lukrativste Satz, den man auf einer Baustelle hören kann — und der gefährlichste, wenn man ihn nicht richtig fakturiert.',
  category: 'Devis & facturation',
  keywords: ['nachtrag baustelle', 'mehrleistung minderleistung', 'zusatzarbeiten fakturieren', 'offerte änderung bau', 'nachtrag offerte schweiz'],
  publishedAt: '2026-04-27',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: '«Wenn Sie schon da sind, könnten Sie auch noch …». Das ist der Satz, mit dem die Hälfte aller Baustellen-Nachträge beginnt — fast immer mündlich, fast immer ohne dass ein neuer Preis klar vereinbart wird, bevor die Arbeit beginnt.',
    },
    { type: 'h2', text: 'Die Mehrleistung: vorher fakturieren, nicht nachher' },
    {
      type: 'p',
      text: 'Eine Zusatzarbeit, die ohne vorherige Preisabsprache ausgeführt wird, bringt das Unternehmen bei der Rechnungsstellung in eine schwache Position: Der Kunde erfährt den Betrag erst im Nachhinein, ohne ihn vorher einschätzen zu können, und fast immer entsteht in diesem Moment eine ungünstige Verhandlung. Die einfache Regel: Ein Nachtrag, auch kurz und informell, wird beziffert und bestätigt, bevor die Zusatzarbeit beginnt. Eine schriftliche Nachricht mit dem Preis genügt — kein aufwendiges mehrseitiges Dokument nötig.',
    },
    {
      type: 'callout',
      title: 'Die Falle des «das dauert nicht lange»',
      text: 'Eine kleine, nicht fakturierte Mehrleistung wird heute zu einem stillen Präzedenzfall: Der Kunde gewöhnt sich an kostenlose Anpassungen, und die nächste (grössere) Anfrage kommt mit derselben stillschweigenden Erwartung. Systematisches Fakturieren, auch bei kleinen Beträgen, hält die Referenz für den Rest der Baustelle klar.',
    },
    { type: 'h2', text: 'Die Minderleistung: genauso wichtig zu dokumentieren' },
    {
      type: 'p',
      text: 'Ein Kunde, der eine im ursprünglichen Offert vorgesehene Leistung streicht (auf eine Ausführung verzichtet, eine Fläche reduziert), muss den entsprechenden Betrag klar abgezogen sehen. Dieser Abzug muss aber ebenfalls schriftlich festgehalten werden, mit dem neuen Gesamtbetrag. Ohne diese Spur wird eine spätere Anfechtung des Schlussbetrags zu einem vermeidbaren Streitpunkt.',
    },
    { type: 'h2', text: 'Was ein Nachtrag immer festhalten sollte' },
    {
      type: 'list',
      items: [
        'Die genaue Beschreibung dessen, was sich ändert (Zusatz oder Streichung) gegenüber der ursprünglichen Offerte',
        'Der genaue Betrag der Mehr- oder Minderleistung, separat beziffert',
        'Die allfällige Auswirkung auf den Liefertermin, falls die Änderung eine solche hat',
        'Der ausdrückliche Bezug auf die ursprüngliche Offerte, die er ändert',
      ],
    },
    {
      type: 'p',
      text: 'Bei einer Baustelle mit mehreren aufeinanderfolgenden Nachträgen vermeidet die Aufzeichnung jedes einzelnen auch eine häufige Verwirrung am Ende der Baustelle: bei der Schlussrechnung alle angesammelten Anpassungen ohne klares Referenzdokument für jede einzelne rekonstruieren zu müssen.',
    },
    {
      type: 'cta',
      title: 'Ein Nachtrag, beziffert und in wenigen Minuten versendet',
      text: 'Cantia ermöglicht es, rasch einen mit der ursprünglichen Offerte verknüpften Nachtrag zu erstellen, mit automatisch neu berechnetem Gesamtbetrag, und ihn an den Kunden zu senden, bevor die Zusatzarbeit beginnt.',
      buttonLabel: 'Das Offerten-Modul entdecken',
    },
  ],
  faq: [
    {
      question: 'Muss eine kleine, während der Bauzeit verlangte Mehrleistung fakturiert werden?',
      answer:
        'Ja, systematisch, auch bei einem kleinen Betrag: Das hält eine klare Referenz aufrecht und verhindert, dass sich der Kunde an kostenlose Anpassungen gewöhnt.',
    },
    {
      question: 'Wann muss der Preis eines Nachtrags bestätigt werden?',
      answer:
        'Bevor die Zusatzarbeit beginnt, nicht danach. Eine schriftliche Nachricht mit dem Preis genügt, um die Vereinbarung ohne aufwendiges formelles Dokument abzusichern.',
    },
    {
      question: 'Muss eine Minderleistung ebenfalls schriftlich dokumentiert werden?',
      answer:
        'Ja: Der Abzug und der neue Gesamtbetrag müssen klar festgehalten werden, um jede spätere Anfechtung des Schlussbetrags zu vermeiden.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
