import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectScale } from '../lib/tenders/planScale.ts';

test('scale read on a plan', () => {
  assert.equal(detectScale(['A-102 Rez-de-chaussée', 'Échelle 1:50 · Format A3'])?.scale, 50);
  assert.equal(detectScale(['Massstab 1:100'])?.scale, 100);
  assert.equal(detectScale(['Echelle', '1/50'])?.scale, 50);
  assert.equal(detectScale(['M 1:200', 'Détail A 1:20'])?.scale, 200);
  assert.equal(detectScale(['1:50'])?.confident, false);
  assert.equal(detectScale(['Date 1/12/2026']), null);
  assert.equal(detectScale(['Echelle 1:37']), null);
  assert.equal(detectScale(['Echelle 1:50', 'Echelle 1:20']), null);
  assert.equal(detectScale(['Plan sans échelle']), null);
});

test('a plan saved smaller than its paper format', async () => {
  const { adjustScaleForPaper, detectPaperFormat } = await import('../lib/tenders/planScale.ts');
  assert.equal(detectPaperFormat(['échelle', '1:50', 'format', 'A0']), 'A0');
  // real A0 (2384 × 3370 pt): unchanged
  assert.deepEqual(adjustScaleForPaper(50, 'A0', 2384, 3370), { scale: 50, reduced: false });
  // A0 plan saved as A3 (842 × 1191 pt): 1:50 becomes ≈ 1:141.5
  const r = adjustScaleForPaper(50, 'A0', 842, 1191);
  assert.equal(r.reduced, true);
  assert.ok(Math.abs(r.scale - 141.5) < 0.5);
});
