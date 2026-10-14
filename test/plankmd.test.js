'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { parse, translate, sourceHash, sha256, expand, validate } = require('../src/plankmd.js');

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
  // Patterns are the plank blocks of the page; examples quoted in a longer fence are not.
  const blocks = [...guide.replace(/^````[\s\S]*?^````$/gm, '').matchAll(/\n```plank\n([\s\S]*?)\n```/g)].map((m) => m[1]).filter((b) => !b.includes('<'));
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

test('a translation holds only text', () => {
  const tr = (frontmatter, body) => `---\nplankmd: "0.2"\ntitle: T\n${frontmatter}---\n\n${body}`;
  const empty = '## Un\n\n```plank\n```\n\n## Deux\n\n```plank\n```\n';
  assert.deepEqual(codes(validate(tr('translation-of: a.plank.md\nlang: fr\n', empty))), []);
  const r = validate(tr('translation-of: a.plank.md\ninventory: 30\npalette:\n  roof: red\n', '## Un\n\n```plank\nflat-x 0 0 0\nguide flat-x 0 3 0\n```\n'));
  assert.deepEqual(codes(r).filter((c) => c.includes('translation')).sort(), ['E-translation-planks', 'W-translation-ignored-key', 'W-translation-ignored-key', 'W-translation-lang']);
  const planks = r.diagnostics.find((d) => d.code === 'E-translation-planks');
  assert.equal(planks.step, 1);
  assert.match(planks.message, /^step 1 of a translation has 2 plank lines/);
  assert.deepEqual(codes(validate(tr('translation-of:\nlang: fr\n', empty))), ['E-translation-source']);
  // A model is validated as before: the translation checks need "translation-of".
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0'], '---\nplankmd: "0.1"\ntitle: T\ninventory: 3\n---\n'))), []);
});

test('a translation is checked against its original', () => {
  const tr = (lang, body) => `---\nplankmd: "0.2"\ntitle: T\ntranslation-of: a.plank.md\nlang: ${lang}\n---\n\n${body}`;
  const original = '---\nplankmd: "0.1"\ntitle: A\nlang: en\n---\n\n## One\n\n```plank\nflat-x 0 0 0\n```\n\n## Two\n\n```plank\nflat-x 0 0 1\n```\n';
  const two = '## Un\n\n```plank\n```\n\n## Deux\n\n```plank\n```\n';
  assert.deepEqual(codes(validate(tr('fr', two), { original })), []);
  assert.deepEqual(codes(validate(tr('fr', two))), [], 'no original given: only the file itself is checked');
  const short = validate(tr('fr', '## Un\n\n```plank\n```\n'), { original });
  assert.deepEqual(codes(short), ['W-translation-steps']);
  assert.equal(short.diagnostics[0].message, '1 step, but the original "a.plank.md" has 2');
  assert.deepEqual(codes(validate(tr('en', two), { original })), ['W-translation-lang']);
  assert.deepEqual(codes(validate(tr('fr', two), { original: null })), ['E-translation-source']);
  assert.deepEqual(codes(validate(tr('fr', two), { original: tr('de', two) })), ['E-translation-source']);
  assert.equal(validate(tr('fr', two), { original: null }).valid, false);
});

test('the command line checks a translation against the file it names', () => {
  const { execFileSync } = require('child_process');
  const bin = path.join(__dirname, '..', 'bin', 'plankmd.js');
  const out = JSON.parse(execFileSync(process.execPath, [bin, 'validate', '--json', path.join(__dirname, '..', 'samples', 'square-tower.fr.plank.md')], { encoding: 'utf8' }));
  assert.deepEqual(out[0].diagnostics, []);
  const os = require('os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plankmd-'));
  const file = path.join(dir, 'lost.fr.plank.md');
  fs.writeFileSync(file, '---\nplankmd: "0.2"\ntitle: T\ntranslation-of: lost.plank.md\nlang: fr\n---\n\n## Un\n\n```plank\n```\n');
  let failed = null;
  try { execFileSync(process.execPath, [bin, 'validate', '--json', file], { encoding: 'utf8' }); } catch (e) { failed = e; }
  assert.ok(failed, 'exit code 1');
  assert.deepEqual(JSON.parse(failed.stdout)[0].diagnostics.map((d) => d.code), ['E-translation-source']);
  fs.rmSync(dir, { recursive: true });
});

test('sha256 matches the standard one', () => {
  const crypto = require('crypto');
  for (const text of ['', 'abc', 'é'.repeat(55), 'x'.repeat(64), 'Étape 1 : 中文 😀\n'.repeat(20)]) {
    assert.equal(sha256(text), crypto.createHash('sha256').update(text, 'utf8').digest('hex'), JSON.stringify(text));
  }
});

