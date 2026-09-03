import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'validite-devis-signe-prix-qui-bouge',
  question: 'Wie lange bindet eine unterschriebene Offerte das Unternehmen, wenn sich Materialpreise ändern?',
  title: 'Bindet eine unterschriebene Offerte, wenn sich der Materialpreis seither geändert hat?',
  description:
    'Eine Offerte ohne Gültigkeitsdatum bindet das Unternehmen zeitlich unbegrenzt, selbst wenn sich der Materialpreis inzwischen verdoppelt hat. Die Klausel, die auf den meisten Schweizer Offerten fehlt.',
  excerpt:
    'Eine unterschriebene Offerte ohne Gültigkeitsdatum bindet Sie unbegrenzt, selbst wenn sich der Holzpreis in der Zwischenzeit verdoppelt hat. Das ist eine Zeile, kein Detail.',
  category: 'Devis & facturation',
  keywords: ['gültigkeit offerte', 'materialpreis schwankung', 'vertragliche bindung offerte', 'preisanpassungsklausel', 'unterschriebene offerte'],
  publishedAt: '2026-03-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Kunde bewahrt eine unterschriebene Offerte sechs Monate lang in einer Schublade auf und taucht dann mit den Worten «ich habe unterschrieben, ich will diesen Preis» wieder auf. Ohne schriftliches Gültigkeitsdatum auf dem Dokument hat er rechtlich recht, selbst wenn sich der Materialpreis in der Zwischenzeit um 20 % bewegt hat.',
    },
    { type: 'h2', text: 'Eine Offerte bindet, solange sie kein Enddatum hat' },
    {
      type: 'p',
      text: 'Eine vom Kunden akzeptierte Offerte gilt als Annahme eines Antrags: Sie bindet beide Parteien zu den schriftlichen Bedingungen, ohne zeitliche Begrenzung, sofern das Dokument keine vorsieht. Das ist genau das Prinzip des Antrags im Schweizer Vertragsrecht: Wer ihn abgibt, bleibt daran gebunden, bis er verfällt oder widerrufen wird.',
    },
    {
      type: 'callout',
      title: 'Die Zeile, die man nie vergessen darf',
      text: '«Offerte gültig 30 Tage» (oder 60, je nach Art der Baustelle) ist keine Höflichkeitsfloskel. Sie verhindert, dass ein Kunde Monate später einen eingefrorenen Preis hervorholt, während Ihre Lieferanten ihre Preise längst angepasst haben.',
    },
    { type: 'h2', text: 'Was tun, wenn die Baustelle nach Ablauf der Gültigkeit beginnt' },
    {
      type: 'list',
      items: [
        'Ist die Offerte abgelaufen, muss eine neue Offerte (oder ein Nachtrag zur Bestätigung des angepassten Preises) erstellt und vor Baubeginn akzeptiert werden',
        'Hat die Baustelle bereits unter der alten Offerte begonnen, erlaubt eine Preisanpassungsklausel (insbesondere für Material), einen dokumentierten Preisanstieg weiterzugeben, ohne den gesamten Vertrag neu zu verhandeln',
        'Fehlt eine Klausel, kann ein erheblicher und dokumentierter Preisanstieg eines bestimmten Materials manchmal einen ausgehandelten Nachtrag rechtfertigen (das ist jedoch eine Verhandlung, kein automatisches Recht)',
      ],
    },
    { type: 'h2', text: 'Was sich das in der Praxis ändert' },
    {
      type: 'p',
      text: 'Bei volatilen Materialien (Holz, Metall, Dämmstoffe) reduziert eine Gültigkeit von 30 statt 90 Tagen das Risiko deutlich, einen Preisanstieg auf eine zu lange unbeantwortet gebliebene Offerte auffangen zu müssen. Bei reinen Arbeitsleistungen spielt die Gültigkeit eine kleinere Rolle, kostet aber nie etwas, sie hinzuschreiben.',
    },
    {
      type: 'cta',
      title: 'Die Gültigkeit, nie mehr vergessen auf einer Offerte',
      text: 'Jede Cantia-Offerte enthält automatisch ihr Gültigkeitsdatum, berechnet aus Ihren Unternehmenseinstellungen. Sie müssen nicht mehr bei jedem Versand daran denken.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Bindet eine Offerte ohne Gültigkeitsdatum das Unternehmen unbegrenzt?',
      answer:
        'Grundsätzlich ja, solange sie nicht widerrufen oder ersetzt wurde: Deshalb sollte immer eine ausdrückliche Gültigkeitsdauer (je nach Fall 30 bis 90 Tage) auf dem Dokument stehen.',
    },
    {
      question: 'Kann man einen Materialpreisanstieg auf eine bereits unterschriebene Offerte übertragen?',
      answer:
        'Nur wenn eine Preisanpassungsklausel dies ausdrücklich vorsieht, oder durch einen mit dem Kunden ausgehandelten Nachtrag (das ist ohne Klausel nie ein automatisches Recht).',
    },
    {
      question: 'Welche Gültigkeitsdauer wählt man für eine Renovationsofferte?',
      answer:
        '30 Tage sind üblich bei Material, dessen Preis schwankt, bis zu 90 Tage bei Leistungen, die vorwiegend Arbeit sind. Die endgültige Wahl richtet sich nach der tatsächlichen Volatilität der Offertposten.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'norme-sia-118-devis-obligatoire',
  ],
};
