import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { parseTender } from '../lib/tenders/parser/parse.ts';
import { groupLines, splitFurniture } from '../lib/tenders/parser/layout.ts';

// ---------------------------------------------------------------------------
// Synthetic soumission: same layout as a Messerli/CAN export (numbering
// columns, :ZONE / quantity / unit / PU / montant fields, page furniture,
// "A reporter", R positions, a page break inside a position), invented text.
// ---------------------------------------------------------------------------
const W = 595, H = 842;
function page(n, rows, chapter = '241 Constructions en béton coulé sur place F/04(V´11)') {
  const items = [
    { x: 57, y: 43, str: 'Projet :' },
    { x: 105, y: 43, str: 'TEST_VILLAS' },
    { x: 517, y: 54, str: '01.02.2026' },
    { x: 527, y: 43, str: `Page: ${n}` },
    { x: 57, y: 78, str: 'Contrat : 1' },
    { x: 113, y: 78, str: `CAN Construction : ${chapter}` },
    { x: 101, y: 776, str: 'A reporter :' },
    { x: 517, y: 776, str: '.................' },
  ];
  let y = 106;
  for (const r of rows) {
    for (const [x, str] of r) items.push({ x, y, str });
    y += 11;
  }
  return items.map((it) => ({ page: n, w: it.str.length * 5, h: 10, fontSize: 10, ...it }));
}
const right = (edge, str) => [edge - str.length * 5, str];
const qty = (zone, q, unit, pu = '......................', amt = '......................') => [[249, `:${zone}`], [368 - String(q).length * 5.5, String(q)], [390, unit], right(537, pu), right(610, amt)];
const pages = [
  page(1, [[[59, '100'], [101, 'Béton et béton armé']], [[101, '--------------------------------------------']], [[59, '120'], [101, 'Béton de propreté']], [[101, '--------------------------------------------']],
    [[59, '121'], [101, 'Béton maigre sous radier, épaisseur selon plans de']], [[101, 'l’ingénieur.']], [[76, '.100 Béton C 8/10.']], [[77, '.111 Epaisseur jusqu’à mm 50.']],
    qty('PG', 650, 'm2'), qty('A-B', 70, 'm2'), qty('C-D', 100, 'm2'), qty('Total', 820, 'm2'), [[77, '.112 Epaisseur mm 51 à 100.']]]),
  page(2, [[[60, '121.112 Epaisseur mm 51 à 100.']], qty('PG', 60, 'm2'),
    [[46, 'R'], [76, '.903 Trous de m3 0,151 à 0,250']], qty('PG', 5, 'p'),
    [[59, '200'], [101, 'Coffrages']], [[101, '--------------------------------------------']],
    [[59, '214'], [101, 'Coffrages pour semelles filantes.']], [[76, '.114 Hauteur de coffrage m jusqu’à']], [[101, '0.40']], qty('A-B', 40, 'm2'), qty('C-D', 40, 'm2'), qty('PARK', 30, 'm2'), qty('Total', 108, 'm2'),
    [[59, '222'], [101, 'Calcul. up = Fr., prix unitaire = facteur.']], [[77, '.001 Montant des salaires.']], qty('PG', "8'000", 'up', '0.90', "7'200.00"),
    [[59, '230'], [101, 'Divers sans unité']], [[77, '.001 Quantité seule']], [[249, ':PG'], [357, '12'], [390, 'palettes'], [427, '......................'], [500, '......................']],
    [[495, '........................'], [101, 'Total Constructions en béton coulé sur place'], [59, '241']]]),
];
const synthetic = { pages: [1, 2, 3, 4].map((p) => ({ page: p, width: W, height: H, rotation: 0, textItems: 20 })), items: pages.flat(), scanned: false };
// two extra pages of furniture only, so headers are recognised as repeated
synthetic.items.push(...page(3, [[[101, 'Remarque finale.']]]), ...page(4, [[[101, 'Fin.']]]));

const r = parseTender(synthetic);
const byRef = (ref) => r.nodes.find((n) => n.positionPath === ref);

test('classification and chapter from page furniture', () => {
  assert.equal(r.classification, 'CAN');
  const ch = r.nodes.find((n) => n.nodeType === 'chapter');
  assert.equal(ch.rawNumber, '241');
  assert.equal(ch.canVersion, "F/04(V'11)");
  assert.equal(r.meta.date, '2026-02-01');
});

test('page furniture and carry-forwards are not content', () => {
  const lines = groupLines(synthetic.items);
  const { furniture } = splitFurniture(lines, synthetic.pages);
  assert.ok(furniture.some((l) => l.text.includes('Page:')));
  assert.ok(!r.nodes.some((n) => /A reporter|Page:/.test(n.description)));
  assert.equal(r.stats.carryForwards, 4);
});

