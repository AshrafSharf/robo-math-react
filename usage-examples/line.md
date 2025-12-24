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
G = g2d(0, 0, 16, 8, -10, 10, -10, 10)

// Basic line between two points
A = point(G, -4, -2)
B = point(G, 4, 3)
L1 = line(G, A, B)

// Line from coordinates
L2 = line(G, 0, 0, 5, 5)

// Extended line (extends 2 units past end point)
L3 = line(G, A, B, 2)

// Extended line (extends 3 units before start point)
L4 = line(G, A, B, -3)
```

## Comments

| Line | Explanation |
|------|-------------|
| `L1 = line(G, A, B)` | Line from point A to point B |
| `L2 = line(G, 0, 0, 5, 5)` | Line from (0,0) to (5,5) |
| `L3 = line(G, A, B, 2)` | Line extended 2 units past B |
| `L4 = line(G, A, B, -3)` | Line extended 3 units before A |

## Related Line Functions

### vline - Vertical line
```
L = vline(G, 3)              // vertical line at x=3
L = vline(G, 3, -5, 5)       // vertical line at x=3 from y=-5 to y=5
```

### hline - Horizontal line
```
L = hline(G, 2)              // horizontal line at y=2
L = hline(G, 2, -5, 5)       // horizontal line at y=2 from x=-5 to x=5
```

### polarline - Line from length and angle
```
L = polarline(G, 5, 45)          // line: length 5 at 45 degrees from origin
L = polarline(G, 5, 45, 2, 3)    // line: length 5 at 45 degrees from (2,3)
L = polarline(G, 5, 45, A)       // line: length 5 at 45 degrees from point A
```

### pll - Parallel line through point
```
P = pll(G, L, A)             // line parallel to L through point A
P = pll(G, L, A, 8)          // parallel with custom length
```

### perp - Perpendicular line through point
```
P = perp(G, L, A)            // line perpendicular to L through point A
P = perp(G, L, A, 5)         // perpendicular with custom length
```

### xl - Extend line
```
E = xl(G, L, 1.5)            // extend line 50% longer
E = xl(G, L, 2)              // double line length
E = xl(G, L, -0.5, 1.5)      // extend both directions
```

## Extracting Points

```
S = st(L)                    // start point of line
E = ed(L)                    // end point of line
M = mid(L)                   // midpoint of line
```

## Animation

The line draws progressively from start point to end point.
