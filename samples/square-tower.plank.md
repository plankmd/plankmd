---
plankmd: "0.1"
title: Small square tower
lang: en
inventory: 30
difficulty: 1
license: CC0-1.0
palette:
  roof: "#b03a2e"
---

# Small square tower

A hollow log-cabin tower with a roof. 25 planks.

## Step 1: the first layer

Lay two planks flat and parallel, to form two sides of a square. To space
them, lay three planks side by side between them, then take those three away.
Lay the next two planks across the first two, on their ends.

```plank
guide flat-x 0 3 0 repeat=3 offset=0,3,0
flat-x 0 0 0
flat-x 0 12 0
flat-y 0 0 1
flat-y 12 0 1
```

## Step 2: build up the walls

Repeat four times: two planks one way, two planks the other way. Keep the
corners aligned.

```plank
flat-x 0 0 2  repeat=4 offset=0,0,2
flat-x 0 12 2 repeat=4 offset=0,0,2
flat-y 0 0 3  repeat=4 offset=0,0,2
flat-y 12 0 3 repeat=4 offset=0,0,2
```

## Step 3: the roof

Cover the tower with five planks laid side by side.

```plank
flat-x 0 0 10 repeat=5 offset=0,3,0 color=roof
```
