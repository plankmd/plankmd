---
plankmd: "0.1"
title: Twisted tower
lang: en
inventory: 80
difficulty: 2
license: CC0-1.0
palette:
  marker: "#b03a2e"
---

# Twisted tower

A log-cabin tower that turns a little on every layer. 72 planks, one full
turn. Every layer rests on the four corners of the layer below, so the whole
weight stays on the axis of the tower.

## Step 1: the first third

Lay two planks flat and parallel, three plank widths apart. Lay the next two
across them, then turn each new pair a little further than square: after
nine pairs, the tower has turned a quarter of a turn more than a plain
log-cabin wall.

```plank
guide flat-x -7.5 -4.5 0 repeat=3 offset=0,3,0   # three widths between the first two planks
flat-x -7.5 -7.5 0 color=marker
flat-x -7.5 4.5 0  color=marker
flat-x -7.5 -7.5 1 repeat=11 offset=0,0,1 rot=100 rot-step=100 pivot=0,0
flat-x -7.5 4.5 1  repeat=11 offset=0,0,1 rot=100 rot-step=100 pivot=0,0
```

## Step 2: the second third

Carry on the same way, always turning in the same direction.

```plank
flat-x -7.5 -7.5 12 repeat=12 offset=0,0,1 rot=1200 rot-step=100 pivot=0,0
flat-x -7.5 4.5 12  repeat=12 offset=0,0,1 rot=1200 rot-step=100 pivot=0,0
```

## Step 3: the last third

Twelve more pairs. At the top, the tower has turned all the way round.

```plank
flat-x -7.5 -7.5 24 repeat=12 offset=0,0,1 rot=2400 rot-step=100 pivot=0,0
flat-x -7.5 4.5 24  repeat=12 offset=0,0,1 rot=2400 rot-step=100 pivot=0,0
```
