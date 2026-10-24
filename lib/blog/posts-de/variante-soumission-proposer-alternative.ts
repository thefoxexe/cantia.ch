import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'variante-soumission-proposer-alternative',
  question: 'Kann man bei einer Submission eine Variante anbieten, ohne ausgeschlossen zu werden?',
  title: 'Eine Unternehmervariante anbieten, ohne das eigene Angebot zu gefährden',
  description:
    'Sie kennen eine günstigere oder schnellere Lösung als die des Architekten? So bieten Sie sie als Variante an, neben einem vollständigen Grundangebot, bei privaten wie öffentlichen Aufträgen.',
  excerpt:
    'Die Lösung des Architekten durch die eigene zu ersetzen, riskiert den Ausschluss. Sie daneben anzubieten, zeigt Ihr Fachwissen.',
  category: 'Croissance & acquisition',
  keywords: ['Unternehmervariante', 'Variante öffentliche Beschaffung', 'Alternative Architekt vorschlagen', 'Submission Bau Schweiz'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Beim Lesen eines Leistungsverzeichnisses sehen Sie oft eine bessere Lösung: ein anderes Produkt, eine schnellere Ausführung, ein dauerhafteres Detail. Die Versuchung ist gross, direkt Ihre Lösung zu kalkulieren. Das ist der sicherste Weg, Ihr Angebot mit den anderen unvergleichbar zu machen.',
    },
    { type: 'h2', text: 'Die Regel: vollständiges Grundangebot, Variante daneben' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Füllen Sie alle Positionen des Leistungsverzeichnisses so aus, wie sie formuliert sind: Das ist Ihr Grundangebot, vergleichbar mit den anderen.',
        'Beschreiben Sie die Variante separat: was sich ändert, welche Positionen betroffen sind, die Preisdifferenz (mehr oder weniger) und die Auswirkung auf die Frist.',
        'Halten Sie klar fest, dass das Grundangebot gültig bleibt, wenn die Variante nicht gewählt wird.',
      ],
    },
    { type: 'h2', text: 'Bei einem öffentlichen Auftrag' },
    {
      type: 'p',
      text: 'Das Schweizer Beschaffungsrecht lässt Varianten zusätzlich zum Angebot für das ausgeschriebene Projekt grundsätzlich zu, ausser die Vergabestelle hat sie in der Ausschreibung eingeschränkt oder ausgeschlossen. Lesen Sie also die Bedingungen: Sind Varianten ausgeschlossen, bieten Sie keine an; sind sie zugelassen, bleibt das vollständige Grundangebot unerlässlich.',
    },
    {
      type: 'callout',
      title: 'Eine gut präsentierte Variante ist ein Argument',
      text: 'Eine klare Seite mit der bezifferten Einsparung und den betroffenen Positionen zeigt der Bauherrschaft, dass Sie das Thema beherrschen. Bei ähnlichen Preisen macht oft genau das den Unterschied.',
    },
    { type: 'h2', text: 'Bei einem privaten Auftrag' },
    {
      type: 'p',
      text: 'Der Architekt ist meist offen für Vorschläge, vor allem wenn sie Kosten oder Frist senken. Es gilt dasselbe Prinzip: Reichen Sie das vollständige Leistungsverzeichnis ein und legen Sie die Variante bei. Ein Anruf vor Ablauf der Frist zeigt manchmal, ob sie eine Chance hat.',
    },
    { type: 'h2', text: 'Mit Cantia (Beta)' },
    {
      type: 'p',
      text: 'Sie füllen das Grundangebot mit Cantia direkt im Original-PDF aus und können das Leistungsverzeichnis danach duplizieren, um Ihre Variante zu kalkulieren, ohne das Grundangebot anzutasten. Funktion in der Beta: 1 zum Testen im Plan Basis, 3 pro Monat im Plan Team, unbegrenzt im Plan Entreprise.',
    },
    {
      type: 'cta',
      title: 'Das Grundangebot in wenigen Minuten ausgefüllt',
      text: 'So bleibt Zeit für die Variante, die den Unterschied macht.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Darf man ein vorgeschriebenes Produkt durch ein gleichwertiges ersetzen?',
      answer:
        'Nur wenn das Leistungsverzeichnis es erlaubt (Vermerk «oder gleichwertig») oder als Variante neben dem Grundangebot. Stillschweigend ersetzen macht das Angebot unvergleichbar.',
    },
    {
      question: 'Darf eine Variante teurer sein als das Grundangebot?',
      answer: 'Ja, wenn sie etwas anderes bringt: Dauerhaftigkeit, Frist, Unterhalt. Erklären Sie klar, was die Bauherrschaft dafür gewinnt.',
    },
    {
      question: 'Sind Varianten bei öffentlichen Aufträgen immer zugelassen?',
      answer: 'Nein. Sie sind grundsätzlich zugelassen, aber die Vergabestelle kann sie in der Ausschreibung einschränken oder ausschliessen. Massgebend sind die Bedingungen der Ausschreibungsunterlagen.',
    },
  ],
  relatedSlugs: ['repondre-appel-offres-public-batiment-etapes', 'appel-offres-marches-publics-batiment-suisse', 'remplir-soumission-pdf-architecte'],
};
