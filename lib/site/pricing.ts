// Texts of the pricing page (cantia.ch/tarifs, /de/tarifs, /it/tarifs). The
// figures themselves (prices, members, storage, assistant uses) are read
// live from the plans table by components/site/PricingPage.tsx; the lines
// below only describe what each plan includes, matching the plans flags.

import type { SiteLocale } from './copy';

export type PlanId = 'solo' | 'equipe' | 'pro';
type Cell = string | true | false;

export interface PricingCopy {
  seoTitle: string;
  seoDescription: string;
  crumb: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  monthly: string;
  yearly: string;
  yearlySave: string;
  perMonth: string;
  billedMonthly: string;
  billedYearly: (amount: string) => string;
  featuredLabel: string;
  plans: Record<PlanId, { name: string; text: string; cta: string; lines: string[] }>;
  membersStorage: (members: number, gb: number) => string;
  assistantUses: (n: string) => string;
  planDetail: string;
  proof: string;
  calloutStrong: string;
  calloutLink: string;
  compareEyebrow: string;
  compareTitle: string;
  compareNote: string;
  table: { feature: string; included: string; groups: { title: string; rows: { label: string; cells: [Cell, Cell, Cell] | 'members' | 'storage' | 'assistant' }[] }[] };
  faq: { q: string; a: string }[];
  faqEyebrow: string;
  faqTitle: string;
}

const fr: PricingCopy = {
  seoTitle: 'Tarifs : Essentiel, Équipe et Entreprise | Cantia',
  seoDescription: 'Les tarifs de Cantia : trois formules dès CHF 39.– par mois, selon la taille de votre équipe, facturation mensuelle ou annuelle, 14 jours d’essai.',
  crumb: 'Tarifs',
  eyebrow: 'Un prix selon votre équipe',
  h1Plain: 'La bonne formule.',
  h1Accent: 'À votre échelle.',
  lead: 'Commencez avec 14 jours d’essai. Choisissez votre formule et une facturation mensuelle ou annuelle.',
  monthly: 'Mensuel',
  yearly: 'Annuel',
  yearlySave: '−20 %',
  perMonth: '/ mois',
  billedMonthly: 'Facturation mensuelle',
  billedYearly: (a) => `Facturé CHF ${a} par an`,
  featuredLabel: 'POUR TRAVAILLER EN ÉQUIPE',
  plans: {
    solo: { name: 'Essentiel', text: 'Pour les indépendants et les petites équipes.', cta: 'Essayer Essentiel', lines: ['Devis, factures et rapports illimités', 'Factures QR & documents personnalisés', 'Comptabilité & TVA'] },
    equipe: { name: 'Équipe', text: 'Pour organiser l’équipe et suivre les projets.', cta: 'Essayer Équipe', lines: ['Tout Essentiel inclus', 'Planning, heures et salaires', 'Rentabilité & trésorerie à 90 jours'] },
    pro: { name: 'Entreprise', text: 'Pour aller plus loin dans le suivi commercial.', cta: 'Essayer Entreprise', lines: ['Tout Équipe inclus', 'Suivi d’ouverture et relances de devis', 'Soumissions illimitées en bêta'] },
  },
  membersStorage: (m, gb) => `${m} membres · ${gb} Go de stockage`,
  assistantUses: (n) => `${n} utilisations de l’assistant / mois`,
  planDetail: 'Détail de la formule',
  proof: '14 jours d’essai sur chaque formule. La carte est demandée à l’inscription, rien n’est débité pendant l’essai, et vous résiliez en ligne avant le 14e jour sans rien payer.',
  calloutStrong: 'Plus de 25 personnes ou un besoin particulier ?',
  calloutLink: 'Parlons de votre organisation',
  compareEyebrow: 'Choisir avec les détails',
  compareTitle: 'Comparez ce qui compte.',
  compareNote: 'Sur téléphone, faites défiler le tableau horizontalement pour consulter les trois formules.',
  table: {
    feature: 'Fonctionnalités',
    included: 'Inclus',
    groups: [
      { title: 'Votre espace', rows: [{ label: 'Membres inclus', cells: 'members' }, { label: 'Stockage', cells: 'storage' }] },
      {
        title: 'Les essentiels',
        rows: [
          { label: 'Devis, factures et rapports', cells: ['Illimités', 'Illimités', 'Illimités'] },
          { label: 'Facturation QR & personnalisation', cells: [true, true, true] },
          { label: 'Comptabilité & TVA', cells: [true, true, true] },
        ],
      },
      {
        title: 'Organiser et piloter',
        rows: [
          { label: 'Planning, heures et salaires', cells: [false, true, true] },
          { label: 'Rentabilité & trésorerie', cells: [false, true, true] },
          { label: 'Documents dans la langue du client', cells: [false, true, true] },
        ],
      },
      {
        title: 'Assistant & commerce',
        rows: [
          { label: 'Assistant vocal IA / mois', cells: 'assistant' },
          { label: 'Soumissions en bêta', cells: ['1 à l’essai', '3 / mois', 'Illimitées'] },
          { label: 'Suivi d’ouverture & relances des devis', cells: [false, false, true] },
          { label: 'Support prioritaire', cells: [false, false, true] },
        ],
      },
    ],
  },
  faqEyebrow: 'Les réponses utiles',
  faqTitle: 'Avant de commencer.',
  faq: [
    { q: 'Que comprend l’essai ?', a: 'Choisissez votre formule lors de l’inscription et découvrez Cantia pendant 14 jours. Une carte bancaire est requise. Consultez les conditions de la formule avant de confirmer.' },
    { q: 'Comment fonctionne la facturation annuelle ?', a: 'Le prix affiché est un équivalent mensuel. Le montant annuel complet est facturé une fois par an et apparaît sous le prix après sélection du mode annuel.' },
    { q: 'Quelles limites s’appliquent à l’assistant ?', a: 'Les quotas mensuels sont de 150, 600 et 2’000 utilisations selon la formule. Les quotas de soumissions, en bêta, sont distincts.' },
    { q: 'Puis-je utiliser Cantia sans Bexio ?', a: 'Oui. Cantia fonctionne de façon autonome. L’intégration Bexio est destinée aux entreprises qui l’utilisent déjà.' },
  ],
};

