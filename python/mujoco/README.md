# Drop test with compliant contacts (MuJoCo prototype)

A prototype, outside the shipped code: the drop test of `src/drop.js`, run in
[MuJoCo](https://mujoco.org), whose contacts are soft (bodies sink into each
other a little, with a stiffness set by `solref` / `solimp`). It was written to
answer one question: can a fan arch of identical planks
(`samples/fan-arch.plank.md`, which falls in Rapier once its centring is gone)
stand once the planks may give a little, as wood does?

Short answer: **no, not with any plausible give.** It stands only if every
joint bears over at least 1.75 u of the plank's 3 u width. That takes about
1.2 mm of crushing at the inner edge of every joint, and the arch's own weight
crushes pine by orders of magnitude less.

## Install and run

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python plankmd_mujoco.py ../../samples/square-tower.plank.md
.venv/bin/python plankmd_mujoco.py --shrink 1 --conform 1.75 ../../samples/fan-arch.plank.md
```

`mujoco` 3.3.0 is pinned: it is the last release with an x86_64 macOS wheel
that installs on macOS 13 (later ones fall back to a source build that needs
`MUJOCO_PATH`).

## What it does

Same input as `python/plankmd_cra.py` (`node bin/plankmd.js expand --json`),
same conventions as `src/drop.js`: 1 u = 1 m, ordinary gravity, 6 s, friction
0.45, density 450, boxes 0.5 % narrower in x and y (`--shrink`), the finished
model dropped with scaffolds left out, and the same thresholds (moved: > 0.5 u
or > 3°; fell: > 4 u, > 6°, or still moving). PlankMD axes are used as is (z up).

Two engine settings matter:

* **Boxes are convex meshes**, not MuJoCo's box primitive (`--boxes` to go
  back). The box-box collider loses parallel edge-on-edge contacts; with it,
  the tops of two leaning planks pass through each other.
* **`noslip` 10.** MuJoCo's friction is soft too: under a steady sideways load
  it creeps. A true wedge arch sank at a steady 0.08 u/s without it, and stays
  put with it (it settles by 0.08 u, then stops).

The deepest penetration among all contacts, 1 s in and at the end, is printed
in real millimetres (u × 7.8) as `sink`. That shows how much give a setting
actually produces.

`--conform DEPTH` stands in for wood that crushes at a fan joint. Two planks in
a fan touch only along their inner edge, with a wedge-shaped gap that opens
outwards (5° here). Wood that crushed there would bear over a band instead of
a line. The option fixes a thin wedge to one plank of every fan joint (same
long axis, turned 1 to 15°, sharing the inner edge), filling the gap from the
inner edge out to `DEPTH` u. At full depth (3 u) the planks are stone
voussoirs. The crushing that the band stands for is `DEPTH × tan 5°`.

## Agreement with Rapier

| Model | Rapier / expected | MuJoCo |
| --- | --- | --- |
| test/cases (7 files) | as `expect:` | 7/7 agree |
| square-tower | stands | stands |
| diving-board, steps 1–2 / step 3 / finished | stands / falls / stands | same |
| tent | stands | **falls** |

Each run takes 0.5 to 6 s.

The tent is the one disagreement, and it is not about softness. The walls stand
on their own (`--upto-step 1`). With the ridge on, the tops of each pair, which
meet corner to corner, slip past each other. That holds with soft and stiff
contacts, a 1 ms timestep, both cones and noslip. It stands with friction 0.8
and the box primitive, and falls with friction 0.8 and meshes. A corner
meeting a corner has no defined contact normal, so each engine picks its own
and the verdict follows.

## The fan arch

37 voussoirs, 45 planks without the centring.

**Softness alone changes nothing.** The arch falls with MuJoCo's default
contacts and with every setting tried: `solref` time constants from 0.005 s
to 0.15 s, damping ratio 3, three `solimp` shapes, and friction 0.8. The
`sink` ranged from 0.03 mm to 6 mm, already far softer than pine. 32 to 37
planks fall each time. The crown comes down at almost free-fall rate from the
first instant: 0.20 u in 0.2 s, where ½gt² gives 0.196.

That is what statics predicts. Each joint touches only along its inner edge,
so it is a hinge on the intrados. The thrust line would have to follow the
circular intrados, which is not a funicular for the arch's weight. A
semicircular arch needs a ring at least about 0.107 R thick (Heyman), here
about 1.3 u. Sinking at a point contact adds no lever arm, so no stiffness
setting can supply that ring.

**Bearing width decides.** With exact plank thickness (`--shrink 1`):

| `--conform` (u) | crushing it stands for | verdict |
| --- | --- | --- |
| 2.9 (≈ stone wedges) | 2.0 mm | stands |
| 2.0 | 1.4 mm | stands |
| 1.75 | 1.2 mm | stands |
| 1.6 | 1.1 mm | falls |
| 1.5, 1.0, 0.75, 0.5, none | ≤ 1.0 mm | falls |

The threshold barely depends on the rest:

* With conform 2, the arch stands with `solref` 0.005 s and with 0.05 s
  (0.8 mm sink), and with the drop.js shrink.
* With conform 2 and friction 0.3, it falls: the joints slide.
* With conform 1.5 and friction 0.8, it still falls.

It agrees with Heyman's thickness: the joints need a band of about 1.3 u
plus some margin.

**Is 1.2 mm of crushing plausible? No.** 37 voussoirs of about 9.6 g weigh
about 3.5 N, so the thrust at a joint is of the order of 1 N. Spread over a
13 mm × 117 mm band, that is about 0.001 MPa. Pine crushes across the grain
at about 4–6 MPa, and its elastic modulus across the grain (about 400 MPa)
gives sub-micrometre strains. Turning the faces of a joint into contact over
13 mm would take stresses about 10⁵ times larger than the arch produces. So
the real arches photographed standing owe it to something else, not to the
wood's compliance. Some candidates, none tested here: planks that are not
true rectangles (rounded or bevelled edges, slight wedging), arches several
planks deep with staggered joints, and loads on the extrados that move the
thrust line.

## Notes

* `drop.js` narrows every box by 0.5 % in its own x and y. For a flat plank
  that is the footprint, but for a plank on its edge in a fan, x is the
  thickness. So every voussoir is thinner, every joint opens 0.009 u
  (0.07 mm), and the ring is about 0.33 u short around its curve. Here the
  arch falls with or without the shrink, so it does not decide this verdict.
  It could matter for other models that bear through a plank's thickness.
* The sanity run with the centring kept in (`--scaffolds`, 110 planks) took
  almost 5 minutes, without noslip. 24 planks counted as fallen but moved at
  most 1 u, probably the centring settling. It was not run again.