test('the source hash of a translation flags a change in the original text', () => {
  const original = '---\ntitle: A\nlang: en\n---\n\n# A\n\nAbout A.\n\n## One\n\nLay it.\n\n```plank\nflat-x 0 0 0\n```\n';
  const hash = sourceHash(parse(original));
  assert.equal(hash, sha256('A\nAbout A.\nOne\nLay it.\n'));
  const tr = (h) => `---\nplankmd: "0.2"\ntitle: T\ntranslation-of: a.plank.md\nlang: fr\nsource-hash: ${h}\n---\n\n## Un\n\n\`\`\`plank\n\`\`\`\n`;
  assert.deepEqual(codes(validate(tr(hash), { original })), []);
  // The geometry is not part of the fingerprint, the text is.
  assert.deepEqual(codes(validate(tr(hash), { original: original.replace('flat-x 0 0 0', 'flat-y 0 0 0') })), []);
  for (const changed of [original.replace('Lay it.', 'Lay it flat.'), original.replace('About A.', 'About B.'), original.replace('title: A', 'title: B')]) {
    const r = validate(tr(hash), { original: changed });
    assert.deepEqual(codes(r), ['W-translation-stale']);
    assert.ok(r.diagnostics[0].message.endsWith(sourceHash(parse(changed))));
  }
  assert.deepEqual(codes(validate(tr('nope'), { original })), ['W-translation-stale']);
});

test('the command line prints the source hash of a model', () => {
  const { execFileSync } = require('child_process');
  const file = path.join(__dirname, '..', 'samples', 'square-tower.plank.md');
  const out = execFileSync(process.execPath, [path.join(__dirname, '..', 'bin', 'plankmd.js'), 'source-hash', file], { encoding: 'utf8' });
  assert.equal(out.trim(), sourceHash(parse(fs.readFileSync(file, 'utf8'))));
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'samples', 'square-tower.fr.plank.md'), 'utf8'), new RegExp(`^source-hash: ${out.trim()}$`, 'm'));
});

// ------------------------------------------------- v0.2: shared metadata

test('the metadata of shared models is checked, and kept', () => {
  const fm = (lines) => `---\nplankmd: "0.2"\ntitle: T\n${lines.join('\n')}\n---\n`;
  const ok = validate(block(['flat-x 0 0 0'], fm([
    'author: Jane Doe', 'license: CC-BY-4.0', 'url: https://gist.github.com/jane/0e9490ed', 'based-on: Castle, by Someone',
    'date: 2026-10-14', 'image: photos/castle.jpg', 'tags: [castle, médiéval, bridge-2]', 'minutes: 45'])));
  assert.deepEqual(ok.diagnostics, []);
  assert.deepEqual(ok.meta.tags, ['castle', 'médiéval', 'bridge-2']);
  assert.equal(ok.meta.minutes, 45);
  assert.equal(ok.meta.date, '2026-10-14');
  const bad = validate(block(['flat-x 0 0 0'], fm([
    'url: http://example.com/castle', 'based-on: ftp://example.com/x', 'date: 2026-02-30', 'image: ../secret.jpg',
    'tags: castle', 'minutes: 0'])));
  assert.deepEqual(codes(bad), Array(6).fill('E-frontmatter'));
  for (const key of ['url', 'based-on', 'date', 'image', 'tags', 'minutes']) assert.equal(bad.meta[key], undefined, key);
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0'], fm(['image: /etc/castle.jpg'])))), ['E-frontmatter']);
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0'], fm(['image: https://example.com/castle.jpg', 'tags: []'])))), []);
});

test('a translation ignores the metadata of the original', () => {
  const r = validate('---\nplankmd: "0.2"\ntitle: T\nlang: fr\ntranslation-of: a.plank.md\nurl: https://example.com\ntags: [a]\nview: back\n---\n\n## Un\n\n```plank view=front\n```\n');
  assert.deepEqual(codes(r), ['W-translation-ignored-key', 'W-translation-ignored-key', 'W-translation-ignored-key']);
});

// ------------------------------------------------------- v0.2: view hints

