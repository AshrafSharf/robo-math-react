# angle3d

Creates 3D angle arcs, sectors, and right-angle markers. Also calculates angles between planes and lines.

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

## Expressions

| Expression | Type | Description |
|------------|------|-------------|
| `angle3d` | Interior | Smaller angle arc (<180 degrees) |
| `angle3d2` | Reflex | Larger angle arc (>180 degrees) |
| `sector3d` | Sector | Filled pie-slice shape |
| `rightangle3d` | Right | 90-degree square marker |

## API

```
// Interior angle arc (smaller angle)
angle3d(g, vertex, point1, point2)
        |    |       |       +-- point3d defining second ray
        |    |       +---------- point3d defining first ray
        |    +------------------ vertex point3d (angle center)
        +----------------------- 3D graph

angle3d(g, vertex, point1, point2, radius)
                                     +-- arc radius (default: auto)

angle3d(g, vector1, vector2)
        |    |        +-- second vector3d
        |    +----------- first vector3d (shared start = vertex)
        +---------------- 3D graph

// NEW: Angle between two planes (returns degrees)
angle3d(g, plane1, plane2)
        |    |       +-- second plane3d
        |    +---------- first plane3d
        +--------------- 3D graph

// NEW: Angle between line and plane (returns degrees)
angle3d(g, line, plane)
        |    |     +-- plane3d
        |    +-------- line3d or vector3d
        +------------- 3D graph

// Reflex angle arc (larger angle, >180 degrees)
angle3d2(g, vertex, point1, point2)
angle3d2(g, vertex, point1, point2, radius)
angle3d2(g, vector1, vector2)

// Filled angle sector (pie slice)
sector3d(g, vertex, point1, point2)
         |    |       |       +-- point3d defining second ray
         |    |       +---------- point3d defining first ray
         |    +------------------ vertex point3d
         +----------------------- 3D graph

sector3d(g, vertex, point1, point2, radius)
                                      +-- sector radius (default: 1.0)

// Right angle marker (90-degree square)
rightangle3d(g, vertex, point1, point2)
             |    |       |       +-- point3d on second ray
             |    |       +---------- point3d on first ray
             |    +------------------ vertex point3d
             +----------------------- 3D graph

rightangle3d(g, vertex, point1, point2, size)
                                          +-- marker size (default: 0.4)
```

## Auto Right-Angle Detection

When using `angle3d`, if the angle is exactly or nearly 90 degrees (within 0.5 degree tolerance), it automatically renders as a right-angle square marker instead of an arc.

## Code

```
g = g3d(5, 5, 25, 25)

// Create three points forming an angle
O = point3d(g, 0, 0, 0)
A = point3d(g, 3, 0, 0)
B = point3d(g, 0, 3, 0)

// Interior angle arc (smaller angle)
arc1 = angle3d(g, O, A, B)

// Interior angle with custom radius
arc2 = angle3d(g, O, A, B, 1.2)

// Reflex angle (larger angle, going the long way)
C = point3d(g, 2, 0, 0)
D = point3d(g, 0, 0, 2)
reflex = angle3d2(g, O, C, D)

// Filled sector (pie slice)
E = point3d(g, 4, 0, 0)
F = point3d(g, 2, 3, 0)
pie = sector3d(g, O, E, F)

// Sector with custom radius
pie2 = sector3d(g, O, E, F, 2.0)

// Right angle marker (90-degree square)
P = point3d(g, 0, 0, 0)
Q = point3d(g, 2, 0, 0)
R = point3d(g, 0, 2, 0)
right = rightangle3d(g, P, Q, R)

// Right angle with custom size
right2 = rightangle3d(g, P, Q, R, 0.6)

// Using vectors (shared start point = vertex)
V1 = vector3d(g, 0, 0, 0, 3, 0, 0)
V2 = vector3d(g, 0, 0, 0, 0, 3, 0)
arcFromVectors = angle3d(g, V1, V2)

// NEW: Angle between two planes
Plane1 = plane3d(g, 1, 0, 0, 0)  // YZ plane (normal along X)
Plane2 = plane3d(g, 0, 1, 0, 0)  // XZ plane (normal along Y)
planeAngle = angle3d(g, Plane1, Plane2)  // Returns 90 degrees

// NEW: Angle between line and plane
Line = line3d(g, 0, 0, 0, 1, 1, 1)  // Diagonal line
Plane = plane3d(g, 0, 0, 1, 0)      // XY plane (z = 0)
linePlaneAngle = angle3d(g, Line, Plane)  // Returns ~35.26 degrees
```

