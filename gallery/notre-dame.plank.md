---
plankmd: "0.1"
title: Notre-Dame de Paris
lang: en
inventory: 1400
difficulty: 5
license: CC0-1.0
palette:
  roof: "#8a8f98"
  rose: "#b5483a"
  portal: "#8a5a32"
---

# Notre-Dame de Paris

A large cathedral inspired by Notre-Dame de Paris: a west front with two flat-topped towers, three portals, a gallery and a rose window; a nave with lower aisles, a transept, a crossing with a slender spire, and a rounded east end. 1392 planks, 29 steps. It is a long build for a patient builder, so take your time and check each step before going on.

## Step 1: the three portals

Start at the west front, the end of the church where visitors come in. Lay planks flat, long side pointing away from you, and stack them ten high in six places: one stack at the far left, two stacks touching side by side, two more touching stacks further along, and one stack at the far right. These are the piers between the three portals. To space the stacks, lay three planks side by side in each opening as a ruler, then take them away.

```plank
# rulers: three widths in each portal
guide flat-y 3 0 0 repeat=3 offset=3,0,0
guide flat-y 18 0 0 repeat=3 offset=3,0,0
guide flat-y 33 0 0 repeat=3 offset=3,0,0
# piers, ten planks high
flat-y 0 0 0 repeat=10 offset=0,0,1
flat-y 12 0 0 repeat=10 offset=0,0,1
flat-y 15 0 0 repeat=10 offset=0,0,1
flat-y 27 0 0 repeat=10 offset=0,0,1
flat-y 30 0 0 repeat=10 offset=0,0,1
flat-y 42 0 0 repeat=10 offset=0,0,1
```

## Step 2: the portal lintels

Over each portal, lay five planks side by side, long side pointing left to right, each end resting on a pier. The brown planks are the lintels. This floor carries the whole west front.

```plank
flat-x 0 0 10 repeat=5 offset=0,3,0 color=portal
flat-x 15 0 10 repeat=5 offset=0,3,0 color=portal
flat-x 30 0 10 repeat=5 offset=0,3,0 color=portal
```

## Step 3: two towers and the gallery of kings

Build the two towers as hollow log cabins: two planks along, then two planks across them, again and again, four layers for now. Between the towers, stack three columns of four planks, long side pointing away from you. These make the gallery of kings. To leave the two openings between the columns, lay one plank in each as a ruler, then take it away.

```plank
# rulers: one width between the gallery columns
guide flat-y 18 0 11
guide flat-y 24 0 11
# towers, layers 11 to 14
flat-y 0 0 11 repeat=2 offset=0,0,2
flat-y 12 0 11 repeat=2 offset=0,0,2
flat-x 0 0 12 repeat=2 offset=0,0,2
flat-x 0 12 12 repeat=2 offset=0,0,2
flat-y 30 0 11 repeat=2 offset=0,0,2
flat-y 42 0 11 repeat=2 offset=0,0,2
flat-x 30 0 12 repeat=2 offset=0,0,2
flat-x 30 12 12 repeat=2 offset=0,0,2
# gallery columns, z = 11 to 14
flat-y 15 0 11 repeat=4 offset=0,0,1
flat-y 21 0 11 repeat=4 offset=0,0,1
flat-y 27 0 11 repeat=4 offset=0,0,1
```

## Step 4: closing the gallery

Close the gallery by laying five planks side by side across the tops of the three columns. The towers rise four more layers.

```plank
# gallery lintel, z = 15
flat-x 15 0 15 repeat=5 offset=0,3,0
# towers, layers 15 to 18
flat-y 0 0 15 repeat=2 offset=0,0,2
flat-y 12 0 15 repeat=2 offset=0,0,2
flat-x 0 0 16 repeat=2 offset=0,0,2
flat-x 0 12 16 repeat=2 offset=0,0,2
flat-y 30 0 15 repeat=2 offset=0,0,2
flat-y 42 0 15 repeat=2 offset=0,0,2
flat-x 30 0 16 repeat=2 offset=0,0,2
flat-x 30 12 16 repeat=2 offset=0,0,2
```

## Step 5: the wall under the rose window

In the middle bay, lay five planks side by side pointing away from you, then five across them, then five pointing away again. Keep raising the towers.

