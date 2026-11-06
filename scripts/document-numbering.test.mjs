// lib/documentNumbering.ts mirrors public.format_document_number and
// public.document_number_format_valid (migration 20261106120000): the
// preview shown while typing must be the number the database will give.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDocumentNumber, isValidNumberFormat } from '../lib/documentNumberingFormat.ts';

const at = new Date('2026-11-06T10:00:00Z');

test('formats like the database', () => {
  assert.equal(formatDocumentNumber('FAC-{AAAA}-{NNNN}', 42, at), 'FAC-2026-0042');
  assert.equal(formatDocumentNumber('F{AA}-{NNN}', 7, at), 'F26-007');
  assert.equal(formatDocumentNumber('{AAAA}{MM}-{NNN}', 1234, at), '202611-1234');
  assert.equal(formatDocumentNumber('{NNNNN}', 315, at), '00315');
});

test('the year follows Swiss time', () => {
  // 31 December 23:30 UTC is already 1 January in Switzerland.
  assert.equal(formatDocumentNumber('{AAAA}-{NN}', 1, new Date('2026-12-31T23:30:00Z')), '2027-01');
});

test('a format needs exactly one counter and simple characters', () => {
  assert.ok(isValidNumberFormat('FAC-{AAAA}-{NNNN}'));
  assert.ok(isValidNumberFormat('{NNNN}'));
  assert.ok(!isValidNumberFormat('FAC-{AAAA}'));
  assert.ok(!isValidNumberFormat('{NN}-{NNNN}'));
  assert.ok(!isValidNumberFormat('FAC<{NNNN}>'));
  assert.ok(!isValidNumberFormat('X'.repeat(41) + '{N}'));
});
