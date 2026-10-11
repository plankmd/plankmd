---
plankmd: "0.1"
title: Lighthouse
lang: en
inventory: 140
difficulty: 4
license: CC0-1.0
palette:
  stone: "#9a9a96"
  red: "#c0392b"
  white: "#f4f1ea"
  light: "#f2c94c"
---

# Lighthouse

A tall lighthouse with red and white bands. It stands on a wide base that
gets narrower in two steps, and ends with a gallery, a lantern room and a
cap. 137 planks.

## Step 1: the first layer of the base

The base is four little hollow towers, two by two, built like log cabins: two planks side by side, then two planks across them on their ends. To space the two planks of each tower, lay three planks side by side between them, then take them away. The four towers touch each other.

```plank
# guides: three widths between the two planks of each little tower
guide flat-x 0 3 0 repeat=3 offset=0,3,0
guide flat-x 15 3 0 repeat=3 offset=0,3,0
guide flat-x 0 18 0 repeat=3 offset=0,3,0
guide flat-x 15 18 0 repeat=3 offset=0,3,0
flat-x 0 0 0  repeat=1 offset=0,0,2 color=stone
flat-x 0 12 0 repeat=1 offset=0,0,2 color=stone
flat-y 0 0 1 repeat=1 offset=0,0,2 color=stone
flat-y 12 0 1 repeat=1 offset=0,0,2 color=stone
flat-x 15 0 0  repeat=1 offset=0,0,2 color=stone
flat-x 15 12 0 repeat=1 offset=0,0,2 color=stone
flat-y 15 0 1 repeat=1 offset=0,0,2 color=stone
flat-y 27 0 1 repeat=1 offset=0,0,2 color=stone
flat-x 0 15 0  repeat=1 offset=0,0,2 color=stone
flat-x 0 27 0 repeat=1 offset=0,0,2 color=stone
flat-y 0 15 1 repeat=1 offset=0,0,2 color=stone
flat-y 12 15 1 repeat=1 offset=0,0,2 color=stone
flat-x 15 15 0  repeat=1 offset=0,0,2 color=stone
flat-x 15 27 0 repeat=1 offset=0,0,2 color=stone
flat-y 15 15 1 repeat=1 offset=0,0,2 color=stone
flat-y 27 15 1 repeat=1 offset=0,0,2 color=stone
```

## Step 2: raise the base

Repeat twice: two planks one way, two planks the other way, on each of the four towers.

```plank
flat-x 0 0 2  repeat=2 offset=0,0,2 color=stone
flat-x 0 12 2 repeat=2 offset=0,0,2 color=stone
flat-y 0 0 3 repeat=2 offset=0,0,2 color=stone
flat-y 12 0 3 repeat=2 offset=0,0,2 color=stone
flat-x 15 0 2  repeat=2 offset=0,0,2 color=stone
flat-x 15 12 2 repeat=2 offset=0,0,2 color=stone
flat-y 15 0 3 repeat=2 offset=0,0,2 color=stone
flat-y 27 0 3 repeat=2 offset=0,0,2 color=stone
flat-x 0 15 2  repeat=2 offset=0,0,2 color=stone
flat-x 0 27 2 repeat=2 offset=0,0,2 color=stone
flat-y 0 15 3 repeat=2 offset=0,0,2 color=stone
flat-y 12 15 3 repeat=2 offset=0,0,2 color=stone
flat-x 15 15 2  repeat=2 offset=0,0,2 color=stone
flat-x 15 27 2 repeat=2 offset=0,0,2 color=stone
flat-y 15 15 3 repeat=2 offset=0,0,2 color=stone
flat-y 27 15 3 repeat=2 offset=0,0,2 color=stone
```

## Step 3: the second step of the base

Now only two towers, side by side, placed across the middle of the base. Each one rests on the two towers below it. Space the planks with three planks as before, then build two pairs of layers.

