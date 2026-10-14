# Releasing

## A new version of the package

1. Update `version` in `package.json` and add an entry to `CHANGELOG.md`.
2. `npm run build:samples`, then `npm test` and `npm run check:gallery`.
3. Commit, then tag: `git tag v0.1.1 && git push origin main --tags`.
4. `npm publish` (the `prepublishOnly` script runs the tests again).
   Check the contents first with `npm pack --dry-run`.
5. Create a GitHub release from the tag, with the changelog entry.

## The website

[plankmd.org](https://plankmd.org) is a Cloudflare Worker named `plankmd`
that serves the built site as static assets (`wrangler.jsonc`). Cloudflare
Workers Builds is connected to this repository and deploys every push to
`main`:

| Setting | Value |
|---|---|
| Build command | `cd site && npm ci && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler preview` (a preview per pull request; needs the `previews` block of `wrangler.jsonc`) |
| Root directory | the repository root |

`.github/workflows/site.yml` only checks that the site builds. See
[`site/README.md`](./site/README.md) to build it locally.
