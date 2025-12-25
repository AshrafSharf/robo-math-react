# Translate

Move shapes by a displacement vector (dx, dy). Creates new shapes with translated coordinates.

## Syntax

```
translate(g, shape, dx, dy)                  // Translate single shape
translate(g, s1, s2, ..., dx, dy)            // Translate multiple shapes
```

## Parameters

- `g`: Graph container
- `shape`: Shape to translate (point, line, circle, polygon, triangle, plot)
- `dx`: Displacement in x direction
- `dy`: Displacement in y direction

## Supported Shapes

| Shape Type | Description |
|------------|-------------|
| `point` | Translates point position |
| `line` | Translates both endpoints |
| `circle` | Translates center, radius unchanged |
| `polygon` | Translates all vertices |
| `sss`, `sas`, `asa`, `aas` | Translates triangle vertices |
| `plot` | Translates the entire curve |

## Code

```
g1 = g2d(0, 0, 20, 20, -10, 10, -10, 10, 1)

// Basic translation
pt1 = point(g1, 1, 2)
pt2 = translate(g1, pt1, 3, 4)         // Point at (4, 6)

// Translate a line
l1 = line(g1, 0, 0, 2, 1)
l2 = translate(g1, l1, 5, 0)           // Move right by 5

// Translate a circle
c1 = circle(g1, 2, 2, 1)
c2 = translate(g1, c1, -3, 2)          // Move left 3, up 2

// Translate a polygon
poly1 = polygon(g1, 0, 0, 2, 0, 2, 1, 0, 1)
poly2 = translate(g1, poly1, 4, 3)

// Translate triangles
tri1 = sss(g1, 3, 4, 5)
tri2 = translate(g1, tri1, 5, 2)

tri3 = sas(g1, 3, 60, 3)
tri4 = translate(g1, tri3, -2, 4)

// Translate multiple shapes at once
pt3 = point(g1, -1, 4)
l3 = line(g1, pt3, point(g1, 3, 1))
c3 = circle(g1, 2, 6, 1)
result = translate(g1, pt3, l3, c3, 2, 3)

// Access translated shapes
first = item(result, 0)
second = item(result, 1)
third = item(result, 2)
```

## Comments

| Expression | Explanation |
|------------|-------------|
| `translate(g1, pt1, 3, 4)` | Move point by (3, 4) |
| `translate(g1, l1, 5, 0)` | Move line right by 5 units |
| `translate(g1, c1, -3, 2)` | Move circle left 3, up 2 |
| `translate(g1, tri1, 5, 2)` | Move triangle by (5, 2) |
| `translate(g1, pt3, l3, c3, 2, 3)` | Move multiple shapes by (2, 3) |
| `item(result, 0)` | Get first translated shape |

## Triangle Translation Examples

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create triangles at origin and translate them
tri1 = sss(g1, 3, 4, 5)
tri1_moved = translate(g1, tri1, 5, 0)

tri2 = sas(g1, 4, 90, 3)
tri2_moved = translate(g1, tri2, -5, 3)

tri3 = asa(g1, 60, 5, 60)
tri3_moved = translate(g1, tri3, 0, -4)

tri4 = aas(g1, 30, 60, 4)
tri4_moved = translate(g1, tri4, 3, 3)

// Style individual edges of translated triangle
stroke(item(tri1_moved, 0), "red")
stroke(item(tri1_moved, 1), "green")
stroke(item(tri1_moved, 2), "blue")

// Hide an edge
hide(item(tri2_moved, 0))
```

## Creating Patterns with Translation

```
g1 = g2d(0, 0, 20, 10, -10, 10, -5, 5, 1)

// Create a row of triangles
tri1 = sss(g1, 2, 2, 2)
tri2 = translate(g1, tri1, 3, 0)
tri3 = translate(g1, tri1, 6, 0)
tri4 = translate(g1, tri1, 9, 0)

// Create a grid of squares
poly1 = polygon(g1, 0, 0, 1, 0, 1, 1, 0, 1)
poly2 = translate(g1, poly1, 2, 0)
poly3 = translate(g1, poly1, 0, 2)
poly4 = translate(g1, poly1, 2, 2)
```

## Related Functions

| Function | Description |
|----------|-------------|
| `rotate(g, shape, angle)` | Rotate shape around a point |
| `scale(g, shape, factor)` | Scale shape by factor |
| `item(collection, index)` | Access shape from multi-shape result |
