import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromGoogle, fromMicrosoft, toGoogle, toMicrosoft, zurichParts } from '../supabase/functions/calendar-sync/map.ts';

const ev = (o) => ({ id: 'a1', title: 'Séance de chantier', note: null, starts_on: '2026-10-07', ends_on: '2026-10-07', start_time: '08:00:00', end_time: '09:30:00', project_name: 'Villa Bertholet', project_address: 'Chemin des Vignes 4, 1870 Monthey', ...o });

test('Cantia → Google / Outlook: timed, all-day, no end time', () => {
  const g = toGoogle(ev({}));
  assert.deepEqual(g.start, { dateTime: '2026-10-07T08:00:00', timeZone: 'Europe/Zurich' });
  assert.deepEqual(g.end, { dateTime: '2026-10-07T09:30:00', timeZone: 'Europe/Zurich' });
  assert.equal(g.location, 'Chemin des Vignes 4, 1870 Monthey');
  assert.equal(g.extendedProperties.private.cantia_id, 'a1');
  const allDay = toGoogle(ev({ start_time: null, end_time: null, ends_on: '2026-10-09' }));
  assert.deepEqual([allDay.start, allDay.end], [{ date: '2026-10-07' }, { date: '2026-10-10' }]);
  const late = toGoogle(ev({ start_time: '23:30', end_time: null }));
  assert.deepEqual(late.end, { dateTime: '2026-10-08T00:30:00', timeZone: 'Europe/Zurich' });
  const m = toMicrosoft(ev({ start_time: null, end_time: null }));
  assert.equal(m.isAllDay, true);
  assert.deepEqual([m.start.dateTime, m.end.dateTime], ['2026-10-07T00:00:00', '2026-10-08T00:00:00']);
});

test('Google → Cantia: Swiss time (summer and winter), all-day, midnight end, cancelled', () => {
  assert.deepEqual(zurichParts('2026-07-01T06:00:00Z'), { date: '2026-07-01', time: '08:00' });
  assert.deepEqual(zurichParts('2026-12-01T07:00:00Z'), { date: '2026-12-01', time: '08:00' });
  const t = fromGoogle({ id: 'g1', summary: 'Dentiste', start: { dateTime: '2026-10-07T14:00:00+02:00' }, end: { dateTime: '2026-10-07T15:00:00+02:00' } });
  assert.deepEqual([t.startsOn, t.endsOn, t.startTime, t.endTime, t.title], ['2026-10-07', '2026-10-07', '14:00', '15:00', 'Dentiste']);
  const d = fromGoogle({ id: 'g2', summary: 'Vacances', start: { date: '2026-10-12' }, end: { date: '2026-10-17' } });
  assert.deepEqual([d.startsOn, d.endsOn, d.startTime], ['2026-10-12', '2026-10-16', null]);
  const mid = fromGoogle({ id: 'g3', start: { dateTime: '2026-10-07T22:00:00+02:00' }, end: { dateTime: '2026-10-08T00:00:00+02:00' } });
  assert.deepEqual([mid.startsOn, mid.endsOn, mid.startTime, mid.endTime, mid.title], ['2026-10-07', '2026-10-07', '22:00', null, 'Rendez-vous']);
  assert.equal(fromGoogle({ id: 'g4', status: 'cancelled' }).cancelled, true);
  assert.equal(fromGoogle({ id: 'g5', start: { date: '2026-10-07' }, end: { date: '2026-10-08' }, extendedProperties: { private: { cantia_id: 'a1' } } }).cantiaId, 'a1');
});

test('Outlook → Cantia: wall times, all-day, removed', () => {
  const t = fromMicrosoft({ id: 'm1', subject: 'Réunion', isAllDay: false, start: { dateTime: '2026-10-07T10:00:00.0000000' }, end: { dateTime: '2026-10-07T11:00:00.0000000' } });
  assert.deepEqual([t.startsOn, t.startTime, t.endTime], ['2026-10-07', '10:00', '11:00']);
  const d = fromMicrosoft({ id: 'm2', subject: 'Congé', isAllDay: true, start: { dateTime: '2026-10-12T00:00:00.0000000' }, end: { dateTime: '2026-10-14T00:00:00.0000000' } });
  assert.deepEqual([d.startsOn, d.endsOn, d.startTime], ['2026-10-12', '2026-10-13', null]);
  assert.equal(fromMicrosoft({ id: 'm3', '@removed': { reason: 'deleted' } }).cancelled, true);
});
