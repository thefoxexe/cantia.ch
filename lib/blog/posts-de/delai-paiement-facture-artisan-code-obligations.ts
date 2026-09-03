import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'delai-paiement-facture-artisan-code-obligations',
  question: 'Welche gesetzliche Zahlungsfrist gilt für eine Handwerkerrechnung in der Schweiz?',
  title: 'Zahlungsfrist einer Handwerkerrechnung in der Schweiz: was sagt das Gesetz?',
  description:
    'Das Obligationenrecht legt keine feste gesetzliche Zahlungsfrist fest: 30 Tage sind üblich, aber alles hängt davon ab, was auf Ihrer Rechnung steht. Erklärungen und Musterklausel.',
  excerpt:
    'Ein Kunde, der nach 60 Tagen zahlt, ist nicht zwingend im Unrecht. In der Schweiz existiert die Zahlungsfrist nur, wenn Sie sie selbst auf der Rechnung vermerkt haben.',
  category: 'Juridique & normes',
  keywords: ['Zahlungsfrist', 'Rechnung', 'Verzugszins', 'Obligationenrecht', 'Mahnung'],
  publishedAt: '2026-01-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Ist ein Kunde, der 60 Tage nach Erhalt einer Rechnung zahlt, deshalb im Unrecht? Die Antwort hängt fast vollständig von einer Zeile ab, die die meisten Unternehmer zu schreiben vergessen, denn in der Schweiz, anders als in der Europäischen Union, wird Baubetrieben keine feste gesetzliche Zahlungsfrist auferlegt.',
    },
    { type: 'h2', text: 'Was das Obligationenrecht wirklich sagt' },
    {
      type: 'p',
      text: 'Es gibt keine standardmässige Anzahl Tage. Fehlt eine präzisierte Frist, sieht Art. 75 OR vor, dass die Forderung sofort fällig ist: Der Kunde müsste unverzüglich zahlen. In der Baupraxis sind 30 Tage der übliche Standard, aber er hat nur dann Rechtskraft, wenn er explizit auf der Rechnung oder der akzeptierten Offerte vermerkt ist.',
    },
    {
      type: 'callout',
      title: 'Der Punkt, dessen Missachtung am teuersten wird',
      text: 'Eine Rechnung ohne schriftliche Fälligkeit ist theoretisch sofort zahlbar, aber in der Praxis fast unmöglich durchzusetzen, mangels klarem Referenzdatum zur Berechnung eines Verzugs. Eine präzise Fälligkeit ist also keine blosse Formalität – sie ist es, die einen Verzug erst durchsetzbar macht.',
    },
    { type: 'h2', text: 'Was nach Ablauf der Fälligkeit geschieht' },
    {
      type: 'list',
      items: [
        'Der Schuldner gerät automatisch in Verzug, sobald die vereinbarte Fälligkeit überschritten ist (Art. 102 Abs. 2 OR), ohne dass eine formelle Mahnung nötig wäre, sofern ein Datum angegeben war',
        'Ein Verzugszins von 5 % pro Jahr kann von Rechts wegen verlangt werden (Art. 104 OR), ohne dass er vorher erwähnt worden sein müsste',
        'Ohne schriftliche Fälligkeit ist zunächst eine Mahnung nötig, damit diese Frist zu laufen beginnt, was unterstreicht, wie wichtig es ist, immer präzise zu datieren',
      ],
    },
    { type: 'h2', text: 'Was wirklich auf eine Rechnung gehört' },
    {
      type: 'list',
      items: [
        'Eine präzise Fälligkeit: „Zahlbar bis zum 15.03.2026" statt eines vagen „zahlbar innert 30 Tagen"',
        'Der Hinweis auf den bei Verzug anwendbaren Verzugszins, zu Abschreckungszwecken',
        'Eine schriftliche Mahnung bereits am Tag nach der überschrittenen Fälligkeit, bevor sich der Fall festfährt',
        'Eine QR-Referenznummer, um eine erhaltene Zahlung sofort zuzuordnen, damit nie irrtümlich ein Kunde gemahnt wird, der bereits bezahlt hat',
      ],
    },
    {
      type: 'p',
      text: 'In der Praxis ist die Schwierigkeit fast nie rechtlicher Natur. Sie ist logistisch: in Echtzeit wissen, welche Rechnungen sich verzögern, ohne von Hand einen Bankauszug mit einer Liste vor drei Monaten versendeter Rechnungen abgleichen zu müssen.',
    },
    {
      type: 'cta',
      title: 'Fälligkeiten, sichtbar ohne Suche',
      text: 'Cantia zeigt auf einen Blick offene, fällige oder überfällige Rechnungen an und gleicht jede erhaltene Zahlung dank der QR-Referenz automatisch mit der jeweiligen Rechnung ab.',
      buttonLabel: 'Modul Rechnungsstellung ansehen',
    },
  ],
  faq: [
    {
      question: 'Schreibt die Schweiz eine gesetzliche Zahlungsfrist von 30 Tagen vor?',
      answer:
        'Nein, anders als in gewissen EU-Ländern. Das Obligationenrecht legt keine standardmässige Frist fest; 30 Tage sind zwar üblich, müssen aber explizit auf der Rechnung vermerkt sein, um einen klaren vertraglichen Wert zu haben.',
    },
    {
      question: 'Kann man Verzugszinsen verlangen, ohne sie auf der Rechnung erwähnt zu haben?',
      answer:
        'Ja. Der in Art. 104 OR vorgesehene Verzugszins von 5 % pro Jahr gilt von Rechts wegen, sobald sich der Schuldner in Verzug befindet, unabhängig davon, ob er auf der Rechnung erwähnt wurde oder nicht.',
    },
    {
      question: 'Was tun, wenn eine Rechnung keine Fälligkeit angibt?',
      answer:
        'Die Forderung ist grundsätzlich sofort fällig, es wird jedoch empfohlen, eine schriftliche Mahnung mit klarer Fälligkeit zu senden, um anschliessend einen Verzug geltend machen und Verzugszinsen verlangen zu können.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'duree-conservation-devis-factures-suisse',
    'norme-sia-118-devis-obligatoire',
  ],
};
