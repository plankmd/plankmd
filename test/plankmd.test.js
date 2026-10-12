'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { parse, translate, expand, validate } = require('../src/plankmd.js');

const block = (lines, frontmatter = '') => `${frontmatter}\`\`\`plank\n${lines.join('\n')}\n\`\`\`\n`;
const codes = (r) => r.diagnostics.map((d) => d.code);

test('every sample is valid with no warning', () => {
  const dir = path.join(__dirname, '..', 'samples');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.plank.md'))) {
    const r = validate(fs.readFileSync(path.join(dir, file), 'utf8'));
    assert.deepEqual(r.diagnostics, [], file);
  }
});

test('the six orientations have the documented bounding boxes', () => {
  const r = validate(block(['flat-x 0 0 0', 'flat-y 20 0 0', 'edge-x 30 0 0', 'edge-y 50 0 0', 'up-x 60 0 0', 'up-y 70 0 0']));
  assert.deepEqual(r.planks.map((p) => p.size), [[15, 3, 1], [3, 15, 1], [15, 1, 3], [1, 15, 3], [3, 1, 15], [1, 3, 15]]);
});

test('the plank size comes from the frontmatter', () => {
  const r = validate(block(['flat-y 0 0 0'], '---\nplankmd: "0.1"\ntitle: T\nplank: [12, 2, 1]\n---\n'));
  assert.deepEqual(r.planks[0].size, [2, 12, 1]);
});

test('repeated lines are interleaved by round', () => {
  const r = validate(block(['flat-x 0 0 0 repeat=3 offset=0,0,2', 'flat-y 0 0 1 repeat=2 offset=0,0,2']));
  assert.deepEqual(r.planks.map((p) => [p.orientation, p.z0]),
    [['flat-x', 0], ['flat-y', 1], ['flat-x', 2], ['flat-y', 3], ['flat-x', 4]]);
  assert.deepEqual(r.planks.map((p) => p.n), [1, 2, 3, 4, 5]);
});

test('a plank resting on one placed after it floats, and the warning names it', () => {
  const r = validate(block(['flat-y 0 0 1', 'flat-x 0 0 0']));
  assert.equal(r.valid, true);
  assert.deepEqual(codes(r), ['W-floating']);
  assert.equal(r.diagnostics[0].plank, 1);
  assert.equal(r.diagnostics[0].line, 2);
});

test('touching faces do not overlap, shared volume does', () => {
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0', 'flat-x 15 0 0', 'flat-x 0 3 0']))), []);
  const r = validate(block(['flat-x 0 0 0', 'flat-x 14 0 0']));
  assert.equal(r.valid, false);
  assert.deepEqual(codes(r), ['E-overlap']);
  assert.equal(r.diagnostics[0].other, 1);
});

test('rotated planks are checked exactly', () => {
  // Turned 90° around its centre, the plank crosses the first one.
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0', 'flat-x 0 0 0 rot=90']))), ['E-overlap']);
  // Half a turn around one end: it only touches the plank below along a line, so it floats.
  assert.deepEqual(codes(validate(block(['flat-x 0 -1.5 0', 'flat-x 0 -1.5 1 rot=180 pivot=0,0']))), ['W-floating']);
  // A small turn keeps an overlap with the plank below.
  assert.deepEqual(codes(validate(block(['flat-x 0 -1.5 0', 'flat-x 0 -1.5 1 rot=10 pivot=0,0']))), []);
});

test('a pivot moves the plank around the axis', () => {
  const [p] = expand(parse(block(['flat-x 0 -1.5 0 rot=90 pivot=0,0'])));
  assert.ok(Math.abs(p.center[0]) < 1e-9 && Math.abs(p.center[1] - 7.5) < 1e-9);
});

test('grammar errors are reported with their line', () => {
  const r = validate('intro\n\n' + block(['flat-z 0 0 0', 'flat-x 0 0', 'flat-x 0 0 0 repeat=2', 'flat-x 0 0 0 tilt=3']));
  assert.deepEqual(r.diagnostics.map((d) => [d.code, d.line]),
    [['E-orientation', 4], ['E-parse', 5], ['E-parse', 6], ['W-unknown-attribute', 7]]);
});

