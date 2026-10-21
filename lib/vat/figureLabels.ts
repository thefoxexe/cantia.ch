// Official wording of the AFC VAT form figures in German and Italian (the
// French one is FIGURE_LABELS in afcForm.ts). No imports: used by the app
// and by accounting.cantia.ch.

// Official figure wording per language (abridged where the form adds legal
// references).
export const LABELS_DE: Record<string, string> = {
  '200': 'Total der vereinbarten bzw. vereinnahmten Entgelte (inkl. steuerbefreite Leistungen, Leistungen im Ausland, Übertragungen im Meldeverfahren und optierte Leistungen)',
  '205': 'Davon Entgelte für von der Steuer ausgenommene Leistungen, für die optiert wird (Art. 22)',
  '220': 'Von der Steuer befreite Leistungen (u.a. Exporte, Art. 23)',
  '221': 'Leistungen im Ausland (Ort der Leistung im Ausland)',
  '225': 'Übertragung im Meldeverfahren (Art. 38, Formular Nr. 764)',
  '230': 'Von der Steuer ausgenommene Leistungen (Art. 21), für die nicht optiert wird',
  '235': 'Entgeltsminderungen wie Skonti, Rabatte, Verluste',
  '280': 'Diverses (z.B. Wert des Bodens, Ankaufspreise Margenbesteuerung)',
  '289': 'Total Abzüge (Ziff. 220 bis 280)',
  '299': 'Steuerbarer Gesamtumsatz (Ziff. 200 abzüglich Ziff. 289)',
  '302': 'Normalsatz 7,7 % (Leistungen bis 31.12.2023)',
  '303': 'Normalsatz 8,1 %',
  '312': 'Reduzierter Satz 2,5 % (bis 31.12.2023)',
  '313': 'Reduzierter Satz 2,6 %',
  '342': 'Beherbergungssatz 3,7 % (bis 31.12.2023)',
  '343': 'Beherbergungssatz 3,8 %',
  '322': 'Saldosteuersatz 1',
  '332': 'Saldosteuersatz 2',
  '382': 'Bezugsteuer (Leistungen aus dem Ausland, Art. 45)',
  '383': 'Bezugsteuer (Leistungen aus dem Ausland, Art. 45)',
  '399': 'Total geschuldete Steuer',
  '400': 'Vorsteuer auf Material- und Dienstleistungsaufwand',
  '405': 'Vorsteuer auf Investitionen und übrigem Betriebsaufwand',
  '410': 'Einlageentsteuerung (Art. 32)',
  '415': 'Vorsteuerkorrekturen: gemischte Verwendung, Eigenverbrauch (Art. 30, 31)',
  '420': 'Vorsteuerkürzungen: Nicht-Entgelte wie Subventionen, Tourismusabgaben (Art. 33 Abs. 2)',
  '470': 'Anrechnung der Steuer gemäss Formular Nr. 1050 (fiktive Vorsteuer, Margen)',
  '479': 'Total Vorsteuerabzüge (Ziff. 400 bis 420)',
  '500': 'Zu bezahlender Betrag',
  '510': 'Guthaben der steuerpflichtigen Person',
  '900': 'Subventionen, Tourismusabgaben, Beiträge an Entsorgungs- und Wasserwerkbetriebe',
  '910': 'Spenden, Dividenden, Schadenersatz und andere Mittelflüsse ohne Entgelt',
};
export const LABELS_IT: Record<string, string> = {
  '200': 'Totale delle controprestazioni convenute o ricevute (incl. prestazioni esenti, all’estero, trasferimenti con procedura di notifica e prestazioni escluse optate)',
  '205': 'Di cui controprestazioni per prestazioni escluse per le quali si è optato (art. 22)',
  '220': 'Prestazioni esenti (p. es. esportazioni, art. 23)',
  '221': 'Prestazioni fornite all’estero',
  '225': 'Trasferimenti con la procedura di notifica (art. 38, modulo n. 764)',
  '230': 'Prestazioni escluse dall’imposta (art. 21) senza opzione',
  '235': 'Diminuzioni della controprestazione (sconti, ribassi, perdite su debitori)',
  '280': 'Diversi (p. es. valore del terreno, prezzi d’acquisto imposizione dei margini)',
  '289': 'Totale deduzioni (cifre 220–280)',
  '299': 'Cifra d’affari imponibile (cifra 200 meno cifra 289)',
  '302': 'Aliquota normale 7,7 % (prestazioni fino al 31.12.2023)',
  '303': 'Aliquota normale 8,1 %',
  '312': 'Aliquota ridotta 2,5 % (fino al 31.12.2023)',
  '313': 'Aliquota ridotta 2,6 %',
  '342': 'Alloggio 3,7 % (fino al 31.12.2023)',
  '343': 'Aliquota speciale alloggio 3,8 %',
  '322': 'Aliquota saldo 1',
  '332': 'Aliquota saldo 2',
  '382': 'Imposta sull’acquisto (prestazioni dall’estero, art. 45)',
  '383': 'Imposta sull’acquisto (prestazioni dall’estero, art. 45)',
  '399': 'Totale dell’imposta dovuta',
  '400': 'Imposta precedente su costi del materiale e prestazioni di servizi',
  '405': 'Imposta precedente su investimenti e altri costi d’esercizio',
  '410': 'Sgravio fiscale successivo (art. 32)',
  '415': 'Correzioni dell’imposta precedente: doppia utilizzazione, consumo proprio (art. 30, 31)',
  '420': 'Riduzioni della deduzione dell’imposta precedente: sussidi, tasse turistiche… (art. 33 cpv. 2)',
  '470': 'Computo dell’imposta secondo il modulo n. 1050',
  '479': 'Totale deduzioni dell’imposta precedente (cifre 400–420)',
  '500': 'Importo da pagare',
  '510': 'Saldo a favore del contribuente',
  '900': 'Sussidi, tasse turistiche, contributi a stabilimenti di smaltimento e approvvigionamento idrico',
  '910': 'Doni, dividendi, risarcimenti e altri flussi senza controprestazione',
};

