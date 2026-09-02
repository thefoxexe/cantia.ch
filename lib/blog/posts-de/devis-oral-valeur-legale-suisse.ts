import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-oral-valeur-legale-suisse',
  question: 'Hat eine mündlich angenommene Offerte in der Schweiz rechtliche Gültigkeit?',
  title: 'Mündlich angenommene Offerte: Sie verpflichtet, lässt sich aber nicht beweisen',
  description:
    'Nach Schweizer Recht gilt eine mündliche Vereinbarung als Vertrag: Das Obligationenrecht verlangt standardmässig keine Schriftform. Das Problem liegt nie in der Gültigkeit, sondern im Beweis.',
  excerpt:
    '«Wir haben uns am Telefon geeinigt» verpflichtet beide Parteien in der Schweiz rechtlich. Das eigentliche Problem entsteht, sobald eine der beiden Seiten das Gegenteil behauptet.',
  category: 'Juridique & normes',
  keywords: ['mündliche offerte gültigkeit', 'mündliche vereinbarung vertrag', 'beweis vertrag schweiz', 'formvorschrift vertrag', 'art 11 or'],
  publishedAt: '2026-04-16',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Kunde sagt am Telefon Ja, die Baustelle beginnt in der folgenden Woche, ohne dass ein Papier unterschrieben wurde. Viele Handwerker glauben, eine solche Vereinbarung «zähle nicht wirklich», solange sie nicht schriftlich vorliegt. Das stimmt nicht. Dieser Unterschied verändert grundlegend, wie man einen Streitfall angeht, sobald es dazu kommt.',
    },
    { type: 'h2', text: 'Der Grundsatz: standardmässig ist keine Form vorgeschrieben' },
    {
      type: 'p',
      text: 'Art. 11 Abs. 1 OR stellt eine einfache Regel auf: Die Gültigkeit eines Vertrags ist an eine bestimmte Form nur gebunden, wo das Gesetz eine solche vorschreibt. Für einen Werkvertrag (Offerte für Bauarbeiten) verlangt kein Gesetz die Schriftform: eine mündliche Vereinbarung, ein SMS-Austausch, ein «gut, machen Sie es» am Telefon bilden einen vollkommen gültigen Vertrag.',
    },
    {
      type: 'callout',
      title: 'Die eigentliche Frage ist nie «ist es gültig?»',
      text: 'Sie lautet «kann ich es beweisen?». Ein mündlicher Vertrag existiert rechtlich, doch bei Uneinigkeit über den Preis, den Umfang oder die vereinbarte Frist steht diejenige Partei, die beweisen muss, was gesagt wurde, gegenüber einer nie schriftlich festgehaltenen Vereinbarung mittellos da.',
    },
    { type: 'h2', text: 'Was konkret im Streitfall auf dem Spiel steht' },
    {
      type: 'list',
      items: [
        'Ohne schriftliche Spur wird der vereinbarte Preis zu einer Frage des jeweiligen Erinnerungsvermögens, wobei die beiden Erinnerungen selten zugunsten desselben Betrags auseinandergehen',
        'Der genaue Umfang der Arbeiten («ist die Malerarbeit inbegriffen oder nicht?») wird im Nachhinein diskutiert, im ungünstigsten Moment',
        'Ein Schweizer Zivilrichter urteilt auf Grundlage der vorgelegten Beweise, nicht auf Grundlage des gegebenen Wortes, sodass eine nicht dokumentierte mündliche Vereinbarung mit einem strukturellen Nachteil startet',
      ],
    },
    { type: 'h2', text: 'Der Kompromiss, der in der Praxis funktioniert' },
    {
      type: 'p',
      text: 'Niemand erwartet für eine kleine zweistündige Reparatur einen förmlichen Vertrag. Doch sobald ein erheblicher Betrag im Spiel ist, genügt eine einfache schriftliche Nachricht zur Bestätigung der mündlichen Vereinbarung («wie am Telefon besprochen, ich beginne am Montag für CHF X, Arbeiten Y»), um eine fragile Vereinbarung ohne administrativen Mehraufwand in einen soliden Beweis zu verwandeln.',
    },
    {
      type: 'p',
      text: 'Der eigentliche Gewinn einer formalisierten Offerte besteht also nicht darin, die Vereinbarung «gültiger zu machen» (sie ist es bereits mündlich), sondern sie beweisbar zu machen, für den Tag, an dem sich einer der beiden anders erinnert.',
    },
    {
      type: 'cta',
      title: 'Eine Offerte in dreissig Sekunden versendet, nicht in dreissig Minuten',
      text: 'Mit der Sprachdiktierfunktion von Cantia verwandelt sich eine am Telefon getroffene Vereinbarung in wenigen Minuten in eine kalkulierte PDF-Offerte. So entsteht die schriftliche Spur, ohne das Tempo der Baustelle zu verlangsamen.',
      buttonLabel: 'Sprachdiktierfunktion entdecken',
    },
  ],
  faq: [
    {
      question: 'Ist eine mündliche Vereinbarung für Arbeiten nach Schweizer Recht gültig?',
      answer:
        'Ja, da Art. 11 OR standardmässig keine besondere Form für einen Werkvertrag verlangt. Eine mündliche Vereinbarung verpflichtet beide Parteien rechtlich.',
    },
    {
      question: 'Was ist das Hauptrisiko einer nur mündlich angenommenen Offerte?',
      answer:
        'Der Beweis, nicht die Gültigkeit: Bei Uneinigkeit über den Preis oder den vereinbarten Umfang wird es schwierig, genau nachzuweisen, was gesagt wurde.',
    },
    {
      question: 'Genügt eine einfache schriftliche Nachricht, um eine mündliche Vereinbarung abzusichern?',
      answer:
        'In den meisten praktischen Fällen ja: Eine Nachricht, die die Bedingungen der Vereinbarung (Preis, Umfang, Frist) bestätigt, ist ein wesentlich solideres Beweismittel als eine rein mündliche Absprache.',
    },
  ],
  relatedSlugs: [
    'signature-electronique-devis-suisse-valeur-legale',
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
  ],
};
