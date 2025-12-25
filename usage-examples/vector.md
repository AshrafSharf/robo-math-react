# vector

Creates a 2D vector (arrow) between two points.

## Visual

```
          end (3,2)
         /
        /
       /
      /
     * -------->
    /
   /
start (0,0)
```

A vector has direction (from start to end) and magnitude (length).

## API

```
vector(g, x1, y1, x2, y2)
       │   │   │   │   └── end y-coordinate
       │   │   │   └────── end x-coordinate
       │   │   └────────── start y-coordinate
       │   └────────────── start x-coordinate
       └────────────────── graph

vector(g, point1, point2)
       │    │        └── end point expression
       │    └─────────── start point expression
       └──────────────── graph
```

## Code

```
g1 = g2d(0, 0, 10, 10)

v1 = vector(g1, 0, 0, 3, 2)
v2 = vector(g1, 1, 1, 4, 3)

pt1 = point(g1, 0, 0)
pt2 = point(g1, 5, 5)
v3 = vector(g1, pt1, pt2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `v1 = vector(g1, 0, 0, 3, 2)` | Vector from origin to (3,2) |
| `v2 = vector(g1, 1, 1, 4, 3)` | Vector from (1,1) to (4,3) |
| `v3 = vector(g1, pt1, pt2)` | Vector between two point expressions |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
