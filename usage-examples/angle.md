# angle

Creates 2D angle arcs and right-angle markers between rays or lines.

## Visual

```
              P2
             /
            /  arc
           / __)
          V--------P1

V = vertex (center point)
P1, P2 = points defining the two rays
arc = angle arc between rays
```

When two lines cross, four angles are formed:

```
        P2
         \  angle2 (exterior-first)
          \ |
   angle5  \|  angle (interior)
   --------V--------
   angle3  /|  angle4 (reflex)
          / |
         /
        P1

angle  = interior (smaller angle between rays)
angle2 = exterior-first (supplement at first ray)
angle3 = exterior-second (supplement at second ray)
angle4 = reflex (>180 degrees, going the long way)
angle5 = opposite/vertical (angle across from interior)
```

## Expressions

| Expression | Type | Description |
|------------|------|-------------|
| `angle` | Interior | Smaller angle arc (<180 degrees) |
| `angle2` | Exterior-first | Exterior angle measured from first ray |
| `angle3` | Exterior-second | Exterior angle measured from second ray |
| `angle4` | Reflex | Larger angle arc (>180 degrees) |
| `angle5` | Opposite | Vertical/opposite angle when lines cross |
| `rightangle` | Right | 90-degree square marker |

## API

```
// Interior angle arc (smaller angle)
angle(g, vertex, point1, point2)
      |    |       |       +-- point defining second ray
      |    |       +---------- point defining first ray
      |    +------------------ vertex point (angle center)
      +----------------------- 2D graph

angle(g, vertex, point1, point2, radius)
                                   +-- arc radius (default: 0.8)

// Using two lines (computes intersection as vertex)
angle(g, line1, line2)
      |    |      +-- second line
      |    +--------- first line
      +-------------- 2D graph

angle(g, line1, line2, radius)
                          +-- arc radius (default: 0.8)

// Exterior angle at first ray
angle2(g, vertex, point1, point2)
angle2(g, vertex, point1, point2, radius)
angle2(g, line1, line2)
angle2(g, line1, line2, radius)

// Exterior angle at second ray
angle3(g, vertex, point1, point2)
angle3(g, vertex, point1, point2, radius)
angle3(g, line1, line2)
angle3(g, line1, line2, radius)

// Reflex angle (>180 degrees)
angle4(g, vertex, point1, point2)
angle4(g, vertex, point1, point2, radius)
angle4(g, line1, line2)
angle4(g, line1, line2, radius)

// Opposite/vertical angle
angle5(g, vertex, point1, point2)
angle5(g, vertex, point1, point2, radius)
angle5(g, line1, line2)
angle5(g, line1, line2, radius)

// Right angle marker (90-degree square)
rightangle(g, vertex, point1, point2)
           |    |       |       +-- point on second ray
           |    |       +---------- point on first ray
           |    +------------------ vertex point
           +----------------------- 2D graph

rightangle(g, vertex, point1, point2, size)
                                        +-- marker size (default: 0.5)
```

## Code

```
g = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

// Create three points forming an angle
O = point(g, 0, 0)
A = point(g, 3, 0)
B = point(g, 2, 2)

// Interior angle arc (smaller angle)
arc1 = angle(g, O, A, B)

// Interior angle with custom radius
arc2 = angle(g, O, A, B, 1.2)

// Exterior angle at first ray (supplement)
C = point(g, 3, 1)
D = point(g, 1, 3)
ext1 = angle2(g, O, C, D)

// Exterior angle at second ray
ext2 = angle3(g, O, C, D)

// Reflex angle (going the long way around)
reflex = angle4(g, O, A, B)

// Opposite/vertical angle (when lines cross)
L1 = line(g, -3, -2, 3, 2)
L2 = line(g, -3, 2, 3, -2)
interior = angle(g, L1, L2)
opposite = angle5(g, L1, L2)

// Right angle marker (90-degree square)
P = point(g, 0, 0)
Q = point(g, 2, 0)
R = point(g, 0, 2)
right = rightangle(g, P, Q, R)

// Right angle with custom size
right2 = rightangle(g, P, Q, R, 0.6)

// Right angle between perpendicular lines
H = hline(g, 0)
V = vline(g, 0)
rightLn = rightangle(g, H, V, 0.4)
```

## Comments

| Line | Explanation |
|------|-------------|
| `angle(g, O, A, B)` | Interior angle arc at vertex O, between rays OA and OB |
| `angle(g, O, A, B, 1.2)` | Same angle with radius 1.2 (default is 0.8) |
| `angle2(g, O, C, D)` | Exterior angle at first ray OC |
| `angle3(g, O, C, D)` | Exterior angle at second ray OD |
| `angle4(g, O, A, B)` | Reflex angle (the larger angle, >180 degrees) |
| `angle(g, L1, L2)` | Interior angle between two intersecting lines |
| `angle5(g, L1, L2)` | Vertical/opposite angle (across from interior) |
| `rightangle(g, P, Q, R)` | Right angle (90-degree) square marker |
| `rightangle(g, H, V, 0.4)` | Right angle from two perpendicular lines |

## Animation

All angle expressions animate by growing the arc from zero radius to target radius.

- Default duration: 1.5s with power2.out easing
- Arc animates smoothly from center outward

## Dynamic Animation with change()

Use `change()` to animate angle points dynamically. The angle arc updates automatically as points move.

```
g = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

// Fixed vertex and first point
O = point(g, 0, 0)
A = point(g, 3, 0)

// Moving point - angle will grow as B rotates
B = point(g, 3, 0)
arc = angle(g, O, A, B)

// Animate B to create a growing angle
change(B, point(g, 0, 3))
```

### Animating angle between rotating lines

```
g = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

// Fixed horizontal line
L1 = line(g, -3, 0, 3, 0)

// Rotating line endpoint
endY = 0
L2 = line(g, 0, 0, 3, endY)

// Angle between the lines
arc = angle(g, L1, L2)

// Rotate L2 upward - angle grows from 0 to ~53 degrees
change(endY, 4)
```

### Sweeping through all four angle types

```
g = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

O = point(g, 0, 0)
A = point(g, 3, 0)
B = point(g, 2, 2)

// Show all four angles at intersection
interior = angle(g, O, A, B)
ext1 = angle2(g, O, A, B)
ext2 = angle3(g, O, A, B)
reflex = angle4(g, O, A, B)

// Animate B around - all angles update together
change(B, point(g, -2, 2))
```

## Defaults

| Expression | Default Radius/Size |
|------------|---------------------|
| `angle` | 0.8 |
| `angle2` | 0.8 |
| `angle3` | 0.8 |
| `angle4` | 0.8 |
| `angle5` | 0.8 |
| `rightangle` | 0.5 |
