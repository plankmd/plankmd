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

  const SPEC_VERSION = '0.1';
  const DEFAULT_PLANK = [15, 3, 1];
  const DEFAULT_COLOR = '#e3bf86';
  const EPS = 1e-6;
  const KNOWN_KEYS = ['color', 'id', 'repeat', 'offset', 'rot', 'rot-step', 'pivot'];
  const NUM = /^-?\d+(\.\d+)?$/;
  const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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
      if (/^\[.*\]$/.test(value)) { meta[key] = value.slice(1, -1).split(',').map((s) => unquote(s.trim())); return; }
      meta[key] = unquote(value);
    });
    return meta;
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
      if (isPlank) { blocks.push({ prose, body, firstLine: start + 1 }); prose = []; }
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
    if (guide) tokens.shift();
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
      if (!KNOWN_KEYS.includes(key)) { diag(diagnostics, 'W-unknown-attribute', `Unknown attribute "${key}" ignored`, where); continue; }
      let parsed = value;
      if (key === 'repeat') parsed = /^\d+$/.test(value) && Number(value) >= 1 ? Number(value) : null;
      else if (key === 'offset') parsed = parseNums(value, 3);
      else if (key === 'pivot') parsed = parseNums(value, 2);
      else if (key === 'rot' || key === 'rot-step') parsed = NUM.test(value) ? Number(value) : null;
      else if (key === 'id') parsed = SLUG.test(value) ? value : null;
      else if (key === 'color') parsed = value || null;
      if (parsed === null) { diag(diagnostics, 'E-parse', `Invalid value for ${key}: "${value}"`, where); ok = false; continue; }
      attrs[key] = parsed;
    }
    if (attrs.repeat !== undefined && !attrs.offset) {
      diag(diagnostics, 'E-parse', '"repeat" needs an "offset"', where);
      ok = false;
    }
    if (!ok) return null;
    return { orientation: tokens[0], position: pos.map(Number), attrs, source, line: lineNo, step, guide };
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
    const steps = blocks.map((block, i) => {
      const number = i + 1;
      const { title, text: body } = stepText(block.prose);
      const lines = block.body
        .map((raw, j) => parseLine(raw, block.firstLine + j, number, diagnostics))
        .filter(Boolean);
      return { number, title: title || `Step ${number}`, text: body, lines, line: block.firstLine - 1 };
    });
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

  function footprint(cx, cy, hx, hy, theta) {
    const c = Math.cos(theta), s = Math.sin(theta);
    return [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]].map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
  }

  function expandLine(line, meta) {
    const size = ORIENTATIONS[line.orientation](meta.plank);
    const a = line.attrs;
    const count = a.repeat || 1;
    const offset = a.offset || [0, 0, 0];
    const out = [];
    for (let i = 0; i < count; i++) {
      const pos = line.position.map((v, j) => v + i * offset[j]);
      const degrees = (a.rot || 0) + i * (a['rot-step'] || 0);
      const theta = (degrees * Math.PI) / 180;
      let cx = pos[0] + size[0] / 2;
      let cy = pos[1] + size[1] / 2;
      if (a.pivot) {
        const [px, py] = a.pivot;
        const dx = cx - px, dy = cy - py;
        cx = px + dx * Math.cos(theta) - dy * Math.sin(theta);
        cy = py + dx * Math.sin(theta) + dy * Math.cos(theta);
      }
      out.push({
        orientation: line.orientation,
        position: pos,
        size,
        rotation: degrees,
        center: [cx, cy, pos[2] + size[2] / 2],
        z0: pos[2],
        z1: pos[2] + size[2],
        footprint: footprint(cx, cy, size[0] / 2, size[1] / 2, theta),
        color: (!line.guide && a.color && (meta.palette[a.color] || a.color)) || DEFAULT_COLOR,
        id: a.id ? (count > 1 ? `${a.id}-${i + 1}` : a.id) : null,
        step: line.step,
        line: line.line,
        source: line.source,
        guide: line.guide,
      });
    }
    return out;
  }

  /**
   * Expands every line into planks, in placement order, numbered from 1.
   * Guides are not planks: they are left out (see `guides`).
   */
  function expand(doc) {
    const planks = [];
    for (const step of doc.steps) {
      const groups = step.lines.filter((line) => !line.guide).map((line) => expandLine(line, doc.meta));
      for (let round = 0; groups.some((g) => g.length > round); round++) {
        for (const g of groups) if (g.length > round) planks.push(g[round]);
      }
    }
    planks.forEach((p, i) => { p.n = i + 1; });
    return planks;
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

  const overlaps = (p, q) => p.z0 < q.z1 - EPS && q.z0 < p.z1 - EPS && !separated(p.footprint, q.footprint);
  const restsOn = (p, q) => Math.abs(q.z1 - p.z0) < EPS && !separated(p.footprint, q.footprint);
  // Sharing a face (side, top or bottom) over a positive area, or along an edge.
  const touches = (p, q) =>
    (p.z0 < q.z1 - EPS && q.z0 < p.z1 - EPS && !separated(p.footprint, q.footprint, -EPS)) ||
    restsOn(p, q) || restsOn(q, p);

  /**
   * Parses, expands and validates a document.
   * Returns { meta, steps, planks, diagnostics, valid }; `valid` is false as
   * soon as there is one error. Diagnostics carry `line` (1-based, in the
   * file), and `plank` / `step` when they concern a plank.
   */
  function validate(text) {
    const doc = parse(text);
    const diagnostics = doc.diagnostics;
    const planks = expand(doc);
    const ids = new Map();
    const placed = [];
    for (const p of planks) {
      const where = { plank: p.n, step: p.step, line: p.line };
      const label = `plank ${p.n} ("${p.source}")`;
      if (p.id) {
        if (ids.has(p.id)) diag(diagnostics, 'E-duplicate-id', `${label}: id "${p.id}" is already used by plank ${ids.get(p.id)}`, where);
        else ids.set(p.id, p.n);
      }
      if (p.z0 < -EPS) diag(diagnostics, 'E-below-ground', `${label} goes below the ground (z = ${p.z0})`, where);
      const hit = placed.find((q) => overlaps(p, q));
      if (hit) diag(diagnostics, 'E-overlap', `${label} goes through plank ${hit.n} (line ${hit.line})`, Object.assign({ other: hit.n }, where));
      if (p.z0 > EPS && !placed.some((q) => restsOn(p, q))) {
        diag(diagnostics, 'W-floating', `${label} rests on nothing when it is placed`, where);
      }
      placed.push(p);
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
    if (doc.meta.inventory !== undefined && planks.length > doc.meta.inventory) {
      diag(diagnostics, 'W-inventory', `${planks.length} planks, but the inventory is ${doc.meta.inventory}`);
    }
    diagnostics.sort((a, b) => (a.line || 0) - (b.line || 0) || (a.plank || 0) - (b.plank || 0));
    return {
      meta: doc.meta,
      description: doc.description,
      steps: doc.steps,
      planks,
      guides: rulers,
      diagnostics,
      valid: !diagnostics.some((d) => d.severity === 'error'),
    };
  }

  return { SPEC_VERSION, DEFAULT_PLANK, ORIENTATIONS, parse, translate, expand, guides, validate };
});
