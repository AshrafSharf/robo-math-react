# placeat

Copies a vector to a new starting point, preserving its direction and magnitude.

## Visual

```
    Original V:
    *---------->
    (0,0)     (4,0)

    placeat(g, V, P):
              P *---------->
              (2,2)     (6,2)
```

The vector is copied with the same direction and length at a new position.

## API

```
placeat(g, vector, point)
        │    │       └── new starting point expression
        │    └────────── vector or line to copy
        └─────────────── graph

placeat(g, vector, x, y)
        │    │     │  └── new start y-coordinate
        │    │     └───── new start x-coordinate
        │    └──────────── vector or line to copy
        └───────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

V = vector(g, 0, 0, 4, 0)
P = point(g, 2, 2)

copy1 = placeat(g, V, P)
copy2 = placeat(g, V, 3, 3)
```

## Comments

| Line | Explanation |
|------|-------------|
| `V = vector(g, 0, 0, 4, 0)` | Original horizontal vector |
| `copy1 = placeat(g, V, P)` | Copy of V starting at point P |
| `copy2 = placeat(g, V, 3, 3)` | Copy of V starting at (3,3) |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
