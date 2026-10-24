/*!
 * PlankMD reference implementation: parse, expand and validate .plank.md files.
 * MIT License. Works in Node (require) and in the browser (window.PlankMD),
 * with no dependencies.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PlankMD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SPEC_VERSION = '0.2';
  const DEFAULT_PLANK = [15, 3, 1];
  const DEFAULT_COLOR = '#e3bf86';
  const EPS = 1e-6;
  const KNOWN_KEYS = ['color', 'id', 'repeat', 'offset', 'rot', 'rot-step', 'pivot', 'lean', 'until'];
  const BLOCK_KEYS = ['view', 'zoom', 'focus'];
  const NUM = /^-?\d+(\.\d+)?$/;
  const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  // A leaning plank touches its supports along an edge or at a corner, at an
  // angle the author rounds: contacts and overlaps that involve one are
  // judged within this tolerance (in u, about 1.6 mm).
  const LEAN_TOLERANCE = 0.2;
  const LEAN = /^([+-])([xy]):(\d+(?:\.\d+)?)$/;
  // Where the camera is, as an azimuth (degrees, counter-clockwise seen from
  // above, 0 on the viewer's side) and an elevation above the horizon.
  const DEFAULT_VIEW = { azimuth: 35, elevation: 28 };
  const DIRECTIONS = { front: 0, 'front-right': 45, right: 90, 'back-right': 135, back: 180, 'back-left': 225, left: 270, 'front-left': 315 };

  // Bounding-box size (x, y, z) of a plank [L, W, T] in each orientation.
  const ORIENTATIONS = {
    'flat-x': ([L, W, T]) => [L, W, T],
    'flat-y': ([L, W, T]) => [W, L, T],
    'edge-x': ([L, W, T]) => [L, T, W],
    'edge-y': ([L, W, T]) => [T, L, W],
    'up-x': ([L, W, T]) => [W, T, L],
    'up-y': ([L, W, T]) => [T, W, L],
  };

  // ---------------------------------------------------------------- parsing

  function diag(list, code, message, extra) {
    list.push(Object.assign({ code, severity: code[0] === 'E' ? 'error' : 'warning', message }, extra || {}));
  }

  function unquote(v) {
    const m = v.match(/^"(.*)"$/) || v.match(/^'(.*)'$/);
    return m ? m[1] : v;
  }

  function stripYamlComment(line) {
    // A "#" starts a comment only at the start or after whitespace, and not inside quotes.
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
    }
    return line;
  }

  // Frontmatter is a flat mapping plus one nested mapping (`palette`).
  // This reads that subset of YAML, which is all the format uses.
  function parseFrontmatter(lines, firstLine, diagnostics) {
    const meta = {};
    let nested = null;
    lines.forEach((raw, i) => {
      const lineNo = firstLine + i;
      const line = stripYamlComment(raw).replace(/\s+$/, '');
      if (!line.trim()) return;
      if (/^\s/.test(line)) {
        const m = line.match(/^\s+([\w-]+):\s*(.*)$/);
        if (nested && m) meta[nested][m[1]] = unquote(m[2].trim());
        else diag(diagnostics, 'E-frontmatter', `Unexpected indented line: "${raw.trim()}"`, { line: lineNo });
        return;
      }
      nested = null;
      const m = line.match(/^([\w-]+):\s*(.*)$/);
      if (!m) { diag(diagnostics, 'E-frontmatter', `Not a "key: value" line: "${raw.trim()}"`, { line: lineNo }); return; }
      const [, key, rawValue] = m;
      const value = rawValue.trim();
      if (value === '') { meta[key] = {}; nested = key; return; }
      if (/^\[.*\]$/.test(value)) { meta[key] = value.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter((s, i, all) => s || all.length > 1); return; }
      meta[key] = unquote(value);
    });
    return meta;
  }

  const HTTPS = (v) => { try { return new URL(v).protocol === 'https:' && /^https:\/\/\S+$/.test(v); } catch { return false; } };
  const TAG = /^[\p{Ll}\p{Lo}\p{N}]+(-[\p{Ll}\p{Lo}\p{N}]+)*$/u;

  // The keys for shared models (docs/proposals/metadata.md). All optional.
  function checkSharing(meta, out, diagnostics) {
    const bad = (key, what) => { diag(diagnostics, 'E-frontmatter', `"${key}" must be ${what}`); delete out[key]; };
    if (meta.url !== undefined && !HTTPS(String(meta.url))) bad('url', 'an absolute https: URL');
    const based = meta['based-on'];
    if (based !== undefined && (typeof based !== 'string' || (/^[a-z][a-z0-9+.-]*:/i.test(based) && !HTTPS(based)))) bad('based-on', 'an absolute https: URL, or text');
    if (meta.date !== undefined) {
      const m = String(meta.date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      if (!d || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) bad('date', 'a date written YYYY-MM-DD');
    }
    const image = meta.image;
    if (image !== undefined) {
      const text = typeof image === 'string' ? image : '';
      const url = /^[a-z][a-z0-9+.-]*:/i.test(text);
      if (!text || (url && !HTTPS(text)) || (!url && (/^[/\\]/.test(text) || /(^|[/\\])\.\.([/\\]|$)/.test(text) || /\s/.test(text)))) {
        bad('image', 'an https: URL, or a path next to the file (no "..")');
      }
    }
    if (meta.tags !== undefined && !(Array.isArray(meta.tags) && meta.tags.every((t) => TAG.test(t)))) bad('tags', 'a list of lower-case words, e.g. [castle, bridge]');
    if (meta.minutes !== undefined) {
      if (/^\d+$/.test(String(meta.minutes)) && Number(meta.minutes) > 0) out.minutes = Number(meta.minutes);
      else bad('minutes', 'a positive integer');
    }
  }

  // "front-left,20", "back", "top", "120,35": { azimuth, elevation }, or null.
  function parseView(value) {
    const parts = String(value).split(',').map((t) => t.trim());
    if (parts.length > 2 || !parts[0]) return null;
    if (parts[0] === 'top') return parts.length === 1 ? { azimuth: 0, elevation: 90 } : null;
    let azimuth;
    if (Object.prototype.hasOwnProperty.call(DIRECTIONS, parts[0])) azimuth = DIRECTIONS[parts[0]];
    else if (NUM.test(parts[0])) azimuth = ((Number(parts[0]) % 360) + 360) % 360;
    else return null;
    const elevation = parts.length === 2 ? (NUM.test(parts[1]) ? Number(parts[1]) : NaN) : DEFAULT_VIEW.elevation;
    if (!(elevation >= 0 && elevation <= 90)) return null;
    return { azimuth, elevation };
  }

  // The attributes after the word "plank" on a block's opening fence:
  // where the camera looks at the step from (docs/proposals/view.md).
  function parseBlockInfo(info, where, diagnostics) {
    const view = {};
    for (const token of info.trim().split(/\s+/).slice(1)) {
      const eq = token.indexOf('=');
      if (eq <= 0) { diag(diagnostics, 'W-view', `Expected key=value after "plank", got "${token}"`, where); continue; }
      const key = token.slice(0, eq), value = token.slice(eq + 1);
      if (!BLOCK_KEYS.includes(key)) { diag(diagnostics, 'W-unknown-attribute', `Unknown attribute "${key}" ignored`, where); continue; }
      if (key === 'view') {
        const v = parseView(value);
        if (v) Object.assign(view, v);
        else diag(diagnostics, 'W-view', `Invalid view "${value}": expected a direction (front, back-left, top…) or an azimuth, then an optional elevation, e.g. back-left,20`, where);
      } else if (key === 'zoom') {
        if (NUM.test(value) && Number(value) > 0) view.zoom = Number(value);
        else diag(diagnostics, 'W-view', `Invalid zoom "${value}": expected a positive number`, where);
      } else if (value === 'step' || SLUG.test(value)) view.focus = value;
      else diag(diagnostics, 'W-view', `Invalid focus "${value}": expected "step" or the id of a plank`, where);
    }
    return Object.keys(view).length ? view : null;
  }

  function normaliseMeta(meta, hasFrontmatter, diagnostics) {
    const out = Object.assign({}, meta);
    let plank = DEFAULT_PLANK;
    if (meta.plank !== undefined) {
      const p = Array.isArray(meta.plank) ? meta.plank.map(Number) : [];
      if (p.length === 3 && p.every((n) => Number.isFinite(n) && n > 0)) plank = p;
      else diag(diagnostics, 'E-frontmatter', '"plank" must be three positive numbers, e.g. [15, 3, 1]');
    }
    out.plank = plank;
    for (const key of ['inventory', 'difficulty']) {
      if (meta[key] === undefined) continue;
      if (/^\d+$/.test(String(meta[key]))) out[key] = Number(meta[key]);
      else diag(diagnostics, 'E-frontmatter', `"${key}" must be an integer`);
    }
    if (meta.unit_mm !== undefined) {
      if (NUM.test(String(meta.unit_mm)) && Number(meta.unit_mm) > 0) out.unit_mm = Number(meta.unit_mm);
      else diag(diagnostics, 'E-frontmatter', '"unit_mm" must be a positive number');
    }
    if (meta.palette !== undefined && (typeof meta.palette !== 'object' || Array.isArray(meta.palette))) {
      diag(diagnostics, 'E-frontmatter', '"palette" must be a mapping of names to colors');
      out.palette = {};
    }
    out.palette = out.palette || {};
    checkSharing(meta, out, diagnostics);
    if (meta.view !== undefined) {
      const v = parseView(meta.view);
      if (v) out.view = v;
      else { diag(diagnostics, 'W-view', `Invalid view "${meta.view}": expected a direction (front, back-left, top…) or an azimuth, then an optional elevation, e.g. front-left,20`); delete out.view; }
    }
    if (hasFrontmatter) {
      for (const key of ['plankmd', 'title']) {
        if (meta[key] === undefined) diag(diagnostics, 'W-frontmatter', `Frontmatter has no "${key}"`);
      }
    }
    return out;
  }

  // Splits the document into frontmatter, prose and plank blocks, honouring
  // Markdown fences so that a quoted ```plank inside a longer fence is skipped.
  function scan(text) {
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    let i = 0;
    let fm = null;
    if (lines[0] === '---') {
      const end = lines.indexOf('---', 1);
      if (end > 0) { fm = { lines: lines.slice(1, end), firstLine: 2 }; i = end + 1; }
    }
    const blocks = [];
    let prose = [];
    while (i < lines.length) {
      const open = lines[i].match(/^(`{3,}|~{3,})\s*(.*)$/);
      if (!open) { prose.push(lines[i]); i++; continue; }
      const fence = open[1];
      const isPlank = open[2].trim().split(/\s+/)[0] === 'plank';
      const body = [];
      const start = i + 1;
      i++;
      while (i < lines.length) {
        const close = lines[i].match(/^(`{3,}|~{3,})\s*$/);
        if (close && close[1][0] === fence[0] && close[1].length >= fence.length) break;
        body.push(lines[i]);
        i++;
      }
      i++; // closing fence
      if (isPlank) { blocks.push({ prose, body, firstLine: start + 1, info: open[2] }); prose = []; }
      else prose.push(lines[start - 1], ...body, lines[i - 1] || '');
    }
    return { fm, blocks };
  }

  function paragraphs(lines) {
    return lines.join('\n').split(/\n\s*\n/)
      .map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean).join('\n\n');
  }

  function stepText(prose) {
    let headingIndex = -1;
    prose.forEach((l, i) => { if (/^#{1,6}\s/.test(l)) headingIndex = i; });
    const title = headingIndex >= 0 ? prose[headingIndex].replace(/^#{1,6}\s+/, '').trim() : null;
    return { title, text: paragraphs(prose.slice(headingIndex + 1)) };
  }

  // The model's description: the text between the document's "# Title" and
  // the next heading, before the first block. None without both headings.
  function descriptionText(prose) {
    const headings = [];
    prose.forEach((l, i) => { if (/^#{1,6}\s/.test(l)) headings.push(i); });
    if (headings.length < 2 || !/^#\s/.test(prose[headings[0]])) return null;
    return paragraphs(prose.slice(headings[0] + 1, headings[1])) || null;
  }

  // SHA-256 of a string's UTF-8 bytes, as lowercase hex. Synchronous, for
  // validate(): the browser's crypto.subtle only answers with a promise.
  const ror = (x, n) => (x >>> n) | (x << (32 - n));
  const SHA_K = (() => {
    const k = [];
    for (let n = 2; k.length < 64; n++) {
      let prime = true;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
      if (prime) k.push((Math.cbrt(n) % 1) * 0x100000000 >>> 0);
    }
    return k;
  })();
  function sha256(text) {
    const bytes = new TextEncoder().encode(text);
    const n = bytes.length;
    const words = new Uint32Array(((n + 9 + 63) >> 6) << 4);
    for (let i = 0; i < n; i++) words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
    words[n >> 2] |= 0x80 << (24 - (n % 4) * 8);
    words[words.length - 2] = Math.floor(n / 0x20000000);
    words[words.length - 1] = (n * 8) >>> 0;
    let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Uint32Array(64);
    for (let i = 0; i < words.length; i += 16) {
      for (let t = 0; t < 16; t++) w[t] = words[i + t];
      for (let t = 16; t < 64; t++) {
        const s0 = ror(w[t - 15], 7) ^ ror(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = ror(w[t - 2], 17) ^ ror(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, k] = h;
      for (let t = 0; t < 64; t++) {
        const t1 = (k + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + SHA_K[t] + w[t]) | 0;
        const t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        k = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h = [a, b, c, d, e, f, g, k].map((x, j) => (x + h[j]) | 0);
    }
    return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }

  /**
   * The fingerprint of a model's text, for the "source-hash" of its
   * translations: the SHA-256 of its title, its description, then each
   * step's title and text, as parse() reads them, each followed by a line
   * feed. `doc` is a result of parse() or validate().
   */
  function sourceHash(doc) {
    const texts = [doc.meta.title || '', doc.description || ''];
    for (const step of doc.steps) texts.push(step.title, step.text);
    return sha256(texts.map((t) => `${t}\n`).join(''));
  }

  // A translation (docs/proposals/translations.md) holds only text: its
  // geometry and the keys that describe the building come from the original.
  const ORIGINAL_ONLY = ['plank', 'unit_mm', 'inventory', 'difficulty', 'palette', 'url', 'based-on', 'date', 'image', 'tags', 'minutes', 'view'];

  function checkTranslation(meta, steps, diagnostics) {
    const of = meta['translation-of'];
    if (typeof of !== 'string' || !of) diag(diagnostics, 'E-translation-source', 'The "translation-of" key names no file');
    if (!meta.lang) diag(diagnostics, 'W-translation-lang', 'A translation has no "lang"');
    for (const key of ORIGINAL_ONLY) {
      if (meta[key] !== undefined) diag(diagnostics, 'W-translation-ignored-key', `"${key}" is ignored in a translation: it comes from the original`);
    }
    for (const step of steps) {
      const n = step.lines.length;
      if (n) {
        diag(diagnostics, 'E-translation-planks', `step ${step.number} of a translation has ${n} plank line${n === 1 ? '' : 's'}: the geometry comes from the original`,
          { step: step.number, line: step.lines[0].line });
      }
    }
  }

  // The checks of a translation against its original: `original` is the
  // original's text, or null when the file named by "translation-of" is missing.
  function compareTranslation(doc, original, diagnostics) {
    const of = doc.meta['translation-of'];
    if (original === null) { diag(diagnostics, 'E-translation-source', `The original "${of}" does not exist`); return; }
    const source = parse(original);
    if (source.meta['translation-of'] !== undefined) { diag(diagnostics, 'E-translation-source', `The original "${of}" is itself a translation`); return; }
    if (doc.steps.length !== source.steps.length) {
      diag(diagnostics, 'W-translation-steps', `${doc.steps.length} step${doc.steps.length === 1 ? '' : 's'}, but the original "${of}" has ${source.steps.length}`);
    }
    if (doc.meta.lang && doc.meta.lang === source.meta.lang) {
      diag(diagnostics, 'W-translation-lang', `"lang" is "${doc.meta.lang}", the language of the original`);
    }
    const hash = doc.meta['source-hash'];
    if (hash !== undefined && hash !== sourceHash(source)) {
      diag(diagnostics, 'W-translation-stale', `The text of the original "${of}" has changed since this translation: check it, then set "source-hash" to ${sourceHash(source)}`);
    }
  }

  function parseNums(value, count) {
    const parts = String(value).split(',');
    if (parts.length !== count || !parts.every((p) => NUM.test(p.trim()))) return null;
    return parts.map(Number);
  }

  function parseLine(raw, lineNo, step, diagnostics) {
    const source = raw.replace(/#.*$/, '').trim();
    if (!source) return null;
    const where = { line: lineNo, step };
    const tokens = source.split(/\s+/);
    const guide = tokens[0] === 'guide';
    const scaffold = tokens[0] === 'scaffold';
    if (guide || scaffold) tokens.shift();
    if (!ORIENTATIONS[tokens[0]]) {
      diag(diagnostics, /^(flat|edge|up)-/.test(tokens[0]) || !NUM.test(tokens[0]) ? 'E-orientation' : 'E-parse',
        `Unknown orientation "${tokens[0]}" (expected flat-x, flat-y, edge-x, edge-y, up-x or up-y)`, where);
      return null;
    }
    const pos = tokens.slice(1, 4);
    if (pos.length < 3 || !pos.every((t) => NUM.test(t))) {
      diag(diagnostics, 'E-parse', `Expected "<orientation> <x> <y> <z>", got "${source}"`, where);
      return null;
    }
    const attrs = {};
    let ok = true;
    for (const token of tokens.slice(4)) {
      const eq = token.indexOf('=');
      if (eq <= 0) { diag(diagnostics, 'E-parse', `Expected key=value, got "${token}"`, where); ok = false; continue; }
      const key = token.slice(0, eq);
      const value = token.slice(eq + 1);
      if (!KNOWN_KEYS.includes(key) || (key === 'until' && !scaffold)) {
        diag(diagnostics, 'W-unknown-attribute', key === 'until' ? 'Unknown attribute "until" ignored: it only applies to scaffold lines' : `Unknown attribute "${key}" ignored`, where);
        continue;
      }
      if (key === 'lean') {
        const m = value.match(LEAN);
        const degrees = m ? Number(m[3]) : NaN;
        if (!(degrees > 0 && degrees < 90)) {
          diag(diagnostics, 'E-lean', `Invalid lean "${value}": expected <direction>:<degrees>, the direction one of +x, -x, +y, -y and the angle between 0 and 90, e.g. -x:20`, where);
          ok = false;
          continue;
        }
        const sign = m[1] === '+' ? 1 : -1;
        attrs.lean = { dir: `${m[1]}${m[2]}`, degrees, vector: m[2] === 'x' ? [sign, 0, 0] : [0, sign, 0] };
        continue;
      }
      let parsed = value;
      if (key === 'repeat') parsed = /^\d+$/.test(value) && Number(value) >= 1 ? Number(value) : null;
      else if (key === 'offset') parsed = parseNums(value, 3);
      else if (key === 'pivot') parsed = parseNums(value, 2);
      else if (key === 'rot' || key === 'rot-step') parsed = NUM.test(value) ? Number(value) : null;
      else if (key === 'id' || key === 'until') parsed = SLUG.test(value) ? value : null;
      else if (key === 'color') parsed = value || null;
      if (parsed === null) { diag(diagnostics, 'E-parse', `Invalid value for ${key}: "${value}"`, where); ok = false; continue; }
      attrs[key] = parsed;
    }
    if (attrs.repeat !== undefined && !attrs.offset) {
      diag(diagnostics, 'E-parse', '"repeat" needs an "offset"', where);
      ok = false;
    }
    if (!ok) return null;
    return { orientation: tokens[0], position: pos.map(Number), attrs, source, line: lineNo, step, guide, scaffold };
  }

  /**
   * Parses a .plank.md document.
   * Returns { meta, description, steps: [{ number, title, text, lines, line }], diagnostics }.
   */
  function parse(text) {
    const diagnostics = [];
    const { fm, blocks } = scan(String(text));
    const rawMeta = fm ? parseFrontmatter(fm.lines, fm.firstLine, diagnostics) : {};
    const meta = normaliseMeta(rawMeta, !!fm, diagnostics);
    // A translation's blocks are empty: what is on their fence is ignored.
    const isTranslation = rawMeta['translation-of'] !== undefined;
    const steps = blocks.map((block, i) => {
      const number = i + 1;
      const { title, text: body } = stepText(block.prose);
      const view = isTranslation ? null : parseBlockInfo(block.info || '', { line: block.firstLine - 1, step: number }, diagnostics);
      const lines = block.body
        .map((raw, j) => parseLine(raw, block.firstLine + j, number, diagnostics))
        .filter(Boolean);
      return { number, title: title || `Step ${number}`, text: body, lines, line: block.firstLine - 1, view };
    });
    if (rawMeta['translation-of'] !== undefined) checkTranslation(rawMeta, steps, diagnostics);
    const description = blocks.length ? descriptionText(blocks[0].prose) : null;
    return { meta, description, steps, diagnostics };
  }

  /**
   * A model shown in the language of one of its translations (see
   * docs/proposals/translations.md): the geometry and the frontmatter come
   * from `model`, the title, the description and the step texts from
   * `translation`, matched by step number. Both are results of parse() or
   * validate(). What the translation lacks stays in the model's language.
   */
  function translate(model, translation) {
    const tr = translation.meta;
    const meta = Object.assign({}, model.meta, { title: tr.title || model.meta.title, lang: tr.lang || model.meta.lang });
    const steps = model.steps.map((s, i) => {
      const t = translation.steps[i];
      return t ? Object.assign({}, s, { title: t.title, text: t.text || s.text }) : s;
    });
    return Object.assign({}, model, { meta, description: translation.description || model.description, steps });
  }

  // -------------------------------------------------------------- expansion

  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // Turns vector v around the unit axis k by angle a (Rodrigues).
  function turn(v, k, a) {
    const c = Math.cos(a), s = Math.sin(a), kv = cross(k, v), kd = dot(k, v) * (1 - c);
    return [0, 1, 2].map((i) => v[i] * c + kv[i] * s + k[i] * kd);
  }

  function footprint(cx, cy, hx, hy, theta) {
    const c = Math.cos(theta), s = Math.sin(theta);
    return [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]].map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
  }

  // Convex hull of points in the plane, counter-clockwise (monotone chain).
  function hull(points) {
    const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const side = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [], upper = [];
    for (const p of pts) {
      while (lower.length >= 2 && side(lower[lower.length - 2], lower[lower.length - 1], p) <= 1e-12) lower.pop();
      lower.push(p);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && side(upper[upper.length - 2], upper[upper.length - 1], p) <= 1e-12) upper.pop();
      upper.push(p);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }

  /**
   * Every plank of a line. A plank is a box: `size` along its own `axes`
   * (three unit vectors, in file coordinates), around `center`. `footprint`
   * is its outline on the ground, `z0` and `z1` its lowest and highest
   * points. A leaning plank (`lean`) is first tipped over towards its
   * direction, pivoting on the bottom edge on that side, then turned by
   * `rot` like any plank, around the vertical axis through the centre of its
   * box before the lean (or `pivot`).
   */
  function expandLine(line, meta) {
    const size = ORIENTATIONS[line.orientation](meta.plank);
    const half = size.map((v) => v / 2);
    const a = line.attrs;
    const count = a.repeat || 1;
    const offset = a.offset || [0, 0, 0];
    const out = [];
    for (let i = 0; i < count; i++) {
      const pos = line.position.map((v, j) => v + i * offset[j]);
      const degrees = (a.rot || 0) + i * (a['rot-step'] || 0);
      const theta = (degrees * Math.PI) / 180;
      let cx = pos[0] + half[0];
      let cy = pos[1] + half[1];
      if (a.pivot) {
        const [px, py] = a.pivot;
        const dx = cx - px, dy = cy - py;
        cx = px + dx * Math.cos(theta) - dy * Math.sin(theta);
        cy = py + dx * Math.sin(theta) + dy * Math.cos(theta);
      }
      // The centre's shift and the axes, in the frame of the box before `rot`.
      let rel = [0, 0, 0];
      let axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      if (a.lean) {
        const d = a.lean.vector;
        const k = cross([0, 0, 1], d);
        const phi = (a.lean.degrees * Math.PI) / 180;
        const hinge = [d[0] * half[0], d[1] * half[1], -half[2]];
        const back = turn(hinge.map((v) => -v), k, phi);
        rel = hinge.map((v, j) => v + back[j]);
        axes = axes.map((v) => turn(v, k, phi));
      }
      const c = Math.cos(theta), s = Math.sin(theta);
      const yaw = (v) => [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
      rel = yaw(rel);
      axes = axes.map(yaw);
      const center = [cx + rel[0], cy + rel[1], pos[2] + half[2] + rel[2]];
      const corners = [];
      for (const u of [-1, 1]) for (const v of [-1, 1]) for (const w of [-1, 1]) {
        corners.push([0, 1, 2].map((j) => center[j] + u * half[0] * axes[0][j] + v * half[1] * axes[1][j] + w * half[2] * axes[2][j]));
      }
      const plank = {
        orientation: line.orientation,
        position: pos,
        size,
        rotation: degrees,
        lean: a.lean ? { dir: a.lean.dir, degrees: a.lean.degrees } : null,
        axes,
        center,
        corners,
        z0: a.lean ? Math.min(...corners.map((q) => q[2])) : pos[2],
        z1: a.lean ? Math.max(...corners.map((q) => q[2])) : pos[2] + size[2],
        footprint: a.lean ? hull(corners.map((q) => [q[0], q[1]])) : footprint(cx, cy, half[0], half[1], theta),
        color: (!line.guide && a.color && (meta.palette[a.color] || a.color)) || DEFAULT_COLOR,
        id: a.id ? (count > 1 ? `${a.id}-${i + 1}` : a.id) : null,
        step: line.step,
        line: line.line,
        source: line.source,
        guide: line.guide,
      };
      if (line.scaffold) { plank.scaffold = true; plank.until = a.until || null; }
      out.push(plank);
    }
    return out;
  }

  const plankName = (p) => (p.scaffold ? `scaffold ${p.s}` : `plank ${p.n}`);
  const plankLabel = (p) => `${plankName(p)} ("${p.source}")`;

  /**
   * The building sequence of a document (docs/proposals/scaffold.md).
   * Returns { planks, scaffolds, moves }:
   * - `planks`, the planks of the construction in placement order, numbered
   *   from 1 (`n`);
   * - `scaffolds`, the scaffold planks, numbered from 1 (`s`) in the order
   *   they are placed; they have no plank number;
   * - `moves`, everything the builder does, in order: { index (from 1),
   *   kind: 'plank' | 'scaffold' | 'remove', step, plank | scaffold |
   *   scaffolds }. Every plank and scaffold plank knows its `move`, and every
   *   scaffold plank the move that removes it (`removed`).
   * Within a step, ordinary lines are interleaved by round; a scaffold line
   * is placed whole, all its repetitions in a row, in round 0. A scaffold is
   * removed after the plank its `until` names, or after the last plank of
   * its step. Guides are not in the sequence (see `guides`).
   */
  function build(doc, diagnostics = []) {
    const base = [];
    for (const step of doc.steps) {
      const groups = step.lines.filter((line) => !line.guide).map((line) => ({ line, items: expandLine(line, doc.meta) }));
      const rounds = Math.max(0, ...groups.map((g) => (g.line.scaffold ? Math.min(1, g.items.length) : g.items.length)));
      for (let round = 0; round < rounds; round++) {
        for (const g of groups) {
          if (g.line.scaffold) { if (round === 0) for (const it of g.items) base.push(it); }
          else if (g.items.length > round) base.push(g.items[round]);
        }
      }
    }
    const planks = base.filter((p) => !p.scaffold);
    const scaffolds = base.filter((p) => p.scaffold);
    planks.forEach((p, i) => { p.n = i + 1; });
    scaffolds.forEach((p, i) => { p.s = i + 1; });

    // When each scaffold plank goes: the index in `base` after which it is removed.
    const byId = new Map(planks.filter((p) => p.id).map((p) => [p.id, p]));
    const scaffoldIds = new Set(scaffolds.filter((p) => p.id).map((p) => p.id));
    const lastOfStep = new Map();
    base.forEach((p, i) => lastOfStep.set(p.step, i));
    const release = new Map();
    const warned = new Set();
    for (const p of scaffolds) {
      const at = base.indexOf(p);
      let idx = lastOfStep.get(p.step);
      if (p.until) {
        const target = byId.get(p.until);
        let problem = null;
        if (!target) problem = scaffoldIds.has(p.until) ? `"until" names the scaffold "${p.until}": a scaffold is released by a plank of the construction` : `"until" names no plank: there is no id "${p.until}"`;
        else if (base.indexOf(target) < at) problem = `"until" names plank ${target.n}, which is placed before it`;
        else idx = base.indexOf(target);
        if (problem && !warned.has(p.line)) {
          warned.add(p.line);
          diag(diagnostics, 'W-scaffold-release', `${plankLabel(p)}: ${problem}. It is removed at the end of step ${p.step}`, { scaffold: p.s, step: p.step, line: p.line });
        }
      }
      if (!release.has(idx)) release.set(idx, []);
      release.get(idx).push(p);
    }
    const moves = [];
    base.forEach((p, i) => {
      moves.push(p.scaffold ? { kind: 'scaffold', step: p.step, scaffold: p } : { kind: 'plank', step: p.step, plank: p });
      p.move = moves.length;
      if (release.has(i)) {
        const gone = release.get(i);
        moves.push({ kind: 'remove', step: p.step, scaffolds: gone, after: p.scaffold ? null : p.n });
        for (const r of gone) r.removed = moves.length;
      }
    });
    moves.forEach((m, i) => { m.index = i + 1; });
    return { planks, scaffolds, moves };
  }

  /**
   * Expands every line into planks, in placement order, numbered from 1.
   * Guides and scaffolds are not planks: they are left out (see `guides`
   * and `build`).
   */
  function expand(doc) {
    return build(doc).planks;
  }

  /**
   * Sets `after` on every guide: the move after which it is laid, that of the
   * last plank or scaffold of its step written above it, or the last move
   * before its step. A guide is shown from there to the end of its step.
   */
  function layGuides(rulers, moves) {
    for (const g of rulers) {
      g.after = 0;
      for (const m of moves) {
        const p = m.plank || m.scaffold;
        if (m.step < g.step || (m.step === g.step && p && p.line < g.line)) g.after = Math.max(g.after, m.index);
      }
    }
  }

  /** Expands the guide lines of every step. Guides have no plank number. */
  function guides(doc) {
    return doc.steps.flatMap((step) => step.lines.filter((line) => line.guide).flatMap((line) => expandLine(line, doc.meta)));
  }

  // ------------------------------------------------------------- validation

  // True when two convex polygons are separated by more than `margin`. With
  // the default margin, polygons that only touch (zero area) count as separated.
  function separated(A, B, margin = EPS) {
    for (const P of [A, B]) {
      for (let i = 0; i < P.length; i++) {
        const [x1, y1] = P[i];
        const [x2, y2] = P[(i + 1) % P.length];
        const len = Math.hypot(y1 - y2, x2 - x1);
        const nx = (y1 - y2) / len, ny = (x2 - x1) / len;
        let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
        for (const [x, y] of A) { const d = x * nx + y * ny; a0 = Math.min(a0, d); a1 = Math.max(a1, d); }
        for (const [x, y] of B) { const d = x * nx + y * ny; b0 = Math.min(b0, d); b1 = Math.max(b1, d); }
        if (a1 <= b0 + margin || b1 <= a0 + margin) return true;
      }
    }
    return false;
  }

  /**
   * The gap between two planks as boxes in space (separating axis test on
   * the fifteen axes of two boxes): positive when they are apart (at least
   * that far), negative when they share a volume (about that deep).
   */
  function gap(p, q) {
    const axes = p.axes.concat(q.axes);
    for (const a of p.axes) {
      for (const b of q.axes) {
        const c = cross(a, b);
        const l = Math.hypot(c[0], c[1], c[2]);
        if (l > 1e-9) axes.push(c.map((v) => v / l));
      }
    }
    const d = [0, 1, 2].map((j) => q.center[j] - p.center[j]);
    let g = -Infinity;
    for (const L of axes) {
      let r = 0;
      for (let j = 0; j < 3; j++) r += (p.size[j] / 2) * Math.abs(dot(p.axes[j], L)) + (q.size[j] / 2) * Math.abs(dot(q.axes[j], L));
      g = Math.max(g, Math.abs(dot(d, L)) - r);
    }
    return g;
  }

  const leaning = (p, q) => !!(p.lean || q.lean);
  // Level planks are checked exactly; planks that lean within LEAN_TOLERANCE.
  const overlaps = (p, q) => (leaning(p, q)
    ? gap(p, q) < -LEAN_TOLERANCE
    : p.z0 < q.z1 - EPS && q.z0 < p.z1 - EPS && !separated(p.footprint, q.footprint));
  // A level plank rests on the top face of another. With a leaning plank,
  // touching counts, as long as the support is not entirely above.
  const restsOn = (p, q) => (leaning(p, q)
    ? q.z0 < p.z0 + LEAN_TOLERANCE && gap(p, q) <= LEAN_TOLERANCE
    : Math.abs(q.z1 - p.z0) < EPS && !separated(p.footprint, q.footprint));
  // Sharing a face (side, top or bottom) over a positive area, or along an edge.
  const touches = (p, q) => (leaning(p, q)
    ? gap(p, q) <= LEAN_TOLERANCE
    : (p.z0 < q.z1 - EPS && q.z0 < p.z1 - EPS && !separated(p.footprint, q.footprint, -EPS)) || restsOn(p, q) || restsOn(q, p));

  // A scaffold plank that carries something slides out sideways or along its
  // length, whichever way is free. With planks against it on every side, it
  // cannot. Leaning scaffolds are not checked.
  function wedged(r, others) {
    if (r.lean) return false;
    const sides = r.axes.map((u, j) => [u, r.size[j] / 2]).filter(([u]) => Math.abs(u[2]) < 0.5);
    const proj = (q, u) => q.corners.map((k) => dot(k, u));
    const blocked = (u, h, sign) => {
      const c = dot(r.center, u);
      return others.some((q) => touches(r, q) &&
        (sign > 0 ? Math.min(...proj(q, u)) >= c + h - 1e-3 : Math.max(...proj(q, u)) <= c - h + 1e-3));
    };
    return sides.every(([u, h]) => blocked(u, h, 1) && blocked(u, h, -1));
  }

  const listOf = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : String(items[0]));
  const scaffoldRange = (list) => {
    const s = list.map((r) => r.s);
    return s.length === 1 ? `scaffold ${s[0]}` : s.every((v, i) => !i || v === s[i - 1] + 1) ? `scaffolds ${s[0]} to ${s[s.length - 1]}` : `scaffolds ${listOf(s)}`;
  };
  const whereOf = (p, step) => Object.assign(p.scaffold ? { scaffold: p.s } : { plank: p.n }, { step: step || p.step, line: p.line });

  /**
   * Validates a .plank.md document. For a translation, `options.original` is
   * the text of the file its "translation-of" names (null if there is none):
   * given, the translation is also checked against it.
   * Returns { meta, description, steps, planks, guides, scaffolds, moves,
   * diagnostics, valid }; `valid` is false as soon as there is one error.
   * Diagnostics carry `line` (1-based, in the file), and `plank`, `scaffold`
   * or `guide`, and `step`, when they concern one.
   */
  function validate(text, options = {}) {
    const doc = parse(text);
    const diagnostics = doc.diagnostics;
    if (doc.meta['translation-of'] !== undefined && options.original !== undefined) compareTranslation(doc, options.original, diagnostics);
    const { planks, scaffolds, moves } = build(doc, diagnostics);
    const ids = new Map();
    const present = [];
    let peak = 0;
    for (const m of moves) {
      if (m.kind === 'remove') {
        for (const r of m.scaffolds) present.splice(present.indexOf(r), 1);
        for (const r of m.scaffolds) {
          const load = present.find((x) => restsOn(x, r));
          if (load && wedged(r, present)) {
            diag(diagnostics, 'W-scaffold-wedged', `${plankLabel(r)} carries ${plankName(load)} and has planks against it on every side: it cannot slide out`, Object.assign(whereOf(r, m.step), { move: m.index }));
          }
        }
        for (const x of present) {
          if (x.z0 <= EPS || !m.scaffolds.some((r) => restsOn(x, r))) continue;
          if (present.some((q) => q !== x && restsOn(x, q))) continue;
          diag(diagnostics, 'W-scaffold-floating', `${plankLabel(x)} rests on nothing once ${scaffoldRange(m.scaffolds)} ${m.scaffolds.length > 1 ? 'are' : 'is'} removed`, Object.assign(whereOf(x, m.step), { move: m.index }));
        }
        continue;
      }
      const p = m.plank || m.scaffold;
      const where = whereOf(p);
      const label = plankLabel(p);
      if (p.id) {
        if (ids.has(p.id)) diag(diagnostics, 'E-duplicate-id', `${label}: id "${p.id}" is already used by ${plankName(ids.get(p.id))}`, where);
        else ids.set(p.id, p);
      }
      if (p.z0 < -EPS) diag(diagnostics, 'E-below-ground', `${label} goes below the ground (z = ${p.z0})`, where);
      const hit = present.find((q) => overlaps(p, q));
      if (hit) {
        diag(diagnostics, 'E-overlap', `${label} goes through ${plankName(hit)} (line ${hit.line})`,
          Object.assign(hit.scaffold ? { otherScaffold: hit.s } : { other: hit.n }, where));
      }
      if (p.z0 > EPS && !present.some((q) => restsOn(p, q))) {
        diag(diagnostics, 'W-floating', `${label} rests on nothing when it is placed`, where);
      }
      present.push(p);
      peak = Math.max(peak, present.length);
    }
    // Guides of a step that touch each other form a chain. A ruler measures
    // between two things, so a chain must touch at least two real planks:
    // with fewer, it is misplaced or the gap it measures is too wide.
    const rulers = guides(doc);
    const chainOf = new Map();
    for (const g of rulers) {
      if (chainOf.has(g)) continue;
      const chain = [g];
      chainOf.set(g, chain);
      for (let i = 0; i < chain.length; i++) {
        for (const h of rulers) {
          if (!chainOf.has(h) && h.step === g.step && touches(chain[i], h)) { chainOf.set(h, chain); chain.push(h); }
        }
      }
    }
    const reported = new Set();
    rulers.forEach((g, i) => { g.g = i + 1; });
    layGuides(rulers, moves);
    // A guide is laid like a plank: on the ground, on what is already there,
    // or on a guide laid before it.
    const laid = [];
    for (const g of rulers) {
      const under = planks.concat(scaffolds).filter((p) => p.move <= g.after && !(p.removed <= g.after));
      if (g.z0 > EPS && !under.concat(laid.filter((h) => h.step === g.step)).some((q) => restsOn(g, q))) {
        diag(diagnostics, 'W-guide-floating', `guide ("${g.source}") rests on nothing when it is laid: write it after the planks it lies on`,
          { guide: g.g, step: g.step, line: g.line });
      }
      laid.push(g);
    }
    for (const g of rulers) {
      // `guide` is the guide's 1-based index in `guides`, as `plank` is for planks.
      const where = { guide: g.g, step: g.step, line: g.line };
      const label = `guide ("${g.source}")`;
      const real = planks.filter((p) => p.step <= g.step);
      const hit = real.find((p) => overlaps(g, p));
      if (hit) { diag(diagnostics, 'E-guide-overlap', `${label} goes through plank ${hit.n} (line ${hit.line}): the gap is too small`, Object.assign({ other: hit.n }, where)); continue; }
      const chain = chainOf.get(g);
      if (reported.has(chain)) continue;
      const ends = new Set();
      for (const c of chain) for (const p of real) if (touches(c, p)) ends.add(p.n);
      if (ends.size < 2) {
        reported.add(chain);
        diag(diagnostics, 'W-guide-loose', `${label} ${ends.size ? `only touches plank ${[...ends][0]}` : 'touches no plank'}` +
          `${chain.length > 1 ? `, even with the ${chain.length - 1} guide${chain.length > 2 ? 's' : ''} it is chained to` : ''}: ` +
          'a guide measures the gap between two planks, so it is misplaced or the gap is too wide',
          Object.assign({ chain: chain.map((c) => c.g) }, where));
      }
    }
    // A step's view may focus on a plank: it must be there by the end of the step.
    for (const step of doc.steps) {
      const f = step.view && step.view.focus;
      if (!f || f === 'step') continue;
      const target = ids.get(f);
      if (!target || target.step > step.number) {
        diag(diagnostics, 'W-view', `Step ${step.number}: focus "${f}" names no plank placed by the end of the step`, { step: step.number, line: step.line });
        delete step.view.focus;
      }
    }
    if (doc.meta.inventory !== undefined && peak > doc.meta.inventory) {
      diag(diagnostics, 'W-inventory', scaffolds.length
        ? `${peak} planks at once, scaffolds included, but the inventory is ${doc.meta.inventory}`
        : `${planks.length} planks, but the inventory is ${doc.meta.inventory}`);
    }
    diagnostics.sort((a, b) => (a.line || 0) - (b.line || 0) || (a.plank || 0) - (b.plank || 0));
    return {
      meta: doc.meta,
      description: doc.description,
      steps: doc.steps,
      planks,
      guides: rulers,
      scaffolds,
      moves,
      diagnostics,
      valid: !diagnostics.some((d) => d.severity === 'error'),
    };
  }

  return {
    SPEC_VERSION, DEFAULT_PLANK, DEFAULT_VIEW, DIRECTIONS, LEAN_TOLERANCE, ORIENTATIONS,
    parse, parseView, translate, sourceHash, sha256, expand, build, guides, validate, gap,
  };
});
