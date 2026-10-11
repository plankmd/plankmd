# Releasing

## A new version of the package

1. Update `version` in `package.json` and add an entry to `CHANGELOG.md`.
2. `npm run build:samples`, then `npm test` and `npm run check:gallery`.
3. Commit, then tag: `git tag v0.1.1 && git push origin main --tags`.
4. `npm publish` (the `prepublishOnly` script runs the tests again).
   Check the contents first with `npm pack --dry-run`.
5. Create a GitHub release from the tag, with the changelog entry.

## The website

[plankmd.org](https://plankmd.org) is deployed to Cloudflare Pages by
`.github/workflows/site.yml` on every push to `main`; pull requests from this
repository get a preview URL. The workflow needs two repository secrets:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | An API token with the account permission *Cloudflare Pages: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID |

The Pages project is named `plankmd`. See [`site/README.md`](./site/README.md)
to build the site locally.
