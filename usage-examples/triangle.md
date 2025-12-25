# Triangle Construction

Construct triangles using standard geometric criteria: SSS, SAS, ASA, AAS.

## Syntax

```
sss(g, a, b, c)                    // Side-Side-Side: three side lengths
sss(g, a, b, c, basePoint)         // with position
sss(g, a, b, c, basePoint, angle)  // with position and rotation

sas(g, b, angleA, c)               // Side-Angle-Side: two sides and included angle
sas(g, b, angleA, c, basePoint)
sas(g, b, angleA, c, basePoint, angle)

asa(g, angleA, c, angleB)          // Angle-Side-Angle: two angles and included side
asa(g, angleA, c, angleB, basePoint)
asa(g, angleA, c, angleB, basePoint, angle)

aas(g, angleA, angleB, a)          // Angle-Angle-Side: two angles and opposite side
aas(g, angleA, angleB, a, basePoint)
aas(g, angleA, angleB, a, basePoint, angle)
```

## Parameters

### SSS (Side-Side-Side)
- `a`, `b`, `c`: The three side lengths (opposite to vertices A, B, C respectively)
- Side `c` is placed along the x-axis from A to B

### SAS (Side-Angle-Side)
- `b`: Side from A to C (opposite vertex B)
- `angleA`: Angle at vertex A (in degrees)
- `c`: Side from A to B (opposite vertex C)

### ASA (Angle-Side-Angle)
- `angleA`: Angle at vertex A (in degrees)
- `c`: Side from A to B (between the two angles)
- `angleB`: Angle at vertex B (in degrees)

### AAS (Angle-Angle-Side)
- `angleA`: Angle at vertex A (in degrees)
- `angleB`: Angle at vertex B (in degrees)
- `a`: Side opposite to angle A (from B to C)

### Common Optional Parameters
- `basePoint`: Position for vertex A (default: origin)
- `angle`: Rotation in degrees (default: 0)

## Code

```
g1 = g2d(0, 0, 20, 10, -10, 10, -5, 5, 1)

// SSS - Side-Side-Side
tri1 = sss(g1, 3, 4, 5)              // 3-4-5 right triangle at origin
tri2 = sss(g1, 5, 5, 5)              // equilateral triangle (all sides equal)

// SAS - Side-Angle-Side
tri3 = sas(g1, 4, 90, 3)             // right triangle with legs 3 and 4
tri4 = sas(g1, 5, 60, 5)             // isoceles with 60° angle

// ASA - Angle-Side-Angle
tri5 = asa(g1, 60, 5, 60)            // equilateral (60-60-60)
tri6 = asa(g1, 90, 5, 45)            // 90-45-45 triangle

// AAS - Angle-Angle-Side
tri7 = aas(g1, 30, 60, 5)            // 30-60-90 triangle
tri8 = aas(g1, 45, 45, 5)            // isoceles right triangle

// Using distance() for dynamic side lengths
l1 = line(g1, 0, 0, 4, 3)
tri9 = sss(g1, distance(l1), 4, 5)        // side length from line

// Positioning triangles
pt1 = point(g1, 5, 2)
tri10 = sss(g1, 3, 4, 5, pt1)        // triangle at point pt1
tri11 = sss(g1, 3, 4, 5, pt1, 45)    // rotated 45 degrees
```

## Comments

| Line | Explanation |
|------|-------------|
| `sss(g1, 3, 4, 5)` | Creates a 3-4-5 right triangle |
| `sss(g1, 5, 5, 5)` | Equilateral triangle with side 5 |
| `sas(g1, 4, 90, 3)` | Right angle between sides 3 and 4 |
| `asa(g1, 60, 5, 60)` | Two 60° angles make it equilateral |
| `aas(g1, 30, 60, 5)` | 30-60-90 special triangle |
| `distance(l1)` | Use line length as side |
| `sss(g1, 3, 4, 5, pt1)` | Position vertex A at point pt1 |
| `sss(g1, 3, 4, 5, pt1, 45)` | Rotate triangle 45° around A |

## Vertex Layout

All triangle constructors place vertices as follows:
- **Vertex A**: At origin (or basePoint)
- **Vertex B**: Along positive x-axis from A (or rotated by angle)
- **Vertex C**: Above the AB line (counterclockwise orientation)

```
        C
       /\
      /  \
     /    \
    /______\
   A        B
```

## Triangle Inequality

For SSS, the three sides must satisfy the triangle inequality:
- `a + b > c`
- `a + c > b`
- `b + c > a`

If violated, an error is thrown.

## Angle Constraints

For ASA and AAS:
- Each angle must be positive
- Sum of the two given angles must be less than 180°
- `angleA + angleB < 180`

## Edge Access

Triangles support edge access via `item()`. Each triangle has 3 edges (0, 1, 2):

```
        C
       /\
      /  \
  e1 /    \ e2
    /      \
   /________\
  A    e0    B

Edge 0: A → B
Edge 1: B → C
Edge 2: C → A
```

### Accessing Individual Edges

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

tri1 = sss(g1, 3, 4, 5)

// Get individual edges
edge0 = item(tri1, 0)    // Edge from A to B
edge1 = item(tri1, 1)    // Edge from B to C
edge2 = item(tri1, 2)    // Edge from C to A
```

### Styling Individual Edges

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

tri1 = sas(g1, 4, 90, 3)

// Color each edge differently
stroke(item(tri1, 0), "red")
stroke(item(tri1, 1), "green")
stroke(item(tri1, 2), "blue")
```

### Hiding Edges

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

tri1 = asa(g1, 60, 5, 60)

// Hide the base edge
hide(item(tri1, 0))

// Show only two sides
hide(item(tri1, 2))
```

### Using Edge Data

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

tri1 = sss(g1, 3, 4, 5)

// Get edge endpoints
edge = item(tri1, 0)
pt1 = start(edge)       // Start point of edge
pt2 = end(edge)         // End point of edge

// Create a parallel line from edge
l1 = pll(g1, item(tri1, 1), 2)
```

## Related Functions

| Function | Description |
|----------|-------------|
| `polygon(g, pt1, pt2, pt3)` | Triangle from 3 points |
| `distance(shape)` | Get length of line/vector |
| `start(shape)` | Get start point of edge/shape |
| `end(shape)` | Get end point of edge/shape |
| `pointatratio(g, tri, r)` | Point along triangle perimeter |
| `item(tri, index)` | Get edge at index (0, 1, or 2) |
| `hide(item(tri, n))` | Hide specific edge |
| `stroke(item(tri, n), color)` | Color specific edge |
