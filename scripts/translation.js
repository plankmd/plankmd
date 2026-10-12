'use strict';

// The translation of a model file in a language, for the booklet and the
// video: <name>.<lang>.plank.md next to <name>.plank.md (see
// docs/proposals/translations.md). Returns { file, text }, or null when there
// is none or when the model is already in that language.

const fs = require('fs');
const PlankMD = require('../src/plankmd.js');
const { translationUrl } = require('../player/source.js');

function translationFile(file, text, lang) {
  if (!lang || PlankMD.parse(text).meta.lang === lang) return null;
  const candidate = translationUrl(file, lang);
  if (candidate === file || !fs.existsSync(candidate)) return null;
  const translation = fs.readFileSync(candidate, 'utf8');
  return PlankMD.parse(translation).meta['translation-of'] !== undefined ? { file: candidate, text: translation } : null;
}

module.exports = { translationFile };
