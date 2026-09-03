import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'travail-au-noir-batiment-suisse-risques-controles',
  question: 'Welche Risiken birgt Schwarzarbeit im Baugewerbe in der Schweiz?',
  title: 'Schwarzarbeit im Baugewerbe: Was ein Unternehmen wirklich riskiert',
  description:
    'Das Baugewerbe gehört zu den am stärksten von der BGSA kontrollierten Branchen. 2025 fanden über 14’000 Betriebskontrollen statt: Die Sanktionen gehen weit über die Busse hinaus.',
  excerpt:
    'Das Baugewerbe zählt zu den am stärksten kontrollierten Branchen der Schweiz. Und die schwerste Sanktion ist nicht die Busse. Es ist der Ausschluss von öffentlichen Aufträgen.',
  category: 'Juridique & normes',
  keywords: ['schwarzarbeit baugewerbe schweiz', 'bgsa kontrolle', 'baustellenkontrolle', 'sanktionen bauunternehmen', 'seco schwarzarbeit'],
  publishedAt: '2026-04-30',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Das Baugewerbe ist in der Schweiz keine «wie jede andere» kontrollierte Branche. Es ist eine der am stärksten anvisierten Branchen bei Kontrollen im Rahmen des Gesetzes gegen die Schwarzarbeit. 2025 wurden schweizweit rund 14’450 Betriebskontrollen durchgeführt, wobei das Gastgewerbe und das Baugewerbe ausdrücklich als prioritäre Branchen genannt wurden.',
    },
    { type: 'h2', text: 'Was das BGSA genau abdeckt' },
    {
      type: 'p',
      text: 'Das Bundesgesetz vom 17. Juni 2005 über Massnahmen zur Bekämpfung der Schwarzarbeit (BGSA), mit seiner Ausführungsverordnung (VOSA), soll sicherstellen, dass die Melde- und Bewilligungspflichten im Sozialversicherungsrecht, im Ausländerrecht und bei der Quellensteuer korrekt eingehalten werden – nicht nur bei völliger Nichtanmeldung, sondern auch bei teilweisen oder unvollständigen Anmeldungen.',
    },
    {
      type: 'callout',
      title: 'Die schwerste Sanktion ist nicht finanzieller Natur',
      text: 'Über die Bussen hinaus kann eine rechtskräftige Verurteilung wegen schwerer oder wiederholter Verstösse für ein mit der öffentlichen Hand arbeitendes Unternehmen den Ausschluss von öffentlichen Aufträgen sowie die Streichung oder Kürzung öffentlicher Finanzhilfen nach sich ziehen – zwei Folgen, die auf Dauer oft schwerer wiegen als die Busse selbst.',
    },
    { type: 'h2', text: 'Was eine Kontrolle auf der Baustelle auslöst' },
    {
      type: 'list',
      items: [
        'Eine unangemeldete direkte Kontrolle auf der Baustelle durch kantonale oder paritätische Inspektoren',
        'Eine Meldung (Konkurrent, Nachbar, ehemaliger Mitarbeiter), die eine gezielte Überprüfung auslöst',
        'Eine Querkontrolle im Rahmen einer Inspektion bei einem anderen Unternehmen derselben Baustelle (insbesondere einem Subunternehmer)',
      ],
    },
    { type: 'h2', text: 'Sich als Hauptunternehmen schützen' },
    {
      type: 'p',
      text: 'Das Risiko beschränkt sich nicht auf die eigenen Mitarbeitenden: Ein Unternehmen, das einen nicht ordnungsgemäss angemeldeten Subunternehmer beizieht, kann auf der eigenen Baustelle mit dem Problem in Verbindung gebracht werden, selbst ohne direktes Verschulden. Vor der Unterzeichnung zu prüfen, ob ein Subunternehmer in Ordnung ist (Anmeldung bei den Sozialversicherungen, gegebenenfalls Bewilligungen für ausländisches Personal), schützt vor diesem Ansteckungseffekt.',
    },
    {
      type: 'p',
      text: 'Für das Unternehmen selbst bleibt der beste Schutz der einfachste: eine aktuelle Anmeldung jedes Mitarbeitenden, ordnungsgemässe Arbeitsverträge und eine klare Aufzeichnung der tatsächlich geleisteten Stunden. Das ist genau die Art von Dokumentation, die bei einer Kontrolle als Erstes verlangt wird.',
    },
    {
      type: 'cta',
      title: 'Die Stunden des Teams, pro Baustelle nachverfolgt',
      text: 'Das Modul Personal & Löhne von Cantia führt eine klare Historie der von jedem Mitarbeitenden geleisteten Stunden, Baustelle für Baustelle – eine solide Grundlage im Falle einer Kontrolle.',
      buttonLabel: 'Personal & Löhne entdecken',
    },
  ],
  faq: [
    {
      question: 'Wird das Baugewerbe in der Schweiz besonders stark kontrolliert?',
      answer:
        'Ja, es ist eine der ausdrücklich als prioritär genannten Branchen bei BGSA-Kontrollen, neben dem Gastgewerbe, wobei jährlich Zehntausende Personen kontrolliert werden.',
    },
    {
      question: 'Was ist die schwerste Sanktion bei festgestellter Schwarzarbeit?',
      answer:
        'Über die Bussen hinaus kann eine Verurteilung wegen schwerer oder wiederholter Verstösse zum Ausschluss von öffentlichen Aufträgen und zur Streichung von Finanzhilfen führen – Folgen, die auf Dauer oft schwerer wiegen.',
    },
    {
      question: 'Riskiert ein Unternehmen etwas, wenn sein Subunternehmer einen Verstoss begeht?',
      answer:
        'Es kann auf der eigenen Baustelle mit dem Problem in Verbindung gebracht werden, selbst ohne direktes Verschulden. Daher lohnt es sich, die Konformität eines Subunternehmers vor der Beauftragung zu prüfen.',
    },
  ],
  relatedSlugs: [
    'sous-traitant-batiment-suisse-contrat-facturation',
    'salaire-minimum-cct-construction-suisse',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
