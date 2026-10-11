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

  /**
   * Prepares a simulation of `planks` (validated planks: size, center,
   * rotation, n). Returns an object to advance it step by step, read the
   * pose of each plank, and get the verdict at the end.
   *
   * By default every plank is there from the start: the finished model is
   * dropped. With `replay: true`, planks appear one by one, in placement
   * order, `interval` seconds apart, each at its intended place, as a builder
   * would put them down; the model then settles for `seconds`. The result
   * says after which placement the construction first moved.
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
      const half = (p.rotation * Math.PI) / 360;
      const q = { x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) };
      const t = { x: p.center[0] * S, y: p.center[2] * S, z: -p.center[1] * S };
      const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(t.x, t.y, t.z).setRotation(q));
      // Slightly narrower than the plank, so that planks touching side by side
      // do not start pressed together: the format never presses planks sideways.
      world.createCollider(R.ColliderDesc.cuboid((sx / 2) * S * 0.995, (sz / 2) * S, (sy / 2) * S * 0.995)
        .setFriction(o.friction).setRestitution(0).setDensity(o.density), body);
      return { p, body, t0: t, q0: q };
    };
    const items = [];
    let next = 0; // index of the next plank to place
    let time = 0;
    let fellAt = null; // { n, moved } at the first placement after which something moved
    const total = o.replay ? planks.length * o.interval + o.seconds : o.seconds;
    if (!o.replay) { for (const p of planks) items.push(spawn(p)); next = planks.length; }

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
        moved.push({ n: it.p.n, distance: dist, degrees: turn, fell });
      }
      return moved;
    };
    // Planks still moving: a slow topple has started even if nothing has
    // moved far yet (motion is slow at this scale).
    const moving = () => items.some(isMoving);
    const step = () => {
      // Replay: just before placing a plank, check whether the planks
      // already there have moved, or are still moving, since the previous
      // placement.
      if (o.replay && next < planks.length && time >= next * o.interval - 1e-9) {
        if (next > 0 && !fellAt) {
          const moved = movedPlanks().filter((m) => m.fell);
          if (moved.length || moving()) fellAt = { n: planks[next - 1].n, moved };
        }
        items.push(spawn(planks[next]));
        next++;
      }
      world.step();
      time += o.timestep;
    };

    return {
      get time() { return time; },
      get duration() { return total; },
      /** Number of planks placed so far. */
      get placed() { return next; },
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
          return { n: it.p.n, position: [t.x / S, t.y / S, t.z / S], quaternion: [q.x, q.y, q.z, q.w] };
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
        if (o.replay && !fellAt && moved.length && next === planks.length) fellAt = { n: planks[next - 1].n, moved };
        return { stood: moved.length === 0 && !fellAt, moved, settled, fellAt, seconds: time };
      },
      free() { world.free(); },
    };
  }

  return { createDrop, DEFAULTS };
});
