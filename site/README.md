# plankmd.org

Source of the [plankmd.org](https://plankmd.org) website, built with
[VitePress](https://vitepress.dev).

```bash
cd site
npm install
npm run dev      # http://localhost:5173
npm run build    # into site/.vitepress/dist
npm run preview
```

`npm run dev` and `npm run build` first run `scripts/sync.mjs`, which
regenerates `player/samples.js` and copies the player, the reference
implementation, the samples, the gallery, `SPEC.md`, `llms.txt` and the LLM
instructions into `public/`, with the same layout as in the repository. They
are served as static files: `/player/`, `/SPEC.md`, `/samples/*.plank.md`.
The pages include the repository files (`SPEC.md`, `CHANGELOG.md`,
`docs/llm-instructions.md`) instead of copying them, so there is one source.

The PlankMD examples of the spec and the home page get a live 3D preview
(`.vitepress/theme/PlankPreview.vue`, added by the `plankPreviews` plugin in
`config.mts`), drawn with the reference implementation, and a link that opens
them in the player (`/player/#code=<base64url>`).

The site is in English (root) and French (`fr/`). On a first visit, a
visitor whose browser prefers French to English is sent to the French page
(`.vitepress/lang-redirect.js`); following a link to the other language
records the choice. `fr/spec.md` is a translation of `SPEC.md`, which is the
reference: update both together. The French LLM page includes the English
system prompt, which stays the same in every language.

The site is deployed by Cloudflare Workers Builds on every push to `main`:
the Worker `plankmd` serves `site/.vitepress/dist` as static assets
(`../wrangler.jsonc`). `public/_headers` and `public/_redirects` are applied
by Cloudflare.
