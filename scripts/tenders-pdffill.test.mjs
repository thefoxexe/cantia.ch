import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { detectFieldLines, planFill, formatPdfAmount } from '../lib/tenders/pdfFill.ts';

const item = (page, x, y, str, w = str.length * 5) => ({ page, x, y, w, h: 9, str, fontSize: 9 });
const DOTS = '......................';

test('field lines and running totals', () => {
  const doc = {
    pages: [{ page: 1, width: 595, height: 842, rotation: 0, textItems: 0 }, { page: 2, width: 595, height: 842, rotation: 0, textItems: 0 }],
    scanned: false,
    items: [
      item(1, 60, 100, '121.111 Epaisseur'), item(1, 250, 120, ':Total'), item(1, 352, 120, '820'), item(1, 391, 120, 'm2'), item(1, 427, 120, DOTS, 61), item(1, 500, 120, DOTS, 61),
      item(1, 102, 200, 'Mise à disposition durant la durée total des travaux'), item(1, 363, 210, '1'), item(1, 391, 210, 'gl'), item(1, 427, 210, DOTS, 61), item(1, 500, 210, DOTS, 61),
      item(1, 101, 777, 'A reporter :'), item(1, 517, 777, '.................', 47),
      item(2, 60, 100, '233.001 Régie'), item(2, 345, 110, "5'000"), item(2, 391, 110, 'up'), item(2, 468, 110, '1.00'), item(2, 523, 110, "5'000.00"),
      item(2, 59, 300, '241'), item(2, 101, 300, 'Total Constructions en béton'), item(2, 495, 300, '........................', 66),
      item(2, 101, 350, 'Total général'), item(2, 495, 350, '........................', 66),
    ],
  };
  const lines = detectFieldLines(doc);
  assert.deepEqual(lines.map((l) => l.role), ['position', 'position', 'carry', 'chapter_total', 'grand_total']);
  const plan = planFill(lines, [
    { id: 'a', page: 1, y: 100, unitPrice: 60, amount: 49200 },
    { id: 'b', page: 1, y: 200, unitPrice: 800, amount: 800 },
    { id: 'c', page: 2, y: 100, unitPrice: 1, amount: 5000, printedAmount: 5000 },
  ]);
  const t = plan.writes.map((w) => `${w.kind}:${w.text}`);
  assert.deepEqual(t, ['unit_price:60.00', 'position:49\'200.00', 'unit_price:800.00', 'position:800.00', 'carry:50\'000.00', 'chapter_total:55\'000.00', 'grand_total:55\'000.00']);
  assert.equal(plan.total, 55000);
  assert.equal(formatPdfAmount(-1234.5), "-1'234.50");
});

test('unpriced positions stay blank and are reported', () => {
  const doc = { pages: [{ page: 1, width: 595, height: 842, rotation: 0, textItems: 0 }], scanned: false, items: [item(1, 250, 120, ':Total'), item(1, 352, 120, '820'), item(1, 391, 120, 'm2'), item(1, 427, 120, DOTS, 61), item(1, 500, 120, DOTS, 61)] };
  const plan = planFill(detectFieldLines(doc), [{ id: 'a', page: 1, y: 100, unitPrice: null, amount: null }]);
  assert.equal(plan.writes.length, 0);
  assert.deepEqual(plan.unpriced, ['a']);
});

const FIXTURE = new URL('../fixtures/tenders/01_BA_maconnerie.pdf', import.meta.url);
test('reference soumission: every price field found', { skip: !existsSync(FIXTURE) && 'fixture absente (CRB)' }, async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const { extractText } = await import('../lib/tenders/parser/extract.ts');
  const { parseTender } = await import('../lib/tenders/parser/parse.ts');
  const doc = await extractText(pdfjs.default ?? pdfjs, new Uint8Array(readFileSync(FIXTURE)));
  const r = parseTender(doc);
  const H = new Map(doc.pages.map((p) => [p.page, p.height]));
  const nodes = r.nodes.filter((n) => n.nodeType === 'billable_position' && n.bbox).map((n) => ({ id: n.key, page: n.page, y: n.bbox.y * H.get(n.page), unitPrice: 10, amount: n.quantity == null ? null : n.quantity * 10, printedAmount: n.documentAmount }));
  const lines = detectFieldLines(doc);
  const plan = planFill(lines, nodes);
  assert.equal(lines.filter((l) => l.role === 'carry').length, 28);
  assert.equal(lines.filter((l) => l.role === 'grand_total').length, 1);
  assert.equal(plan.unmatched, 0);
  assert.deepEqual(plan.notPlaced, []);
  const regie = plan.writes.find((w) => w.kind === 'chapter_total' && w.page === 14);
  assert.equal(regie.text, "18'600.00");
});

