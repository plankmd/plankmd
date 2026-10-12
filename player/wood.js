/*!
 * PlankMD player: a pine wood texture for the planks, drawn in a canvas (no
 * image to download), and box UVs that make the grain run along the length
 * of every face. MIT License. Browser only: needs three.js (window.THREE),
 * defines window.PlankMDWood.
 */
(function (root) {
  'use strict';

  const WOOD = '#e3bf86'; // the default plank colour of src/plankmd.js
  // The texture covers 15 u along the grain and 15 / 8 u across it.
  const LENGTH = 15, WIDTH = LENGTH / 8;

  // A small seeded random generator: the same grain on every page load.
  function random(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Pine grain, almost white: it multiplies the colour of each plank, so that
   * natural planks look like pine and coloured ones like painted wood.
   */
  function canvas() {
    const w = 1024, h = 128;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = '#fbf3e4';
    g.fillRect(0, 0, w, h);
    const rnd = random(7);
    // Growth rings seen from the side: long wavy lines along the grain.
    for (let i = 0; i < 38; i++) {
      const y0 = rnd() * h, amp = 1 + rnd() * 4, freq = (1 + rnd() * 3) * (Math.PI * 2) / w, phase = rnd() * 6;
      const dark = 0.08 + rnd() * 0.16;
      g.strokeStyle = `rgba(140, 92, 40, ${dark})`;
      g.lineWidth = 0.6 + rnd() * 1.8;
      g.beginPath();
      for (let x = -8; x <= w + 8; x += 8) {
        const y = y0 + amp * Math.sin(x * freq + phase) + 1.5 * Math.sin(x * freq * 3.1 + phase * 2);
        if (x < 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    // A couple of small knots, with the grain bending around them.
    for (let k = 0; k < 2; k++) {
      const x = 150 + rnd() * (w - 300), y = 25 + rnd() * (h - 50), r = 4 + rnd() * 5;
      const grad = g.createRadialGradient(x, y, 0, x, y, r * 2.2);
      grad.addColorStop(0, 'rgba(110, 66, 24, 0.55)');
      grad.addColorStop(0.45, 'rgba(140, 92, 40, 0.30)');
      grad.addColorStop(1, 'rgba(140, 92, 40, 0)');
      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(x, y, r * 2.2, r * 1.4, 0, 0, Math.PI * 2);
      g.fill();
    }
    return c;
  }

  let shared = null;
  /** The texture, created once per page. */
  function texture(THREE) {
    if (!shared) {
      shared = new THREE.CanvasTexture(canvas());
      shared.wrapS = shared.wrapT = THREE.RepeatWrapping;
      shared.anisotropy = 4;
    }
    return shared;
  }

  /**
   * Rewrites the UVs of a box geometry so that on every face the texture's
   * length runs along the longer side, at the same scale on every plank.
   */
  function grainUVs(geometry) {
    const pos = geometry.attributes.position, uv = geometry.attributes.uv;
    for (let f = 0; f < pos.count; f += 4) {
      const pts = [0, 1, 2, 3].map((k) => [pos.getX(f + k), pos.getY(f + k), pos.getZ(f + k)]);
      const span = [0, 1, 2].map((a) => Math.max(...pts.map((p) => p[a])) - Math.min(...pts.map((p) => p[a])));
      const axes = [0, 1, 2].filter((a) => span[a] > 1e-6).sort((a, b) => span[b] - span[a]);
      const [long, short] = axes;
      const min = [0, 1, 2].map((a) => Math.min(...pts.map((p) => p[a])));
      for (let k = 0; k < 4; k++) {
        uv.setXY(f + k, (pts[k][long] - min[long]) / LENGTH, (pts[k][short] - min[short]) / WIDTH);
      }
    }
    uv.needsUpdate = true;
    return geometry;
  }

  root.PlankMDWood = { WOOD, texture, grainUVs };
})(typeof self !== 'undefined' ? self : this);