```plank
# middle bay, z = 16 to 18: along, across, along
flat-y 15 0 16 repeat=2 offset=0,0,2
flat-y 18 0 16 repeat=2 offset=0,0,2
flat-y 21 0 16 repeat=2 offset=0,0,2
flat-y 24 0 16 repeat=2 offset=0,0,2
flat-y 27 0 16 repeat=2 offset=0,0,2
flat-x 15 0 17
flat-x 15 3 17
flat-x 15 6 17
flat-x 15 9 17
flat-x 15 12 17
# towers, layers 19 to 22
flat-y 0 0 19 repeat=2 offset=0,0,2
flat-y 12 0 19 repeat=2 offset=0,0,2
flat-x 0 0 20 repeat=2 offset=0,0,2
flat-x 0 12 20 repeat=2 offset=0,0,2
flat-y 30 0 19 repeat=2 offset=0,0,2
flat-y 42 0 19 repeat=2 offset=0,0,2
flat-x 30 0 20 repeat=2 offset=0,0,2
flat-x 30 12 20 repeat=2 offset=0,0,2
```

## Step 6: the rose window

Now the rose window, the big round window of the west front, here made of steps. At each end of the middle bay, stack six red planks, long side pointing away from you. On the lowest layer, add one more red plank beside each stack, so that the gap in the middle is one plank wide. Above that layer the gap between the two stacks is three planks wide: this is the window. Check each gap by laying planks side by side in it as a ruler, then take them away. The towers keep rising.

```plank
# rulers: one width at the bottom of the window, three widths above it
guide flat-y 21 0 19
# window frame, z = 19 to 24
flat-y 15 0 19 repeat=6 offset=0,0,1 color=rose
flat-y 18 0 19 color=rose
flat-y 24 0 19 color=rose
guide flat-y 18 0 20 repeat=3 offset=3,0,0
flat-y 27 0 19 repeat=6 offset=0,0,1 color=rose
# towers, layers 23 to 26
flat-y 0 0 23 repeat=2 offset=0,0,2
flat-y 12 0 23 repeat=2 offset=0,0,2
flat-x 0 0 24 repeat=2 offset=0,0,2
flat-x 0 12 24 repeat=2 offset=0,0,2
flat-y 30 0 23 repeat=2 offset=0,0,2
flat-y 42 0 23 repeat=2 offset=0,0,2
flat-x 30 0 24 repeat=2 offset=0,0,2
flat-x 30 12 24 repeat=2 offset=0,0,2
```

## Step 7: the belfries and the window lintel

Close the top of the rose window with five planks side by side across the two red stacks. On each tower, stack three columns of three planks, long side pointing away from you, resting on the last layer. Between the columns leave two openings, one plank wide: lay a plank in each as a ruler, then take it away.

```plank
# rulers: one width in each belfry opening
guide flat-y 3 0 27
guide flat-y 9 0 27
guide flat-y 33 0 27
guide flat-y 39 0 27
# window lintel, z = 25
flat-x 15 0 25 repeat=5 offset=0,3,0
# belfry columns, z = 27 to 29
flat-y 0 0 27 repeat=3 offset=0,0,1
flat-y 6 0 27 repeat=3 offset=0,0,1
flat-y 12 0 27 repeat=3 offset=0,0,1
flat-y 30 0 27 repeat=3 offset=0,0,1
flat-y 36 0 27 repeat=3 offset=0,0,1
flat-y 42 0 27 repeat=3 offset=0,0,1
```

## Step 8: the upper middle bay

Cover each belfry with five planks side by side. In the middle bay, build again: planks pointing away from you, then across, then away, across, away.

```plank
# belfry lids, z = 30
flat-x 0 0 30 repeat=5 offset=0,3,0
flat-x 30 0 30 repeat=5 offset=0,3,0
# middle bay, z = 26 to 30
flat-y 15 0 26 repeat=3 offset=0,0,2
flat-y 18 0 26 repeat=3 offset=0,0,2
flat-y 21 0 26 repeat=3 offset=0,0,2
flat-y 24 0 26 repeat=3 offset=0,0,2
flat-y 27 0 26 repeat=3 offset=0,0,2
flat-x 15 0 27 repeat=2 offset=0,0,2
flat-x 15 3 27 repeat=2 offset=0,0,2
flat-x 15 6 27 repeat=2 offset=0,0,2
flat-x 15 9 27 repeat=2 offset=0,0,2
flat-x 15 12 27 repeat=2 offset=0,0,2
```