type Lang = 'fr' | 'de' | 'it';

// Period names ("1er trimestre", "März"…) from the period key
// (2026-T1, 2026-S2, 2026-M03, 2026); afcForm.ts gives the French one.
export function vatPeriodName(key: string, fallback: string, lang: Lang): string {
  if (lang === 'fr') return fallback;
  const m = /^(\d{4})(?:-([TSM])(\d+))?$/.exec(key);
  if (!m) return fallback;
  const [, year, kind, n] = m;
  const i = Number(n);
  if (!kind) return lang === 'de' ? `Jahr ${year}` : `Anno ${year}`;
  if (kind === 'T') return lang === 'de' ? `${i}. Quartal` : `${i}° trimestre`;
  if (kind === 'S') return lang === 'de' ? `${i}. Semester` : `${i}° semestre`;
  return new Date(Date.UTC(Number(year), i - 1, 1)).toLocaleDateString(`${lang}-CH`, { month: 'long', timeZone: 'UTC' });
}

// The checks buildAfcForm writes in French, in the member's language.
export function vatWarningText(w: string, lang: Lang): string {
  if (lang === 'fr') return w;
  let m = /^Taux (.+) % inconnu du formulaire AFC : vérifiez le code TVA utilisé\.$/.exec(w);
  if (m) return lang === 'de' ? `Satz ${m[1]} % ist im ESTV-Formular unbekannt: Prüfen Sie den verwendeten MWST-Code.` : `Aliquota ${m[1]} % sconosciuta nel modulo AFC: verificate il codice IVA utilizzato.`;
  m = /^Le chiffre d'affaires imposable \(ch\. 299 : (.+)\) ne correspond pas à la somme des taux \((.+)\)\.$/.exec(w);
  if (m) return lang === 'de' ? `Der steuerbare Umsatz (Ziff. 299: ${m[1]}) entspricht nicht der Summe der Sätze (${m[2]}).` : `La cifra d’affari imponibile (cifra 299: ${m[1]}) non corrisponde alla somma delle aliquote (${m[2]}).`;
  if (w === 'Indiquez votre taux de la dette fiscale nette (décision de l’AFC).') return lang === 'de' ? 'Geben Sie Ihren Saldosteuersatz an (Entscheid der ESTV).' : 'Indicate la vostra aliquota saldo (decisione dell’AFC).';
  m = /^CHF (.+) sont saisis sous le code CORR : reportez-les au ch\. 415 \(corrections\) ou 420 \(réductions\) selon leur nature\.$/.exec(w);
  if (m) return lang === 'de' ? `CHF ${m[1]} sind unter dem Code CORR erfasst: Tragen Sie sie je nach Art in Ziff. 415 (Korrekturen) oder 420 (Kürzungen) ein.` : `CHF ${m[1]} sono registrati con il codice CORR: riportateli alla cifra 415 (correzioni) o 420 (riduzioni) secondo la loro natura.`;
  return w;
}
