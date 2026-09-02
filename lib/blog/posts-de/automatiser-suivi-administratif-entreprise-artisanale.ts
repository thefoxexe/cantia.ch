import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'automatiser-suivi-administratif-entreprise-artisanale',
  question: 'Wie automatisiert man den administrativen Alltag eines Handwerksbetriebs?',
  title: 'Administrative Abläufe automatisieren — nicht nur die Rechnungsstellung',
  description:
    'Automatisierung wird gedanklich oft auf den Versand von Rechnungen reduziert. Was darüber hinaus im administrativen Alltag eines Handwerksbetriebs automatisiert werden kann.',
  excerpt:
    'Bei Automatisierung im Bauwesen denkt man meist an Rechnungen. Dabei lässt sich die administrative Verwaltung einer Baustelle, eines Kunden oder eines Teams weit darüber hinaus automatisieren.',
  category: 'Sur-mesure & automatisations',
  keywords: ['administrative abläufe automatisieren handwerk', 'automatisierung verwaltung baubetrieb', 'administrativer aufwand bau reduzieren', 'baustellen kunden verwaltung automatisieren', 'zeit sparen verwaltung handwerker'],
  publishedAt: '2026-08-27',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Automatisierung im Bauwesen wird fast immer mit der Rechnungsstellung gleichgesetzt, dabei geht die administrative Verwaltung eines Handwerksbetriebs weit über eine versendete Rechnung hinaus. Baustellen, Kunden, Team: mehrere dieser Abläufe lassen sich ebenfalls weitgehend automatisieren.',
    },
    { type: 'h2', text: 'Über die Rechnung hinaus: was automatisiert werden kann' },
    {
      type: 'list',
      items: [
        'Die automatische Erstellung eines Baustellenrapports aus bereits vorhandenen Fotos und Notizen',
        'Die automatische Ablage von Dokumenten (Bescheinigungen, Versicherungen von Subunternehmern) pro Baustelle',
        'Die automatische Aktualisierung des Baustellenstatus anhand des vom Team erfassten Fortschritts',
        'Die automatische Warnung, wenn ein Pflichtdokument (z. B. eine Versicherungsbescheinigung) abläuft',
      ],
    },
    {
      type: 'stat',
      value: '2–4h',
      label: 'wöchentlicher Zeitaufwand, der in einem kleinen Bauunternehmen ohne Automatisierung üblicherweise für das manuelle Ablegen und Formatieren administrativer Dokumente aufgewendet wird',
    },
    { type: 'h2', text: 'Die nützlichste Automatisierung ist oft die unauffälligste' },
    {
      type: 'p',
      text: 'Die Automatisierungen, die am meisten Zeit sparen, sind in der Regel nicht sichtbar (ein Rapport, der sich im Hintergrund von selbst erstellt, ein Dokument, das automatisch am richtigen Ort abgelegt wird) — statt spektakulärer Funktionen, die im Alltag selten genutzt werden.',
    },
    {
      type: 'callout',
      title: 'Automatisierte Verwaltung nützt auch der Kundenbeziehung',
      text: 'Ein Kunde, der einen sauber aufbereiteten Baustellenrapport ohne manuelle Verzögerung erhält, nimmt die Professionalität des Unternehmens direkt wahr.',
    },
    {
      type: 'cta',
      title: 'Automatisierte Verwaltung, von der Baustelle bis zum Kunden',
      text: 'Cantia automatisiert die Erstellung von Rapporten, die Dokumentenablage und Erinnerungen, um im Alltag administrative Zeit freizusetzen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Beschränkt sich Automatisierung im Bauwesen auf die Rechnungsstellung?',
      answer:
        'Nein: Auch die umfassendere administrative Verwaltung (Baustellenrapporte, Dokumentenablage, Ablauferinnerungen) lässt sich weitgehend automatisieren.',
    },
    {
      question: 'Welche Art von Automatisierung spart im Alltag üblicherweise am meisten Zeit?',
      answer:
        'Unauffällige, im Hintergrund laufende Automatisierungen (Erstellung von Rapporten, automatische Ablage) — statt sichtbarerer, aber selten genutzter Funktionen.',
    },
    {
      question: 'Profitieren auch die Kunden von einer automatisierten Verwaltung?',
      answer:
        'Ja, denn ein rasch und sauber erstellter Baustellenrapport ohne manuelle Verzögerung stärkt direkt das professionelle Bild, das der Kunde vom Unternehmen hat.',
    },
  ],
  relatedSlugs: [
    'automatiser-rappels-relances-entreprise',
    'automatiser-taches-repetitives-entreprise-sans-developpeur',
    'photos-chantier-preuve-juridique-litige',
  ],
};
