# point

Creates a 2D point at specified coordinates.

## Visual

```
        y
        │
        │     * P(3, 4)
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
      │    └── expression returning 2 values (e.g., st(L), ed(L), mid(L))
      └─────── graph
```

## Code

```
G = g2d(0, 0, 16, 8, -10, 10, -10, 10)

// Basic point from coordinates
A = point(G, 3, 4)
B = point(G, -2, 5)
O = point(G, 0, 0)

// Point from line endpoints
L = line(G, 1, 1, 5, 4)
S = point(G, st(L))      // start point of line
E = point(G, ed(L))      // end point of line
M = point(G, mid(L))     // midpoint of line

// Point arithmetic
C = A + B                // (1, 9)
D = A - B                // (5, -1)
E = A * 2                // (6, 8)
F = A / 2                // (1.5, 2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = point(G, 3, 4)` | Point at coordinates (3, 4) |
| `point(G, st(L))` | Point at start of line L |
| `point(G, ed(L))` | Point at end of line L |
| `point(G, mid(L))` | Point at midpoint of line L |
| `A + B` | Vector addition of points |
| `A * 2` | Scale point coordinates |

## Related Point Functions

### polarpoint - Point from polar coordinates
```
P = polarpoint(G, 5, 45)         // point at (r=5, θ=45°) from origin
P = polarpoint(G, 5, 45, 2, 3)   // point at (r=5, θ=45°) from center (2,3)
P = polarpoint(G, 5, 45, A)      // point at (r=5, θ=45°) from point A
```

### intersect - Point at intersection
```
P = intersect(L1, L2)            // intersection of two lines
P = intersect(L, C)              // intersection of line and circle
```

### project - Project point onto line
```
P = project(L, A)                // foot of perpendicular from A to line L
```

### reflect - Reflect point across line
```
P = reflect(L, A)                // reflection of point A across line L
```

### mid - Midpoint
```
M = mid(A, B)                    // midpoint between A and B
M = mid(L)                       // midpoint of line L
```

### r2p - Ratio to point
```
P = r2p(A, B, 0.25)              // point 25% from A to B
P = r2p(L, 0.75)                 // point 75% along line L
```

### a2p - Angle to point on circle
```
P = a2p(C, 45)                   // point on circle C at 45 degrees
```

## Coordinate Extraction

```
xVal = x(A)                      // x-coordinate of point A
yVal = y(A)                      // y-coordinate of point A
```

## Animation

Points appear with a brief scale-in animation.
