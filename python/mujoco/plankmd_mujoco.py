#!/usr/bin/env python3
"""PlankMD drop test with compliant contacts (MuJoCo). Prototype, not shipped.

The same question as ``src/drop.js`` (drop the finished model, see what moves),
asked of an engine whose contacts are soft: two bodies may sink into each other
a little, with a stiffness set by MuJoCo's ``solref`` / ``solimp``. The point
is to see whether that give, which wood has and a rigid engine (Rapier) does
not, changes verdicts that hang on edge contacts, such as the fan arch.

MIT License.

Input is ``node bin/plankmd.js expand --json``: one box per plank (``size``,
``center``, ``axes``), scaffolds left out unless ``--scaffolds``.

Scale and thresholds are those of drop.js: 1 u = 1 m, ordinary gravity,
6 s simulated, friction 0.45, density 450; a plank that moved more than
0.5 u or turned more than 3 degrees has moved, and it fell if it went more
than 4 u, turned more than 6 degrees, or is still moving at the end.

Softness. MuJoCo's contact is a spring-damper in acceleration units: the
``solref`` time constant sets how far a resting body sinks under gravity
(roughly g * timeconst**2 for an isolated contact). At 1 u = 1 m, a sink of
d u is d * 7.8 mm for real planks. The script measures the deepest
penetration among all contacts after the model has settled and prints it in
real millimetres, so a setting can be judged by the give it actually gives.

    python plankmd_mujoco.py ../../samples/square-tower.plank.md
    python plankmd_mujoco.py --timeconst 0.05 ../../samples/fan-arch.plank.md
    python plankmd_mujoco.py --shrink 1 --conform 1.75 ../../samples/fan-arch.plank.md

Boxes are convex meshes (MuJoCo's box primitive loses parallel edge-on-edge
contacts) and friction runs with 10 noslip iterations (soft friction creeps).
``--conform`` fills fan joints over a band, as crushed wood would bear: see
README.md for what it showed.
"""

import argparse
import json
import math
import os
import subprocess
import sys

import mujoco
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CLI = os.path.join(ROOT, "bin", "plankmd.js")
UNIT_MM = 7.8  # real millimetres per u

DEFAULTS = dict(
    seconds=6.0,
    timestep=1 / 240,
    friction=0.45,
    density=450.0,
    moved_u=0.5,
    moved_degrees=3.0,
    fell_u=4.0,
    fell_degrees=6.0,
    moving_speed=0.3,
    moving_spin=3.0,
    shrink=0.995,  # drop.js narrows box x and y by this factor
)


