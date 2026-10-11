'use strict';

const test = require('node:test');
const assert = require('node:assert');
const GH = require('../player/github.js');

test('reads GitHub addresses', () => {
  const cases = {
    'plankmd/plankmd': { kind: 'repo', owner: 'plankmd', repo: 'plankmd', ref: null, path: '' },
    'https://github.com/plankmd/plankmd': { kind: 'repo', owner: 'plankmd', repo: 'plankmd', ref: null, path: '' },
    'https://github.com/plankmd/plankmd.git': { kind: 'repo', owner: 'plankmd', repo: 'plankmd', ref: null, path: '' },
    'https://github.com/plankmd/plankmd/tree/main/gallery': { kind: 'dir', owner: 'plankmd', repo: 'plankmd', ref: 'main', path: 'gallery' },
    'https://github.com/plankmd/plankmd/blob/main/samples/corbel-bridge.plank.md':
      { kind: 'file', owner: 'plankmd', repo: 'plankmd', ref: 'main', path: 'samples/corbel-bridge.plank.md' },
    'https://raw.githubusercontent.com/plankmd/plankmd/main/samples/level-0.plank.md':
      { kind: 'file', owner: 'plankmd', repo: 'plankmd', ref: 'main', path: 'samples/level-0.plank.md' },
    'https://gist.github.com/someone/0123456789abcdef0123': { kind: 'gist', id: '0123456789abcdef0123' },
  };
  for (const [address, spec] of Object.entries(cases)) assert.deepStrictEqual(GH.parse(address), spec, address);
  for (const bad of ['', 'not a url', 'https://example.com/a/b', 'javascript:alert(1)', 'https://github.com/only-owner']) {
    assert.strictEqual(GH.parse(bad), null, bad);
  }
});

const response = (status, body, headers = {}) => ({
  status, ok: status >= 200 && status < 300,
  headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  json: async () => body, text: async () => body,
});

test('lists the models of a repository folder, in order', async () => {
  const asked = [];
  const fetch = async (url) => {
    asked.push(url);
    return response(200, { tree: [
      { type: 'blob', path: 'gallery/b.plank.md' },
      { type: 'blob', path: 'gallery/a.plank.md' },
      { type: 'blob', path: 'gallery/notes.md' },
      { type: 'blob', path: 'samples/c.plank.md' },
      { type: 'tree', path: 'gallery/sub.plank.md' },
    ] });
  };
  const files = await GH.list(GH.parse('https://github.com/o/r/tree/main/gallery'), { fetch });
  assert.deepStrictEqual(asked, ['https://api.github.com/repos/o/r/git/trees/main?recursive=1']);
  assert.deepStrictEqual(files.map((f) => [f.path, f.name, f.url]), [
    ['gallery/a.plank.md', 'a', 'https://raw.githubusercontent.com/o/r/main/gallery/a.plank.md'],
    ['gallery/b.plank.md', 'b', 'https://raw.githubusercontent.com/o/r/main/gallery/b.plank.md'],
  ]);
});

test('a file address needs no API request', async () => {
  const fetch = async () => { throw new Error('no request expected'); };
  const files = await GH.list(GH.parse('https://github.com/plankmd/plankmd/blob/main/x.plank.md'), { fetch });
  assert.deepStrictEqual(files.map((f) => f.url), ['https://raw.githubusercontent.com/plankmd/plankmd/main/x.plank.md']);
});

test('explains failures', async () => {
  const spec = GH.parse('o/r');
  await assert.rejects(GH.list(spec, { fetch: async () => response(404, {}) }), { reason: 'not-found' });
  await assert.rejects(GH.list(spec, { fetch: async () => response(200, { tree: [] }) }), { reason: 'none' });
  await assert.rejects(
    GH.list(spec, { fetch: async () => response(403, {}, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1700000000' }) }),
    (err) => err.reason === 'rate-limit' && err.reset.getTime() === 1700000000000,
  );
});
