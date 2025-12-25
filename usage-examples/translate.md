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
G = g2d(0, 0, 20, 20, -10, 10, -10, 10, 1)

// Basic translation
P = point(G, 1, 2)
P2 = translate(G, P, 3, 4)         // Point at (4, 6)

// Translate a line
L = line(G, 0, 0, 2, 1)
L2 = translate(G, L, 5, 0)         // Move right by 5

// Translate a circle
C = circle(G, 2, 2, 1)
C2 = translate(G, C, -3, 2)        // Move left 3, up 2

// Translate a polygon
P = polygon(G, 0, 0, 2, 0, 2, 1, 0, 1)
P2 = translate(G, P, 4, 3)

// Translate triangles
T1 = sss(G, 3, 4, 5)
T2 = translate(G, T1, 5, 2)

T3 = sas(G, 3, 60, 3)
T4 = translate(G, T3, -2, 4)

// Translate multiple shapes at once
A = point(G, -1, 4)
L = line(G, A, point(G, 3, 1))
C = circle(G, 2, 6, 1)
result = translate(G, A, L, C, 2, 3)

// Access translated shapes
first = item(result, 0)
second = item(result, 1)
third = item(result, 2)
```

## Comments

| Expression | Explanation |
|------------|-------------|
| `translate(G, P, 3, 4)` | Move point by (3, 4) |
| `translate(G, L, 5, 0)` | Move line right by 5 units |
| `translate(G, C, -3, 2)` | Move circle left 3, up 2 |
| `translate(G, T, 5, 2)` | Move triangle by (5, 2) |
| `translate(G, A, L, C, 2, 3)` | Move multiple shapes by (2, 3) |
| `item(result, 0)` | Get first translated shape |

## Triangle Translation Examples

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create triangles at origin and translate them
T1 = sss(G, 3, 4, 5)
T1_moved = translate(G, T1, 5, 0)

T2 = sas(G, 4, 90, 3)
T2_moved = translate(G, T2, -5, 3)

T3 = asa(G, 60, 5, 60)
T3_moved = translate(G, T3, 0, -4)

T4 = aas(G, 30, 60, 4)
T4_moved = translate(G, T4, 3, 3)

// Style individual edges of translated triangle
stroke(item(T1_moved, 0), "red")
stroke(item(T1_moved, 1), "green")
stroke(item(T1_moved, 2), "blue")

// Hide an edge
hide(item(T2_moved, 0))
```

## Creating Patterns with Translation

```
G = g2d(0, 0, 20, 10, -10, 10, -5, 5, 1)

// Create a row of triangles
T = sss(G, 2, 2, 2)
T1 = translate(G, T, 3, 0)
T2 = translate(G, T, 6, 0)
T3 = translate(G, T, 9, 0)

// Create a grid of squares
P = polygon(G, 0, 0, 1, 0, 1, 1, 0, 1)
P1 = translate(G, P, 2, 0)
P2 = translate(G, P, 0, 2)
P3 = translate(G, P, 2, 2)
```

## Related Functions

| Function | Description |
|----------|-------------|
| `rotate(g, shape, angle)` | Rotate shape around a point |
| `scale(g, shape, factor)` | Scale shape by factor |
| `item(collection, index)` | Access shape from multi-shape result |