## Dynamic Examples with Change

### Auto Right-Angle Detection with Animation
```
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Fixed vertex at origin
V = point3d(G, 0, 0, 0)

// Fixed point along X axis
P1 = point3d(G, 3, 0, 0)

// Movable point - starts at 45 degrees
P2 = point3d(G, 2, 2, 0)

// Draw the angle - will show arc (45 degrees)
A = angle3d(G, V, P1, P2)

// Animate P2 to create 90 degree angle
// Angle will automatically switch to square marker
change(P2, point3d(G, 0, 3, 0))

// Animate P2 to 60 degrees - switches back to arc
change(P2, point3d(G, 1.5, 2.6, 0))

// Animate back to exactly 90 degrees - square marker again
change(P2, point3d(G, 0, 3, 0))
```

### Using Vectors with Animation
```
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Two vectors from origin
V1 = vector3d(G, 0, 0, 0, 3, 0, 0)  // Along X axis
V2 = vector3d(G, 0, 0, 0, 2, 2, 0)  // 45 degrees in XY plane

// Angle between vectors - shows arc
A = angle3d(G, V1, V2)

// Change V2 to be along Y axis (90 degrees)
// Automatically shows square marker
change(V2, vector3d(G, 0, 0, 0, 0, 3, 0))

// Change V2 to 30 degrees - shows arc
change(V2, vector3d(G, 0, 0, 0, 2.6, 1.5, 0))

// Change to 90 degrees along Z axis - square marker
change(V2, vector3d(G, 0, 0, 0, 0, 0, 3))
```

### Angle Between Planes with Animation
```
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Fixed plane (XY plane, normal along Z)
Plane1 = plane3d(G, 0, 0, 1, 0)

// Rotating plane (starts perpendicular)
Plane2 = plane3d(G, 1, 0, 0, 0)

// Calculate angle between planes
theta = angle3d(G, Plane1, Plane2)  // 90 degrees

// Display the angle value
label(G, theta, 0, 1)

// Rotate the second plane
change(Plane2, plane3d(G, 1, 1, 0, 0))  // 45 degree normal
theta2 = angle3d(G, Plane1, Plane2)     // ~54.7 degrees
label(G, theta2, 0, 2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `angle3d(g, O, A, B)` | Interior angle arc at vertex O, between rays OA and OB |
| `angle3d(g, O, A, B, 1.2)` | Same angle with radius 1.2 (default is auto-computed) |
| `angle3d2(g, O, C, D)` | Reflex angle (the larger angle, >180 degrees) |
| `sector3d(g, O, E, F)` | Filled pie-slice sector at O between OE and OF |
| `sector3d(g, O, E, F, 2.0)` | Sector with radius 2.0 (default is 1.0) |
| `rightangle3d(g, P, Q, R)` | Right angle (90-degree) square marker |
| `rightangle3d(g, P, Q, R, 0.6)` | Right angle with size 0.6 (default is 0.4) |
| `angle3d(g, V1, V2)` | Angle between two vectors sharing origin |
| `angle3d(g, Plane1, Plane2)` | Angle between two planes (returns degrees, no visual) |
| `angle3d(g, Line, Plane)` | Angle between line and plane (returns degrees, no visual) |

## Formulas

| Type | Formula |
|------|---------|
| Between vectors | `theta = arccos(v1 . v2 / (||v1|| * ||v2||))` |
| Between planes | `theta = arccos(|n1 . n2| / (||n1|| * ||n2||))` |
| Line to plane | `theta = arcsin(|b . n| / (||b|| * ||n||))` |

## Notes

- Angle values are returned in **degrees**
- When angle is within 0.5 degrees of 90, automatically renders as square marker
- For plane-plane and line-plane, no visual arc is created (value only)
- The `change` expression works with all angle inputs for dynamic animations

## Animation

Each expression type has its own animation behavior:

- **angle3d / angle3d2**: Arc grows from zero radius to target radius (1.5s, power2.out easing)
- **sector3d**: Scales from center with fade-in (1.5s, power2.out easing)
- **rightangle3d**: Scales from center with bounce effect (1.0s, back.out easing)

## Style Options

| Option | Default | Description |
|--------|---------|-------------|
| color | 0x00ff00 | Arc/sector color (green for arcs, blue for sectors) |
| opacity | 0.5 | Transparency for sectors (0-1) |
| tubeRadius | 0.04 | Thickness of arc tube |
| segments | 32 | Arc smoothness |
| filled | true | Fill the right angle marker |
| fillOpacity | 0.3 | Right angle fill transparency |
