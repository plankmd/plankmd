---
plankmd: "0.1"
title: Pagoda
lang: en
inventory: 215
difficulty: 5
license: CC0-1.0
palette:
  roof: "#8e3b2e"
  gold: "#d4a017"
---

# Pagoda

A Japanese-style pagoda with four storeys that get smaller as they rise.
Each storey is a row of little hollow towers, with a roof whose eaves stick
out at both ends, and the pagoda ends with a spire. 208 planks.

## Step 1: storey 1, the walls

Build a row of 4 little hollow towers that touch each other, like log cabins: two planks side by side, then two across them on their ends. To space the two planks of each tower, lay three planks side by side between them, then take them away. Build two pairs of layers.

```plank
# guides: three widths between the two planks of each little tower
guide flat-x 0 3 0 repeat=3 offset=0,3,0
guide flat-x 15 3 0 repeat=3 offset=0,3,0
guide flat-x 30 3 0 repeat=3 offset=0,3,0
guide flat-x 45 3 0 repeat=3 offset=0,3,0
flat-x 0 0 0  repeat=2 offset=0,0,2
flat-x 0 12 0 repeat=2 offset=0,0,2
flat-y 0 0 1 repeat=2 offset=0,0,2
flat-y 12 0 1 repeat=2 offset=0,0,2
flat-x 15 0 0  repeat=2 offset=0,0,2
flat-x 15 12 0 repeat=2 offset=0,0,2
flat-y 15 0 1 repeat=2 offset=0,0,2
flat-y 27 0 1 repeat=2 offset=0,0,2
flat-x 30 0 0  repeat=2 offset=0,0,2
flat-x 30 12 0 repeat=2 offset=0,0,2
flat-y 30 0 1 repeat=2 offset=0,0,2
flat-y 42 0 1 repeat=2 offset=0,0,2
flat-x 45 0 0  repeat=2 offset=0,0,2
flat-x 45 12 0 repeat=2 offset=0,0,2
flat-y 45 0 1 repeat=2 offset=0,0,2
flat-y 57 0 1 repeat=2 offset=0,0,2
```

## Step 2: storey 1, the roof

Build three more pairs of layers with red planks. On the two towers at the ends, move every pair of layers half a plank width outwards: these are the eaves. The inner side of each end tower stays over the wall below and holds the eaves down. The towers in the middle go straight up.

```plank
# guides: three widths between the two planks of each tower
guide flat-x -1.5 3 4 repeat=3 offset=0,3,0
guide flat-x 15 3 4 repeat=3 offset=0,3,0
guide flat-x 30 3 4 repeat=3 offset=0,3,0
guide flat-x 46.5 3 4 repeat=3 offset=0,3,0
flat-x 0 0 4  repeat=3 offset=-1.5,0,2 color=roof
flat-x 0 12 4 repeat=3 offset=-1.5,0,2 color=roof
flat-y 0 0 5 repeat=3 offset=-1.5,0,2 color=roof
flat-y 12 0 5 repeat=3 offset=-1.5,0,2 color=roof
flat-x 15 0 4  repeat=3 offset=0,0,2 color=roof
flat-x 15 12 4 repeat=3 offset=0,0,2 color=roof
flat-y 15 0 5 repeat=3 offset=0,0,2 color=roof
flat-y 27 0 5 repeat=3 offset=0,0,2 color=roof
flat-x 30 0 4  repeat=3 offset=0,0,2 color=roof
flat-x 30 12 4 repeat=3 offset=0,0,2 color=roof
flat-y 30 0 5 repeat=3 offset=0,0,2 color=roof
flat-y 42 0 5 repeat=3 offset=0,0,2 color=roof
flat-x 45 0 4  repeat=3 offset=1.5,0,2 color=roof
flat-x 45 12 4 repeat=3 offset=1.5,0,2 color=roof
flat-y 45 0 5 repeat=3 offset=1.5,0,2 color=roof
flat-y 57 0 5 repeat=3 offset=1.5,0,2 color=roof
```

## Step 3: storey 2, the walls

Build a row of 3 little towers on the roof below, each one resting across the joint between two towers underneath. Space the planks with three planks as before, then build two pairs of layers.

```plank
# guides: three widths between the two planks of each little tower
guide flat-x 7.5 3 10 repeat=3 offset=0,3,0
guide flat-x 22.5 3 10 repeat=3 offset=0,3,0
guide flat-x 37.5 3 10 repeat=3 offset=0,3,0
flat-x 7.5 0 10  repeat=2 offset=0,0,2
flat-x 7.5 12 10 repeat=2 offset=0,0,2
flat-y 7.5 0 11 repeat=2 offset=0,0,2
flat-y 19.5 0 11 repeat=2 offset=0,0,2
flat-x 22.5 0 10  repeat=2 offset=0,0,2
flat-x 22.5 12 10 repeat=2 offset=0,0,2
flat-y 22.5 0 11 repeat=2 offset=0,0,2
flat-y 34.5 0 11 repeat=2 offset=0,0,2
flat-x 37.5 0 10  repeat=2 offset=0,0,2
flat-x 37.5 12 10 repeat=2 offset=0,0,2
flat-y 37.5 0 11 repeat=2 offset=0,0,2
flat-y 49.5 0 11 repeat=2 offset=0,0,2
```

## Step 4: storey 2, the roof

