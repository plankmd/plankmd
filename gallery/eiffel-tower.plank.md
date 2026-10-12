---
plankmd: "0.1"
title: Eiffel tower
lang: en
inventory: 180
difficulty: 4
license: CC0-1.0
palette:
  flag: "#b03a2e"
---

# Eiffel tower

A tapering iron tower inspired by the Eiffel Tower: four legs that lean towards each other, a first platform, a narrower upper section and a spire. 174 planks.

## Step 1: the foot of the legs

Build four square towers at the corners, one plank length apart. Each tower is hollow: two planks along, then two planks across them, and so on, twice.

Place the towers with rulers: build the first tower at the front left. Lay one plank flat on the table against its right side, pointing right: the second tower starts at the end of that plank. Lay another plank against the back of the first tower, pointing back: the third tower starts at its end. The fourth tower goes at the back right, one plank from the second tower and one plank from the third. Take the four rulers away when the towers are built.

```plank
guide flat-x 15 0 0                         # front: between the first and second towers
guide flat-y 0 15 0                         # left: between the first and third towers
guide flat-y 30 15 0                        # right: between the second and fourth towers
guide flat-x 15 30 0                        # back: between the third and fourth towers
# leg from (0, 0)
flat-x 0 0 0 repeat=2 offset=0,0,2
flat-x 0 12 0 repeat=2 offset=0,0,2
flat-y 0 0 1 repeat=2 offset=0,0,2
flat-y 12 0 1 repeat=2 offset=0,0,2
# leg from (30, 0)
flat-x 30 0 0 repeat=2 offset=0,0,2
flat-x 30 12 0 repeat=2 offset=0,0,2
flat-y 30 0 1 repeat=2 offset=0,0,2
flat-y 42 0 1 repeat=2 offset=0,0,2
# leg from (0, 30)
flat-x 0 30 0 repeat=2 offset=0,0,2
flat-x 0 42 0 repeat=2 offset=0,0,2
flat-y 0 30 1 repeat=2 offset=0,0,2
flat-y 12 30 1 repeat=2 offset=0,0,2
# leg from (30, 30)
flat-x 30 30 0 repeat=2 offset=0,0,2
flat-x 30 42 0 repeat=2 offset=0,0,2
flat-y 30 30 1 repeat=2 offset=0,0,2
flat-y 42 30 1 repeat=2 offset=0,0,2
```

## Step 2: the legs lean in

Keep building the four legs together, layer by layer, five times, so that they lean in towards the middle. On every layer along, slide the two planks half a plank width towards the middle, both ways. On every layer across, slide the two planks half a plank width towards the middle along their length only: each one then lies on both planks below it, front and back. At the top, the legs almost touch.

```plank
# leg from (0, 0)
flat-x 0 0 4 repeat=5 offset=1.5,1.5,2
flat-x 0 12 4 repeat=5 offset=1.5,1.5,2
flat-y 0 1.5 5 repeat=5 offset=1.5,1.5,2
flat-y 12 1.5 5 repeat=5 offset=1.5,1.5,2
# leg from (30, 0)
flat-x 30 0 4 repeat=5 offset=-1.5,1.5,2
flat-x 30 12 4 repeat=5 offset=-1.5,1.5,2
flat-y 30 1.5 5 repeat=5 offset=-1.5,1.5,2
flat-y 42 1.5 5 repeat=5 offset=-1.5,1.5,2
# leg from (0, 30)
flat-x 0 30 4 repeat=5 offset=1.5,-1.5,2
flat-x 0 42 4 repeat=5 offset=1.5,-1.5,2
flat-y 0 28.5 5 repeat=5 offset=1.5,-1.5,2
flat-y 12 28.5 5 repeat=5 offset=1.5,-1.5,2
# leg from (30, 30)
flat-x 30 30 4 repeat=5 offset=-1.5,-1.5,2
flat-x 30 42 4 repeat=5 offset=-1.5,-1.5,2
flat-y 30 28.5 5 repeat=5 offset=-1.5,-1.5,2
flat-y 42 28.5 5 repeat=5 offset=-1.5,-1.5,2
```

## Step 3: the first platform

Join the legs at the top. First lay ten planks along the width, side by side: five over the two front legs, five over the two back legs, each one centred over the small gap between its two legs. Then lay five planks along the depth across the middle of them.

```plank
flat-x 15 7.5 14
flat-x 15 10.5 14
flat-x 15 13.5 14
flat-x 15 16.5 14
flat-x 15 19.5 14
flat-x 15 22.5 14
flat-x 15 25.5 14
flat-x 15 28.5 14
flat-x 15 31.5 14
flat-x 15 34.5 14
flat-y 15 15 15
flat-y 18 15 15
flat-y 21 15 15
flat-y 24 15 15
flat-y 27 15 15
```

## Step 4: the main shaft

Build a hollow tower, one plank long and one plank deep, on the middle of the platform. Six times: two planks along, two across.

```plank
flat-x 15 15 16 repeat=6 offset=0,0,2
flat-x 15 27 16 repeat=6 offset=0,0,2
flat-y 15 15 17 repeat=6 offset=0,0,2
flat-y 27 15 17 repeat=6 offset=0,0,2
```

## Step 5: the second platform

Cover the shaft with five planks side by side.

```plank
flat-x 15 15 28
flat-x 15 18 28
flat-x 15 21 28
flat-x 15 24 28
flat-x 15 27 28
```

## Step 6: the upper section

The tower gets narrower: three planks side by side along the depth, stacked four layers high, in the middle of the platform.

```plank
flat-y 18 15 29 repeat=4 offset=0,0,1
flat-y 21 15 29 repeat=4 offset=0,0,1
flat-y 24 15 29 repeat=4 offset=0,0,1
```

## Step 7: the spire

Stack six planks on top of the middle column, and put a coloured plank at the very top.

```plank
flat-y 21 15 33
flat-y 21 15 34
flat-y 21 15 35
flat-y 21 15 36
flat-y 21 15 37
flat-y 21 15 38 color=flag
```
