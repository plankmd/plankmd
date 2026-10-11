---
plankmd: "0.1"
title: Corbel bridge
lang: en
inventory: 80
difficulty: 3
license: CC0-1.0
palette:
  deck: "#3b6e8f"
---

# Corbel bridge

Two piers that reach towards each other, layer after layer, then a deck that
joins them. 69 planks, about 47 cm long.

## Step 1: the left pier

Lay two planks flat and parallel, then two across them: one at the back, one
at the front. On each new layer, move everything half a plank width towards
the middle of the bridge. Eight layers in all. Do not move them further: each
layer must sit mostly on the one below, or the pier tips over.

```plank
flat-x 0 0 0  repeat=8 offset=1.5,0,2
flat-x 0 12 0 repeat=8 offset=1.5,0,2
flat-y 0 0 1  repeat=8 offset=1.5,0,2
flat-y 12 0 1 repeat=8 offset=1.5,0,2
```

## Step 2: the right pier

Build the same pier as a mirror image on the right, moving left this time.
To place it, leave two plank lengths between the bottoms of the two piers.
At the top, they must end three plank widths apart.

```plank
guide flat-x 15 0 0             # gap at the bottom: two lengths
guide flat-x 30 0 0
flat-x 45 0 0  repeat=8 offset=-1.5,0,2
flat-x 45 12 0 repeat=8 offset=-1.5,0,2
flat-y 57 0 1  repeat=8 offset=-1.5,0,2
flat-y 45 0 1  repeat=8 offset=-1.5,0,2
guide flat-y 25.5 0 14 repeat=3 offset=3,0,0   # gap at the top: three widths
```

## Step 3: the deck

Lay five planks side by side over the gap, from the last cross plank on the
left to the one on the right.

```plank
flat-x 22.5 0 16 repeat=5 offset=0,3,0 color=deck id=deck
```
