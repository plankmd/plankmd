# Proposal: translations of a model

> Status: proposal for PlankMD v0.2, not part of the format yet.

## The problem

A model has two kinds of content: the geometry (the plank lines, the same in
every language) and the text (the title, the step titles and the step
instructions, written for a reader in one language). The gallery is in
English today, while builders, and children above all, need instructions in
their own language. plankmd.org already has a French site and a French
player interface, but every model still reads in English.

Today the format offers one way to get a French model: copy the whole file
and translate the text. That has three problems:

- **The geometry is duplicated.** A fix to a plank line has to be made again
  in every language. The copies drift apart, and a validated model can turn
  into an invalid one in a single language.
- **Tools cannot tell that two files are the same model.** The player and the
  gallery cannot offer a language switch, and a validator cannot check that a
  translation still matches its original.
- **The licenses mix.** A translation may come from another author, under
  another license, than the model it translates. In a single file, one
  `license` field cannot say so.

## Proposed format

A translation is a companion file next to the model, named after it with the
language tag in the middle:

```
gallery/castle.plank.md       the model (geometry and English text)
gallery/castle.fr.plank.md    its French translation (text only)
gallery/castle.de.plank.md    its German translation (text only)
```

A translation file is an ordinary PlankMD document whose plank blocks are
empty: it has exactly the same steps as the original, in the same order, and
only text. A step is still "one ` ```plank ` block", so the step titles and
texts are found exactly as in a model, and today's parser already reads such
a file without any change.

````markdown
---
plankmd: "0.2"
translation-of: castle.plank.md
lang: fr
title: Le château fort
author: Jane Doe
license: CC0-1.0
---

# Le château fort

## Étape 1 : la première couche des quatre tours

Chaque tour est un carré creux monté comme une cabane en rondins : deux
planchettes côte à côte, puis deux planchettes en travers, posées sur
leurs extrémités.

```plank
```

## Étape 2 : les murs

Relie les tours par des murs d'une planchette d'épaisseur.

```plank
```
````

Frontmatter of a translation:

| Key | Required | Meaning |
|---|---|---|
| `translation-of` | yes | Path of the original model, relative to this file. Its presence is what makes the file a translation. |
| `lang` | yes | BCP 47 tag of the translation. |
| `title` | yes | Translated title. |
| `author`, `license` | no | The translation's own author and license, which may differ from the model's. |
| `plank`, `unit_mm`, `inventory`, `difficulty`, `palette` | no | Ignored: they always come from the original. A validator warns if they are present. |

Body of a translation: one section per step of the original, in the same
order, each ending with an empty ` ```plank ` block. Each section holds the
translated step heading and text. A plank line (or a guide line) inside a
translation block is an error (`E-translation-planks`): geometry lives in one
place only.

### The model description

A translation also carries the model's description, which needs a rule of
its own: it belongs to no step. The rule is structural, with no new key:

> The **description** of a model is the text between the document's level 1
> heading (`# Title`) and the next heading, before the first ` ```plank `
> block. A model whose text before the first block has no level 1 heading
> followed by another heading has no description.

Every model of the gallery is already written this way:

```markdown
# Castle                        the document heading

A square castle: four corner    the description
towers, curtain walls...

## Step 1: the first layer      the title of step 1
```

The text of step 1 does not change: it is still the text after the last
heading before the block. A translation writes its description in the same
place, and tools match it to the original's like a step. A translation
without one shows the original's.

A `description` key in the frontmatter was considered and left out: several
paragraphs read badly in YAML, the text would exist twice (in the body and
in the frontmatter), and the existing models would all have to change. A
short one-line `summary` key, for gallery cards, can come later if needed.

The original keeps its own `lang` (the language its text is written in). It
never lists its translations: tools find them by name, so a translation can
be added without touching the model.

## Meaning for tools

- **Reading.** A tool that shows a model in language `L` reads
  `name.plank.md`, then looks for `name.L.plank.md` next to it. If it finds
  one, it takes the geometry and everything else from the original, and the
  title, the description, the step titles and the step texts from the
  translation, matched by step number. If it does not, it falls back to the original text.
- **Validator.** A file with `translation-of` is validated as a translation:
  - `E-translation-source`: `translation-of` names no file, or the original
    it names does not exist, or is itself a translation;
  - `E-translation-planks`: a translation block contains a plank line;
  - `W-translation-steps`: the translation does not have the same number of
    steps as the original;
  - `W-translation-lang`: `lang` is missing, or equal to the original's;
  - `W-translation-ignored-key`: a key that only the original may set
    (`plank`, `inventory`...) is present.

  A model is validated exactly as before; the validator MAY also check every
  translation found next to it.
