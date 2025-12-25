# angle

Creates 2D angle arcs and right-angle markers between rays or lines.

## Visual

```
              pt2
             /
            /  arc
           / __)
          v--------pt1

v = vertex (center point)
pt1, pt2 = points defining the two rays
arc = angle arc between rays
```

When two lines cross, four angles are formed:

```
        pt2
         \  angle2 (exterior-first)
          \ |
   angle5  \|  angle (interior)
   --------v--------
   angle3  /|  angle4 (reflex)
          / |
         /
        pt1

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
g1 = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

// Create three points forming an angle
o1 = point(g1, 0, 0)
pt1 = point(g1, 3, 0)
pt2 = point(g1, 2, 2)

// Interior angle arc (smaller angle)
arc1 = angle(g1, o1, pt1, pt2)

// Interior angle with custom radius
arc2 = angle(g1, o1, pt1, pt2, 1.2)

// Exterior angle at first ray (supplement)
pt3 = point(g1, 3, 1)
pt4 = point(g1, 1, 3)
ext1 = angle2(g1, o1, pt3, pt4)

// Exterior angle at second ray
ext2 = angle3(g1, o1, pt3, pt4)

// Reflex angle (going the long way around)
reflex = angle4(g1, o1, pt1, pt2)

// Opposite/vertical angle (when lines cross)
l1 = line(g1, -3, -2, 3, 2)
l2 = line(g1, -3, 2, 3, -2)
interior = angle(g1, l1, l2)
opposite = angle5(g1, l1, l2)

// Right angle marker (90-degree square)
p1 = point(g1, 0, 0)
q1 = point(g1, 2, 0)
r1 = point(g1, 0, 2)
right1 = rightangle(g1, p1, q1, r1)

// Right angle with custom size
right2 = rightangle(g1, p1, q1, r1, 0.6)

// Right angle between perpendicular lines
h1 = hline(g1, 0)
v1 = vline(g1, 0)
rightln = rightangle(g1, h1, v1, 0.4)
```

## Comments

| Line | Explanation |
|------|-------------|
| `angle(g1, o1, pt1, pt2)` | Interior angle arc at vertex o1, between rays o1-pt1 and o1-pt2 |
| `angle(g1, o1, pt1, pt2, 1.2)` | Same angle with radius 1.2 (default is 0.8) |
| `angle2(g1, o1, pt3, pt4)` | Exterior angle at first ray o1-pt3 |
| `angle3(g1, o1, pt3, pt4)` | Exterior angle at second ray o1-pt4 |
| `angle4(g1, o1, pt1, pt2)` | Reflex angle (the larger angle, >180 degrees) |
| `angle(g1, l1, l2)` | Interior angle between two intersecting lines |
| `angle5(g1, l1, l2)` | Vertical/opposite angle (across from interior) |
| `rightangle(g1, p1, q1, r1)` | Right angle (90-degree) square marker |
| `rightangle(g1, h1, v1, 0.4)` | Right angle from two perpendicular lines |

## Animation

All angle expressions animate by growing the arc from zero radius to target radius.

- Default duration: 1.5s with power2.out easing
- Arc animates smoothly from center outward

## Dynamic Animation with change()

Use `change()` to animate angle points dynamically. The angle arc updates automatically as points move.

```
g1 = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

// Fixed vertex and first point
o1 = point(g1, 0, 0)
pt1 = point(g1, 3, 0)

// Moving point - angle will grow as pt2 rotates
pt2 = point(g1, 3, 0)
arc1 = angle(g1, o1, pt1, pt2)

// Animate pt2 to create a growing angle
change(pt2, point(g1, 0, 3))
```

### Animating angle between rotating lines

```
g1 = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

// Fixed horizontal line
l1 = line(g1, -3, 0, 3, 0)

// Rotating line endpoint
endy = 0
l2 = line(g1, 0, 0, 3, endy)

// Angle between the lines
arc1 = angle(g1, l1, l2)

// Rotate l2 upward - angle grows from 0 to ~53 degrees
change(endy, 4)
```

### Sweeping through all four angle types

```
g1 = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)

o1 = point(g1, 0, 0)
pt1 = point(g1, 3, 0)
pt2 = point(g1, 2, 2)

// Show all four angles at intersection
interior = angle(g1, o1, pt1, pt2)
ext1 = angle2(g1, o1, pt1, pt2)
ext2 = angle3(g1, o1, pt1, pt2)
reflex = angle4(g1, o1, pt1, pt2)

// Animate pt2 around - all angles update together
change(pt2, point(g1, -2, 2))
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
