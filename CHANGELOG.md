# Changelog

## Unreleased

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
