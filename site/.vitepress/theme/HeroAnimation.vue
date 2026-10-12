<script setup lang="ts">
// The home page hero: a carousel of models that build themselves plank by
// plank while the camera turns, the last one toppling in the physics engine
// when its flag goes on. It loads one model at a time from the site
// (/samples, /gallery), the reference implementation (/src/plankmd.js), the
// pine texture (/player/wood.js), and the physics engine only for the fall.
// It stops when it is off screen or the tab is hidden, and shows a still
// picture when the system asks for reduced motion.

import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

type Model = { path: string, falls?: boolean }
const MODELS: Model[] = [
  { path: 'samples/twisted-tower' },
  { path: 'gallery/lighthouse' },
  { path: 'samples/corbel-bridge' },
  { path: 'gallery/pagoda' },
  { path: 'samples/leaning-tower', falls: true },
]
const RAPIER_URL = 'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.20.0/dist/rapier.mjs'

const { lang } = useData()
const host = ref<HTMLDivElement>()
const title = ref('')
const status = ref('')
const href = ref('/player/')
const paused = ref(false) // reduced motion: a still picture until asked
let play: (() => void) | null = null

const scripts = new Map<string, Promise<void>>()
function script(src: string) {
  if (!scripts.has(src)) {
    scripts.set(src, new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = src
      s.onload = () => resolve()
      s.onerror = reject
      document.head.appendChild(s)
    }))
  }
  return scripts.get(src)!
}

let stop: (() => void) | null = null

