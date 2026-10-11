---
plankmd: "0.1"
title: Castle
lang: en
inventory: 240
difficulty: 4
license: CC0-1.0
palette:
  gate: "#8a5a32"
---

# Castle

A square castle: four corner towers, curtain walls with battlements, a small
tower in the back wall and a corbelled gate in the front wall. 234 planks.

## Step 1: the first layer of the four towers

Each tower is a hollow square built like a log cabin: two planks side by side, then two planks across them on their ends. To space the two planks of a tower, lay three planks side by side between them, then take them away. Place the four towers three plank lengths apart: lay three planks end to end along the front and along the left side, then take them away.

```plank
# guides: inside each tower, three widths between the two planks
guide flat-x 0 3 0 repeat=3 offset=0,3,0
guide flat-x 60 3 0 repeat=3 offset=0,3,0
guide flat-x 0 63 0 repeat=3 offset=0,3,0
guide flat-x 60 63 0 repeat=3 offset=0,3,0
# guides: three lengths between the towers, along the front and along the left side
guide flat-x 15 0 0 repeat=3 offset=15,0,0
guide flat-y 0 15 1 repeat=3 offset=0,15,0
flat-x 0 0 0  repeat=1 offset=0,0,2
flat-x 0 12 0 repeat=1 offset=0,0,2
flat-y 0 0 1 repeat=1 offset=0,0,2
flat-y 12 0 1 repeat=1 offset=0,0,2
flat-x 60 0 0  repeat=1 offset=0,0,2
flat-x 60 12 0 repeat=1 offset=0,0,2
flat-y 60 0 1 repeat=1 offset=0,0,2
flat-y 72 0 1 repeat=1 offset=0,0,2
flat-x 0 60 0  repeat=1 offset=0,0,2
flat-x 0 72 0 repeat=1 offset=0,0,2
flat-y 0 60 1 repeat=1 offset=0,0,2
flat-y 12 60 1 repeat=1 offset=0,0,2
flat-x 60 60 0  repeat=1 offset=0,0,2
flat-x 60 72 0 repeat=1 offset=0,0,2
flat-y 60 60 1 repeat=1 offset=0,0,2
flat-y 72 60 1 repeat=1 offset=0,0,2
```

## Step 2: raise the towers

Repeat four times: two planks one way, two planks the other way. Keep the corners aligned.

```plank
flat-x 0 0 2  repeat=4 offset=0,0,2
flat-x 0 12 2 repeat=4 offset=0,0,2
flat-y 0 0 3 repeat=4 offset=0,0,2
flat-y 12 0 3 repeat=4 offset=0,0,2
flat-x 60 0 2  repeat=4 offset=0,0,2
flat-x 60 12 2 repeat=4 offset=0,0,2
flat-y 60 0 3 repeat=4 offset=0,0,2
flat-y 72 0 3 repeat=4 offset=0,0,2
flat-x 0 60 2  repeat=4 offset=0,0,2
flat-x 0 72 2 repeat=4 offset=0,0,2
flat-y 0 60 3 repeat=4 offset=0,0,2
flat-y 12 60 3 repeat=4 offset=0,0,2
flat-x 60 60 2  repeat=4 offset=0,0,2
flat-x 60 72 2 repeat=4 offset=0,0,2
flat-y 60 60 3 repeat=4 offset=0,0,2
flat-y 72 60 3 repeat=4 offset=0,0,2
```

## Step 3: the side walls

Between the towers, build a wall on each side: three planks end to end, stacked eight high. Centre the wall on the towers.

```plank
# left wall (x = 6), then right wall (x = 66): three planks end to end, eight layers
flat-y 6 15 0 repeat=8 offset=0,0,1
flat-y 6 30 0 repeat=8 offset=0,0,1
flat-y 6 45 0 repeat=8 offset=0,0,1
flat-y 66 15 0 repeat=8 offset=0,0,1
flat-y 66 30 0 repeat=8 offset=0,0,1
flat-y 66 45 0 repeat=8 offset=0,0,1
```

## Step 4: the back wall

Build a small tower in the middle, the same way as the big ones but only eight layers high. To space its planks, use three planks as before. Then build the wall on each side of it, one plank long and eight high.

```plank
# a small tower in the middle of the back wall
guide flat-x 30 63 0 repeat=3 offset=0,3,0
flat-x 30 60 0  repeat=4 offset=0,0,2
flat-x 30 72 0 repeat=4 offset=0,0,2
flat-y 30 60 1 repeat=4 offset=0,0,2
flat-y 42 60 1 repeat=4 offset=0,0,2
# back wall, on each side of the small tower
flat-x 15 66 0 repeat=8 offset=0,0,1
flat-x 45 66 0 repeat=8 offset=0,0,1
```

## Step 5: the front wall and the gate

Build two wall pieces, one plank long and five high, with one plank length between them: lay a plank in the gap to measure it, then take it away.

```plank
guide flat-x 30 6 0                          # the gate is one plank length wide
flat-x 15 6 0 repeat=5 offset=0,0,1
flat-x 45 6 0 repeat=5 offset=0,0,1
```

## Step 6: the arch of the gate

Add two layers on each side, each moving half a plank width into the gap. The planks are brown. Take care to move the left and the right side the same way.

```plank
# the corbel: each layer moves towards the middle by half a width
flat-x 16.5 6 5 repeat=2 offset=1.5,0,1 color=gate
flat-x 43.5 6 5 repeat=2 offset=-1.5,0,1 color=gate
```

## Step 7: the lintel

Finish the wall with a layer of three planks: the middle one is the lintel above the gate, brown like the arch.

```plank
# the last layer: wall, lintel, wall
flat-x 15 6 7
flat-x 30 6 7 color=gate
flat-x 45 6 7
```

## Step 8: the tower tops

On each big tower, lay three planks side by side with a plank width between them, then repeat once on top. Do the same on the small tower, one layer only. These are the battlements.

```plank
flat-x 0 0 10 repeat=2 offset=0,0,1
flat-x 0 6 10 repeat=2 offset=0,0,1
flat-x 0 12 10 repeat=2 offset=0,0,1
flat-x 60 0 10 repeat=2 offset=0,0,1
flat-x 60 6 10 repeat=2 offset=0,0,1
flat-x 60 12 10 repeat=2 offset=0,0,1
flat-x 0 60 10 repeat=2 offset=0,0,1
flat-x 0 66 10 repeat=2 offset=0,0,1
flat-x 0 72 10 repeat=2 offset=0,0,1
flat-x 60 60 10 repeat=2 offset=0,0,1
flat-x 60 66 10 repeat=2 offset=0,0,1
flat-x 60 72 10 repeat=2 offset=0,0,1
# the small back tower
flat-x 30 60 8
flat-x 30 66 8
flat-x 30 72 8
```

## Step 9: the battlements of the walls

Lay planks across the top of every wall, a plank width apart, so that they stick out on both sides. Keep the first and the last plank against a tower.

```plank
# front wall: eight teeth, a plank width apart
flat-y 15 0 8 repeat=8 offset=6,0,0
# back wall: three teeth on each side of the small tower
flat-y 15 60 8 repeat=3 offset=6,0,0
flat-y 45 60 8 repeat=3 offset=6,0,0
# side walls
flat-x 0 15 8 repeat=8 offset=0,6,0
flat-x 60 15 8 repeat=8 offset=0,6,0
```