## Step 9: battlements and tower walls

Raise the towers four more layers. On the middle bay, stack three columns of two planks to make the battlements.

```plank
# towers, layers 31 to 34
flat-y 0 0 31 repeat=2 offset=0,0,2
flat-y 12 0 31 repeat=2 offset=0,0,2
flat-x 0 0 32 repeat=2 offset=0,0,2
flat-x 0 12 32 repeat=2 offset=0,0,2
flat-y 30 0 31 repeat=2 offset=0,0,2
flat-y 42 0 31 repeat=2 offset=0,0,2
flat-x 30 0 32 repeat=2 offset=0,0,2
flat-x 30 12 32 repeat=2 offset=0,0,2
# battlements, z = 31 to 32
flat-y 15 0 31 repeat=2 offset=0,0,1
flat-y 21 0 31 repeat=2 offset=0,0,1
flat-y 27 0 31 repeat=2 offset=0,0,1
```

## Step 10: the tops of the towers

Close each tower with five planks laid side by side, pointing away from you. The towers have flat tops: Notre-Dame never had spires on them.

```plank
flat-y 0 0 35 repeat=5 offset=3,0,0
flat-y 30 0 35 repeat=5 offset=3,0,0
```

## Step 11: the crowns of the towers

Finish each tower with a small square of four planks: two planks along, then two across.

```plank
flat-x 0 0 36
flat-x 0 12 36
flat-y 0 0 37
flat-y 12 0 37
flat-x 30 0 36
flat-x 30 12 36
flat-y 30 0 37
flat-y 42 0 37
```

## Step 12: outer walls and low walls

Behind the west front, build four long walls of planks laid end to end, long side pointing away from you, stacked eight high. They run from the west front to the east end: the two outer walls of the aisles, and the two low walls beside the nave. In each aisle, lay three planks side by side between the outer wall and the low wall as a ruler, then take them away.

```plank
# rulers: three widths in each aisle
guide flat-y 3 15 0 repeat=3 offset=3,0,0
guide flat-y 33 15 0 repeat=3 offset=3,0,0
# outer walls (x = 0 and x = 42) and low walls (x = 12 and x = 30), eight high
flat-y 0 15 0 repeat=8 offset=0,0,1
flat-y 0 30 0 repeat=8 offset=0,0,1
flat-y 0 45 0 repeat=8 offset=0,0,1
flat-y 0 60 0 repeat=8 offset=0,0,1
flat-y 0 75 0 repeat=8 offset=0,0,1
flat-y 0 90 0 repeat=8 offset=0,0,1
flat-y 12 15 0 repeat=8 offset=0,0,1
flat-y 12 30 0 repeat=8 offset=0,0,1
flat-y 12 45 0 repeat=8 offset=0,0,1
flat-y 12 60 0 repeat=8 offset=0,0,1
flat-y 12 75 0 repeat=8 offset=0,0,1
flat-y 12 90 0 repeat=8 offset=0,0,1
flat-y 30 15 0 repeat=8 offset=0,0,1
flat-y 30 30 0 repeat=8 offset=0,0,1
flat-y 30 45 0 repeat=8 offset=0,0,1
flat-y 30 60 0 repeat=8 offset=0,0,1
flat-y 30 75 0 repeat=8 offset=0,0,1
flat-y 30 90 0 repeat=8 offset=0,0,1
flat-y 42 15 0 repeat=8 offset=0,0,1
flat-y 42 30 0 repeat=8 offset=0,0,1
flat-y 42 45 0 repeat=8 offset=0,0,1
flat-y 42 60 0 repeat=8 offset=0,0,1
flat-y 42 75 0 repeat=8 offset=0,0,1
flat-y 42 90 0 repeat=8 offset=0,0,1
```

## Step 13: the aisle floors

Lay planks side by side across each aisle, long side pointing left to right. One end rests on the outer wall and the other on the low wall.

```plank
flat-x 1.5 15 8 repeat=30 offset=0,3,0
flat-x 28.5 15 8 repeat=30 offset=0,3,0
```

## Step 14: the nave walls

Build the two high walls of the nave on top of the aisle floors, eight planks high, flush with the inner ends of the floors.