const de: PricingCopy = {
  seoTitle: 'Preise: Essentiel, Team und Entreprise | Cantia',
  seoDescription: 'Die Preise von Cantia: drei Abos ab CHF 39.– pro Monat, nach Teamgrösse, monatliche oder jährliche Abrechnung, 14 Tage Testphase.',
  crumb: 'Preise',
  eyebrow: 'Ein Preis nach Teamgrösse',
  h1Plain: 'Das passende Abo.',
  h1Accent: 'In Ihrer Grösse.',
  lead: 'Starten Sie mit 14 Tagen Testphase. Wählen Sie Ihr Abo und eine monatliche oder jährliche Abrechnung.',
  monthly: 'Monatlich',
  yearly: 'Jährlich',
  yearlySave: '−20 %',
  perMonth: '/ Monat',
  billedMonthly: 'Monatliche Abrechnung',
  billedYearly: (a) => `CHF ${a} pro Jahr verrechnet`,
  featuredLabel: 'FÜR DIE ARBEIT IM TEAM',
  plans: {
    solo: { name: 'Essentiel', text: 'Für Selbständige und kleine Teams.', cta: 'Essentiel testen', lines: ['Unbegrenzt Offerten, Rechnungen und Rapporte', 'QR-Rechnungen & eigene Dokumente', 'Buchhaltung & MWST'] },
    equipe: { name: 'Team', text: 'Um das Team zu organisieren und Projekte zu verfolgen.', cta: 'Team testen', lines: ['Alles aus Essentiel', 'Planung, Stunden und Löhne', 'Rentabilität & Liquidität über 90 Tage'] },
    pro: { name: 'Entreprise', text: 'Für eine weitergehende Verkaufsverfolgung.', cta: 'Entreprise testen', lines: ['Alles aus Team', 'Öffnungsverfolgung und Offert-Erinnerungen', 'Unbegrenzt Ausschreibungen (Beta)'] },
  },
  membersStorage: (m, gb) => `${m} Mitglieder · ${gb} GB Speicher`,
  assistantUses: (n) => `${n} Nutzungen des Assistenten / Monat`,
  planDetail: 'Details zum Abo',
  proof: '14 Tage Testphase bei jedem Abo. Die Karte wird bei der Registrierung hinterlegt, während der Testphase wird nichts abgebucht, und Sie kündigen vor dem 14. Tag online, ohne etwas zu bezahlen.',
  calloutStrong: 'Mehr als 25 Personen oder ein besonderer Bedarf?',
  calloutLink: 'Sprechen wir über Ihre Organisation',
  compareEyebrow: 'Im Detail wählen',
  compareTitle: 'Vergleichen Sie, was zählt.',
  compareNote: 'Auf dem Smartphone wischen Sie die Tabelle seitwärts, um alle drei Abos zu sehen.',
  table: {
    feature: 'Funktionen',
    included: 'Inklusive',
    groups: [
      { title: 'Ihr Bereich', rows: [{ label: 'Enthaltene Mitglieder', cells: 'members' }, { label: 'Speicher', cells: 'storage' }] },
      {
        title: 'Das Wesentliche',
        rows: [
          { label: 'Offerten, Rechnungen und Rapporte', cells: ['Unbegrenzt', 'Unbegrenzt', 'Unbegrenzt'] },
          { label: 'QR-Rechnung & eigenes Design', cells: [true, true, true] },
          { label: 'Buchhaltung & MWST', cells: [true, true, true] },
        ],
      },
      {
        title: 'Organisieren und steuern',
        rows: [
          { label: 'Planung, Stunden und Löhne', cells: [false, true, true] },
          { label: 'Rentabilität & Liquidität', cells: [false, true, true] },
          { label: 'Dokumente in der Sprache des Kunden', cells: [false, true, true] },
        ],
      },
      {
        title: 'Assistent & Verkauf',
        rows: [
          { label: 'KI-Sprachassistent / Monat', cells: 'assistant' },
          { label: 'Ausschreibungen (Beta)', cells: ['1 zum Testen', '3 / Monat', 'Unbegrenzt'] },
          { label: 'Öffnungsverfolgung & Offert-Erinnerungen', cells: [false, false, true] },
          { label: 'Priorisierter Support', cells: [false, false, true] },
        ],
      },
    ],
  },
  faqEyebrow: 'Die wichtigsten Antworten',
  faqTitle: 'Bevor Sie starten.',
  faq: [
    { q: 'Was umfasst die Testphase?', a: 'Wählen Sie bei der Registrierung Ihr Abo und lernen Sie Cantia 14 Tage lang kennen. Eine Kreditkarte ist erforderlich. Prüfen Sie die Bedingungen des Abos vor der Bestätigung.' },
    { q: 'Wie funktioniert die jährliche Abrechnung?', a: 'Der angezeigte Preis ist ein Monatsäquivalent. Der volle Jahresbetrag wird einmal pro Jahr verrechnet und erscheint nach Wahl der jährlichen Abrechnung unter dem Preis.' },
    { q: 'Welche Grenzen gelten für den Assistenten?', a: 'Die Monatskontingente betragen je nach Abo 150, 600 und 2’000 Nutzungen. Die Kontingente für Ausschreibungen (Beta) sind separat.' },
    { q: 'Kann ich Cantia ohne Bexio nutzen?', a: 'Ja. Cantia funktioniert eigenständig. Die Bexio-Integration richtet sich an Unternehmen, die Bexio bereits nutzen.' },
  ],
};