test('views: named directions, azimuths, elevations, on the model and on steps', () => {
  const r = validate('---\nplankmd: "0.2"\ntitle: T\nview: front-left,20\n---\n\n## One\n\n```plank view=back\nflat-x 0 0 0 id=base\n```\n\n' +
    '## Two\n\n```plank view=120,35 zoom=2 focus=step\nflat-x 0 0 1\n```\n\n## Three\n\n```plank view=top focus=base\nflat-x 0 0 2\n```\n\n## Four\n\n```plank\nflat-x 0 0 3\n```\n');
  assert.deepEqual(r.diagnostics, []);
  assert.deepEqual(r.meta.view, { azimuth: 315, elevation: 20 });
  assert.deepEqual(r.steps.map((s) => s.view), [
    { azimuth: 180, elevation: 28 }, { azimuth: 120, elevation: 35, zoom: 2, focus: 'step' }, { azimuth: 0, elevation: 90, focus: 'base' }, null]);
});

test('views: a bad value is a warning, and is ignored', () => {
  const r = validate('---\nplankmd: "0.2"\ntitle: T\nview: sideways\n---\n\n```plank view=back,95 zoom=-1 focus=Roof size=2 big\nflat-x 0 0 0\n```\n\n```plank focus=later\nflat-x 0 0 1\n```\n\n```plank\nflat-x 0 0 2 id=later\n```\n');
  assert.deepEqual(codes(r), ['W-view', 'W-view', 'W-view', 'W-view', 'W-unknown-attribute', 'W-view', 'W-view']);
  assert.equal(r.valid, true);
  assert.equal(r.meta.view, undefined);
  assert.equal(r.steps[0].view, null);
  assert.equal(r.steps[1].view.focus, undefined);
});

// ---------------------------------------------------- v0.2: leaning planks

test('a leaning plank pivots on the bottom edge on the side it leans towards', () => {
  const [p] = validate(block(['flat-x 0 0 0 lean=-x:30'])).planks;
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
  near(p.z0, 0);
  // The -x bottom edge stays at x = 0; the plank rises towards +x.
  near(Math.min(...p.corners.map((c) => c[0])), 0 - 1 * Math.sin(Math.PI / 6));
  near(p.z1, 15 * Math.sin(Math.PI / 6) + Math.cos(Math.PI / 6));
  assert.deepEqual(p.lean, { dir: '-x', degrees: 30 });
  // A standing plank leaning towards +y tips its top over towards +y.
  const [q] = validate(block(['up-y 0 0 0 lean=+y:10'])).planks;
  assert.ok(q.center[1] > 1.5 && q.z0 === 0);
});

test('lean values are checked', () => {
  for (const v of ['x:20', '+z:20', '+x:0', '+x:90', '+x', '-y:abc']) {
    assert.deepEqual(codes(validate(block([`flat-x 0 0 0 lean=${v}`]))), ['E-lean'], v);
  }
});

test('a ramp rests on the edge of a step, within the tolerance of the angle', () => {
  const ramp = (angle) => validate(`\`\`\`plank\nflat-y 12 0 0 repeat=4 offset=0,0,1\n\`\`\`\n\n\`\`\`plank\nflat-x 0 0 0 lean=-x:${angle}\n\`\`\`\n`);
  // The exact angle is atan(4 / 12) = 18.43°: a degree either way still rests on it.
  for (const a of [18.4, 18, 19]) assert.deepEqual(codes(ramp(a)), [], `${a}`);
  assert.deepEqual(codes(ramp(10)), ['E-overlap']);
  // Too flat to clear the step, or lying in the air.
  assert.deepEqual(codes(validate(block(['flat-x 0 0 1 lean=-x:5']))), ['W-floating']);
});

test('two planks leaning on each other, and a plank laid across them', () => {
  const r = validate('```plank\nup-y 0 0 0 lean=+x:10\nup-y 6.2 0 0 lean=-x:10\n```\n\n```plank\nflat-y 2.1 0 14.95\n```\n');
  assert.deepEqual(r.diagnostics, []);
  assert.deepEqual(codes(validate(block(['up-y 0 0 0 lean=+x:10', 'up-y 5 0 0 lean=-x:10']))), ['E-overlap']);
});

test('lean, then rot: the leaning plank turns as a whole', () => {
  const [a] = validate(block(['flat-x 0 0 0 lean=-x:20'])).planks;
  const [b] = validate(block(['flat-x 0 0 0 lean=-x:20 rot=90'])).planks;
  const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-9, `${x} != ${y}`);
  near(a.z1, b.z1);
  // Turned a quarter around the centre of its box (7.5, 1.5): the rise now goes towards +y.
  near(b.center[0], 7.5);
  near(b.center[1] - 1.5, a.center[0] - 7.5);
});

// ----------------------------------------------------------- v0.2: scaffolds

