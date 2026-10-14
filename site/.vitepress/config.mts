import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const GITHUB = 'https://github.com/plankmd/plankmd'
const SITE = 'https://plankmd.org'

// Sends French-speaking visitors to /fr/ on their first visit.
const langRedirect = readFileSync(new URL('./lang-redirect.js', import.meta.url), 'utf8')

// Syntax highlighting for ```plank blocks.
const plankGrammar = {
  name: 'plank',
  scopeName: 'source.plank',
  patterns: [
    { match: '#.*$', name: 'comment.line.number-sign.plank' },
    { match: '\\b(guide)\\b', name: 'keyword.control.plank' },
    { match: '\\b(flat|edge|up)-[xy]\\b', name: 'entity.name.function.plank' },
    { match: '\\b([a-z][a-z-]*)(=)', captures: { 1: { name: 'variable.parameter.plank' }, 2: { name: 'keyword.operator.plank' } } },
    { match: '-?\\b\\d+(\\.\\d+)?\\b', name: 'constant.numeric.plank' },
  ],
}

// Pages that include a repository file are edited at the source.
// The function is serialized into the client: it cannot use GITHUB.
const editLinkPattern = ({ filePath }: { filePath: string }) => {
  const included: Record<string, string> = { 'spec.md': 'SPEC.md', 'llm.md': 'docs/llm-instructions.md', 'changelog.md': 'CHANGELOG.md' }
  return `https://github.com/plankmd/plankmd/edit/main/${included[filePath] ?? `site/${filePath}`}`
}

// The reference implementation, to look at the examples at build time.
const PlankMD = createRequire(import.meta.url)('../../src/plankmd.js')

// Pages whose PlankMD examples get a 3D preview next to them.
const PREVIEW_PAGES = ['index.md', 'spec.md', 'fr/index.md', 'fr/spec.md']

