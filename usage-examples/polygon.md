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
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Triangle from coordinates
P1 = polygon(G, 0, 0, 4, 0, 2, 3)

// Quadrilateral from coordinates
P2 = polygon(G, 0, 0, 4, 0, 4, 3, 0, 3)

// Pentagon from points
A = point(G, 0, 0)
B = point(G, 3, 0)
C = point(G, 4, 2)
D = point(G, 1.5, 4)
E = point(G, -1, 2)
P3 = polygon(G, A, B, C, D, E)

// Styling
stroke(P1, "blue")
fill(P2, "lightblue")
strokewidth(P3, 2)
```

## Edge Access

Polygons support edge access via `item()`. Edges are 0-indexed.

### Accessing Individual Edges

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

// Create a quadrilateral
P = polygon(G, 0, 0, 4, 0, 4, 3, 0, 3)

// Access edges (4 edges for a quadrilateral)
edge0 = item(P, 0)    // Bottom edge (0,0) to (4,0)
edge1 = item(P, 1)    // Right edge (4,0) to (4,3)
edge2 = item(P, 2)    // Top edge (4,3) to (0,3)
edge3 = item(P, 3)    // Left edge (0,3) to (0,0)
```

### Styling Individual Edges

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

P = polygon(G, 0, 0, 4, 0, 4, 3, 0, 3)

// Color specific edges
stroke(item(P, 0), "red")
stroke(item(P, 1), "green")
stroke(item(P, 2), "blue")
stroke(item(P, 3), "orange")

// Change stroke width of an edge
strokewidth(item(P, 0), 3)
```

### Hiding Edges

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

P = polygon(G, 0, 0, 4, 0, 4, 3, 0, 3)

// Hide specific edges to create an open shape appearance
hide(item(P, 0))      // Hide bottom edge
hide(item(P, 2))      // Hide top edge
```

### Using Edge Data

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

P = polygon(G, 0, 0, 4, 0, 4, 3, 0, 3)

// Get edge endpoints
edge = item(P, 0)
A = start(edge)       // Start point of edge
B = end(edge)         // End point of edge

// Create parallel line from an edge
L = pll(G, item(P, 1), 2)

// Get edge length
len = mag(item(P, 0))
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
| `polygon(G, 0, 0, 4, 0, 2, 3)` | Triangle with vertices at (0,0), (4,0), (2,3) |
| `polygon(G, A, B, C, D)` | Quadrilateral from point references |
| `item(P, 0)` | Get first edge as a line |
| `hide(item(P, 2))` | Hide third edge |
| `stroke(item(P, 0), "red")` | Color first edge red |
| `start(item(P, 0))` | Get start point of first edge |
| `end(item(P, 0))` | Get end point of first edge |

## Related Functions

| Function | Description |
|----------|-------------|
| `sss(g, a, b, c)` | Triangle from 3 sides |
| `sas(g, b, A, c)` | Triangle from side-angle-side |
| `asa(g, A, c, B)` | Triangle from angle-side-angle |
| `aas(g, A, B, a)` | Triangle from angle-angle-side |
| `item(P, index)` | Get edge at index |
| `start(edge)` | Get start point of edge |
| `end(edge)` | Get end point of edge |
| `mag(edge)` | Get length of edge |
