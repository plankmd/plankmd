'use strict';

// Public text (website, player, docs, models) uses no em dashes, no en
// dashes and no middle dots: commas, colons and parentheses read better.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const FORBIDDEN = /[—–·]/;
const NAMES = { '—': 'em dash', '–': 'en dash', '·': 'middle dot' };

function files(dir, keep) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.vitepress', 'public'].includes(entry.name) || rel === path.join('site', '.vitepress')) out.push(...files(rel, keep));
    } else if (keep(rel)) out.push(rel);
  }
  return out;
}

test('public text has no em dash, en dash or middle dot', () => {
  const list = [
    'README.md', 'SPEC.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'llms.txt',
    ...files('docs', (f) => f.endsWith('.md')),
    ...files('samples', (f) => f.endsWith('.md')),
    ...files('gallery', (f) => f.endsWith('.md')),
    ...files('player', (f) => /\.(html|js)$/.test(f)),
    ...files('site', (f) => /\.(md|vue|mts|css)$/.test(f) && !f.includes('cache')),
  ];
  const found = [];
  for (const f of list) {
    fs.readFileSync(path.join(root, f), 'utf8').split('\n').forEach((line, i) => {
      const m = line.match(FORBIDDEN);
      if (m) found.push(`${f}:${i + 1}: ${NAMES[m[0]]}`);
    });
  }
  assert.deepStrictEqual(found, []);
});
