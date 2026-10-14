/*!
 * PlankMD player: models from GitHub. Finds the .plank.md files of a GitHub
 * repository, folder, file or gist, in the browser, with no server: the
 * GitHub API lists the files (one request, no account needed) and
 * raw.githubusercontent.com serves them. Both allow cross-origin requests.
 * MIT License. Works in Node (require) and in the browser (window.PlankMDGitHub).
 *
 * Addresses it understands:
 *   owner/repo
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/tree/<branch>/<folder>
 *   https://github.com/owner/repo/blob/<branch>/<file>.plank.md
 *   https://raw.githubusercontent.com/owner/repo/<branch>/<file>.plank.md
 *   https://gist.github.com/<user>/<id>
 * A branch name with a slash in it is not supported in tree/ and blob/ links.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PlankMDGitHub = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const API = 'https://api.github.com';
  const RAW = 'https://raw.githubusercontent.com';
  const MAX_FILES = 200;
  const NAME = /^[A-Za-z0-9_.-]+$/;
  const isModel = (path) => /\.plank\.md$/i.test(path);

  /**
   * Reads a GitHub address. Returns { kind: 'repo' | 'dir' | 'file' | 'gist',
   * owner, repo, ref, path, id } or null when it is not one.
   * `ref` is null when the address does not name a branch: the default
   * branch is used.
   */
  function parse(input) {
    let text = String(input || '').trim();
    if (!text) return null;
    if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(text)) text = `https://github.com/${text}`;
    let url;
    try { url = new URL(text); } catch { return null; }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const host = url.hostname.toLowerCase();

    if (host === 'gist.github.com' || host === 'gist.githubusercontent.com') {
      const id = parts.find((p) => /^[0-9a-f]{20,}$/i.test(p));
      return id ? { kind: 'gist', id } : null;
    }
    if (host === 'raw.githubusercontent.com') {
      const [owner, repo, ref, ...rest] = parts;
      if (!owner || !repo || !ref || !rest.length || !NAME.test(owner) || !NAME.test(repo)) return null;
      return { kind: 'file', owner, repo, ref, path: rest.join('/') };
    }
    if (host !== 'github.com' && host !== 'www.github.com') return null;
    const [owner, rawRepo, type, ref, ...rest] = parts;
    const repo = (rawRepo || '').replace(/\.git$/, '');
    if (!owner || !repo || !NAME.test(owner) || !NAME.test(repo)) return null;
    if (!type) return { kind: 'repo', owner, repo, ref: null, path: '' };
    if ((type === 'tree' || type === 'blob') && ref) {
      const path = rest.join('/');
      if (type === 'blob' || isModel(path)) return { kind: 'file', owner, repo, ref, path };
      return { kind: 'dir', owner, repo, ref, path };
    }
    return { kind: 'repo', owner, repo, ref: null, path: '' };
  }

  /** A short label for the source: "owner/repo", "owner/repo/folder", or "gist <id>". */
  function label(spec) {
    if (spec.kind === 'gist') return `gist ${spec.id.slice(0, 8)}`;
    return [`${spec.owner}/${spec.repo}`, spec.path].filter(Boolean).join('/');
  }

  /** The page of the source on GitHub. */
  function htmlUrl(spec) {
    if (spec.kind === 'gist') return `https://gist.github.com/${spec.id}`;
    const base = `https://github.com/${spec.owner}/${spec.repo}`;
    if (!spec.path) return base;
    return `${base}/${spec.kind === 'file' ? 'blob' : 'tree'}/${spec.ref || 'HEAD'}/${spec.path}`;
  }

  const rawUrl = (spec, path) => `${RAW}/${spec.owner}/${spec.repo}/${spec.ref || 'HEAD'}/${path.split('/').map(encodeURIComponent).join('/')}`;

  /** An Error with a `reason` the player can explain: 'not-found', 'rate-limit' (with `reset`, a Date), 'none' or 'network'. */
  function fail(reason, message, extra) {
    const err = new Error(message);
    err.reason = reason;
    return Object.assign(err, extra || {});
  }

  async function getJson(url, fetchFn) {
    let r;
    try { r = await fetchFn(url, { headers: { Accept: 'application/vnd.github+json' } }); }
    catch (e) { throw fail('network', e.message || 'network error'); }
    if (r.status === 404) throw fail('not-found', 'not found, or private');
    if ((r.status === 403 || r.status === 429) && r.headers.get('x-ratelimit-remaining') === '0') {
      const reset = Number(r.headers.get('x-ratelimit-reset'));
      throw fail('rate-limit', 'GitHub API rate limit reached', { reset: reset ? new Date(reset * 1000) : null });
    }
    if (!r.ok) throw fail('network', `HTTP ${r.status}`);
    return r.json();
  }

  /**
   * The models of a source: [{ path, name, url }], sorted by path. `name` is
   * the file name without .plank.md; `url` is where to fetch the text.
   * A file address lists that file only, without asking the API.
   */
  async function list(spec, { fetch: fetchFn = (...a) => fetch(...a) } = {}) {
    const entry = (path, url) => ({ path, name: path.split('/').pop().replace(/\.plank\.md$/i, '').replace(/\.md$/i, ''), url });
    if (spec.kind === 'file') return [entry(spec.path, rawUrl(spec, spec.path))];
    if (spec.kind === 'gist') {
      const gist = await getJson(`${API}/gists/${spec.id}`, fetchFn);
      const files = Object.values(gist.files || {}).filter((f) => isModel(f.filename));
      if (!files.length) throw fail('none', 'no .plank.md file');
      return files.map((f) => entry(f.filename, f.raw_url)).sort((a, b) => a.path.localeCompare(b.path));
    }
    const tree = await getJson(`${API}/repos/${spec.owner}/${spec.repo}/git/trees/${encodeURIComponent(spec.ref || 'HEAD')}?recursive=1`, fetchFn);
    const prefix = spec.path ? `${spec.path.replace(/\/$/, '')}/` : '';
    const files = (tree.tree || [])
      .filter((t) => t.type === 'blob' && isModel(t.path) && t.path.startsWith(prefix))
      .map((t) => entry(t.path, rawUrl(spec, t.path)))
      .sort((a, b) => a.path.localeCompare(b.path))
      .slice(0, MAX_FILES);
    if (!files.length) throw fail('none', 'no .plank.md file');
    return files;
  }

  /** The text of one model. */
  async function text(file, { fetch: fetchFn = (...a) => fetch(...a) } = {}) {
    let r;
    try { r = await fetchFn(file.url); } catch (e) { throw fail('network', e.message || 'network error'); }
    if (r.status === 404) throw fail('not-found', 'not found, or private');
    if (!r.ok) throw fail('network', `HTTP ${r.status}`);
    return r.text();
  }

  // Listings are kept for ten minutes in the tab, so that going back and forth
  // between the gallery and the player does not use up the API rate limit
  // (60 requests an hour without an account).
  async function cachedList(spec, options) {
    const key = `plankmd-github:${JSON.stringify(spec)}`;
    try {
      const hit = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.files;
    } catch { /* storage unavailable */ }
    const files = await list(spec, options);
    try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), files })); } catch { /* storage unavailable */ }
    return files;
  }

  /** The address parameter of a page: ?github=<address>, or its short form ?repo=. */
  /**
   * Splits a listing into models and their translations: a file named
   * <name>.<lang>.plank.md next to <name>.plank.md is a translation of it
   * (docs/proposals/translations.md). Returns { models, translations }, where
   * `translations` maps a model's path to { <lang>: file }.
   */
  function translations(files) {
    const paths = new Set(files.map((f) => f.path));
    const models = [];
    const found = new Map();
    for (const f of files) {
      const m = f.path.match(/^(.+)\.([a-z]{2,3}(?:-[a-z0-9]+)*)\.plank\.md$/i);
      const of = m && `${m[1]}.plank.md`;
      if (!m || !paths.has(of)) { models.push(f); continue; }
      if (!found.has(of)) found.set(of, {});
      found.get(of)[m[2].toLowerCase()] = f;
    }
    return { models, translations: found };
  }

  /**
   * The address of a file named by a model, relative to it, such as its
   * `image` (docs/proposals/metadata.md): `file` is the model's entry in a
   * listing. A gist is flat: the file of that name in the same gist, in its
   * latest version. An absolute https: address is kept; anything else that
   * leaves the folder (an absolute path, "..") gives null.
   */
  function asset(file, path) {
    const text = String(path || '');
    if (/^https:\/\//i.test(text)) return text;
    if (!text || /^[a-z][a-z0-9+.-]*:/i.test(text) || /^[/\\]/.test(text) || /(^|[/\\])\.\.([/\\]|$)/.test(text)) return null;
    let url;
    try { url = new URL(file.url); } catch { return null; }
    if (url.hostname === 'gist.githubusercontent.com') {
      const [user, id] = url.pathname.split('/').filter(Boolean);
      return `https://gist.githubusercontent.com/${user}/${id}/raw/${text.split('/').map(encodeURIComponent).join('/')}`;
    }
    return new URL(text.split('/').map(encodeURIComponent).join('/'), url).href;
  }

  function fromSearch(search) {
    const params = new URLSearchParams(search);
    return params.get('github') || params.get('repo');
  }

  return { parse, label, htmlUrl, list, cachedList, text, translations, asset, fromSearch, isModel, MAX_FILES };
});