```plank
# nave walls (x = 13.5 and x = 28.5), z = 9 to 16
flat-y 13.5 15 9 repeat=8 offset=0,0,1
flat-y 13.5 30 9 repeat=8 offset=0,0,1
flat-y 13.5 45 9 repeat=8 offset=0,0,1
flat-y 13.5 60 9 repeat=8 offset=0,0,1
flat-y 13.5 75 9 repeat=8 offset=0,0,1
flat-y 13.5 90 9 repeat=8 offset=0,0,1
flat-y 28.5 15 9 repeat=8 offset=0,0,1
flat-y 28.5 30 9 repeat=8 offset=0,0,1
flat-y 28.5 45 9 repeat=8 offset=0,0,1
flat-y 28.5 60 9 repeat=8 offset=0,0,1
flat-y 28.5 75 9 repeat=8 offset=0,0,1
flat-y 28.5 90 9 repeat=8 offset=0,0,1
```

## Step 15: the nave ceiling

Lay planks side by side across the nave, long side pointing left to right, resting on the two high walls.

```plank
flat-x 15 15 17 repeat=30 offset=0,3,0
```

## Step 16: the aisle roofs

On each aisle floor, build four steps rising towards the nave. The step nearest the outer wall is one plank high, then two, three and four. Each step is a row of planks laid end to end along the church.

```plank
# left aisle, rising towards x = 13.5
flat-y 1.5 15 9 repeat=6 offset=0,15,0
flat-y 4.5 15 9 repeat=6 offset=0,15,0
flat-y 7.5 15 9 repeat=6 offset=0,15,0
flat-y 10.5 15 9 repeat=6 offset=0,15,0
flat-y 4.5 15 10 repeat=6 offset=0,15,0
flat-y 7.5 15 10 repeat=6 offset=0,15,0
flat-y 10.5 15 10 repeat=6 offset=0,15,0
flat-y 7.5 15 11 repeat=6 offset=0,15,0
flat-y 10.5 15 11 repeat=6 offset=0,15,0
flat-y 10.5 15 12 repeat=6 offset=0,15,0
# right aisle, rising towards x = 31.5
flat-y 40.5 15 9 repeat=6 offset=0,15,0
flat-y 37.5 15 9 repeat=6 offset=0,15,0
flat-y 34.5 15 9 repeat=6 offset=0,15,0
flat-y 31.5 15 9 repeat=6 offset=0,15,0
flat-y 37.5 15 10 repeat=6 offset=0,15,0
flat-y 34.5 15 10 repeat=6 offset=0,15,0
flat-y 31.5 15 10 repeat=6 offset=0,15,0
flat-y 34.5 15 11 repeat=6 offset=0,15,0
flat-y 31.5 15 11 repeat=6 offset=0,15,0
flat-y 31.5 15 12 repeat=6 offset=0,15,0
```

## Step 17: the lower roof of the nave and the choir

Over the ceiling, build the pitched roof in steps. First two layers of five planks side by side, long side along the church, then two layers of four planks, each plank straddling two planks below. The roof is in two parts. One covers the three bays at the west, the other the two bays at the east. Leave the square bay between them empty: the tower will stand there.

```plank
# nave roof (three bays at the west) and choir roof (two bays at the east)
flat-y 15 15 18 repeat=3 offset=0,15,0
flat-y 18 15 18 repeat=3 offset=0,15,0
flat-y 21 15 18 repeat=3 offset=0,15,0
flat-y 24 15 18 repeat=3 offset=0,15,0
flat-y 27 15 18 repeat=3 offset=0,15,0
flat-y 15 15 19 repeat=3 offset=0,15,0
flat-y 18 15 19 repeat=3 offset=0,15,0
flat-y 21 15 19 repeat=3 offset=0,15,0
flat-y 24 15 19 repeat=3 offset=0,15,0
flat-y 27 15 19 repeat=3 offset=0,15,0
flat-y 16.5 15 20 repeat=3 offset=0,15,0
flat-y 19.5 15 20 repeat=3 offset=0,15,0
flat-y 22.5 15 20 repeat=3 offset=0,15,0
flat-y 25.5 15 20 repeat=3 offset=0,15,0
flat-y 16.5 15 21 repeat=3 offset=0,15,0
flat-y 19.5 15 21 repeat=3 offset=0,15,0
flat-y 22.5 15 21 repeat=3 offset=0,15,0
flat-y 25.5 15 21 repeat=3 offset=0,15,0
flat-y 15 75 18 repeat=2 offset=0,15,0
flat-y 18 75 18 repeat=2 offset=0,15,0
flat-y 21 75 18 repeat=2 offset=0,15,0
flat-y 24 75 18 repeat=2 offset=0,15,0
flat-y 27 75 18 repeat=2 offset=0,15,0
flat-y 15 75 19 repeat=2 offset=0,15,0
flat-y 18 75 19 repeat=2 offset=0,15,0
flat-y 21 75 19 repeat=2 offset=0,15,0
flat-y 24 75 19 repeat=2 offset=0,15,0
flat-y 27 75 19 repeat=2 offset=0,15,0
flat-y 16.5 75 20 repeat=2 offset=0,15,0
flat-y 19.5 75 20 repeat=2 offset=0,15,0
flat-y 22.5 75 20 repeat=2 offset=0,15,0
flat-y 25.5 75 20 repeat=2 offset=0,15,0
flat-y 16.5 75 21 repeat=2 offset=0,15,0
flat-y 19.5 75 21 repeat=2 offset=0,15,0
flat-y 22.5 75 21 repeat=2 offset=0,15,0
flat-y 25.5 75 21 repeat=2 offset=0,15,0
```

