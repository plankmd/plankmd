'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validate } = require('../src/plankmd.js');
const physics = require('../src/physics.js');

let highs = null;
try { highs = require('highs'); } catch { /* optional dependency */ }
const skip = highs ? false : 'the optional "highs" package is not installed';

const block = (lines) => `\`\`\`plank\n${lines.join('\n')}\n\`\`\`\n`;
const steps = (...blocks) => blocks.map(block).join('\n');
const deg = (rad) => (rad * 180) / Math.PI;
let solver;
const load = async () => (solver = solver || (await highs()));
const analyse = async (text) => physics.analyse(await load(), validate(text));
const tiltOf = async (lines) => physics.tiltMargin(await load(), validate(block(lines)).planks).degrees;

test('a plank lying on the ground slides before it tips: the limit is the friction angle', { skip }, async () => {
  const t = await tiltOf(['flat-x 0 0 0']);
  assert.ok(Math.abs(t - deg(Math.atan(physics.FRICTION))) < 0.1, `${t}`);
});

test('a standing plank tips at the angle of its own half-width over half-height', { skip }, async () => {
  const t = await tiltOf(['up-x 0 0 0']);
  // Its edge counts for a little less than its half-thickness: see EDGE_MARGIN.
  assert.ok(Math.abs(t - deg(Math.atan((0.5 - physics.EDGE_MARGIN) / 7.5))) < 0.1, `${t}`);
  const r = await analyse(block(['up-x 0 0 0']));
  assert.deepEqual(r.diagnostics.map((d) => d.code), ['I-fragile']);
});

test('an overhang stands while the centre of gravity is above the support, then falls', { skip }, async () => {
  assert.equal((await analyse(block(['flat-x 0 0 0', 'flat-x 7 0 1']))).stable, true);
  const r = await analyse(block(['flat-x 0 0 0', 'flat-x 8 0 1']));
  assert.equal(r.stable, false);
  assert.deepEqual(r.diagnostics.map((d) => [d.code, d.plank, d.failing]), [['I-unstable', 2, [2]]]);
});

test('a counterweight placed afterwards: unstable for a while, then stands again', { skip }, async () => {
  const r = await analyse(steps(['flat-x 0 0 0', 'flat-x 8 0 1'], ['flat-y 8 -6 2']));
  assert.equal(r.stable, false);
  assert.equal(r.diagnostics[0].code, 'I-unstable');
  assert.match(r.diagnostics[0].message, /stands again afterwards/);
  assert.deepEqual(r.placements.map((p) => p.stands), [true, false, true]);
});

test('a spiral turning around the end of the plank falls, around its centre it stands', { skip }, async () => {
  const around = (pivot) => block([`flat-x 0 -1.5 0 repeat=24 offset=0,0,1 rot-step=10${pivot}`]);
  assert.equal((await analyse(around(' pivot=0,0'))).stable, false);
  assert.equal((await analyse(around(''))).stable, true);
});

test('physics is skipped while the model has errors or floating planks', { skip }, async () => {
  const r = await analyse(block(['flat-x 0 0 0', 'flat-x 0 0 5']));
  assert.ok(r.skipped);
  assert.deepEqual(r.placements, []);
});

test('every sample stands at every placement, with a tilt margin, unless it falls on purpose', { skip }, async () => {
  const dir = path.join(__dirname, '..', 'samples');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.plank.md'))) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const r = await analyse(text);
    // Leaning planks are for the drop test (test/drop.test.js): the balance check says so.
    if (/\blean=/.test(text)) { assert.deepEqual(r.diagnostics.map((d) => d.code), ['I-unchecked-lean'], file); continue; }
    if (/^expect:\s*falls\s*$/m.test(text)) { assert.equal(r.stable, false, file); continue; }
    assert.equal(r.stable, true, file);
    assert.ok(r.steps.every((s) => s.tilt >= physics.FRAGILE_TILT), `${file}: ${JSON.stringify(r.steps)}`);
  }
});

test('every reference case gets the expected verdict', { skip }, async () => {
  const dir = path.join(__dirname, 'cases');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.plank.md'))) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const expected = text.match(/^expect:\s*(stands|falls)\s*$/m)[1];
    const r = await analyse(text);
    assert.equal(r.stable, expected === 'stands', file);
  }
});

test('every pattern in the LLM instructions stands', { skip }, async () => {
  const guide = fs.readFileSync(path.join(__dirname, '..', 'docs', 'llm-instructions.md'), 'utf8');
  // Patterns are the plank blocks of the page; examples quoted in a longer fence are not.
  const blocks = [...guide.replace(/^````[\s\S]*?^````$/gm, '').matchAll(/\n```plank\n([\s\S]*?)\n```/g)].map((m) => m[1]).filter((b) => !b.includes('<'));
  for (const b of blocks) {
    const r = await analyse('```plank\n' + b + '\n```\n');
    assert.equal(r.stable, true, b);
  }
});

