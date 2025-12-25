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
g1 = g2d(0, 0, 20, 20, -10, 10, -10, 10, 1)

// Basic rotation around origin
pt1 = point(g1, 3, 0)
pt2 = rotate(g1, pt1, 90)              // Point at (0, 3)

// Rotation around a center point
l1 = line(g1, 1, 0, 3, 0)
l2 = rotate(g1, l1, 45, 2, 0)          // Rotate around (2, 0)

// Rotation around a point expression
c1 = circle(g1, 2, 0, 1)
center = point(g1, 0, 0)
c2 = rotate(g1, c1, 60, center)

// Rotate a polygon
poly1 = polygon(g1, 0, 0, 2, 0, 2, 1, 0, 1)
poly2 = rotate(g1, poly1, 45)

// Rotate triangles
tri1 = sss(g1, 3, 4, 5)
tri2 = rotate(g1, tri1, 90)            // Rotate 90 degrees

tri3 = sas(g1, 3, 60, 3)
tri4 = rotate(g1, tri3, 45, 1, 1)      // Rotate around (1, 1)

// Rotate multiple shapes at once
pt3 = point(g1, -4, 2)
pt4 = point(g1, -2, 2)
l3 = line(g1, pt3, pt4)
c3 = circle(g1, -3, 0, 1)
poly3 = polygon(g1, -5, -2, -3, -2, -4, -1)
result = rotate(g1, pt3, pt4, l3, c3, poly3, -120, -3, 1)

// Access rotated shapes from multi-shape result
first = item(result, 0)
second = item(result, 1)
```

## Comments

| Expression | Explanation |
|------------|-------------|
| `rotate(g1, pt1, 90)` | Rotate point 90° counterclockwise around origin |
| `rotate(g1, l1, 45, 2, 0)` | Rotate line 45° around point (2, 0) |
| `rotate(g1, c1, 60, center)` | Rotate circle 60° around point expression |
| `rotate(g1, tri1, 90)` | Rotate triangle 90° around origin |
| `rotate(g1, pt3, pt4, l3, 45)` | Rotate multiple shapes 45° |
| `item(result, 0)` | Get first rotated shape from collection |

## Triangle Rotation Examples

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create and rotate different triangle types
tri1 = sss(g1, 3, 4, 5)
r1 = rotate(g1, tri1, 45)

tri2 = sas(g1, 4, 90, 3)
r2 = rotate(g1, tri2, 180)

tri3 = asa(g1, 60, 5, 60)
r3 = rotate(g1, tri3, -30, 2, 2)

tri4 = aas(g1, 30, 60, 4)
r4 = rotate(g1, tri4, 90, point(g1, 0, 0))

// Style the rotated triangle edges
stroke(item(r1, 0), "red")
stroke(item(r1, 1), "green")
stroke(item(r1, 2), "blue")
```

## Related Functions

| Function | Description |
|----------|-------------|
| `translate(g, shape, dx, dy)` | Move shape by offset |
| `scale(g, shape, factor)` | Scale shape by factor |
| `item(collection, index)` | Access shape from multi-shape result |