test('ids are suffixed when repeated and must be unique', () => {
  const r = validate(block(['flat-x 0 0 0 id=wall repeat=2 offset=0,0,1', 'flat-x 0 6 0 id=wall-2']));
  assert.deepEqual(r.planks.map((p) => p.id), ['wall-1', 'wall-2', 'wall-2']);
  assert.deepEqual(codes(r), ['E-duplicate-id']);
});

test('frontmatter: missing fields warn, wrong types fail, inventory is checked', () => {
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0'], '---\nlang: en\n---\n'))), ['W-frontmatter', 'W-frontmatter']);
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0'], '---\nplankmd: "0.1"\ntitle: T\nplank: [15, 3]\n---\n'))), ['E-frontmatter']);
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0 repeat=3 offset=0,0,1'], '---\nplankmd: "0.1"\ntitle: T\ninventory: 2\n---\n'))), ['W-inventory']);
});

test('palette colors resolve, hex values are not taken for comments', () => {
  const r = validate(block(['flat-x 0 0 0 color=roof', 'flat-x 0 3 0 color=teal'], '---\nplankmd: "0.1"\ntitle: T\npalette:\n  roof: "#b03a2e"  # red\n---\n'));
  assert.deepEqual(r.planks.map((p) => p.color), ['#b03a2e', 'teal']);
});

test('steps take their title and text from the prose before them', () => {
  const r = validate('# Model\n\nIntro.\n\n## Step one\n\nDo this.\nThen that.\n\n' + block(['flat-x 0 0 0']) + '\n' + block(['flat-x 0 0 1']));
  assert.deepEqual(r.steps.map((s) => [s.title, s.text]), [['Step one', 'Do this. Then that.'], ['Step 2', '']]);
});

test('a plank block quoted inside a longer fence is not read', () => {
  const r = validate('````markdown\n```plank\nflat-x 0 0 5\n```\n````\n' + block(['flat-x 0 0 0']));
  assert.equal(r.planks.length, 1);
  assert.equal(r.steps.length, 1);
});

test('the player bundles the current samples and sources', () => {
  const { buildSamples, buildWorkerSource } = require('../scripts/build-samples.js');
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', 'player', f), 'utf8');
  assert.equal(read('samples.js'), buildSamples(), 'run "npm run build:samples"');
  assert.equal(read('worker-src.js'), buildWorkerSource(), 'run "npm run build:samples"');
});

test('every pattern in the LLM instructions is valid', () => {
  const guide = fs.readFileSync(path.join(__dirname, '..', 'docs', 'llm-instructions.md'), 'utf8');
  const blocks = [...guide.matchAll(/\n```plank\n([\s\S]*?)\n```/g)].map((m) => m[1]).filter((b) => !b.includes('<'));
  assert.ok(blocks.length >= 5);
  for (const b of blocks) assert.deepEqual(validate('```plank\n' + b + '\n```\n').diagnostics, [], b);
});

// Two parallel planks 9 u apart, measured with three guides laid side by side.
const gap = (y) => block(['guide flat-x 0 3 0 repeat=3 offset=0,3,0', 'flat-x 0 0 0', `flat-x 0 ${y} 0`]);

test('guides are not planks: no number, not counted, shown apart', () => {
  const r = validate(gap(12));
  assert.deepEqual(r.diagnostics, []);
  assert.equal(r.planks.length, 2);
  assert.deepEqual(r.planks.map((p) => p.n), [1, 2]);
  assert.equal(r.guides.length, 3);
  assert.ok(r.guides.every((g, i) => g.guide && g.g === i + 1 && g.n === undefined && g.step === 1));
});

test('a guide that does not fit means the gap is too small', () => {
  const r = validate(gap(11));
  assert.deepEqual(codes(r), ['E-guide-overlap']);
  assert.equal(r.diagnostics[0].other, 2);
  assert.equal(r.diagnostics[0].guide, 3); // the third guide, from y = 9 to 12
});