def expand(path):
    out = subprocess.run(["node", CLI, "expand", path, "--json"], capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError("plankmd expand failed for %s:\n%s%s" % (path, out.stdout, out.stderr))
    return json.loads(out.stdout)


def expected(path):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if text.startswith("---"):
        for line in text.split("---", 2)[1].splitlines():
            if line.strip().startswith("expect:"):
                return line.split(":", 1)[1].strip()
    return None


def frame(p):
    """Rotation matrix (columns = the box's axes) in PlankMD axes, z up."""
    if p.get("axes"):
        x = np.array(p["axes"][0], float)
        y = np.array(p["axes"][1], float)
    else:
        a = math.radians(p.get("rotation") or 0.0)
        x = np.array([math.cos(a), math.sin(a), 0.0])
        y = np.array([-math.sin(a), math.cos(a), 0.0])
    return np.column_stack([x, y, np.cross(x, y)])


def quat(m):
    q = np.zeros(4)
    mujoco.mju_mat2Quat(q, m.flatten())
    return q


def fan_shims(planks, depth):
    """Wedge shims that close every fan joint from the intrados out to `depth` (u).

    Two planks in a fan (same long axis, turned a few degrees from each other,
    sharing their inner edge) touch only along that edge. Wood that crushes a
    little there bears over a band instead: a shim fixed to one plank, filling
    the wedge-shaped gap over `depth`, stands in for that band. Returns, per
    plank index, the shims' vertices in the plank's own axes.
    """
    shims = {}
    frames = [frame(p) for p in planks]
    for i, a in enumerate(planks):
        for j in range(i + 1, len(planks)):
            b = planks[j]
            ra, rb = frames[i], frames[j]
            if abs(ra[:, 1] @ rb[:, 1]) < 0.999 or abs(a["size"][1] - b["size"][1]) > 1e-6:
                continue
            turn = math.degrees(math.acos(min(1.0, abs(ra[:, 0] @ rb[:, 0]))))
            if not 1 <= turn <= 15:
                continue
            ca, cb = np.array(a["center"], float), np.array(b["center"], float)
            sa = 1 if (cb - ca) @ ra[:, 0] > 0 else -1
            sb = 1 if (ca - cb) @ rb[:, 0] > 0 else -1
            ea = ca + sa * ra[:, 0] * a["size"][0] / 2 - ra[:, 2] * a["size"][2] / 2
            eb = cb + sb * rb[:, 0] * b["size"][0] / 2 - rb[:, 2] * b["size"][2] / 2
            off = eb - ea
            off -= (off @ ra[:, 1]) * ra[:, 1]
            if np.linalg.norm(off) > 0.02 or depth >= min(a["size"][2], b["size"][2]):
                continue
            y = ra[:, 1] * a["size"][1] / 2
            tri = [ea, ea + ra[:, 2] * depth, eb + rb[:, 2] * depth]
            verts = [ra.T @ (v + k * y - ca) for v in tri for k in (-1, 1)]
            shims.setdefault(i, []).append(verts)
    return shims


def build_xml(planks, o):
    """MJCF: a ground plane and one free box per plank (PlankMD axes, z up, 1 u = 1 m)."""
    solref = "%g %g" % (o["timeconst"], o["dampratio"]) if o["timeconst"] else None
    solimp = " ".join("%g" % v for v in o["solimp"]) if o["solimp"] else None
    contact = ""
    if solref:
        contact += ' solref="%s"' % solref
    if solimp:
        contact += ' solimp="%s"' % solimp
    bodies, meshes = [], {}
    shims = fan_shims(planks, o["conform"]) if o["conform"] else {}
    extra = []  # shim meshes
    for i, p in enumerate(planks):
        sx, sy, sz = p["size"]
        # As drop.js: a little narrower, so that planks side by side do not start pressed together.
        half = (sx / 2 * o["shrink"], sy / 2 * o["shrink"], sz / 2)
        pos = " ".join("%.9g" % v for v in p["center"])
        q = " ".join("%.12g" % v for v in quat(frame(p)))
        if o["mesh"]:
            # MuJoCo's box-box collider loses parallel edge-on-edge contacts (the tent's
            # ridge line): a box mesh goes through the general convex collider instead.
            key = "m%d" % len(meshes) if half not in meshes else meshes[half]
            meshes.setdefault(half, key)
            geom = '<geom type="mesh" mesh="%s"/>' % meshes[half]
        else:
            geom = '<geom type="box" size="%.9g %.9g %.9g"/>' % half
        for verts in shims.get(i, []):
            name = "s%d" % len(extra)
            extra.append('<mesh name="%s" vertex="%s"/>' % (name, " ".join("%.9g" % c for v in verts for c in v)))
            geom += '<geom type="mesh" mesh="%s"/>' % name
        bodies.append('<body name="p%d" pos="%s" quat="%s"><freejoint/>%s</body>' % (i, pos, q, geom))
    assets = []
    for (hx, hy, hz), key in meshes.items():
        verts = " ".join("%.9g %.9g %.9g" % (a * hx, b * hy, c * hz)
                         for a in (-1, 1) for b in (-1, 1) for c in (-1, 1))
        assets.append('<mesh name="%s" vertex="%s"/>' % (key, verts))
    assets += extra
    return """<mujoco>
  <option timestep="{ts}" gravity="0 0 -9.81" cone="{cone}" impratio="{impratio}"
          iterations="{it}" ls_iterations="{lsit}" noslip_iterations="{noslip}">
    <flag multiccd="{multiccd}"/>
  </option>
  <asset>{assets}</asset>
  <default><geom friction="{mu} 0.005 0.0001" density="{rho}" condim="3" margin="0"{contact}/></default>
  <worldbody>
    <geom name="ground" type="plane" size="0 0 1"/>
    {bodies}
  </worldbody>
</mujoco>""".format(
        ts=o["timestep"], mu=o["friction"], rho=o["density"], contact=contact, bodies="\n    ".join(bodies), assets="".join(assets),
        cone=o["cone"], impratio=o["impratio"], it=o["iterations"], lsit=o["ls_iterations"], noslip=o["noslip"],
        multiccd="enable" if o["mesh"] else "disable",
    )


def angle(q0, q1):
    dot = abs(float(np.dot(q0, q1)))
    return 2 * math.degrees(math.acos(min(1.0, dot)))


def deepest(model, data):
    """Deepest penetration among current contacts, in u (0 if none)."""
    d = 0.0
    for c in data.contact[: data.ncon]:
        d = max(d, -c.dist)
    return d


def drop(planks, **options):
    o = dict(DEFAULTS, timeconst=None, dampratio=1.0, solimp=None, cone="elliptic", impratio=1,
             iterations=100, ls_iterations=50, noslip=10, mesh=True, conform=None)
    o.update({k: v for k, v in options.items() if v is not None})
    model = mujoco.MjModel.from_xml_string(build_xml(planks, o))
    data = mujoco.MjData(model)
    mujoco.mj_forward(model, data)
    pos0 = data.xpos[1:].copy()
    quat0 = data.xquat[1:].copy()
    steps = int(round(o["seconds"] / o["timestep"]))
    settle = int(round(min(1.0, o["seconds"] / 2) / o["timestep"]))
    sink = 0.0
    for k in range(steps):
        mujoco.mj_step(model, data)
        if k == settle:
            sink = deepest(model, data)
    sink_end = deepest(model, data)
    moved, settled = [], []
    vel = np.zeros(6)
    for i, p in enumerate(planks):
        dist = float(np.linalg.norm(data.xpos[i + 1] - pos0[i]))
        turn = angle(data.xquat[i + 1], quat0[i])
        if dist <= o["moved_u"] and turn <= o["moved_degrees"]:
            continue
        mujoco.mj_objectVelocity(model, data, mujoco.mjtObj.mjOBJ_BODY, i + 1, vel, 0)
        moving = (np.linalg.norm(vel[3:]) > o["moving_speed"]
                  or math.degrees(np.linalg.norm(vel[:3])) > o["moving_spin"])
        fell = dist > o["fell_u"] or turn > o["fell_degrees"] or moving
        (moved if fell else settled).append(dict(n=p.get("n"), distance=dist, degrees=turn))
    return dict(stood=not moved, moved=moved, settled=settled, sink_mm=sink * UNIT_MM, sink_end_mm=sink_end * UNIT_MM)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("files", nargs="+")
    ap.add_argument("--timeconst", type=float, help="solref time constant in s (MuJoCo default 0.02)")
    ap.add_argument("--dampratio", type=float, help="solref damping ratio (default 1)")
    ap.add_argument("--solimp", type=float, nargs=5, metavar=("D0", "DW", "WIDTH", "MID", "POW"),
                    help="solimp (MuJoCo default 0.9 0.95 0.001 0.5 2)")
    ap.add_argument("--friction", type=float)
    ap.add_argument("--seconds", type=float)
    ap.add_argument("--timestep", type=float)
    ap.add_argument("--cone", choices=["pyramidal", "elliptic"])
    ap.add_argument("--noslip", type=int, help="noslip iterations (default 10: removes the creep of soft friction)")
    ap.add_argument("--shrink", type=float, help="factor on box x and y (drop.js: 0.995; 1 = exact planks)")
    ap.add_argument("--conform", type=float, metavar="DEPTH",
                    help="fill fan joints from the inner edge out to DEPTH u, as crushed wood would bear")
    ap.add_argument("--boxes", action="store_true", help="MuJoCo's box primitive instead of box meshes")
    ap.add_argument("--scaffolds", action="store_true", help="keep the scaffolds of the finished model")
    ap.add_argument("--upto-step", type=int, help="drop only the planks of steps 1..N")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    rows = []
    for path in a.files:
        doc = expand(path)
        planks = [p for p in doc["planks"] if a.upto_step is None or p.get("step", 0) <= a.upto_step]
        if a.scaffolds:
            planks += doc.get("scaffolds") or []
        r = drop(planks, timeconst=a.timeconst, dampratio=a.dampratio, solimp=a.solimp, friction=a.friction,
                 seconds=a.seconds, timestep=a.timestep, cone=a.cone, noslip=a.noslip, mesh=not a.boxes, shrink=a.shrink, conform=a.conform)
        r.update(file=os.path.relpath(path, ROOT), expect=expected(path), planks=len(planks))
        rows.append(r)
        if not a.json:
            verdict = "stands" if r["stood"] else "falls"
            mark = "" if r["expect"] is None else ("  ok" if r["expect"] == verdict else "  MISMATCH (expect %s)" % r["expect"])
            far = max((m["distance"] for m in r["moved"]), default=0)
            print("%-44s %3d planks  %-6s%s  moved %d (max %.1f u), settled %d, sink %.3f / %.3f mm"
                  % (r["file"], r["planks"], verdict, mark, len(r["moved"]), far, len(r["settled"]),
                     r["sink_mm"], r["sink_end_mm"]))
            sys.stdout.flush()
    if a.json:
        print(json.dumps(rows, indent=1))


if __name__ == "__main__":
    main()