- **Player, gallery, booklet, video.** They offer the languages found next to
  the model, and default to the reader's language when one exists. Texts that
  tools generate themselves (button labels, the "hold this plank" advice of
  the [hold proposal](hold.md)) are the tool's own interface translations,
  not part of the model.
- **Readers that ignore `translation-of`** (v0.1) see a valid model with
  steps and no planks. Nothing breaks; they just show an empty construction,
  and the gallery should not list translation files as models.

## Example

The small square tower comes in English and French:

```
samples/square-tower.plank.md      the model: 25 planks and the English text
samples/square-tower.fr.plank.md   its French translation: text only
```

[`square-tower.fr.plank.md`](../../samples/square-tower.fr.plank.md) has
the same three steps as the original, each with an empty block:

````markdown
---
plankmd: "0.2"
translation-of: square-tower.plank.md
lang: fr
title: Petite tour carrée
license: CC0-1.0
---

# Petite tour carrée

Une tour creuse montée comme une cabane en rondins, avec un toit. 25 planchettes.

## Étape 1 : la première couche

Pose deux planchettes à plat et parallèles, pour former deux côtés d'un
carré. [...]

```plank
```

## Étape 2 : monter les murs

[...]

```plank
```

## Étape 3 : le toit

Couvre la tour avec cinq planchettes posées côte à côte.

```plank
```
````

A player showing the tower in French reads both files and builds it from
them:

| Content | Comes from |
|---|---|
| the 25 planks, the guide, the roof color, `inventory`, `difficulty` | `square-tower.plank.md` |
| the title, the description, the three step titles and texts | `square-tower.fr.plank.md` |

A fix to a plank in the original fixes both languages. A fourth step added to
the original makes the validator report `W-translation-steps` on the French
file. The v0.1 validator already reads the French file (3 steps, no planks,
no diagnostics).

The reference player already does this: `PlankMD.translate()` in
`src/plankmd.js` merges a translation into a model, the bundle keeps
translations apart from the models (`PLANKMD_TRANSLATIONS`), and the player
and the gallery show the texts of the translation in the reader's language.
The player also finds the translations of a model listed from GitHub by
their names. The reference validator checks translations: `validate(text,
{ original })` takes the original's text (null when it is missing), and
`plankmd validate` reads the file named by `translation-of` itself.
`source-hash` is not implemented: the choice between the two options below
is still open.

## Keeping translations up to date

A translation matched by step number stays correct while the original keeps
its steps. When a step is added or removed, `W-translation-steps` flags the
translation. A step whose text changed but whose number did not cannot be
detected from the structure alone. Two options for v0.2, to decide:

1. **Nothing more**: the repository history shows what changed, and a
   translator checks the steps of a modified model.
2. **A source fingerprint**: an optional `source-hash` in the translation's
   frontmatter, the SHA-256 of the original's step titles and texts at the
   time of translation, description included. A validator recomputes it and warns
   (`W-translation-stale`) when the original's text has changed since.

The second option is cheap to compute and lets a pipeline find stale
translations automatically. It is the recommended one.

## Recommendations

- Translate the title and every step, never the plank lines or their
  comments.
- Keep numbers, plank counts and measurements exactly as in the original
  ("lay three planks side by side"): the builder checks them against the 3D
  view.
- Use the builder's vocabulary of the target language for orientations
  (flat, on edge, standing; along, across). A short glossary per language in
  `docs/glossary/<lang>.md` keeps translators, people and models alike,
  consistent.
- The LLM instructions (`docs/llm-instructions.md`) should get a "translating
  a model" section: produce a translation file, same steps, empty blocks,
  glossary terms, numbers untouched.

## Alternatives considered

- **Several languages in one file** (a `lang` attribute on headings, or one
  section per language): the file grows with every language, every
  translator edits the same file as the modeller, and one license cannot
  cover text by different authors.
- **A full copy per language**: duplicates the geometry, which is the problem
  this proposal solves.
- **A separate text format** (JSON or YAML keyed by step number): a new
  syntax to specify and to parse, when the PlankMD structure (one step = one
  block, heading = title) already does the job and today's parser reads it.
- **Translation left to each tool**: every tool would invent its own storage,
  and translations could not be shared, reviewed or contributed back to the
  gallery.

## Open questions

- **Discovery outside a repository.** A model shared as a single file or a
  gist has no neighbours to look for. The player could accept a list of
  files, or a translation could be passed alongside the model in the URL.
