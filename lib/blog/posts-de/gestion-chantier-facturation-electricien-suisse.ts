import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-chantier-facturation-electricien-suisse',
  question: 'Wie sollte ein selbstständiger Elektriker seine Offerten, Stunden und Rechnungen organisieren?',
  title: 'Selbstständiger Elektriker: Offerten, Stunden und Rechnungen im Griff, ohne jeden Abend dafür draufzugehen',
  description:
    'Zwischen Elektropunkten, die kalkuliert werden müssen, Stunden, die sich über mehrere Baustellen am selben Tag verteilen, und NIV-Kontrollen, die nicht vergessen werden dürfen, hat die Administration eines Elektrikers ihre Tücken. Eine konkrete Methode.',
  excerpt:
    'Ein Elektriker wechselt oft drei- bis viermal am Tag die Baustelle. Die eigentliche Schwierigkeit liegt daher nicht darin, einen Elektropunkt zu kalkulieren, sondern abends noch zu wissen, wer wo was gemacht hat und wie lange.',
  category: 'Métiers du bâtiment',
  keywords: ['Offerte Elektriker selbstständig', 'Rechnungsstellung Elektriker Schweiz', 'Baustellenverwaltung Elektroinstallation', 'Software Elektriker Bau', 'Stundenerfassung Elektriker mehrere Baustellen'],
  publishedAt: '2026-08-30',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Sanitär- oder Maurerbetrieb bleibt oft einen ganzen Tag auf derselben Baustelle. Ein Elektriker hingegen reiht häufig mehrere kurze Einsätze am selben Tag aneinander: morgens eine Störungsbehebung, nachmittags eine Konformitätsanpassung, am Abend ein Offerttermin. Die Schwierigkeit liegt also nicht nur im korrekten Kalkulieren, sondern darin, zwischen zwei Fahrten keine einzige Stunde zu verlieren.',
    },
    { type: 'h2', text: 'Kalkulieren pro Punkt, pro Stromkreis oder als Pauschale?' },
    {
      type: 'list',
      items: [
        'Elektropunkte (Steckdosen, Schalter, Leuchten): Einzelpreis, praktisch für detaillierte Renovationsofferten',
        'Komplette Stromkreise (Verteiler, Erdung, Fehlerstromschutz): pauschal, da der Zeitaufwand bei einer Standardinstallation kaum variiert',
        'Störungsbehebung und Noteinsatz: nach Regiestunden, mit einem dem Kunden klar kommunizierten Mindestbetrag',
        'NIV-Konformitätsanpassung: pauschal nach Besichtigung, nie blind am Telefon',
      ],
    },
    { type: 'h2', text: 'Die wahren versteckten Kosten: die Zeit zwischen zwei Baustellen' },
    {
      type: 'p',
      text: 'Eine nicht verrechnete Fahrt summiert sich, multipliziert mit drei oder vier Baustellen pro Tag, rasch zu einem halben Arbeitstag pro Woche, der nirgends abgebildet wird. Die Frage ist nicht nur, ob die Fahrzeit verrechnet wird (manche tun es, andere rechnen sie in den Stundensatz ein), sondern sie zumindest als nicht verfügbare Zeit für andere Aufträge zu zählen, um den eigenen Tag nicht zu überbuchen.',
    },
    {
      type: 'stat',
      value: '3-4',
      label: 'unterschiedliche Baustellen, die ein selbstständiger Elektriker im Tagesgeschäft im Schnitt an einem einzigen Tag betreut',
    },
    {
      type: 'callout',
      title: 'Die NIV-Kontrolle ist auf der Offerte keine optionale Position',
      text: 'Eine geänderte oder neu erstellte Elektroinstallation muss der Kontrollstelle gemeldet und gemäss Niederspannungs-Installationsverordnung (NIV) kontrolliert werden. Wer diesen Punkt auf der Offerte vergisst, riskiert, ihn später unter Zeitdruck zu verrechnen: Der erzielte Preis ist dann meist schlechter und liegt unter dem, was es tatsächlich an Zeit kostet.',
    },
    {
      type: 'cta',
      title: 'Ihre Stunden, Baustelle für Baustelle erfasst, in Sekunden',
      text: 'Mit Cantia erfassen Sie Ihre Arbeitszeit direkt vom Handy aus zwischen zwei Einsätzen, Baustelle für Baustelle. So wissen Sie Ende Monat genau, wer was gemacht hat, ohne den Tag aus dem Gedächtnis zu rekonstruieren.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Soll eine Elektro-Offerte pro Punkt oder pauschal verrechnet werden?',
      answer:
        'Beides lässt sich kombinieren: Der Einzelpreis pro Elektropunkt eignet sich für detaillierte Renovationen, die Pauschale passt besser zu standardisierten kompletten Stromkreisen (Verteiler, Erdung), bei denen der Zeitaufwand kaum variiert.',
    },
    {
      question: 'Wie verrechnet ein Elektriker seine Fahrten zwischen mehreren Baustellen?',
      answer:
        'Es gibt keine einheitliche Regel: Manche rechnen sie in den Stundensatz ein, andere verrechnen sie separat. Entscheidend ist, es im Voraus klar festzulegen und dem Kunden zu kommunizieren, statt es stillschweigend in der Marge verschwinden zu lassen.',
    },
    {
      question: 'Muss die NIV-Kontrolle auf der Elektro-Offerte aufgeführt sein?',
      answer:
        'Ja, denn jede neu erstellte oder geänderte Installation muss gemeldet und kontrolliert werden. Wird sie von Anfang an in die Offerte aufgenommen, vermeidet das eine teurere Verrechnung unter Zeitdruck nach Abschluss der Baustelle.',
    },
  ],
  relatedSlugs: [
    'application-hors-ligne-chantier-pourquoi-important',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'facturation-heures-regie-batiment-comment-faire',
  ],
  relatedTradeSlug: 'electricien',
};
