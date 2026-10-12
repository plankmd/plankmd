'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validate } = require('../src/plankmd.js');
const I18N = require('../player/i18n.js');

const block = (lines, frontmatter = '') => `${frontmatter}\`\`\`plank\n${lines.join('\n')}\n\`\`\`\n`;

test('the language comes from ?lang=, then the stored choice, then the browser', () => {
  assert.equal(I18N.pick({ search: '?lang=fr', stored: 'en', languages: ['en-US'] }), 'fr');
  assert.equal(I18N.pick({ search: '?lang=xx', stored: 'fr', languages: ['en-US'] }), 'fr');
  assert.equal(I18N.pick({ stored: 'en', languages: ['fr-FR'] }), 'en');
  assert.equal(I18N.pick({ languages: ['de-DE', 'fr-CA', 'en'] }), 'fr');
  assert.equal(I18N.pick({ languages: ['de-DE', 'en-GB', 'fr'] }), 'en');
  assert.equal(I18N.pick({ languages: ['de-DE'] }), 'en');
  assert.equal(I18N.pick(), 'en');
});

test('every English string has a French one', () => {
  assert.deepEqual(Object.keys(I18N.STRINGS.fr).sort(), Object.keys(I18N.STRINGS.en).sort());
});

test('every diagnostic code has a French explanation', () => {
  const src = ['src/plankmd.js', 'src/physics.js'].map((f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8')).join('\n');
  const codes = new Set(src.match(/'[EWI]-[a-z-]+'/g).map((c) => c.slice(1, -1)));
  for (const code of codes) assert.ok(I18N.FR_DIAGNOSTICS[code], code);
});

test('the French explanations recognise the validator messages', () => {
  const docs = [
    block(['flat-x 0 0 0', 'flat-x 0 0 0', 'flat-x 0 0 5', 'flat-x 0 0 -1 id=a', 'flat-y 0 0 1 id=a', 'bogus 1 2 3',
      'flat-x 1 2', 'flat-x 0 0 0 foo=1', 'flat-x 0 0 0 rot=x', 'flat-x 0 0 0 repeat=2', 'flat-x 0 0 0 x']),
    block(['flat-x 0 0 0', 'flat-x 0 6 0', 'guide flat-x 0 2 0', 'guide flat-x 0 40 0'],
      '---\nplankmd: "0.1"\ninventory: 1\ndifficulty: x\nunit_mm: -1\nplank: [1]\n---\n'),
    block(['flat-x 0 0 0'], '---\nfoo\n  bar: 1\n---\n'),
  ];
  const seen = new Set();
  for (const doc of docs) {
    for (const d of validate(doc).diagnostics) {
      const { text, exact } = I18N.explain(d, 'fr');
      assert.ok(exact, `${d.code}: ${d.message}`);
      if (d.plank) assert.match(text, new RegExp(`planchette ${d.plank}\\b`));
      seen.add(d.code);
    }
  }
  const tr = (fm, body) => `---\nplankmd: "0.2"\ntitle: T\ntranslation-of: a.plank.md\n${fm}---\n\n${body}`;
  const original = '---\ntitle: A\nlang: fr\n---\n\n## One\n\n```plank\nflat-x 0 0 0\n```\n\n## Two\n\n```plank\nflat-x 0 0 1\n```\n';
  const translations = [
    [tr('inventory: 3\n', '## Un\n\n```plank\nflat-x 0 0 0\n```\n'), {}],
    [tr('lang: fr\n', '## Un\n\n```plank\n```\n'), { original }],
    [tr('lang: fr\n', ''), { original: null }],
    [tr('lang: fr\n', ''), { original: tr('', '') }],
    ['---\ntitle: T\ntranslation-of:\n---\n', {}],
    [tr('lang: en\nsource-hash: 0\n', '## Un\n\n```plank\n```\n\n## Deux\n\n```plank\n```\n'), { original }],
  ];
  for (const [doc, options] of translations) {
    for (const d of validate(doc, options).diagnostics) {
      const { exact } = I18N.explain(d, 'fr');
      assert.ok(exact, `${d.code}: ${d.message}`);
      seen.add(d.code);
    }
  }
  for (const code of ['E-translation-source', 'E-translation-planks', 'W-translation-steps', 'W-translation-lang', 'W-translation-ignored-key', 'W-translation-stale']) assert.ok(seen.has(code), code);
  assert.ok(seen.size >= 12, [...seen].join(' '));
  const e = I18N.explain({ code: 'E-overlap', message: 'plank 7 ("flat-x 0 0 0") goes through plank 2 (line 4)', plank: 7, other: 2 }, 'fr');
  assert.equal(e.text, 'La planchette 7 (« flat-x 0 0 0 ») traverse la planchette 2 (ligne 4)');
  // English is the validator's own message.
  assert.equal(I18N.explain({ code: 'E-overlap', message: 'm' }, 'en').text, 'm');
});

test('the balance diagnostics are explained from their fields', () => {
  const unstable = I18N.explain({ code: 'I-unstable', plank: 3, until: 5, failing: [1, 2],
    message: 'From plank 3 to plank 5, the construction falls (planks 1, 2 cannot stay in balance). It stands again afterwards: hold it, or change the placement order.' }, 'fr');
  assert.equal(unstable.text, 'De la planchette 3 à la planchette 5, la construction tombe (les planchettes 1 et 2 ne peuvent pas rester en équilibre).' +
    " Elle tient de nouveau ensuite : tenez-la, ou changez l'ordre de pose.");
  const fragile = I18N.explain({ code: 'I-fragile', step: 2, tilt: 1.25,
    message: 'At the end of step 2, the construction stands, but tilting it by 1.3° (towards -x+y) is enough to make it fall.' }, 'fr');
  assert.equal(fragile.text, "À la fin de l'étape 2, la construction tient, mais l'incliner de 1,3° (vers -x+y) suffit à la faire tomber.");
});

test('a message the French table does not know falls back to the general explanation', () => {
  const r = I18N.explain({ code: 'E-overlap', message: 'something new', plank: 4, other: 1 }, 'fr');
  assert.equal(r.exact, false);
  assert.equal(r.text, 'La planchette 4 traverse la planchette 1');
  assert.equal(I18N.explain({ code: 'X-new', message: 'kept' }, 'fr').text, 'kept');
});

test('the player strings use no long dashes', () => {
  for (const f of ['player/i18n.js', 'player/index.html', 'player/gallery.html']) {
    const text = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.doesNotMatch(text, /[–—]/, f);
  }
});
