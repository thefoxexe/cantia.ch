import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from '../node_modules/typescript/lib/typescript.js';
import fs from 'node:fs';

const src = ts.transpileModule(fs.readFileSync(new URL('../lib/routeAccess.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { canOpenRoute } = await import('data:text/javascript,' + encodeURIComponent(src));

const worker = { canViewFinances: false, canManageDevis: false, permissions: { metre: false, planning: false, documents: false, subcontractors: true } };
const boss = { canViewFinances: true, canManageDevis: true, permissions: { metre: true, planning: true, documents: true, subcontractors: true } };

test('a restricted role cannot open the screens it does not allow', () => {
  for (const p of ['/tresorerie', '/depenses/abc', '/compta', '/metres', '/soumissions', '/planning', '/chantiers/p1/documents', '/chantiers/p1/profitability', '/chantiers/p1/metre', '/chantiers/p1/metres/t1', '/chantiers/p1/situations/new', '/chantiers/p1/travaux-supplementaires/x']) {
    assert.equal(canOpenRoute(p, worker), false, p);
    assert.equal(canOpenRoute(p, boss), true, p);
  }
});

test('everyday screens stay open', () => {
  for (const p of ['/', '/chantiers', '/chantiers/p1', '/chantiers/p1/feed', '/chantiers/p1/photos', '/rh', '/sous-traitants', '/compte/profil']) assert.equal(canOpenRoute(p, worker), true, p);
});
