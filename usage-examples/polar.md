# polar

Creates a vector using polar coordinates (length and angle).

## Visual

```
                    * (end)
                   /
                  /  length = 5
                 /
                / ) angle = 45deg
               *---------->
           origin        0deg (right)
```

Angle reference: 0=right, 90=up, 180=left, 270=down

## API

```
polar(g, length, angleDeg)
      │    │        └── angle in degrees (0-360)
      │    └─────────── vector magnitude
      └──────────────── graph

polar(g, length, angleDeg, fromX, fromY)
      │    │        │       │      └── start y-coordinate
      │    │        │       └───────── start x-coordinate
      │    │        └───────────────── angle in degrees
      │    └────────────────────────── vector magnitude
      └─────────────────────────────── graph

polar(g, length, angleDeg, fromPoint)
      │    │        │         └── start point expression
      │    │        └──────────── angle in degrees
      │    └───────────────────── vector magnitude
      └────────────────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

A = polar(g, 5, 0)
B = polar(g, 3, 90)
C = polar(g, 4, 45)
D = polar(g, 5, 30, 2, 2)

P = point(g, 1, 1)
E = polar(g, 3, 60, P)
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = polar(g, 5, 0)` | Horizontal vector, length 5, from origin to (5,0) |
| `B = polar(g, 3, 90)` | Vertical vector, length 3, from origin to (0,3) |
| `C = polar(g, 4, 45)` | Diagonal vector at 45 degrees |
| `D = polar(g, 5, 30, 2, 2)` | Vector starting at (2,2) at 30 degrees |
| `E = polar(g, 3, 60, P)` | Vector starting at point P at 60 degrees |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
