# Polygon

Create closed polygons from points or coordinates.

## Syntax

```
polygon(g, point1, point2, point3, ...)           // From point references
polygon(g, x1, y1, x2, y2, x3, y3, ...)           // From coordinates
```

## Parameters

- `g`: Graph container
- Points or coordinates: At least 3 points (6 coordinate values) required
- The polygon is auto-closed if the first and last points differ

## Code

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Triangle from coordinates
poly1 = polygon(g1, 0, 0, 4, 0, 2, 3)

// Quadrilateral from coordinates
poly2 = polygon(g1, 0, 0, 4, 0, 4, 3, 0, 3)

// Pentagon from points
pt1 = point(g1, 0, 0)
pt2 = point(g1, 3, 0)
pt3 = point(g1, 4, 2)
pt4 = point(g1, 1.5, 4)
pt5 = point(g1, -1, 2)
poly3 = polygon(g1, pt1, pt2, pt3, pt4, pt5)

// Styling
stroke(poly1, "blue")
fill(poly2, "lightblue")
strokewidth(poly3, 2)
```

## Edge Access

Polygons support edge access via `item()`. Edges are 0-indexed.

### Accessing Individual Edges

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create a quadrilateral
poly1 = polygon(g1, 0, 0, 4, 0, 4, 3, 0, 3)

// Access edges (4 edges for a quadrilateral)
edge0 = item(poly1, 0)    // Bottom edge (0,0) to (4,0)
edge1 = item(poly1, 1)    // Right edge (4,0) to (4,3)
edge2 = item(poly1, 2)    // Top edge (4,3) to (0,3)
edge3 = item(poly1, 3)    // Left edge (0,3) to (0,0)
```

### Styling Individual Edges

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

poly1 = polygon(g1, 0, 0, 4, 0, 4, 3, 0, 3)

// Color specific edges
stroke(item(poly1, 0), "red")
stroke(item(poly1, 1), "green")
stroke(item(poly1, 2), "blue")
stroke(item(poly1, 3), "orange")

// Change stroke width of an edge
strokewidth(item(poly1, 0), 3)
```

### Hiding Edges

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

poly1 = polygon(g1, 0, 0, 4, 0, 4, 3, 0, 3)

// Hide specific edges to create an open shape appearance
hide(item(poly1, 0))      // Hide bottom edge
hide(item(poly1, 2))      // Hide top edge
```

### Using Edge Data

```
g1 = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

poly1 = polygon(g1, 0, 0, 4, 0, 4, 3, 0, 3)

// Get edge endpoints
edge = item(poly1, 0)
pt1 = start(edge)       // Start point of edge
pt2 = end(edge)         // End point of edge

// Create parallel line from an edge
l1 = pll(g1, item(poly1, 1), 2)

// Get edge length
len = distance(item(poly1, 0))
```

## Edge Indexing

Edges are numbered in order of vertex connections:

```
       (0,3)──────────(4,3)
         │     e2      │
         │             │
      e3 │             │ e1
         │             │
         │     e0      │
       (0,0)──────────(4,0)

Edge 0: (0,0) → (4,0)
Edge 1: (4,0) → (4,3)
Edge 2: (4,3) → (0,3)
Edge 3: (0,3) → (0,0)
```

## Comments

| Expression | Explanation |
|------------|-------------|
| `polygon(g1, 0, 0, 4, 0, 2, 3)` | Triangle with vertices at (0,0), (4,0), (2,3) |
| `polygon(g1, pt1, pt2, pt3, pt4)` | Quadrilateral from point references |
| `item(poly1, 0)` | Get first edge as a line |
| `hide(item(poly1, 2))` | Hide third edge |
| `stroke(item(poly1, 0), "red")` | Color first edge red |
| `start(item(poly1, 0))` | Get start point of first edge |
| `end(item(poly1, 0))` | Get end point of first edge |

## Related Functions

| Function | Description |
|----------|-------------|
| `sss(g, a, b, c)` | Triangle from 3 sides |
| `sas(g, b, A, c)` | Triangle from side-angle-side |
| `asa(g, A, c, B)` | Triangle from angle-side-angle |
| `aas(g, A, B, a)` | Triangle from angle-angle-side |
| `item(poly, index)` | Get edge at index |
| `start(edge)` | Get start point of edge |
| `end(edge)` | Get end point of edge |
| `distance(edge)` | Get length of edge |
