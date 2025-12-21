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
g = g2d(0, 0, 10, 10)

A = vector(g, 0, 0, 3, 2)
B = vector(g, 1, 1, 4, 3)

P = point(g, 0, 0)
Q = point(g, 5, 5)
C = vector(g, P, Q)
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = vector(g, 0, 0, 3, 2)` | Vector from origin to (3,2) |
| `B = vector(g, 1, 1, 4, 3)` | Vector from (1,1) to (4,3) |
| `C = vector(g, P, Q)` | Vector between two point expressions |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
