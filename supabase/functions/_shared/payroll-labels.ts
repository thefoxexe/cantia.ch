// Deno copy of lib/payroll/standardLabels.ts — keep the two in step.
// The standard payroll catalog (cotisations, wage and expense types) is
// stored with its French labels — the database seeds it that way and the
// app matches on those labels. This turns a stored or computed label into
// the reader's language at display time; anything an organisation typed
// itself is shown as it is. Kept free of the translations module so the
// payroll tests can import it in Node.

type Lang = 'fr' | 'de' | 'it';

const EXACT: Record<string, { de: string; it: string }> = {
  // Lines computed by the Swiss engine
  'AVS / AI / APG': { de: 'AHV / IV / EO', it: 'AVS / AI / IPG' },
  'AC (chômage)': { de: 'ALV (Arbeitslosenversicherung)', it: 'AD (disoccupazione)' },
  'LPP (2e pilier)': { de: 'BVG (2. Säule)', it: 'LPP (2° pilastro)' },
  'AANP (accidents non prof.)': { de: 'NBU (Nichtberufsunfall)', it: 'AINP (infortuni non prof.)' },
  'AAP (accidents prof.)': { de: 'BU (Berufsunfall)', it: 'AIP (infortuni prof.)' },
  'IJM (maladie)': { de: 'KTG (Krankentaggeld)', it: 'IGM (malattia)' },
  'Allocations familiales': { de: 'Familienzulagen', it: 'Assegni familiari' },
  'Impôt à la source': { de: 'Quellensteuer', it: 'Imposta alla fonte' },
  // Deduction types seeded for every organisation
  'Cotisation AVS/AI/APG': { de: 'Beitrag AHV/IV/EO', it: 'Contributo AVS/AI/IPG' },
  'Cotisation AC': { de: 'Beitrag ALV', it: 'Contributo AD' },
  'Cotisation AANP': { de: 'Beitrag NBU', it: 'Contributo AINP' },
  'Cotisation IJM': { de: 'Beitrag KTG', it: 'Contributo IGM' },
  'Cotisation LAAC': { de: 'Beitrag UVG-Zusatz', it: 'Contributo LAINF complementare' },
  'Cotisation CAF': { de: 'Beitrag FAK', it: 'Contributo CAF' },
  'Cotisation LPP (2e pilier)': { de: 'Beitrag BVG (2. Säule)', it: 'Contributo LPP (2° pilastro)' },
  'Cotisation AC solidarité': { de: 'Beitrag ALV Solidarität', it: 'Contributo AD di solidarietà' },
  'Cotisation AAP (accident professionnel)': { de: 'Beitrag BU (Berufsunfall)', it: 'Contributo AIP (infortunio professionale)' },
  'Cotisation CAF (charge employeur)': { de: 'Beitrag FAK (Arbeitgeber)', it: 'Contributo CAF (a carico del datore di lavoro)' },
  // Wage types
  'Bonus / prime': { de: 'Bonus / Prämie', it: 'Bonus / premio' },
  'Avance sur salaire': { de: 'Lohnvorschuss', it: 'Anticipo sullo stipendio' },
  'Heures supplémentaires': { de: 'Überstunden', it: 'Ore straordinarie' },
  '13e salaire': { de: '13. Monatslohn', it: '13a mensilità' },
  '13e salaire (prorata mensuel)': { de: '13. Monatslohn (monatlich anteilig)', it: '13a mensilità (pro rata mensile)' },
  '13e salaire (versement annuel — estimation si salaire horaire)': {
    de: '13. Monatslohn (jährliche Auszahlung – Schätzung bei Stundenlohn)',
    it: '13a mensilità (versamento annuale — stima se salario orario)',
  },
  'Régularisation rétroactive': { de: 'Rückwirkende Korrektur', it: 'Regolarizzazione retroattiva' },
  'Indemnité vacances (salaire horaire)': { de: 'Ferienentschädigung (Stundenlohn)', it: 'Indennità per vacanze (salario orario)' },
  // Expense types
  'Kilométrage': { de: 'Kilometerentschädigung', it: 'Chilometraggio' },
  'Repas / représentation': { de: 'Mahlzeiten / Repräsentation', it: 'Pasti / rappresentanza' },
  'Frais de déplacement / logement (sur justificatifs)': {
    de: 'Reise- / Unterkunftskosten (gegen Beleg)',
    it: 'Spese di viaggio / alloggio (su giustificativi)',
  },
  'Formation continue': { de: 'Weiterbildung', it: 'Formazione continua' },
};

// Engine lines that carry a canton or a tax code.
const PATTERNS: { re: RegExp; de: string; it: string }[] = [
  { re: /^Allocations familiales \(caisse (.+)\)$/, de: 'Familienzulagen (Kasse $1)', it: 'Assegni familiari (cassa $1)' },
  { re: /^Allocations familiales \(part salarié (.+)\)$/, de: 'Familienzulagen (Arbeitnehmeranteil $1)', it: 'Assegni familiari (quota dipendente $1)' },
  { re: /^Allocations familiales \((.+)\)$/, de: 'Familienzulagen ($1)', it: 'Assegni familiari ($1)' },
  { re: /^Impôt à la source \((.+)\)$/, de: 'Quellensteuer ($1)', it: 'Imposta alla fonte ($1)' },
];

export function payrollLabel(label: string | null | undefined, lang: string): string {
  const text = label ?? '';
  if (lang !== 'de' && lang !== 'it') return text;
  const l = lang as Exclude<Lang, 'fr'>;
  const exact = EXACT[text.trim()];
  if (exact) return exact[l];
  for (const p of PATTERNS) {
    if (p.re.test(text)) return text.replace(p.re, p[l]);
  }
  return text;
}

