import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactIban, formatIbanInput, ibanProblem, isValidSwissIban } from '../lib/iban.ts';

// Official example IBANs (SIX / PostFinance documentation).
const VALID = ['CH9300762011623852957', 'CH5604835012345678009', 'CH4431999123000889012'];

test('every typing style gives the same valid IBAN', () => {
  for (const typed of ['ch9300762011623852957', 'CH93 0076 2011 6238 5295 7', 'CH93-0076-2011-6238-5295-7', ' CH93.0076.2011.6238.5295.7 ', 'CH9300 7620 116238 52957']) {
    assert.equal(formatIbanInput(typed), 'CH93 0076 2011 6238 5295 7');
    assert.equal(compactIban(typed), 'CH9300762011623852957');
    assert.equal(isValidSwissIban(typed), true, typed);
    assert.equal(ibanProblem(typed), null);
  }
});

test('official example IBANs are accepted', () => {
  for (const i of VALID) assert.equal(isValidSwissIban(i), true, i);
});

test('a mistyped digit is caught and explained', () => {
  assert.deepEqual(ibanProblem('CH91 0878 1000 1908 2722 2'), { kind: 'checksum' });
  assert.deepEqual(ibanProblem('CH93 0076 2011 6238 5295'), { kind: 'short', missing: 1 });
  assert.deepEqual(ibanProblem('FR76 3000 6000 0112 3456 7890 189'), { kind: 'country' });
});
