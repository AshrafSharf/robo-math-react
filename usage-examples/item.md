# item() - Access Items from Collections

Extract a single item from a collection by index. Works with text collections, shape collections, and table collections.

## Syntax

```
item(collection, index)           # For text/shape collections
item(table, rowIndex)             # Get table row
item(table, rowIndex, colIndex)   # Get table cell
```

---

## Text Collections (TextItem)

### Access Items from select()

```
M = mtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
thetas = select(M, "\theta")

# Get first theta
T1 = item(thetas, 0)

# Animate individual items
write(item(thetas, 0))
write(item(thetas, 1))
write(item(thetas, 2))
```

### Clone to New Position

```
M = mtext(3, 2, "x^2 + y^2 = r^2")
S = select(M, "x^2")

# Clone to new position with animation
write(5, 2, item(S, 0))
```

---

## Table Collections (TableRow / TableCell)

### Access Table Rows

```
T = table(0, 0)

# Get row 0 (returns TableRow)
R = item(T, 0)

# Apply operations to entire row
show(R)
hide(R)
stroke(R, "blue")
fill(R, "#f0f0f0")
```

### Access Table Cells

```
T = table(0, 0)

# Get cell at row 0, column 1 (returns TableCell)
C = item(T, 0, 1)

# Visibility operations
show(C)
hide(C)
fadeIn(C)
fadeOut(C)

# Stroke (text/path color)
stroke(C, "red")

# Fill (background color)
fill(C, "yellow")
```

### Write Animation for Table Cells

```
T = table(0, 0)

# Animate cell content with pen-tracing (LaTeX) or typewriter (plain text)
write(item(T, 0, 1))

# Animate multiple cells
write(item(T, 0, 0))
write(item(T, 0, 1))
write(item(T, 1, 0))
write(item(T, 1, 1))
```

### Styling Table Cells and Rows

```
T = table(0, 0)

# Style a single cell
C = item(T, 1, 2)
stroke(C, "red")
fill(C, "#ffffcc")

# Style an entire row
R = item(T, 0)
fill(R, "#e8f0fe")
stroke(R, "navy")
```

### Sequential Cell Animation

```
T = table(0, 0)

# Hide all cells first, then animate them one by one
hide(item(T, 0))
hide(item(T, 1))

# Animate row by row
write(item(T, 0, 0))
write(item(T, 0, 1))
write(item(T, 1, 0))
write(item(T, 1, 1))
```

---

## Shape Collections (2D/3D)

### Access Translated Shapes

```
G = g2d(0, 0, 10, 10, -5, 5, -5, 5)
P1 = point(G, 1, 1)
P2 = point(G, 2, 2)
P3 = point(G, 3, 3)

# Multi-shape translate creates a collection
S = translate(G, P1, P2, P3, 2, 2)

# Access individual translated shapes
T1 = item(S, 0)  # First translated point
T2 = item(S, 1)  # Second translated point
T3 = item(S, 2)  # Third translated point

# Use in further operations
line(G, T1, T2)
```

### Access Rotated Shapes

```
G = g2d(0, 0, 10, 10, -5, 5, -5, 5)
P = point(G, 2, 0)
center = point(G, 0, 0)

# Multi-shape rotate
S = rotate(G, P, center, 45, 90, 135)

# Access rotated positions
R1 = item(S, 0)  # Rotated 45 degrees
R2 = item(S, 1)  # Rotated 90 degrees
R3 = item(S, 2)  # Rotated 135 degrees
```

---

## Polygon / Triangle Edge Access

Access individual edges of polygons and triangles. Each edge is returned as a line with start and end points.

### Triangle Edges

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

# Create a triangle
T = sss(G, 3, 4, 5)

# Access individual edges (0-indexed)
edge0 = item(T, 0)    # Edge from vertex A to B
edge1 = item(T, 1)    # Edge from vertex B to C
edge2 = item(T, 2)    # Edge from vertex C to A
```

### Styling Individual Edges

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

T = sas(G, 4, 90, 3)

# Color each edge differently
stroke(item(T, 0), "red")
stroke(item(T, 1), "green")
stroke(item(T, 2), "blue")

# Change stroke width
strokewidth(item(T, 0), 3)
```

### Hiding Edges

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

T = asa(G, 60, 5, 60)

# Hide specific edges
hide(item(T, 0))      # Hide base edge
hide(item(T, 2))      # Hide another edge
```

### Polygon Edges

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

# Create a polygon
P = polygon(G, 0, 0, 4, 0, 4, 3, 0, 3)

# Access edges (4 edges for a quadrilateral)
item(P, 0)    # Bottom edge
item(P, 1)    # Right edge
item(P, 2)    # Top edge
item(P, 3)    # Left edge

# Style specific edges
stroke(item(P, 0), "red")
hide(item(P, 2))
```

### Using Edge Data

```
G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)

T = sss(G, 3, 4, 5)

# Get edge endpoints
edge = item(T, 0)
A = start(edge)       # Start point of edge
B = end(edge)         # End point of edge

# Create parallel line from edge
L = pll(G, item(T, 1), 2)
```

### Supported Triangle Types

All triangle construction methods support edge access:

```
# SSS - Side-Side-Side
T1 = sss(G, 3, 4, 5)
item(T1, 0)

# SAS - Side-Angle-Side
T2 = sas(G, 4, 90, 3)
item(T2, 1)

# ASA - Angle-Side-Angle
T3 = asa(G, 60, 5, 60)
item(T3, 2)

# AAS - Angle-Angle-Side
T4 = aas(G, 30, 60, 5)
item(T4, 0)
```

---

## Notes

- For text collections: `item()` returns a TextItem that can be animated with `write()`
- For table rows: `item(table, row)` returns a TableRow affecting all cells in that row
- For table cells: `item(table, row, col)` returns a TableCell for individual cell operations
- For shape collections: `item()` extracts the shape data for use in other expressions
- For polygons/triangles: `item()` returns the edge as a line that can be styled or hidden
- Index is 0-based
- Out-of-bounds index will produce an error

## Supported Collection Types

| Collection Type | item() Returns | Operations |
|-----------------|----------------|------------|
| `select()` | TextItem | `write()`, clone to position |
| `table` (1 index) | TableRow | `show`, `hide`, `stroke`, `fill` |
| `table` (2 indices) | TableCell | `show`, `hide`, `stroke`, `fill`, `write` |
| `translate()` | Shape | Use in expressions |
| `rotate()` | Shape | Use in expressions |
| `polygon` | Edge (line) | `hide`, `show`, `stroke`, `strokewidth`, `start`, `end` |
| `sss`, `sas`, `asa`, `aas` | Edge (line) | `hide`, `show`, `stroke`, `strokewidth`, `start`, `end` |
