# forward

Shifts a vector forward along its direction by a specified distance.

## Visual

```
    Before:
    *---------->
    0          4

    After forward(g, V, 2):
          *---------->
          2          6
```

The vector slides forward in its own direction, preserving its length.

## API

```
forward(g, vector, distance)
        │    │        └── distance to shift forward
        │    └─────────── vector or line to shift
        └──────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

V = vector(g, 0, 0, 4, 0)
shifted = forward(g, V, 2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `V = vector(g, 0, 0, 4, 0)` | Original horizontal vector |
| `shifted = forward(g, V, 2)` | Shifted 2 units forward along its direction |

## Animation

A ghost copy of the original vector slides to the new position.
The translation animates smoothly along the vector's direction.