## Step 18: the upper roof of the nave and the choir

Go on with two layers of three planks, then two layers of two planks, then two layers of one plank for the ridge. The ridge planks are grey.

```plank
flat-y 18 15 22 repeat=3 offset=0,15,0
flat-y 21 15 22 repeat=3 offset=0,15,0
flat-y 24 15 22 repeat=3 offset=0,15,0
flat-y 18 15 23 repeat=3 offset=0,15,0
flat-y 21 15 23 repeat=3 offset=0,15,0
flat-y 24 15 23 repeat=3 offset=0,15,0
flat-y 19.5 15 24 repeat=3 offset=0,15,0 color=roof
flat-y 22.5 15 24 repeat=3 offset=0,15,0 color=roof
flat-y 19.5 15 25 repeat=3 offset=0,15,0 color=roof
flat-y 22.5 15 25 repeat=3 offset=0,15,0 color=roof
flat-y 21 15 26 repeat=3 offset=0,15,0 color=roof
flat-y 21 15 27 repeat=3 offset=0,15,0 color=roof
flat-y 18 75 22 repeat=2 offset=0,15,0
flat-y 21 75 22 repeat=2 offset=0,15,0
flat-y 24 75 22 repeat=2 offset=0,15,0
flat-y 18 75 23 repeat=2 offset=0,15,0
flat-y 21 75 23 repeat=2 offset=0,15,0
flat-y 24 75 23 repeat=2 offset=0,15,0
flat-y 19.5 75 24 repeat=2 offset=0,15,0 color=roof
flat-y 22.5 75 24 repeat=2 offset=0,15,0 color=roof
flat-y 19.5 75 25 repeat=2 offset=0,15,0 color=roof
flat-y 22.5 75 25 repeat=2 offset=0,15,0 color=roof
flat-y 21 75 26 repeat=2 offset=0,15,0 color=roof
flat-y 21 75 27 repeat=2 offset=0,15,0 color=roof
```

## Step 19: the tower over the crossing

In the empty bay, the crossing, build a hollow log cabin tower fourteen layers high: two planks along, then two across, seven times.

```plank
flat-x 15 60 18 repeat=7 offset=0,0,2
flat-x 15 72 18 repeat=7 offset=0,0,2
flat-y 15 60 19 repeat=7 offset=0,0,2
flat-y 27 60 19 repeat=7 offset=0,0,2
```

## Step 20: the base of the spire

Close the tower with five planks laid side by side across it.

```plank
flat-x 15 60 32 repeat=5 offset=0,3,0
```

## Step 21: the spire, first stage

In the middle of the tower top, lay three planks side by side, then three across them, again and again, six layers in all. Centre each layer on the one below: the spire stands on its middle.

```plank
# stage 1: three planks wide, z = 33 to 38
flat-y 18 60 33 repeat=3 offset=0,0,2 color=roof
flat-y 21 60 33 repeat=3 offset=0,0,2 color=roof
flat-y 24 60 33 repeat=3 offset=0,0,2 color=roof
flat-x 15 63 34 repeat=3 offset=0,0,2 color=roof
flat-x 15 66 34 repeat=3 offset=0,0,2 color=roof
flat-x 15 69 34 repeat=3 offset=0,0,2 color=roof
```

