# Scale

Scale shapes by a factor around a center point. Creates new shapes with scaled coordinates.

## Syntax

```
scale(g, shape, factor)                      // Scale around origin
scale(g, shape, factor, cx, cy)              // Scale around point (cx, cy)
scale(g, shape, factor, centerPoint)         // Scale around a point expression
scale(g, s1, s2, ..., factor)                // Scale multiple shapes
scale(g, s1, s2, ..., factor, centerPoint)   // Scale multiple shapes around point
```

## Parameters

- `g`: Graph container
- `shape`: Shape to scale (point, line, circle, polygon, triangle)
- `factor`: Scale factor (>1 enlarges, <1 shrinks, negative mirrors)
- `cx, cy` or `centerPoint`: Optional center of scaling (default: origin)

## Supported Shapes

| Shape Type | Description |
|------------|-------------|
| `point` | Scales distance from center |
| `line` | Scales both endpoints from center |
| `circle` | Scales center position and radius |
| `polygon` | Scales all vertices from center |
| `sss`, `sas`, `asa`, `aas` | Scales triangle vertices |

## Code

```
G = g2d(0, 0, 20, 20, -10, 10, -10, 10, 1)

// Basic scaling around origin
P = point(G, 2, 1)
P2 = scale(G, P, 2)                // Point at (4, 2)

// Scale around a center point
L = line(G, 1, 0, 3, 0)
L2 = scale(G, L, 1.5, 2, 0)        // Scale around (2, 0)

// Scale a circle (both center and radius scale)
C = circle(G, 2, 0, 1)
C2 = scale(G, C, 2)                // Radius becomes 2

// Scale around a point expression
center = point(G, 0, 0)
C3 = scale(G, C, 0.5, center)      // Shrink by half

// Scale a polygon
P = polygon(G, 0, 0, 2, 0, 2, 1, 0, 1)
P2 = scale(G, P, 2)                // Double size

// Scale triangles
T1 = sss(G, 3, 4, 5)
T2 = scale(G, T1, 1.5)             // Enlarge by 50%

T3 = sas(G, 3, 60, 3)
T4 = scale(G, T3, 0.5, 1, 1)       // Shrink around (1, 1)

// Scale multiple shapes at once
A = point(G, 1, 1)
B = point(G, 2, 2)
L = line(G, A, B)
result = scale(G, A, B, L, 2, 0, 0)

// Access scaled shapes from collection
first = item(result, 0)
second = item(result, 1)
```

## Comments

| Expression | Explanation |
|------------|-------------|
| `scale(G, P, 2)` | Double distance from origin |
| `scale(G, L, 1.5, 2, 0)` | Scale line 1.5x around (2, 0) |
| `scale(G, C, 0.5)` | Shrink circle to half size |
| `scale(G, T, 2)` | Double triangle size |
| `scale(G, P, -1)` | Mirror through origin |
| `item(result, 0)` | Get first scaled shape |

## Scale Factors

| Factor | Effect |
|--------|--------|
| `> 1` | Enlarges the shape |
| `= 1` | No change |
| `0 < f < 1` | Shrinks the shape |
| `= 0` | Collapses to center point |
| `< 0` | Mirrors and scales |

## Triangle Scaling Examples

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create and scale different triangle types
T1 = sss(G, 3, 4, 5)
S1 = scale(G, T1, 2)               // Double size

T2 = sas(G, 4, 90, 3)
S2 = scale(G, T2, 0.5)             // Half size

T3 = asa(G, 60, 5, 60)
S3 = scale(G, T3, 1.5, 2, 2)       // Scale around (2, 2)

T4 = aas(G, 30, 60, 4)
centroid = point(G, 1, 1)
S4 = scale(G, T4, 0.75, centroid)  // Scale around centroid

// Style the scaled triangle edges
stroke(item(S1, 0), "red")
stroke(item(S1, 1), "green")
stroke(item(S1, 2), "blue")
```

## Creating Similar Triangles

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create nested similar triangles
T = sss(G, 4, 4, 4)                // Equilateral triangle
T2 = scale(G, T, 0.75)             // 75% size
T3 = scale(G, T, 0.5)              // 50% size
T4 = scale(G, T, 0.25)             // 25% size

// Color each differently
stroke(T, "blue")
stroke(T2, "green")
stroke(T3, "orange")
stroke(T4, "red")
```

## Combining Transformations

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Scale then translate
T = sss(G, 2, 2, 2)
T2 = scale(G, T, 2)
T3 = translate(G, T2, 5, 0)

// Scale then rotate
P = polygon(G, 0, 0, 2, 0, 2, 1, 0, 1)
P2 = scale(G, P, 1.5)
P3 = rotate(G, P2, 45)
```

## Related Functions

| Function | Description |
|----------|-------------|
| `rotate(g, shape, angle)` | Rotate shape around a point |
| `translate(g, shape, dx, dy)` | Move shape by offset |
| `item(collection, index)` | Access shape from multi-shape result |
