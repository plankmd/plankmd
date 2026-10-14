#!/usr/bin/env python3
"""PlankMD balance check built on compas_cra (Coupled Rigid-Block Analysis).

An independent counterpart of ``src/physics.js``: the same question (does the
construction stand once every plank is placed?), answered with the CRA / RBE
solvers of the ETH Zurich Block Research Group, driven through pyomo and IPOPT.

MIT License.

Input is the output of ``plankmd expand --json``; the Markdown is parsed by the
JavaScript reference implementation, never here.

    python plankmd_cra.py samples/square-tower.plank.md
    python plankmd_cra.py --rbe --incremental test/cases/*.plank.md

Units. compas_cra's tolerances (contact overlap eps = 1e-4, virtual displacement
bound 1e-3, minimum interface area) are written for lengths in metres, so the
model is built in metres: 1 u = 7.8 mm = 0.0078 m (``--unit``), a plank is
0.117 x 0.0234 x 0.0078 m. Density is 1 for CRA (the value its tolerances are
tuned for; raising it to 1e3 makes IPOPT stall for minutes) and 1 / unit**3 for RBE, so a
plank weighs its volume in u^3 (45) as in the JS model. RBE's objective is a penalty on
forces: with forces of 1e-5 (density 1 in metres) it falls below IPOPT's tolerances and
the verdict is noise (stable cases reported with 1-5 % tension, see README).

Ground. The ground is one fixed support block, a slab whose top face is the
plane z = 0, larger than the whole construction.

Verdicts.
  * CRA  (``cra_solve``): a solution exists (IPOPT reports optimal) -> stands;
    the problem is infeasible -> falls. Any other IPOPT outcome is reported as
    ``unknown`` and counted as not standing.
  * RBE  (``rbe_solve``): penalty formulation, always feasible; the construction
    stands if the total "tension" (negative normal force) it needs is zero
    (below ``TENSION_TOL`` times the total weight).
"""

import argparse
import contextlib
import io
import json
import math
import os
import subprocess
import sys
import time

MU = 0.45  # pine on pine, dry: same as src/physics.js
UNIT = 0.0078  # metres per u (plank thickness)
TENSION_TOL = 1e-4  # RBE: relative tension tolerated before calling it "falls"

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CLI = os.path.join(ROOT, "bin", "plankmd.js")


# ------------------------------------------------------------------ input

