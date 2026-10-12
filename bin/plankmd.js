#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const PlankMD = require('../src/plankmd.js');

const USAGE = `Usage:
  plankmd validate <file.plank.md>... [--json] [--strict] [--physics [--all-tilts]]
  plankmd expand <file.plank.md> [--json]
  plankmd drop <file.plank.md>... [--replay] [--json]

validate  Checks each file. Exit code 1 on any error (and on any warning with --strict).
expand    Prints every plank in placement order, with its number and geometry.
          Guides are marked "~" and listed at the start of their step.
drop      Drops the finished model in a physics engine (Rapier) and reports
          which planks moved. Needs the "@dimforge/rapier3d-compat" package.
          --replay places the planks one by one, in building order, and
          reports the first placement after which something moved.

  --json    Machine-readable output.
  --strict  Treat warnings as errors.
  --physics Also check that the construction stands at every placement, and
            how much tilt it withstands at the end of every step (only the
            last step above 300 planks: --all-tilts measures them all).
            Needs the optional "highs" package. Reports information only
            (I- codes).`;

async function loadPhysics() {
  let highs;
  try { highs = require('highs'); } catch {
    throw new Error('--physics needs the optional "highs" package: npm install highs');
  }
  return { physics: require('../src/physics.js'), solver: await highs() };
}