onMounted(async () => {
  const el = host.value
  if (!el) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const [THREE] = await Promise.all([import('three'), script('/src/plankmd.js'), script('/player/wood.js')])
  const w = window as any
  const PlankMD = w.PlankMD, Wood = w.PlankMDWood

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  el.prepend(renderer.domElement)
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a66, 2.4))
  const sun = new THREE.DirectionalLight(0xffffff, 1.7)
  sun.position.set(30, 60, 40)
  scene.add(sun)
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 5000)
  const group = new THREE.Group()
  scene.add(group)
  const texture = Wood.texture(THREE)
  const edges = new THREE.LineBasicMaterial({ color: 0x5a4630, transparent: true, opacity: 0.45 })
  const geometries = new Map<string, any>(), materials = new Map<string, any>()
  const geometry = (s: number[]) => {
    const key = s.join(',')
    if (!geometries.has(key)) {
      const box = Wood.grainUVs(new THREE.BoxGeometry(s[0], s[2], s[1]))
      geometries.set(key, { box, edges: new THREE.EdgesGeometry(box) })
    }
    return geometries.get(key)
  }
  const material = (color: string) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, map: texture, roughness: 0.8 }))
    return materials.get(color)
  }

  let redraw = () => {}
  const resize = () => {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    renderer.setSize(r.width, r.height, false)
    camera.aspect = r.width / r.height
    camera.updateProjectionMatrix()
    redraw() // resizing clears the canvas
  }
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()

  // ---------------------------------------------------------- one model
  type Shown = { model: Model, planks: any[], meshes: any[], center: any, radius: number, height: number }
  async function show(model: Model): Promise<Shown> {
    const text = await (await fetch(`/${model.path}.plank.md`)).text()
    const result = PlankMD.validate(text)
    group.clear()
    const meshes = result.planks.map((p: any) => {
      const g = geometry(p.size)
      const m = new THREE.Mesh(g.box, material(p.color))
      m.add(new THREE.LineSegments(g.edges, edges))
      m.position.set(p.center[0], p.center[2], -p.center[1])
      m.rotation.y = (p.rotation * Math.PI) / 180
      m.userData.home = m.position.clone()
      m.visible = false
      group.add(m)
      return m
    })
    // The box of the finished model, from the planks themselves (scene axes).
    const box = new THREE.Box3()
    for (const p of result.planks) {
      for (const [x, y] of p.footprint) {
        box.expandByPoint(new THREE.Vector3(x, p.z0, -y))
        box.expandByPoint(new THREE.Vector3(x, p.z1, -y))
      }
    }
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    title.value = result.meta.title || ''
    href.value = `/player/${lang.value.startsWith('fr') ? '?lang=fr' : ''}#${model.path.replace(/^samples\//, '')}`
    return { model, planks: result.planks, meshes, center, radius: Math.max(10, box.getBoundingSphere(new THREE.Sphere()).radius), height: size.y }
  }

  let angle = 0.6
  // `low` from 0 to 1 lowers the aim to the table, to follow a fall.
  function frame(s: Shown, dt: number, low = 0) {
    redraw = () => frame(s, 0, low)
    angle += dt * 0.25
    const dist = (s.radius / Math.sin((camera.fov / 2) * Math.PI / 180)) * 1.02
    const target = s.center.clone()
    target.y -= low * (target.y - Math.min(target.y, s.radius * 0.35))
    camera.position.set(target.x + Math.sin(angle) * dist * 0.88, target.y + dist * 0.42, target.z + Math.cos(angle) * dist * 0.88)
    camera.lookAt(target)
    renderer.render(scene, camera)
  }

  // ------------------------------------------------------------- the loop
  let alive = true, visible = true
  const io = new IntersectionObserver((e) => { visible = e.some((x) => x.isIntersecting) })
  io.observe(el)
  const wait = () => new Promise<number>((resolve) => {
    let last = performance.now()
    const tick = (now: number) => {
      if (!alive) return
      if (!visible || document.hidden) { last = now; requestAnimationFrame(tick); return }
      resolve(Math.min(0.1, (now - last) / 1000))
    }
    requestAnimationFrame(tick)
  })
  stop = () => { alive = false; io.disconnect(); ro.disconnect(); renderer.dispose(); renderer.domElement.remove() }

  if (reduced) {
    const s = await show(MODELS[3])
    for (const m of s.meshes) m.visible = true
    frame(s, 0)
    paused.value = true
    await new Promise<void>((resolve) => { play = resolve })
    paused.value = false
  }

  const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)
  for (let i = 0; alive; i = (i + 1) % MODELS.length) {
    const s = await show(MODELS[i])
    const n = s.meshes.length
    const per = Math.min(0.22, Math.max(0.035, 9 / n)) // seconds per plank: about nine seconds a model
    const lift = Math.max(6, s.height * 0.3)
    // The planks go down one by one, dropping in from a little above.
    let t = 0
    const total = n * per
    while (alive && t < total + 0.4) {
      const dt = await wait()
      t += dt
      const placed = t / per
      s.meshes.forEach((m: any, k: number) => {
        m.visible = k < placed
        const f = ease((placed - k) / 2.5)
        m.position.y = m.userData.home.y + (1 - f) * lift
      })
      status.value = `${Math.min(n, Math.ceil(placed))} / ${n}`
      frame(s, dt)
    }
    // The last model topples: the physics engine takes over.
    if (s.model.falls && alive) {
      try {
        const mod = await import(/* @vite-ignore */ RAPIER_URL)
        const R = mod.default || mod
        await R.init()
        await script('/src/drop.js')
        const drop = w.PlankMDDrop.createDrop(R, s.planks, { seconds: 8 })
        const byN = new Map(s.planks.map((p: any, k: number) => [p.n, s.meshes[k]]))
        let sim = 0
        while (alive && sim < 7) {
          const dt = await wait()
          sim += dt * 1.6
          drop.advance(dt * 1.6)
          for (const { n: id, position, quaternion } of drop.poses()) {
            const m: any = byN.get(id)
            m.position.set(...position)
            m.quaternion.set(...quaternion)
          }
          frame(s, dt, ease(sim / 5))
        }
        drop.free()
      } catch { /* no physics engine: the tower simply stands */ }
    } else {
      for (let h = 0; alive && h < 2.5;) { const dt = await wait(); h += dt; frame(s, dt) }
    }
    // Make way for the next one.
    for (let h = 0; alive && h < 0.5;) {
      const dt = await wait()
      h += dt
      group.position.y = -ease(h / 0.5) * s.height * 1.2
      frame(s, dt)
    }
    group.position.y = 0
  }
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <div class="hero-anim">
    <div ref="host" class="hero-anim-scene" aria-hidden="true"></div>
    <button v-if="paused" class="hero-anim-play" type="button" :aria-label="lang.startsWith('fr') ? 'Voir les modèles se construire' : 'Watch the models build'" @click="play?.()">▶</button>
    <a class="hero-anim-caption" :href="href" target="_self">
      <span class="hero-anim-title">{{ title }}</span>
      <span class="hero-anim-count">{{ status }}</span>
    </a>
  </div>
</template>

<style scoped>
.hero-anim { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; }
.hero-anim-scene { position: relative; flex: 1; min-height: 0; }
.hero-anim-scene :deep(canvas) { position: absolute; inset: 0; width: 100% !important; height: 100% !important; }
.hero-anim-play { position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%); width: 56px; height: 56px; border-radius: 50%; background: var(--vp-c-brand-3); color: #fff; font-size: 22px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); }
.hero-anim-play:hover { background: var(--vp-c-brand-2); }
.hero-anim-caption { align-self: center; display: inline-flex; gap: 10px; align-items: baseline; padding: 4px 12px; border-radius: 14px; font-size: 13px; color: var(--vp-c-text-2); text-decoration: none; }
.hero-anim-caption:hover { color: var(--vp-c-brand-1); }
.hero-anim-title { font-weight: 600; color: var(--vp-c-text-1); }
.hero-anim-count { font-variant-numeric: tabular-nums; min-width: 4.5em; }
</style>
