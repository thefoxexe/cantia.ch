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
