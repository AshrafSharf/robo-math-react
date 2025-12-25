# Rotate

Rotate shapes around a center point. Creates new shapes with rotated coordinates.

## Syntax

```
rotate(g, shape, angle)                      // Rotate around origin
rotate(g, shape, angle, cx, cy)              // Rotate around point (cx, cy)
rotate(g, shape, angle, centerPoint)         // Rotate around a point expression
rotate(g, s1, s2, ..., angle)                // Rotate multiple shapes
rotate(g, s1, s2, ..., angle, centerPoint)   // Rotate multiple shapes around point
```

## Parameters

- `g`: Graph container
- `shape`: Shape to rotate (point, line, circle, polygon, triangle)
- `angle`: Rotation angle in degrees (positive = counterclockwise)
- `cx, cy` or `centerPoint`: Optional center of rotation (default: origin)

## Supported Shapes

| Shape Type | Description |
|------------|-------------|
| `point` | Rotates point position |
| `line` | Rotates both endpoints |
| `circle` | Rotates center, radius unchanged |
| `polygon` | Rotates all vertices |
| `sss`, `sas`, `asa`, `aas` | Rotates triangle vertices |

## Code

```
G = g2d(0, 0, 20, 20, -10, 10, -10, 10, 1)

// Basic rotation around origin
P = point(G, 3, 0)
P2 = rotate(G, P, 90)              // Point at (0, 3)

// Rotation around a center point
L = line(G, 1, 0, 3, 0)
L2 = rotate(G, L, 45, 2, 0)        // Rotate around (2, 0)

// Rotation around a point expression
C = circle(G, 2, 0, 1)
center = point(G, 0, 0)
C2 = rotate(G, C, 60, center)

// Rotate a polygon
P = polygon(G, 0, 0, 2, 0, 2, 1, 0, 1)
P2 = rotate(G, P, 45)

// Rotate triangles
T1 = sss(G, 3, 4, 5)
T2 = rotate(G, T1, 90)             // Rotate 90 degrees

T3 = sas(G, 3, 60, 3)
T4 = rotate(G, T3, 45, 1, 1)       // Rotate around (1, 1)

// Rotate multiple shapes at once
A = point(G, -4, 2)
B = point(G, -2, 2)
L = line(G, A, B)
C = circle(G, -3, 0, 1)
T = polygon(G, -5, -2, -3, -2, -4, -1)
result = rotate(G, A, B, L, C, T, -120, -3, 1)

// Access rotated shapes from multi-shape result
first = item(result, 0)
second = item(result, 1)
```

## Comments

| Expression | Explanation |
|------------|-------------|
| `rotate(G, P, 90)` | Rotate point 90° counterclockwise around origin |
| `rotate(G, L, 45, 2, 0)` | Rotate line 45° around point (2, 0) |
| `rotate(G, C, 60, center)` | Rotate circle 60° around point expression |
| `rotate(G, T, 90)` | Rotate triangle 90° around origin |
| `rotate(G, A, B, L, 45)` | Rotate multiple shapes 45° |
| `item(result, 0)` | Get first rotated shape from collection |

## Triangle Rotation Examples

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create and rotate different triangle types
T1 = sss(G, 3, 4, 5)
R1 = rotate(G, T1, 45)

T2 = sas(G, 4, 90, 3)
R2 = rotate(G, T2, 180)

T3 = asa(G, 60, 5, 60)
R3 = rotate(G, T3, -30, 2, 2)

T4 = aas(G, 30, 60, 4)
R4 = rotate(G, T4, 90, point(G, 0, 0))

// Style the rotated triangle edges
stroke(item(R1, 0), "red")
stroke(item(R1, 1), "green")
stroke(item(R1, 2), "blue")
```

## Related Functions

| Function | Description |
|----------|-------------|
| `translate(g, shape, dx, dy)` | Move shape by offset |
| `scale(g, shape, factor)` | Scale shape by factor |
| `item(collection, index)` | Access shape from multi-shape result |
