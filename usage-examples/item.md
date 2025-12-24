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
M = mathtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
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
M = mathtext(3, 2, "x^2 + y^2 = r^2")
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

## Notes

- For text collections: `item()` returns a TextItem that can be animated with `write()`
- For table rows: `item(table, row)` returns a TableRow affecting all cells in that row
- For table cells: `item(table, row, col)` returns a TableCell for individual cell operations
- For shape collections: `item()` extracts the shape data for use in other expressions
- Index is 0-based
- Out-of-bounds index will produce an error