test('a big model only gets the tilt of its last step, unless asked', { skip }, async () => {
  // A log-cabin tower of 304 planks in two steps: above TILT_ALL_MAX.
  const layers = (from, count) => [
    `flat-x 0 0 ${from} repeat=${count} offset=0,0,2`, `flat-x 0 12 ${from} repeat=${count} offset=0,0,2`,
    `flat-y 0 0 ${from + 1} repeat=${count} offset=0,0,2`, `flat-y 12 0 ${from + 1} repeat=${count} offset=0,0,2`];
  const text = steps(layers(0, 38), layers(76, 38));
  const result = validate(text);
  assert.ok(result.planks.length > physics.TILT_ALL_MAX);
  const r = physics.analyse(await load(), result);
  assert.equal(r.tilts, 'last');
  assert.deepEqual(r.steps.map((s) => [s.step, s.stands, s.tilt === null]), [[1, true, true], [2, true, false]]);
  assert.ok(r.steps[1].tilt > 0);
});

test('the tilt of one step on demand is the one a full check measures', { skip }, async () => {
  const text = fs.readFileSync(path.join(__dirname, '..', 'samples', 'corbel-bridge.plank.md'), 'utf8');
  const full = physics.analyse(await load(), validate(text), { tilts: 'all' });
  for (const s of full.steps) {
    const one = physics.stepTilt(await load(), validate(text), s.step);
    assert.equal(one.stands, s.stands);
    assert.ok(Math.abs(one.tilt - s.tilt) < 0.05, `step ${s.step}: ${one.tilt} vs ${s.tilt}`);
    // The direction may differ when two are tied, as on a symmetric model.
  }
  const some = physics.analyse(await load(), validate(text), { tilts: [2] });
  assert.deepEqual(some.steps.map((s) => s.tilt === null), [true, false, true]);
});

// A corbel bridge: the beams tip until their counterweights are on, so a
// scaffold carries them meanwhile (docs/proposals/scaffold.md).
const corbel = (weights, scaffold = true) => '## Piers\n\n```plank\nflat-y 0 0 0 repeat=4 offset=0,0,1\nflat-y 27 0 0 repeat=4 offset=0,0,1\n```\n\n' +
  `## Span\n\n\`\`\`plank\n${scaffold ? 'scaffold flat-x 7.5 6 0 repeat=4 offset=0,0,1\n' : ''}flat-x 0 6 4\nflat-x 15 6 4\n` +
  `flat-y 0 0 5 repeat=${weights} offset=0,0,1\nflat-y 27 0 5 repeat=${weights} offset=0,0,1\n\`\`\`\n`;

test('a scaffold holds the beams while they go on, and the bridge stands once it is removed', { skip }, async () => {
  const r = await analyse(corbel(5));
  assert.equal(r.stable, true, JSON.stringify(r.diagnostics));
  const result = validate(corbel(5));
  assert.equal(r.moves.length, result.moves.length);
  assert.equal(r.placements.length, 20);
  // Without the scaffold, the first beam tips as soon as it is placed.
  const bare = await analyse(corbel(5, false));
  assert.equal(bare.stable, false);
  assert.equal(bare.diagnostics[0].plank, 9);
});

test('a bridge too light to stand alone falls when its scaffold is removed', { skip }, async () => {
  const r = await analyse(corbel(2));
  assert.equal(r.stable, false);
  const d = r.diagnostics.find((x) => x.code === 'I-unstable');
  assert.equal(d.kind, 'remove');
  assert.deepEqual(d.removed, [1, 2, 3, 4]);
  assert.equal(d.move, validate(corbel(2)).moves.length);
  assert.match(d.message, /^When scaffolds 1 to 4 are removed, the construction falls .* without the scaffolding\.$/);
  assert.deepEqual(r.steps.map((s) => s.stands), [true, false]);
});

test('the tilt of a step is measured once its scaffolds are removed', { skip }, async () => {
  const full = await analyse(corbel(5));
  const one = physics.stepTilt(await load(), validate(corbel(5)), 2);
  assert.ok(Math.abs(one.tilt - full.steps[1].tilt) < 1e-6);
});

test('a model with a leaning plank is not checked: the drop test is', { skip }, async () => {
  const r = await analyse(block(['flat-x 0 0 0', 'up-y 0 0 1 lean=+y:10']));
  assert.ok(r.skipped);
  assert.deepEqual(r.diagnostics.map((d) => [d.code, d.plank]), [['I-unchecked-lean', 2]]);
  assert.equal(physics.stepTilt(await load(), validate(block(['up-y 0 0 0 lean=+y:10'])), 1), null);
});