const it: PricingCopy = {
  seoTitle: 'Prezzi: Essentiel, Team ed Entreprise | Cantia',
  seoDescription: 'I prezzi di Cantia: tre piani da CHF 39.– al mese, secondo la dimensione del team, fatturazione mensile o annuale, 14 giorni di prova.',
  crumb: 'Prezzi',
  eyebrow: 'Un prezzo secondo il team',
  h1Plain: 'Il piano giusto.',
  h1Accent: 'Alla vostra misura.',
  lead: 'Iniziate con 14 giorni di prova. Scegliete il piano e una fatturazione mensile o annuale.',
  monthly: 'Mensile',
  yearly: 'Annuale',
  yearlySave: '−20 %',
  perMonth: '/ mese',
  billedMonthly: 'Fatturazione mensile',
  billedYearly: (a) => `Fatturati CHF ${a} all’anno`,
  featuredLabel: 'PER LAVORARE IN TEAM',
  plans: {
    solo: { name: 'Essentiel', text: 'Per indipendenti e piccoli team.', cta: 'Provare Essentiel', lines: ['Preventivi, fatture e rapporti illimitati', 'Fatture QR e documenti personalizzati', 'Contabilità e IVA'] },
    equipe: { name: 'Team', text: 'Per organizzare il team e seguire i progetti.', cta: 'Provare Team', lines: ['Tutto Essentiel incluso', 'Pianificazione, ore e salari', 'Redditività e tesoreria a 90 giorni'] },
    pro: { name: 'Entreprise', text: 'Per andare oltre nel seguito commerciale.', cta: 'Provare Entreprise', lines: ['Tutto Team incluso', 'Tracciamento aperture e promemoria dei preventivi', 'Capitolati illimitati in beta'] },
  },
  membersStorage: (m, gb) => `${m} membri · ${gb} GB di spazio`,
  assistantUses: (n) => `${n} utilizzi dell’assistente / mese`,
  planDetail: 'Dettaglio del piano',
  proof: '14 giorni di prova su ogni piano. La carta viene richiesta all’iscrizione, durante la prova non viene addebitato nulla e può disdire online prima del 14° giorno senza pagare nulla.',
  calloutStrong: 'Più di 25 persone o un’esigenza particolare?',
  calloutLink: 'Parliamo della vostra organizzazione',
  compareEyebrow: 'Scegliere nei dettagli',
  compareTitle: 'Confrontate ciò che conta.',
  compareNote: 'Sul telefono scorrete la tabella in orizzontale per vedere i tre piani.',
  table: {
    feature: 'Funzionalità',
    included: 'Incluso',
    groups: [
      { title: 'Il vostro spazio', rows: [{ label: 'Membri inclusi', cells: 'members' }, { label: 'Spazio', cells: 'storage' }] },
      {
        title: 'L’essenziale',
        rows: [
          { label: 'Preventivi, fatture e rapporti', cells: ['Illimitati', 'Illimitati', 'Illimitati'] },
          { label: 'Fattura QR e personalizzazione', cells: [true, true, true] },
          { label: 'Contabilità e IVA', cells: [true, true, true] },
        ],
      },
      {
        title: 'Organizzare e gestire',
        rows: [
          { label: 'Pianificazione, ore e salari', cells: [false, true, true] },
          { label: 'Redditività e tesoreria', cells: [false, true, true] },
          { label: 'Documenti nella lingua del cliente', cells: [false, true, true] },
        ],
      },
      {
        title: 'Assistente e vendita',
        rows: [
          { label: 'Assistente vocale IA / mese', cells: 'assistant' },
          { label: 'Capitolati in beta', cells: ['1 di prova', '3 / mese', 'Illimitati'] },
          { label: 'Tracciamento aperture e promemoria', cells: [false, false, true] },
          { label: 'Supporto prioritario', cells: [false, false, true] },
        ],
      },
    ],
  },
  faqEyebrow: 'Le risposte utili',
  faqTitle: 'Prima di iniziare.',
  faq: [
    { q: 'Cosa comprende la prova?', a: 'Scegliete il piano all’iscrizione e scoprite Cantia per 14 giorni. È richiesta una carta di credito. Consultate le condizioni del piano prima di confermare.' },
    { q: 'Come funziona la fatturazione annuale?', a: 'Il prezzo indicato è un equivalente mensile. L’importo annuale completo è fatturato una volta all’anno e appare sotto il prezzo dopo aver scelto la modalità annuale.' },
    { q: 'Quali limiti valgono per l’assistente?', a: 'Le quote mensili sono di 150, 600 e 2’000 utilizzi secondo il piano. Le quote dei capitolati, in beta, sono separate.' },
    { q: 'Posso usare Cantia senza Bexio?', a: 'Sì. Cantia funziona in modo autonomo. L’integrazione Bexio è pensata per le aziende che la usano già.' },
  ],
};

export const PRICING_COPY: Record<SiteLocale, PricingCopy> = { fr, de, it };
