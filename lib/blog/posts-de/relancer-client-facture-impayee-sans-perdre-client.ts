import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'relancer-client-facture-impayee-sans-perdre-client',
  question: 'Wie mahnt man einen Kunden, der seine Rechnung nicht bezahlt, ohne ihn zu verärgern?',
  title: 'Einen säumigen Kunden mahnen, ohne ihn zu verlieren',
  description:
    'Die meisten Zahlungsverzögerungen sind keine böse Absicht. Eine dreistufige Mahnmethode, die das Geld eintreibt, ohne die Beziehung zu belasten.',
  excerpt:
    'Die Mehrheit der überfälligen Rechnungen ist nicht böser Wille, sie sind nur in einem Stapel untergegangen. Eine wirksame Mahnung geht zuerst davon aus, nicht vom Gegenteil.',
  category: 'Devis & facturation',
  keywords: ['rechnung mahnen kunde', 'zahlung überfällig baugewerbe', 'inkasso baustelle', 'kunde zahlt nicht', 'mahnverfahren rechnung schweiz'],
  publishedAt: '2026-02-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Eine zehn Tage überfällige Rechnung ist fast nie ein Signal für Zahlungsunwilligkeit. Es ist eher ein Zeichen dafür, dass sie in einem Poststapel, einer überfüllten Mailbox oder einer angehaltenen und dann vergessenen Überweisung untergegangen ist. Jede Verzögerung ab dem ersten Tag wie eine Konfrontation zu behandeln, beschädigt Beziehungen, die überhaupt nicht konfliktbeladen waren.',
    },
    { type: 'h2', text: 'Drei Stufen, nicht nur ein Ton' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Neutrale Erinnerung, direkt am Tag nach Fälligkeit: «Kurze Erinnerung, die Rechnung Nr. XXX ist fällig, konnten Sie sie bereits bearbeiten?», ohne jeden Vorwurf, nur ein Hinweis',
        'Bestimmte Mahnung, eine Woche später: Hinweis auf die überschrittene Fälligkeit, ausdrückliche Erwähnung des anwendbaren Verzugszinses (5 % pro Jahr gemäss Art. 104 OR), Forderung nach einer konkreten Zahlungsfrist',
        'Formelle, schriftliche Mahnung mit klarer letzter Frist: die Stufe, die – falls nötig – ein Betreibungsverfahren vorbereitet',
      ],
    },
    {
      type: 'callout',
      title: 'Das Detail, das alles verändert: nie einen Kunden mahnen, der bereits bezahlt hat',
      text: 'Nichts schadet einer Beziehung mehr als eine Mahnung an einen Kunden, der drei Tage zuvor bezahlt hat. Das ist der beste Weg, ein einfaches Versehen in echte Spannung zu verwandeln – und dabei völlig vermeidbar, sobald jede eingegangene Zahlung automatisch über die QR-Referenz der zugehörigen Rechnung zugeordnet wird, ohne von einer manuellen Kontrolle des Kontoauszugs abzuhängen.',
    },
    { type: 'h2', text: 'Was besser funktioniert als ein harter Ton' },
    {
      type: 'p',
      text: 'Einen Ratenzahlungsplan anzubieten, löst oft Situationen, in denen eine schroffe Mahnung nur festfährt. Ein Kunde in echter Liquiditätsnot, der sich ernst genommen fühlt, zahlt in der Regel schneller als ein Kunde, dem man Vorwürfe macht. Die Mahnung soll nicht klären, wer recht hat; sie soll das Geld so schnell wie möglich hereinbringen, ohne den Kunden für die nächste Baustelle zu verlieren.',
    },
    {
      type: 'p',
      text: 'Und für Fälle, die über eine einfache Mahnung hinausgehen (ein Kunde, der dauerhaft unerreichbar ist, ein hoher Betrag, eine ausdrückliche Zahlungsverweigerung), ändert sich die Fragestellung: Dann muss ernsthaft ein Betreibungsverfahren geprüft werden, mit seinen eigenen Kosten und Fristen, die man kennen sollte, bevor man sich darauf einlässt.',
    },
    {
      type: 'cta',
      title: 'Wissen, wer was schuldet, ohne zu suchen',
      text: 'Das Rechnungs-Dashboard von Cantia zeigt auf einen Blick offene, fällige oder überfällige Rechnungen und gleicht jede eingegangene Zahlung per QR-Referenz ab, ohne versehentlich versendete Mahnungen.',
      buttonLabel: 'Modul Rechnungsstellung ansehen',
    },
  ],
  faq: [
    {
      question: 'Wie lange sollte man warten, bevor man eine unbezahlte Rechnung mahnt?',
      answer:
        'Eine erste neutrale Erinnerung direkt am Tag nach der überschrittenen Fälligkeit ist angemessen. Sie muss nicht formell sein, nur präsent, bevor eine Woche später bei ausbleibender Reaktion eine bestimmtere Mahnung folgt.',
    },
    {
      question: 'Soll man den Verzugszins schon in der ersten Mahnung erwähnen?',
      answer:
        'Besser für die bestimmte Mahnung (zweite Stufe) aufheben: Ihn schon in der ersten neutralen Erinnerung zu erwähnen, kann bei einem einfachen Versehen unnötig anklagend wirken.',
    },
    {
      question: 'Schwächt ein Ratenzahlungsplan die Position des Unternehmens?',
      answer:
        'Nein, sofern er schriftlich mit klaren Terminen festgehalten wird: Er löst eine Situation oft schneller als eine schroffe Mahnung, ohne auf das Recht zu verzichten, bei Nichteinhaltung den Restbetrag zu fordern.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'facturer-acompte-suisse-securiser-solde',
    'qr-facture-obligatoire-2026',
  ],
};
