<script setup lang="ts">
// A small 3D view of a PlankMD example, shown next to the code block it was
// made from (see the `plank-previews` plugin in config.mts). It uses the
// reference implementation served at /src/plankmd.js to expand the planks,
// so what you see is exactly what the validator reads.

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  /** The example as a .plank.md document, base64-encoded UTF-8. */
  code: string
  /** A caption, for examples split into one view per line. */
  label?: string
}>()

const { lang } = useData()
const fr = computed(() => lang.value.startsWith('fr'))
const t = computed(() => fr.value
  ? { planks: 'planchettes', plank: 'planchette', guides: 'gabarit', order: 'Ordre de pose', stop: 'Arrêter', open: 'Ouvrir dans le lecteur', hint: 'Glisser pour tourner', loading: 'Chargement…' }
  : { planks: 'planks', plank: 'plank', guides: 'guide', order: 'Placement order', stop: 'Stop', open: 'Open in the player', hint: 'Drag to orbit', loading: 'Loading…' })

const text = (() => {
  const bytes = Uint8Array.from(atob(props.code), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
})()
// The player reads #code=<base64url> (no padding).
const playerHref = computed(() =>
  `/player/${fr.value ? '?lang=fr' : ''}#code=${props.code.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`)

const host = ref<HTMLDivElement>()
const status = ref('')
const playing = ref(false)
const count = ref({ planks: 0, guides: 0 })

let cleanup: (() => void) | null = null
let play: (() => void) | null = null
let stop: (() => void) | null = null

function loadPlankMD(): Promise<any> {
  const w = window as any
  if (w.PlankMD) return Promise.resolve(w.PlankMD)
  w.__plankmdLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = '/src/plankmd.js'
    s.onload = () => resolve(w.PlankMD)
    s.onerror = reject
    document.head.appendChild(s)
  })
  return w.__plankmdLoading
}

