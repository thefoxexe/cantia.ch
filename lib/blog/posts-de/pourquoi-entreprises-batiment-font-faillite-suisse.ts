import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'pourquoi-entreprises-batiment-font-faillite-suisse',
  question: 'Warum gehen so viele kleine Bauunternehmen trotz gutem Auftragsbestand in Konkurs?',
  title: 'Warum voll ausgelastete Bauunternehmen am Ende doch Konkurs gehen',
  description:
    'Arbeit zu haben reicht nicht: Die häufigsten Konkursursachen im Bauwesen sind ein Liquiditätsproblem und eine unsichtbare Marge, nicht ein Mangel an Baustellen.',
  excerpt:
    'Ein Unternehmen, das «nie mit Arbeiten aufhört», kann trotzdem untergehen. Der Auftragsbestand beruhigt, sagt aber nichts über die tatsächliche Marge oder die zeitliche Lücke zwischen Ausgaben und Einnahmen aus.',
  category: 'Chantier & rentabilité',
  keywords: ['konkurs bauunternehmen schweiz', 'liquidität baubranche', 'unsichtbare marge baustelle', 'kmu bauwesen führung', 'rentabilität handwerksbetrieb'],
  publishedAt: '2026-07-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Ein häufiges Paradox in der Branche: ein Bauunternehmen mit mehreren gleichzeitig laufenden Baustellen, ohne Arbeitsmangel, das trotzdem zahlungsunfähig wird. Die Zahlen der Branche zeigen, dass die Ursache fast nie ein Nachfragemangel ist, sondern eine Kombination aus schlecht vorausgeplanter Liquidität und nie chantier-genau gemessener realer Marge.',
    },
    { type: 'h2', text: 'Die 4 häufigsten Ursachen' },
    {
      type: 'list',
      items: [
        'Die Liquiditätslücke: Lieferanten und Löhne werden jeden Monat bezahlt, aber Kundenrechnungen werden erst nach 30, 60 oder 90 Tagen beglichen, sodass eine «auf dem Papier rentable» Baustelle trotzdem einen Kassenengpass verursachen kann',
        'Unterofferierte Baustellen, die man gedanklich mit anderen, als «gut» eingeschätzten Baustellen kompensiert, ohne je zu prüfen, welche tatsächlich die andere finanziert',
        'Ein zu schnell wachsender Personalbestand, der aus zukünftigem Umsatz statt aus bereits vorhandener Liquidität finanziert wird',
        'Ein einzelner Kunde oder eine einzelne Grossbaustelle, die einen unverhältnismässig grossen Anteil am Umsatz ausmacht, mit einem nicht antizipierten Konzentrationsrisiko',
      ],
    },
    {
      type: 'callout',
      title: 'Der Umsatz ist nie ein Indikator für finanzielle Gesundheit',
      text: 'Ein Unternehmen kann viel fakturieren und trotzdem strukturell Verlust machen, wenn seine reale Marge pro Baustelle nie gemessen wird. Nur die Verfolgung der Rentabilität Baustelle für Baustelle zeigt, was der Umsatz allein nicht offenbart.',
    },
    { type: 'h2', text: 'Was einen kleinen Betrieb konkret schützt' },
    {
      type: 'list',
      items: [
        'Eine Liquiditätsprognose über 30-60-90 Tage, regelmässig aktualisiert statt in der Notlage neu erstellt',
        'Eine Verfolgung der Rentabilität pro Baustelle, nicht nur des globalen Umsatzes des Unternehmens',
        'Eine systematische Anzahlungsrechnung bei Baustellen von erheblicher Grösse',
        'Eine schrittweise Diversifizierung des Kundenportfolios, auch bescheiden',
      ],
    },
    {
      type: 'cta',
      title: 'Liquiditätsprobleme kommen sehen, bevor sie eintreten',
      text: 'Das Liquiditätsmodul von Cantia projiziert Ihren zukünftigen Kontostand unter Berücksichtigung offener Rechnungen und wiederkehrender Ausgaben. So sehen Sie einen Engpass kommen, statt ihn zu erleiden.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Schützt ein guter Auftragsbestand ein Bauunternehmen vor dem Konkurs?',
      answer:
        'Nein. Die häufigste Konkursursache in der Branche ist ein Liquiditätsproblem oder eine nicht gemessene reale Marge, nicht ein Mangel an laufenden Baustellen.',
    },
    {
      question: 'Warum kann eine «rentable» Baustelle trotzdem eine Liquiditätslücke verursachen?',
      answer:
        'Weil die Kosten (Löhne, Lieferanten) monatlich bezahlt werden, während Kunden oft erst nach 30-90 Tagen zahlen, was die Kasse selbst bei einer gewinnbringenden Baustelle austrocknen kann.',
    },
    {
      question: 'Was ist der beste Indikator für die finanzielle Gesundheit eines Bauunternehmens?',
      answer:
        'Der beste Indikator ist die Rentabilität, gemessen Baustelle für Baustelle, kombiniert mit einer kurzfristigen Liquiditätsprognose, da der globale Umsatz allein nichts über die reale Marge aussagt.',
    },
  ],
  relatedSlugs: [
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
