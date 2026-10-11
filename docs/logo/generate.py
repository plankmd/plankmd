"""Draws the PlankMD logo: three layers of a log-cabin square, seen in
isometric view, with the planks crossing like a Markdown "#".

    python3 docs/logo/generate.py 2 > docs/logo/plankmd.svg
    python3 docs/logo/generate.py 8 '#f6f3ee' > docs/logo/plankmd-avatar.svg

The first argument is the padding (in a 64 x 64 box), the second an optional
background colour. Copy plankmd.svg to site/public/logo.svg;
site/public/logo-wide.svg is the same drawing with its viewBox cropped to the
planks, for the home page.
"""
import math, sys

boxes = [  # (x, y, z, dx, dy, dz, accent)
  (0, 1.5, 0, 15, 3, 1, False),
  (0, 10.5, 0, 15, 3, 1, False),
  (1.5, 0, 1, 3, 15, 1, False),
  (10.5, 0, 1, 3, 15, 1, False),
  (0, 1.5, 2, 15, 3, 1, False),
  (0, 10.5, 2, 15, 3, 1, True),
]
c, s = math.cos(math.radians(30)), math.sin(math.radians(30))
def P(x, y, z): return ((x - y) * c, (x + y) * s - z * 1.0)
WOOD = dict(top='#e8c48d', sx='#cf9f5f', sy='#ad7d40')
RED = dict(top='#d0574a', sx='#b03a2e', sy='#8c2c22')
EDGE = '#5f3c12'
H = 1.6  # plank thickness, slightly exaggerated so it reads at small sizes
polys = []
for (x, y, z, dx, dy, dz, acc) in sorted(boxes, key=lambda b: (b[2], b[0] + b[1])):
  z0, z1 = z * H, (z + dz) * H
  col = RED if acc else WOOD
  top = [P(x, y, z1), P(x + dx, y, z1), P(x + dx, y + dy, z1), P(x, y + dy, z1)]
  sx = [P(x + dx, y, z0), P(x + dx, y + dy, z0), P(x + dx, y + dy, z1), P(x + dx, y, z1)]
  sy = [P(x, y + dy, z0), P(x + dx, y + dy, z0), P(x + dx, y + dy, z1), P(x, y + dy, z1)]
  polys += [(sx, col['sx']), (sy, col['sy']), (top, col['top'])]
xs = [p[0] for poly, _ in polys for p in poly]; ys = [p[1] for poly, _ in polys for p in poly]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
w, h = maxx - minx, maxy - miny
size = 64
pad = float(sys.argv[1]) if len(sys.argv) > 1 else 3
k = (size - 2 * pad) / max(w, h)
ox = (size - w * k) / 2 - minx * k; oy = (size - h * k) / 2 - miny * k
bg = sys.argv[2] if len(sys.argv) > 2 else ''
out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="PlankMD">']
if bg: out.append(f'  <rect width="{size}" height="{size}" rx="{size*0.18:.1f}" fill="{bg}"/>')
out.append(f'  <g stroke="{EDGE}" stroke-width="{0.9 if not bg else 0.8}" stroke-linejoin="round">')
for poly, fill in polys:
  pts = ' '.join(f'{px * k + ox:.2f},{py * k + oy:.2f}' for px, py in poly)
  out.append(f'    <polygon points="{pts}" fill="{fill}"/>')
out.append('  </g>\n</svg>')
print('\n'.join(out))