def expand(path):
    """Runs ``node bin/plankmd.js expand <path> --json`` and returns the document."""
    out = subprocess.run(["node", CLI, "expand", path, "--json"], capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError("plankmd expand failed for %s:\n%s%s" % (path, out.stdout, out.stderr))
    return json.loads(out.stdout)


def expected(path):
    """The ``expect:`` value of the frontmatter, or None."""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if text.startswith("---"):
        for line in text.split("---", 2)[1].splitlines():
            if line.strip().startswith("expect:"):
                return line.split(":", 1)[1].strip()
    return None


# ------------------------------------------------------------------ model

def build_assembly(planks, unit=UNIT):
    """A CRA_Assembly: node 0 is the fixed ground, nodes 1..n the planks in placement order."""
    from compas.geometry import Box, Frame
    from compas_assembly.datastructures import Block
    from compas_cra.datastructures import CRA_Assembly

    assembly = CRA_Assembly()

    # Ground: a slab, top face at z = 0, 1 u thick, 2 u wider than the construction on every side.
    reach = 0.0
    for p in planks:
        half = 0.5 * math.hypot(p["size"][0], p["size"][1])
        reach = max(reach, abs(p["center"][0]) + half, abs(p["center"][1]) + half)
    side = (2 * reach + 4) * unit
    ground = Box(side, side, unit, frame=Frame([0, 0, -0.5 * unit], [1, 0, 0], [0, 1, 0]))
    assembly.add_block(Block.from_shape(ground), node=0)
    assembly.set_boundary_conditions([0])

    for i, p in enumerate(planks, start=1):
        c = [v * unit for v in p["center"]]
        if p.get("axes"):
            # The box's own axes: planks turned by rot, and leaning planks.
            frame = Frame(c, p["axes"][0], p["axes"][1])
        else:
            a = math.radians(p.get("rotation") or 0.0)
            frame = Frame(c, [math.cos(a), math.sin(a), 0], [-math.sin(a), math.cos(a), 0])
        sx, sy, sz = (v * unit for v in p["size"])
        assembly.add_block(Block.from_shape(Box(sx, sy, sz, frame=frame)), node=i)
    return assembly


def _quiet(verbose):
    return contextlib.nullcontext() if verbose else contextlib.redirect_stdout(io.StringIO())


def solve(planks, method="cra", mu=MU, unit=UNIT, verbose=False, density=None):
    """Returns (verdict, status). verdict is True / False / None (solver gave up)."""
    from compas_cra.algorithms import assembly_interfaces_numpy
    from compas_cra.equilibrium import cra_solve, rbe_solve

    if density is None:
        # CRA is tuned for lengths in metres and density 1 (at 1e3 IPOPT stalls for minutes
        # on a 32-plank case); RBE needs forces of order 1 or its penalty drowns in noise.
        density = 1.0 if method == "cra" else 1.0 / unit ** 3
    assembly = build_assembly(planks, unit)
    # tmax: how far a face may stray from the plane of the facing face (length unit);
    # amin: smallest interface area kept (m^2); well below a plank's smallest overlap.
    # nmax = every block: the ground's centroid is far from the planks', and the default
    # nearest-neighbour search would miss it.
    n = assembly.number_of_blocks() if hasattr(assembly, "number_of_blocks") else len(planks) + 1
    with _quiet(verbose):
        assembly_interfaces_numpy(assembly, nmax=n, tmax=1e-6, amin=1e-9 * (unit / UNIT) ** 2)
    interfaces = sum(len(assembly.graph.edge_attribute(e, "interfaces") or []) for e in assembly.graph.edges())

    if method == "cra":
        try:
            with _quiet(verbose):
                cra_solve(assembly, mu=mu, density=density, verbose=False)
        except ValueError as err:
            text = str(err)
            return (False if "infeasible" in text.lower() else None), "%s (%d interfaces)" % (text, interfaces)
        return True, "optimal (%d interfaces)" % interfaces

    # RBE
    try:
        with _quiet(verbose):
            rbe_solve(assembly, mu=mu, density=density, verbose=False)
    except ValueError as err:  # IPOPT gave up (e.g. maxIterations): no verdict
        return None, "%s (%d interfaces)" % (err, interfaces)
    weight = density * sum(assembly.graph.node_attribute(k, "block").volume() for k in assembly.graph.nodes() if k != 0)
    tension = 0.0
    for edge in assembly.graph.edges():
        for itf in assembly.graph.edge_attribute(edge, "interfaces") or []:
            for f in itf.forces or []:
                tension += f["c_nn"] or 0.0
    ok = tension <= TENSION_TOL * weight
    return ok, "tension %.2e of weight %.2e (%d interfaces)" % (tension, weight, interfaces)


def check(path, method="cra", mu=MU, unit=UNIT, incremental=False, verbose=False, density=None):
    """Checks a file. Returns a dict with verdict, status, seconds and (if incremental) first failing plank."""
    t0 = time.time()
    doc = expand(path)
    planks = doc["planks"]
    result = {"file": path, "planks": len(planks)}
    if incremental:
        # Follow the moves: scaffold planks are in place until they are removed.
        scaffolds = doc.get("scaffolds", [])
        moves = doc.get("moves") or [{"move": n, "kind": "plank", "n": n} for n in range(1, len(planks) + 1)]
        present, failed_at, failed_move = [], None, None
        for m in moves:
            if m["kind"] == "plank":
                present.append(planks[m["n"] - 1])
            elif m["kind"] == "scaffold":
                present.append(scaffolds[m["s"] - 1])
            else:
                gone = {id(scaffolds[s - 1]) for s in m["s"]}
                present = [p for p in present if id(p) not in gone]
            ok, status = solve(present, method, mu, unit, verbose, density)
            if not ok:
                failed_move = m
                failed_at = sum(1 for x in moves[:m["move"]] if x["kind"] == "plank")
                break
        where = None
        if failed_move is not None:
            where = ("plank %d" % failed_move["n"] if failed_move["kind"] == "plank"
                     else "scaffold %d" % failed_move["s"] if failed_move["kind"] == "scaffold"
                     else "the removal of scaffolds %s" % ", ".join(map(str, failed_move["s"])))
        result.update(verdict=failed_at is None, status="after every placement" if failed_move is None
                      else "first fails at %s: %s" % (where, status), failed_at=failed_at)
        if failed_at is None:
            result["verdict"] = True
    else:
        ok, status = solve(planks, method, mu, unit, verbose, density)
        result.update(verdict=ok, status=status)
    result["seconds"] = time.time() - t0
    return result


def label(v):
    return "stands" if v else ("falls" if v is False else "unknown")


def main(argv=None):
    ap = argparse.ArgumentParser(description="PlankMD balance check with compas_cra (CRA / RBE).")
    ap.add_argument("files", nargs="+", help=".plank.md files")
    ap.add_argument("--rbe", action="store_true", help="use rbe_solve instead of cra_solve")
    ap.add_argument("--both", action="store_true", help="run CRA and RBE")
    ap.add_argument("--incremental", action="store_true", help="check after every placement (slow)")
    ap.add_argument("--mu", type=float, default=MU, help="friction coefficient (default 0.45)")
    ap.add_argument("--unit", type=float, default=UNIT, help="metres per u (default 0.0078)")
    ap.add_argument("--density", type=float, default=None, help="override the density (see module doc)")
    ap.add_argument("--verbose", action="store_true", help="show solver output")
    ap.add_argument("--json", action="store_true", help="print one JSON object per line")
    args = ap.parse_args(argv)

    methods = ["cra", "rbe"] if args.both else (["rbe"] if args.rbe else ["cra"])
    for path in args.files:
        for m in methods:
            try:
                r = check(path, m, args.mu, args.unit, args.incremental, args.verbose, args.density)
            except Exception as err:  # keep going over the other files
                r = {"file": path, "verdict": None, "status": "error: %s" % err, "seconds": 0.0, "planks": 0}
            r["method"] = m
            if args.json:
                print(json.dumps(r))
            else:
                print("%-40s %-4s %-8s %6.1fs  %s" % (os.path.basename(path), m.upper(), label(r["verdict"]),
                                                      r["seconds"], r["status"]))
                sys.stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
