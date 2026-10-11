---
plankmd: "0.1"
title: Leaning tower
lang: en
inventory: 50
difficulty: 2
license: CC0-1.0
expect: falls
palette:
  flag: "#b03a2e"
---

# Leaning tower

A tower that leans further and further, and still stands. Until a small flag
is put on top. 50 planks: a log-cabin tower of 48, and a flag of two.

## Step 1: the foot of the tower

Build a log-cabin tower: two planks one way, two planks across them. On each
new layer, move everything half a plank width to the right. Three layers.

```plank
guide flat-x 0 3 0 repeat=3 offset=0,3,0   # three widths between the first two planks
flat-x 0 0 0  repeat=3 offset=1.5,0,2
flat-x 0 12 0 repeat=3 offset=1.5,0,2
flat-y 0 0 1  repeat=3 offset=1.5,0,2
flat-y 12 0 1 repeat=3 offset=1.5,0,2
```

## Step 2: lean further

Three more layers, still half a plank width to the right each time. Look at
the tower from the side: its top is now well beyond its foot.

```plank
flat-x 4.5 0 6   repeat=3 offset=1.5,0,2
flat-x 4.5 12 6  repeat=3 offset=1.5,0,2
flat-y 4.5 0 7   repeat=3 offset=1.5,0,2
flat-y 16.5 0 7  repeat=3 offset=1.5,0,2
```

## Step 3: the top, leaning gently

Six layers that lean only a little: half a plank thickness to the right each
time. The tower still stands, but its weight is now close to the edge of its
foot. Do not touch the table.

```plank
flat-x 8 0 12  repeat=6 offset=0.5,0,2
flat-x 8 12 12 repeat=6 offset=0.5,0,2
flat-y 8 0 13  repeat=6 offset=0.5,0,2
flat-y 20 0 13 repeat=6 offset=0.5,0,2
```

## Step 4: the flag

Lay one plank on top, sticking out on the leaning side, then a second one on
it, like a little flag. Two planks are not much, but they are far out, high
up, on the wrong side: the weight of the whole tower moves past the edge of
its foot, and everything topples.

```plank
flat-x 17.5 6 24 color=flag
flat-x 17.5 6 25 color=flag
```
