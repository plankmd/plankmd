/*!
 * PlankMD balance check: can a construction stand, at every placement, and
 * how much tilt does it withstand?
 * MIT License. Works in Node and in the browser (window.PlankMDPhysics).
 * The linear programs are solved by HiGHS (https://highs.dev, MIT), which the
 * caller loads and passes in: `require('highs')()` in Node, or the same
 * package from a CDN in the browser. Not part of the spec: it reports `I-`
 * (information) diagnostics only.
 *
 * Model (rigid-block equilibrium). Planks are rigid boxes of uniform density.
 * A plank rests on the planks just below it through contact polygons (the
 * overlap of their footprints), or on the ground. At every corner of every
 * contact polygon acts an unknown normal force that can push but never pull
 * (planks do not stick together). Each contact also transmits friction: a
 * sliding force and a twisting moment, both bounded by the normal force times
 * the friction coefficient (a linearised friction cone). The construction can stand if there are forces that hold every
 * plank in balance: forces and moments around all three axes.
 *
 * Tilt. The margin is measured the way masonry is tested: on a tilting table.
 * Tilting the table by an angle α is the same as tilting gravity, so each
 * plank's weight gains a horizontal part, tan α times its weight. The margin
 * is the largest tilt the construction withstands in the worst of eight
 * directions, before a plank tips or slides. Sliding caps it at
 * atan(friction), about 24° for wood on wood.
 *
 * Side contacts carry no load in this model: friction between planks pressed
 * side by side is ignored, which makes the check conservative.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PlankMDPhysics = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EPS = 1e-6;
  const AREA_EPS = 1e-4;
  const FRICTION = 0.45; // pine on pine, dry
  const FRAGILE_TILT = 5; // degrees
  // Primal simplex: about twice as fast as the default on these programs.
  const SOLVER_OPTIONS = { solver: 'simplex', simplex_strategy: 4 };
  const DIRECTIONS = [
    ['+x', 1, 0], ['-x', -1, 0], ['+y', 0, 1], ['-y', 0, -1],
    ['+x+y', Math.SQRT1_2, Math.SQRT1_2], ['+x-y', Math.SQRT1_2, -Math.SQRT1_2],
    ['-x+y', -Math.SQRT1_2, Math.SQRT1_2], ['-x-y', -Math.SQRT1_2, -Math.SQRT1_2],
  ];

  // ------------------------------------------------------------- geometry

  // Clips convex polygon `subject` by convex counter-clockwise polygon `clip`.
  function clip(subject, clipPoly) {
    let out = subject;
    for (let i = 0; i < clipPoly.length && out.length; i++) {
      const [ax, ay] = clipPoly[i];
      const [bx, by] = clipPoly[(i + 1) % clipPoly.length];
      const side = ([x, y]) => (bx - ax) * (y - ay) - (by - ay) * (x - ax);
      const input = out;
      out = [];
      for (let j = 0; j < input.length; j++) {
        const p = input[j];
        const q = input[(j + 1) % input.length];
        const sp = side(p), sq = side(q);
        if (sp >= -EPS) out.push(p);
        if ((sp >= -EPS) !== (sq >= -EPS)) {
          const t = sp / (sp - sq);
          out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
        }
      }
    }
    return out.filter((p, i) => {
      const q = out[(i + 1) % out.length];
      return out.length < 2 || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-7;
    });
  }

  function area(poly) {
    let a = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      a += x1 * y2 - x2 * y1;
    }
    return a / 2;
  }

  /** Contact polygons between each plank and what it rests on (lower = null: the ground). */
  function contacts(planks) {
    const list = [];
    for (const p of planks) {
      if (Math.abs(p.z0) < EPS) { list.push({ upper: p, lower: null, poly: p.footprint, z: 0 }); continue; }
      for (const q of planks) {
        if (q === p || Math.abs(q.z1 - p.z0) >= EPS) continue;
        const poly = clip(p.footprint, q.footprint);
        if (poly.length >= 3 && area(poly) > AREA_EPS) list.push({ upper: p, lower: q, poly, z: p.z0 });
      }
    }
    return list;
  }

  // ---------------------------------------------------- linear program

  /**
   * Builds the equilibrium program for `planks`. Columns: a normal force
   * n ≥ 0 at each contact corner, and per contact two free friction forces
   * tx, ty and a free torsional moment mz; then `extra` columns appended by the caller. Rows: 6 equilibrium
   * equations per plank (forces x, y, z; moments x, y, z), then 6 friction
   * rows per contact (sliding along x and y, and spinning, both ways).
   */
  function program(planks, { friction = true } = {}) {
    const index = new Map(planks.map((p, i) => [p, i]));
    const cols = []; // each: { lower, upper, entries: [[row, value]] }
    const nEq = 6 * planks.length;
    let frictionRow = nEq;
    const weight = planks.map((p) => p.size[0] * p.size[1] * p.size[2]);
    for (const c of contacts(planks)) {
      const bodies = [[index.get(c.upper), 1, c.upper]];
      if (c.lower) bodies.push([index.get(c.lower), -1, c.lower]);
      // Normal forces at every corner of the contact polygon: they let the
      // pressure move anywhere inside it, which is what tipping is about.
      const normals = [];
      for (const [x, y] of c.poly) {
        const n = { lower: 0, upper: Infinity, entries: [] };
        for (const [b, sign, p] of bodies) {
          const r = 6 * b;
          n.entries.push([r + 2, sign], [r + 3, sign * (y - p.center[1])], [r + 4, -sign * (x - p.center[0])]);
        }
        normals.push(n);
        cols.push(n);
      }
      if (!friction) continue;
      // Friction: one tangential force per contact, at the polygon's centroid,
      // bounded by μ times the total normal force (a linearised friction
      // pyramid), plus a torsional moment bounded by μ times the normal force
      // times the mean radius of the polygon around its centroid, which is
      // what keeps a plank from spinning in place.
      const cx = c.poly.reduce((a, q) => a + q[0], 0) / c.poly.length;
      const cy = c.poly.reduce((a, q) => a + q[1], 0) / c.poly.length;
      const tx = { lower: -Infinity, upper: Infinity, entries: [] };
      const ty = { lower: -Infinity, upper: Infinity, entries: [] };
      for (const [b, sign, p] of bodies) {
        const rx = cx - p.center[0], ry = cy - p.center[1], rz = c.z - p.center[2];
        const r = 6 * b;
        tx.entries.push([r, sign], [r + 4, sign * rz], [r + 5, -sign * ry]);
        ty.entries.push([r + 1, sign], [r + 3, -sign * rz], [r + 5, sign * rx]);
      }
      const radius = c.poly.reduce((a, q) => a + Math.hypot(q[0] - cx, q[1] - cy), 0) / c.poly.length * (2 / 3);
      const mz = { lower: -Infinity, upper: Infinity, entries: [] };
      for (const [b, sign] of bodies) mz.entries.push([6 * b + 5, sign]);
      tx.entries.push([frictionRow, 1], [frictionRow + 1, -1]);
      ty.entries.push([frictionRow + 2, 1], [frictionRow + 3, -1]);
      mz.entries.push([frictionRow + 4, 1], [frictionRow + 5, -1]);
      for (const n of normals) {
        n.entries.push([frictionRow, -FRICTION], [frictionRow + 1, -FRICTION], [frictionRow + 2, -FRICTION], [frictionRow + 3, -FRICTION],
          [frictionRow + 4, -FRICTION * radius], [frictionRow + 5, -FRICTION * radius]);
      }
      frictionRow += 6;
      cols.push(tx, ty, mz);
    }
    return { cols, nEq, nRows: frictionRow, weight };
  }

  function solve(highs, prog, { rowLower, rowUpper, extra, cost, maximize }) {
    const cols = prog.cols.concat(extra || []);
    const starts = [0], indices = [], values = [];
    for (const c of cols) {
      c.entries.sort((a, b) => a[0] - b[0]);
      // Merge duplicate rows (a corner shared by two bodies never repeats a row, but be safe).
      let last = -1;
      for (const [r, v] of c.entries) {
        if (r === last) values[values.length - 1] += v;
        else { indices.push(r); values.push(v); last = r; }
      }
      starts.push(indices.length);
    }
    const model = {
      numCols: cols.length,
      numRows: prog.nRows,
      sense: maximize ? highs.constants.objectiveSense.maximize : highs.constants.objectiveSense.minimize,
      colCost: cols.map((c, i) => (cost ? cost(i, c) : 0)),
      colLower: cols.map((c) => (c.lower === -Infinity ? -highs.infinity : c.lower)),
      colUpper: cols.map((c) => (c.upper === Infinity ? highs.infinity : c.upper)),
      rowLower, rowUpper,
      matrix: { format: 'csc', numRows: prog.nRows, numCols: cols.length, starts, indices, values },
    };
    return highs.withModel(model, (m) => {
      m.options.set(Object.assign({ output_flag: false }, SOLVER_OPTIONS));
      m.run();
      const status = m.getModelStatus();
      const ok = status === highs.constants.modelStatus.optimal;
      return { ok, objective: ok ? m.getObjectiveValue() : null, x: ok ? m.getSolution().colValue : null };
    });
  }

  function equilibriumBounds(prog, load) {
    const lo = new Array(prog.nRows).fill(-Infinity), hi = new Array(prog.nRows).fill(0);
    for (let b = 0; b < prog.weight.length; b++) {
      const rhs = load(b);
      for (let k = 0; k < 6; k++) { lo[6 * b + k] = rhs[k]; hi[6 * b + k] = rhs[k]; }
    }
    return [lo, hi];
  }

  /**
   * Can `planks` stand? A plain feasibility check, without diagnosis. Under
   * vertical gravity, friction is rarely needed, so the much smaller
   * frictionless program is tried first: if it holds, friction can only help.
   */
  function stands(highs, planks) {
    for (const friction of [false, true]) {
      const prog = program(planks, { friction });
      const [rowLower, rowUpper] = equilibriumBounds(prog, (b) => [0, 0, prog.weight[b], 0, 0, 0]);
      if (solve(highs, prog, { rowLower: rowLower.map((v) => (v === -Infinity ? -highs.infinity : v)), rowUpper }).ok) return true;
    }
    return false;
  }

  /**
   * Can `planks` stand, and if not, which planks give way? Uses an elastic program: every equilibrium equation
   * gets two slack columns, and the solver minimises their total. Zero means
   * the construction stands; otherwise the planks whose equations keep a
   * slack are the ones that cannot stay in balance.
   * Returns { stands, failing: [plank numbers] }.
   */
  function balance(highs, planks, { hold = [] } = {}) {
    const prog = program(planks);
    const extra = [];
    // Planks in `hold` get no slack: they must stay in balance, so the
    // blame falls on the others.
    const held = new Set(hold.map((n) => planks.findIndex((p) => p.n === n)));
    for (let r = 0; r < prog.nEq; r++) {
      if (held.has(Math.floor(r / 6))) continue;
      extra.push({ lower: 0, upper: Infinity, entries: [[r, 1]], slack: r });
      extra.push({ lower: 0, upper: Infinity, entries: [[r, -1]], slack: r });
    }
    // Each plank's weight scales its equations, so slacks are compared per
    // weight. Slack is also cheaper low down: when the balance can be broken
    // in several places, the one reported is the lowest, which is where a
    // construction pivots when it topples.
    const [rowLower, rowUpper] = equilibriumBounds(prog, (b) => [0, 0, prog.weight[b], 0, 0, 0]);
    const first = prog.cols.length;
    const top = Math.max(...planks.map((p) => p.z1)) || 1;
    const cost = (b) => (1 + (4 * planks[b].center[2]) / top) / prog.weight[b];
    const res = solve(highs, prog, {
      rowLower: rowLower.map((v) => (v === -Infinity ? -highs.infinity : v)), rowUpper, extra,
      cost: (i) => (i >= first ? cost(Math.floor(extra[i - first].slack / 6)) : 0),
    });
    if (!res.ok) {
      if (held.size) return null; // the held planks cannot be balanced either way
      throw new Error('balance: the solver failed');
    }
    const failing = new Set();
    extra.forEach((e, k) => {
      const b = Math.floor(e.slack / 6);
      if (res.x[first + k] > 1e-6 * prog.weight[b]) failing.add(planks[b].n);
    });
    return { stands: res.objective < 1e-6 * planks.length, failing: [...failing].sort((a, b) => a - b) };
  }

  /**
   * Largest tilt, in degrees, that `planks` withstand when the table tilts
   * towards (dx, dy): maximise t = tan α, with every weight getting a
   * horizontal part t × weight in that direction.
   */
  function tilt(highs, planks, dx, dy) {
    const prog = program(planks);
    const t = { lower: 0, upper: 10, entries: [] };
    for (let b = 0; b < planks.length; b++) {
      // Contact forces balance the weight: Σ f + (t·w·dx, t·w·dy, -w) = 0.
      t.entries.push([6 * b, prog.weight[b] * dx], [6 * b + 1, prog.weight[b] * dy]);
    }
    const [rowLower, rowUpper] = equilibriumBounds(prog, (b) => [0, 0, prog.weight[b], 0, 0, 0]);
    const res = solve(highs, prog, {
      rowLower: rowLower.map((v) => (v === -Infinity ? -highs.infinity : v)), rowUpper,
      extra: [t], cost: (i) => (i === prog.cols.length ? 1 : 0), maximize: true,
    });
    if (!res.ok) return 0;
    return (Math.atan(res.objective) * 180) / Math.PI;
  }

  /** The smallest tilt over the eight directions, and the direction it comes from. */
  function tiltMargin(highs, planks, onDirection) {
    let worst = { degrees: Infinity, direction: null };
    for (const [name, dx, dy] of DIRECTIONS) {
      const d = tilt(highs, planks, dx, dy);
      if (onDirection) onDirection();
      if (d < worst.degrees) worst = { degrees: d, direction: name };
    }
    return worst;
  }

  // ------------------------------------------------- incremental model

  /**
   * A persistent HiGHS model of the same equilibrium program, which grows one
   * plank at a time. Each solve starts from the previous solution instead of
   * from scratch, and a tilt only changes a few coefficients: checking every
   * placement of a 200-plank model goes from minutes to seconds.
   * Rows: 6 equilibrium equations per plank, then (with friction) 6 friction
   * rows per contact. Column 0 is the tilt t = tan α (fixed to 0 except
   * during a tilt).
   */
  function incremental(highs, { friction }) {
    const model = highs.createModel();
    // HiGHS's default (dual simplex) is the fastest at re-solving from the
    // previous solution, which is all this model does.
    model.options.set({ output_flag: false });
    const INF = highs.infinity;
    const bodies = []; // { p, row, weight }
    let rows = 0;
    let cols = 0;
    const addRow = (lower, upper) => { model.addRow(lower, upper, { indices: [], values: [] }); return rows++; };
    const addCol = (lower, upper, entries) => {
      entries.sort((a, b) => a[0] - b[0]);
      model.addCol(0, lower, upper, { indices: entries.map((e) => e[0]), values: entries.map((e) => e[1]) });
      return cols++;
    };
    const T = addCol(0, 0, []);

    function addContact(upper, lower, poly, z) {
      const sides = [[upper, 1]];
      if (lower) sides.push([lower, -1]);
      let f = -1;
      if (friction) { f = rows; for (let k = 0; k < 6; k++) addRow(-INF, 0); }
      for (const [x, y] of poly) {
        const e = [];
        for (const [b, sign] of sides) {
          e.push([b.row + 2, sign], [b.row + 3, sign * (y - b.p.center[1])], [b.row + 4, -sign * (x - b.p.center[0])]);
        }
        if (friction) {
          e.push([f, -FRICTION], [f + 1, -FRICTION], [f + 2, -FRICTION], [f + 3, -FRICTION]);
        }
        if (friction) {
          const cx0 = poly.reduce((a, q) => a + q[0], 0) / poly.length, cy0 = poly.reduce((a, q) => a + q[1], 0) / poly.length;
          const radius = poly.reduce((a, q) => a + Math.hypot(q[0] - cx0, q[1] - cy0), 0) / poly.length * (2 / 3);
          e.push([f + 4, -FRICTION * radius], [f + 5, -FRICTION * radius]);
        }
        addCol(0, INF, e);
      }
      if (!friction) return;
      const cx = poly.reduce((a, q) => a + q[0], 0) / poly.length;
      const cy = poly.reduce((a, q) => a + q[1], 0) / poly.length;
      const tx = [[f, 1], [f + 1, -1]], ty = [[f + 2, 1], [f + 3, -1]], mz = [[f + 4, 1], [f + 5, -1]];
      for (const [b, sign] of sides) {
        const rx = cx - b.p.center[0], ry = cy - b.p.center[1], rz = z - b.p.center[2];
        tx.push([b.row, sign], [b.row + 4, sign * rz], [b.row + 5, -sign * ry]);
        ty.push([b.row + 1, sign], [b.row + 3, -sign * rz], [b.row + 5, sign * rx]);
        mz.push([b.row + 5, sign]);
      }
      addCol(-INF, INF, tx); addCol(-INF, INF, ty); addCol(-INF, INF, mz);
    }

    function contactBetween(upper, lower) {
      const poly = clip(upper.p.footprint, lower.p.footprint);
      if (poly.length >= 3 && area(poly) > AREA_EPS) addContact(upper, lower, poly, upper.p.z0);
    }

    return {
      /** Adds a plank and its contacts with the ground and the planks already in. */
      add(p) {
        const weight = p.size[0] * p.size[1] * p.size[2];
        const body = { p, row: rows, weight };
        for (const rhs of [0, 0, weight, 0, 0, 0]) addRow(rhs, rhs);
        if (Math.abs(p.z0) < EPS) addContact(body, null, p.footprint, 0);
        for (const q of bodies) {
          if (Math.abs(q.p.z1 - p.z0) < EPS) contactBetween(body, q);
          else if (Math.abs(p.z1 - q.p.z0) < EPS) contactBetween(q, body); // a plank slid under one already there
        }
        bodies.push(body);
      },
      /** Can the planks added so far stand? */
      stands() {
        model.changeColBounds(T, 0, 0);
        model.changeColCost(T, 0);
        model.run();
        return model.getModelStatus() === highs.constants.modelStatus.optimal;
      },
      /** Largest tilt (degrees) towards (dx, dy) that the planks added so far withstand. */
      tilt(dx, dy) {
        for (const b of bodies) {
          model.changeCoefficient(b.row, T, b.weight * dx);
          model.changeCoefficient(b.row + 1, T, b.weight * dy);
        }
        // Nothing withstands more than the sliding limit, tan α = μ, and many
        // constructions reach it: check that first, a plain feasibility test.
        model.changeColBounds(T, FRICTION, FRICTION);
        model.run();
        if (model.getModelStatus() === highs.constants.modelStatus.optimal) {
          model.changeColBounds(T, 0, 0);
          return (Math.atan(FRICTION) * 180) / Math.PI;
        }
        model.changeColBounds(T, 0, 10);
        model.changeColCost(T, 1);
        model.changeObjectiveSense(highs.constants.objectiveSense.maximize);
        model.run();
        const ok = model.getModelStatus() === highs.constants.modelStatus.optimal;
        const t = ok ? model.getObjectiveValue() : 0;
        model.changeObjectiveSense(highs.constants.objectiveSense.minimize);
        model.changeColCost(T, 0);
        model.changeColBounds(T, 0, 0);
        return (Math.atan(t) * 180) / Math.PI;
      },
      dispose() { model.dispose(); },
    };
  }

  /**
   * Checks the balance of a validated document (the result of
   * PlankMD.validate) after every placement, and the tilt it withstands at the
   * end of every step. Returns { skipped, stable, placements, steps, diagnostics }.
   * `onProgress(done, total)` is called as the work advances. `onPartial(out)`
   * receives the result so far: once every placement is checked (fast), then
   * after each step's tilt (slower, up to half a minute on 200 planks).
   */
  function analyse(highs, result, { onProgress, onPartial } = {}) {
    const out = { skipped: null, stable: true, placements: [], steps: [], diagnostics: [], complete: false };
    const blocking = result.diagnostics.filter((d) => d.severity === 'error' || d.code === 'W-floating');
    if (blocking.length) {
      out.skipped = 'the model has errors or floating planks: fix them first';
      out.complete = true;
      return out;
    }
    const planks = result.planks;
    // Work units: one per placement, and one per tilt direction per step
    // (a tilt costs about two placements).
    const total = planks.length + 2 * DIRECTIONS.length * result.steps.length;
    let done = 0;
    const progress = (k) => { done += k; if (onProgress) onProgress(Math.min(done, total), total); };
    const partial = () => { if (onPartial) onPartial(JSON.parse(JSON.stringify(out))); };

    // Pass 1, fast: does it stand after every placement? The frictionless
    // model checks every placement (under vertical gravity, friction is
    // rarely needed); the model with friction follows behind and is only
    // brought up to date when a placement fails without friction.
    const fast = incremental(highs, { friction: false });
    const full = incremental(highs, { friction: true });
    let fullCount = 0;
    try {
      for (let n = 1; n <= planks.length; n++) {
        fast.add(planks[n - 1]);
        let ok = fast.stands();
        if (!ok) {
          while (fullCount < n) full.add(planks[fullCount++]);
          ok = full.stands();
        }
        out.placements.push({ n, stands: ok });
        progress(1);
      }
    } finally {
      fast.dispose();
      full.dispose();
    }
    for (let i = 0; i < out.placements.length; i++) {
      if (out.placements[i].stands) continue;
      let j = i;
      while (j + 1 < out.placements.length && !out.placements[j + 1].stands) j++;
      const first = planks[i], last = planks[j];
      // Which planks give way, at the moment the construction starts to fall.
      // The plank just placed is often the cheapest one to blame (it only has
      // to lean a little), while what really gives way is below it: first ask
      // which planks give way if the new one is held in place.
      const upTo = planks.slice(0, i + 1);
      const held = balance(highs, upTo, { hold: [planks[i].n] });
      const { failing } = held && held.failing.length ? held : balance(highs, upTo);
      const toEnd = j === planks.length - 1;
      const listed = failing.length > 8 ? `${failing.slice(0, 8).join(', ')} and ${failing.length - 8} more` : failing.join(', ');
      const who = failing.length ? ` (plank${failing.length > 1 ? 's' : ''} ${listed} cannot stay in balance)` : '';
      const span = toEnd
        ? (i === j ? `When plank ${first.n} is placed` : `From plank ${first.n} on`)
        : (i === j ? `While plank ${first.n} is the last one placed` : `From plank ${first.n} to plank ${last.n}`);
      out.diagnostics.push({
        code: 'I-unstable', severity: 'info', plank: first.n, step: first.step, line: first.line, until: last.n, failing,
        message: `${span}, the construction falls${who}.` +
          (toEnd ? '' : ' It stands again afterwards: hold it, or change the placement order.'),
      });
      out.stable = false;
      i = j;
    }
    partial();

    // Pass 2, slower: how much tilt does it withstand at the end of each
    // step? One model with friction grows step by step; each step's result
    // is reported as soon as it is known.
    const tiltModel = incremental(highs, { friction: true });
    let count = 0;
    try {
      for (const step of result.steps) {
        const upTo = planks.filter((p) => p.step <= step.number).length;
        if (!upTo) continue;
        while (count < upTo) tiltModel.add(planks[count++]);
        const stands = out.placements[upTo - 1].stands;
        let m = { degrees: 0, direction: null };
        if (stands) {
          m = { degrees: Infinity, direction: null };
          for (const [name, dx, dy] of DIRECTIONS) {
            const d = tiltModel.tilt(dx, dy);
            if (d < m.degrees) m = { degrees: d, direction: name };
            progress(2);
          }
        } else progress(2 * DIRECTIONS.length);
        out.steps.push({ step: step.number, stands, tilt: m.degrees, direction: m.direction });
        if (stands && m.degrees < FRAGILE_TILT) {
          out.diagnostics.push({
            code: 'I-fragile', severity: 'info', step: step.number, line: step.line, tilt: m.degrees,
            message: `At the end of step ${step.number}, the construction stands, but tilting it by ` +
              `${m.degrees.toFixed(1)}° (towards ${m.direction}) is enough to make it fall.`,
          });
        }
        partial();
      }
    } finally {
      tiltModel.dispose();
    }
    out.complete = true;
    return out;
  }

  return { analyse, stands, balance, tilt, tiltMargin, contacts, FRICTION, FRAGILE_TILT };
});
