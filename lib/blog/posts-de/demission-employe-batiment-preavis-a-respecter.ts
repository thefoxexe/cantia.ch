import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'demission-employe-batiment-preavis-a-respecter',
  question: 'Ein Mitarbeiter im Bauwesen kündigt: welche Kündigungsfrist muss er einhalten?',
  title: 'Kündigung eines Mitarbeiters im Bauwesen: die einzuhaltende Kündigungsfrist (und was passiert, wenn sie nicht eingehalten wird)',
  description:
    'Die Kündigungsfrist bei einer Kündigung durch den Arbeitnehmer folgt denselben Regeln wie bei einer Entlassung. Ein Mitarbeiter, der ohne sie zu respektieren geht, setzt das Unternehmen jedoch einem organisatorischen Mangel aus, den es in gewissen Fällen geltend machen kann.',
  excerpt:
    'Ein Bauarbeiter, der seinen Weggang „in zwei Wochen" ankündigt, kann nicht immer so schnell gehen, denn die Kündigungsfrist gilt in beide Richtungen, für Arbeitgeber wie Arbeitnehmer.',
  category: 'RH & salaires',
  keywords: ['Kündigung Mitarbeiter Kündigungsfrist', 'Kündigungsfrist Bau', 'Kündigungsfrist Mitarbeiter Bauwesen', 'Weggang Mitarbeiter ohne Kündigungsfrist', 'GAV Bau Kündigung'],
  publishedAt: '2026-06-29',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Die Kündigungsfrist bei einer Kündigung durch den Arbeitnehmer folgt genau denselben Regeln wie bei einer Entlassung (Art. 335c OR, vorbehältlich einer günstigeren Bestimmung im GAV). Es gibt kein flexibleres Regime für einen Mitarbeiter, der selbst entscheidet zu gehen: Ein Bauarbeiter, der einen sofortigen Weggang oder einen Weggang „in zwei Wochen" ankündigt, ohne dass diese Frist vertraglich vereinbar ist, bleibt grundsätzlich an die normale Kündigungsfrist gebunden.',
    },
    { type: 'h2', text: 'Die anwendbaren Fristen (vorbehältlich eines günstigeren GAV)' },
    {
      type: 'table',
      headers: ['Dienstalter', 'Kündigungsfrist'],
      rows: [
        ['Während der Probezeit', '7 Tage'],
        ['1. Dienstjahr', '1 Monat auf Ende eines Monats'],
        ['2. bis 9. Dienstjahr', '2 Monate auf Ende eines Monats'],
        ['Ab dem 10. Dienstjahr', '3 Monate auf Ende eines Monats'],
      ],
    },
    { type: 'h2', text: 'Was tun, wenn ein Mitarbeiter geht, ohne seine Kündigungsfrist einzuhalten' },
    {
      type: 'list',
      items: [
        'Der Arbeitgeber kann eine Entschädigung in Höhe des Lohns verlangen, den der Mitarbeiter erhalten hätte, wenn er die Frist eingehalten hätte',
        'Verursacht die Abwesenheit einen zusätzlichen konkreten Schaden (verrechenbare Baustellenverzögerung, Vertragsstrafe), kann dieser ebenfalls geltend gemacht werden, sofern er dokumentiert ist',
        'In der Praxis wird dieser Rechtsanspruch selten bis zum Ende durchgesetzt, aber seine Existenz wiegt in der Verhandlung eines einvernehmlich vorgezogenen Weggangs',
      ],
    },
    {
      type: 'callout',
      title: 'Ein ausgehandelter vorzeitiger Weggang bleibt fast immer einem Konflikt vorzuziehen',
      text: 'Eine verkürzte Kündigungsfrist im Austausch für eine organisierte Übergabe (Übergabe, Einarbeitung eines Nachfolgers) zu akzeptieren, kostet das Unternehmen oft weniger als ein theoretisches Rechtsverfahren gegen einen bereits abgewanderten Mitarbeiter.',
    },
    {
      type: 'cta',
      title: 'Einen Weggang vorausplanen, ohne den Überblick über die Baustellen zu verlieren',
      text: 'Die Team-Planung von Cantia erlaubt es, Einteilungen rasch neu zu organisieren, sobald ein Weggang angekündigt wird, ohne bis zum letzten Moment zu warten.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Gilt für eine Kündigung durch den Arbeitnehmer dieselbe Frist wie bei einer Entlassung?',
      answer:
        'Ja, Art. 335c OR legt in beide Richtungen dasselbe Regime fest, vorbehältlich einer günstigeren Bestimmung eines anwendbaren GAV.',
    },
    {
      question: 'Was kann ein Arbeitgeber tun, wenn ein Mitarbeiter geht, ohne seine Kündigungsfrist einzuhalten?',
      answer:
        'Er kann eine Entschädigung in Höhe des Lohns für die nicht eingehaltene Frist verlangen, sowie einen zusätzlichen Schadenersatz, wenn ein konkreter und dokumentierter Schaden daraus entsteht.',
    },
    {
      question: 'Kann ein Mitarbeiter unter Berufung auf wichtige Gründe sofort gehen?',
      answer:
        'Ja, eine fristlose Kündigung aus wichtigem Grund (Mobbing, Nichtzahlung des Lohns) bleibt möglich, erfordert aber ernsthafte und dokumentierte Gründe, sonst setzt sie den Mitarbeiter selbst Konsequenzen aus.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'certificat-de-travail-obligation-employeur-batiment',
    'sous-effectif-chantier-recruter-ou-sous-traiter',
  ],
};