test('hierarchy follows CAN numbering, parents are structure only', () => {
  const p = byRef('121.111');
  assert.equal(p.nodeType, 'billable_position');
  assert.equal(p.displayReference, '241 / 121.111');
  assert.equal(p.rawNumber, '.111');
  const parent = r.nodes.find((n) => n.key === p.parentKey);
  assert.equal(parent.positionPath, '121.100');
  assert.equal(byRef('121').nodeType, 'article');
  assert.equal(byRef('120').nodeType, 'subsection');
  assert.equal(byRef('100').nodeType, 'section');
  assert.equal(byRef('121').description, 'Béton maigre sous radier, épaisseur selon plans de\nl’ingénieur.');
});

test('breakdowns kept, total from the document, sum checked', () => {
  const p = byRef('121.111');
  assert.equal(p.quantity, 820);
  assert.equal(p.unit, 'm2');
  assert.deepEqual(p.breakdowns.map((b) => [b.code, b.quantity]), [['PG', 650], ['A-B', 70], ['C-D', 100]]);
  assert.equal(p.certainty, 'certain');
  const bad = byRef('214.114');
  assert.equal(bad.quantity, 108);
  assert.ok(bad.issues.some((i) => i.kind === 'breakdown_sum'), '40 + 40 + 30 ≠ 108 must be flagged');
  assert.equal(bad.certainty, 'probable');
  assert.ok(bad.description.includes('0.40'), 'wrapped text stays text, not a quantity');
});

test('a position split by a page break is one position', () => {
  const all = r.nodes.filter((n) => n.positionPath === '121.112');
  assert.equal(all.length, 1);
  assert.equal(all[0].quantity, 60);
});

test('R positions keep their R', () => {
  const p = byRef('121.903');
  assert.equal(p.isReserved, true);
  assert.equal(p.rawNumber, 'R .903');
  assert.equal(p.displayReference, 'R 241 / 121.903');
  assert.equal(p.unit, 'pce');
});

test('prices printed in the document are read and checked', () => {
  const p = byRef('222.001');
  assert.equal(p.quantity, 8000);
  assert.equal(p.unit, 'up');
  assert.equal(p.documentUnitPrice, 0.9);
  assert.equal(p.documentAmount, 7200);
  assert.equal(p.issues.length, 0);
});

test('an unknown unit is never guessed: it becomes a question', () => {
  const p = byRef('230.001');
  assert.equal(p.rawUnit, 'palettes');
  assert.equal(p.certainty, 'uncertain');
  const q = r.questions.find((x) => x.kind === 'unit');
  assert.ok(q && q.nodeKeys.includes(p.key));
});

test('chapter totals are not positions', () => {
  assert.equal(r.stats.chapterTotals, 1);
  assert.ok(!r.nodes.some((n) => /^Total /.test(n.title)));
});

test('zone codes are asked once per document', () => {
  const zones = r.questions.filter((q) => q.kind === 'zone_label').map((q) => q.code).sort();
  assert.deepEqual(zones, ['A-B', 'C-D', 'PARK', 'PG']);
});

test('every billable line points to its page and box', () => {
  for (const n of r.nodes.filter((x) => x.nodeType === 'billable_position')) {
    assert.ok(n.page >= 1);
    assert.ok(n.bbox && n.bbox.x >= 0 && n.bbox.x <= 1 && n.bbox.y >= 0 && n.bbox.y <= 1);
  }
});

// ---- non-CAN document ----------------------------------------------------
test('a non-CAN bordereau is accepted (numbered headings + qty/unit)', () => {
  const rows = (n, list) => list.map(([x, y, str]) => ({ page: n, x, y, w: str.length * 5, h: 10, fontSize: 10, str }));
  const doc = {
    pages: [{ page: 1, width: W, height: H, rotation: 0, textItems: 10 }],
    scanned: false,
    items: rows(1, [
      [50, 100, '1'], [80, 100, 'Démolition'],
      [50, 120, '1.1'], [80, 120, 'Dépose carrelage existant'], [380, 120, '45.5'], [420, 120, 'm2'], [470, 120, '35.00'], [530, 120, '1592.50'],
      [50, 140, '1.2'], [80, 140, 'Evacuation gravats'], [380, 140, '3'], [420, 140, 'm3'], [470, 140, '120.00'], [530, 140, '360.00'],
      [50, 160, '2'], [80, 160, 'Peinture'],
      [50, 180, '2.1'], [80, 180, 'Murs, 2 couches'], [380, 180, '210'], [420, 180, 'm2'], [470, 180, '18.00'], [530, 180, '3780.00'],
    ]),
  };
  const res = parseTender(doc);
  assert.equal(res.classification, 'CUSTOM');
  const bill = res.nodes.filter((n) => n.nodeType === 'billable_position');
  assert.equal(bill.length, 3);
  const p = bill.find((n) => n.positionPath === '1.1');
  assert.equal(p.quantity, 45.5);
  assert.equal(p.unit, 'm2');
  assert.equal(p.documentUnitPrice, 35);
  assert.equal(p.documentAmount, 1592.5);
  assert.equal(res.nodes.find((n) => n.key === p.parentKey).positionPath, '1');
});

