import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'litige-chantier-mediation-ou-tribunal',
  question: 'Eine Auseinandersetzung auf der Baustelle eskaliert: sofort vor Gericht, oder gibt es andere Optionen?',
  title: 'Baustellenstreit: wie man zwischen Mediation, Schlichtung und Gericht wählt',
  description:
    'Das Gericht ist in der Schweiz fast nie der logische erste Schritt bei einem Baustellenstreit. Ein Schlichtungsverfahren ist sogar vor den meisten Zivilklagen obligatorisch.',
  excerpt:
    'Viele Unternehmer denken beim ersten Konflikt mit einem Kunden gleich an den Prozess. In der Praxis gibt es mehrere schnellere und günstigere Zwischenschritte, und einige davon sind sogar obligatorisch.',
  category: 'Juridique & normes',
  keywords: ['baustellenstreit mediation', 'schlichtung gericht bau', 'konfliktlösung baustelle', 'zivilverfahren schweiz bau', 'streit kunde handwerker'],
  publishedAt: '2026-06-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine Uneinigkeit über die Qualität der Arbeiten, ein bestrittener Saldo, eine nicht eingehaltene Frist: Spannungen gehören zum Beruf. Aber direkt vor Gericht zu ziehen ist weder die erste Option noch sogar immer sofort möglich: Das Schweizer Zivilprozessrecht schreibt grundsätzlich einen Schlichtungsversuch vor den meisten Zivilklagen vor.',
    },
    { type: 'h2', text: 'Die Schritte, in logischer Reihenfolge' },
    {
      type: 'list',
      items: [
        'Direktes und schriftliches Gespräch mit dem Kunden (oft vernachlässigt, löst aber die Mehrheit der Streitigkeiten ohne Kosten)',
        'Private Mediation: eine neutrale Drittperson erleichtert den Dialog, ohne eine Entscheidung aufzuzwingen (schnell und kostengünstig, erfordert aber die Zustimmung beider Parteien)',
        'Schlichtungsverfahren vor der zuständigen Behörde: vor den meisten Zivilprozessen in der Schweiz für kleinere und mittlere Streitwerte obligatorisch',
        'Gerichtsverfahren: nur wenn die Schlichtung scheitert oder der Streitwert die Schwellenwerte für das vereinfachte Verfahren übersteigt',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Das obligatorische Schlichtungsverfahren zu überspringen führt zur Abweisung vor Gericht',
      text: 'Bei den meisten Zivilstreitigkeiten ist eine nach dem Schlichtungsversuch ausgestellte Klagebewilligung eine Prozessvoraussetzung: Ohne sie kann das Gericht schlicht nicht auf die Klage eintreten.',
    },
    { type: 'h2', text: 'Was den besten Weg bestimmt' },
    {
      type: 'list',
      items: [
        'Der Streitwert: bei einem kleinen Streit übersteigen die Prozesskosten oft den tatsächlichen finanziellen Einsatz',
        'Die Qualität der Kundenbeziehung: eine gütliche Einigung bewahrt eine Geschäftsbeziehung, ein Prozess schliesst sie endgültig',
        'Die Solidität des Dossiers: klare schriftliche Beweise (Offerte, Korrespondenz, Fotos) beschleunigen eine Schlichtung erheblich',
      ],
    },
    {
      type: 'p',
      text: 'In fast allen Fällen wiegt die Solidität des Beweisdossiers schwerer als die mündliche Argumentation. Ein klarer Verlauf von Offerten, Rechnungen, Korrespondenz und Baustellenfotos beschleunigt jeden dieser Schritte erheblich.',
    },
    {
      type: 'cta',
      title: 'Ein solides Dossier, bereit im Streitfall',
      text: 'Cantia zentralisiert Offerten, Rechnungen, Korrespondenz und Fotos pro Baustelle, sodass der vollständige Verlauf verfügbar bleibt, falls eine Schlichtung oder ein Verfahren nötig wird.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss man in der Schweiz zwingend ein Schlichtungsverfahren vor einem Prozess durchlaufen?',
      answer:
        'Ja, bei den meisten Zivilstreitigkeiten ist ein Schlichtungsversuch eine Prozessvoraussetzung, bevor das Gericht angerufen werden kann.',
    },
    {
      question: 'Ist die Mediation bei einem Baustellenstreit obligatorisch?',
      answer:
        'Nein, die private Mediation ist ein freiwilliger Schritt, der die Zustimmung beider Parteien erfordert, im Gegensatz zur Schlichtung, die verfahrensrechtlich vorgeschrieben ist.',
    },
    {
      question: 'Was beschleunigt eine Schlichtung oder einen Streit am meisten?',
      answer:
        'Ein solides Beweisdossier (unterzeichnete Offerten, schriftliche Korrespondenz, datierte Baustellenfotos) wiegt fast immer schwerer als die mündliche Argumentation.',
    },
  ],
  relatedSlugs: [
    'client-refuse-payer-solde-final-que-faire',
    'photos-chantier-preuve-juridique-litige',
    'resiliation-contrat-entreprise-chantier-en-cours',
  ],
};
