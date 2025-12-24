# pointatratio

Gets a point at a specific ratio (0 to 1) along any shape's path.

## Visual

```
Line:
A -------- P -------- B
0         0.5        1.0

Circle:
        0.25 (top)
          |
    0.5 --+-- 0 (start)
          |
        0.75

Polygon:
    B
   /|
  / |  0.5 is here (halfway around perimeter)
 /  |
A---C
```

## Supported Shapes

| Shape | Behavior |
|-------|----------|
| `line` | Linear interpolation from start to end |
| `vector` | Linear interpolation from tail to tip |
| `circle` | Point on circumference (0=right, 0.25=top, 0.5=left, 0.75=bottom) |
| `arc` | Point along arc from start angle to end angle |
| `polygon` | Point along perimeter, walking edges |

## API

```
// Shape mode - point along any shape's path
pointatratio(g, shape, ratio)
             |    |      +-- ratio (0=start, 1=end)
             |    +--------- any supported shape
             +-------------- 2D graph

// Two-point mode - linear interpolation
pointatratio(g, p1, p2, ratio)
             |   |   |    +-- ratio (0=p1, 1=p2)
             |   |   +------- end point
             |   +----------- start point
             +--------------- 2D graph
```

## Code

```
g = g2d(0, 0, 16, 8, -6, 6, -4, 4, 1)

// === LINE ===
L = line(g, -4, 0, 4, 0)
P1 = pointatratio(g, L, 0.5)      // midpoint (0, 0)
P2 = pointatratio(g, L, 0.25)     // quarter way (-2, 0)
P3 = pointatratio(g, L, 1.5)      // extrapolated (6, 0)

// === CIRCLE ===
C = circle(g, 2, 0, 0)
Q1 = pointatratio(g, C, 0)        // right (2, 0)
Q2 = pointatratio(g, C, 0.25)     // top (0, 2)
Q3 = pointatratio(g, C, 0.5)      // left (-2, 0)
Q4 = pointatratio(g, C, 0.75)     // bottom (0, -2)

// === ARC ===
A = arc(g, 0, 0, 3, 0, 90)        // 90° arc from 0° to 90°
R1 = pointatratio(g, A, 0)        // start of arc
R2 = pointatratio(g, A, 0.5)      // midpoint of arc (45°)
R3 = pointatratio(g, A, 1)        // end of arc

// === POLYGON (triangle) ===
T = polygon(g, 0, 0, 4, 0, 2, 3)
S1 = pointatratio(g, T, 0)        // first vertex
S2 = pointatratio(g, T, 0.5)      // halfway around perimeter
S3 = pointatratio(g, T, 1)        // back to start

// === TWO POINTS ===
A = point(g, -3, -2)
B = point(g, 3, 2)
M = pointatratio(g, A, B, 0.5)    // midpoint
T = pointatratio(g, A, B, 0.33)   // one-third from A to B
```

## Comments

| Line | Explanation |
|------|-------------|
| `pointatratio(g, L, 0.5)` | Midpoint of line L |
| `pointatratio(g, L, 1.5)` | Extrapolated 50% past end of line |
| `pointatratio(g, C, 0.25)` | Top of circle (90° = 0.25 × 360°) |
| `pointatratio(g, A, 0.5)` | Midpoint along arc path |
| `pointatratio(g, T, 0.5)` | Halfway around triangle perimeter |
| `pointatratio(g, A, B, 0.33)` | Point 33% from A toward B |

## Dynamic Animation with change()

```
g = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

// Animate a point traveling along a circle
C = circle(g, 3, 0, 0)
t = 0
P = pointatratio(g, C, t)
change(t, 1)                      // P travels full circle

// Animate along a polygon perimeter
T = polygon(g, -3, -2, 3, -2, 0, 2)
s = 0
Q = pointatratio(g, T, s)
change(s, 1)                      // Q walks around triangle
```

## Ratio Reference

| Ratio | Meaning |
|-------|---------|
| 0 | Start of shape |
| 0.25 | Quarter way |
| 0.5 | Midpoint |
| 0.75 | Three-quarters |
| 1 | End of shape |
| < 0 | Extrapolate backward (lines/vectors only) |
| > 1 | Extrapolate forward (lines/vectors only) |

## Circle Ratio Diagram

```
              0.25
               |
               |
    0.375 -----+----- 0.125
              /|\
             / | \
            /  |  \
     0.5 --+   |   +-- 0 (start)
            \  |  /
             \ | /
              \|/
    0.625 -----+----- 0.875
               |
               |
              0.75
```
