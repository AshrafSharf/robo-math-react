# line

Creates a line segment between two points.

## Visual

```
    (x2, y2)
       *
      /
     /
    /
   *
(x1, y1)
```

## API

```
line(g, p1, p2)
     │   │   └── end point
     │   └────── start point
     └────────── graph

line(g, x1, y1, x2, y2)
     │   │   │   │   └── end y-coordinate
     │   │   │   └────── end x-coordinate
     │   │   └────────── start y-coordinate
     │   └────────────── start x-coordinate
     └────────────────── graph

line(g, p1, p2, ext)
     │   │   │    └── extension distance (+ extends end, - extends start)
     │   │   └─────── end point
     │   └─────────── start point
     └─────────────── graph
```

## Code

```
g1 = g2d(0, 0, 16, 8, -10, 10, -10, 10)

// Basic line between two points
pt1 = point(g1, -4, -2)
pt2 = point(g1, 4, 3)
l1 = line(g1, pt1, pt2)

// Line from coordinates
l2 = line(g1, 0, 0, 5, 5)

// Extended line (extends 2 units past end point)
l3 = line(g1, pt1, pt2, 2)

// Extended line (extends 3 units before start point)
l4 = line(g1, pt1, pt2, -3)
```

## Comments

| Line | Explanation |
|------|-------------|
| `l1 = line(g1, pt1, pt2)` | Line from point pt1 to point pt2 |
| `l2 = line(g1, 0, 0, 5, 5)` | Line from (0,0) to (5,5) |
| `l3 = line(g1, pt1, pt2, 2)` | Line extended 2 units past pt2 |
| `l4 = line(g1, pt1, pt2, -3)` | Line extended 3 units before pt1 |

## Related Line Functions

### vline - Vertical line
```
l1 = vline(g1, 3)              // vertical line at x=3
l2 = vline(g1, 3, -5, 5)       // vertical line at x=3 from y=-5 to y=5
```

### hline - Horizontal line
```
l1 = hline(g1, 2)              // horizontal line at y=2
l2 = hline(g1, 2, -5, 5)       // horizontal line at y=2 from x=-5 to x=5
```

### polarline - Line from length and angle
```
l1 = polarline(g1, 5, 45)          // line: length 5 at 45 degrees from origin
l2 = polarline(g1, 5, 45, 2, 3)    // line: length 5 at 45 degrees from (2,3)
l3 = polarline(g1, 5, 45, pt1)     // line: length 5 at 45 degrees from point pt1
```

### pll - Parallel line through point
```
l2 = pll(g1, l1, pt1)          // line parallel to l1 through point pt1
l3 = pll(g1, l1, pt1, 8)       // parallel with custom length
```

### perp - Perpendicular line through point
```
l2 = perp(g1, l1, pt1)         // line perpendicular to l1 through point pt1
l3 = perp(g1, l1, pt1, 5)      // perpendicular with custom length
```

### xl - Extend line
```
l2 = xl(g1, l1, 1.5)           // extend line 50% longer
l3 = xl(g1, l1, 2)             // double line length
l4 = xl(g1, l1, -0.5, 1.5)     // extend both directions
```

## Extracting Points

```
pt1 = start(g1, l1)            // start point of line
pt2 = end(g1, l1)              // end point of line
pt3 = mid(l1)                  // midpoint of line
```

## Animation

The line draws progressively from start point to end point.
