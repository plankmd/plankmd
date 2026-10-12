'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Source = require('../player/source.js');
const { translationFile } = require('../scripts/translation.js');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const castle = read('gallery/castle.plank.md');
const castleFr = read('gallery/castle.fr.plank.md');
const at = (url) => new URL(url);

test('links carry a model and its translation, in UTF-8', () => {
  const text = 'Étape 1 : 中文 😀';
  assert.equal(Source.decode(Source.encode(text)), text);
  assert.doesNotMatch(Source.encode(castleFr), /[+/=&]/);
  assert.equal(Source.translationUrl('gallery/castle.plank.md', 'fr'), 'gallery/castle.fr.plank.md');
  assert.equal(Source.translationUrl('https://x.org/a/castle.plank.md?raw=1', 'de'), 'https://x.org/a/castle.de.plank.md?raw=1');
});

test('a booklet or a video finds the translation in its language', async () => {
  const samples = { 'gallery/castle': castle };
  const translations = { 'gallery/castle': { fr: castleFr } };
  const bundled = (hash, lang) => Source.load({ location: at(`http://p/booklet.html${hash}`), lang, samples, translations });
  assert.deepEqual(await bundled('#gallery/castle', 'fr'), { text: castle, translation: castleFr });
  assert.deepEqual(await bundled('#gallery/castle', 'en'), { text: castle, translation: null });
  assert.equal((await bundled('#nothing', 'fr')).translation, castleFr, 'falls back to the castle');

  const code = `#code=${Source.encode(castle)}&tr=${Source.encode(castleFr)}`;
  assert.deepEqual(await bundled(code, 'fr'), { text: castle, translation: castleFr });
  assert.deepEqual(await bundled(`#code=${Source.encode(castle)}`, 'fr'), { text: castle, translation: null });

  const files = { 'https://x.org/castle.plank.md': castle, 'https://x.org/castle.fr.plank.md': castleFr };
  const fetch = async (url) => (url in files ? { ok: true, text: async () => files[url] } : { ok: false, text: async () => '' });
  const web = (lang) => Source.load({ location: at('http://p/booklet.html?src=https://x.org/castle.plank.md'), lang, fetch });
  assert.deepEqual(await web('fr'), { text: castle, translation: castleFr });
  assert.deepEqual(await web('de'), { text: castle, translation: null });
});

test('the booklet and video scripts take the translation next to the model', () => {
  assert.deepEqual(translationFile('gallery/castle.plank.md', castle, 'fr'), { file: 'gallery/castle.fr.plank.md', text: castleFr });
  assert.equal(translationFile('gallery/castle.plank.md', castle, 'en'), null);
  assert.equal(translationFile('samples/twisted-tower.plank.md', read('samples/twisted-tower.plank.md'), 'fr'), null);
});
