# point

Creates a 2D point at specified coordinates.

## Visual

```
        y
        │
        │     * pt1(3, 4)
        │
        │
   ─────┼─────────── x
        │
```

## API

```
point(g, x, y)
      │  │  └── y-coordinate
      │  └───── x-coordinate
      └──────── graph

point(g, expr)
      │    └── expression returning 2 values (e.g., start(g, l), end(g, l), mid(l))
      └─────── graph
```

## Code

```
g1 = g2d(0, 0, 16, 8, -10, 10, -10, 10)

// Basic point from coordinates
pt1 = point(g1, 3, 4)
pt2 = point(g1, -2, 5)
origin = point(g1, 0, 0)

// Point from line endpoints
l1 = line(g1, 1, 1, 5, 4)
pt3 = start(g1, l1)          // start point of line
pt4 = end(g1, l1)            // end point of line
pt5 = point(g1, mid(l1))     // midpoint of line

// Point arithmetic
pt6 = pt1 + pt2              // (1, 9)
pt7 = pt1 - pt2              // (5, -1)
pt8 = pt1 * 2                // (6, 8)
pt9 = pt1 / 2                // (1.5, 2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `pt1 = point(g1, 3, 4)` | Point at coordinates (3, 4) |
| `start(g1, l1)` | Point at start of line l1 |
| `end(g1, l1)` | Point at end of line l1 |
| `point(g1, mid(l1))` | Point at midpoint of line l1 |
| `pt1 + pt2` | Vector addition of points |
| `pt1 * 2` | Scale point coordinates |

## Related Point Functions

### polarpoint - Point from polar coordinates
```
pt1 = polarpoint(g1, 5, 45)         // point at (r=5, θ=45°) from origin
pt2 = polarpoint(g1, 5, 45, 2, 3)   // point at (r=5, θ=45°) from center (2,3)
pt3 = polarpoint(g1, 5, 45, pt1)    // point at (r=5, θ=45°) from point pt1
```

### intersect - Point at intersection
```
pt1 = intersect(l1, l2)            // intersection of two lines
pt2 = intersect(l1, c1)            // intersection of line and circle
```

### project - Project point onto line
```
pt1 = project(l1, pt2)             // foot of perpendicular from pt2 to line l1
```

### reflect - Reflect point across line
```
pt1 = reflect(l1, pt2)             // reflection of point pt2 across line l1
```

### mid - Midpoint
```
m1 = mid(pt1, pt2)                 // midpoint between pt1 and pt2
m2 = mid(l1)                       // midpoint of line l1
```

### r2p - Ratio to point
```
pt1 = r2p(pt2, pt3, 0.25)          // point 25% from pt2 to pt3
pt2 = r2p(l1, 0.75)                // point 75% along line l1
```

### a2p - Angle to point on circle
```
pt1 = a2p(c1, 45)                  // point on circle c1 at 45 degrees
```

## Coordinate Extraction

```
xval = x(pt1)                      // x-coordinate of point pt1
yval = y(pt1)                      // y-coordinate of point pt1
```

## Animation

Points appear with a brief scale-in animation.