const MORE = (name) => new URL(`../fixtures/tenders/${name}`, import.meta.url);
async function parseAndPlan(file, terms) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const { extractText } = await import('../lib/tenders/parser/extract.ts');
  const { parseTender } = await import('../lib/tenders/parser/parse.ts');
  const doc = await extractText(pdfjs.default ?? pdfjs, new Uint8Array(readFileSync(file)));
  const r = parseTender(doc);
  const H = new Map(doc.pages.map((p) => [p.page, p.height]));
  const nodes = r.nodes.filter((n) => n.nodeType === 'billable_position' && n.bbox).map((n) => ({ id: n.key, page: n.page, y: n.bbox.y * H.get(n.page), unitPrice: 10, amount: (n.quantity ?? 2) * 10, quantity: n.quantity == null ? 2 : null, chapter: n.canChapter, printedAmount: n.documentAmount }));
  return { r, plan: planFill(detectFieldLines(doc), nodes, terms) };
}

test('"CAP" soumission: chapters per page, summary page filled', { skip: !existsSync(MORE('01_MACONNERIE.pdf')) && 'fixture absente' }, async () => {
  const { r, plan } = await parseAndPlan(MORE('01_MACONNERIE.pdf'), { discountPercent: 5, escomptePercent: 2, vatRate: 8.1 });
  assert.equal(r.stats.billable, 49);
  assert.equal(r.stats.uncertain, 0);
  assert.equal(new Set(r.nodes.filter((n) => n.nodeType === 'chapter').map((n) => n.rawNumber)).size, 7);
  assert.deepEqual(plan.notPlaced, []);
  const recap = plan.writes.filter((w) => w.kind.startsWith('recap'));
  assert.equal(recap.filter((w) => w.kind === 'recap_chapter').length, 7);
  const brut = recap.find((w) => w.kind === 'recap_brut').text;
  assert.equal(brut, plan.writes.filter((w) => w.kind === 'position').reduce((s, w) => s + Number(w.text.replace(/'/g, '')), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
  // the printed VAT rate (7.60) wins over the métré's
  assert.ok(recap.find((w) => w.kind === 'recap_tva'));
});

test('"descriptif type": blank quantities become positions to measure', { skip: !existsSync(MORE('muster_23-200.pdf')) && 'fixture absente' }, async () => {
  const { r, plan } = await parseAndPlan(MORE('muster_23-200.pdf'));
  const bill = r.nodes.filter((n) => n.nodeType === 'billable_position');
  assert.equal(bill.length, 3);
  assert.ok(bill.every((n) => n.quantity == null && n.unit === 'm2' && n.certainty === 'certain'));
  assert.equal(plan.writes.filter((w) => w.kind === 'quantity').length, 3);
  assert.equal(plan.writes.find((w) => w.kind === 'chapter_total').text, '60.00');
});

test('scan: OCR grid → field lines', async () => {
  const { fieldLinesFromOcr } = await import('../lib/tenders/pdfFill.ts');
  const { ocrFields } = await import('../lib/tenders/parser/ocrLayout.ts');
  const fields = ocrFields([{ page: 1, quantity_right: 62, price_right: 82, amount_right: 94, rows: [
    { kind: 'line', reserved: false, number: '.154', text: 'd mm 120', zone: '', quantity: '', unit: 'm2', unit_price: '', amount: '', y: 74 },
    { kind: 'total', reserved: false, number: '', text: 'A reporter :', zone: '', quantity: '', unit: '', unit_price: '', amount: '', y: 92 },
  ] }]);
  const lines = fieldLinesFromOcr(fields, [{ page: 1, width: 595, height: 842 }]);
  assert.deepEqual(lines.map((l) => [l.role, l.slots.length]), [['position', 3], ['carry', 1]]);
  assert.ok(Math.abs(lines[0].y - 0.74 * 842) < 0.01);
  assert.ok(Math.abs(lines[0].slots[2].right - (0.94 * 595 + 4)) < 0.01);
  const plan = planFill(lines, [{ id: 'a', page: 1, y: 600, unitPrice: 10, amount: 125, quantity: 12.5 }]);
  assert.deepEqual(plan.writes.map((w) => `${w.kind}:${w.text}`), ['quantity:12.5', 'unit_price:10.00', 'position:125.00', 'carry:125.00']);
});
