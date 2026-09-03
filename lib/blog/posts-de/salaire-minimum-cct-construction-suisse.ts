import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'salaire-minimum-cct-construction-suisse',
  question: 'Wie hoch ist der Mindestlohn im Bauhauptgewerbe der Schweiz (GAV Bau)?',
  title: 'Mindestlohn im Bauhauptgewerbe Schweiz: was der GAV festlegt',
  description:
    'Der Mindestlohn im Schweizer Bauhauptgewerbe wird durch den Landesmantelvertrag für das Bauhauptgewerbe festgelegt, nicht durch ein Bundesgesetz. Der GAV 2026-2031 ändert zudem mehrere Regeln.',
  excerpt:
    'Es gibt keinen gesetzlichen Mindestlohn auf Bundesebene in der Schweiz: Im Bauhauptgewerbe legt der Gesamtarbeitsvertrag der Branche die Untergrenzen fest, und der wurde für 2026 gerade geändert.',
  category: 'RH & salaires',
  keywords: ['mindestlohn bau schweiz', 'lmv bauhauptgewerbe', 'gesamtarbeitsvertrag bau', 'bauhauptgewerbe lohn', 'lohn bau schweiz 2026'],
  publishedAt: '2026-03-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Die Schweiz kennt keinen gesetzlichen Mindestlohn auf Bundesebene. Einige Kantone legen einen für die Gesamtwirtschaft fest, aber im Bauhauptgewerbe zählt vor allem der Landesmantelvertrag für das Bauhauptgewerbe (LMV), ein allgemeinverbindlich erklärter GAV, der praktisch alle Unternehmen der Branche bindet, unabhängig von einer Mitgliedschaft.',
    },
    { type: 'h2', text: 'Eine Untergrenze pro Beruf und Region, keine einheitliche Zahl' },
    {
      type: 'p',
      text: 'Der Mindestlohn variiert je nach Qualifikation (ungelernter Arbeiter, gelernter Arbeiter, Vorarbeiter) und je nach Lohnregion, da die Kantone oder Zonen nicht alle auf demselben Ansatz basieren. Ein gelernter Arbeiter in Genf und dasselbe Profil in einer ländlichen Zone eines anderen Kantons starten nicht vom selben garantierten Minimum aus.',
    },
    {
      type: 'callout',
      title: 'Was sich mit dem LMV 2026-2029/2031 ändert',
      text: 'Für 2026 bleiben die Mindestlöhne gegenüber 2025 grösstenteils unverändert (die Teuerungsanpassung von +0,2 % ist eingerechnet), eine echte Aufwertung ist erst ab 2027 vorgesehen. Dagegen ändert der neue Vertrag die Regelung der Überstunden erheblich (ein Punkt, der die reale Lohnabrechnung deutlich stärker beeinflusst als eine Anpassung der Lohnuntergrenze).',
    },
    { type: 'h2', text: 'Das Ausbaugewerbe folgt eigenen GAV' },
    {
      type: 'p',
      text: 'Der Landesmantelvertrag deckt das Bauhauptgewerbe ab (Maurerarbeiten, Tiefbau). Andere Berufe (Gipser-Maler, Schreinerei, Sanitärinstallationen, Elektrizität) unterliegen eigenen Gesamtarbeitsverträgen mit eigenen Mindestlöhnen und eigenen Regeln. Ein Unternehmer, der mehrere Gewerke beschäftigt, kann sich dadurch verpflichtet sehen, je nach Position jedes Mitarbeitenden mehrere unterschiedliche GAV anzuwenden.',
    },
    { type: 'h2', text: 'Wo man die richtige Zahl prüft' },
    {
      type: 'list',
      items: [
        'Der anwendbare Vertrag hängt vom tatsächlich ausgeübten Beruf ab, nicht nur von der Bezeichnung der Stelle im Vertrag',
        'Die Lohnansätze werden jedes Jahr aktualisiert, eine vor zwei Jahren gelernte Zahl ist deshalb nie ein sicherer Wert',
        'Ausgleichskassen und Berufsverbände der Branche veröffentlichen jedes Jahr die aktuellen Lohnskalen',
      ],
    },
    {
      type: 'cta',
      title: 'Die Löhne des Teams, ein Satz pro Person',
      text: 'Das Modul Personal & Löhne von Cantia erlaubt es, für jeden Mitarbeitenden einen individuellen Stundensatz zu konfigurieren – praktisch, um GAV-Skalen abzubilden, die je nach Qualifikation und Beruf variieren.',
      buttonLabel: 'Personal & Löhne entdecken',
    },
  ],
  faq: [
    {
      question: 'Gibt es einen gesetzlichen Mindestlohn auf Bundesebene in der Schweiz?',
      answer:
        'Nein, der Bund legt keinen nationalen Mindestlohn fest. Im Bauhauptgewerbe sind es die Gesamtarbeitsverträge (GAV) der Branche, die verbindliche Mindestlöhne festlegen.',
    },
    {
      question: 'Ist der Mindestlohn im Baugewerbe überall in der Schweiz gleich?',
      answer:
        'Nein, der Landesmantelvertrag für das Bauhauptgewerbe legt je nach Lohnregion und Qualifikation des Arbeiters unterschiedliche Mindestlöhne fest.',
    },
    {
      question: 'Was ändert sich mit dem GAV Bau 2026?',
      answer:
        'Die Mindestlöhne bleiben 2026 weitgehend stabil, eine echte Aufwertung ist erst ab 2027 vorgesehen. Die bedeutendste Änderung betrifft die Überstundenregelung (gedeckelte jährliche Übertragung, Zuschlag von 25 % darüber hinaus).',
    },
  ],
  relatedSlugs: [
    'heures-supplementaires-batiment-majoration-25',
    'calculer-13e-salaire-prorata-employe',
    'indemnites-kilometriques-2026-nouveau-taux',
  ],
};
