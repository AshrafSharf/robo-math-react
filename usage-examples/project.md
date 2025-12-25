# project

Projects a point onto a line, finding the perpendicular foot. The point animates moving to its projection on the line.

## Visual

```
        pt1 (original)
         |
         |  (perpendicular)
         |
    ─────*───────── l1
      (projected)
```

## API

```
project(g, line, point)
        │   │      └── point to project
        │   └───────── line to project onto
        └───────────── graph
```

## Code

```
# Basic projection
g1 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l1 = line(g1, -5, -3, 5, 5)
pt1 = point(g1, 4, 6)
project(g1, l1, pt1)

# Project onto horizontal line
g2 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l2 = line(g2, -8, 0, 8, 0)
pt2 = point(g2, 3, 5)
project(g2, l2, pt2)

# Project onto vertical line
g3 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l3 = line(g3, 0, -8, 0, 8)
pt3 = point(g3, 6, 4)
project(g3, l3, pt3)

# Project onto diagonal
g4 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
l4 = line(g4, -5, -5, 5, 5)
pt4 = point(g4, -3, 4)
project(g4, l4, pt4)
```

## Comments

| Line | Explanation |
|------|-------------|
| `project(g1, l1, pt1)` | Animates pt1 moving to perpendicular foot on l1 |
| `project(g2, l2, pt2)` | Projects onto x-axis (y becomes 0) |
| `project(g3, l3, pt3)` | Projects onto y-axis (x becomes 0) |

## Animation

The projection creates:
1. The original point at its starting position
2. An animation showing the point moving perpendicular to the line
3. The point ending at its projection (foot of perpendicular)

## Related

- `reflect` - Reflect point across line (goes twice as far as project)
- `perp` - Create perpendicular line
- `project3d` - 3D projection onto plane
