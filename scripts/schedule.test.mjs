import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cascade, crossesNonWorking, endFromDuration, flatten, lateDays, reconcile, rollup, startFromDuration, wouldCycle, workdaysBetween } from '../lib/schedule/calc.ts';

const item = (o) => ({ parent_id: null, kind: 'task', name: o.id, trade: null, company: null, responsible_user_id: null, team_size: null, status: 'planned', progress: 0, progress_manual: false, start_date: null, end_date: null, duration: null, fixed: false, baseline_start: null, baseline_end: null, actual_start: null, actual_end: null, notes: null, sort_order: 0, ...o });

test('working days: Mon 12.10.2026 + 5 days = Fri, + 6 = next Mon; weekends skipped both ways', () => {
  assert.equal(endFromDuration('2026-10-12', 5), '2026-10-16');
  assert.equal(endFromDuration('2026-10-12', 6), '2026-10-19');
  assert.equal(endFromDuration('2026-10-10', 1), '2026-10-12'); // starts on a Saturday → Monday
  assert.equal(startFromDuration('2026-10-19', 6), '2026-10-12');
  assert.equal(workdaysBetween('2026-10-12', '2026-10-25'), 10);
  assert.equal(endFromDuration('2026-10-10', 2, [1, 2, 3, 4, 5, 6]), '2026-10-12'); // Saturdays worked
  assert.equal(crossesNonWorking('2026-10-15', '2026-10-19'), true);
  assert.equal(crossesNonWorking('2026-10-12', '2026-10-16'), false);
});

test('two of start / end / duration give the third; milestone has none', () => {
  assert.deepEqual(reconcile({ kind: 'task', start_date: '2026-10-12', end_date: null, duration: 10 }, 'duration'), { start_date: '2026-10-12', end_date: '2026-10-23', duration: 10 });
  assert.deepEqual(reconcile({ kind: 'task', start_date: '2026-10-12', end_date: '2026-10-20', duration: null }, 'end'), { start_date: '2026-10-12', end_date: '2026-10-20', duration: 7 });
  assert.deepEqual(reconcile({ kind: 'task', start_date: '2026-10-19', end_date: '2026-10-23', duration: 5 }, 'start'), { start_date: '2026-10-19', end_date: '2026-10-23', duration: 5 });
  assert.deepEqual(reconcile({ kind: 'task', start_date: null, end_date: '2026-10-23', duration: 5 }, 'end'), { start_date: '2026-10-19', end_date: '2026-10-23', duration: 5 });
  assert.deepEqual(reconcile({ kind: 'milestone', start_date: '2026-10-19', end_date: '2026-10-30', duration: 4 }, 'start'), { start_date: '2026-10-19', end_date: '2026-10-19', duration: 0 });
});

test('late and phase roll-up (weighted by duration, manual allowed)', () => {
  const items = [
    item({ id: 'P', kind: 'phase' }),
    item({ id: 'a', parent_id: 'P', start_date: '2026-10-05', end_date: '2026-10-09', duration: 5, status: 'done', progress: 100 }),
    item({ id: 'b', parent_id: 'P', start_date: '2026-10-12', end_date: '2026-10-30', duration: 15, progress: 20 }),
    item({ id: 'm', parent_id: 'P', kind: 'milestone', start_date: '2026-11-02', end_date: '2026-11-02' }),
  ];
  const r = rollup(items, '2026-11-03');
  assert.deepEqual([r.get('P').start, r.get('P').end, r.get('P').progress], ['2026-10-05', '2026-11-02', 40]);
  assert.equal(lateDays(items[2], '2026-11-03'), 4);
  assert.equal(lateDays(items[1], '2026-11-03'), 0);
  assert.equal(r.get('P').late, 4);
  items[0].progress_manual = true;
  items[0].progress = 70;
  assert.equal(rollup(items, '2026-11-03').get('P').progress, 70);
});

test('cascade: successors pushed after their latest predecessor, fixed ones flagged, cycles refused', () => {
  const items = [
    item({ id: 'mac', start_date: '2026-10-12', end_date: '2026-10-23', duration: 10 }),
    item({ id: 'fen', start_date: '2026-10-19', end_date: '2026-10-23', duration: 5 }),
    item({ id: 'char', start_date: '2026-10-26', end_date: '2026-10-30', duration: 5 }),
    item({ id: 'tech', start_date: '2026-11-02', end_date: '2026-11-13', duration: 10 }),
    item({ id: 'recep', kind: 'milestone', start_date: '2026-11-16', end_date: '2026-11-16', fixed: true }),
  ];
  const links = [
    { id: 'l1', from_item: 'mac', to_item: 'char' },
    { id: 'l2', from_item: 'char', to_item: 'tech' },
    { id: 'l3', from_item: 'fen', to_item: 'tech' },
    { id: 'l4', from_item: 'tech', to_item: 'recep' },
  ];
  items[0].end_date = '2026-10-27'; // masonry 2 days late
  const { shifts, conflicts } = cascade(items, links, ['mac']);
  assert.deepEqual(shifts.map((s) => `${s.id}:${s.to.start}→${s.to.end}`), ['char:2026-10-28→2026-11-03', 'tech:2026-11-04→2026-11-17']);
  assert.deepEqual(conflicts.map((c) => `${c.id}:${c.needsStart}`), ['recep:2026-11-18']);
  assert.equal(wouldCycle(links, 'recep', 'mac'), true);
  assert.equal(wouldCycle(links, 'fen', 'char'), false);
});