```plank
# guides: three widths between the two planks of each tower
guide flat-x 0 10.5 6 repeat=3 offset=0,3,0
guide flat-x 15 10.5 6 repeat=3 offset=0,3,0
flat-x 0 7.5 6  repeat=2 offset=0,0,2 color=stone
flat-x 0 19.5 6 repeat=2 offset=0,0,2 color=stone
flat-y 0 7.5 7 repeat=2 offset=0,0,2 color=stone
flat-y 12 7.5 7 repeat=2 offset=0,0,2 color=stone
flat-x 15 7.5 6  repeat=2 offset=0,0,2 color=stone
flat-x 15 19.5 6 repeat=2 offset=0,0,2 color=stone
flat-y 15 7.5 7 repeat=2 offset=0,0,2 color=stone
flat-y 27 7.5 7 repeat=2 offset=0,0,2 color=stone
```

## Step 4: shaft, white band

Build the shaft in the middle of the base, one tower, centred over the two towers below. Build three pairs of layers with white planks.

```plank
# guide: three widths between the two planks
guide flat-x 7.5 10.5 10 repeat=3 offset=0,3,0
flat-x 7.5 7.5 10  repeat=3 offset=0,0,2 color=white
flat-x 7.5 19.5 10 repeat=3 offset=0,0,2 color=white
flat-y 7.5 7.5 11 repeat=3 offset=0,0,2 color=white
flat-y 19.5 7.5 11 repeat=3 offset=0,0,2 color=white
```

## Step 5: shaft, red band

Build three pairs of layers with red planks.

```plank
flat-x 7.5 7.5 16  repeat=3 offset=0,0,2 color=red
flat-x 7.5 19.5 16 repeat=3 offset=0,0,2 color=red
flat-y 7.5 7.5 17 repeat=3 offset=0,0,2 color=red
flat-y 19.5 7.5 17 repeat=3 offset=0,0,2 color=red
```

## Step 6: shaft, white band

Build three pairs of layers with white planks.

```plank
flat-x 7.5 7.5 22  repeat=3 offset=0,0,2 color=white
flat-x 7.5 19.5 22 repeat=3 offset=0,0,2 color=white
flat-y 7.5 7.5 23 repeat=3 offset=0,0,2 color=white
flat-y 19.5 7.5 23 repeat=3 offset=0,0,2 color=white
```

## Step 7: shaft, red band

Build three pairs of layers with red planks.

```plank
flat-x 7.5 7.5 28  repeat=3 offset=0,0,2 color=red
flat-x 7.5 19.5 28 repeat=3 offset=0,0,2 color=red
flat-y 7.5 7.5 29 repeat=3 offset=0,0,2 color=red
flat-y 19.5 7.5 29 repeat=3 offset=0,0,2 color=red
```

## Step 8: the gallery

Build two pairs of layers like the shaft, but move the planks outwards by a little: the two planks of each pair are one plank thickness further apart. The gallery sticks out all around the shaft.

```plank
flat-x 7.5 6.5 34  repeat=2 offset=0,0,2
flat-x 7.5 20.5 34 repeat=2 offset=0,0,2
flat-y 6.5 7.5 35 repeat=2 offset=0,0,2
flat-y 20.5 7.5 35 repeat=2 offset=0,0,2
```

## Step 9: the lantern room

Build two pairs of layers with yellow planks, back in line with the shaft.

```plank
flat-x 7.5 7.5 38  repeat=2 offset=0,0,2 color=light
flat-x 7.5 19.5 38 repeat=2 offset=0,0,2 color=light
flat-y 7.5 7.5 39 repeat=2 offset=0,0,2 color=light
flat-y 19.5 7.5 39 repeat=2 offset=0,0,2 color=light
```

## Step 10: the cap

Cover the lantern with five red planks side by side. Add three planks across them, then one plank on top.

```plank
# five planks side by side
flat-x 7.5 7.5 42 color=red
flat-x 7.5 10.5 42 color=red
flat-x 7.5 13.5 42 color=red
flat-x 7.5 16.5 42 color=red
flat-x 7.5 19.5 42 color=red
# three planks across them
flat-y 10.5 7.5 43 color=red
flat-y 13.5 7.5 43 color=red
flat-y 16.5 7.5 43 color=red
# one plank on top
flat-x 7.5 13.5 44 color=red
```
