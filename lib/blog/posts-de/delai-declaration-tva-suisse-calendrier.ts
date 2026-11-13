import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'delai-declaration-tva-suisse-calendrier',
  question: 'Welche Fristen gelten für die MWST-Abrechnung in der Schweiz?',
  title: 'MWST-Abrechnung Schweiz: die Fristen, die Sie nie verpassen sollten',
  description:
    'Der Rhythmus der MWST-Abrechnungen je nach Methode, die Folgen einer verspäteten Abrechnung und wie Sie trotz voller Baustellen keine Frist verpassen.',
  excerpt:
    'Nicht die Berechnung macht Probleme, sondern das Datum, das mitten in einer Baustelle untergeht. Der Rhythmus, den Sie kennen sollten, und wie Sie ihn nicht mehr verpassen.',
  category: 'Juridique & normes',
  keywords: [
    'Frist MWST-Abrechnung Schweiz',
    'MWST Termine Baufirma',
    'MWST Abrechnung Quartal Frist',
    'Einreichefrist MWST ESTV',
    'Verzugszins MWST Schweiz',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Schwierig ist fast nie die Berechnung der geschuldeten MWST, sondern sich an das Datum zu erinnern, an dem die Abrechnung eingereicht werden muss, mitten in einer Baustellenplanung, die wenig Platz für Administration lässt. Der Rhythmus hängt von der gewählten Abrechnungsmethode ab, und es ist besser, ihn einmal fest in die Agenda einzutragen, als ihn jedes Quartal neu zu entdecken.',
    },
    { type: 'h2', text: 'Der Rhythmus je nach Methode' },
    {
      type: 'list',
      items: [
        'Effektive Methode: Abrechnung in der Regel vierteljährlich, also vier Termine pro Kalenderjahr.',
        'Saldosteuersatz: Abrechnung in der Regel halbjährlich, also zwei Termine pro Jahr.',
        'Monatliche Abrechnung: auf Antrag bei der ESTV möglich, etwa für Unternehmen, die ihre Liquidität lieber glätten, statt alle drei Monate einen grösseren Betrag zurückzustellen.',
      ],
    },
    { type: 'h2', text: 'Die übliche Frist nach Ende jeder Periode' },
    {
      type: 'p',
      text: 'Die Abrechnung ist in der Regel innert 60 Tagen nach Ende der betreffenden Periode einzureichen (Quartal, Semester oder Monat je nach Rhythmus). Diese Frist ist ein üblicher Richtwert, keine unveränderliche Regel: Massgebend ist das Datum, das im ESTV-Portal für jedes Unternehmen angezeigt wird, und diesem Datum ist zu folgen, nicht einer ungefähren Schätzung.',
    },
    { type: 'h2', text: 'Was eine verspätete Abrechnung kostet' },
    {
      type: 'p',
      text: 'Eine nach der Frist eingereichte Abrechnung führt in der Regel zu einem Verzugszins auf dem geschuldeten Betrag, berechnet ab dem Fälligkeitsdatum und nicht ab dem tatsächlichen Einreichedatum. Dieser Zins fällt auch an, wenn der deklarierte Betrag korrekt ist: Eine rechtzeitig eingereichte, geschätzte und danach korrigierte Abrechnung kostet oft weniger als eine perfekte, die zu spät kommt.',
    },
    {
      type: 'callout',
      title: 'Der richtige Reflex: Erinnerungen ab der MWST-Anmeldung',
      text: 'Sobald die MWST-Nummer zugeteilt ist, tragen Sie am besten die vier (oder zwei) Termine des kommenden Jahres in die Agenda ein, mit einer Erinnerung ein bis zwei Wochen vorher. Nur so verpassen Sie auch bei vollen Baustellen keinen Termin.',
    },
    {
      type: 'cta',
      title: 'Den MWST-Termin nicht mehr am selben Tag entdecken',
      text: 'Cantia behält die Übersicht über Rechnungen und laufende Baustellen, damit die Vorbereitung der MWST-Abrechnung nie zur Überraschung in letzter Minute wird.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Was tun, wenn man die MWST-Frist sicher nicht einhalten kann?',
      answer:
        'Vor Ablauf der Frist kann bei der ESTV eine Fristerstreckung beantragt werden. So vermeiden Sie den automatischen Verzugszins einer unangemeldeten verspäteten Abrechnung.',
    },
    {
      question: 'Lohnt sich die monatliche Abrechnung für einen kleinen Baubetrieb?',
      answer:
        'Sie kann die Liquidität glätten, weil kein grosser Quartalsbetrag zurückgestellt werden muss, vervielfacht aber auch die administrativen Schritte im Jahr. Das ist eine Abwägung je nach Grösse der Buchhaltung.',
    },
    {
      question: 'Gilt der Verzugszins auch bei wenigen Tagen Verspätung?',
      answer:
        'Ja, der Verzugszins wird in der Regel ab dem Tag nach der Fälligkeit berechnet, ohne automatische Toleranz. Planen Sie besser voraus, als auf einen Spielraum zu zählen.',
    },
  ],
  relatedSlugs: [
    'declaration-tva-trimestrielle-artisan-suisse',
    'tva-methode-effective-ou-tdfn-batiment',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
