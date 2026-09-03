import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'norme-sia-118-devis-obligatoire',
  question: 'Ist die SIA-Norm 118 auf meiner Offerte obligatorisch?',
  title: 'Ist die SIA-Norm 118 auf einer Offerte obligatorisch?',
  description:
    'Die SIA-Norm 118 gilt nie automatisch: Sie kommt nur zur Anwendung, wenn der Vertrag oder die Offerte sie ausdrücklich erwähnt. Erklärungen und bewährte Praxis.',
  excerpt:
    'Ein Architekt hat die SIA 118 in einer Sitzung erwähnt, und Sie glauben, sie gelte automatisch für Ihre Baustelle. Das ist falsch — und im Streitfall teuer.',
  category: 'Juridique & normes',
  keywords: ['SIA 118', 'Norm', 'Vertrag', 'Offerte', 'Pflicht', 'Bauwesen'],
  publishedAt: '2026-01-15',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Architekt hat die SIA 118 in einer Baustellensitzung erwähnt, und seither glauben Sie, sie gelte automatisch für alles, was Sie in der Schweiz unterschreiben. Das ist falsch. Es handelt sich sogar um eine der verbreitetsten Rechtsverwechslungen im Westschweizer Baugewerbe — jene, die Unternehmer trotz eigentlich guter Rechtslage Garantieansprüche kostet.',
    },
    { type: 'h2', text: 'Was die SIA 118 wirklich ist' },
    {
      type: 'p',
      text: 'Die SIA 118 («Allgemeine Bedingungen für Bauarbeiten») ist ein privater Mustervertrag, herausgegeben vom Schweizerischen Ingenieur- und Architektenverein — und kein Gesetz. Sie ergänzt und präzisiert das Obligationenrecht in Punkten wie Garantiefristen, Werkabnahme oder Mängelmanagement, aber nur dort, wo sich beide Parteien dafür entschieden haben.',
    },
    {
      type: 'callout',
      title: 'Was sich ändert, wenn es schiefgeht',
      text: 'Ohne den genauen Satz «Für diese Bedingungen gilt die SIA-Norm 118» irgendwo auf dem unterschriebenen Dokument wendet ein Richter allein das Obligationenrecht an — selbst wenn alle auf der Baustelle glaubten, unter SIA 118 zu stehen. Der Unterschied macht sich in Garantiejahren und im Abnahmeverfahren bemerkbar, nicht in einem kosmetischen Detail.',
    },
    { type: 'h2', text: 'Was sich konkret ändert' },
    {
      type: 'list',
      items: [
        'Unterschiedliche Garantie- und Verjährungsfristen zwischen OR allein und OR + SIA 118',
        'Formalisiertere Werkabnahme unter SIA 118 (Abnahmeprotokoll)',
        'Von der Norm präzisierte Regeln zu Kündigung und Anzahlungen',
        'Ein Richter wendet die SIA 118 nur an, wenn der Vertrag sie schwarz auf weiss erwähnt; er leitet sie nie aus dem Kontext ab',
      ],
    },
    { type: 'h2', text: 'Sollte man sie auf der eigenen Offerte selbst vorschreiben?' },
    {
      type: 'p',
      text: 'Für Reparaturen oder eine kleine Renovation bei einer Privatperson genügt in der Regel das OR allein und bleibt für einen unerfahrenen Kunden verständlicher. Bei einer grösseren Baustelle, als Subunternehmer einer Bauleitung, oder wenn der Architekt sie dem Rest der Baustelle bereits vorgeschrieben hat, harmonisiert die Erwähnung der SIA 118 auf Ihrer eigenen Offerte die Bedingungen mit dem, was um Sie herum gilt, und vermeidet so die Absurdität zweier unterschiedlicher Regelwerke auf derselben Baustelle.',
    },
    {
      type: 'p',
      text: 'Der Punkt, der wirklich zählt: Wenn Sie sich für ihre Anwendung entscheiden, muss der Vermerk auf der Offerte selbst sichtbar sein, nicht in einem Anhangdokument versteckt, das vor der Unterschrift niemand mehr liest.',
    },
    {
      type: 'cta',
      title: 'Ihre Bedingungen, nie mehr vergessen',
      text: 'Ihre Vertragsvermerke (SIA 118 oder nicht) werden einmal in Cantia hinterlegt und erscheinen automatisch auf jeder Offerte-PDF — es wird unmöglich, sie bei einem hastig versendeten Dokument zu vergessen.',
      buttonLabel: 'Modul Offerten entdecken',
    },
  ],
  faq: [
    {
      question: 'Ist die SIA 118 ein Schweizer Gesetz?',
      answer:
        'Nein. Es handelt sich um eine private Vertragsnorm, herausgegeben vom SIA (Schweizerischer Ingenieur- und Architektenverein), die nur gilt, wenn der Vertrag oder die Offerte ausdrücklich darauf verweist.',
    },
    {
      question: 'Was geschieht, wenn die Offerte die SIA 118 nicht erwähnt?',
      answer:
        'Der Werkvertrag bleibt allein dem Obligationenrecht unterstellt (Art. 363 ff. OR), mit seinen eigenen Garantie- und Abnahmeregeln, die sich von jenen der Norm unterscheiden.',
    },
    {
      question: 'Kann eine Privatperson die Anwendung der SIA 118 ablehnen?',
      answer:
        'Ja, da ihre Einbindung auf einer Vereinbarung zwischen den Parteien beruht: Ein Kunde kann ihren Wegfall oder ihre Ersetzung durch die alleinigen OR-Regeln vor Unterzeichnung der Offerte aushandeln.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'delai-paiement-facture-artisan-code-obligations',
    'duree-conservation-devis-factures-suisse',
  ],
};
