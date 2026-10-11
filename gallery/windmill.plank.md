---
plankmd: "0.1"
title: Windmill
lang: en
inventory: 150
difficulty: 3
license: CC0-1.0
palette:
  sail: "#b03a2e"
---

# Windmill

A tall tower windmill inspired by the old stone mills of the countryside: a round-ish tower that narrows towards the top, a platform, red sails and a small roof. 144 planks. The sails lie flat, as a pinwheel on the platform, because planks cannot lean or hang in the air; the roof presses on their hub to hold them. The tower is made of layers turned by an eighth of a turn: a plank on each side, then a plank on each corner.

## Step 1: the base

Lay four planks flat around the middle, one on each side, with a gap at every corner. To space the front and back planks, lay one plank lengthwise and three planks across between them, then take them away. Lay the next four planks turned by an eighth of a turn, so each one bridges two planks below. Keep going, one layer on top of the other, and move every layer a little closer to the middle.

```plank
guide flat-y -1.5 -12 0   # from the back plank to the middle
guide flat-x -7.5 3 0 repeat=3 offset=0,3,0   # then three widths up to the front plank
# layer 1, z = 0
flat-x -7.5 12 0
flat-x -7.5 12 0 rot=90 pivot=0,0
flat-x -7.5 12 0 rot=180 pivot=0,0
flat-x -7.5 12 0 rot=270 pivot=0,0
# layer 2, z = 1
flat-x -7.5 11.85 1 rot=45 pivot=0,0
flat-x -7.5 11.85 1 rot=135 pivot=0,0
flat-x -7.5 11.85 1 rot=225 pivot=0,0
flat-x -7.5 11.85 1 rot=315 pivot=0,0
# layer 3, z = 2
flat-x -7.5 11.7 2
flat-x -7.5 11.7 2 rot=90 pivot=0,0
flat-x -7.5 11.7 2 rot=180 pivot=0,0
flat-x -7.5 11.7 2 rot=270 pivot=0,0
# layer 4, z = 3
flat-x -7.5 11.55 3 rot=45 pivot=0,0
flat-x -7.5 11.55 3 rot=135 pivot=0,0
flat-x -7.5 11.55 3 rot=225 pivot=0,0
flat-x -7.5 11.55 3 rot=315 pivot=0,0
# layer 5, z = 4
flat-x -7.5 11.4 4
flat-x -7.5 11.4 4 rot=90 pivot=0,0
flat-x -7.5 11.4 4 rot=180 pivot=0,0
flat-x -7.5 11.4 4 rot=270 pivot=0,0
# layer 6, z = 5
flat-x -7.5 11.25 5 rot=45 pivot=0,0
flat-x -7.5 11.25 5 rot=135 pivot=0,0
flat-x -7.5 11.25 5 rot=225 pivot=0,0
flat-x -7.5 11.25 5 rot=315 pivot=0,0
# layer 7, z = 6
flat-x -7.5 11.1 6
flat-x -7.5 11.1 6 rot=90 pivot=0,0
flat-x -7.5 11.1 6 rot=180 pivot=0,0
flat-x -7.5 11.1 6 rot=270 pivot=0,0
# layer 8, z = 7
flat-x -7.5 10.95 7 rot=45 pivot=0,0
flat-x -7.5 10.95 7 rot=135 pivot=0,0
flat-x -7.5 10.95 7 rot=225 pivot=0,0
flat-x -7.5 10.95 7 rot=315 pivot=0,0
# layer 9, z = 8
flat-x -7.5 10.8 8
flat-x -7.5 10.8 8 rot=90 pivot=0,0
flat-x -7.5 10.8 8 rot=180 pivot=0,0
flat-x -7.5 10.8 8 rot=270 pivot=0,0
# layer 10, z = 9
flat-x -7.5 10.65 9 rot=45 pivot=0,0
flat-x -7.5 10.65 9 rot=135 pivot=0,0
flat-x -7.5 10.65 9 rot=225 pivot=0,0
flat-x -7.5 10.65 9 rot=315 pivot=0,0
```

## Step 2: the middle

Carry on in the same way: one layer has a plank on each side, the next has a plank on each corner.

