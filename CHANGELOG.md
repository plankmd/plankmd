# Changelog

## Unreleased

- Format v0.2 (`SPEC.md`, and the French spec on the website). Every v0.1
  file stays valid and means the same.
  - **Leaning planks**: `lean=<dir>:<degrees>` tips a plank over, pivoting on
    the bottom edge of its box on that side. Overlaps and contacts that
    involve a leaning plank are checked as boxes in space, within 0.2 u
    (`E-lean`).
  - **Scaffolds**: `scaffold` lines are temporary supports, placed whole and
    removed at the end of their step or after the plank `until=` names.
    Builds are a sequence of moves (`PlankMD.build()`, `result.moves`).
    `W-scaffold-release`, `W-scaffold-floating`, `W-scaffold-wedged`;
    `W-inventory` counts the planks in place at once.
  - **View hints**: `view`, `zoom` and `focus` on a block's opening fence,
    `view` in the frontmatter (`W-view`).
  - **Metadata of shared models**: `url`, `based-on`, `date`, `image`, `tags`
    and `minutes`, checked by `E-frontmatter`.
- Balance check: follows the moves, with scaffolds as bodies while they are
  in place and a check at every removal. Models with leaning planks are not
  checked (`I-unchecked-lean`): the drop test is.
- Drop test: planks turned in space; `--replay` puts scaffolds up and takes
  them away.
- Player: the plank slider goes through the moves, scaffolds in grey;
  leaning planks; the camera turns to the author's views, with an
  "Author's view" button; author, date, time, tags, links and, for a model
  from the web, its photograph.
- Booklet and video: step views, scaffolds with their instructions (sliding
  out in the video), the model's photograph, author, license and address.
- Gallery: thumbnails from the model's view, photographs of models from
  GitHub, a filter by tag.
- Samples: a bridge on a scaffold, and a tent of leaning planks.
- LLM instructions: scaffolds, leaning planks, views and metadata.

- Player and gallery: open the models of a GitHub repository, folder, file
  or gist, in the browser only (`?github=<address>`, or the short link
  `plankmd.org/p?repo=<address>`).
- Booklets: `player/booklet.html` lays a model out as a printable A4
  building booklet (PDF from the print dialog, or `npm run booklet`).
- Videos: `player/video.html` plays and records a building video, and
  `npm run video` renders it to MP4 for YouTube (landscape or vertical).
- The player links to the booklet and the video of the model shown.
- Drop test: `plankmd drop --replay` replays the build plank by plank, and
  `npm run check:gallery` runs it.
- Translations (proposal for v0.2, `docs/proposals/translations.md`): a
  model's text in another language lives in `<name>.<lang>.plank.md` next
  to it. `parse()` returns the model's `description`, `translate()` merges a
  translation into a model, and the player and the gallery show the
  translation in the reader's language (`samples/square-tower.fr.plank.md`).
  `plankmd validate` checks a translation against the original it names
  (`E-translation-source`, `E-translation-planks`, `W-translation-steps`,
  `W-translation-lang`, `W-translation-ignored-key`), and its `source-hash`
  (`plankmd source-hash <model>`) flags a change in the original's text
  (`W-translation-stale`).
  The booklet and the video use the translation in their language too
  (`?lang=fr`, `--lang fr`), and every gallery model reads in French.

## 0.1.0 (draft), 2026-10-11

First public draft.

- Format: six orientations on a grid measured in plank thicknesses, steps as
  fenced blocks, frontmatter, `color`, `id`, `repeat`/`offset`, `rot`,
  `rot-step` and `pivot`.
- Placement order: lines in order, repeated lines interleaved by round, plank
  numbers derived from that order.
- Validation codes, checked at the moment each plank is placed.
- Guides: ruler planks that show and check the gaps of a step.
- Balance check (`src/physics.js`, `--physics`): rigid-block equilibrium with
  friction, after every placement, and a tilting-table margin per step.
  Solved with HiGHS (optional dependency).
- Drop test (`src/drop.js`, player, `plankmd drop`): a Rapier simulation of
  the model, either dropped at once or replayed plank by plank in building
  order (`replay: true`, "Replay build" in the player).
- Reference cases (`test/cases/`) shared by every balance checker.
- Player and gallery in English and French (`player/i18n.js`): `?lang=`, the
  stored choice or the browser's languages, and an EN/FR switch. In French,
  diagnostics are explained from their codes; the validator stays in English.
- Balance check: when the construction falls, the planks reported are where
  it gives way, preferring the lowest ones, not the plank just placed.
- Drop test: a plank that moves a little and stops has settled, not fallen
  (tall leaning stacks sag a few degrees in the engine).
- Samples that fall on purpose: a diving board and a leaning tower.
- Player: the balance check is off by default ("Check balance"), runs in a
  Web Worker even from a page opened from the disk, and shows its progress.
- Balance check: about ten times faster. The linear programs grow one plank
  at a time and re-solve from the previous solution instead of being rebuilt,
  tilts first check the sliding limit, and results stream in two passes: the
  verdict for every placement first (under a second for 200 planks), then
  the tilt of each step.
  Plank geometry and materials are shared: loading a 200-plank model takes
  about 20 ms instead of 200.
- Player: ordinary planks are drawn in bulk (one instanced mesh per size and
  colour, all edges in one line set): 1152 planks take 6 draw calls instead
  of 2019. The scene is only rendered when something changes.
- Gallery: eleven larger models (`gallery/`), up to Notre-Dame de Paris
  (1392 planks, 29 steps), a gallery page in the player
  (`player/gallery.html`), and `npm run check:gallery`.
- Python reference check with compas_cra (`python/`), validated on the same
  cases.
- Samples: the spiral staircase, which could not stand, is replaced by a
  twisted tower; the corbel bridge steps half a width per layer instead of a
  full width, which made each pier tip into the gap.
- Reference implementation (`src/plankmd.js`), CLI validator, 3D player,
  samples and LLM instructions.
