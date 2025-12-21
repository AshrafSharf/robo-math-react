# perpshift

Shifts a vector perpendicular to its direction by a specified distance.

## Visual

```
    y
    ^
    |   *---------->  perpshift(g, V, +2)
    |
    |   *---------->  V (original)
    |
    |   *---------->  perpshift(g, V, -2)
    +-----------------------> x
```

Positive distance shifts left (CCW from vector direction), negative shifts right (CW).

## API

```
perpshift(g, vector, distance)
          │    │        └── perpendicular distance (+ left, - right)
          │    └─────────── vector or line to shift
          └──────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

V = vector(g, 0, 0, 4, 0)
up = perpshift(g, V, 2)
down = perpshift(g, V, -2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `V = vector(g, 0, 0, 4, 0)` | Original horizontal vector |
| `up = perpshift(g, V, 2)` | Shifted 2 units upward (perpendicular left) |
| `down = perpshift(g, V, -2)` | Shifted 2 units downward (perpendicular right) |

## Animation

A ghost copy of the original vector slides to the new position.
The translation animates smoothly perpendicular to the vector's direction.
