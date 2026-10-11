---
plankmd: "0.1"
title: Amphitheatre
lang: en
inventory: 180
difficulty: 4
license: CC0-1.0
palette:
  sand: "#d9b77a"
---

# Amphitheatre

An amphitheatre inspired by the Colosseum in Rome: a ring of two arcades and a top storey around a sandy arena, with two rings of seats inside. 174 planks. The ring is eight sides, made by turning planks around the middle. Every storey is stacks of flat planks with openings between them, and a ring of planks laid over the openings carries the next storey.

## Step 1: the first arcade

Build a ring of eight stacks of five flat planks. Start with the stack at the back, then turn each new stack an eighth of a turn further round, the same way each time, until the ring is closed. Between two stacks there is an opening, an arch. To check the first one, lay a plank across it on the inside of the ring, then take it away.

```plank
# the opening between two piers is 3 u wide at the inner face
guide flat-y -1.5 16.026290612 0 rot=337.5 pivot=0,0
# eight piers, five planks high
flat-x -7.5 22.026290612 0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 0 rot=315 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 0 rot=270 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 0 rot=225 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 0 rot=180 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 0 rot=135 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 0 rot=90 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 0 rot=45 pivot=0,0 repeat=5 offset=0,0,1
```

## Step 2: the first arches

Lay eight planks over the openings, each one centred on an opening and resting on the two stacks beside it.

```plank
# lintels, z = 5
flat-x -7.5 22.026290612 5 rot=337.5 pivot=0,0
flat-x -7.5 22.026290612 5 rot=292.5 pivot=0,0
flat-x -7.5 22.026290612 5 rot=247.5 pivot=0,0
flat-x -7.5 22.026290612 5 rot=202.5 pivot=0,0
flat-x -7.5 22.026290612 5 rot=157.5 pivot=0,0
flat-x -7.5 22.026290612 5 rot=112.5 pivot=0,0
flat-x -7.5 22.026290612 5 rot=67.5 pivot=0,0
flat-x -7.5 22.026290612 5 rot=22.5 pivot=0,0
```

## Step 3: the second arcade

Stack eight piers again on the arches, five planks high. Each pier is above a pier of the first arcade, resting on the ends of the planks below.

```plank
# piers, z = 6
flat-x -7.5 22.026290612 6 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 6 rot=315 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 6 rot=270 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 6 rot=225 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 6 rot=180 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 6 rot=135 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 6 rot=90 pivot=0,0 repeat=5 offset=0,0,1
flat-x -7.5 22.026290612 6 rot=45 pivot=0,0 repeat=5 offset=0,0,1
```

## Step 4: the second arches

Lay eight planks over the new openings, as before.

```plank
# lintels, z = 11
flat-x -7.5 22.026290612 11 rot=337.5 pivot=0,0
flat-x -7.5 22.026290612 11 rot=292.5 pivot=0,0
flat-x -7.5 22.026290612 11 rot=247.5 pivot=0,0
flat-x -7.5 22.026290612 11 rot=202.5 pivot=0,0
flat-x -7.5 22.026290612 11 rot=157.5 pivot=0,0
flat-x -7.5 22.026290612 11 rot=112.5 pivot=0,0
flat-x -7.5 22.026290612 11 rot=67.5 pivot=0,0
flat-x -7.5 22.026290612 11 rot=22.5 pivot=0,0
```

## Step 5: the top storey

Add a storey of three layers: a ring of eight planks, a ring turned by half a step so that each plank bridges two others, then a last ring like the first. The openings close up into small windows.

```plank
# z = 12 and z = 14: piers
flat-x -7.5 22.026290612 12 repeat=2 offset=0,0,2
flat-x -7.5 22.026290612 12 rot=315 pivot=0,0 repeat=2 offset=0,0,2
flat-x -7.5 22.026290612 12 rot=270 pivot=0,0 repeat=2 offset=0,0,2
flat-x -7.5 22.026290612 12 rot=225 pivot=0,0 repeat=2 offset=0,0,2
flat-x -7.5 22.026290612 12 rot=180 pivot=0,0 repeat=2 offset=0,0,2
flat-x -7.5 22.026290612 12 rot=135 pivot=0,0 repeat=2 offset=0,0,2
flat-x -7.5 22.026290612 12 rot=90 pivot=0,0 repeat=2 offset=0,0,2
flat-x -7.5 22.026290612 12 rot=45 pivot=0,0 repeat=2 offset=0,0,2
# z = 13: bridging planks
flat-x -7.5 22.026290612 13 rot=337.5 pivot=0,0
flat-x -7.5 22.026290612 13 rot=292.5 pivot=0,0
flat-x -7.5 22.026290612 13 rot=247.5 pivot=0,0
flat-x -7.5 22.026290612 13 rot=202.5 pivot=0,0
flat-x -7.5 22.026290612 13 rot=157.5 pivot=0,0
flat-x -7.5 22.026290612 13 rot=112.5 pivot=0,0
flat-x -7.5 22.026290612 13 rot=67.5 pivot=0,0
flat-x -7.5 22.026290612 13 rot=22.5 pivot=0,0
```

## Step 6: the upper seats

Inside the wall, leave a corridor three planks wide. To measure it, lay one plank across, then take it away. Stack six planks in each of six places around the ring.

```plank
# corridor: 3 u between the wall and the seats
guide flat-x -7.5 19.026290612 0
# six stacks of six planks
flat-x -7.5 16.026290612 0 repeat=6 offset=0,0,1
flat-x -7.5 16.026290612 0 rot=300 pivot=0,0 repeat=6 offset=0,0,1
flat-x -7.5 16.026290612 0 rot=240 pivot=0,0 repeat=6 offset=0,0,1
flat-x -7.5 16.026290612 0 rot=180 pivot=0,0 repeat=6 offset=0,0,1
flat-x -7.5 16.026290612 0 rot=120 pivot=0,0 repeat=6 offset=0,0,1
flat-x -7.5 16.026290612 0 rot=60 pivot=0,0 repeat=6 offset=0,0,1
```

## Step 7: the lower seats

Inside, leave another corridor of the same width. Stack three planks in each of four places, one on each side.

```plank
guide flat-x -7.5 13.026290612 0
# four stacks of three planks
flat-x -7.5 10.026290612 0 repeat=3 offset=0,0,1
flat-x -7.5 10.026290612 0 rot=270 pivot=0,0 repeat=3 offset=0,0,1
flat-x -7.5 10.026290612 0 rot=180 pivot=0,0 repeat=3 offset=0,0,1
flat-x -7.5 10.026290612 0 rot=90 pivot=0,0 repeat=3 offset=0,0,1
```

## Step 8: the arena

Lay six planks side by side on the ground in the middle, to make the sand of the arena.

```plank
# sand floor
flat-x -7.5 -9 0 repeat=6 offset=0,3,0 color=sand
```
