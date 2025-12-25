# reflect

Reflects shapes across a line or vector. Works with points, lines, circles, and polygons.

## Visual

```
    pt1 (original)        pt1' (reflected)
         \                    /
          \                  /
           \                /
    ────────*──────────────*──────── axis
            (mirror line)
```

## API

```
reflect(g, axis, shape)
        │   │      └── shape to reflect (point, line, circle, polygon)
        │   └───────── line or vector as reflection axis
        └───────────── graph
```

## Code - Reflect Point

```
g1 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l1 = line(g1, 0, -5, 0, 5)
pt1 = point(g1, 3, 4)
reflect(g1, l1, pt1)
```

## Code - Reflect Line

```
g2 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l2 = line(g2, 0, -5, 0, 5)
l3 = line(g2, 2, 1, 5, 4)
reflect(g2, l2, l3)
```

## Code - Reflect Circle

```
g3 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l4 = line(g3, 0, -5, 0, 5)
c1 = circle(g3, 4, 3, 2)
reflect(g3, l4, c1)
```

## Code - Reflect Polygon

```
g4 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l5 = line(g4, 0, -5, 0, 5)
tri1 = polygon(g4, 2, 1, 5, 1, 3.5, 4)
reflect(g4, l5, tri1)
```

## Code - Using Vector as Axis

```
g5 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
v1 = vector(g5, -3, -3, 3, 3)
pt2 = point(g5, 4, 1)
reflect(g5, v1, pt2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `reflect(g1, l1, pt1)` | Reflect point across vertical line |
| `reflect(g2, l2, l3)` | Reflect line across axis |
| `reflect(g3, l4, c1)` | Circle center moves, radius preserved |
| `reflect(g4, l5, tri1)` | All vertices reflect across axis |
| `reflect(g5, v1, pt2)` | Vector direction defines axis |

## Animation

The reflection animates:
1. Original shape visible
2. Shape moves/transforms across the axis
3. Reflected shape appears on opposite side

## Related

- `project` - Project point onto line (stops at axis)
- `reflect3d` - 3D reflection across plane
- `rotate` - Rotate around point
