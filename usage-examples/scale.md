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
g1 = g2d(0, 0, 20, 20, -10, 10, -10, 10, 1)

// Basic scaling around origin
pt1 = point(g1, 2, 1)
pt2 = scale(g1, pt1, 2)                // Point at (4, 2)

// Scale around a center point
l1 = line(g1, 1, 0, 3, 0)
l2 = scale(g1, l1, 1.5, 2, 0)          // Scale around (2, 0)

// Scale a circle (both center and radius scale)
c1 = circle(g1, 2, 0, 1)
c2 = scale(g1, c1, 2)                  // Radius becomes 2

// Scale around a point expression
center = point(g1, 0, 0)
c3 = scale(g1, c1, 0.5, center)        // Shrink by half

// Scale a polygon
poly1 = polygon(g1, 0, 0, 2, 0, 2, 1, 0, 1)
poly2 = scale(g1, poly1, 2)            // Double size

// Scale triangles
tri1 = sss(g1, 3, 4, 5)
tri2 = scale(g1, tri1, 1.5)            // Enlarge by 50%

tri3 = sas(g1, 3, 60, 3)
tri4 = scale(g1, tri3, 0.5, 1, 1)      // Shrink around (1, 1)

// Scale multiple shapes at once
pt3 = point(g1, 1, 1)
pt4 = point(g1, 2, 2)
l3 = line(g1, pt3, pt4)
result = scale(g1, pt3, pt4, l3, 2, 0, 0)

// Access scaled shapes from collection
first = item(result, 0)
second = item(result, 1)
```

## Comments

| Expression | Explanation |
|------------|-------------|
| `scale(g1, pt1, 2)` | Double distance from origin |
| `scale(g1, l1, 1.5, 2, 0)` | Scale line 1.5x around (2, 0) |
| `scale(g1, c1, 0.5)` | Shrink circle to half size |
| `scale(g1, tri1, 2)` | Double triangle size |
| `scale(g1, poly1, -1)` | Mirror through origin |
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
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create and scale different triangle types
tri1 = sss(g1, 3, 4, 5)
s1 = scale(g1, tri1, 2)                // Double size

tri2 = sas(g1, 4, 90, 3)
s2 = scale(g1, tri2, 0.5)              // Half size

tri3 = asa(g1, 60, 5, 60)
s3 = scale(g1, tri3, 1.5, 2, 2)        // Scale around (2, 2)

tri4 = aas(g1, 30, 60, 4)
centroid = point(g1, 1, 1)
s4 = scale(g1, tri4, 0.75, centroid)   // Scale around centroid

// Style the scaled triangle edges
stroke(item(s1, 0), "red")
stroke(item(s1, 1), "green")
stroke(item(s1, 2), "blue")
```

## Creating Similar Triangles

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create nested similar triangles
tri1 = sss(g1, 4, 4, 4)                // Equilateral triangle
tri2 = scale(g1, tri1, 0.75)           // 75% size
tri3 = scale(g1, tri1, 0.5)            // 50% size
tri4 = scale(g1, tri1, 0.25)           // 25% size

// Color each differently
stroke(tri1, "blue")
stroke(tri2, "green")
stroke(tri3, "orange")
stroke(tri4, "red")
```

## Combining Transformations

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Scale then translate
tri1 = sss(g1, 2, 2, 2)
tri2 = scale(g1, tri1, 2)
tri3 = translate(g1, tri2, 5, 0)

// Scale then rotate
poly1 = polygon(g1, 0, 0, 2, 0, 2, 1, 0, 1)
poly2 = scale(g1, poly1, 1.5)
poly3 = rotate(g1, poly2, 45)
```

## Related Functions

| Function | Description |
|----------|-------------|
| `rotate(g, shape, angle)` | Rotate shape around a point |
| `translate(g, shape, dx, dy)` | Move shape by offset |
| `item(collection, index)` | Access shape from multi-shape result |
