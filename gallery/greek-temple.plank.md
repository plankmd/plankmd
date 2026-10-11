---
plankmd: "0.1"
title: Greek temple
lang: en
inventory: 210
difficulty: 3
license: CC0-1.0
palette:
  roof: "#b5532f"
---

# Greek temple

A temple inspired by the Parthenon: a stepped base, a row of four columns in front of a walled inner room, a flat ceiling and a stepped pediment roof. 202 planks.

## Step 1: the first step

Lay the biggest step of the base: three planks end to end in each row, fourteen rows side by side. Keep the rows tight against each other.

```plank
flat-x -7.5 -6 0 repeat=14 offset=0,3,0
flat-x 7.5 -6 0 repeat=14 offset=0,3,0
flat-x 22.5 -6 0 repeat=14 offset=0,3,0
```

## Step 2: the second step

Lay the second step on top, two planks end to end in each row, twelve rows. It leaves one plank width of the first step free at the front and at the back.

```plank
flat-x 0 -3 1 repeat=12 offset=0,3,0
flat-x 15 -3 1 repeat=12 offset=0,3,0
```

## Step 3: the columns

Raise four columns at the front: each one is a stack of seven planks lying along the depth of the temple. To space them, lay two planks side by side between the columns as a ruler, then take them away.

```plank
guide flat-y 3 0 2 repeat=2 offset=3,0,0    # gap between columns: two widths
guide flat-y 12 0 2 repeat=2 offset=3,0,0
guide flat-y 21 0 2 repeat=2 offset=3,0,0
flat-y 0 0 2 repeat=7 offset=0,0,1
flat-y 9 0 2 repeat=7 offset=0,0,1
flat-y 18 0 2 repeat=7 offset=0,0,1
flat-y 27 0 2 repeat=7 offset=0,0,1
```

## Step 4: the inner room

Behind the columns, build the walls of the inner room like a log cabin: planks along the width at the front and the back, then planks along the depth at both sides and in the middle, and so on. Four layers of the first kind, three of the second.

```plank
# layers 1, 3, 5, 7 (front and back walls)
flat-x 0 15 2 repeat=4 offset=0,0,2
flat-x 15 15 2 repeat=4 offset=0,0,2
flat-x 0 27 2 repeat=4 offset=0,0,2
flat-x 15 27 2 repeat=4 offset=0,0,2
# inner room: layers 2, 4, 6 (cross walls: both sides and the middle)
flat-y 0 15 3 repeat=3 offset=0,0,2
flat-y 12 15 3 repeat=3 offset=0,0,2
flat-y 15 15 3 repeat=3 offset=0,0,2
flat-y 27 15 3 repeat=3 offset=0,0,2
```

## Step 5: the ceiling

Lay the ceiling. Over the columns, planks along the width, five rows of two. Over the inner room, planks along the depth, ten side by side.

```plank
flat-x 0 0 9 repeat=5 offset=0,3,0
flat-x 15 0 9 repeat=5 offset=0,3,0
flat-y 0 15 9 repeat=10 offset=3,0,0
```

## Step 6: the roof

Build the stepped pediment roof from stacks of planks lying along the depth, front half and back half. From each side, the stacks get one plank taller as you go in: one, two, three, four, five, then the two in the middle are the same height as their neighbours. Use the coloured planks.

```plank
flat-y 0 0 10 color=roof
flat-y 0 15 10 color=roof
flat-y 3 0 10 repeat=2 offset=0,0,1 color=roof
flat-y 3 15 10 repeat=2 offset=0,0,1 color=roof
flat-y 6 0 10 repeat=3 offset=0,0,1 color=roof
flat-y 6 15 10 repeat=3 offset=0,0,1 color=roof
flat-y 9 0 10 repeat=4 offset=0,0,1 color=roof
flat-y 9 15 10 repeat=4 offset=0,0,1 color=roof
flat-y 12 0 10 repeat=5 offset=0,0,1 color=roof
flat-y 12 15 10 repeat=5 offset=0,0,1 color=roof
flat-y 15 0 10 repeat=5 offset=0,0,1 color=roof
flat-y 15 15 10 repeat=5 offset=0,0,1 color=roof
flat-y 18 0 10 repeat=4 offset=0,0,1 color=roof
flat-y 18 15 10 repeat=4 offset=0,0,1 color=roof
flat-y 21 0 10 repeat=3 offset=0,0,1 color=roof
flat-y 21 15 10 repeat=3 offset=0,0,1 color=roof
flat-y 24 0 10 repeat=2 offset=0,0,1 color=roof
flat-y 24 15 10 repeat=2 offset=0,0,1 color=roof
flat-y 27 0 10 color=roof
flat-y 27 15 10 color=roof
```
