// The journal of the end-to-end check of 21.10.2026: a fiduciary keeps the
// books of "Menuiserie Bonvin Sàrl" (outside Cantia) on the live database,
// inside a transaction that was rolled back. These are the posted entries as
// acc_ext_entries returned them; the VAT summary is acc_ext_vat_summary for
// 01.07.–30.09.2026. Used by scripts/accounting-proof.test.mjs and by the
// examples on accounting.cantia.ch.
export const CLIENT = { name: 'Menuiserie Bonvin Sàrl', ide_number: 'CHE-123.456.788' };

export const JOURNAL = [
  { entry_number: 1, entry_date: '2025-01-01', label: 'Apport en capital', external_reference: 'OUV-1', lines: [{ account_code: '1020', debit: 40000, credit: 0 }, { account_code: '2800', debit: 0, credit: 40000 }] },
  { entry_number: 2, entry_date: '2025-03-15', label: 'Facture 101 · Agencement Favre', external_reference: 'F101', lines: [{ account_code: '1100', debit: 10810, credit: 0 }, { account_code: '3400', debit: 0, credit: 10000, vat_code: 'V81' }, { account_code: '2200', debit: 0, credit: 810, label: 'TVA 8.1 %' }] },
  { entry_number: 3, entry_date: '2025-04-10', label: 'Paiement facture 101', external_reference: 'F101', lines: [{ account_code: '1020', debit: 10810, credit: 0 }, { account_code: '1100', debit: 0, credit: 10810 }] },
  { entry_number: 4, entry_date: '2025-06-30', label: 'Loyer atelier T2', external_reference: 'L2025-2', lines: [{ account_code: '6000', debit: 2400, credit: 0 }, { account_code: '1020', debit: 0, credit: 2400 }] },
  { entry_number: 5, entry_date: '2025-09-01', label: 'Bois massif · Scierie du Rhône', external_reference: 'A55', lines: [{ account_code: '4000', debit: 2000, credit: 0, vat_code: 'M81' }, { account_code: '1170', debit: 162, credit: 0, label: 'TVA 8.1 %' }, { account_code: '2000', debit: 0, credit: 2162 }] },
  { entry_number: 6, entry_date: '2025-12-31', label: 'Bouclement 2025 : bénéfice de l’exercice', external_reference: 'BOUCL-2025', lines: [{ account_code: '3400', debit: 10000, credit: 0 }, { account_code: '4000', debit: 0, credit: 2000 }, { account_code: '6000', debit: 0, credit: 2400 }, { account_code: '2979', debit: 0, credit: 5600 }] },
  { entry_number: 7, entry_date: '2026-01-01', label: 'Report à nouveau du résultat 2025', external_reference: 'BOUCL-2025', lines: [{ account_code: '2979', debit: 5600, credit: 0 }, { account_code: '2970', debit: 0, credit: 5600 }] },
  { entry_number: 8, entry_date: '2026-07-05', label: 'Facture 212 · Cuisine Dupuis', external_reference: 'F212', lines: [{ account_code: '1100', debit: 12972, credit: 0 }, { account_code: '3400', debit: 0, credit: 12000, vat_code: 'V81' }, { account_code: '2200', debit: 0, credit: 972, label: 'TVA 8.1 %' }] },
  { entry_number: 9, entry_date: '2026-07-20', label: 'Panneaux et quincaillerie · Bois Valais SA', external_reference: 'A71', lines: [{ account_code: '4000', debit: 3000, credit: 0, vat_code: 'M81' }, { account_code: '1170', debit: 243, credit: 0, label: 'TVA 8.1 %' }, { account_code: '2000', debit: 0, credit: 3243 }] },
  { entry_number: 10, entry_date: '2026-08-12', label: 'Ordinateur portable atelier', external_reference: 'A80', lines: [{ account_code: '1520', debit: 2000, credit: 0, vat_code: 'I81' }, { account_code: '1171', debit: 162, credit: 0, label: 'TVA 8.1 %' }, { account_code: '1020', debit: 0, credit: 2162 }] },
  { entry_number: 11, entry_date: '2026-09-30', label: 'Salaires septembre', external_reference: 'SAL-09', lines: [{ account_code: '5000', debit: 6000, credit: 0 }, { account_code: '1020', debit: 0, credit: 6000 }] },
  { entry_number: 12, entry_date: '2026-09-30', label: 'Décompte TVA 01.07.2026 – 30.09.2026', external_reference: 'TVA-2026-T3', lines: [{ account_code: '2200', debit: 972, credit: 0 }, { account_code: '1170', debit: 0, credit: 243 }, { account_code: '1171', debit: 0, credit: 162 }, { account_code: '2201', debit: 0, credit: 567 }] },
];

export const VAT_SUMMARY_Q3_2026 = {
  codes: [
    { vat_code: 'I81', net: 2000, lines: 1 },
    { vat_code: 'M81', net: 3000, lines: 1 },
    { vat_code: 'V81', net: 12000, lines: 1 },
  ],
  vat_due: 972,
  input_tax: 405,
  input_invest: 162,
  input_material: 243,
};
