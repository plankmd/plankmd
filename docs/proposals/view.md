# Proposal: view hints

> Status: proposal for PlankMD v0.2, not part of the format yet.

## The problem

Every picture of a model is taken from the same place: the booklet shoots
each step from the front right, slightly above; the gallery thumbnail and
the player's first frame use the same direction; the video orbits at a
fixed height. That is right for a tower and wrong as soon as a model has an
inside or a back:

- the planks of a step go on inside a castle's walls, and the booklet shows
  the walls;
- a staircase climbs the back of a tower, and the reader never sees it;
- a bridge is long and low, and its picture is a line with a lot of sky;
- a roof is laid, and the step that matters is seen edge-on.

The author knows where to look. The format has nowhere to say it.

## Proposed syntax

Attributes on the fenced block's info string, after the word `plank`:

````markdown
## Step 4: the spiral staircase

The stairs climb the back of the tower, so turn it around.

```plank view=back-left,20
flat-x 0 -1.5 0 repeat=36 offset=0,0,1 rot-step=10 pivot=0,0
```
````

| Attribute | Value | Meaning |
|---|---|---|
| `view` | `<direction>[,<elevation>]` | Where the camera is for this step. `<direction>` is a name (below) or an azimuth in degrees; `<elevation>` is in degrees above the horizon, `0` to `90`. |
| `zoom` | number, `1` is the whole model | How close: `2` frames half of the model, around the focus. |
| `focus` | `step`, or an `id` | What the picture is centred on: the planks placed in this step, or one plank. Without it, the whole model. |

Directions, with the azimuth they stand for:

| Name | Azimuth | The camera is |
|---|---|---|
| `front` | 0 | on the viewer's side (`-y`), looking towards `+y` |
| `right` | 90 | at `+x` |
| `back` | 180 | at `+y` |
| `left` | 270 | at `-x` |
| `front-right`, `back-right`, `back-left`, `front-left` | 45, 135, 225, 315 | in between |
| `top` | any | straight above (`elevation` 90) |

The azimuth turns counter-clockwise seen from above, the same way as `rot`.
The v0.1 tools' default is `35,28`: from the front, a little to the right.

The same `view` key in the frontmatter sets the **model's view**: the
cover of the booklet, the gallery thumbnail, the first frame of the player
and the start of the video's orbit:

```yaml
view: front-left,20
```

Rules:

- A step's attributes apply to that step only. A step without `view` uses
  the model's view, or the tool's default. Explicit beats sticky: a reader
  of the file sees where each picture is taken from.
- `focus=step` with no planks in the step (a step of guides only, or the
  empty block of a translation) means the whole model.
- Hints are hints. A tool MAY ignore them, and a viewer may always move the
  camera.

## Meaning for tools

- **Parser.** The info string is `plank` followed by attributes in the
  same `key=value` form as plank lines. The v0.1 parser already reads only
  the first word, so these blocks are plank blocks for every reader.
- **Validator.** `W-view`: a value does not parse (unknown direction name,
  elevation out of range, `focus` naming a plank that does not exist or is
  placed in a later step). The attribute is ignored, nothing else changes.
  An unknown key on the info string is `W-unknown-attribute`, as on a line.
- **Booklet.** Each step's picture is taken from its `view`, framed on its
  `focus`, at its `zoom`. The cover uses the model's view.
- **Video.** The orbit passes through each step's direction while that
  step's planks go on, and eases back to its course afterwards. The model's
  view is where the orbit starts and ends.
- **Player.** When the step changes, the camera turns to the step's view,
  animated. Dragging still orbits freely. The model's view is the camera
  when the model opens. The player could show "the author's view" as a
  button to return to it.
- **Gallery.** The thumbnail is taken from the model's view.
- **Translations.** Views are geometry, not text: the model's `view` is an
  original-only key (`W-translation-ignored-key` in a translation), and the
  info strings of a translation's empty blocks are ignored.
- **Readers that ignore views** lose nothing but the author's advice: the
  model is unchanged.

## Recommendations

- Set a view only where the default hides something: a step inside walls,
  on the back, or edge-on. A file where every step has a view is tiring to
  read, and most steps are fine from the front right.
- Name directions rather than numbers: `back-left` is read at a glance,
  `225` is not.
- For a long, low model, set the model's view with a low elevation
  (`front,12`): the booklet cover and the thumbnail are then the bridge,
  not the sky.
- The LLM instructions should say: add `view` to a step whose planks go on
  inside or behind what is already built, and nowhere else.

## Alternatives considered

- **A `view` line inside the block**, like `guide`. A line in a plank
  block should be a plank; the info string already exists for what is
  about the block.
- **A view in the prose** (`[view: back]`). It would be visible in every
  Markdown renderer as text, and tools would have to scan prose.
- **Sticky views** (a step's view holds until changed). Convenient for a
  run of steps inside a castle, but a reader of step 7 has to look back to
  step 4 to know where its picture is taken from.
- **Cut-away views** (hide a wall to see inside). Powerful, and a different
  thing: it changes what is drawn, not where from. It could come later as a
  `hide=<id>` attribute on the block, and it is out of this proposal.
- **A camera position in coordinates.** `target` and distances in units
  are what the renderer uses, and nothing an author wants to write. A
  direction and a focus cover the need.

## Open questions

- Whether the video should honour a step's `zoom`, or keep the whole model
  in frame and only turn.
- A `view` on a guide-only step: the guides are shown, so the view applies;
  nothing special.
- Whether `focus=<id>` should also light the plank (as the player's "lit"
  highlight does) in the booklet.