test('a chain of guides touching one side only means the gap is too wide', () => {
  const r = validate(gap(13));
  assert.deepEqual(codes(r), ['W-guide-loose']);
  assert.match(r.diagnostics[0].message, /only touches plank 1, even with the 2 guides/);
  assert.deepEqual(r.diagnostics[0].chain, [1, 2, 3]);
});

test('guides chained end to end measure a long gap', () => {
  const r = validate(block(['guide flat-x 15 0 0', 'guide flat-x 30 0 0', 'guide flat-y 45 0 0', 'flat-x 0 0 0', 'flat-x 48 0 0']));
  assert.deepEqual(r.diagnostics, []);
});

test('a guide holds nothing up and needs no support', () => {
  const r = validate(block(['guide flat-x 0 0 0', 'flat-y 0 0 1', 'guide flat-x 0 20 5']));
  // The plank on the guide floats; each guide touches at most one plank, so both are loose.
  assert.deepEqual(codes(r), ['W-guide-loose', 'W-floating', 'W-guide-loose']);
});

test('a guide only lives in its step', () => {
  // The guide of step 2 measures against planks of step 1; the guide of step 1
  // is gone by step 2 and does not collide with the plank placed there.
  const r = validate(block(['guide flat-x 0 3 0', 'flat-x 0 0 0', 'flat-x 0 6 0']) + block(['flat-x 0 3 0']));
  assert.deepEqual(r.diagnostics, []);
});

test('every gallery model is valid with no warning', () => {
  const dir = path.join(__dirname, '..', 'gallery');
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.plank.md'))) {
    const r = validate(fs.readFileSync(path.join(dir, file), 'utf8'));
    assert.deepEqual(r.diagnostics, [], file);
  }
});

test('the description is the text between the title and the first step heading', () => {
  const doc = '# Tower\n\nA small\ntower.\n\nTwo paragraphs.\n\n## Step 1: base\n\nLay it.\n\n```plank\nflat-x 0 0 0\n```\n';
  const r = parse(doc);
  assert.equal(r.description, 'A small tower.\n\nTwo paragraphs.');
  assert.equal(r.steps[0].title, 'Step 1: base');
  assert.equal(r.steps[0].text, 'Lay it.');
  assert.equal(parse('## Step 1\n\nLay it.\n\n```plank\nflat-x 0 0 0\n```\n').description, null);
  assert.equal(parse('# Tower\n\nLay it.\n\n```plank\nflat-x 0 0 0\n```\n').description, null);
  assert.equal(parse(block(['flat-x 0 0 0'])).description, null);
});

test('a translation gives the texts, the model everything else', () => {
  const dir = path.join(__dirname, '..', 'samples');
  const model = validate(fs.readFileSync(path.join(dir, 'square-tower.plank.md'), 'utf8'));
  const fr = parse(fs.readFileSync(path.join(dir, 'square-tower.fr.plank.md'), 'utf8'));
  assert.equal(fr.steps.length, model.steps.length);
  assert.ok(fr.steps.every((s) => s.lines.length === 0));
  const shown = translate(model, fr);
  assert.equal(shown.meta.title, 'Petite tour carrée');
  assert.equal(shown.meta.lang, 'fr');
  assert.equal(shown.meta.inventory, model.meta.inventory);
  assert.match(shown.description, /^Une tour creuse/);
  assert.equal(shown.steps[2].title, 'Étape 3 : le toit');
  assert.deepEqual(shown.steps.map((s) => s.lines), model.steps.map((s) => s.lines));
  assert.equal(shown.planks, model.planks);
  // A step the translation lacks keeps the model's text.
  const short = translate(model, parse('---\ntitle: T\n---\n\n## Un\n\n```plank\n```\n'));
  assert.equal(short.steps[0].title, 'Un');
  assert.equal(short.steps[1].title, model.steps[1].title);
  assert.equal(short.description, model.description);
});
