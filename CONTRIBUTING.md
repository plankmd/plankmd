# Contributing

Issues and pull requests are welcome, in particular:

- **Models.** New samples go in `samples/`, under CC0 (`license: CC0-1.0` in
  the frontmatter), and must pass `npm run validate`. Build them for real
  first: the validator does not check that a model stands up.
- **Spec changes.** Open an issue first. Explain the construction you could
  not describe, and show the lines you would like to write. `SPEC.md` is the
  reference; the French translation on the website (`site/fr/spec.md`) is
  updated in the same pull request.
- **Code.** No runtime dependencies. `npm test` must pass, and after editing
  a sample, run `npm run build:samples` so the player bundles it.

By contributing, you agree that your contribution is released under the MIT
License, or CC0 for models.
