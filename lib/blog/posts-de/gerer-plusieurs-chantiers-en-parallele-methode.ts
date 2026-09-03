import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gerer-plusieurs-chantiers-en-parallele-methode',
  question: 'Wie verwaltet man mehrere Baustellen gleichzeitig, ohne den Überblick zu verlieren?',
  title: 'Mehrere Baustellen parallel verwalten, ohne unterwegs etwas zu verlieren',
  description:
    'Der Wechsel von einer zu drei gleichzeitigen Baustellen verändert die Art der Arbeit: Es ist keine Frage der Arbeitskraft mehr, sondern eine Frage von Gedächtnis und Koordination. Eine konkrete Methode.',
  excerpt:
    'Der Übergang von einer zu drei parallelen Baustellen verdoppelt nicht die Arbeitslast: Er vervielfacht die Anzahl der Dinge, an die man sich erinnern muss, ohne sie irgendwo festgehalten zu haben.',
  category: 'Chantier & rentabilité',
  keywords: ['mehrere baustellen', 'baustellenorganisation', 'teamplanung', 'koordination', 'multi-projekt-verwaltung'],
  publishedAt: '2026-04-09',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Eine Baustelle nach der anderen lässt sich aus dem Gedächtnis verwalten, ohne wirklich darüber nachzudenken. Drei Baustellen parallel verändern alles. Nicht weil es dreimal so viel körperliche Arbeit gibt, sondern weil es plötzlich zehnmal so viele Dinge zu merken gibt: wer wo ist, welches Material für welche Baustelle bestellt wurde, welcher Kunde auf welche Antwort wartet.',
    },
    { type: 'h2', text: 'Das eigentliche Problem ist nie die Arbeitslast, es ist das Gedächtnis' },
    {
      type: 'p',
      text: 'Die meisten Pannen bei mehreren gleichzeitigen Baustellen entstehen nicht durch mangelnde Kompetenz oder fehlende Arbeitskräfte. Sie entstehen durch eine Information, die irgendwo existierte (in einer SMS, einem mündlichen Gespräch, einem Post-it), aber im richtigen Moment für die richtige Person nirgends zugänglich war.',
    },
    {
      type: 'list',
      items: [
        'Ein Mitarbeiter, der mangels zentralem und aktuellem Planungssystem auf die falsche Baustelle geschickt wird',
        'Eine doppelt aufgegebene Materialbestellung, weil niemand wusste, dass sie für diese Baustelle bereits erfolgt war',
        'Ein Kunde, der nachfragt, weil sich seine mündlich gestellte Frage zwischen zwei Besuchen verloren hat',
        'Eine Subunternehmer-Rechnung, die der falschen Baustelle zugeordnet wird und die Rentabilität beider verfälscht',
      ],
    },
    { type: 'h2', text: 'Drei Gewohnheiten, die die Komplexität auffangen' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Ein einziger gemeinsamer Teamplan, sichtbar für das gesamte Team und nicht nur für den, der ihn geschrieben hat, bei dem jede Zuteilung an eine bestimmte Baustelle geknüpft ist',
        'Ein einziger Ort pro Baustelle, an dem alles landet, was sie betrifft (Fotos, Notizen, Offerten, Rechnungen), statt eines WhatsApp-Threads auf der einen und eines Papierdossiers auf der anderen Seite',
        'Ein Rentabilitäts-Check pro Baustelle, der regelmässig konsultiert wird, nicht erst beim Abschluss, um eine ausufernde Baustelle früh zu erkennen, solange noch Zeit bleibt zu reagieren',
      ],
    },
    {
      type: 'callout',
      title: 'Das Zeichen, dass es Zeit für eine neue Methode ist',
      text: 'Wenn eine Frage regelmässig zurückkommt («für welche Baustelle war das nochmal?», «wer sollte sich darum kümmern?»), ist das kein individuelles Gedächtnisproblem, das man beheben muss – es ist ein Signal, dass die Information keinen festen Ort hat, an dem sie lebt. Das zu beheben bedeutet, das Tool zu wechseln, nicht sich zu zwingen, sich besser zu erinnern.',
    },
    {
      type: 'cta',
      title: 'Jede Baustelle, ein einziger Ort für alles',
      text: 'Cantia zentralisiert Planung, Offerten, Rechnungen, Rapporte und Subunternehmer pro Baustelle. Das gesamte Team sieht so dieselbe, aktuelle Information am selben Ort.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum ist die Verwaltung mehrerer Baustellen schwieriger, als eine einzige zu vervielfachen?',
      answer:
        'Weil die Schwierigkeit nicht die Arbeitslast selbst ist, sondern die Koordination und das Merken baustellenspezifischer Informationen. Ohne zentralen Speicherort gehen diese Informationen leicht verloren.',
    },
    {
      question: 'Welches Anzeichen deutet darauf hin, dass ein Unternehmen ein besseres Nachverfolgungssystem braucht?',
      answer:
        'Wiederkehrende Fragen wie «für welche Baustelle war das?» oder Verwirrung darüber, wer was tun sollte, zeigen, dass die Information keinen festen, für das ganze Team zugänglichen Ort hat.',
    },
    {
      question: 'Reicht eine WhatsApp-Planung, um mehrere Baustellen zu verwalten?',
      answer:
        'Das funktioniert eine Zeit lang bei einem kleinen Team, aber die Information geht im Nachrichtenverlauf schnell verloren, und ohne Struktur pro Baustelle wird sie rasch unauffindbar.',
    },
  ],
  relatedSlugs: [
    'whatsapp-gestion-equipe-chantier-limites',
    'suivre-rentabilite-chantier-sans-excel',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
  ],
  relatedTradeSlug: 'entreprise-generale',
};