test('tree order with collapse', () => {
  const items = [item({ id: 'P', kind: 'phase', sort_order: 1 }), item({ id: 'b', parent_id: 'P', sort_order: 2 }), item({ id: 'a', parent_id: 'P', sort_order: 1 }), item({ id: 'Q', kind: 'phase', sort_order: 2 })];
  assert.deepEqual(flatten(items).map((r) => `${r.item.id}${r.depth}`), ['P0', 'a1', 'b1', 'Q0']);
  assert.deepEqual(flatten(items, new Set(['P'])).map((r) => r.item.id), ['P', 'Q']);
});

test('templates: villa plan and round trip keep dates and links', async () => {
  const { VILLA_TEMPLATE, planTemplate, toTemplate } = await import('../lib/schedule/templates.ts');
  const lines = planTemplate(VILLA_TEMPLATE, '2026-09-05'); // a Saturday
  const by = Object.fromEntries(lines.map((l) => [l.name, l]));
  assert.equal(by['Installation et préparation'].start_date, '2026-09-07');
  assert.equal(by['Installation et préparation'].end_date, '2026-09-08');
  assert.equal(by['Terrassement'].start_date, '2026-09-09');
  assert.equal(by['Réception'].kind, 'milestone');
  assert.equal(by['Réception'].start_date, by['Réception'].end_date);
  // parents first
  const seen = new Set();
  for (const l of lines) { if (l.parent) assert.ok(seen.has(l.parent)); seen.add(l.key); }
  // chantier -> template -> new start two weeks later: same shape, shifted
  const items = lines.map((l) => ({ id: 'i' + l.key, parent_id: l.parent ? 'i' + l.parent : null, kind: l.kind, name: l.name, trade: l.trade, duration: l.duration, start_date: l.start_date, end_date: l.end_date, sort_order: l.sort_order, status: 'planned', progress: 0 }));
  const links = VILLA_TEMPLATE.links.map(([a, b]) => ({ from_item: 'i' + a, to_item: 'i' + b }));
  const tpl = toTemplate(items, links);
  assert.equal(tpl.links.length, VILLA_TEMPLATE.links.length);
  assert.ok(!JSON.stringify(tpl).includes('2026'));
  const again = Object.fromEntries(planTemplate(tpl, '2026-09-21').map((l) => [l.name, l]));
  assert.equal(again['Terrassement'].start_date, '2026-09-23');
  assert.equal(again['Réception'].start_date > by['Réception'].start_date, true);
});

test('exports: Excel rows numbered like a WBS, MS Project XML with links and constraints', async () => {
  const { VILLA_TEMPLATE, planTemplate } = await import('../lib/schedule/templates.ts');
  const { scheduleSheetRows, scheduleMspdi } = await import('../lib/schedule/exports.ts');
  const lines = planTemplate(VILLA_TEMPLATE, '2026-09-07');
  const items = lines.map((l) => item({ id: 'i' + l.key, parent_id: l.parent ? 'i' + l.parent : null, kind: l.kind, name: l.name, trade: l.trade, duration: l.duration, start_date: l.start_date, end_date: l.end_date, sort_order: l.sort_order }));
  const links = VILLA_TEMPLATE.links.map(([a, b], i) => ({ id: 'l' + i, from_item: 'i' + a, to_item: 'i' + b }));
  const rolled = rollup(items, '2026-10-06');
  const rows = scheduleSheetRows(items, links, rolled);
  assert.equal(rows[0][0], 'N°');
  const terr = rows.find((r) => String(r[1]).trim() === 'Terrassement');
  assert.equal(terr[0], '2.1');
  assert.equal(terr[8], '1.1');
  assert.equal(terr[7], 5);
  const phase = rows.find((r) => r[1] === 'Gros œuvre');
  assert.equal(phase[2], 'Phase');
  const xml = scheduleMspdi({ project: 'Villa <Test> & Co', items, links, rolled, now: '2026-10-06T10:00:00' });
  assert.ok(xml.includes('<Title>Villa &lt;Test&gt; &amp; Co</Title>'));
  assert.equal((xml.match(/<Task>/g) ?? []).length, items.length);
  assert.equal((xml.match(/<PredecessorLink>/g) ?? []).length, links.length);
  assert.ok(xml.includes('<Duration>PT40H0M0S</Duration>'));
  assert.ok(xml.includes('<ConstraintType>4</ConstraintType><ConstraintDate>2026-09-07T08:00:00</ConstraintDate>'));
  assert.ok(xml.includes('<DayType>1</DayType><DayWorking>0</DayWorking>')); // Sunday off
  // balanced tags
  for (const t of ['Task', 'Project', 'Tasks', 'Calendar', 'WeekDay']) assert.equal((xml.match(new RegExp(`<${t}[ >]`, "g")) ?? []).length, (xml.match(new RegExp(`</${t}>`, 'g')) ?? []).length, t);
});