```plank
# layer 11, z = 10
flat-x -7.5 10.5 10
flat-x -7.5 10.5 10 rot=90 pivot=0,0
flat-x -7.5 10.5 10 rot=180 pivot=0,0
flat-x -7.5 10.5 10 rot=270 pivot=0,0
# layer 12, z = 11
flat-x -7.5 10.35 11 rot=45 pivot=0,0
flat-x -7.5 10.35 11 rot=135 pivot=0,0
flat-x -7.5 10.35 11 rot=225 pivot=0,0
flat-x -7.5 10.35 11 rot=315 pivot=0,0
# layer 13, z = 12
flat-x -7.5 10.2 12
flat-x -7.5 10.2 12 rot=90 pivot=0,0
flat-x -7.5 10.2 12 rot=180 pivot=0,0
flat-x -7.5 10.2 12 rot=270 pivot=0,0
# layer 14, z = 13
flat-x -7.5 10.05 13 rot=45 pivot=0,0
flat-x -7.5 10.05 13 rot=135 pivot=0,0
flat-x -7.5 10.05 13 rot=225 pivot=0,0
flat-x -7.5 10.05 13 rot=315 pivot=0,0
# layer 15, z = 14
flat-x -7.5 9.9 14
flat-x -7.5 9.9 14 rot=90 pivot=0,0
flat-x -7.5 9.9 14 rot=180 pivot=0,0
flat-x -7.5 9.9 14 rot=270 pivot=0,0
# layer 16, z = 15
flat-x -7.5 9.75 15 rot=45 pivot=0,0
flat-x -7.5 9.75 15 rot=135 pivot=0,0
flat-x -7.5 9.75 15 rot=225 pivot=0,0
flat-x -7.5 9.75 15 rot=315 pivot=0,0
# layer 17, z = 16
flat-x -7.5 9.6 16
flat-x -7.5 9.6 16 rot=90 pivot=0,0
flat-x -7.5 9.6 16 rot=180 pivot=0,0
flat-x -7.5 9.6 16 rot=270 pivot=0,0
# layer 18, z = 17
flat-x -7.5 9.45 17 rot=45 pivot=0,0
flat-x -7.5 9.45 17 rot=135 pivot=0,0
flat-x -7.5 9.45 17 rot=225 pivot=0,0
flat-x -7.5 9.45 17 rot=315 pivot=0,0
# layer 19, z = 18
flat-x -7.5 9.3 18
flat-x -7.5 9.3 18 rot=90 pivot=0,0
flat-x -7.5 9.3 18 rot=180 pivot=0,0
flat-x -7.5 9.3 18 rot=270 pivot=0,0
# layer 20, z = 19
flat-x -7.5 9.15 19 rot=45 pivot=0,0
flat-x -7.5 9.15 19 rot=135 pivot=0,0
flat-x -7.5 9.15 19 rot=225 pivot=0,0
flat-x -7.5 9.15 19 rot=315 pivot=0,0
```

## Step 3: the top of the tower

Finish the walls. The last layer has its front and back planks closer to the middle than the other two.

```plank
# layer 21, z = 20
flat-x -7.5 9 20
flat-x -7.5 9 20 rot=90 pivot=0,0
flat-x -7.5 9 20 rot=180 pivot=0,0
flat-x -7.5 9 20 rot=270 pivot=0,0
# layer 22, z = 21
flat-x -7.5 8.85 21 rot=45 pivot=0,0
flat-x -7.5 8.85 21 rot=135 pivot=0,0
flat-x -7.5 8.85 21 rot=225 pivot=0,0
flat-x -7.5 8.85 21 rot=315 pivot=0,0
# layer 23, z = 22
flat-x -7.5 8.7 22
flat-x -7.5 8.7 22 rot=90 pivot=0,0
flat-x -7.5 8.7 22 rot=180 pivot=0,0
flat-x -7.5 8.7 22 rot=270 pivot=0,0
# layer 24, z = 23
flat-x -7.5 8.55 23 rot=45 pivot=0,0
flat-x -7.5 8.55 23 rot=135 pivot=0,0
flat-x -7.5 8.55 23 rot=225 pivot=0,0
flat-x -7.5 8.55 23 rot=315 pivot=0,0
# layer 25, z = 24
flat-x -7.5 8.4 24
flat-x -7.5 8.4 24 rot=90 pivot=0,0
flat-x -7.5 8.4 24 rot=180 pivot=0,0
flat-x -7.5 8.4 24 rot=270 pivot=0,0
# layer 26, z = 25
flat-x -7.5 8.25 25 rot=45 pivot=0,0
flat-x -7.5 8.25 25 rot=135 pivot=0,0
flat-x -7.5 8.25 25 rot=225 pivot=0,0
flat-x -7.5 8.25 25 rot=315 pivot=0,0
# layer 27, z = 26
flat-x -7.5 8.1 26
flat-x -7.5 8.1 26 rot=90 pivot=0,0
flat-x -7.5 8.1 26 rot=180 pivot=0,0
flat-x -7.5 8.1 26 rot=270 pivot=0,0
# layer 28, z = 27
flat-x -7.5 7.95 27 rot=45 pivot=0,0
flat-x -7.5 7.95 27 rot=135 pivot=0,0
flat-x -7.5 7.95 27 rot=225 pivot=0,0
flat-x -7.5 7.95 27 rot=315 pivot=0,0
# layer 29, z = 28
flat-x -7.5 7.8 28
flat-x -7.5 7.8 28 rot=90 pivot=0,0
flat-x -7.5 7.8 28 rot=180 pivot=0,0
flat-x -7.5 7.8 28 rot=270 pivot=0,0
# layer 30, z = 29
flat-x -7.5 7.65 29 rot=45 pivot=0,0
flat-x -7.5 7.65 29 rot=135 pivot=0,0
flat-x -7.5 7.65 29 rot=225 pivot=0,0
flat-x -7.5 7.65 29 rot=315 pivot=0,0
# last layer, z = 30
flat-x -7.5 6.75 30
flat-x -7.5 -9.75 30
flat-y 7.5 -7.5 30
flat-y -10.5 -7.5 30
```

## Step 4: the platform

Lay seven planks side by side across the top, from the front plank to the back plank.

```plank
flat-y -10.5 -7.5 31 repeat=7 offset=3,0,0
flat-x -7.5 7.5 31
flat-x -7.5 -10.5 31
```

## Step 5: the sails

Lay four spars in a pinwheel around the middle, and a red sail plank beside each one. Their ends stick out over the edge of the platform.

```plank
flat-x 1.5 -1.5 32 repeat=4 offset=0,0,0 rot=0 rot-step=90 pivot=0,0
flat-x 1.5 1.5 32 repeat=4 offset=0,0,0 rot=0 rot-step=90 pivot=0,0 color=sail
```

## Step 6: the cap

Press a small roof on the hub of the sails: one plank along, one across, one along again.

```plank
flat-x -7.5 -1.5 33
flat-y -1.5 -7.5 34
flat-x -7.5 -1.5 35
```
