import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sous-traitant-batiment-suisse-contrat-facturation',
  question: 'Wie führt man einen Subunternehmer auf einer Schweizer Baustelle (Vertrag, Haftung, Fakturierung)?',
  title: 'Subunternehmer im Bau in der Schweiz: Vertrag, Haftung und Fakturierung',
  description:
    'Ein Subunternehmer zu beauftragen verpflichtet den Hauptunternehmer auf mehreren Ebenen: Haftung gegenüber dem Kunden, Prüfung der Versicherungen und präzise Nachverfolgung der erhaltenen Rechnungen pro Baustelle.',
  excerpt:
    'Subunternehmen entbindet den Hauptunternehmer nie von seiner Haftung gegenüber dem Kunden. Das verbreitetste – und teuerste – Missverständnis im Westschweizer Baugewerbe.',
  category: 'Chantier & rentabilité',
  keywords: ['subunternehmer bau schweiz', 'subunternehmen baugewerbe', 'haftung hauptunternehmer', 'werkvertrag subunternehmer', 'rechnung subunternehmer'],
  publishedAt: '2026-02-12',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Einen Subunternehmer beizuziehen ist im Schweizer Baugewerbe gängige Praxis: Eine Renovationsbaustelle vereint fast immer mehrere Gewerke, die ein einzelnes Unternehmen nicht abdeckt. Was viele erst zu spät entdecken: Subunternehmen entbindet den Hauptunternehmer nie von seiner Haftung gegenüber dem Kunden.',
    },
    { type: 'h2', text: 'Die Haftung lässt sich nicht sub-unternehmen' },
    {
      type: 'p',
      text: 'Gegenüber dem Kunden bleibt der Hauptunternehmer für das Ergebnis des Werks verantwortlich, auch wenn ein Teil der Arbeit einem Subunternehmer übertragen wurde. Der Kunde hat grundsätzlich kein direktes Vertragsverhältnis mit dem Subunternehmer. Es handelt sich um einen separaten Vertrag zwischen dem Hauptunternehmer und ihm. Bei einem Mangel des Subunternehmers haftet zunächst der Hauptunternehmer gegenüber dem Kunden, bevor er sich allenfalls an seinen Subunternehmer wenden kann.',
    },
    {
      type: 'callout',
      title: 'Versicherungen vor der Unterschrift prüfen, nicht nach einem Schadenfall',
      text: 'Vor der Beauftragung eines Subunternehmers prüfen, ob dieser über eine gültige Berufshaftpflichtversicherung verfügt und für sein Personal korrekt bei den Sozialversicherungen angemeldet ist. Eine Lücke hier fällt potenziell auf den Hauptunternehmer zurück, und der schlechteste Moment, dies zu entdecken, ist mitten in einem Schadenfall.',
    },
    { type: 'h2', text: 'Was ein Subunternehmervertrag festhalten sollte' },
    {
      type: 'list',
      items: [
        'Den genauen Umfang der übertragenen Arbeiten, mit klaren Abgrenzungen gegenüber den anderen Gewerken der Baustelle',
        'Den vereinbarten Preis und die Zahlungsmodalitäten (Anzahlung, Zahlungsplan, Frist nach Abnahme)',
        'Die Ausführungsfristen, koordiniert mit dem Gesamtplanung der Baustelle',
        'Die geltenden Garantien und deren Dauer, im Einklang mit dem, was der Hauptunternehmer dem Endkunden selbst versprochen hat',
        'Den ausdrücklichen Verweis auf die SIA-Norm 118, falls sie für den Hauptvertrag gilt, um eine Diskrepanz zwischen den beiden Vertragsebenen zu vermeiden',
      ],
    },
    { type: 'h2', text: 'Der eigentliche Reibungspunkt: nicht das Juristische, sondern die finanzielle Nachverfolgung' },
    {
      type: 'p',
      text: 'Über den Vertrag hinaus ist die häufigste Schwierigkeit im Alltag viel bodenständiger: Wie viel wurde diesem Subunternehmer bereits verrechnet, wie viel bleibt geschuldet, ist er gleichzeitig auf mehreren Baustellen tätig? Ohne zentralisierte Nachverfolgung pro Baustelle geht eine erhaltene Rechnung leicht verloren oder wird bei der Rentabilitätsberechnung der falschen Baustelle zugeordnet, ohne dass es jemand vor dem Abschluss bemerkt.',
    },
    {
      type: 'p',
      text: 'Genau das sind die Daten, die in die Rentabilitätsberechnung einer Baustelle einfliessen: Eine falsch erfasste Subunternehmer-Rechnung verfälscht die angezeigte Marge stillschweigend, in die eine oder andere Richtung.',
    },
    {
      type: 'cta',
      title: 'Ein Verzeichnis der Subunternehmer, verknüpft mit Ihren Baustellen',
      text: 'Cantia zentralisiert Ihre Subunternehmer, deren Einsätze pro Baustelle und die erhaltenen Rechnungen, direkt verknüpft mit der Rentabilitätsberechnung der betreffenden Baustelle.',
      buttonLabel: 'Modul Subunternehmer entdecken',
    },
  ],
  faq: [
    {
      question: 'Wer haftet gegenüber dem Kunden bei einem Mangel eines Subunternehmers?',
      answer:
        'Der Hauptunternehmer bleibt gegenüber dem Endkunden verantwortlich, da der Subunternehmer grundsätzlich kein direktes Vertragsverhältnis zu diesem hat. Der Hauptunternehmer kann sich anschliessend auf Basis des eigenen Vertrags an seinen Subunternehmer wenden.',
    },
    {
      question: 'Muss man die Versicherungen eines Subunternehmers vor der Beauftragung prüfen?',
      answer:
        'Ja: Insbesondere seine Berufshaftpflichtversicherung und seine Anmeldung bei den Sozialversicherungen (UVG) für sein Personal sollten geprüft werden, da eine Lücke Konsequenzen für den Hauptunternehmer haben kann.',
    },
    {
      question: 'Muss der Subunternehmervertrag die SIA-Norm 118 des Hauptvertrags übernehmen?',
      answer:
        'Das wird empfohlen, wenn der Hauptvertrag selbst darauf verweist, um eine Diskrepanz bei Garantien oder Fristen zwischen den beiden Vertragsebenen zu vermeiden.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'suivre-rentabilite-chantier-sans-excel',
    'norme-sia-118-devis-obligatoire',
  ],
};
