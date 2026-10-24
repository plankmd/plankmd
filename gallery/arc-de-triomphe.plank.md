---
plankmd: "0.1"
title: Arc de triomphe
lang: en
inventory: 220
difficulty: 4
license: CC0-1.0
---

# Arc de triomphe

A triumphal arch inspired by the Arc de Triomphe: two massive hollow piers that rise straight, then lean towards each other until they almost meet, a vault over the opening, and an attic on top. 216 planks.

## Step 1: the two piers

Build two square towers with thick walls, one plank length apart. Each tower is one plank wide and two planks deep, and is made of two hollow cells side by side. In each cell, lay two planks along the width, then two across them, and repeat four times. To space the towers, lay one plank between them at the bottom as a ruler, then take it away.

```plank
guide flat-x 15 0 0                         # gap at the bottom: one length
# cell at y = 0
flat-x 0 0 0 repeat=4 offset=0,0,2
flat-x 0 12 0 repeat=4 offset=0,0,2
flat-y 0 0 1 repeat=4 offset=0,0,2
flat-y 12 0 1 repeat=4 offset=0,0,2
# cell at y = 15
flat-x 0 15 0 repeat=4 offset=0,0,2
flat-x 0 27 0 repeat=4 offset=0,0,2
flat-y 0 15 1 repeat=4 offset=0,0,2
flat-y 12 15 1 repeat=4 offset=0,0,2
# cell at y = 0
flat-x 30 0 0 repeat=4 offset=0,0,2
flat-x 30 12 0 repeat=4 offset=0,0,2
flat-y 42 0 1 repeat=4 offset=0,0,2
flat-y 30 0 1 repeat=4 offset=0,0,2
# cell at y = 15
flat-x 30 15 0 repeat=4 offset=0,0,2
flat-x 30 27 0 repeat=4 offset=0,0,2
flat-y 42 15 1 repeat=4 offset=0,0,2
flat-y 30 15 1 repeat=4 offset=0,0,2
```

## Step 2: the left pier leans

Keep building the left tower in the same way, but slide each new layer half a plank width towards the middle of the arch. Five times. Do not slide further, or the pier tips over.

```plank
# cell at y = 0
flat-x 0 0 8 repeat=5 offset=1.5,0,2
flat-x 0 12 8 repeat=5 offset=1.5,0,2
flat-y 0 0 9 repeat=5 offset=1.5,0,2
flat-y 12 0 9 repeat=5 offset=1.5,0,2
# cell at y = 15
flat-x 0 15 8 repeat=5 offset=1.5,0,2
flat-x 0 27 8 repeat=5 offset=1.5,0,2
flat-y 0 15 9 repeat=5 offset=1.5,0,2
flat-y 12 15 9 repeat=5 offset=1.5,0,2
```

## Step 3: the right pier leans

Do the same on the right, sliding to the left. At the top, only one plank width remains between the two towers.

```plank
# cell at y = 0
flat-x 30 0 8 repeat=5 offset=-1.5,0,2
flat-x 30 12 8 repeat=5 offset=-1.5,0,2
flat-y 42 0 9 repeat=5 offset=-1.5,0,2
flat-y 30 0 9 repeat=5 offset=-1.5,0,2
# cell at y = 15
flat-x 30 15 8 repeat=5 offset=-1.5,0,2
flat-x 30 27 8 repeat=5 offset=-1.5,0,2
flat-y 42 15 9 repeat=5 offset=-1.5,0,2
flat-y 30 15 9 repeat=5 offset=-1.5,0,2
```

## Step 4: the vault

Close the arch with a ceiling: two planks end to end in each row, ten rows. Each plank rests on a pier at both ends, and the two planks of a row meet over the middle of the gap.

```plank
flat-x 7.5 0 18 repeat=10 offset=0,3,0
flat-x 22.5 0 18 repeat=10 offset=0,3,0
```

## Step 5: the attic

Raise the attic as a hollow box: planks along the front and the back, then planks across, then along again. Two times over.

```plank
flat-x 7.5 0 19 repeat=2 offset=0,0,2
flat-x 22.5 0 19 repeat=2 offset=0,0,2
flat-x 7.5 12 19 repeat=2 offset=0,0,2
flat-x 22.5 12 19 repeat=2 offset=0,0,2
flat-x 7.5 15 19 repeat=2 offset=0,0,2
flat-x 22.5 15 19 repeat=2 offset=0,0,2
flat-x 7.5 27 19 repeat=2 offset=0,0,2
flat-x 22.5 27 19 repeat=2 offset=0,0,2
flat-y 7.5 0 20 repeat=2 offset=0,0,2
flat-y 7.5 15 20 repeat=2 offset=0,0,2
flat-y 19.5 0 20 repeat=2 offset=0,0,2
flat-y 19.5 15 20 repeat=2 offset=0,0,2
flat-y 22.5 0 20 repeat=2 offset=0,0,2
flat-y 22.5 15 20 repeat=2 offset=0,0,2
flat-y 34.5 0 20 repeat=2 offset=0,0,2
flat-y 34.5 15 20 repeat=2 offset=0,0,2
```

## Step 6: the roof

Cover the attic with planks lying along the front, two per row, ten rows.

```plank
flat-x 7.5 0 23 repeat=10 offset=0,3,0
flat-x 22.5 0 23 repeat=10 offset=0,3,0
```
