import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'photos-chantier-preuve-juridique-litige',
  question: 'Wie können Baustellenfotos im Streitfall als Beweismittel dienen?',
  title: 'Baustellenfotos: das stärkste Beweismittel, wenn richtig aufgenommen',
  description:
    'Sofern datiert, kontextualisiert und korrekt aufbewahrt, gilt ein Baustellenfoto vor einem Schweizer Zivilgericht als Beweismittel. Ein Foto allein, ohne diese Elemente, ist deutlich weniger wert.',
  excerpt:
    'Ein zum richtigen Zeitpunkt aufgenommenes Foto kann einen Garantiestreit mit einem einzigen Beleg beenden. Dasselbe Foto ohne Datum und Kontext ist vor Gericht fast wertlos.',
  category: 'Chantier & rentabilité',
  keywords: ['baustellenfotos beweismittel', 'foto rechtsstreit bau', 'garantie bau beweis', 'geolokalisierung baustellenfoto', 'baustellendokumentation schweiz'],
  publishedAt: '2026-05-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Kunde bestreitet acht Monate nach der Abnahme den Zustand einer Wand vor Baubeginn. Ein Unternehmen mit einem datierten Foto genau dieses Bereichs, aufgenommen am ersten Baustellentag, klärt den Streit in wenigen Sekunden. Ein Unternehmen ohne dieses Foto steckt in einer Aussage-gegen-Aussage-Situation fest, was im Streitfall die schwächstmögliche Position ist.',
    },
    { type: 'h2', text: 'Was ein Foto als Beweismittel «wertvoll» macht' },
    {
      type: 'list',
      items: [
        'Ein zuverlässiges Datum und eine zuverlässige Uhrzeit: ein nachträglich manipulierbarer Zeitstempel (veränderbare Metadaten) wiegt weniger als ein System, das ihn automatisch im Moment der Aufnahme erfasst',
        'Ein klarer Kontext dazu, was es zeigt: welcher Raum, welche Bauphase, idealerweise eine Geolokalisierung, die den genauen Ort bestätigt',
        'Eine Aufbewahrung über die Zeit, die garantiert, dass es zwischen Aufnahme und Vorlage im Streitfall nicht ersetzt oder verändert werden konnte',
      ],
    },
    { type: 'h2', text: 'Die Momente auf der Baustelle, in denen ein Foto alles verändert' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Vor Baubeginn: Ausgangszustand, nützlich bei Streit über den vorbestehenden Zustand',
        'Bei wichtigen Etappen (vor dem Schliessen einer Wand, vor dem Giessen einer Bodenplatte): Beweis, dass das danach nicht mehr Sichtbare fachgerecht war',
        'Bei der Abnahme: Endzustand, direkte Referenz für jede spätere Reklamation',
        'Wird später ein Mangel festgestellt: präzise Datierung des Entdeckungszeitpunkts, relevant für die 60-Tage-Meldefrist',
      ],
    },
    {
      type: 'callout',
      title: 'Der Punkt, der die meisten Fotoarchive unbrauchbar macht',
      text: 'Fotos, die auf den privaten Handys mehrerer Mitarbeiter gespeichert sind, ohne Zentralisierung oder zuverlässigen Zeitstempel, stellen fast nie ein solides Beweismittel dar, selbst wenn das Foto selbst tatsächlich irgendwo existiert. Entscheidend ist nicht nur das Foto, sondern seine Nachvollziehbarkeit.',
    },
    {
      type: 'p',
      text: 'Das gilt besonders seit der Reform des Garantierechts 2026 (60-Tage-Frist zur Meldung eines verdeckten Mangels): Ein Unternehmen, das genau nachweisen kann, wann ein Mangel aufgetreten ist (oder dass er vorher nicht sichtbar war), steht deutlich besser da als ein Unternehmen, das dies nur behaupten kann.',
    },
    {
      type: 'cta',
      title: 'Jedes Foto, automatisch datiert und geolokalisiert',
      text: 'Die Baustellenrapporte von Cantia versehen jedes aufgenommene Foto automatisch mit Zeitstempel und Geolokalisierung, sortiert nach Baustelle. Der Beweis existiert bereits, ohne zusätzlichen Aufwand in dem Moment, in dem er gebraucht wird.',
      buttonLabel: 'Baustellenrapporte entdecken',
    },
  ],
  faq: [
    {
      question: 'Hat ein Baustellenfoto vor Gericht einen echten Beweiswert?',
      answer:
        'Ja, sofern es zuverlässig datiert, kontextualisiert (welcher Ort, welche Etappe) und ohne nachträgliche Änderungsmöglichkeit aufbewahrt wird.',
    },
    {
      question: 'Zu welchen Zeitpunkten der Baustelle lohnt es sich am meisten, Fotos zu machen?',
      answer:
        'Es sind die Momente, die im Falle eines späteren Rechtsstreits am meisten nützen: vor Baubeginn, vor dem Schliessen von Elementen, die danach nicht mehr sichtbar sind, und bei der Schlussabnahme.',
    },
    {
      question: 'Warum sind auf privaten Handys gespeicherte Fotos wenig brauchbar?',
      answer:
        'Weil ihnen oft die Zentralisierung und ein zuverlässiger Zeitstempel fehlen, was ihren Beweiswert schwächt, selbst wenn der Inhalt des Fotos relevant ist.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'garantie-travaux-construction-2-ou-5-ans',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
