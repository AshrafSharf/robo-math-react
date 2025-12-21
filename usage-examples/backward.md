# backward

Shifts a vector backward (opposite to its direction) by a specified distance.

## Visual

```
    Before:
          *---------->
          2          6

    After backward(g, V, 2):
    *---------->
    0          4
```

The vector slides backward opposite to its direction, preserving its length.

## API

```
backward(g, vector, distance)
         │    │        └── distance to shift backward
         │    └─────────── vector or line to shift
         └──────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

V = vector(g, 2, 0, 6, 0)
shifted = backward(g, V, 2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `V = vector(g, 2, 0, 6, 0)` | Original horizontal vector starting at x=2 |
| `shifted = backward(g, V, 2)` | Shifted 2 units backward to start at origin |

## Animation

A ghost copy of the original vector slides to the new position.
The translation animates smoothly opposite to the vector's direction.
