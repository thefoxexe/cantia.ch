import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'poursuite-facture-impayee-procedure-suisse',
  question: 'Wie leitet man eine Betreibung gegen einen Kunden ein, der eine Rechnung nicht bezahlen will, und was kostet das?',
  title: 'Unbezahlte Rechnung: die Betreibung in der Schweiz, Schritt für Schritt',
  description:
    'Betreibungsbegehren, Zahlungsbefehl, Rechtsvorschlag, Rechtsöffnung: So funktioniert eine Betreibung wegen einer unbezahlten Rechnung wirklich, und ab wann sie sinnvoll wird.',
  excerpt:
    'Das Mahnen wirkt nicht immer. Bevor man eine Forderung aufgibt oder sich in Erinnerungen erschöpft, bleibt die Betreibung ein zugängliches, standardisiertes und oft schnelleres Verfahren, als man denkt.',
  category: 'Devis & facturation',
  keywords: ['betreibung unbezahlte rechnung', 'zahlungsbefehl schweiz', 'betreibungsamt', 'rechtsöffnung', 'forderung handwerker'],
  publishedAt: '2026-08-18',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Nach mehreren erfolglosen Mahnungen zögern viele Handwerker, den nächsten Schritt zu gehen, aus Unkenntnis des Verfahrens oder aus Angst, es sei aufwendig und kostspielig. In Wirklichkeit ist die Betreibung in der Schweiz ein standardisiertes Verwaltungsverfahren, das für eine einfache und dokumentierte Forderung auch ohne Anwalt zugänglich ist.',
    },
    { type: 'h2', text: 'Die 4 konkreten Schritte' },
    {
      type: 'list',
      items: [
        'Betreibungsbegehren: ein Formular, das beim Betreibungsamt am Wohnsitz des Schuldners eingereicht wird, mit dem geschuldeten Betrag und dessen Grund (Rechnungsnummer und -datum)',
        'Zahlungsbefehl: das Amt stellt dem Schuldner den Befehl zu, der 10 Tage Zeit hat, um Rechtsvorschlag zu erheben',
        'Ohne Rechtsvorschlag geht die Betreibung direkt zur Pfändung oder zum Konkurs über, je nach Status des Schuldners',
        'Mit Rechtsvorschlag muss die Rechtsöffnung (beim Gericht) erwirkt werden, um ihn aufzuheben und das Verfahren fortzusetzen',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Eine unterschriebene Offerte oder eine anerkannte Rechnung beschleunigt die Rechtsöffnung erheblich',
      text: 'Die provisorische Rechtsöffnung ist deutlich schneller zu erhalten, wenn die Forderung auf einem schriftlichen, vom Schuldner unterzeichneten Titel beruht (akzeptierte Offerte, anerkannte Rechnung, unbestrittener Kontoauszug) statt auf einer blossen, nicht unterschriebenen Rechnung.',
    },
    { type: 'h2', text: 'Was eine Betreibung mehr oder weniger wirksam macht' },
    {
      type: 'p',
      text: 'Die Betreibung garantiert keine Beitreibung: Ist der Schuldner tatsächlich zahlungsunfähig, endet sie mit einem Verlustschein. Sie hat aber eine echte abschreckende Wirkung (sie erscheint im Betreibungsregisterauszug, was für jedes Unternehmen oder jede Person, die einen Kredit, eine Miete oder einen Auftrag sucht, ins Gewicht fällt), und bleibt oft der Auslöser, der einen zahlungsfähigen, aber unwilligen Schuldner endlich zum Zahlen bringt.',
    },
    {
      type: 'list',
      items: [
        'Der genaue geforderte Betrag muss exakt der Rechnung entsprechen, ohne Rundung oder unbegründete zusätzliche Kosten',
        'Datum und Rechnungsnummer müssen eindeutig identifizierbar sein',
        'Ein Verlauf schriftlicher Mahnungen stärkt das Dossier, falls die Sache vor Gericht geht',
      ],
    },
    {
      type: 'cta',
      title: 'Ein Rechnungsdossier, das immer bereit ist',
      text: 'Cantia hält jede Rechnung, ihren Versandverlauf und ihren Zahlungsstatus zentralisiert pro Kunde. So füllen Sie ein Betreibungsbegehren in wenigen Minuten aus, statt Monate von E-Mails zu durchsuchen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Braucht man einen Anwalt, um eine Betreibung in der Schweiz einzuleiten?',
      answer:
        'Nein, für eine einfache und dokumentierte Forderung wird das Betreibungsbegehren direkt beim Betreibungsamt eingereicht, ohne Vertretungspflicht.',
    },
    {
      question: 'Was passiert, wenn der Schuldner gegen den Zahlungsbefehl Rechtsvorschlag erhebt?',
      answer:
        'Man muss beim Gericht die Rechtsöffnung beantragen, um den Rechtsvorschlag aufzuheben: ein deutlich schnelleres Verfahren, wenn die Forderung auf einem vom Schuldner unterschriebenen Titel beruht.',
    },
    {
      question: 'Garantiert eine Betreibung, dass man bezahlt wird?',
      answer:
        'Nein. Ist der Schuldner zahlungsunfähig, kann die Betreibung ohne Beitreibung mit einem Verlustschein enden, bleibt aber im Betreibungsregister des Schuldners eingetragen.',
    },
  ],
  relatedSlugs: [
    'hypotheque-legale-artisans-entrepreneurs-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
