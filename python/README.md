# PlankMD balance check with compas_cra

An independent counterpart of the JavaScript balance check (`src/physics.js`).
Same question (does the construction stand once every plank is placed?), a
different model and a different solver: Coupled Rigid-Block Analysis
([`compas_cra`](https://github.com/BlockResearchGroup/compas_cra), ETH Zurich
Block Research Group), driven through pyomo and IPOPT. Its job is to
cross-check the JS model, not to replace it.

The Markdown is parsed by the JS reference implementation (`node bin/plankmd.js
expand --json`); this code only turns the plank boxes into a compas assembly.

## Install

Needs Node (for `expand`) and [`uv`](https://docs.astral.sh/uv/). From this
folder:

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt   # compas_cra==0.6.0 and its dependencies
```

No separate solver install: the `compas_cra` wheel ships a statically linked
IPOPT 3.14.19 binary (`compas_cra/_ipopt/bin/ipopt`). Nothing system-wide.

Pitfall (macOS Intel, found on macOS 13): the latest release, `compas_cra`
0.8.0, publishes an x86_64 macOS wheel tagged `macosx_15_0`. On an older macOS
pip ignores it, falls back to the source distribution, and the build fails
("No IPOPT build ... run `invoke setup`"), because 0.8.0 compiles IPOPT into
the package. Release 0.6.0 has a `macosx_11_0_x86_64` wheel with the bundled
IPOPT executable and the same `cra_solve` / `rbe_solve` API, so
`requirements.txt` pins it. On Apple silicon or macOS 14+/15+, or Linux, the
current release should install as is (not tested here).

## Use

```bash
.venv/bin/python plankmd_cra.py ../samples/square-tower.plank.md
.venv/bin/python plankmd_cra.py --both ../test/cases/*.plank.md      # CRA and RBE
.venv/bin/python plankmd_cra.py --incremental file.plank.md          # after every placement (slow)
```

One line per file and method: verdict (`stands` / `falls` / `unknown`), solver
status, wall-clock time (including `node ... expand`). Options: `--rbe`,
`--both`, `--incremental`, `--mu` (default 0.45, as in JS), `--unit` (metres
per u, default 0.0078), `--density`, `--json`, `--verbose`.

## Model

* **Blocks.** One compas `Block` per plank, from the `size` / `center` /
  `axes` of the expand JSON: a box turned in space. Leaning planks (format
  v0.2) touch the ground and each other along edges, which the interfaces
  below do not find: such models come out as falling (the tent sample
  does). Use the drop test for them.
* **Scaffolds.** `--incremental` follows the moves of the expand JSON:
  scaffold planks are blocks while they are in place, and every removal is
  a check point. Without `--incremental`, the finished model has no
  scaffold.
* **Ground.** One fixed support block: a slab whose top is the plane z = 0,
  wider than the construction.
* **Interfaces.** `assembly_interfaces_numpy` from compas_cra finds the
  face-to-face overlaps (`nmax` = every block, since the ground's centroid is
  far from the planks'; `tmax` 1e-6, `amin` 1e-9 m^2). Unlike `physics.js`, it
  finds side contacts too (planks pressed against each other); `physics.js`
  deliberately ignores them (conservative).
* **Friction.** Coulomb, mu = 0.45, linearised by compas_cra with its 8-sided
  pyramid. compas_cra has no torsional friction term; `physics.js` has one.
* **Units.** Metres, 1 u = 0.0078 m, because compas_cra's tolerances (contact
  overlap 1e-4, virtual displacement bound 1e-3) are written for metres.
* **Density.** 1 for CRA (the value its tolerances suit; at 1e3 IPOPT took
  minutes on a 32-plank case). For RBE, `1 / unit^3` (a plank weighs 45, as in
  JS): RBE minimises a quadratic penalty on forces, and with metre-sized
  weights (forces around 1e-5) the penalty is below IPOPT's tolerances, so
  stable cases came out with 1 to 5 percent "tension" and the verdict was noise.
  Density does not change the physics (all planks scale together), only the
  numerics.
* **Verdicts.**
  * CRA (`cra_solve`): IPOPT finds a solution, stands; "locally infeasible",
    falls (compas_cra raises `ValueError(infeasible)`). Anything else is
    `unknown`.
  * RBE (`rbe_solve`, penalty formulation, always feasible): stands if the
    total negative normal force it needs is below 1e-4 of the total weight.
    Stable cases land at 1e-7 or below, falling ones at 1e-2 and above
    (except one non-converged run, below).

## Validation

All reference cases and samples, final state (every plank placed). `Expected`
is the frontmatter `expect:` (the samples have none and must stand). `JS` is
`node bin/plankmd.js validate <file> --physics` (a per-placement check plus
tilt margin for every step, hence not strictly comparable in time). Times are
wall clock, in seconds, on a 4-core Intel Mac that was heavily loaded by other
sessions (load average 20 to 35), so they are upper bounds.

| Case | Planks | Expected | JS RBE | compas_cra CRA | CRA time | compas_cra RBE | RBE time |
|---|---:|---|---|---|---:|---|---:|
| corbel-full-width | 20 | falls | falls | falls | 28 | falls | 1.6 |
| corbel-half-width | 32 | stands | stands | stands | 7.5 | stands | 2.5 |
| overhang-7 | 2 | stands | stands | stands | 0.3 | stands | 0.3 |
| overhang-8 | 2 | falls | falls | falls | 0.3 | falls | 0.2 |
| spiral-around-centre | 24 | stands | stands | stands | 4.3 | stands | 1.6 |
| spiral-around-end | 24 | falls | falls | falls | 12.7 | unknown (IPOPT maxIterations) | 29 |
| standing-plank | 1 | stands | stands | stands | 0.8 | stands | 0.3 |
| samples/level-0 | 4 | stands | stands | stands | 0.7 | stands | 0.3 |
| samples/square-tower | 25 | stands | stands | stands | 24 | stands | 6.1 |
| samples/corbel-bridge | 69 | stands | stands | stands | 114 | stands (borderline, below) | 10 |
| samples/twisted-tower | 72 | stands | stands | stands | 23 | stands | 23 |

JS times for reference: 0 to 2 s for the small cases, 9 s corbel-bridge, 12 s
twisted-tower (they include the tilt margins).

**CRA agrees with the expected verdict and with the JS check on all 11.**
The post-placement mode (`--incremental`) also reproduces the JS diagnostics
where tried: spiral-around-end first fails at plank 3, overhang-8 at plank 2,
corbel-full-width at plank 19 (same planks as `I-unstable` in JS), and
overhang-7 stands after every placement. It was not run on the large samples
(it solves once per plank, which would take hours for CRA).

### Where the two do not simply agree

* **RBE on spiral-around-end: no verdict.** IPOPT stops at its iteration limit
  without converging (the penalty problem is badly conditioned for a
  construction that cannot be balanced), so it is reported `unknown`, not
  `falls`. With the first (unscaled, density 1) setting it did converge, to
  a clearly positive tension; how this penalty method behaves on an
  unbalanceable model is a numerical matter, which is why CRA is the headline
  verdict.
* **RBE on corbel-bridge is borderline.** Total tension 3.0e-2 for a weight of
  3.1e3 (1e-5 relative), under the 1e-4 threshold but two orders of magnitude
  above every other stable case (at most 1e-7). The penalty method leaves
  small residual tension on a large model that still stands (CRA and JS both
  say stands); the threshold is a numerical convention, not a physical
  quantity.
* **Modelling differences with `physics.js`** (no verdict differs, but they
  matter for margins): compas_cra includes side contacts and has no torsional
  friction; its friction is the 8-sided pyramid of the CRA paper, `physics.js`
  uses a 4-sided pyramid plus a torsion bound. `physics.js` solves one LP
  (exact at the corners); CRA is a nonlinear program (IPOPT, local solution)
  with a kinematic coupling (contact overlap eps = 1e-4 m, i.e. 0.013 u),
  which is why CRA is much slower on large constructions. There is no tilt
  margin here.
* **Numerics.** Both formulations are scale sensitive (density, unit): the
  settings above were chosen for convergence, then the verdicts checked
  against the references; none was adjusted to flip a verdict.

## Files

* `plankmd_cra.py`: the checker and its CLI.
* `requirements.txt`: pinned dependencies (freeze of a working venv).
* `.gitignore`: the venv and caches.
