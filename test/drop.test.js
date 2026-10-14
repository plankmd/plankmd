'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validate } = require('../src/plankmd.js');
const { createDrop } = require('../src/drop.js');

let R = null;
try { R = require('@dimforge/rapier3d-compat'); } catch { /* dev dependency */ }
const skip = R ? false : 'the "@dimforge/rapier3d-compat" package is not installed';
const ready = R ? R.init() : null;

const expectOf = (text) => (text.match(/^expect:\s*(stands|falls)\s*$/m) || [])[1] || 'stands';
const files = (dir) => fs.readdirSync(path.join(__dirname, '..', dir))
  .filter((f) => f.endsWith('.plank.md')).map((f) => path.join(__dirname, '..', dir, f));

// `expect: falls` means the construction falls at some point while it is
// built. The reference cases fall once finished too; a sample may fall during
// the build only (the diving board): the replay below checks that.
for (const file of files('test/cases').concat(files('samples'))) {
  const text = fs.readFileSync(file, 'utf8');
  const expected = expectOf(text);
  // Samples that fall on purpose are checked by the replays below.
  if (!file.includes('test/cases') && expected === 'falls') continue;
  const finished = expected;
  test(`drop test: ${path.basename(file)} ${finished} once built`, { skip }, async () => {
    await ready;
    const sim = createDrop(R, validate(text).planks);
    const result = sim.run();
    sim.free();
    assert.equal(result.stood, finished === 'stands', JSON.stringify(result.moved.slice(0, 3)));
  });
}

test('replay: the leaning tower stands until its flag, and the flag topples it', { skip }, async () => {
  await ready;
  const planks = validate(fs.readFileSync(path.join(__dirname, '..', 'samples', 'leaning-tower.plank.md'), 'utf8')).planks;
  const run = (list, options) => { const sim = createDrop(R, list, options); const r = sim.run(); sim.free(); return r; };
  const tower = planks.slice(0, -2);
  assert.equal(run(tower).stood, true, 'the tower alone stands');
  assert.equal(run(tower, { replay: true }).fellAt, null, 'the tower alone stands through its build');
  assert.equal(run(planks).stood, false, 'with the flag, it falls');
  const fell = run(planks, { replay: true }).fellAt;
  assert.ok(fell && fell.n >= 49, `falls when the flag is placed (fell at ${fell && fell.n})`);
});

test('replay: the diving board falls at plank 18, and stands with its weights placed first', { skip }, async () => {
  await ready;
  const text = fs.readFileSync(path.join(__dirname, '..', 'samples', 'diving-board.plank.md'), 'utf8');
  const board = '```plank\nflat-x 14 0 9 color=board\n```';
  const weights = '```plank\nflat-y 10 -6 9  color=weight\nflat-y 10 -6 10 color=weight\n```';
  const fixed = text.replace(board, '@@').replace(weights, board).replace('@@', weights);
  for (const [t, fell] of [[text, 18], [fixed, null]]) {
    const sim = createDrop(R, validate(t).planks, { replay: true });
    const result = sim.run();
    sim.free();
    assert.equal(result.fellAt && result.fellAt.n, fell);
  }
});

// Replay places planks one by one: a falling case must fall during the build,
// within one plank of where the balance check says it starts to fall (a slow
// topple from a knife-edge balance is only seen at the next placement).
const firstUnstable = { 'corbel-full-width': 19, 'overhang-8': 2, 'spiral-around-end': 3 };
for (const file of files('test/cases')) {
  const text = fs.readFileSync(file, 'utf8');
  const name = path.basename(file, '.plank.md');
  const expected = expectOf(text);
  test(`replay: ${name} ${expected}`, { skip }, async () => {
    await ready;
    const sim = createDrop(R, validate(text).planks, { replay: true });
    const result = sim.run();
    sim.free();
    if (expected === 'stands') assert.equal(result.fellAt, null);
    else {
      assert.ok(result.fellAt, 'expected a fall during the build');
      if (firstUnstable[name]) assert.ok(Math.abs(result.fellAt.n - firstUnstable[name]) <= 1, `fell at ${result.fellAt.n}`);
    }
  });
}

test('replay: a counterweight placed too late, the overhang falls first', { skip }, async () => {
  await ready;
  const late = '```plank\nflat-x 0 0 0\nflat-x 8 0 1\n```\n```plank\nflat-y 8 -6 2\n```\n';
  const sim = createDrop(R, validate(late).planks, { replay: true });
  const result = sim.run();
  sim.free();
  assert.equal(result.fellAt && result.fellAt.n, 2);
});

const corbelText = (weights) => '```plank\nflat-y 0 0 0 repeat=4 offset=0,0,1\nflat-y 27 0 0 repeat=4 offset=0,0,1\n```\n\n' +
  `\`\`\`plank\nscaffold flat-x 7.5 6 0 repeat=4 offset=0,0,1\nflat-x 0 6 4\nflat-x 15 6 4\nflat-y 0 0 5 repeat=${weights} offset=0,0,1\nflat-y 27 0 5 repeat=${weights} offset=0,0,1\n\`\`\`\n`;

test('replay with scaffolds: the bridge stands through the build, and falls when too light', { skip }, async () => {
  await ready;
  const run = (weights) => {
    const r = validate(corbelText(weights));
    const sim = createDrop(R, r.planks, { replay: true, moves: r.moves });
    const result = sim.run();
    assert.equal(sim.events, r.moves.length);
    sim.free();
    return result;
  };
  assert.equal(run(5).stood, true);
  const light = run(2);
  assert.equal(light.stood, false);
  assert.equal(light.fellAt.kind, 'remove');
  assert.equal(light.fellAt.n, 14);
});

test('leaning planks: two leaning on each other stand, one alone falls', { skip }, async () => {
  await ready;
  const drop = (text) => { const sim = createDrop(R, validate(text).planks); const r = sim.run(); sim.free(); return r; };
  assert.equal(drop('```plank\nup-y 0 0 0 lean=+x:10\nup-y 6.2 0 0 lean=-x:10\n```\n').stood, true);
  assert.equal(drop('```plank\nflat-y 12 0 0 repeat=4 offset=0,0,1\n```\n\n```plank\nflat-x 0 0 0 lean=-x:18.4\n```\n').stood, true);
  assert.equal(drop('```plank\nup-y 0 0 0 lean=+x:20\n```\n').stood, false);
});