const corbel = (weights = 5, extra = '') => `---\nplankmd: "0.2"\ntitle: Corbel\n---\n\n## Piers\n\n\`\`\`plank\n` +
  'flat-y 0 0 0 repeat=4 offset=0,0,1\nflat-y 27 0 0 repeat=4 offset=0,0,1\n```\n\n## Span\n\n```plank\n' +
  `scaffold flat-x 7.5 6 0 repeat=4 offset=0,0,1${extra}\nflat-x 0 6 4\nflat-x 15 6 4\n` +
  `flat-y 0 0 5 repeat=${weights} offset=0,0,1\nflat-y 27 0 5 repeat=${weights} offset=0,0,1\n\`\`\`\n`;

test('a scaffold is placed whole, carries what rests on it, and goes at the end of its step', () => {
  const r = validate(corbel());
  assert.deepEqual(r.diagnostics, []);
  assert.equal(r.planks.length, 20);
  assert.deepEqual(r.scaffolds.map((s) => [s.s, s.z0, s.n]), [[1, 0, undefined], [2, 1, undefined], [3, 2, undefined], [4, 3, undefined]]);
  const kinds = r.moves.map((m) => (m.kind === 'plank' ? `p${m.plank.n}` : m.kind === 'scaffold' ? `s${m.scaffold.s}` : `-${m.scaffolds.map((x) => x.s).join('')}`));
  assert.deepEqual(kinds.slice(7, 14), ['p8', 's1', 's2', 's3', 's4', 'p9', 'p10']);
  assert.equal(kinds[kinds.length - 1], '-1234');
  assert.deepEqual(r.moves.map((m) => m.index), r.moves.map((m, i) => i + 1));
  assert.equal(r.scaffolds[0].removed, r.moves.length);
  // Without the scaffold, the beams still touch the piers: what they lack is
  // balance, which the balance check finds (test/physics.test.js).
  assert.deepEqual(codes(validate(corbel().replace(/^scaffold .*\n/m, ''))), []);
});

test('until releases a scaffold after a named plank, in the same step or later', () => {
  const r = validate(corbel(5, ' until=beam').replace('flat-x 15 6 4', 'flat-x 15 6 4 id=beam'));
  assert.deepEqual(r.diagnostics, []);
  const removal = r.moves.find((m) => m.kind === 'remove');
  assert.equal(removal.after, 10);
  // Removed before the counterweights: the beams rest on the piers' edges only, they still touch.
  const bad = validate(corbel(5, ' until=nothing'));
  assert.deepEqual(codes(bad), ['W-scaffold-release']);
  assert.match(bad.diagnostics[0].message, /no plank/);
  const early = validate(corbel(5, ' until=pier').replace('flat-y 0 0 0 repeat=4', 'flat-y 0 0 0 id=pier repeat=4'));
  assert.ok(codes(early).includes('W-scaffold-release'));
});

test('a plank left in the air when its scaffold goes is reported', () => {
  const r = validate('```plank\nscaffold flat-x 0 0 0\nflat-x 0 0 1\n```\n');
  assert.deepEqual(codes(r), ['W-scaffold-floating']);
  assert.equal(r.diagnostics[0].plank, 1);
});

test('a scaffold boxed in on every side cannot slide out, one free side is enough', () => {
  const r = validate('```plank\nflat-x 0 0 0\nflat-x 30 0 0\nflat-x 15 -3 0\nflat-x 15 3 0\nscaffold flat-x 15 0 0\nflat-x 8 0 1\nflat-x 23 0 1\n```\n');
  assert.deepEqual(codes(r), ['W-scaffold-wedged']);
  assert.equal(r.diagnostics[0].scaffold, 1);
  // Blocked at both ends only: it slides out sideways.
  assert.deepEqual(codes(validate('```plank\nflat-x 0 0 0\nflat-x 30 0 0\nscaffold flat-x 15 0 0\nflat-x 8 0 1\nflat-x 23 0 1\n```\n')), []);
});

test('scaffolds count in the inventory while they are in place', () => {
  const r = validate(corbel().replace('title: Corbel', 'title: Corbel\ninventory: 21'));
  assert.deepEqual(codes(r), ['W-inventory']);
  assert.match(r.diagnostics[0].message, /^24 planks at once, scaffolds included/);
  assert.deepEqual(codes(validate(corbel().replace('title: Corbel', 'title: Corbel\ninventory: 24'))), []);
});

test('a scaffold line is checked like a plank, and until only applies to it', () => {
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0', 'scaffold flat-x 0 0 0']))), ['E-overlap']);
  assert.deepEqual(codes(validate(block(['scaffold flat-x 0 0 2']))), ['W-floating']);
  assert.deepEqual(codes(validate(block(['flat-x 0 0 0 until=a']))), ['W-unknown-attribute']);
});

test('expand leaves scaffolds out of the planks', () => {
  assert.equal(expand(parse(corbel())).length, 20);
});
