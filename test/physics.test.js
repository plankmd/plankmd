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
  assert.ok(Math.abs(t - deg(Math.atan(0.5 / 7.5))) < 0.1, `${t}`);
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
  const blocks = [...guide.matchAll(/\n```plank\n([\s\S]*?)\n```/g)].map((m) => m[1]).filter((b) => !b.includes('<'));
  for (const b of blocks) {
    const r = await analyse('```plank\n' + b + '\n```\n');
    assert.equal(r.stable, true, b);
  }
});
