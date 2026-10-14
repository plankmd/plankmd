---
layout: home
title: PlankMD
titleTemplate: An open standard for wooden plank constructions

hero:
  name: PlankMD
  text: An open standard for wooden plank constructions
  tagline: "Describe any build in plain Markdown: every plank, in the order it goes down, with the building steps. One text file that tools can check, show in 3D and print as a booklet. Free and open source."
  image:
    src: /logo-wide.svg
    alt: PlankMD
  actions:
    - theme: brand
      text: Open the player
      link: /player/
      target: _self
    - theme: alt
      text: Read the spec
      link: /spec
    - theme: alt
      text: Gallery
      link: /gallery

features:
  - title: Markdown-first
    details: A .plank.md file is valid Markdown. The prose between blocks is the instruction booklet, the blocks are the planks.
  - title: Built in order
    details: Lines are written in the order the builder places the planks, and the validator checks every plank at that moment. Nothing goes through anything, and nothing floats.
  - title: Measured with planks
    details: Positions are counted in plank thicknesses. Guides are ghost planks that show the builder how much space to leave, and the validator checks the gap.
  - title: Checked for balance
    details: An optional balance check tells whether the construction stands after every plank, and how much tilt each step withstands. A physics engine replays the build.
  - title: AI-native
    details: Short, regular lines that a language model can write and a validator can check, with diagnostics precise enough to fix the model.
  - title: Open
    details: MIT for the specification and the code, CC0 for the models. Brand-neutral, with plank proportions declared in the file.
---

## A first model

````markdown
## Step 1: the first layer

Lay two planks flat and parallel, then two across them, on their ends.

```plank
flat-x 0 0 0
flat-x 0 12 0
flat-y 0 0 1
flat-y 12 0 1
```

## Step 2: build up the walls

```plank
flat-x 0 0 2  repeat=4 offset=0,0,2
flat-x 0 12 2 repeat=4 offset=0,0,2
flat-y 0 0 3  repeat=4 offset=0,0,2
flat-y 12 0 3 repeat=4 offset=0,0,2
```
````

A plank measures 15 × 3 × 1 in plank thicknesses, so most models only use
small integers. `flat-x` lays a plank flat along `x`; the three numbers are
its corner. [Open this tower in the player](/player/#square-tower){target="_self"}.

## What you get

- **[The specification](/spec)**, PlankMD v0.2 (draft): planks lying, standing or
  leaning, guides that measure gaps, scaffolds that hold up what cannot stand
  yet, and the views to show each step from.
- **[A 3D player](/player/){target="_self"}**: steps, plank-by-plank replay, live editing,
  diagnostics, balance check and drop test. Paste or drop a `.plank.md` file,
  or open one from the web with `?src=<url>`.
- **[A gallery](/gallery)** of larger models: a castle, a lighthouse, a pagoda,
  a sailing ship, landmarks, and Notre-Dame de Paris in 1392 planks.
- **[A validator and a library](/use)** for Node and the browser, with no
  dependencies: `npx plankmd validate model.plank.md`.
- **[Instructions for language models](/llm)**: a system prompt that writes
  valid, buildable models.

## Compatibility

<p class="notice">Compatible with KAPLA® planks: the default plank size
(<code>plank: [15, 3, 1]</code>, <code>unit_mm: 7.8</code>) matches them. Any other
planks work too: declare their proportions in the frontmatter.<br>
KAPLA® is a registered trademark of its owner. PlankMD is an independent
project; it is not affiliated with, sponsored or endorsed by the trademark
owner.</p>

PlankMD follows the design principles of [LearnSpec](https://learnspec.org),
an open suite of Markdown formats for learning.
