// Copies the parts of the repository that the site serves as static files
// into site/public/, so that they keep the same relative layout as in the
// repository: /player/ loads ../src/*.js, and llms.txt links SPEC.md and
// docs/llm-instructions.md. SPEC.md stays the single source of the spec: the
// spec page includes it, and /SPEC.md serves it raw.
//
// Everything copied here is generated and ignored by Git (see .gitignore).

import { cpSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const site = join(dirname(fileURLToPath(import.meta.url)), '..')
const root = join(site, '..')
const pub = join(site, 'public')

// Bundle the samples and the worker source into the player first.
execFileSync(process.execPath, [join(root, 'scripts', 'build-samples.js')], { stdio: 'inherit' })

const COPIES = [
  ['player', 'player'],
  ['src/plankmd.js', 'src/plankmd.js'],
  ['src/physics.js', 'src/physics.js'],
  ['src/drop.js', 'src/drop.js'],
  ['samples', 'samples'],
  ['gallery', 'gallery'],
  ['SPEC.md', 'SPEC.md'],
  ['CHANGELOG.md', 'CHANGELOG.md'],
  ['LICENSE', 'LICENSE.txt'],
  ['llms.txt', 'llms.txt'],
  ['docs/llm-instructions.md', 'docs/llm-instructions.md'],
  ['docs/gallery.png', 'docs/gallery.png'],
]

for (const [from, to] of COPIES) {
  const src = join(root, from)
  const dest = join(pub, to)
  if (!existsSync(src)) continue
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(src, dest, { recursive: true, filter: (p) => !p.endsWith('.DS_Store') })
}

console.log(`synced ${COPIES.length} paths into site/public/ (${readdirSync(pub).length} entries)`)
