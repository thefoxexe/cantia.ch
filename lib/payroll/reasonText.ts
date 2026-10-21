// The payroll engine (lib/payroll/swissEngine.ts, swissReferences.ts) stays
// free of the app's translations so the tests can run it in Node; it
// explains its choices in French. This turns those explanations into the
// member's language when they're shown.
type Lang = 'fr' | 'de' | 'it';

const EXACT: Record<string, { de: string; it: string }> = {
  'Nationalité suisse': { de: 'Schweizer Staatsangehörigkeit', it: 'Nazionalità svizzera' },
  'Permis C': { de: 'Ausweis C', it: 'Permesso C' },
  'Marié·e à une personne suisse ou titulaire d’un permis C': { de: 'Verheiratet mit einer Person mit Schweizer Pass oder Ausweis C', it: 'Coniugato/a con una persona svizzera o titolare di permesso C' },
  'Frontalier résidant en France (accord de 1983) : imposé en France': { de: 'Grenzgänger mit Wohnsitz in Frankreich (Abkommen von 1983): in Frankreich besteuert', it: 'Frontaliere residente in Francia (accordo del 1983): tassato in Francia' },
  Frontalier: { de: 'Grenzgänger', it: 'Frontaliere' },
  'Réglé manuellement': { de: 'Manuell festgelegt', it: 'Impostato manualmente' },
  'Assuré LPP': { de: 'BVG-versichert', it: 'Assicurato LPP' },
  'Non assuré LPP': { de: 'Nicht BVG-versichert', it: 'Non assicurato LPP' },
  'Moins de 18 ans : pas de LPP': { de: 'Unter 18 Jahren: kein BVG', it: 'Meno di 18 anni: nessuna LPP' },
  'De 18 à 24 ans, la loi n’impose pas d’épargne : indiquez le taux de votre caisse si elle assure dès 18 ans': {
    de: 'Von 18 bis 24 Jahren verlangt das Gesetz kein Sparen: Geben Sie den Satz Ihrer Kasse an, falls sie ab 18 versichert',
    it: 'Dai 18 ai 24 anni la legge non impone il risparmio: indicate il tasso della vostra cassa se assicura dai 18 anni',
  },
};

export function payrollReasonText(reason: string, lang: string): string {
  const l = (lang === 'de' || lang === 'it' ? lang : 'fr') as Lang;
  if (l === 'fr' || !reason) return reason;
  const exact = EXACT[reason];
  if (exact) return exact[l];
  const permit = /^Permis (\w+)$/.exec(reason);
  if (permit) return l === 'de' ? `Ausweis ${permit[1]}` : `Permesso ${permit[1]}`;
  const threshold = /^Salaire annuel sous le seuil d’entrée \((CHF [^)]+)\)$/.exec(reason);
  if (threshold) return l === 'de' ? `Jahreslohn unter der Eintrittsschwelle (${threshold[1]})` : `Salario annuo sotto la soglia d’entrata (${threshold[1]})`;
  return reason;
}
