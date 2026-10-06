import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseFormula, computeAllocation, paramsFromText, positionDimension, suggestPositions } from '../lib/tenders/allocation.ts';

const wall = { kind: 'polyline', length_m: 13.15, area_m2: null, perimeter_m: null, count: null };
const slab = { kind: 'polygon', length_m: null, area_m2: 75.6, perimeter_m: 35.6, count: null };

test('formulas: one wall feeds formwork, concrete and rebar', () => {
  assert.equal(computeAllocation('wall_formwork', wall, { height: 2.6 }).quantity, 68.38);
  assert.equal(computeAllocation('wall_formwork', wall, { height: 2.6, faces: 1 }).quantity, 34.19);
  assert.equal(computeAllocation('wall_volume', wall, { height: 2.6, thickness: 0.2 }).quantity, 6.838);
  assert.equal(computeAllocation('wall_rebar', wall, { height: 2.6, thickness: 0.2, rate: 85 }).quantity, 581.23);
  assert.equal(computeAllocation('slab_volume', slab, { thickness: 0.25 }).quantity, 18.9);
  assert.equal(computeAllocation('edge_formwork', slab, { height: 0.25 }).quantity, 8.9);
  assert.equal(computeAllocation('area', slab, { factor: 7 }).quantity, 529.2);
  const miss = computeAllocation('wall_volume', wall, { height: 2.6 });
  assert.equal(miss.quantity, null);
  assert.deepEqual(miss.missing, ['thickness']);
});

test('dimensions read from soumission texts', () => {
  const t = (s) => Object.fromEntries(paramsFromText(s).map((p) => [p.key, p.value]));
  assert.deepEqual(t('Dalle. Epaisseur mm 250. Barres, type d\'acier B500B Masse kg/m3 85'), { thickness: 0.25, rate: 85 });
  assert.deepEqual(t('Mur ép. 20 cm, hauteur 2.60 m'), { thickness: 0.2, height: 2.6 });
  assert.deepEqual(t('Epaisseur jusqu\'à mm 50.'), {});
  assert.deepEqual(t('Epaisseur mm 51 à 100.'), {});
  assert.deepEqual(t('Largeur de paillasse mm 900'), { width: 0.9 });
});

test('the right formula for the position', () => {
  assert.equal(chooseFormula('polyline', 'area', 'Coffrage de paroi type 2', 'wall'), 'wall_formwork');
  assert.equal(chooseFormula('polyline', 'area', 'Coffrage de rive de dalle', 'wall'), 'wall_area');
  assert.equal(chooseFormula('polyline', 'volume', 'Béton pour murs C30/37', 'wall'), 'wall_volume');
  assert.equal(chooseFormula('polyline', 'volume', 'Béton de semelles', 'wall'), 'strip_volume');
  assert.equal(chooseFormula('polygon', 'volume', 'Béton pour dalles', 'slab'), 'slab_volume');
  assert.equal(chooseFormula('polygon', 'mass', 'Acier d\'armature B500B', 'slab'), 'slab_rebar');
  assert.equal(chooseFormula('polygon', 'mass', 'Fers plats', 'slab'), null);
  assert.equal(chooseFormula('count', 'area', 'Coffrage', 'items'), null);
  assert.equal(positionDimension('up', 'Regard up = pce'), 'count');
});

test('suggestions rank what fits the drawn element', () => {
  const positions = [
    { id: 'a', ref: '121.111', title: 'Béton de propreté', text: 'Béton de propreté épaisseur jusqu\'à mm 50', unit: 'm2', context: '' },
    { id: 'b', ref: '311.111', title: 'Coffrage de parois', text: 'Coffrage de parois type 2', unit: 'm2', context: '' },
    { id: 'c', ref: '421.100', title: 'Béton pour murs', text: 'Béton pour murs, épaisseur mm 200', unit: 'm3', context: '' },
    { id: 'd', ref: '512.202', title: 'Goujons', text: 'Goujons d\'ancrage', unit: 'p', context: '' },
    { id: 'e', ref: '611.100', title: 'Béton pour dalles', text: 'Béton pour dalles', unit: 'm3', context: '' },
  ];
  const s = suggestPositions('polyline', 'wall', positions);
  assert.deepEqual(s.slice(0, 2).map((x) => x.position.id).sort(), ['b', 'c']);
  assert.equal(s.find((x) => x.position.id === 'c').params.thickness, 0.2);
  assert.ok(!s.some((x) => x.position.id === 'd'));
  const sl = suggestPositions('polygon', 'slab', positions);
  assert.equal(sl[0].position.id, 'e');
});

test('measuring from a position: the right tool first', async () => {
  const { measureModes } = await import('../lib/tenders/allocation.ts');
  const m = (title, unit, context = '') => measureModes({ id: 'x', ref: null, title, text: title, context, unit }).map((x) => `${x.kind}:${x.formula}`);
  assert.equal(m('Coffrage de parois type 2', 'm2')[0], 'polyline:wall_formwork');
  assert.equal(m('Béton pour dalles', 'm3')[0], 'polygon:slab_volume');
  assert.equal(m('Chape ciment', 'm2')[0], 'polygon:area');
  assert.equal(m('Béton pour murs', 'm3')[0], 'polyline:wall_volume');
  assert.deepEqual(m('Regards', 'pce'), ['count:count']);
  assert.equal(m('Joint de reprise up = ml', 'up')[0], 'polyline:length');
});
