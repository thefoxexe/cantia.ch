import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-carreleur-facturation-au-m2-suisse',
  question: 'Wie sollte ein Plattenleger eine Offerte pro m² kalkulieren, ohne sich bei Zuschnitt und komplexer Verlegung zu verkalkulieren?',
  title: 'Plattenleger-Offerte: Warum der Preis pro m² allein nie ausreicht',
  description:
    'Plattenformat, Verlegemuster, Zuschnitte, Verlegepläne: All das lässt die Verlegezeit bei gleicher Fläche stark schwanken. So bauen Sie das korrekt in die Offerte ein.',
  excerpt:
    'Zwei gleich grosse Räume, mit demselben Material verlegt, können je nach Plattenformat und Verlegemuster doppelt so viel Zeit beanspruchen: Der Preis pro m² allein erzählt nie die ganze Geschichte.',
  category: 'Métiers du bâtiment',
  keywords: ['Offerte Plattenleger', 'Preis Plattenbelag pro m2 Schweiz', 'Verrechnung Plattenverlegung', 'Verlegeplan Offerte', 'Zuschnitt Platten Verlegezeit'],
  publishedAt: '2026-09-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Der Kunde vergleicht Plattenleger-Offerten ganz natürlich anhand des Preises pro m², weil das die Zahl ist, die hängen bleibt. Doch diese Zahl allein sagt nichts über die tatsächliche Verlegezeit aus, die stark vom Plattenformat, dem gewählten Muster (gerade, diagonal, Fischgrät) und der Anzahl Zuschnitte um Ecken, Steckdosen oder bereits vorhandene Sanitäranschlüsse abhängt.',
    },
    { type: 'h2', text: 'Was die Verlegezeit bei gleicher Fläche verändert' },
    {
      type: 'list',
      items: [
        'Grossformat (60x60 und mehr): schnellere Verlegung pro m², aber heiklere Handhabung und anspruchsvollere Nivellierung',
        'Kleinformat oder Mosaik: deutlich mehr Fugen, dadurch pro m² eine wesentlich höhere Verlegezeit',
        'Muster Diagonal oder Fischgrät: mehr Zuschnitte als eine klassische gerade Verlegung, oft 20 bis 30 % mehr Zeit',
        'Anzahl Ecken, Leitungen und bereits verlegter Sanitäranschlüsse, um die herum zugeschnitten werden muss',
      ],
    },
    {
      type: 'stat',
      value: '+20-30 %',
      label: 'typische zusätzliche Verlegezeit bei einem Diagonal- oder Fischgrätmuster gegenüber gerader Verlegung, bei identischer Fläche',
    },
    { type: 'h2', text: 'Bruchreserve schon in der Offerte einplanen' },
    {
      type: 'p',
      text: 'Eine Plattenbestellung ohne Bruchreserve birgt das Risiko einer Notbestellung, bei der die gleiche Charge oder Farbnuance oft nicht mehr erhältlich ist. Wer bereits bei der Offerte eine Reserve von 8 bis 12 % je nach Komplexität der Verlegung einplant, vermeidet solche bösen Überraschungen mitten auf der Baustelle.',
    },
    {
      type: 'callout',
      title: 'Der Ausgleich des Untergrunds ist vor Baustellenbeginn nicht immer sichtbar',
      text: 'Ein Boden, der optisch eben wirkt, kann nach dem Entfernen des alten Belags einen Ausgleich (Nivelliermasse) erfordern. Diese Möglichkeit bereits in der Offerte einzuplanen (auch als separat ausgewiesene Option) erspart eine Preisverhandlung mitten in der Bauphase.',
    },
    {
      type: 'cta',
      title: 'Offerten, die Ihre Preise pro Format und Muster behalten',
      text: 'Cantia speichert Ihren Preiskatalog (Format, Muster, Bruchreserve), damit Sie eine stimmige Plattenleger-Offerte in wenigen Minuten erstellen, ohne bei jeder neuen Baustelle alles neu zu berechnen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum können zwei Plattenleger-Offerten bei identischer Fläche stark unterschiedliche Preise haben?',
      answer:
        'Das Plattenformat, das Verlegemuster (gerade, diagonal, Fischgrät) und die Anzahl Zuschnitte um Hindernisse lassen die tatsächliche Verlegezeit auch bei gleicher Fläche stark schwanken.',
    },
    {
      question: 'Welche Bruchreserve sollte man bei einer Plattenbestellung einplanen?',
      answer:
        'In der Regel zwischen 8 und 12 %, je nach Komplexität der Verlegung, da ein Muster mit vielen Zuschnitten mehr Platten verbraucht als eine einfache gerade Verlegung.',
    },
    {
      question: 'Sollte der Ausgleich des Untergrunds in der ursprünglichen Plattenleger-Offerte enthalten sein?',
      answer:
        'Das wird empfohlen, mindestens als separat ausgewiesene Option, da der tatsächliche Zustand des Untergrunds oft erst nach Entfernen des alten Belags sichtbar wird.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'checklist-ouverture-chantier-artisan',
    'devis-menuisier-sur-mesure-facturation-suisse',
  ],
};
