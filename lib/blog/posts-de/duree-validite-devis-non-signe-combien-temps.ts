import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'duree-validite-devis-non-signe-combien-temps',
  question: 'Wie lange bleibt eine nicht unterzeichnete Offerte gültig, bevor man sie neu erstellen muss?',
  title: 'Wie lange bleibt eine Offerte in der Schweiz gültig (und warum es alles verändert, dies zu präzisieren)',
  description:
    'Ohne ausdrücklichen Vermerk hat eine nicht unterzeichnete Offerte keine fest gesetzliche Gültigkeitsdauer, was das Unternehmen dem Risiko aussetzt, einen alten Preis einhalten zu müssen, obwohl Material und Arbeitskosten inzwischen gestiegen sind.',
  excerpt:
    'Sofern das Dokument keine ausdrückliche Frist nannte, kann ein Kunde, der drei Monate später mit «Ihrer Offerte» zurückkommt, legitim denselben Preis erwarten.',
  category: 'Devis & facturation',
  keywords: ['gültigkeitsdauer offerte', 'nicht unterzeichnete offerte frist', 'offerte abgelaufen', 'wie lange offerte gültig', 'gültigkeit preisangebot'],
  publishedAt: '2026-06-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Eine Offerte verpflichtet das ausstellende Unternehmen, doch nichts im Obligationenrecht legt automatisch eine Gültigkeitsdauer fest. Ohne ausdrücklichen Vermerk auf dem Dokument kann ein Kunde legitim davon ausgehen, dass der Preis Monate später noch gilt, auch wenn sich die Kosten für Material oder Arbeit in der Zwischenzeit erhöht haben.',
    },
    { type: 'h2', text: 'Warum eine ausdrückliche Gültigkeitsangabe das Unternehmen schützt' },
    {
      type: 'list',
      items: [
        'Der Materialpreis schwankt, mitunter stark, innerhalb weniger Monate: eine Offerte ohne Frist zementiert ein finanzielles Risiko',
        'Eine spät angenommene Baustelle passt unter Umständen nicht mehr zur Planung oder Verfügbarkeit des Teams',
        'Ohne klare Grenze kann ein Kunde selbst nach einem Jahr auf dem ursprünglichen Preis bestehen, sofern das Unternehmen nicht formell widerspricht',
      ],
    },
    {
      type: 'stat',
      value: '30 Tage',
      label: 'gängigste Gültigkeitsdauer für eine Offerte im Schweizer Bauwesen (eine übliche Praxis, keine gesetzliche Pflicht)',
    },
    { type: 'h2', text: 'Wie man es korrekt formuliert' },
    {
      type: 'p',
      text: 'Ein einfacher Satz genügt: «Diese Offerte ist 30 Tage ab Ausstellungsdatum gültig. Nach Ablauf dieser Frist kann eine Preisanpassung erforderlich sein.» Dieser Vermerk verwandelt eine potenzielle Unklarheit in eine klare Regel, die vom Kunden bereits beim Lesen des Dokuments akzeptiert wird, ohne spätere Verhandlung.',
    },
    {
      type: 'callout',
      title: 'Gültigkeitsdauer und rechtliche Gültigkeit der Offerte sind zwei verschiedene Dinge',
      text: 'Eine Offerte bleibt rechtlich verbindlich, solange sie nicht zurückgezogen wurde, selbst nach ihrer indikativen Gültigkeitsfrist. Der Vermerk schützt vor allem die Preiskonsistenz, nicht das Bestehen der Verpflichtung selbst.',
    },
    {
      type: 'cta',
      title: 'Eine Gültigkeitsdauer, automatisch angewendet',
      text: 'Cantia berechnet und zeigt die Gültigkeitsdauer jeder Offerte anhand der Einstellungen Ihres Unternehmens an, ohne dass Sie bei jedem Dokument daran denken müssen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Hat eine Offerte in der Schweiz eine fest gesetzliche Gültigkeitsdauer?',
      answer:
        'Nein, kein Gesetz legt eine automatische Frist fest: Ohne ausdrücklichen Vermerk auf dem Dokument kann die Offerte als unbegrenzt gültig gelten.',
    },
    {
      question: 'Welche Gültigkeitsdauer sollte man für eine Offerte für Bauarbeiten wählen?',
      answer:
        '30 Tage ist die gängigste Praxis im Schweizer Bauwesen, doch nichts spricht dagegen, diese Frist je nach Preisvolatilität der betreffenden Baustelle anzupassen.',
    },
    {
      question: 'Was passiert, wenn ein Kunde eine Offerte nach Ablauf ihrer Gültigkeitsdauer annimmt?',
      answer:
        'Das Unternehmen kann eine Preisanpassung verlangen, sofern der Gültigkeitsvermerk klar auf dem ursprünglichen Dokument angegeben war.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
    'devis-gratuit-ou-payant-que-dit-la-loi',
  ],
};
