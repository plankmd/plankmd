/*!
 * PlankMD offline renderer: still pictures of a model, plank by plank, for the
 * building video (video.html) and the printable booklet (booklet.html).
 * MIT License. Browser only: needs three.js r128 (window.THREE) and draws
 * into its own canvas (window.PlankMDRender).
 */
(function (root) {
  'use strict';
  const THREE = root.THREE;
  const deg = Math.PI / 180;

  // PlankMD is z-up with y going away from the viewer; three.js is y-up with
  // z towards the viewer. (x, y, z) in PlankMD is (x, z, -y) in the scene.
  const toScene = (c) => new THREE.Vector3(c[0], c[2], -c[1]);

  /**
   * A renderer of `width` × `height` pixels. Colours are CSS colours.
   * Returns { canvas, setModel(result), draw(view), bounds }.
   */
  function create({ width, height, background = '#f3efe8', ground = '#e6dfd3', edges = '#5a4630', pixelRatio = 1 }) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a66, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(40, 80, 50);
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshLambertMaterial({ color: ground }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20000);
    const group = new THREE.Group();
    scene.add(group);

    const bg = new THREE.Color(background);
    const geometries = new Map(), materials = new Map(), edgeSets = new Map();
    const edgeMaterial = new THREE.LineBasicMaterial({ color: edges });
    const fadedEdge = new THREE.LineBasicMaterial({ color: edges, transparent: true, opacity: 0.25 });
    const guideMaterial = new THREE.MeshBasicMaterial({ color: 0x3f6fa8, transparent: true, opacity: 0.2, depthWrite: false });
    const guideEdge = new THREE.LineDashedMaterial({ color: 0x3f6fa8, dashSize: 0.9, gapSize: 0.5 });
    const geometry = ([sx, sy, sz]) => {
      const key = `${sx},${sy},${sz}`;
      if (!geometries.has(key)) {
        const g = new THREE.BoxGeometry(sx, sz, sy);
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
        if (kind === 'faded') c.lerp(bg, 0.55);
        const m = new THREE.MeshLambertMaterial({ color: c });
        if (kind === 'lit') m.emissive = new THREE.Color(0x6b3f00);
        materials.set(key, m);
      }
      return materials.get(key);
    };

    let planks = [], meshes = [], guides = [];
    const bounds = { center: new THREE.Vector3(), radius: 10, size: new THREE.Vector3(), box: new THREE.Box3() };

    function setModel(result) {
      group.clear();
      planks = result.planks;
      meshes = planks.map((p) => {
        const { box, edges: e } = geometry(p.size);
        const mesh = new THREE.Mesh(box, material(p.color, 'normal'));
        mesh.position.copy(toScene(p.center));
        mesh.rotation.y = p.rotation * deg;
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
        mesh.rotation.y = g.rotation * deg;
        const line = new THREE.LineSegments(e, guideEdge);
        line.computeLineDistances();
        mesh.add(line);
        mesh.renderOrder = 1;
        mesh.userData = { guide: g };
        group.add(mesh);
        return mesh;
      });
      const box = new THREE.Box3();
      for (const m of meshes.concat(guides)) box.expandByObject(m);
      if (box.isEmpty()) box.set(new THREE.Vector3(-8, 0, -8), new THREE.Vector3(8, 8, 8));
      bounds.box.copy(box);
      box.getCenter(bounds.center);
      box.getSize(bounds.size);
      bounds.radius = Math.max(8, box.getBoundingSphere(new THREE.Sphere()).radius);
      floor.scale.set(bounds.radius * 40, bounds.radius * 40, 1);
      floor.position.set(bounds.center.x, -0.01, bounds.center.z);
      // The floor fades into the background: no horizon line.
      scene.fog = new THREE.Fog(background, bounds.radius * 4, bounds.radius * 11);
    }

    /**
     * Draws the model. view = {
     *   upTo: planks numbered up to this one are shown (default: all),
     *   fadeBelow: planks numbered below this one are faded,
     *   lit: the number of a plank to highlight,
     *   drop: { n, t } lifts plank n by (1 - t) of a few plank heights (t from 0 to 1),
     *   step: guides of this step are shown,
     *   azimuth, elevation: the camera direction in degrees (default 35, 28),
     *   zoom: 1 frames the whole model with a margin (it fills 80% of the
     *     picture), more is closer,
     *   shift: moves the model up in the picture, in fractions of its height (to clear a caption),
     *   target: [x, y, z] in PlankMD coordinates to aim at, instead of the centre,
     * }
     */
    function draw(view = {}) {
      const upTo = view.upTo === undefined ? Infinity : view.upTo;
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
      for (const g of guides) g.visible = view.step !== undefined && g.userData.guide.step === view.step;
      const az = (view.azimuth === undefined ? 35 : view.azimuth) * deg;
      const el = (view.elevation === undefined ? 28 : view.elevation) * deg;
      const target = view.target ? toScene(view.target) : bounds.center;
      camera.clearViewOffset();
      // Frame the corners of the model's box as seen from this direction, so
      // that tall, long and flat models all fill the picture.
      const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      const fill = Math.min(0.95, 0.8 * (view.zoom || 1));
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

  root.PlankMDRender = { create };
})(typeof self !== 'undefined' ? self : this);
