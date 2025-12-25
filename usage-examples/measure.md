# measure

Creates a distance marker between two points with a label. Useful for annotating measurements in geometric diagrams.

## Visual

```
     pt1                    pt2
      |                      |
      |<------ label ------->|
      |                      |
```

## API

```
measure(g, x1, y1, x2, y2, label)
   │   │   │   │   │    └── label text (LaTeX supported)
   │   │   │   │   └─────── end y-coordinate
   │   │   │   └─────────── end x-coordinate
   │   │   └─────────────── start y-coordinate
   │   └─────────────────── start x-coordinate
   └─────────────────────── graph

measure(g, pt1, pt2, label, textOffset, markerOffset)
   │   │    │     │        │           └── shift marker parallel (optional)
   │   │    │     │        └───────────── text distance from line (optional)
   │   │    │     └────────────────────── label text
   │   │    └──────────────────────────── end point expression
   │   └───────────────────────────────── start point expression
   └───────────────────────────────────── graph
```

## Code

```
g1 = g2d(0, 0, 20,20, -10, 10, -10, 10, 1)
measure(g1, 0, 0, 5, 0, "5 units")
pt1 = point(g1, 2, 3)
pt2 = point(g1, 8, 5)
lbl2 = "\sqrt{40}"
measure(g1, pt1, pt2, lbl2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `measure(g1, 0, 0, 5, 0, "5 units")` | Marker from origin to (5,0) with label |
| `measure(g1, pt1, pt2, lbl1)` | Marker between two points using variables |
| `measure(g1, pt1, pt2, lbl2)` | Marker with LaTeX square root label |
| `measure(g1, pt1, pt2, lbl3, 0.5)` | Text positioned 0.5 units from line |
| `measure(g1, 0, 0, 5, 0, lbl4, 0.3, 1)` | Text 0.3 offset, marker shifted 1 unit |

## Notes

- The marker draws perpendicular ticks at both endpoints
- Text is centered along the marker line
- Positive `textOffset` moves text away from the line
- Positive `markerOffset` shifts the entire marker parallel to the original line

## 3D Version

For 3D graphs, use `measure3d`:

```
g1 = g3d(0, 0, 20, 20)

# Basic 3D distance marker
measure3d(g1, 0, 0, 0, 5, 0, 0, "5 units")

# Using 3D points
p1 = point3d(g1, 1, 2, 3)
p2 = point3d(g1, 4, 5, 6)
measure3d(g1, p1, p2, "distance")
```
