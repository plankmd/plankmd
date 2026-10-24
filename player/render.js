/*!
 * PlankMD offline renderer: still pictures of a model, plank by plank, for the
 * building video (video.html) and the printable booklet (booklet.html).
 * MIT License. Browser only: needs three.js r128 (window.THREE) and the pine
 * texture of wood.js (window.PlankMDWood), and draws into its own canvas
 * (window.PlankMDRender).
 */
(function (root) {
  'use strict';
  const THREE = root.THREE;
  const deg = Math.PI / 180;

  // PlankMD is z-up with y going away from the viewer; three.js is y-up with
  // z towards the viewer. (x, y, z) in PlankMD is (x, z, -y) in the scene.
  const toScene = (c) => new THREE.Vector3(c[0], c[2], -c[1]);
  // A plank's orientation in the scene, from its axes (leaning planks too).
  function orient(mesh, p) {
    if (!p.axes) { mesh.rotation.y = p.rotation * deg; return; }
    const ex = toScene(p.axes[0]), ey = toScene(p.axes[2]), ez = toScene(p.axes[1]).negate();
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ex, ey, ez));
  }
  // Scaffold planks (docs/proposals/scaffold.md): grey and striped.
  function stripes() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#aab3bd';
    g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#8d99a6';
    g.lineWidth = 8;
    for (let i = -64; i <= 128; i += 20) { g.beginPath(); g.moveTo(i, 64); g.lineTo(i + 64, 0); g.stroke(); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  /**
   * A renderer of `width` × `height` pixels. Colours are CSS colours.
   * `transparent`: no background and no floor, for a picture laid on a page.
   * `fade`: how the faded planks look, { mix, opacity, edges }: `mix` of the
   * background colour in their own (0.55), their `opacity` (1) and that of
   * their edges (0.25).
   * Returns { canvas, setModel(result), draw(view), bounds }.
   */
  function create({ width, height, background = '#f3efe8', ground = '#e6dfd3', edges = '#5a4630', pixelRatio = 1, transparent = false, fade = {} }) {
    const FADE = { mix: 0.55, opacity: 1, edges: 0.25, ...fade };
    const scaffoldMaterial = new THREE.MeshLambertMaterial({ map: stripes() });
    const scaffoldLit = new THREE.MeshLambertMaterial({ map: scaffoldMaterial.map, emissive: new THREE.Color(0x2a3440) });
    const scaffoldGone = new THREE.MeshLambertMaterial({ map: scaffoldMaterial.map, transparent: true, opacity: 0.35, depthWrite: false });
    const scaffoldEdge = new THREE.LineBasicMaterial({ color: 0x4a5560 });
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: transparent });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    const scene = new THREE.Scene();
    if (!transparent) scene.background = new THREE.Color(background);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a66, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(40, 80, 50);
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshLambertMaterial({ color: ground }));
    floor.rotation.x = -Math.PI / 2;
    if (!transparent) scene.add(floor);
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20000);
    const group = new THREE.Group();
    scene.add(group);

    const bg = new THREE.Color(background);
    const geometries = new Map(), materials = new Map(), edgeSets = new Map();
    const edgeMaterial = new THREE.LineBasicMaterial({ color: edges });
    const fadedEdge = new THREE.LineBasicMaterial({ color: edges, transparent: true, opacity: FADE.edges });
    const guideMaterial = new THREE.MeshBasicMaterial({ color: 0x3f6fa8, transparent: true, opacity: 0.2, depthWrite: false });
    const guideEdge = new THREE.LineDashedMaterial({ color: 0x3f6fa8, dashSize: 0.9, gapSize: 0.5 });
    const geometry = ([sx, sy, sz]) => {
      const key = `${sx},${sy},${sz}`;
      if (!geometries.has(key)) {
        const g = root.PlankMDWood.grainUVs(new THREE.BoxGeometry(sx, sz, sy));
        geometries.set(key, g);
        edgeSets.set(key, new THREE.EdgesGeometry(g));
      }
      return { box: geometries.get(key), edges: edgeSets.get(key) };
    };
    // Normal, faded (planks of earlier steps, in the booklet) and highlighted.
    const material = (color, kind) => {
      const key = `${color}|${kind}`;
      if (!materials.has(key)) {
        const c = new THREE.Color(color);
        if (kind === 'faded') c.lerp(bg, FADE.mix);
        const m = new THREE.MeshLambertMaterial({ color: c, map: root.PlankMDWood.texture(THREE) });
        if (kind === 'faded' && FADE.opacity < 1) Object.assign(m, { transparent: true, opacity: FADE.opacity });
        if (kind === 'lit') m.emissive = new THREE.Color(0x6b3f00);
        materials.set(key, m);
      }
      return materials.get(key);
    };

    let planks = [], meshes = [], guides = [], scaffolds = [], moves = [];
    const bounds = { center: new THREE.Vector3(), radius: 10, size: new THREE.Vector3(), box: new THREE.Box3() };

    function setModel(result) {
      group.clear();
      planks = result.planks;
      moves = result.moves || planks.map((p, i) => ({ index: i + 1, kind: 'plank', step: p.step, plank: p }));
      meshes = planks.map((p) => {
        const { box, edges: e } = geometry(p.size);
        const mesh = new THREE.Mesh(box, material(p.color, 'normal'));
        mesh.position.copy(toScene(p.center));
        orient(mesh, p);
        const line = new THREE.LineSegments(e, edgeMaterial);
        mesh.add(line);
        mesh.userData = { plank: p, line, home: mesh.position.clone() };
        group.add(mesh);
        return mesh;
      });
      guides = result.guides.map((g) => {
        const { box, edges: e } = geometry(g.size);
        const mesh = new THREE.Mesh(box, guideMaterial);
        mesh.position.copy(toScene(g.center));
        orient(mesh, g);
        const line = new THREE.LineSegments(e, guideEdge);
        line.computeLineDistances();
        mesh.add(line);
        mesh.renderOrder = 1;
        mesh.userData = { guide: g };
        group.add(mesh);
        return mesh;
      });
      scaffolds = (result.scaffolds || []).map((r) => {
        const { box, edges: e } = geometry(r.size);
        const mesh = new THREE.Mesh(box, scaffoldMaterial);
        mesh.position.copy(toScene(r.center));
        orient(mesh, r);
        mesh.add(new THREE.LineSegments(e, scaffoldEdge));
        mesh.userData = { scaffold: r, home: mesh.position.clone() };
        group.add(mesh);
        return mesh;
      });
      const box = new THREE.Box3();
      for (const m of meshes.concat(guides, scaffolds)) box.expandByObject(m);
      if (box.isEmpty()) box.set(new THREE.Vector3(-8, 0, -8), new THREE.Vector3(8, 8, 8));
      bounds.box.copy(box);
      box.getCenter(bounds.center);
      box.getSize(bounds.size);
      bounds.radius = Math.max(8, box.getBoundingSphere(new THREE.Sphere()).radius);
      floor.scale.set(bounds.radius * 40, bounds.radius * 40, 1);
      floor.position.set(bounds.center.x, -0.01, bounds.center.z);
      // The floor fades into the background: no horizon line.
      if (!transparent) scene.fog = new THREE.Fog(background, bounds.radius * 4, bounds.radius * 11);
    }

    /**
     * Draws the model. view = {
     *   upTo: planks numbered up to this one are shown (default: all),
     *   fadeBelow: planks numbered below this one are faded,
     *   lit: the number of a plank to highlight,
     *   drop: { n, t } lifts plank n by (1 - t) of a few plank heights (t from 0 to 1),
     *   step: guides of this step are shown, each once the moves before it are done,
     *   azimuth, elevation: the camera direction in degrees (default 35, 28),
     *   zoom: 1 frames the whole model with a margin (it fills 80% of the
     *     picture), more is closer,
     *   shift: moves the model up in the picture, in fractions of its height (to clear a caption),
     *   target: [x, y, z] in PlankMD coordinates to aim at, instead of the centre,
     *   move: the moves done (PlankMD.build), instead of upTo: scaffolds are
     *     shown while they are in place,
     *   litScaffold: the number of a scaffold plank to highlight,
     *   dropScaffold: { s, t }, like drop, for a scaffold plank,
     *   removing: { move, t }: the scaffolds that move takes away slide out
     *     along their length (t from 0 to 1), fading,
     * }
     * Returns the canvas.
     */
    function draw(view = {}) {
      // The planks shown: up to a plank number, or up to a move.
      const move = view.move !== undefined ? view.move
        : view.upTo === undefined || view.upTo >= planks.length ? moves.length
          : view.upTo < 1 ? 0 : planks[view.upTo - 1].move || view.upTo;
      const upTo = view.move !== undefined ? moves.slice(0, view.move).filter((m) => m.kind === 'plank').length
        : view.upTo === undefined ? Infinity : view.upTo;
      const removing = view.removing ? moves[view.removing.move - 1] : null;
      for (const m of scaffolds) {
        const r = m.userData.scaffold;
        const leaving = !!(removing && removing.scaffolds && removing.scaffolds.includes(r));
        m.visible = r.move <= move && (r.removed > move || leaving);
        if (!m.visible) continue;
        m.position.copy(m.userData.home);
        m.material = leaving ? scaffoldGone : view.litScaffold === r.s ? scaffoldLit : scaffoldMaterial;
        if (leaving) {
          // Slide out sideways, out from under what it carried, towards the
          // front of the model (or away from its middle).
          const axes = r.axes || [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
          const li = r.size.indexOf(Math.max(...r.size));
          const wi = [0, 1, 2].find((j) => j !== li && Math.abs(axes[j][2]) < 0.5);
          const k = wi === undefined ? li : wi;
          const a = axes[k];
          let sign = a[1] > 1e-6 ? -1 : a[1] < -1e-6 ? 1 : 0;
          if (!sign) sign = Math.sign(toScene(a).dot(m.userData.home.clone().sub(bounds.center))) || 1;
          m.position.addScaledVector(toScene(a), sign * view.removing.t * (r.size[k] + 8));
        }
        if (view.dropScaffold && view.dropScaffold.s === r.s) m.position.y += (1 - view.dropScaffold.t) * Math.max(4, r.size[2] * 3);
      }
      for (const m of meshes) {
        const p = m.userData.plank;
        m.visible = p.n <= upTo;
        if (!m.visible) continue;
        const kind = view.lit === p.n ? 'lit' : (view.fadeBelow !== undefined && p.n < view.fadeBelow ? 'faded' : 'normal');
        m.material = material(p.color, kind);
        m.userData.line.material = kind === 'faded' ? fadedEdge : edgeMaterial;
        m.position.copy(m.userData.home);
        if (view.drop && view.drop.n === p.n) m.position.y += (1 - view.drop.t) * Math.max(4, p.size[2] * 3);
      }
      for (const g of guides) {
        const r = g.userData.guide;
        g.visible = view.step !== undefined && r.step === view.step && !(r.after > move);
      }
      const az = (view.azimuth === undefined ? 35 : view.azimuth) * deg;
      const el = Math.min(89, view.elevation === undefined ? 28 : view.elevation) * deg;
      const target = view.target ? toScene(view.target) : bounds.center;
      camera.clearViewOffset();
      // Frame the corners of the model's box as seen from this direction, so
      // that tall, long and flat models all fill the picture.
      const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      const fill = 0.8;
      const corners = [];
      for (const x of [bounds.box.min.x, bounds.box.max.x]) for (const y of [bounds.box.min.y, bounds.box.max.y]) for (const z of [bounds.box.min.z, bounds.box.max.z]) corners.push(new THREE.Vector3(x, y, z));
      let dist = bounds.radius / Math.sin((camera.fov / 2) * deg);
      for (let i = 0; i < 4; i++) {
        camera.position.copy(target).addScaledVector(dir, dist);
        camera.lookAt(target);
        camera.updateMatrixWorld();
        let extent = 0;
        for (const c of corners) {
          const p = c.clone().project(camera);
          extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y));
        }
        dist *= extent / fill;
      }
      dist /= view.zoom || 1;
      camera.position.copy(target).addScaledVector(dir, dist);
      camera.lookAt(target);
      if (view.shift) {
        const w = renderer.domElement.width, h = renderer.domElement.height;
        camera.setViewOffset(w, h, 0, Math.round(view.shift * h), w, h);
      }
      renderer.render(scene, camera);
      return renderer.domElement;
    }

    return { canvas: renderer.domElement, setModel, draw, bounds };
  }

  /**
   * The camera of a step in a picture (docs/proposals/view.md): its own view
   * over the model's, over `defaults` ({ azimuth, elevation, zoom }). Returns
   * { azimuth, elevation, zoom, target }: `zoom` multiplies the default one,
   * `target` (file coordinates) is the centre of what the view focuses on.
   */
  function stepView(result, stepNumber, defaults = {}) {
    const step = stepNumber ? result.steps[stepNumber - 1] : null;
    const own = Object.assign({}, result.meta.view || {}, step && step.view ? step.view : {});
    const out = {
      azimuth: own.azimuth !== undefined ? own.azimuth : defaults.azimuth,
      elevation: own.elevation !== undefined ? own.elevation : defaults.elevation,
      zoom: (defaults.zoom || 1) * (own.zoom || 1),
    };
    const all = result.planks.concat(result.scaffolds || []);
    const focus = own.focus === 'step' ? all.filter((p) => p.step === stepNumber) : own.focus ? all.filter((p) => p.id === own.focus) : [];
    if (focus.length) {
      const xs = focus.flatMap((p) => p.footprint.map((c) => c[0])), ys = focus.flatMap((p) => p.footprint.map((c) => c[1]));
      const z0 = Math.min(...focus.map((p) => p.z0)), z1 = Math.max(...focus.map((p) => p.z1));
      out.target = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, (z0 + z1) / 2];
    }
    return out;
  }

  root.PlankMDRender = { create, stepView };
})(typeof self !== 'undefined' ? self : this);
