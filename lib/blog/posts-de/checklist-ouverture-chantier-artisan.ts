import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-ouverture-chantier-artisan',
  question: 'Welche Checkliste sollte man vor der Eröffnung einer neuen Baustelle durchgehen?',
  title: 'Checkliste für den Baustellenstart: was vor dem ersten Spatenstich zu prüfen ist',
  description:
    'Eine Baustelle, die schlecht startet (fehlende Bewilligung, nicht erhaltene Anzahlung, ungeklärter Zugang), kostet Zeit und Geld, um das aufzuholen. Eine einfache Checkliste vermeidet die häufigsten bösen Überraschungen.',
  excerpt:
    'Die meisten Baustellenverzögerungen entstehen nicht durch ein technisches Unvorhergesehenes, sondern durch einen administrativen oder logistischen Punkt, der vor dem ersten Arbeitstag vergessen wurde.',
  category: 'Chantier & rentabilité',
  keywords: ['Checkliste Baustellenstart', 'Baustelle eröffnen Handwerk', 'Vorbereitung Baustelle Bau', 'Organisation Baustellenbeginn', 'Prüfliste Baustelle'],
  publishedAt: '2026-06-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine Baustelle, die gut startet, fällt selten auf. Es ist die schlecht gestartete Baustelle, die Zeit kostet. Die meisten Fehlstarts entstehen nicht durch ein unvorhersehbares technisches Problem, sondern durch einen administrativen oder logistischen Punkt, der schlicht vor dem ersten Tag vergessen wurde.',
    },
    { type: 'h2', text: 'Vor dem ersten Baustellentag' },
    {
      type: 'list',
      items: [
        'Offerte unterzeichnet und Anzahlung erhalten: eine Baustelle, die ohne eingegangene Anzahlung startet, geht ein vermeidbares finanzielles Risiko ein',
        'Nötige Bewilligungen eingeholt (Baubewilligung falls erforderlich, Bewilligung für die Baustelleneinrichtung je nach Gemeinde)',
        'Zugang zur Baustelle bestätigt (Schlüssel, Code, Zutrittszeiten bei bewohnten Objekten)',
        'Absicherung der Zone (Absperrung, Schutz empfindlicher bestehender Elemente)',
        'Fotografischer Zustandsbericht erstellt, bei Bedarf auch der unmittelbaren Nachbarschaft',
      ],
    },
    { type: 'h2', text: 'Beim eigentlichen Start' },
    {
      type: 'list',
      items: [
        'Team und Subunternehmer über den genauen Zeitplan und die Zugänge informiert',
        'Benötigtes Material und Materialien als verfügbar bestätigt, nicht nur bestellt',
        'Ein direkter Kontakt zum Kunden für die Dauer der Baustelle festgelegt, für dringende Fragen',
      ],
    },
    {
      type: 'callout',
      title: 'Der fotografische Zustandsbericht ist der günstigste Schutz der Baustelle',
      text: 'Ein paar Minuten Fotos vor Arbeitsbeginn vermeiden wochenlange Diskussionen bei späteren Streitigkeiten über den ursprünglichen Zustand eines Elements der Baustelle oder der Nachbarschaft.',
    },
    {
      type: 'cta',
      title: 'Jede Baustelle ab dem ersten Tag dokumentiert',
      text: 'Cantia zentralisiert Offerte, Anzahlung, eingeteiltes Team und Fotos bereits ab der Baustelleneröffnung, sodass sich die Checkliste fast von selbst abhaken lässt.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum den Zustand vor Baustellenbeginn dokumentieren?',
      answer:
        'Um sich bei späteren Streitigkeiten zu schützen. Ohne datierten Nachweis des ursprünglichen Zustands wird es unmöglich zu belegen, dass ein Schaden nicht durch die Baustelle verursacht wurde.',
    },
    {
      question: 'Muss man den Eingang der Anzahlung abwarten, bevor man startet?',
      answer:
        'Das ist dringend empfohlen, denn ein Start ohne eingegangene Anzahlung bedeutet ein vermeidbares finanzielles Risiko, besonders bei einer Baustelle von beträchtlicher Grösse.',
    },
    {
      question: 'Was ist die häufigste Ursache für einen Fehlstart einer Baustelle?',
      answer:
        'Ein vergessener administrativer oder logistischer Punkt (fehlende Bewilligung, nicht bestätigter Zugang) viel häufiger als ein tatsächliches technisches Unvorhergesehenes.',
    },
  ],
  relatedSlugs: [
    'checklist-cloture-chantier-avant-facturation',
    'photos-chantier-preuve-juridique-litige',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
