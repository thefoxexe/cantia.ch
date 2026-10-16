import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addWorkingDays, estimateEnd, guessKind, kindsOf, norm, parseStageCommand, progressAt, stageOverdue, stageTooEarly, workingDaysBetween } from '../lib/relief/stages.ts';

const web = [
  { label: 'Brief', days: 3 },
  { label: 'Conception', days: 10, minDays: 5 },
  { label: 'Développement', days: 20 },
  { label: 'Recette', days: 5 },
  { label: 'En ligne', days: 1 },
];
const build = [{ label: 'Préparation', days: 5 }, { label: 'Gros œuvre', days: 30 }, { label: 'Second œuvre', days: 25 }, { label: 'Finitions', days: 10 }, { label: 'Réception', days: 2 }];
const items = [
  { id: 'a', name: 'Site Boulangerie Favre', client: 'Favre SA', stages: web, stage: 1 },
  { id: 'b', name: 'Villa Dupont', client: null, stages: build, stage: 1 },
];

test('norm: accents, ligatures and punctuation', () => {
  assert.equal(norm('Gros œuvre !'), 'gros oeuvre');
  assert.equal(norm('Développement — v2'), 'developpement v2');
  assert.equal(norm('Straße'), 'strasse');
});

test('working days skip weekends (Fri 16.10.2026 → Mon 19.10 is 1)', () => {
  assert.equal(workingDaysBetween('2026-10-16', '2026-10-19'), 1);
  assert.equal(workingDaysBetween('2026-10-12', '2026-10-16'), 4);
  assert.equal(workingDaysBetween('2026-10-16', '2026-10-16'), 0);
  assert.equal(addWorkingDays('2026-10-16', 1), '2026-10-19');
  assert.equal(addWorkingDays('2026-10-12', 5), '2026-10-19');
});

test('progress follows the durations and never reaches 100 % on time alone', () => {
  // Brief (3) behind, 5 of 10 days into Conception, total 39.
  assert.equal(progressAt(web, 1, 5).toFixed(3), (8 / 39).toFixed(3));
  assert.ok(progressAt(web, 4, 50) < 1);
  assert.ok(progressAt(web, 0, 0) > 0);
});

test('estimated end: what is left of the step plus the next ones', () => {
  // At Conception since Mon 12.10, today Fri 16.10: 4 spent, 6 left + 20 + 5 + 1 = 32 working days.
  assert.equal(estimateEnd(web, 1, '2026-10-12', '2026-10-16'), addWorkingDays('2026-10-16', 32));
});

test('overdue and too early', () => {
  assert.equal(stageOverdue(web[1], 11), true);
  assert.equal(stageOverdue(web[1], 10), false);
  assert.equal(stageTooEarly(web[1], 3), true);
  assert.equal(stageTooEarly(web[1], 5), false);
  assert.equal(stageTooEarly(web[0], 0), false);
});

test('voice: "conception terminée, on passe au développement" on the open item', () => {
  assert.deepEqual(parseStageCommand('La conception est terminée, on passe au développement', { items, current: 'a' }), { itemId: 'a', stage: 2, reason: 'start' });
});

test('voice: a finished step moves to the next one', () => {
  assert.deepEqual(parseStageCommand('Conception finie', { items, current: 'a' }), { itemId: 'a', stage: 2, reason: 'finish' });
  assert.deepEqual(parseStageCommand('Le gros œuvre est terminé', { items, current: 'b' }), { itemId: 'b', stage: 2, reason: 'finish' });
});

test('voice: the item is found by its name when none is open', () => {
  assert.deepEqual(parseStageCommand('Villa Dupont, on commence les finitions', { items, current: null }), { itemId: 'b', stage: 3, reason: 'start' });
  assert.deepEqual(parseStageCommand('Pour Favre, recette', { items, current: null }), { itemId: 'a', stage: 3, reason: 'mention' });
});

test('voice: "étape suivante" and German / Italian', () => {
  assert.deepEqual(parseStageCommand('étape suivante', { items, current: 'a' }), { itemId: 'a', stage: 2, reason: 'next' });
  const de = [{ label: 'Konzept', days: 5 }, { label: 'Umsetzung', days: 10 }, { label: 'Abnahme', days: 2 }];
  assert.deepEqual(parseStageCommand('Konzept ist fertig, jetzt Umsetzung', { items: [{ id: 'x', name: 'Shop Meier', stages: de, stage: 0 }], current: 'x' }), { itemId: 'x', stage: 1, reason: 'start' });
  const it = [{ label: 'Progetto', days: 5 }, { label: 'Sviluppo', days: 10 }, { label: 'Collaudo', days: 2 }];
  assert.deepEqual(parseStageCommand('Sviluppo terminato', { items: [{ id: 'y', name: 'Sito Rossi', stages: it, stage: 1 }], current: 'y' }), { itemId: 'y', stage: 2, reason: 'finish' });
});

test('voice: nothing understood', () => {
  assert.deepEqual(parseStageCommand('bonjour', { items, current: null }), { itemId: null, stage: null, reason: null });
  assert.deepEqual(parseStageCommand('bonjour', { items, current: 'a' }), { itemId: 'a', stage: null, reason: null });
});

test('kinds: the owner’s kinds, or the single process of an older world', () => {
  const spec = { stages: [{ label: 'Brief' }, { label: 'Conception' }, { label: 'En ligne' }], vocabulary: { item: 'projet', items: 'projets', place: 'Bureau' } };
  assert.deepEqual(kindsOf(spec, null), [{ id: 'main', name: 'projet', stages: spec.stages }]);
  const kinds = kindsOf(spec, {
    stages: [],
    kinds: [
      { id: 'vitrine', name: 'Site vitrine', stages: [{ label: 'Brief', owner: '', days: 2, client: false }, { label: 'Maquette', owner: '', days: 5, minDays: 3, client: true }] },
      { id: 'shop', name: 'E-shop', stages: [{ label: 'Brief', owner: '', days: 3, client: false }, { label: 'Catalogue', owner: '', days: 10, client: false }, { label: '', owner: '', days: 0, client: false }] },
    ],
  });
  assert.equal(kinds.length, 2);
  assert.deepEqual(kinds[0].stages[1], { label: 'Maquette', days: 5, minDays: 3, client: true });
  assert.equal(kinds[1].stages.length, 2);
  assert.equal(guessKind(kinds, 'E-shop Boulangerie Favre').id, 'shop');
  assert.equal(guessKind(kinds, 'Refonte Favre').id, 'vitrine');
});