async function main(argv) {
  const args = argv.filter((a) => !a.startsWith('--'));
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const [command, ...files] = args;
  if (!command || flags.has('--help') || !['validate', 'expand', 'drop'].includes(command) || files.length === 0) {
    console.log(USAGE);
    return command && !flags.has('--help') ? 2 : 0;
  }

  const results = files.map((file) => {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); }
    catch (e) { return { file, error: e.message }; }
    // A translation is also checked against the original it names.
    const of = PlankMD.parse(text).meta['translation-of'];
    const options = {};
    if (command === 'validate' && typeof of === 'string' && of) {
      try { options.original = fs.readFileSync(path.resolve(path.dirname(file), of), 'utf8'); } catch { options.original = null; }
    }
    return Object.assign({ file }, PlankMD.validate(text, options));
  });
  if (command === 'validate' && flags.has('--physics')) {
    let loaded;
    try { loaded = await loadPhysics(); } catch (e) { console.error(e.message); return 2; }
    for (const r of results) {
      if (r.error) continue;
      r.physics = loaded.physics.analyse(loaded.solver, r, flags.has('--all-tilts') ? { tilts: 'all' } : {});
      r.diagnostics = r.diagnostics.concat(r.physics.diagnostics)
        .sort((a, b) => (a.line || 0) - (b.line || 0) || (a.plank || 0) - (b.plank || 0));
    }
  }

  if (command === 'drop') {
    let R;
    try { R = require('@dimforge/rapier3d-compat'); } catch {
      console.error('drop needs the "@dimforge/rapier3d-compat" package: npm install @dimforge/rapier3d-compat');
      return 2;
    }
    await R.init();
    const { createDrop } = require('../src/drop.js');
    let failed = false;
    const out = [];
    for (const r of results) {
      if (r.error || !r.valid) { failed = true; out.push({ file: r.file, error: r.error || 'invalid model' }); continue; }
      const replay = flags.has('--replay');
      const sim = createDrop(R, r.planks, { replay });
      const res = sim.run();
      sim.free();
      // In a replay, planks that moved a little during the build and settled
      // (nothing fell by the end) are a wobble of the engine: reported, not a failure.
      const wobble = replay && !res.stood && res.moved.length === 0;
      failed = failed || (!res.stood && !wobble);
      out.push({ file: r.file, replay, stood: res.stood, wobble, moved: res.moved, fellAt: res.fellAt ? res.fellAt.n : null });
    }
    if (flags.has('--json')) console.log(JSON.stringify(out, null, 2));
    else for (const o of out) {
      if (o.error) { console.log(`✗ ${o.file}: ${o.error}`); continue; }
      const worst = o.moved.slice().sort((a, b) => b.distance - a.distance)[0];
      const most = worst ? ` (most: plank ${worst.n}, ${worst.distance.toFixed(1)} u, ${worst.degrees.toFixed(0)}°)` : '';
      const plank = o.fellAt;
      if (o.wobble) { console.log(`~ ${o.file}: planks moved a little during the build, after plank ${plank}, then settled: nothing fell`); continue; }
      console.log(o.stood ? `✓ ${o.file}: ${o.replay ? 'stood through the whole build' : 'stood'}, no plank moved`
        : `✗ ${o.file}: ${o.fellAt ? `fell during the build, once plank ${plank} was placed: ` : ''}${o.moved.length ? `${o.moved.length} plank${o.moved.length === 1 ? '' : 's'} moved${most}` : 'planks moved, then settled by the end'}`);
    }
    return failed ? 1 : 0;
  }

  if (command === 'expand') {
    const r = results[0];
    if (r.error) { console.error(`${r.file}: ${r.error}`); return 2; }
    const planks = r.planks.map((p) => ({
      n: p.n, step: p.step, line: p.line, id: p.id, orientation: p.orientation,
      position: p.position, size: p.size, rotation: p.rotation, center: p.center, color: p.color,
    }));
    const guides = r.guides.map((g) => ({
      step: g.step, line: g.line, orientation: g.orientation, position: g.position, size: g.size, rotation: g.rotation, center: g.center,
    }));
    if (flags.has('--json')) console.log(JSON.stringify({ meta: r.meta, planks, guides }, null, 2));
    else {
      const row = (label, p) => `${label}  step ${p.step}  ${p.orientation.padEnd(6)}  ` +
        `${p.position.join(' ')}${p.rotation ? `  rot ${p.rotation}` : ''}${p.id ? `  #${p.id}` : ''}`;
      // Guides are listed at the start of their step, where the builder lays them.
      for (const step of r.steps) {
        guides.filter((g) => g.step === step.number).forEach((g) => console.log(row('   ~', g)));
        planks.filter((p) => p.step === step.number).forEach((p) => console.log(row(String(p.n).padStart(4), p)));
      }
    }
    return 0;
  }

  const strict = flags.has('--strict');
  let failed = false;
  if (flags.has('--json')) {
    console.log(JSON.stringify(results.map((r) => ({
      file: r.file, error: r.error, valid: r.valid, planks: r.planks ? r.planks.length : 0,
      steps: r.steps ? r.steps.length : 0, diagnostics: r.diagnostics,
      physics: r.physics ? { skipped: r.physics.skipped, stable: r.physics.stable, steps: r.physics.steps } : undefined,
    })), null, 2));
  }
  for (const r of results) {
    const warnings = r.diagnostics ? r.diagnostics.filter((d) => d.severity === 'warning').length : 0;
    const bad = !!r.error || !r.valid || (strict && warnings > 0);
    failed = failed || bad;
    if (flags.has('--json')) continue;
    const rel = path.relative(process.cwd(), r.file);
    const name = rel && !rel.startsWith('..') ? rel : r.file;
    if (r.error) { console.log(`${name}: ${r.error}`); continue; }
    for (const d of r.diagnostics) console.log(`${name}${d.line ? `:${d.line}` : ''}: ${d.code} ${d.message}`);
    const errors = r.diagnostics.filter((d) => d.severity === 'error').length;
    if (r.physics) {
      if (r.physics.skipped) console.log(`${name}: physics skipped, ${r.physics.skipped}`);
      for (const s of r.physics.steps) {
        console.log(`${name}: step ${s.step} ${!s.stands ? 'falls'
          : s.tilt === null ? 'stands (tilt not measured)'
            : `stands, withstands a ${s.tilt.toFixed(1)}° tilt (towards ${s.direction})`}`);
      }
    }
    console.log(`${bad ? '✗' : '✓'} ${name}: ${r.planks.length} plank${r.planks.length === 1 ? '' : 's'}, ${r.steps.length} step${r.steps.length === 1 ? '' : 's'}, ` +
      `${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}` +
      (r.physics ? `, ${r.physics.skipped ? 'physics skipped' : r.physics.stable ? 'stands' : 'FALLS'}` : ''));
  }
  return failed ? 1 : 0;
}

main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
