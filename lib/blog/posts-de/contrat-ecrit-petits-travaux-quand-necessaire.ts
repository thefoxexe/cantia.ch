import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'contrat-ecrit-petits-travaux-quand-necessaire',
  question: 'Braucht es in der Schweiz auch für kleine Arbeiten einen schriftlichen Vertrag?',
  title: 'Kleine Arbeiten: ab welchem Betrag Schriftlichkeit nötig wird',
  description:
    'Für einen Werkvertrag gibt es in der Schweiz keine gesetzliche Schriftformpflicht. Eine praktische Schwelle gibt es aber sehr wohl, und sie hängt davon ab, was sich schwer aus dem Gedächtnis beweisen lässt.',
  excerpt:
    'Das Gesetz kennt keine Schwelle, ab der Schriftlichkeit verlangt wird. Die Schwelle, die wirklich zählt, ist keine rechtliche: Es ist jene, ab der eine Erinnerungsdifferenz teuer wird.',
  category: 'Juridique & normes',
  keywords: ['schriftlicher Vertrag Handwerker', 'kleine Arbeiten Vertrag', 'Offertenpflicht Schweiz', 'Notfalleinsatz Handwerker', 'praktische Schwelle Vertrag'],
  publishedAt: '2026-05-18',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein in zehn Minuten reparierter Wasserhahn braucht offensichtlich keinen in drei Exemplaren unterzeichneten Vertrag. Eine Renovationsbaustelle für CHF 40\'000 verträgt diese Lockerheit ebenso offensichtlich nicht. Wo liegt dazwischen die Schwelle? Die Antwort steht nicht im Gesetz, sondern im gesunden Menschenverstand, und es lohnt sich, sie einmal klar festzuhalten.',
    },
    { type: 'h2', text: 'Was das Gesetz sagt (und was nicht)' },
    {
      type: 'p',
      text: 'Im Schweizer Recht besteht für einen Werkvertrag unabhängig vom Betrag keine gesetzliche Schwelle, die Schriftlichkeit vorschreibt. Eine Offerte über CHF 200 oder über CHF 200\'000 hat exakt dieselbe Rechtsgültigkeit, wenn sie mündlich akzeptiert wird. Was sich mit dem Betrag ändert, ist nicht die Gültigkeit, sondern die Kosten einer Uneinigkeit, wenn die Schriftform fehlt.',
    },
    {
      type: 'callout',
      title: 'Das eigentliche Kriterium: was eine Uneinigkeit kosten würde',
      text: 'Bei einem Einsatz von unter einer Stunde mit geringem Betrag kostet eine Erinnerungsdifferenz wenig, da der mögliche Verlust überschaubar bleibt. Sobald eine Baustelle einige hundert Franken übersteigt oder sich über mehrere Tage erstreckt, wird der Preis eines Missverständnisses (über den Preis, den Umfang, die Frist) hoch genug, um eine systematische, wenn auch minimale, schriftliche Spur zu rechtfertigen.',
    },
    { type: 'h2', text: 'Ein praktischer Anhaltspunkt, keine gesetzliche Regel' },
    {
      type: 'list',
      items: [
        'Punktueller Notfalleinsatz, wenige Dutzend bis rund hundert Franken: Eine mündliche Vereinbarung reicht in den allermeisten Fällen',
        'Einsatz von einem halben Tag oder mehr, oder ein Betrag von mehreren hundert Franken: Eine schriftliche, wenn auch knappe Offerte schützt beide Seiten',
        'Baustelle über mehrere Tage oder mit mehreren Gewerken: Eine detaillierte Offerte wird unverzichtbar, nicht nur empfehlenswert',
      ],
    },
    { type: 'h2', text: 'Der schnelle Kompromiss, der das Wesentliche abdeckt' },
    {
      type: 'p',
      text: 'Selbst bei einem kleinen Einsatz genügt eine nachträglich versendete Textnachricht («Einsatz vom [Datum], Ersatz von [Element], CHF [Betrag]»), um aus einer wackeligen mündlichen Vereinbarung eine verwertbare Spur zu machen, ohne ein formelles Dokument zu benötigen. Das ist das Minimum, das im Streitfall alles verändert, bei nahezu keinem Aufwand für die Erstellung.',
    },
    {
      type: 'cta',
      title: 'Eine Offerte, auch für einen kleinen Einsatz, in wenigen Minuten',
      text: 'Cantia erlaubt es, selbst für einen kleinen Einsatz rasch eine bezifferte Offerte zu erstellen. So entsteht die Spur, ohne den Rhythmus eines vollen Tages zu bremsen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Gibt es einen Betrag, ab dem ein schriftlicher Vertrag gesetzlich vorgeschrieben ist?',
      answer:
        'Nein, für einen Werkvertrag besteht im Schweizer Recht keine gesetzliche Schwelle: Eine mündliche Vereinbarung bleibt unabhängig vom Betrag gültig.',
    },
    {
      question: 'Warum auch kleine Arbeiten schriftlich festhalten?',
      answer:
        'Weil die Kosten einer Erinnerungsdifferenz (beim Preis, beim Umfang oder bei der Frist) den Aufwand für eine schriftliche, wenn auch minimale, Spur schnell übersteigen.',
    },
    {
      question: 'Reicht eine einfache SMS-Bestätigung, um eine kleine Baustelle abzusichern?',
      answer:
        'In den meisten praktischen Fällen ja, denn eine Nachricht, die Datum, Leistung und Betrag bestätigt, macht aus einer wackeligen mündlichen Vereinbarung einen verwertbaren Beweis.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'difference-devis-offre-facture-pro-forma',
    'signature-electronique-devis-suisse-valeur-legale',
  ],
};
