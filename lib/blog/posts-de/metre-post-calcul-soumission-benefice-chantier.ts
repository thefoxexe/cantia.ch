import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'metre-post-calcul-soumission-benefice-chantier',
  question: 'Wie weiss man nach der Baustelle, ob ein Leistungsverzeichnis wirklich Geld eingebracht hat?',
  title: 'Ausmass und Nachkalkulation: Hat sich die Offerte wirklich gelohnt?',
  description:
    'Das LV zeigt, was Sie verkauft haben, das Ausmass, was Sie ausgeführt haben. Der Vergleich pro Position zeigt, wo Sie Geld verdienen und wo Sie verlieren.',
  excerpt:
    'Ein gewonnenes Leistungsverzeichnis ist noch keine rentable Baustelle. Zwischen geänderten Mengen, Leistungswerten und Unvorhergesehenem sagt nur die Nachkalkulation, ob Sie wirklich verdient haben.',
  category: 'Chantier & rentabilité',
  keywords: ['Ausmass Baustelle', 'Nachkalkulation Bau', 'Nachkalkulation Baustelle', 'Ausmass nach Leistungsverzeichnis', 'ausgeführte Mengen', 'Einheitspreis LV'],
  publishedAt: '2026-11-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Wenn Sie ein Leistungsverzeichnis ausfüllen, setzen Sie für jede Position einen Einheitspreis fest, auf Basis der Mengen des Architekten und Ihrer üblichen Leistungswerte. Dann beginnt die Baustelle: Manche Mengen steigen, andere sinken, eine Schalung dauert länger als geplant, eine unvorhergesehene Arbeit kommt dazu. Ohne Nachkalkulation wissen Sie nicht, ob das Leistungsverzeichnis Ihnen Geld eingebracht oder gekostet hat.',
    },
    { type: 'h2', text: 'Leistungsverzeichnis, Ausmass, Nachkalkulation: Wovon reden wir?' },
    {
      type: 'list',
      items: [
        'Das Leistungsverzeichnis (LV): was Sie offeriert haben, mit den Mengen des Dokuments und Ihren Einheitspreisen.',
        'Das Ausmass: die effektiv ausgeführten Mengen auf der Baustelle, Position für Position gemessen oder erfasst.',
        'Die Nachkalkulation: der Vergleich zwischen dem, was Sie verrechnen können, und dem, was jede Position Sie effektiv gekostet hat.',
      ],
    },
    { type: 'h2', text: 'Was das Ausmass bei einem Einheitspreisvertrag ändert' },
    {
      type: 'p',
      text: 'Bei einem Einheitspreisvertrag verrechnen Sie die effektiv ausgeführten Mengen zu den Einheitspreisen des Leistungsverzeichnisses. Braucht die Bodenplatte 46 m³ Beton statt der geplanten 42 m³, verrechnen Sie 46 m³. Das Ausmass dient also zweimal: für die Rechnung und um zu wissen, was jede Position nach Abzug Ihrer Kosten übrig lässt.',
    },
    { type: 'h2', text: 'Die Nachkalkulation Schritt für Schritt' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Gehen Sie vom ausgefüllten Leistungsverzeichnis aus: gleiche Kapitel, gleiche Positionen, gleiche Einheiten.',
        'Erfassen Sie für jede Position die effektiv ausgeführte Menge.',
        'Berechnen Sie das Verrechenbare: ausgeführte Menge × Einheitspreis des LV.',
        'Stellen Sie Ihre effektiven Kosten pro Einheit gegenüber: Stunden zum effektiven Stundensatz, Material, Maschinenmiete, Subunternehmer.',
        'Gewinn der Position = Verrechenbares − (ausgeführte Menge × effektive Kosten pro Einheit). Danach pro Kapitel und für die ganze Baustelle zusammenzählen, ohne den im LV gewährten Rabatt und das Skonto zu vergessen.',
      ],
    },
    { type: 'h2', text: 'Rechenbeispiel mit zwei Positionen' },
    {
      type: 'table',
      headers: ['Position', 'LV', 'Ausgeführt und effektive Kosten', 'Verrechenbar', 'Effektive Kosten', 'Gewinn'],
      rows: [
        ['Beton für Bodenplatte', '42 m³ × CHF 210', '46 m³ × CHF 168', 'CHF 9’660', 'CHF 7’728', 'CHF 1’932'],
        ['Schalung der Wände', '180 m² × CHF 38', '196 m² × CHF 41', 'CHF 7’448', 'CHF 8’036', '− CHF 588'],
      ],
    },
    {
      type: 'p',
      text: 'Über diese zwei Positionen bleibt das Total positiv: CHF 1’344. Trotzdem kostet die Schalung mehr, als sie einbringt. Die Gesamtzahl verdeckt eine Position, die vor dem nächsten Leistungsverzeichnis neu kalkuliert werden muss.',
    },
    {
      type: 'callout',
      title: 'Die Falle: nur auf das Total schauen',
      text: 'Eine Baustelle mit Gewinn kann mehrere Positionen mit Verlust verstecken, ausgeglichen durch eine oder zwei sehr rentable Positionen. Solange die Nachkalkulation beim Total stehen bleibt, bleiben diese Positionen von einem LV zum nächsten falsch kalkuliert.',
    },
    { type: 'h2', text: 'Was tun mit einer Position mit Verlust?' },
    {
      type: 'list',
      items: [
        'Den Leistungswert prüfen: Entspricht die effektiv gebrauchte Zeit pro Einheit derjenigen der Kalkulation?',
        'Den Einheitspreis der Position in Ihrem Katalog für das nächste Leistungsverzeichnis anpassen.',
        'Prüfen, ob der Verlust von einer besonderen Bedingung der Baustelle kommt (Zugang, Höhe, Wetter), die in der Offerte erwähnt werden muss.',
        'Mit den Kosten eines Subunternehmers für diese Art von Arbeit vergleichen.',
      ],
    },
    { type: 'h2', text: 'Und die Arbeiten, die nicht im Leistungsverzeichnis waren?' },
    {
      type: 'p',
      text: 'Eine während der Baustelle hinzugekommene Arbeit hat keinen Preis im Leistungsverzeichnis. Sie muss separat kalkuliert und verrechnet werden, idealerweise vor der Ausführung schriftlich akzeptiert. In der Nachkalkulation zählen ihre Kosten trotzdem: Wird sie nicht verrechnet, schmälert sie direkt den Gewinn der Baustelle.',
    },
    {
      type: 'cta',
      title: 'Die Nachkalkulation in Cantia',
      text: 'Mit dem Modul Ausmass übernehmen Sie das Leistungsverzeichnis der Baustelle mit einem Klick, erfassen ausgeführte Mengen und effektive Kosten und fügen Zusatzarbeiten hinzu. Cantia zeigt Verrechenbares, effektive Kosten, Gewinn und Marge, Position für Position.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Was ist der Unterschied zwischen Leistungsverzeichnis und Ausmass?',
      answer:
        'Das Leistungsverzeichnis enthält, was Sie offeriert haben: vorgesehene Mengen und Einheitspreise. Das Ausmass erfasst die effektiv ausgeführten Mengen auf der Baustelle. Der Vergleich beider, mit Ihren effektiven Kosten, ergibt den Gewinn jeder Position.',
    },
    {
      question: 'Wie berechnet man den Gewinn einer Position?',
      answer:
        'Verrechenbar = ausgeführte Menge × Einheitspreis des LV. Effektive Kosten = ausgeführte Menge × effektive Kosten pro Einheit. Der Gewinn ist die Differenz.',
    },
    {
      question: 'Wann macht man die Nachkalkulation einer Baustelle?',
      answer:
        'Sobald die Mengen bekannt sind, idealerweise schon während der Baustelle, um korrigieren zu können, und spätestens bei der Schlussrechnung, wenn das Ausmass erstellt ist.',
    },
  ],
  relatedSlugs: ['calculer-prix-unitaire-soumission', 'rabais-escompte-tva-ordre-soumission', 'comprendre-soumission-can-positions'],
};
