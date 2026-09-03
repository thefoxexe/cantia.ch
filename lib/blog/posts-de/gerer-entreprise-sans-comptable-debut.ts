import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gerer-entreprise-sans-comptable-debut',
  question: 'Kann man sein Unternehmen zu Beginn der Tätigkeit ohne Buchhalter führen?',
  title: 'Das Unternehmen zu Beginn ohne Buchhalter führen: Wie weit das vernünftig ist',
  description:
    'Viele Selbstständige starten ohne Treuhandbüro, um zu sparen. Was sich realistisch selbst verwalten lässt, und der Moment, ab dem eine Begleitung notwendig wird.',
  excerpt:
    'Zu Beginn auf einen Buchhalter zu verzichten, ist an sich keine Unvorsichtigkeit: Es ist eine Frage, genau zu wissen, wo das aufhört, was man selbst verwalten kann, und wo es riskant wird.',
  category: 'Comparatifs & outils',
  keywords: ['unternehmen ohne buchhalter führen', 'ohne treuhänder starten schweiz', 'buchhaltung selbstständig anfänger', 'administration ohne buchhalter', 'selbstverwaltung bauunternehmen'],
  publishedAt: '2026-07-14',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein Treuhandbüro schon vom ersten Tag an zu beauftragen, stellt Kosten dar, die viele Selbstständige zu Beginn lieber vermeiden, wenn jeder Franken zählt. Sofern man genau weiss, was man selbst verwalten kann und was eine Begleitung braucht, ist das nicht unvernünftig.',
    },
    { type: 'h2', text: 'Was ein Selbstständiger in der Regel selbst verwalten kann' },
    {
      type: 'list',
      items: [
        'Das Ausstellen konformer Offerten und Rechnungen, mit einem Tool, das automatisch die richtigen Regeln anwendet',
        'Die grundlegende Liquiditätsübersicht: wer wann was bezahlen muss',
        'Die Archivierung der Dokumente, um im Fall einer Kontrolle eine Rechnung leicht wiederzufinden',
      ],
    },
    { type: 'h2', text: 'Was in der Regel eine Begleitung erfordert' },
    {
      type: 'list',
      items: [
        'Die MWST-Abrechnung, sobald die Steuerpflichtgrenze überschritten ist',
        'Der jährliche Rechnungsabschluss',
        'Die Sozialabgaben (AHV/IV) und ihre exakte Berechnung nach dem tatsächlichen Einkommen',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 100 000',
      label: 'umsatzschwelle, die in der Regel mit der obligatorischen MWST-Pflicht in der Schweiz verbunden ist (ein oft genannter Richtwert für die Entscheidung, ein Treuhandbüro beizuziehen)',
    },
    {
      type: 'callout',
      title: 'Ein gutes Verwaltungstool erleichtert dem Treuhandbüro die Arbeit, sobald es hinzukommt',
      text: 'Von Anfang an gut strukturierte Offerten und Rechnungen mit einer klaren Historie verringern die Zeit (und damit die Kosten), die ein Treuhandbüro später für die Übernahme der Buchhaltung benötigt.',
    },
    {
      type: 'cta',
      title: 'Eine saubere Grundlage ab dem ersten Dokument',
      text: 'Cantia strukturiert Offerten und Rechnungen automatisch konform. Eine solide Basis, ob Sie heute selbst verwalten oder morgen mit einem Treuhandbüro arbeiten.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann man seine Tätigkeit in der Schweiz ohne Treuhandbüro starten?',
      answer:
        'Ja, für die Grundaufgaben (Offerten, Rechnungen, Liquiditätsübersicht), doch die MWST-Abrechnung nach Erreichen der Steuerpflicht und der Jahresabschluss erfordern in der Regel eine Begleitung.',
    },
    {
      question: 'Ab welchem Umsatz sollte man ein Treuhandbüro in Betracht ziehen?',
      answer:
        'Die Schwelle der MWST-Pflicht (in der Regel CHF 100 000 Umsatz) ist oft der Richtwert, der zur professionellen Begleitung führt.',
    },
    {
      question: 'Ersetzt eine gute Verwaltungssoftware ein Treuhandbüro?',
      answer:
        'Nein, aber sie erleichtert die Arbeit des Treuhandbüros erheblich, sobald es beigezogen wird, indem sie von Anfang an eine saubere und konforme Dokumentenhistorie führt.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'logiciel-facturation-raison-individuelle-suisse',
    'gerer-entreprise-seul-sans-embaucher-outils',
  ],
};
