# Proposal: metadata for shared models

> Status: accepted, part of PlankMD v0.2 (`SPEC.md`), and implemented in
> the reference tools. This page keeps the reasons and the alternatives.

## The problem

A `.plank.md` file travels: it is dropped on the player, pasted in the
source panel, published in a gist, listed in a GitHub repository, printed as
a booklet, rendered to a video. Once it has left its author's folder, the
file is all there is. v0.1 frontmatter has `author` and `license`, and says
that unknown keys are allowed and ignored, so tools can add their own. That
is the problem: each tool would add its own, and they would never agree.

What a shared model needs, and the format cannot say today:

- **where it comes from**: the page it was published on, so that a copy
  can point back;
- **what it is derived from**: a remix of someone else's castle should
  credit the castle, and its license should allow the remix;
- **when**: a date, so that two versions of the same model can be told
  apart;
- **what it looks like built**: a photograph of the real thing, which
  sells a model better than any render, for the gallery card and the
  booklet cover;
- **how to find it**: keywords, so that a gallery of two hundred models
  can be filtered;
- **how long it takes**: a workshop leader plans with minutes, not with a
  difficulty from 1 to 5.

## Proposed keys

All optional, all in the frontmatter next to the v0.1 keys:

```yaml
---
plankmd: "0.2"
title: Castle with a drawbridge
lang: en
author: Jane Doe
license: CC-BY-4.0
url: https://gist.github.com/jane/0e9490ed9226cb4e23929637af0cfa68
based-on: https://github.com/someone/castles/blob/main/castle.plank.md
date: 2026-10-14
image: castle.jpg
tags: [castle, medieval, bridge]
minutes: 45
---
```

| Key | Value | Meaning |
|---|---|---|
| `author` | text | The model's author, as in v0.1. A name, with a site or a handle if wanted: `Jane Doe (https://jane.example)`. |
| `license` | SPDX identifier | As in v0.1. Without it, the model is all rights reserved, and tools say so. `CC0-1.0` and `CC-BY-4.0` are the ones to recommend for sharing. |
| `url` | absolute `https:` URL | The page where this model lives: a gist, a file on GitHub, a web page. Where a copy points back to. |
| `based-on` | absolute `https:` URL, or text | The model this one is derived from. A URL when it has one, else a title and an author. |
| `date` | `YYYY-MM-DD` | The date of this version of the model. |
| `image` | URL or relative path | A photograph or picture of the built model. A relative path is resolved next to the file: in a repository, the file beside it; in a gist, the file of that name in the same gist. |
| `tags` | inline list of words | Keywords for search and filters. Lower-case, no spaces inside a tag. |
| `minutes` | positive integer | How long the build takes a builder of the stated `difficulty`, about. |

Frontmatter stays a flat mapping plus `palette`: `tags` is an inline list,
like `plank: [15, 3, 1]` already is. The keys are **reserved**: tools that
show, list or print a model use them, and nothing else, for these meanings.
Unknown keys stay allowed and ignored.

## Meaning for tools

- **Validator.** `E-frontmatter` when a value has the wrong shape: `date`
  not a calendar date, `minutes` not a positive integer, `tags` not a list
  of words, `url` or `based-on` not an absolute `https:` URL (text is fine
  for `based-on`), `image` a relative path with `..` in it. No warning for
  an absent key: everything here is optional.
- **Player.** The source panel shows "by Jane Doe, CC-BY-4.0, 2026-10-14",
  with `url` as a link when the model was not already opened from it, and
  "after" the `based-on` model. The player SHOULD load `image` only for a
  model that itself came from the network (`?src=`, `?github=`), not for
  text pasted or dropped: a pasted file must not make the browser fetch a
  picture from a stranger's server.
- **Gallery.** The card shows the `image` when there is one, the render
  otherwise; `tags` feed a filter; `author` and `minutes` go in the facts
  line. A GitHub listing (`?github=`) resolves relative `image` paths
  against the repository or the gist.
- **Booklet.** The cover shows the photograph when there is one, and the
  facts: author, license, date, minutes, and `url` in full so that a printed
  booklet leads back to the file. The last page credits `based-on`.
- **Video.** The end card shows author, license and `url`.
- **Translations** ([translations.md](translations.md)). `url`, `based-on`,
  `date`, `image`, `tags` and `minutes` belong to the original and are
  ignored in a translation (`W-translation-ignored-key`). A translation's
  own `author` names the translator, as today.
- **LLM instructions.** The system prompt should fill `author` with what
  the user said, `license` with `CC0-1.0` unless told otherwise, `date`
  with today, and `tags` with three to five words. Never invent `url`,
  `based-on` or `image`.

## Recommendations

- A model published for others should carry at least `author`, `license`
  and `date`. The validator could say so with an `I-` note, not a warning:
  a file for one's own drawer needs nothing.
- `based-on` is a credit, not a mechanism: the format does not fetch or
  diff the original. Respect the original's license; `CC-BY` needs the
  credit, `CC0` does not, and a model without a license cannot be remixed.
- Keep `tags` to what a stranger would search for: the kind of building,
  the size, the technique (`arch`, `spiral`, `roof`).

## Alternatives considered

- **Leave it to each tool.** That is v0.1, and the reason for this
  proposal: a key the player shows and the booklet ignores is worse than
  none.
- **A structured `author` mapping** (name, url, email). Frontmatter stays
  flat on purpose, and a name with a site in brackets covers the need.
- **An `id` or UUID for the model.** Nothing resolves it; `url` is the
  identifier that works, and `date` tells versions apart.
- **Embedding the picture** as a data URL. It would make the file huge and
  unreadable in an editor, against Markdown-first.
- **`age` instead of `difficulty`.** The same thing twice; `difficulty`
  already says "1 (toddler) to 5 (expert)".

## Open questions

- Whether `license` should get a `W-frontmatter` when absent in a model
  that has a `url`, since a published model without a license cannot be
  reused.
- Several authors: a comma-separated `author`, or an `authors` list.
- Whether `image` may also be a list, for several photographs in the
  booklet.
