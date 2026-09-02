import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'avs-ai-independant-batiment',
  question: 'Wie funktionieren die AHV/IV-Beiträge für Selbständige im Bauwesen?',
  title: 'AHV/IV für Selbständige im Bauwesen: So funktioniert es',
  description:
    'AHV/IV/EO-Beiträge sind für jeden Schweizer Selbständigen ab 18 Jahren obligatorisch, berechnet auf dem Nettoeinkommen und degressiv unter CHF 60’500/Jahr. Der vollständige Leitfaden.',
  excerpt:
    'Die AHV/IV ist für Selbständige keine Option, anders als die 2. Säule. Und der angewandte Satz hängt von einer Schwelle ab, die fast niemand kennt.',
  category: 'Juridique & normes',
  keywords: ['AHV Beiträge Selbständige', 'IV Beiträge Bauwesen', 'Ausgleichskasse Beitragssatz', 'Nettoeinkommen AHV berechnen', 'Selbständigerwerbende AHV Schweiz'],
  publishedAt: '2026-01-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Wer sich im Bauwesen selbständig macht, löst ab dem vollendeten 18. Altersjahr eine obligatorische Anmeldung bei der AHV/IV/EO aus. Das ist einer der wenigen Punkte, die für einen Schweizer Selbständigen nie optional sind, unabhängig vom Umsatz.',
    },
    { type: 'h2', text: 'Auf welcher Grundlage der Beitrag wirklich berechnet wird' },
    {
      type: 'p',
      text: 'Ein Angestellter zahlt Beiträge auf einem festen Prozentsatz seines Bruttolohns. Ein Selbständiger zahlt Beiträge auf seinem Nettoeinkommen aus der Erwerbstätigkeit (nach Betriebskosten, vor Steuern). Die kantonale Ausgleichskasse (oder eine Berufskasse, je nach Branche) legt den Betrag jedes Jahr aufgrund der Steuerveranlagung fest, mit einer zeitlichen Verschiebung, die häufig überrascht: Die Akontobeiträge des laufenden Jahres sind provisorisch, und die definitive Abrechnung erfolgt erst, wenn die definitive Steuerveranlagung vorliegt (manchmal erst zwei Jahre später).',
    },
    {
      type: 'callout',
      title: 'Die Schwelle, die niemand überprüft',
      text: 'Unter einem Jahreseinkommen von CHF 60’500 ist der AHV/IV/EO-Beitragssatz degressiv, also deutlich tiefer als der volle Satz von rund 10 %, der darüber gilt. Viele Selbständige in der Startphase zahlen einen Satz, den sie für fix halten, obwohl er sich jedes Jahr mit ihrem Einkommen ändert.',
    },
    { type: 'h2', text: 'Ein Mindestbeitrag, auch bei null Einkommen' },
    {
      type: 'p',
      text: 'Selbst ein sehr geringes oder gar kein Einkommen in einem bestimmten Jahr befreit nicht von einem jährlichen Mindestbeitrag. Er sichert die Kontinuität der Ansprüche (künftige AHV-Rente, IV-Deckung) und verhindert Beitragslücken, die eine spätere Altersrente schmälern, oft ohne dass man es vor dem Rentenalter bemerkt.',
    },
    { type: 'h2', text: 'Sich anmelden, ohne zu zögern' },
    {
      type: 'list',
      items: [
        'Sich innert weniger Tage nach Aufnahme der Tätigkeit bei der kantonalen Ausgleichskasse oder einer Berufskasse des Bauwesens anmelden',
        'Eine Einkommensschätzung für das erste Jahr angeben (die provisorischen Akontobeiträge basieren darauf)',
        'Die Kasse passt den Betrag anschliessend an, sobald die definitive Steuerveranlagung vorliegt, mit Nachzahlung oder Rückerstattung',
        'Die Liquidität entsprechend planen: Die Akontobeiträge fallen unabhängig vom tatsächlichen Zahlungsrhythmus der Baustellen an',
      ],
    },
    { type: 'h2', text: 'AHV/IV ist nicht die BVG: Was alles komplizierter macht' },
    {
      type: 'p',
      text: 'Die AHV/IV/EO (1. Säule) ist für jeden Selbständigen obligatorisch. Die 2. Säule (BVG) hingegen nicht: Ein Selbständiger kann sich freiwillig anschliessen, ist aber gesetzlich nicht dazu verpflichtet, ausser bei branchenspezifischen Ausnahmen im Zusammenhang mit der SUVA. Das ist die häufigste Verwechslung, und sie verdient einen eigenen Artikel.',
    },
    {
      type: 'cta',
      title: 'Ihre Baustellenerträge, ohne Näherungswerte',
      text: 'Das Rentabilitätsmodul von Cantia zeigt, was jede Baustelle nach Abzug der Kosten tatsächlich einbringt – eine deutlich zuverlässigere Grundlage zur Schätzung Ihrer AHV-Akontobeiträge als eine aus dem Gedächtnis geschätzte Zahl.',
      buttonLabel: 'Rentabilität pro Baustelle entdecken',
    },
  ],
  faq: [
    {
      question: 'Ab welchem Alter muss ein Selbständiger AHV/IV-Beiträge zahlen?',
      answer:
        'Ab dem vollendeten 18. Altersjahr ist der Anschluss an die AHV/IV/EO für jede Person, die in der Schweiz eine selbständige Erwerbstätigkeit ausübt, obligatorisch.',
    },
    {
      question: 'Ist der AHV/IV-Beitragssatz für alle Selbständigen gleich?',
      answer:
        'Nein: Er ist degressiv unter einem Jahreseinkommen von rund CHF 60’500 (reduzierter Tarif) und erreicht darüber einen vollen Satz von rund 10 % des Nettoeinkommens.',
    },
    {
      question: 'Muss man auch ohne Gewinn in einem bestimmten Jahr Beiträge zahlen?',
      answer:
        'Ja, ein jährlicher Mindestbeitrag bleibt auch bei sehr geringem oder keinem Einkommen geschuldet, um die Kontinuität der Ansprüche (AHV-Rente, IV-Deckung) zu wahren.',
    },
  ],
  relatedSlugs: [
    'lpp-deuxieme-pilier-independant-batiment',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