Build three more pairs of layers with red planks. On the two towers at the ends, move every pair of layers half a plank width outwards: these are the eaves. The inner side of each end tower stays over the wall below and holds the eaves down. The towers in the middle go straight up.

```plank
# guides: three widths between the two planks of each tower
guide flat-x 6 3 14 repeat=3 offset=0,3,0
guide flat-x 22.5 3 14 repeat=3 offset=0,3,0
guide flat-x 39 3 14 repeat=3 offset=0,3,0
flat-x 7.5 0 14  repeat=3 offset=-1.5,0,2 color=roof
flat-x 7.5 12 14 repeat=3 offset=-1.5,0,2 color=roof
flat-y 7.5 0 15 repeat=3 offset=-1.5,0,2 color=roof
flat-y 19.5 0 15 repeat=3 offset=-1.5,0,2 color=roof
flat-x 22.5 0 14  repeat=3 offset=0,0,2 color=roof
flat-x 22.5 12 14 repeat=3 offset=0,0,2 color=roof
flat-y 22.5 0 15 repeat=3 offset=0,0,2 color=roof
flat-y 34.5 0 15 repeat=3 offset=0,0,2 color=roof
flat-x 37.5 0 14  repeat=3 offset=1.5,0,2 color=roof
flat-x 37.5 12 14 repeat=3 offset=1.5,0,2 color=roof
flat-y 37.5 0 15 repeat=3 offset=1.5,0,2 color=roof
flat-y 49.5 0 15 repeat=3 offset=1.5,0,2 color=roof
```

## Step 5: storey 3, the walls

Build a row of 2 little towers on the roof below, each one resting across the joint between two towers underneath. Space the planks with three planks as before, then build two pairs of layers.

```plank
# guides: three widths between the two planks of each little tower
guide flat-x 15 3 20 repeat=3 offset=0,3,0
guide flat-x 30 3 20 repeat=3 offset=0,3,0
flat-x 15 0 20  repeat=2 offset=0,0,2
flat-x 15 12 20 repeat=2 offset=0,0,2
flat-y 15 0 21 repeat=2 offset=0,0,2
flat-y 27 0 21 repeat=2 offset=0,0,2
flat-x 30 0 20  repeat=2 offset=0,0,2
flat-x 30 12 20 repeat=2 offset=0,0,2
flat-y 30 0 21 repeat=2 offset=0,0,2
flat-y 42 0 21 repeat=2 offset=0,0,2
```

## Step 6: storey 3, the roof

Build three more pairs of layers with red planks. On the two towers at the ends, move every pair of layers half a plank width outwards: these are the eaves. The inner side of each end tower stays over the wall below and holds the eaves down. The towers in the middle go straight up.

```plank
# guides: three widths between the two planks of each tower
guide flat-x 13.5 3 24 repeat=3 offset=0,3,0
guide flat-x 31.5 3 24 repeat=3 offset=0,3,0
flat-x 15 0 24  repeat=3 offset=-1.5,0,2 color=roof
flat-x 15 12 24 repeat=3 offset=-1.5,0,2 color=roof
flat-y 15 0 25 repeat=3 offset=-1.5,0,2 color=roof
flat-y 27 0 25 repeat=3 offset=-1.5,0,2 color=roof
flat-x 30 0 24  repeat=3 offset=1.5,0,2 color=roof
flat-x 30 12 24 repeat=3 offset=1.5,0,2 color=roof
flat-y 30 0 25 repeat=3 offset=1.5,0,2 color=roof
flat-y 42 0 25 repeat=3 offset=1.5,0,2 color=roof
```

## Step 7: storey 4, the walls

Build a row of 1 little towers on the roof below, each one resting across the joint between two towers underneath. Space the planks with three planks as before, then build two pairs of layers.

```plank
# guides: three widths between the two planks of each little tower
guide flat-x 22.5 3 30 repeat=3 offset=0,3,0
flat-x 22.5 0 30  repeat=2 offset=0,0,2
flat-x 22.5 12 30 repeat=2 offset=0,0,2
flat-y 22.5 0 31 repeat=2 offset=0,0,2
flat-y 34.5 0 31 repeat=2 offset=0,0,2
```

## Step 8: storey 4, the roof

The top roof is built like the others, with red planks, but the tower is alone: move the four sides outwards by one plank thickness so that the eaves stick out all around. Build two pairs of layers.

```plank
flat-x 22.5 -1 34  repeat=2 offset=0,0,2 color=roof
flat-x 22.5 13 34 repeat=2 offset=0,0,2 color=roof
flat-y 21.5 0 35 repeat=2 offset=0,0,2 color=roof
flat-y 35.5 0 35 repeat=2 offset=0,0,2 color=roof
```

## Step 9: the top of the roof

Cover the roof with five planks side by side. Add three planks across them, then one plank on top.

```plank
# five planks side by side
flat-x 22.5 0 38 color=roof
flat-x 22.5 3 38 color=roof
flat-x 22.5 6 38 color=roof
flat-x 22.5 9 38 color=roof
flat-x 22.5 12 38 color=roof
# three planks across them
flat-y 25.5 0 39 color=roof
flat-y 28.5 0 39 color=roof
flat-y 31.5 0 39 color=roof
# one plank on top
flat-x 22.5 6 40 color=roof
```

## Step 10: the spire

Finish with three gold planks, one on top of the other, each across the one below.

```plank
flat-y 28.5 0 41 color=gold
flat-x 22.5 6 42 color=gold
flat-y 28.5 0 43 color=gold
```