// ---- the real reference soumission (local only: CAN texts belong to CRB) ---
const FIXTURE = new URL('../fixtures/tenders/01_BA_maconnerie.pdf', import.meta.url);
test('reference soumission 01_BA_maconnerie.pdf', { skip: !existsSync(FIXTURE) && 'fixture not present (gitignored)' }, async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const { extractText } = await import('../lib/tenders/parser/extract.ts');
  const doc = await extractText(pdfjs.default ?? pdfjs, new Uint8Array(readFileSync(FIXTURE)));
  const res = parseTender(doc);
  assert.equal(doc.scanned, false);
  assert.equal(res.classification, 'CAN');
  assert.equal(res.meta.cfcCode, '211');
  assert.ok(res.meta.owner?.startsWith('TOBO HOLDING SA'));
  assert.ok(res.meta.architect?.startsWith('BF Architecture'));
  assert.deepEqual(res.meta.zoneCodes, ['PG', 'A-B', 'C-D', 'F-G', 'E-COUV', 'PARK']);
  const chapters = res.nodes.filter((n) => n.nodeType === 'chapter').map((n) => n.rawNumber);
  assert.deepEqual(chapters, ['102', '111', '112', '113', '172', '241', '314', '315']);
  assert.ok(res.stats.billable > 100, `billable ${res.stats.billable}`);
  assert.ok(res.stats.reserved > 0);
  assert.ok(res.stats.carryForwards > 20);
  assert.equal(res.stats.chapterTotals, 7);
  // the example of the specification
  const p = res.nodes.find((n) => n.displayReference === '241 / 121.111');
  assert.equal(p.quantity, 820);
  assert.deepEqual(p.breakdowns.map((b) => [b.code, b.quantity]), [['PG', 650], ['A-B', 70], ['C-D', 100]]);
  // régie: prices printed in the document, q × p = montant
  const regie = res.nodes.find((n) => n.displayReference === '111 / 222.001');
  assert.equal(regie.documentAmount, 7200);
  assert.equal(regie.issues.length, 0);
  // more than 95 % of positions settled without asking
  assert.ok(res.stats.certain / res.stats.billable > 0.95);
});

// ---- scanned PDF: OCR rows go through the same parser ---------------------
import { rowsToItems } from '../lib/tenders/parser/ocrLayout.ts';
test('OCR rows are laid out and parsed like a native soumission', () => {
  const L = (o) => ({ kind: 'line', reserved: false, number: '', text: '', zone: '', quantity: '', unit: '', unit_price: '', amount: '', ...o });
  const doc = rowsToItems([
    { page: 1, rows: [L({ kind: 'chapter_header', text: 'CAN Construction : 241 Constructions en béton coulé sur place F/04(V´11)' }), L({ number: '121', text: 'Béton maigre' }), L({ number: '.111', text: 'Epaisseur 50' }), L({ zone: 'PG', quantity: '650', unit: 'm2' }), L({ zone: 'A-B', quantity: '70', unit: 'm2' }), L({ zone: 'Total', quantity: '720', unit: 'm2' }), L({ reserved: true, number: '.903', text: 'Trous' }), L({ zone: 'PG', quantity: "1'250", unit: 'p' })] },
    { page: 2, rows: [L({ kind: 'chapter_header', text: 'CAN Construction : 241 Constructions en béton coulé sur place F/04(V´11)' }), L({ number: '222', text: 'Régie' }), L({ number: '.001', text: 'Salaires' }), L({ zone: 'PG', quantity: "8'000", unit: 'up', unit_price: '0.90', amount: "7'200.00" })] },
    { page: 3, rows: [L({ kind: 'chapter_header', text: 'CAN Construction : 241 Constructions en béton coulé sur place F/04(V´11)' }), L({ text: 'Fin' })] },
  ]);
  const res = parseTender(doc);
  assert.equal(res.classification, 'CAN');
  const p = res.nodes.find((n) => n.positionPath === '121.111');
  assert.equal(p.quantity, 720);
  assert.deepEqual(p.breakdowns.map((b) => b.code), ['PG', 'A-B']);
  const r = res.nodes.find((n) => n.positionPath === '121.903');
  assert.equal(r.isReserved, true);
  assert.equal(r.quantity, 1250);
  const regie = res.nodes.find((n) => n.positionPath === '222.001');
  assert.equal(regie.documentUnitPrice, 0.9);
  assert.equal(regie.documentAmount, 7200);
});
