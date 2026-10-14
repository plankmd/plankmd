---
plankmd: "0.2"
title: Tent
lang: en
inventory: 20
difficulty: 2
author: PlankMD contributors
license: CC0-1.0
date: 2026-10-14
tags: [tent, leaning]
minutes: 5
view: front-left,20
---

# Tent

Standing planks that lean on each other, two by two, and a ridge along the
top. 11 planks.

## Step 1: the walls

Stand two planks on their ends, a little apart, and tip them towards each
other until their tops meet: hold the first one until the second leans on
it. Do the same four more times, each pair against the one before.

```plank
up-y 0 0 0   lean=+x:10 repeat=5 offset=0,3,0
up-y 6.2 0 0 lean=-x:10 repeat=5 offset=0,3,0
```

## Step 2: the ridge

Lay one plank flat along the top, where the walls meet.

```plank view=front,8 zoom=1.4 focus=step
flat-y 1.6 0 14.94
```
