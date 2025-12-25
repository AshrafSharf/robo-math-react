# tangent

Creates a tangent line to a circle or plot, centered at the touch point.

## Visual (Circle)

```
           tangent line
         .-─────*─────.
       /       │       \
      │        │ radius  │
      │    *───┘         │  ← angle from center
      │  center          │
       \                /
         '─────────────'
```

## Visual (Plot)

```
       tangent line
          ╲
           ╲
            *  ← touch point at x
           ╱
      ────*────  ← curve y = f(x)
```

## API

```
tangent(g, circle, angle, length)
        │    │       │      └── length of tangent line
        │    │       └───────── angle in degrees (0° = right, CCW)
        │    └───────────────── circle reference
        └────────────────────── graph

tangent(g, plot, x, length)
        │   │    │    └── length of tangent line
        │   │    └─────── x value where tangent touches curve
        │   └──────────── plot reference
        └──────────────── graph
```

## Code

```
g = g2d(0, 0, 20, 20)

# Circle tangent
c = circle(g, 4, 0, 0)
t1 = tangent(g, c, 45, 8)

# Animated circle tangent
ang = 30
t2 = tangent(g, c, ang, 10)
change(ang, 180)

# Plot tangent
p = plot(g, "x^2")
t3 = tangent(g, p, 1, 4)

# Animated plot tangent
xval = -2
t4 = tangent(g, p, xval, 5)
change(xval, 2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `c = circle(g, 4, 0, 0)` | Circle with radius 4 at origin |
| `t1 = tangent(g, c, 45, 8)` | Tangent at 45° with length 8 |
| `ang = 30` | Variable for animating angle |
| `t2 = tangent(g, c, ang, 10)` | Tangent using variable angle |
| `change(ang, 180)` | Animate angle from 30° to 180° |
| `p = plot(g, "x^2")` | Parabola y = x² |
| `t3 = tangent(g, p, 1, 4)` | Tangent at x=1, slope=2 |
| `xval = -2` | Variable for animating x position |
| `t4 = tangent(g, p, xval, 5)` | Tangent using variable x |
| `change(xval, 2)` | Animate x from -2 to 2 |

## Animation

The tangent line draws progressively from start to end.
When using variables with `change()`, the tangent smoothly follows the shape.
