import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-peintre-batiment-calcul-surface-suisse',
  question: 'Wie berechnet man Flächen und Preis einer Maler-Offerte im Bauwesen korrekt?',
  title: 'Maler-Offerte im Bauwesen: die Fläche richtig berechnen, um nicht zu tief zu kalkulieren',
  description:
    'Eine falsch berechnete Fläche (vergessene Abzüge, unterschätzte Anzahl Schichten, vernachlässigte Untergrundvorbereitung) ist die Hauptursache für Margenverluste bei Malern im Bauwesen.',
  excerpt:
    'Der Preis pro m² ist einfach anzugeben, aber alles entscheidet sich bei der Berechnung der tatsächlichen Fläche. Genau dort verlieren die meisten Maler-Offerten Marge, ohne dass es jemand bemerkt.',
  category: 'Métiers du bâtiment',
  keywords: ['offerte maler bauwesen', 'flächenberechnung malerarbeiten', 'preis malerarbeiten pro m2 schweiz', 'rechnung selbstständiger maler', 'untergrundvorbereitung malerarbeiten offerte'],
  publishedAt: '2026-09-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein dem Kunden genannter Preis pro m² verbirgt eine implizite Annahme: eine Standardschicht, auf einem bereits vorbereiteten Untergrund, ohne besonderen Abzug. In der Praxis entspricht kaum eine Baustelle genau dieser Annahme, was die häufige Abweichung zwischen unterschriebener Offerte und tatsächlich aufgewendeter Zeit erklärt.',
    },
    { type: 'h2', text: 'Drei Rechenfehler, die die Marge auffressen' },
    {
      type: 'list',
      items: [
        'Öffnungen (Türen, Fenster) nicht abziehen, obwohl sie die tatsächlich zu streichende Fläche verringern und gleichzeitig die Fertigstellungszeit an den Rändern verlängern',
        'Nur eine Schicht einrechnen, obwohl ein Farbtonwechsel oder ein poröser Untergrund oft zwei erfordert',
        'Die Vorbereitungszeit des Untergrunds (Spachteln, Schleifen, Möbelschutz) vergessen, die genauso viel Zeit beanspruchen kann wie das Streichen selbst',
      ],
    },
    {
      type: 'stat',
      value: '30–40 %',
      label: 'Anteil der Gesamtzeit einer Malerbaustelle, der auf die Untergrundvorbereitung statt auf das Streichen selbst entfällt',
    },
    { type: 'h2', text: 'Ein Preis pro m², aber nie ein einheitlicher Preis für alles' },
    {
      type: 'p',
      text: 'Eine glatte, frisch verputzte Wand und eine alte Decke mit Rissen haben in Bezug auf die Vorbereitungszeit nichts gemeinsam, auch wenn sie dieselbe Fläche aufweisen. Die Offerte mit mehreren Tarifen pro m² je nach Zustand des Untergrunds (neu, guter Zustand, zu reparieren) zu strukturieren, schützt die Marge, ohne die Offerte für den Kunden unnötig zu verkomplizieren.',
    },
    {
      type: 'callout',
      title: 'Der Schutz der Baustelle ist nicht gratis',
      text: 'Böden abdecken, Möbel schützen, Abklebeband anbringen: Diese Schutzzeit ist real und muss irgendwo im Preis erscheinen, entweder im Stundensatz integriert oder als separater Posten bei bewohnten Baustellen.',
    },
    {
      type: 'cta',
      title: 'Ein Preiskatalog, der Ihre verschiedenen m²-Tarife bereits unterscheidet',
      text: 'Cantia behält Ihre verschiedenen Tarife (neuer Untergrund, zu reparieren, Anzahl Schichten) im Gedächtnis, um eine korrekte Offerte in wenigen Minuten zu erstellen, statt jede Fläche von Hand neu zu berechnen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Müssen Türen und Fenster von der Flächenberechnung für Malerarbeiten abgezogen werden?',
      answer:
        'Ja für die verrechnete Fläche, aber die Fertigstellungszeit an den Rändern der Öffnungen bleibt real, was einen Tarif rechtfertigt, der die Anzahl der Öffnungen berücksichtigt, nicht nur die Nettofläche.',
    },
    {
      question: 'Wie fakturiert man eine notwendige, aber nicht vorgesehene zweite Farbschicht?',
      answer:
        'Am besten schon in der ursprünglichen Offerte einplanen, je nach Untergrundtyp und geplantem Farbtonwechsel, statt sie erst auf der Baustelle zu entdecken und nachträglich verhandeln zu müssen.',
    },
    {
      question: 'Soll die Schutzzeit der Baustelle separat verrechnet werden?',
      answer:
        'Das ist nicht zwingend, aber empfehlenswert bei bewohnten Baustellen oder mit zu schützenden Möbeln. Diese Zeit ist real und wird oft unterschätzt, wenn sie im Preis pro m² untergeht.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'checklist-cloture-chantier-avant-facturation',
    'devis-facture-facadier-isolation-suisse',
  ],
  relatedTradeSlug: 'peintre',
};