## Step 22: the spire, second stage

Narrow the spire: two planks side by side, then two across, six layers in all. Each layer is centred on the one below.

```plank
# stage 2: two planks wide, z = 39 to 44
flat-y 19.5 60 39 repeat=3 offset=0,0,2 color=roof
flat-y 22.5 60 39 repeat=3 offset=0,0,2 color=roof
flat-x 15 64.5 40 repeat=3 offset=0,0,2 color=roof
flat-x 15 67.5 40 repeat=3 offset=0,0,2 color=roof
```

## Step 23: the needle of the spire

Finish the spire with a single plank in the middle of each layer, one along, one across, twelve layers in all. This is the needle, the tallest point of the cathedral.

```plank
# stage 3: one plank, z = 45 to 56
flat-y 21 60 45 repeat=6 offset=0,0,2 color=roof
flat-x 15 66 46 repeat=6 offset=0,0,2 color=roof
```

## Step 24: the transept arms

On each side of the crossing, build a hollow log cabin against the outer wall of the aisle, seventeen layers high: two planks along, then two across. Build the left one, then the right one.

```plank
flat-x -15 60 0 repeat=9 offset=0,0,2
flat-x -15 72 0 repeat=9 offset=0,0,2
flat-y -15 60 1 repeat=8 offset=0,0,2
flat-y -3 60 1 repeat=8 offset=0,0,2
flat-x 45 60 0 repeat=9 offset=0,0,2
flat-x 45 72 0 repeat=9 offset=0,0,2
flat-y 45 60 1 repeat=8 offset=0,0,2
flat-y 57 60 1 repeat=8 offset=0,0,2
```

## Step 25: the transept ceilings

Lay five planks side by side across the top of each arm, pointing away from you.

```plank
flat-y -15 60 17 repeat=5 offset=3,0,0
flat-y 45 60 17 repeat=5 offset=3,0,0
```

## Step 26: the transept roofs

Roof each arm in steps, like the nave, but with the ridge running across the church: five planks, then four, three, two and one, two layers each. Each plank is laid left to right. The grey planks are the ridge.

```plank
# one line builds the left arm, then the right arm
flat-x -15 60 18 repeat=2 offset=60,0,0
flat-x -15 63 18 repeat=2 offset=60,0,0
flat-x -15 66 18 repeat=2 offset=60,0,0
flat-x -15 69 18 repeat=2 offset=60,0,0
flat-x -15 72 18 repeat=2 offset=60,0,0
flat-x -15 60 19 repeat=2 offset=60,0,0
flat-x -15 63 19 repeat=2 offset=60,0,0
flat-x -15 66 19 repeat=2 offset=60,0,0
flat-x -15 69 19 repeat=2 offset=60,0,0
flat-x -15 72 19 repeat=2 offset=60,0,0
flat-x -15 61.5 20 repeat=2 offset=60,0,0
flat-x -15 64.5 20 repeat=2 offset=60,0,0
flat-x -15 67.5 20 repeat=2 offset=60,0,0
flat-x -15 70.5 20 repeat=2 offset=60,0,0
flat-x -15 61.5 21 repeat=2 offset=60,0,0
flat-x -15 64.5 21 repeat=2 offset=60,0,0
flat-x -15 67.5 21 repeat=2 offset=60,0,0
flat-x -15 70.5 21 repeat=2 offset=60,0,0
flat-x -15 63 22 repeat=2 offset=60,0,0
flat-x -15 66 22 repeat=2 offset=60,0,0
flat-x -15 69 22 repeat=2 offset=60,0,0
flat-x -15 63 23 repeat=2 offset=60,0,0
flat-x -15 66 23 repeat=2 offset=60,0,0
flat-x -15 69 23 repeat=2 offset=60,0,0
flat-x -15 64.5 24 repeat=2 offset=60,0,0 color=roof
flat-x -15 67.5 24 repeat=2 offset=60,0,0 color=roof
flat-x -15 64.5 25 repeat=2 offset=60,0,0 color=roof
flat-x -15 67.5 25 repeat=2 offset=60,0,0 color=roof
flat-x -15 66 26 repeat=2 offset=60,0,0 color=roof
flat-x -15 66 27 repeat=2 offset=60,0,0 color=roof
```

## Step 27: the buttresses

