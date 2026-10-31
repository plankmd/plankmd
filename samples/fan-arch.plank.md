---
plankmd: "0.3"
title: Fan arch
lang: en
inventory: 110
difficulty: 4
author: PlankMD contributors
license: CC0-1.0
expect: falls
date: 2026-10-31
tags: [arch, voussoir, tilt, scaffold]
minutes: 25
view: front,15
palette:
  key: "#b03a2e"
---

# Fan arch

A model that falls on purpose, to see why stone arches are made of wedges.
Planks on their edges, set like the rays of a fan around the middle of the
opening, each one turned five degrees further than the one before: 37
voussoirs on two small buttresses, and a stack of planks that holds them
while they go on. Once that stack comes out, the arch falls.

## Step 1: the buttresses

Two stacks of planks, one on each side, to stop the feet of the arch from
sliding out.

```plank
flat-y -17.5 0 0 repeat=4 offset=0,0,1
flat-y 14.5 0 0  repeat=4 offset=0,0,1
```

## Step 2: the centring and the two halves

Build a stepped stack of planks between the buttresses: the centring, as
wide as fits inside the arch. Then lay the arch from both feet at once: one
plank on its edge on the left, one on the right, each a little more upright
than the one below and resting on it, until the two halves almost meet.

```plank view=front,10
scaffold flat-y -10.5 0 0 repeat=7 offset=3,0,0 until=key
scaffold flat-y -10.5 0 1 repeat=7 offset=3,0,0 until=key
scaffold flat-y -10.5 0 2 repeat=7 offset=3,0,0 until=key
scaffold flat-y -10.5 0 3 repeat=7 offset=3,0,0 until=key
scaffold flat-y -10.5 0 4 repeat=7 offset=3,0,0 until=key
scaffold flat-y -9 0 5 repeat=6 offset=3,0,0 until=key
scaffold flat-y -9 0 6 repeat=6 offset=3,0,0 until=key
scaffold flat-y -7.5 0 7 repeat=5 offset=3,0,0 until=key
scaffold flat-y -7.5 0 8 repeat=5 offset=3,0,0 until=key
scaffold flat-y -6 0 9 repeat=4 offset=3,0,0 until=key
scaffold flat-y -4.5 0 10 repeat=3 offset=3,0,0 until=key
scaffold flat-y -1.5 0 11 repeat=1 offset=3,0,0 until=key
edge-y -0.5 0 12 repeat=18 offset=0,0,0 tilt=x:-90 tilt-step=5 tilt-pivot=0,0.5
edge-y -0.5 0 12 repeat=18 offset=0,0,0 tilt=x:90 tilt-step=-5 tilt-pivot=0,0.5
```

## Step 3: the keystone

Slide the last plank in, straight up, between the two halves. Then slide
the centring out, one plank at a time, along the length of the planks, and
watch the top of the arch sink and the whole fan come down.

A stone voussoir is a wedge: it touches its neighbours over its whole face,
and the arch cannot move. A plank is a rectangle: in a fan, two planks touch
only along their inner edges, with a thin gap that opens outwards. Each
joint is a hinge that can turn about five degrees before it closes, and 36
small hinges add up: the keystone slips down between its neighbours, and
the halves fold in after it. Leave the centring in place, or build the arch
as a corbel, in flat layers that each reach a little further in.

```plank view=front,10
edge-y -0.5 0 12 tilt=x:0 tilt-pivot=0,0.5 id=key color=key
```