async function init() {
  status.value = t.value.loading
  const [PlankMD, THREE, { OrbitControls }] = await Promise.all([
    loadPlankMD(),
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
  ])
  const el = host.value
  if (!el) return
  const result = PlankMD.validate(text)
  const planks = result.planks as any[]
  const guides = (result.guides as any[]).filter((g) => g.step === result.steps.length)
  count.value = { planks: planks.length, guides: guides.length }
  status.value = ''

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a66, 2.2))
  const sun = new THREE.DirectionalLight(0xffffff, 1.6)
  sun.position.set(0.5, -0.8, 1.2)
  scene.add(sun)

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 5000)
  camera.up.set(0, 0, 1)

  const wood = new THREE.Color('#e3bf86')
  // A palette key the example does not define (color=roof) still shows as
  // a colour, so that the attribute is visible.
  const accent = new THREE.Color('#b03a2e')
  const colour = (c: string) => {
    if (!c || c === '#e3bf86') return wood
    try { return CSS.supports('color', c) ? new THREE.Color(c) : accent } catch { return accent }
  }
  const box = new THREE.Box3()
  const meshes: any[] = []
  // Scaffold planks (grey) are drawn as ghosts at rest: they are gone once
  // the model is built. The placement order shows them going up and away.
  const scaffoldSolid = new THREE.MeshStandardMaterial({ color: 0x9aa5b1, roughness: 0.9 })
  const scaffoldGhost = new THREE.MeshBasicMaterial({ color: 0x8d99a6, transparent: true, opacity: 0.25, depthWrite: false })
  const add = (p: any, kind: 'plank' | 'guide' | 'scaffold') => {
    const geo = new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2])
    const mat = kind === 'guide'
      ? new THREE.MeshBasicMaterial({ color: 0x5b8fd9, transparent: true, opacity: 0.18, depthWrite: false })
      : kind === 'scaffold' ? scaffoldGhost
        : new THREE.MeshStandardMaterial({ color: colour(p.color), roughness: 0.85 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(p.center[0], p.center[1], p.center[2])
    // The plank's own axes: leaning planks lean.
    if (p.axes) mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(...p.axes.map((a: number[]) => new THREE.Vector3(...a))))
    else mesh.rotation.z = THREE.MathUtils.degToRad(p.rotation || 0)
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: kind === 'guide' ? 0x3d73c4 : kind === 'scaffold' ? 0x4a5560 : 0x6b4a1f, transparent: true, opacity: kind === 'plank' ? 0.55 : 0.9 }),
    )
    mesh.add(edges)
    scene.add(mesh)
    box.expandByObject(mesh)
    if (kind !== 'guide') byPlank.set(p, mesh)
    if (kind === 'plank') meshes.push(mesh)
  }
  const byPlank = new Map<any, any>()
  planks.forEach((p) => add(p, 'plank'))
  ;((result.scaffolds as any[]) || []).forEach((r) => add(r, 'scaffold'))
  guides.forEach((g) => add(g, 'guide'))
  // What the placement order plays: the moves of the builder.
  const moves = (result.moves as any[]) || planks.map((p) => ({ kind: 'plank', plank: p }))

  // A faint ground, just under the model.
  const size = box.getSize(new THREE.Vector3())
  const centre = box.getCenter(new THREE.Vector3())
  const span = Math.max(size.x, size.y, size.z, 15)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(span * 3, span * 3),
    new THREE.MeshBasicMaterial({ color: 0x8a7a66, transparent: true, opacity: 0.12, depthWrite: false }),
  )
  ground.position.set(centre.x, centre.y, -0.01)
  scene.add(ground)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(centre)
  controls.enableDamping = false
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius || 10
  const dir = new THREE.Vector3(0.55, -1, 0.75).normalize()
  camera.position.copy(centre).addScaledVector(dir, radius / Math.sin(THREE.MathUtils.degToRad(35 / 2)) * 1.05)
  controls.update()

  const render = () => renderer.render(scene, camera)
  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    render()
  }
  controls.addEventListener('change', render)
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()

  // Placement order: show the planks one by one, in the order of the file.
  let timer: number | undefined
  const atRest = () => {
    byPlank.forEach((m, p) => { m.visible = true; if (p.scaffold) m.material = scaffoldGhost })
  }
  stop = () => {
    clearInterval(timer)
    atRest()
    playing.value = false
    status.value = ''
    render()
  }
  play = () => {
    if (playing.value) return stop!()
    playing.value = true
    let done = 0, placed = 0
    byPlank.forEach((m, p) => { m.visible = false; if (p.scaffold) m.material = scaffoldSolid })
    const step = () => {
      if (done >= moves.length) {
        clearInterval(timer)
        atRest()
        playing.value = false
        status.value = ''
        render()
        return
      }
      const m = moves[done]
      if (m.kind === 'remove') for (const r of m.scaffolds) byPlank.get(r).visible = false
      else byPlank.get(m.plank || m.scaffold).visible = true
      if (m.kind === 'plank') placed += 1
      done += 1
      status.value = `${t.value.plank} ${placed}/${meshes.length}`
      render()
    }
    step()
    timer = window.setInterval(step, Math.max(60, Math.min(450, 4000 / moves.length)))
  }

  cleanup = () => {
    clearInterval(timer)
    ro.disconnect()
    controls.dispose()
    scene.traverse((o: any) => { o.geometry?.dispose(); o.material?.dispose() })
    renderer.dispose()
    renderer.domElement.remove()
  }
}

// Only start a WebGL context when the example scrolls into view.
let io: IntersectionObserver | null = null
onMounted(() => {
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io?.disconnect()
      io = null
      init().catch((err) => { status.value = String(err?.message || err) })
    }
  }, { rootMargin: '200px' })
  if (host.value) io.observe(host.value)
})
onBeforeUnmount(() => { io?.disconnect(); cleanup?.() })
</script>

<template>
  <figure class="plank-preview">
    <div ref="host" class="plank-preview-scene" :title="t.hint">
      <span v-if="status" class="plank-preview-status">{{ status }}</span>
    </div>
    <figcaption>
      <span class="plank-preview-count">
        <template v-if="label">{{ label }}: </template>
        {{ count.planks }} {{ count.planks === 1 ? t.plank : t.planks }}<template v-if="count.guides"> + {{ count.guides }} {{ t.guides }}{{ count.guides > 1 ? 's' : '' }}</template>
      </span>
      <span class="plank-preview-actions">
        <button v-if="count.planks > 1" type="button" @click="play?.()">{{ playing ? t.stop : `▶ ${t.order}` }}</button>
        <a :href="playerHref" target="_blank" rel="noopener">{{ t.open }} ↗</a>
      </span>
    </figcaption>
  </figure>
</template>
