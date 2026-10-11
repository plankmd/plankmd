'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { check } = require('../scripts/check-commit-message.js');

test('accepts the commit messages of the convention', () => {
  for (const subject of [
    'feat(player): add a French translation',
    'fix(spec)!: count guides in chains',
    'model(gallery): add Notre-Dame de Paris',
    'docs: explain guides in the README',
    'ci(site): deploy plankmd.org with Cloudflare Workers Builds',
    'Merge pull request #3 from someone/branch',
  ]) assert.deepStrictEqual(check(subject), [], subject);
});

test('rejects commit messages outside the convention', () => {
  for (const subject of [
    'Deploy plankmd.org',
    'feature(player): add a button',
    'feat(unknown-scope): add a button',
    'docs: Fix a typo',
    'docs: fix a typo.',
    `feat: ${'x'.repeat(80)}`,
  ]) assert.notDeepStrictEqual(check(subject), [], subject);
});
