/*!
 * PlankMD drop test: let a physics engine drop the planks and watch what moves.
 * MIT License. Works in Node and in the browser (window.PlankMDDrop).
 * The engine is Rapier (https://rapier.rs, Apache-2.0), which the caller
 * loads, initialises and passes in: `require('@dimforge/rapier3d-compat')` in
 * Node, or the same package from a CDN in the browser.
 *
 * It complements the balance check (physics.js): friction acts everywhere and
 * the fall can be watched, but the result depends on the engine's tolerances,
 * so moves below a threshold are ignored.
 *
 * Scale. The engine's tolerances are tuned for objects about a metre in size;
 * planks 7.8 mm thick drift and sink into each other over a tall stack, and a
 * stable tower slowly collapses. So the model is simulated with 1 u = 1 m,
 * under ordinary gravity. Whether something stands does not depend on scale,
 * but motion does: everything happens about 11 times slower than with real
 * planks (time scales with the square root of size). Keeping real-time
 * gravity instead (g / 7.8 mm) makes the engine unstable again: tested on
 * the reference cases in test/cases, it then topples models that stand.
 *
 * Axes: the engine uses the player's scene axes, y up. A plank at PlankMD
 * (x, y, z) sits at scene (x, z, -y).
 *
 * Leaning planks are boxes turned in space like any other: the engine needs
 * nothing more. Scaffolds (docs/proposals/scaffold.md) are bodies while they
 * are in place; in a replay of the moves, a removal takes them out of the
 * world and the simulation goes on without them.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PlankMDDrop = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULTS = {
    scale: 1, // metres per u (see "Scale" above)
    gravity: 9.81,
    seconds: 6, // simulated time, about half a second of real planks
    timestep: 1 / 240,
    iterations: 16, // solver iterations: stacks need more than the default 4
    friction: 0.45,
    density: 450, // pine, kg/m³
    movedU: 0.5, // a plank that moved less than this (in u)…
    movedDegrees: 3, // …and turned less than this, stayed put
    // A plank that moved a little, then stopped, has settled: a tall leaning
    // stack sags a few degrees in the engine and stays there. It only counts
    // as fallen if it is still moving at the end, or moved clearly further.
    fellU: 4,
    fellDegrees: 6, // measured: a settling tower stops at 4.4°, a tipped plank lies at 7°
    movingSpeed: 0.3, // replay: a plank faster than this (u/s)…
    movingSpin: 3, // …or spinning faster than this (degrees/s) is falling
    replay: false, // place the planks one by one, in placement order
    interval: 0.5, // replay: simulated seconds between two placements
  };

  // The orientation of a plank in scene axes, as a quaternion: from its
  // `axes` (file coordinates), or from `rotation` alone for older results.
  function sceneQuaternion(p) {
    if (!p.axes) {
      const half = (p.rotation * Math.PI) / 360;
      return { x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) };
    }
    // Columns of the rotation: the box's x, height and depth in scene axes.
    const sc = (v) => [v[0], v[2], -v[1]];
    const ex = sc(p.axes[0]), ey = sc(p.axes[2]), ez = sc(p.axes[1]).map((v) => -v);
    const m00 = ex[0], m01 = ey[0], m02 = ez[0], m10 = ex[1], m11 = ey[1], m12 = ez[1], m20 = ex[2], m21 = ey[2], m22 = ez[2];
    const tr = m00 + m11 + m22;
    if (tr > 0) {
      const k = 0.5 / Math.sqrt(tr + 1);
      return { w: 0.25 / k, x: (m21 - m12) * k, y: (m02 - m20) * k, z: (m10 - m01) * k };
    }
    if (m00 > m11 && m00 > m22) {
      const k = 2 * Math.sqrt(1 + m00 - m11 - m22);
      return { w: (m21 - m12) / k, x: 0.25 * k, y: (m01 + m10) / k, z: (m02 + m20) / k };
    }
    if (m11 > m22) {
      const k = 2 * Math.sqrt(1 + m11 - m00 - m22);
      return { w: (m02 - m20) / k, x: (m01 + m10) / k, y: 0.25 * k, z: (m12 + m21) / k };
    }
    const k = 2 * Math.sqrt(1 + m22 - m00 - m11);
    return { w: (m10 - m01) / k, x: (m02 + m20) / k, y: (m12 + m21) / k, z: 0.25 * k };
  }

  /**
   * Prepares a simulation of `planks` (validated planks: size, center,
   * axes, n). Returns an object to advance it step by step, read the
   * pose of each plank, and get the verdict at the end.
   *
   * By default every plank is there from the start: the finished model is
   * dropped. With `replay: true`, planks appear one by one, in placement
   * order, `interval` seconds apart, each at its intended place, as a builder
   * would put them down; the model then settles for `seconds`. The result
   * says after which placement the construction first moved. With `moves`
   * (PlankMD.build), a replay follows them instead: scaffold planks are
   * placed and removed too.
   */
  function createDrop(R, planks, options) {
    const o = Object.assign({}, DEFAULTS, options);
    const S = o.scale;
    const world = new R.World({ x: 0, y: -o.gravity, z: 0 });
    world.timestep = o.timestep;
    world.integrationParameters.numSolverIterations = o.iterations;
    world.createCollider(R.ColliderDesc.cuboid(1000 * S, S, 1000 * S).setTranslation(0, -S, 0).setFriction(o.friction));
    const spawn = (p) => {
      const [sx, sy, sz] = p.size;
      const q = sceneQuaternion(p);
      const t = { x: p.center[0] * S, y: p.center[2] * S, z: -p.center[1] * S };
      const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(t.x, t.y, t.z).setRotation(q));
      // Slightly narrower than the plank, so that planks touching side by side
      // do not start pressed together: the format never presses planks sideways.
      world.createCollider(R.ColliderDesc.cuboid((sx / 2) * S * 0.995, (sz / 2) * S, (sy / 2) * S * 0.995)
        .setFriction(o.friction).setRestitution(0).setDensity(o.density), body);
      return { p, body, t0: t, q0: q };
    };
    const items = [];
    // What a replay does, in order: put a plank down, or take scaffolds away.
    const sequence = !o.replay ? [] : o.moves
      ? o.moves.map((m) => (m.kind === 'remove' ? { remove: m.scaffolds, move: m } : { add: m.plank || m.scaffold, move: m }))
      : planks.map((p) => ({ add: p }));
    let next = 0; // index of the next event
    let time = 0;
    let fellAt = null; // { n, moved } at the first placement after which something moved
    let lastPlank = null; // the last plank of the construction placed
    const total = o.replay ? sequence.length * o.interval + o.seconds : o.seconds;
    if (!o.replay) { for (const p of planks) items.push(spawn(p)); }

    const angle = (a, b) => {
      const dot = Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w);
      return (2 * Math.acos(Math.min(1, dot)) * 180) / Math.PI;
    };
    const isMoving = (it) => {
      const v = it.body.linvel(), w = it.body.angvel();
      return Math.hypot(v.x, v.y, v.z) / S > o.movingSpeed || (Math.hypot(w.x, w.y, w.z) * 180) / Math.PI > o.movingSpin;
    };
    // Planks away from where they were placed: `fell` when clearly gone or
    // still going, otherwise they only settled.
    const movedPlanks = () => {
      const moved = [];
      for (const it of items) {
        const t = it.body.translation(), q = it.body.rotation();
        const dist = Math.hypot(t.x - it.t0.x, t.y - it.t0.y, t.z - it.t0.z) / S;
        const turn = angle(q, it.q0);
        if (dist <= o.movedU && turn <= o.movedDegrees) continue;
        const fell = dist > o.fellU || turn > o.fellDegrees || isMoving(it);
        moved.push(Object.assign(it.p.scaffold ? { s: it.p.s } : { n: it.p.n }, { distance: dist, degrees: turn, fell }));
      }
      return moved;
    };
    // Planks still moving: a slow topple has started even if nothing has
    // moved far yet (motion is slow at this scale).
    const moving = () => items.some(isMoving);
    // Where a fall started: after which move, and the last plank placed by then.
    const fallAfter = (e, moved) => ({
      n: lastPlank ? lastPlank.n : null,
      kind: e.remove ? 'remove' : e.add.scaffold ? 'scaffold' : 'plank',
      ...(e.move ? { move: e.move.index } : {}),
      ...(e.add && e.add.scaffold ? { s: e.add.s } : {}),
      moved,
    });
    const step = () => {
      // Replay: just before placing a plank, check whether the planks
      // already there have moved, or are still moving, since the previous
      // placement.
      if (o.replay && next < sequence.length && time >= next * o.interval - 1e-9) {
        if (next > 0 && !fellAt) {
          const moved = movedPlanks().filter((m) => m.fell);
          if (moved.length || moving()) fellAt = fallAfter(sequence[next - 1], moved);
        }
        const e = sequence[next];
        if (e.add) {
          items.push(spawn(e.add));
          if (!e.add.scaffold) lastPlank = e.add;
        } else {
          for (const r of e.remove) {
            const i = items.findIndex((it) => it.p === r);
            if (i >= 0) { world.removeRigidBody(items[i].body); items.splice(i, 1); }
          }
        }
        next++;
      }
      world.step();
      time += o.timestep;
    };

    return {
      get time() { return time; },
      get duration() { return total; },
      /** Number of planks placed so far (moves, in a replay of moves). */
      get placed() { return next; },
      /** Number of events of the replay. */
      get events() { return o.replay ? sequence.length : planks.length; },
      get done() { return time >= total - 1e-9; },
      /** Advances by up to `seconds` of simulated time. */
      advance(seconds) {
        const end = Math.min(total, time + seconds);
        while (time < end - 1e-9) step();
      },
      /** Runs to the end. */
      run() { this.advance(total); return this.result(); },
      /** Current pose of every plank placed so far, in u, scene axes. */
      poses() {
        return items.map((it) => {
          const t = it.body.translation(), q = it.body.rotation();
          return { p: it.p, n: it.p.n, position: [t.x / S, t.y / S, t.z / S], quaternion: [q.x, q.y, q.z, q.w] };
        });
      },
      /**
       * The planks that fell (`moved`) and those that only settled a little
       * (`settled`), with how far (in u) and how much they turned.
       * In replay, `fellAt` is the first placement after which something
       * moved (null if the build never moved), and `stood` covers the whole
       * build, not only the end.
       */
      result() {
        const all = movedPlanks();
        const moved = all.filter((m) => m.fell);
        const settled = all.filter((m) => !m.fell);
        if (o.replay && !fellAt && moved.length && next === sequence.length) fellAt = fallAfter(sequence[next - 1], moved);
        return { stood: moved.length === 0 && !fellAt, moved, settled, fellAt, seconds: time };
      },
      free() { world.free(); },
    };
  }

  return { createDrop, sceneQuaternion, DEFAULTS };
});
