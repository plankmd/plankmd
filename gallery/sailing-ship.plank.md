---
plankmd: "0.1"
title: Sailing ship
lang: en
inventory: 180
difficulty: 4
license: CC0-1.0
palette:
  flag: "#b03a2e"
---

# Sailing ship

A sailing ship on the ground, with a hull that widens layer by layer, a deck, a raised stern castle and two masts with square sails. 178 planks. Planks cannot lean, so the curve of the hull is made of steps, and each sail is a pile of flat planks held by a mast and a yard on top.

## Step 1: the keel

Lay three planks end to end, then two more rows of three beside them, to make a flat base nine planks big.

```plank
# base, z = 0: three rows of three planks
flat-x 0 3 0  repeat=3 offset=15,0,0
flat-x 0 6 0  repeat=3 offset=15,0,0
flat-x 0 9 0  repeat=3 offset=15,0,0
```

## Step 2: the first layers of the hull

Lay a row of three planks along each side of the base, with a gap of one plank width between the two rows. To space them, lay one plank between them, then take it away. Then lay four planks across, at both ends and over the two joints. The cross planks stick out a little on both sides.

```plank
guide flat-x 0 6 1   # one width between the two sides
# layer 2, z = 1: sides, 9 u across
flat-x 0 3 1
flat-x 15 3 1
flat-x 30 3 1
flat-x 0 9 1
flat-x 15 9 1
flat-x 30 9 1
# layer 3, z = 2: cross planks
flat-y 0 0 2
flat-y 13.5 0 2
flat-y 28.5 0 2
flat-y 42 0 2
```

## Step 3: the hull widens

Make the hull wider, step by step: on every new row, move each side plank half a plank width outwards. The cross planks underneath are wide enough to carry them.

```plank
# layer 4, z = 3: sides, 12 u across
flat-x 0 1.5 3
flat-x 15 1.5 3
flat-x 30 1.5 3
flat-x 0 10.5 3
flat-x 15 10.5 3
flat-x 30 10.5 3
# layer 5, z = 4: cross planks
flat-y 0 0 4
flat-y 13.5 0 4
flat-y 28.5 0 4
flat-y 42 0 4
# layer 6, z = 5: sides, 15 u across
flat-x 0 0 5
flat-x 15 0 5
flat-x 30 0 5
flat-x 0 12 5
flat-x 15 12 5
flat-x 30 12 5
# layer 7, z = 6: cross planks
flat-y 0 0 6
flat-y 13.5 0 6
flat-y 28.5 0 6
flat-y 42 0 6
```

## Step 4: the sides rise

Two more rows of the full width, with cross planks over the joints.

```plank
# layer 8, z = 7: sides, 15 u across
flat-x 0 0 7
flat-x 15 0 7
flat-x 30 0 7
flat-x 0 12 7
flat-x 15 12 7
flat-x 30 12 7
# layer 9, z = 8: cross planks
flat-y 0 0 8
flat-y 13.5 0 8
flat-y 28.5 0 8
flat-y 42 0 8
```

## Step 5: the deck

Finish the sides, then cover the whole hull with fifteen planks laid side by side across, from the stern to the bow.

```plank
# top row of sides, z = 9
flat-x 0 0 9
flat-x 15 0 9
flat-x 30 0 9
flat-x 0 12 9
flat-x 15 12 9
flat-x 30 12 9
# deck, z = 10: fifteen planks across
flat-y 0 0 10 repeat=15 offset=3,0,0
```

## Step 6: the stern castle

Build a raised cabin at the stern as a log-cabin square of six rows, then roof it with five planks side by side.

```plank
# castle layer 1, z = 11
flat-x 0 0 11
flat-x 0 12 11
# castle layer 2, z = 12
flat-y 0 0 12
flat-y 12 0 12
# castle layer 3, z = 13
flat-x 0 0 13
flat-x 0 12 13
# castle layer 4, z = 14
flat-y 0 0 14
flat-y 12 0 14
# castle layer 5, z = 15
flat-x 0 0 15
flat-x 0 12 15
# castle layer 6, z = 16
flat-y 0 0 16
flat-y 12 0 16
# castle roof, z = 17
flat-x 0 0 17 repeat=5 offset=0,3,0
```

## Step 7: the main sails

Pile fifteen planks flat on top of each other, across the deck, to make a sail. Then pile fifteen more, four plank-thicknesses further on. The mast will stand between them. To place the first pile, lay one plank flat and two on their edges between the stern castle and it, then take them away. To place the second, lay one plank flat and one on its edge between the two piles, then take them away.

```plank
# guides: from the castle wall to the first sail, then from one sail to the other
guide flat-y 15 0 12
guide edge-y 18 0 12
guide edge-y 19 0 12
guide flat-y 23 0 11
guide edge-y 26 0 11
flat-y 20 0 11 repeat=15 offset=0,0,1
flat-y 27 0 11 repeat=15 offset=0,0,1
```

## Step 8: the main mast

Stand four planks on their ends between the two sails, in a pinwheel around a hole of two by two. Then lay three planks across the top, over the first sail, the mast and the second sail. They hold everything together.

```plank
# mast, z = 11: four planks around a hole of two by two
up-x 23 5.5 11
up-y 26 5.5 11
up-x 24 8.5 11
up-y 23 6.5 11
# yard, z = 26
flat-y 21 0 26
flat-y 24 0 26
flat-y 27 0 26
```

## Step 9: the top sail

Pile nine planks on the yard for the top sail, above the front sail.

```plank
flat-y 27 0 27 repeat=9 offset=0,0,1
```

## Step 10: the top mast

Stand the mast again on the yard, one plank thickness further back, then lay two planks across the top. Lay a red pennant flat on the very top.

```plank
# mast, z = 27: four planks around a hole of two by two
up-x 22 5.5 27
up-y 25 5.5 27
up-x 23 8.5 27
up-y 22 6.5 27
# top yard
flat-y 21 0 42
flat-y 24 0 42
# pennant
flat-x 15.0 6 43 color=flag
```

## Step 11: the fore sails

Near the bow, build a second pair of piles of fifteen planks, a little further apart than the first pair. To place the first pile, lay two planks on their edges between the main sail and it, then take them away. To place the second, lay two planks side by side between the two piles, then take them away.

```plank
# guides: from the main sail to the first pile, then from one pile to the other
guide edge-y 30 0 11
guide edge-y 31 0 11
guide flat-y 35 0 11
guide flat-y 38 0 11
flat-y 32 0 11 repeat=15 offset=0,0,1
flat-y 41 0 11 repeat=15 offset=0,0,1
```

## Step 12: the fore mast

Build the fore mast the same way: four planks on end between the piles, then four planks across the top, over the piles and the mast.

```plank
# mast, z = 11: four planks around a hole of two by two
up-x 36 5.5 11
up-y 39 5.5 11
up-x 37 8.5 11
up-y 36 6.5 11
# yard, z = 26
flat-y 32 0 26
flat-y 35 0 26
flat-y 38 0 26
flat-y 41 0 26
```