Against the outer walls, build stepped piers, six in all, three on each side. Each pier is four rows of planks laid end to end along the wall and touching each other: eight planks high next to the wall, then six, four and two as they move away from it. The first pier is in the first bay after the west front, the second in the last bay before the transept, the third in the last bay before the apse. The real cathedral has flying buttresses; planks cannot lean, so the piers step down instead.

```plank
# piers at y = 15
flat-y -3 15 0 repeat=8 offset=0,0,1
flat-y -6 15 0 repeat=6 offset=0,0,1
flat-y -9 15 0 repeat=4 offset=0,0,1
flat-y -12 15 0 repeat=2 offset=0,0,1
flat-y 45 15 0 repeat=8 offset=0,0,1
flat-y 48 15 0 repeat=6 offset=0,0,1
flat-y 51 15 0 repeat=4 offset=0,0,1
flat-y 54 15 0 repeat=2 offset=0,0,1
# piers at y = 45
flat-y -3 45 0 repeat=8 offset=0,0,1
flat-y -6 45 0 repeat=6 offset=0,0,1
flat-y -9 45 0 repeat=4 offset=0,0,1
flat-y -12 45 0 repeat=2 offset=0,0,1
flat-y 45 45 0 repeat=8 offset=0,0,1
flat-y 48 45 0 repeat=6 offset=0,0,1
flat-y 51 45 0 repeat=4 offset=0,0,1
flat-y 54 45 0 repeat=2 offset=0,0,1
# piers at y = 90
flat-y -3 90 0 repeat=8 offset=0,0,1
flat-y -6 90 0 repeat=6 offset=0,0,1
flat-y -9 90 0 repeat=4 offset=0,0,1
flat-y -12 90 0 repeat=2 offset=0,0,1
flat-y 45 90 0 repeat=8 offset=0,0,1
flat-y 48 90 0 repeat=6 offset=0,0,1
flat-y 51 90 0 repeat=4 offset=0,0,1
flat-y 54 90 0 repeat=2 offset=0,0,1
```

## Step 28: the apse

Close the east end with a half octagon, the rounded apse. Four stacks of seventeen planks stand on the ground, each stack turned an eighth of a turn from the last, around the middle of the end of the church. Start with the stack on the right, and turn each new stack the same way. The apse stays open at the top, because planks cannot span it.

```plank
# centre of the apse: x = 22.5, y = 105; apothem 18.15
flat-x 15 123.15 0 repeat=17 offset=0,0,1 rot=292.5 pivot=22.5,105
flat-x 15 123.15 0 repeat=17 offset=0,0,1 rot=337.5 pivot=22.5,105
flat-x 15 123.15 0 repeat=17 offset=0,0,1 rot=22.5 pivot=22.5,105
flat-x 15 123.15 0 repeat=17 offset=0,0,1 rot=67.5 pivot=22.5,105
```

## Step 29: the apse buttresses

Behind each wall of the apse, build three stacks of planks laid in the same direction as the wall and touching: eight planks high against the wall, then five, then two.

```plank
flat-x 15 126.15 0 repeat=8 offset=0,0,1 rot=292.5 pivot=22.5,105
flat-x 15 129.15 0 repeat=5 offset=0,0,1 rot=292.5 pivot=22.5,105
flat-x 15 132.15 0 repeat=2 offset=0,0,1 rot=292.5 pivot=22.5,105
flat-x 15 126.15 0 repeat=8 offset=0,0,1 rot=337.5 pivot=22.5,105
flat-x 15 129.15 0 repeat=5 offset=0,0,1 rot=337.5 pivot=22.5,105
flat-x 15 132.15 0 repeat=2 offset=0,0,1 rot=337.5 pivot=22.5,105
flat-x 15 126.15 0 repeat=8 offset=0,0,1 rot=22.5 pivot=22.5,105
flat-x 15 129.15 0 repeat=5 offset=0,0,1 rot=22.5 pivot=22.5,105
flat-x 15 132.15 0 repeat=2 offset=0,0,1 rot=22.5 pivot=22.5,105
flat-x 15 126.15 0 repeat=8 offset=0,0,1 rot=67.5 pivot=22.5,105
flat-x 15 129.15 0 repeat=5 offset=0,0,1 rot=67.5 pivot=22.5,105
flat-x 15 132.15 0 repeat=2 offset=0,0,1 rot=67.5 pivot=22.5,105
```
