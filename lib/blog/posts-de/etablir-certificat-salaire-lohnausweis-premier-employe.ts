import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'etablir-certificat-salaire-lohnausweis-premier-employe',
  question: 'Wie erstellt man den Lohnausweis für den ersten Mitarbeitenden im Baugewerbe?',
  title: 'Lohnausweis erstellen: so geht es beim ersten Mitarbeitenden',
  description:
    'Der jährliche Lohnausweis für Baubetriebe mit dem ersten Mitarbeitenden: Pflichtangaben, offizielles Formular, Frist und Bezug zur Steuererklärung.',
  excerpt:
    'Eine jährliche Pflicht, die oft im ungünstigsten Moment kommt, mitten im Winter, wenn die Baustellen ohnehin ruhiger werden. Was der Lohnausweis enthalten muss und wie Sie ihn fehlerfrei erstellen.',
  category: 'RH & salaires',
  keywords: [
    'Lohnausweis erster Mitarbeiter',
    'Lohnausweis Baufirma',
    'Lohnausweis erstellen Schweiz',
    'offizielles Formular Lohnausweis',
    'Geschäftsfahrzeug Lohnausweis Privatanteil',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Den ersten Mitarbeitenden einzustellen, verändert den administrativen Alltag eines Baubetriebs stark. Eine der am wenigsten sichtbaren Pflichten am Anfang ist der Lohnausweis, jedes Jahr und für jede angestellte Person. Er ist ein schweizweit standardisiertes Dokument, keine selbst gestaltete Bestätigung, und er ist direkt die Grundlage für die Steuererklärung der Mitarbeitenden.',
    },
    { type: 'h2', text: 'Warum der Lohnausweis jedes Jahr Pflicht ist' },
    {
      type: 'p',
      text: 'Jeder Arbeitgeber muss für jede Person, die im Kalenderjahr bei ihm angestellt war, einen jährlichen Lohnausweis ausstellen, ob der Vertrag das ganze Jahr oder nur einige Monate gedauert hat. Die Mitarbeitenden brauchen ihn für ihre eigene Steuererklärung, und die Steuerverwaltung prüft damit, ob die Angaben von Arbeitgeber und Arbeitnehmer übereinstimmen.',
    },
    { type: 'h2', text: 'Was der Lohnausweis enthalten muss' },
    {
      type: 'list',
      items: [
        'Den gesamten Bruttojahreslohn, einschliesslich allfälliger Prämien, des 13. Monatslohns und regelmässiger Zulagen.',
        'Die abgezogenen Sozialbeiträge (AHV/IV/EO, Arbeitslosenversicherung, BVG, gegebenenfalls Nichtberufsunfallversicherung).',
        'Die Naturalleistungen, im Bau am häufigsten die private Nutzung eines Geschäftsfahrzeugs, die bewertet und zum massgebenden Lohn gerechnet werden muss.',
        'Separat vergütete Berufsauslagen, für die andere Deklarationsregeln gelten als für den eigentlichen Lohn.',
      ],
    },
    { type: 'h2', text: 'Das offizielle Formular und die Frist' },
    {
      type: 'p',
      text: 'Der Lohnausweis folgt einem offiziellen, in der ganzen Schweiz anerkannten Muster, das in Buchhaltungs- und Lohnprogrammen oder direkt bei der kantonalen Steuerverwaltung erhältlich ist. Er wird in der Regel Anfang des Folgejahres übergeben, bevor die Mitarbeitenden ihn ihrer Steuererklärung beilegen müssen. Wer das Unternehmen im Lauf des Jahres verlässt, erhält den Lohnausweis beim Austritt, ohne bis zum Jahresende zu warten.',
    },
    {
      type: 'callout',
      title: 'Am häufigsten vergessen: das Geschäftsfahrzeug',
      text: 'Sobald ein Mitarbeitender ein Firmenfahrzeug auch privat nutzt, selbst gelegentlich, muss dieser Vorteil pauschal oder effektiv bewertet auf dem Lohnausweis stehen. Das wird im ersten Anstellungsjahr oft vergessen und von der Steuerverwaltung regelmässig geprüft.',
    },
    {
      type: 'cta',
      title: 'Die Löhne des ersten Mitarbeitenden, ohne jeden Winter den Lohnausweis neu zu erfinden',
      text: 'Cantia führt Löhne und Naturalleistungen wie Geschäftsfahrzeuge das ganze Jahr über nach, damit der Lohnausweis keine Rekonstruktion in letzter Minute wird.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Braucht es auch für Mitarbeitende, die im Lauf des Jahres eingestellt wurden, einen Lohnausweis?',
      answer:
        'Ja, der Lohnausweis deckt die tatsächlich gearbeitete Zeit im Kalenderjahr ab, auch wenn es nur einige Monate sind. Es gibt keine Mindestdauer der Anstellung, unter der die Pflicht entfällt.',
    },
    {
      question: 'Ist der Lohnausweis dasselbe wie die Lohnmeldung an die AHV-Ausgleichskasse?',
      answer:
        'Nein, es sind zwei verschiedene Dokumente für verschiedene Empfänger: Der Lohnausweis geht an die Mitarbeitenden für ihre Steuererklärung, die jährliche Lohnmeldung an die AHV-Ausgleichskasse.',
    },
    {
      question: 'Wie wird die private Nutzung eines Geschäftsfahrzeugs auf dem Lohnausweis bewertet?',
      answer:
        'Meist mit einem monatlichen Pauschalbetrag in Prozent des Kaufpreises des Fahrzeugs, ausser es wird eine genauere effektive Abrechnung geführt. Die genauen Regeln klären Sie mit Ihrem Treuhänder oder der kantonalen Steuerverwaltung.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'seuil-lpp-affiliation-employe-batiment',
  ],
};
