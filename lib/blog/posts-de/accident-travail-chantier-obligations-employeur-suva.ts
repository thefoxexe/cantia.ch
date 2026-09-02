import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'accident-travail-chantier-obligations-employeur-suva',
  question: 'Ein Mitarbeiter verunfallt auf der Baustelle: Welche unmittelbaren Pflichten hat der Arbeitgeber gegenüber der SUVA?',
  title: 'Arbeitsunfall auf der Baustelle: Die Pflichten des Arbeitgebers gegenüber der SUVA',
  description:
    'Fristgerechte Meldung, Lohnfortzahlung während der Arbeitsunfähigkeit, Wiedereingliederung: Ein Unfall auf der Baustelle löst präzise Pflichten für den Arbeitgeber im Bauwesen aus, der obligatorisch bei der SUVA versichert ist.',
  excerpt:
    'Das Bauwesen ist eine Risikobranche, weshalb die Melde- und Nachverfolgungsregeln der SUVA hier strenger sind als anderswo. Eine verspätete oder fehlerhaft ausgefüllte Meldung kann die Entschädigung des Mitarbeiters verzögern.',
  category: 'RH & salaires',
  keywords: ['Arbeitsunfall Baustelle', 'SUVA Pflichten Arbeitgeber', 'Unfallmeldung Bau', 'Arbeitsunfähigkeit Bauarbeiter', 'Unfallversicherung Bauwesen Schweiz'],
  publishedAt: '2026-08-06',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Jedes Unternehmen der Baubranche in der Schweiz ist obligatorisch bei der SUVA gegen Berufsunfälle versichert: Im Gegensatz zu anderen Branchen besteht hier keine freie Versichererwahl. Damit einher gehen präzise Pflichten, sobald sich auf einer Baustelle ein Unfall ereignet, ob beruflich oder ausserberuflich, je nach Status des Mitarbeiters.',
    },
    { type: 'h2', text: 'Die 3 unmittelbaren Reflexe' },
    {
      type: 'list',
      items: [
        'Den Unfall unverzüglich der SUVA melden, auch bei Zweifeln an der Schwere, mit dem dafür vorgesehenen Unfallmeldeformular (UVG)',
        'Den Lohn während der ersten 2 Tage weiterzahlen (je nach Vertrag auch länger), bevor die Versicherung mit 80 % des versicherten Lohns übernimmt',
        'Die Umstände des Unfalls dokumentieren, solange sie noch frisch sind: genauer Ort, Uhrzeit und anwesende Zeugen auf der Baustelle festhalten',
        'Prüfen, ob der verunfallte Mitarbeiter im Zeitpunkt des Ereignisses tatsächlich angemeldet und versichert war, insbesondere bei Temporärangestellten oder Neueinstellungen',
      ],
    },
    {
      type: 'callout',
      title: 'Die Dokumentation der Baustelle im Moment des Ereignisses macht den Unterschied',
      text: 'Kommt es später zu Streitigkeiten über die Umstände (Berufsunfall vs. Nichtberufsunfall, Verschulden eines Dritten, Einhaltung der Sicherheitsvorschriften), schafft eine präzise Aufzeichnung darüber, wer anwesend war und wie der Zustand der Baustelle an diesem Tag war, Sicherheit für Arbeitgeber und Mitarbeiter gleichermassen.',
    },
    { type: 'h2', text: 'Die Wiederaufnahme der Arbeit ist nicht automatisch' },
    {
      type: 'p',
      text: 'Die Wiedereingliederung erfolgt auf Basis eines ärztlichen Zeugnisses, manchmal in Teilzeit oder mit vorübergehenden Einschränkungen (kein Lastentragen, keine Arbeit auf Höhe). Der Arbeitgeber muss den Arbeitsplatz oder die Zuteilung entsprechend anpassen können, was häufig eine vorübergehende Umorganisation der Teams auf den laufenden Baustellen erfordert.',
    },
    {
      type: 'cta',
      title: 'Team und Baustellen auf einen Blick',
      text: 'Die Team-Planung von Cantia ermöglicht es, die Einsätze schnell umzuorganisieren, wenn ein Teammitglied nach einem Unfall vorübergehend entlastet werden muss.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wer zahlt den Lohn in den ersten Tagen nach einem Arbeitsunfall?',
      answer:
        'Der Arbeitgeber zahlt den Lohn während einer kurzen Anfangsperiode weiter (in der Regel 2 Tage), bevor die SUVA mit 80 % des versicherten Lohns übernimmt.',
    },
    {
      question: 'Muss auch ein leichter Unfall bei der SUVA gemeldet werden?',
      answer:
        'Ja, es wird empfohlen, jeden Unfall zu melden, sobald er zu einer Arbeitsunfähigkeit oder ärztlicher Behandlung führt, selbst bei anfänglichen Zweifeln an der Schwere.',
    },
    {
      question: 'Ist die SUVA im Bausektor obligatorisch?',
      answer:
        'Ja, Bauunternehmen sind gesetzlich verpflichtet, ihre Mitarbeiter bei der SUVA gegen Unfälle zu versichern, ohne Möglichkeit, für diese Deckung einen anderen Versicherer zu wählen.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'salaire-minimum-cct-construction-suisse',
    'photos-chantier-preuve-juridique-litige',
  ],
};