// Adds a 3D preview (PlankPreview.vue) to every example that contains
// planks: ```plank blocks, and ```markdown blocks that quote one. An example
// whose lines are separate illustrations that overlap (the attributes table)
// gets one small preview per line instead.
function plankPreviews(md: any) {
  const fence = md.renderer.rules.fence
  const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64')
  md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any) => {
    const html = fence(tokens, idx, options, env, self)
    if (!PREVIEW_PAGES.includes(env.relativePath)) return html
    const token = tokens[idx]
    const lang = token.info.trim().split(/\s+/)[0]
    const body: string = token.content
    let doc: string
    if (lang === 'plank') doc = '```plank\n' + body + '```\n'
    else if (lang === 'markdown' && /^```plank/m.test(body)) doc = body
    else return html
    // The plank lines of the example, wherever they are quoted.
    const plankBody = lang === 'plank' ? body : (body.match(/^```plank[^\n]*\n([\s\S]*?)^```/m)?.[1] ?? '')
    const lines = plankBody.split('\n').filter((l) => l.trim() && !/^\s*(#|guide\b)/.test(l))
    const overlapping = lines.length > 1 &&
      PlankMD.validate(doc).diagnostics.some((d: any) => d.code === 'E-overlap')
    if (overlapping) {
      const views = lines.map((l) => {
        const [code, comment] = l.split('#')
        return `<PlankPreview code="${b64('```plank\n' + code.trim() + '\n```\n')}" label="${md.utils.escapeHtml((comment || '').trim())}" />`
      })
      return `<div class="plank-example">${html}<ClientOnly><div class="plank-example-split">${views.join('')}</div></ClientOnly></div>`
    }
    // Wide code reads better with the preview below it.
    const wide = Math.max(...body.split('\n').map((l) => l.length)) > 36
    return `<div class="plank-example${wide ? ' plank-example-wide' : ''}"><div class="plank-example-grid"><div class="plank-example-code">${html}</div><ClientOnly><PlankPreview code="${b64(doc)}" /></ClientOnly></div></div>`
  }
}

const nav = (t: Record<string, string>, prefix: string): DefaultTheme.NavItem[] => [
  { text: t.spec, link: `${prefix}/spec` },
  { text: t.player, link: prefix ? `/player/?lang=${prefix.slice(1)}` : '/player/', target: '_self' },
  { text: t.gallery, link: `${prefix}/gallery` },
  { text: t.use, link: `${prefix}/use` },
  { text: t.llm, link: `${prefix}/llm` },
  {
    text: 'v0.1',
    items: [
      { text: t.changelog, link: `${prefix}/changelog` },
      { text: t.contributing, link: `${GITHUB}/blob/main/CONTRIBUTING.md` },
    ],
  },
]

export default defineConfig({
  title: 'PlankMD',
  // The raw files copied into public/ by scripts/sync.mjs are not pages.
  srcExclude: ['public/**', 'README.md'],
  lastUpdated: false,
  cleanUrls: true,

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      description: 'An open Markdown format for wooden plank constructions and their building steps',
      themeConfig: {
        nav: nav({ spec: 'Spec', player: 'Player', gallery: 'Gallery', use: 'Use it', llm: 'LLMs', changelog: 'Changelog', contributing: 'Contributing' }, ''),
        editLink: { pattern: editLinkPattern, text: 'Edit this page on GitHub' },
        footer: {
          message: 'PlankMD is created and maintained by <a href="https://empilo.app">Empilo.app</a>.<br>Specification and code under the MIT License. Models under CC0.',
          copyright: 'PlankMD contributors',
        },
      },
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      link: '/fr/',
      description: 'Un format Markdown ouvert pour les constructions en planchettes de bois et leurs étapes de montage',
      themeConfig: {
        nav: nav({ spec: 'Spec', player: 'Lecteur', gallery: 'Galerie', use: 'Utiliser', llm: 'LLM', changelog: 'Historique', contributing: 'Contribuer' }, '/fr'),
        editLink: { pattern: editLinkPattern, text: 'Modifier cette page sur GitHub' },
        footer: {
          message: 'PlankMD est créé et maintenu par <a href="https://empilo.app">Empilo.app</a>.<br>Spécification et code sous licence MIT. Modèles sous CC0.',
          copyright: 'Les contributeurs de PlankMD',
        },
        outline: { level: [2, 3], label: 'Sur cette page' },
        docFooter: { prev: 'Page précédente', next: 'Page suivante' },
        langMenuLabel: 'Changer de langue',
        returnToTopLabel: 'Retour en haut',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Thème',
        lightModeSwitchTitle: 'Passer au thème clair',
        darkModeSwitchTitle: 'Passer au thème sombre',
        skipToContentLabel: 'Aller au contenu',
        notFound: {
          title: 'PAGE INTROUVABLE',
          quote: 'Cette planchette ne repose sur rien.',
          linkLabel: "Retour à l'accueil",
          linkText: "Retour à l'accueil",
        },
      },
    },
  },

  markdown: {
    languages: [plankGrammar as any],
    config: (md) => {
      md.use(plankPreviews)
      // Included repository files link to each other with relative paths
      // (../SPEC.md); on the site, those are pages.
      const PAGES: Record<string, string> = { '../SPEC.md': '/spec', './SPEC.md': '/spec', 'SPEC.md': '/spec' }
      md.core.ruler.push('repo-links', (state) => {
        for (const token of state.tokens) {
          for (const child of token.children ?? []) {
            if (child.type !== 'link_open') continue
            const href = child.attrGet('href') ?? ''
            const [path, hash] = href.split('#')
            if (PAGES[path]) child.attrSet('href', PAGES[path] + (hash ? `#${hash}` : ''))
          }
        }
      })
    },
  },

  head: [
    ['script', {}, langRedirect],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo-192.png' }],
    ['meta', { property: 'og:image', content: `${SITE}/logo-512.png` }],
    ['meta', { name: 'theme-color', content: '#8a5a1f' }],
    ['meta', { property: 'og:title', content: 'PlankMD' }],
  ],

  // Every page exists in both languages: tell search engines.
  transformHead({ pageData }) {
    if (pageData.isNotFound) return []
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    const en = path.replace(/^fr\/?/, '')
    const url = (p: string) => `${SITE}/${p}`
    return [
      ['link', { rel: 'alternate', hreflang: 'en', href: url(en) }],
      ['link', { rel: 'alternate', hreflang: 'fr', href: url(`fr/${en}`) }],
      ['link', { rel: 'alternate', hreflang: 'x-default', href: url(en) }],
      ['link', { rel: 'canonical', href: url(path) }],
      ['meta', { property: 'og:description', content: pageData.description || '' }],
    ]
  },

  // The player and the gallery are static pages served from /player/, not
  // VitePress routes; links to them carry target="_self" so that the
  // client-side router lets the browser load them.
  ignoreDeadLinks: [/^\/player\//, /^\/SPEC\.md/, /^\/samples\//, /^\/gallery\//, /^\/llms\.txt/, /^\/docs\//, /^\.\.\/SPEC\.md/],

  themeConfig: {
    logo: '/logo.svg',
    outline: { level: [2, 3] },
    socialLinks: [{ icon: 'github', link: GITHUB }],
    search: {
      provider: 'local',
      options: {
        locales: {
          fr: {
            translations: {
              button: { buttonText: 'Rechercher', buttonAriaLabel: 'Rechercher' },
              modal: {
                displayDetails: 'Afficher les détails',
                resetButtonTitle: 'Effacer la recherche',
                backButtonTitle: 'Fermer la recherche',
                noResultsText: 'Aucun résultat pour',
                footer: { selectText: 'choisir', navigateText: 'naviguer', closeText: 'fermer' },
              },
            },
          },
        },
      },
    },
  },
})
