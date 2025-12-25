# dm

Creates a distance marker between two points with an optional label. Useful for annotating measurements in geometric diagrams.

## Visual

```
     pt1                    pt2
      |                      |
      |<------ label ------->|
      |                      |
```

## API

```
dm(g, x1, y1, x2, y2, label)
   │   │   │   │   │    └── label text (LaTeX supported)
   │   │   │   │   └─────── end y-coordinate
   │   │   │   └─────────── end x-coordinate
   │   │   └─────────────── start y-coordinate
   │   └─────────────────── start x-coordinate
   └─────────────────────── graph

dm(g, pt1, pt2, label, textOffset, markerOffset)
   │   │    │     │        │           └── shift marker parallel (optional)
   │   │    │     │        └───────────── text distance from line (optional)
   │   │    │     └────────────────────── label text
   │   │    └──────────────────────────── end point expression
   │   └───────────────────────────────── start point expression
   └───────────────────────────────────── graph
```

## Code

```
g1 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)

# Basic distance marker with coordinates
dm(g1, 0, 0, 5, 0, "5 units")

# Using point variables
pt1 = point(g1, 2, 3)
pt2 = point(g1, 8, 5)
lbl1 = "d = 6.3"
dm(g1, pt1, pt2, lbl1)

# LaTeX label
lbl2 = "\\sqrt{40}"
dm(g1, pt1, pt2, lbl2)

# With text offset (text 0.5 units above the marker line)
lbl3 = "distance"
dm(g1, pt1, pt2, lbl3, 0.5)

# With marker offset (marker shifted 1 unit parallel)
lbl4 = "5 units"
dm(g1, 0, 0, 5, 0, lbl4, 0.3, 1)
```

## Comments

| Line | Explanation |
|------|-------------|
| `dm(g1, 0, 0, 5, 0, "5 units")` | Marker from origin to (5,0) with label |
| `dm(g1, pt1, pt2, lbl1)` | Marker between two points using variables |
| `dm(g1, pt1, pt2, lbl2)` | Marker with LaTeX square root label |
| `dm(g1, pt1, pt2, lbl3, 0.5)` | Text positioned 0.5 units from line |
| `dm(g1, 0, 0, 5, 0, lbl4, 0.3, 1)` | Text 0.3 offset, marker shifted 1 unit |

## Notes

- The marker draws perpendicular ticks at both endpoints
- Text is centered along the marker line
- Positive `textOffset` moves text away from the line
- Positive `markerOffset` shifts the entire marker parallel to the original line
