# measure3d

Creates a 3D distance marker between two points with a label. Useful for annotating measurements in 3D geometric diagrams.

## Visual

```
     pt1                    pt2
      |                      |
      |<------ label ------->|
      |                      |
```

## API

```
measure3d(g, x1, y1, z1, x2, y2, z2, label)
   │   │   │   │   │   │   │    └── label text (LaTeX supported)
   │   │   │   │   │   │   └─────── end z-coordinate
   │   │   │   │   │   └─────────── end y-coordinate
   │   │   │   │   └─────────────── end x-coordinate
   │   │   │   └─────────────────── start z-coordinate
   │   │   └─────────────────────── start y-coordinate
   │   └─────────────────────────── start x-coordinate
   └─────────────────────────────── 3D graph

measure3d(g, pt1, pt2, label)
   │   │    │     └── label text
   │   │    └──────── end point3d expression
   │   └───────────── start point3d expression
   └───────────────── 3D graph
```

## Code

```
g1 = g3d(0, 0, 16, 8)

# Basic distance marker with coordinates
measure3d(g1, 0, 0, 0, 5, 0, 0, "5 units")

# Using point3d variables
p1 = point3d(g1, 1, 0, 0)
p2 = point3d(g1, 1, 4, 0)
measure3d(g1, p1, p2, "4 units")

# LaTeX label
p3 = point3d(g1, 0, 0, 0)
p4 = point3d(g1, 3, 4, 0)
measure3d(g1, p3, p4, "\\sqrt{25}")

# Measuring along z-axis
measure3d(g1, 0, 0, 0, 0, 0, 3, "height = 3")

# Diagonal measurement in 3D space
a = point3d(g1, 0, 0, 0)
b = point3d(g1, 1, 1, 1)
measure3d(g1, a, b, "\\sqrt{3}")
```

## Comments

| Line | Explanation |
|------|-------------|
| `measure3d(g1, 0, 0, 0, 5, 0, 0, "5 units")` | Marker along x-axis from origin |
| `measure3d(g1, p1, p2, "4 units")` | Marker between two point3d variables |
| `measure3d(g1, p3, p4, "\\sqrt{25}")` | Marker with LaTeX label |
| `measure3d(g1, 0, 0, 0, 0, 0, 3, "height = 3")` | Vertical measurement along z-axis |
| `measure3d(g1, a, b, "\\sqrt{3}")` | Diagonal measurement in 3D space |

## Notes

- The marker draws perpendicular ticks at both endpoints
- Label is positioned at the midpoint of the measurement line
- Animation: fade-in effect for the indicator and label
- Works with both LHS and RHS coordinate systems

## See Also

- `measure` - 2D version for g2d graphs
- `distance` - Calculate distance without visual marker
