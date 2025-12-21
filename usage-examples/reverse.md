# reverse

Creates a reversed (opposite direction) vector at a new starting point.

## Visual

```
    Original V:
    *---------->
    (0,0)     (4,0)

    reverse(g, V, P):
              <----------*
            (2,2)     (6,2)
                       P
```

The vector is flipped and placed at the new position. Useful for visualizing vector subtraction: a - b = a + (-b).

## API

```
reverse(g, vector, point)
        │    │       └── new starting point expression
        │    └────────── vector or line to reverse
        └─────────────── graph

reverse(g, vector, x, y)
        │    │     │  └── new start y-coordinate
        │    │     └───── new start x-coordinate
        │    └──────────── vector or line to reverse
        └───────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

V = vector(g, 0, 0, 4, 0)
P = point(g, 2, 2)

negV = reverse(g, V, P)
negV2 = reverse(g, V, 3, 3)
```

## Comments

| Line | Explanation |
|------|-------------|
| `V = vector(g, 0, 0, 4, 0)` | Original rightward vector |
| `negV = reverse(g, V, P)` | Leftward vector (-V) starting at P |
| `negV2 = reverse(g, V, 3, 3)` | Leftward vector (-V) starting at (3,3) |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
