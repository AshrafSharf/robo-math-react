# decompose

Decomposes a vector into parallel and perpendicular components relative to a reference vector.

## Visual

```
        A (2,2)
       /|
      / |  ← perp (perpendicular component)
     /  |
    /   |
   -----+------ B (3,0)
   parallel component
```

The parallel + perpendicular components sum back to the original vector A.

## API

```
decompose(g, vectorSource, vectorReference)
         │        │              └── reference vector defining the direction
         │        └───────────────── vector to decompose
         └────────────────────────── graph

decompose(g, vectorSource, vectorReference, "perp")
         │        │              │             └── flag for perpendicular component
         │        │              └────────────── reference vector
         │        └───────────────────────────── vector to decompose
         └────────────────────────────────────── graph
```

## Code

```
g = g2d(2, 2, 20, 20)

A = vector(g, 0, 0, 2, 2)
B = vector(g, 0, 0, 3, 0)

parallel = decompose(g, A, B)
perp = decompose(g, A, B, "perp")
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = vector(g, 0, 0, 2, 2)` | Diagonal vector from origin to (2,2) |
| `B = vector(g, 0, 0, 3, 0)` | Horizontal reference vector |
| `parallel = decompose(g, A, B)` | Parallel component - projection of A along B's direction |
| `perp = decompose(g, A, B, "perp")` | Perpendicular component - orthogonal to B |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
