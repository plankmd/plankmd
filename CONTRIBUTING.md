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

## Commit messages

Commits follow [Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <summary>

<body: what changed and why, wrapped at 72 columns>

<footers: BREAKING CHANGE: ..., Fixes #12, Co-Authored-By: ...>
```

- **Summary**: imperative mood ("add", not "added"), lower case first
  letter, no final period, the whole first line at most 72 characters.
- **Type**:

  | Type | Use it for |
  |---|---|
  | `feat` | A new capability: a format feature, a validator rule, a player feature |
  | `fix` | A bug fix, or a correction to the spec |
  | `model` | A new or changed model in `samples/` or `gallery/` |
  | `docs` | Documentation only: README, guides, comments, website text |
  | `test` | Tests and reference cases only |
  | `refactor` | Code changes that change no behaviour |
  | `perf` | Faster, same behaviour |
  | `style` | Formatting only |
  | `build` | Packaging, dependencies, generated files |
  | `ci` | GitHub workflows, deployment |
  | `chore` | Anything else that does not touch what users see |
  | `revert` | Reverts an earlier commit |

- **Scope** (optional): `spec`, `lib` (`src/plankmd.js`), `cli`, `physics`,
  `drop`, `player`, `i18n`, `site`, `samples`, `gallery`, `llm`, `python`,
  `deps`, `release`, `contributing`.
- **Breaking changes**: a change to the format that makes valid files
  invalid, or changes what they mean, adds `!` after the type or scope and a
  `BREAKING CHANGE:` footer that says how to update files. The same goes for
  a breaking change to the library API or the CLI.

Examples:

```
feat(spec): allow leaning planks with rot-x and rot-y
fix(physics): report the lowest failing plank when a tower falls
model(gallery): add Notre-Dame de Paris
docs(site): add live 3D previews to the spec examples
feat(spec)!: measure positions from the plank centre

BREAKING CHANGE: positions are now the centre of the bounding box. Add half
the plank size to every position to update a v0.1 file.
```

Pull requests are squash-merged, so the pull request title follows the same
convention: it becomes the commit message on `main`. CI checks the title and
every commit of the pull request (`scripts/check-commit-message.js`). To
check your commits as you write them:

```bash
git config core.hooksPath .githooks
```

By contributing, you agree that your contribution is released under the MIT
License, or CC0 for models.
