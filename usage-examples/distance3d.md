# distance3d

Calculates distance between 3D geometric objects. Returns a numeric value (no visualization).

## Syntax

```
distance3d(object1, object2)
```

## Supported Combinations

| Syntax | Description |
|--------|-------------|
| `distance3d(point1, point2)` | Distance between two 3D points |
| `distance3d(point, line3d)` | Perpendicular distance from point to line |
| `distance3d(point, plane3d)` | Perpendicular distance from point to plane |
| `distance3d(line1, line2)` | Distance between lines (parallel or skew) |
| `distance3d(plane1, plane2)` | Distance between parallel planes (0 if intersecting) |
| `distance3d(point, vector3d)` | Distance from point to vector (treated as line) |
| `distance3d(vector1, vector2)` | Distance between vectors (treated as lines) |

## Examples

### Point to Point
```javascript
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

P1 = point3d(G, 0, 0, 0)
P2 = point3d(G, 3, 4, 0)

d = distance3d(P1, P2)  // Returns 5
```

### Point to Plane
```javascript
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Plane at z = 0
Plane = plane3d(G, 0, 0, 1, 0)

// Point above the plane
P = point3d(G, 1, 2, 3)

d = distance3d(P, Plane)  // Returns 3 (the z-coordinate)
```

### Point to Line
```javascript
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Line along X axis
L = line3d(G, 0, 0, 0, 5, 0, 0)

// Point off the line
P = point3d(G, 2, 3, 4)

d = distance3d(P, L)  // Perpendicular distance = 5
```

### Between Skew Lines
```javascript
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Line along X axis
L1 = line3d(G, 0, 0, 0, 5, 0, 0)

// Line along Y axis, offset in Z
L2 = line3d(G, 0, 0, 3, 0, 5, 3)

d = distance3d(L1, L2)  // Returns 3 (vertical separation)
```

### Between Parallel Planes
```javascript
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Plane at z = 0
P1 = plane3d(G, 0, 0, 1, 0)

// Plane at z = 5
P2 = plane3d(G, "z = 5")

d = distance3d(P1, P2)  // Returns 5
```

### With Change Expression
```javascript
G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5)

// Create a plane (z = 0)
Plane = plane3d(G, 0, 0, 1, 0)

// Create a point above the plane
P = point3d(G, 1, 1, 3)

// Calculate and display distance
d = distance3d(P, Plane)
label(G, d, 0, 1)

// Animate the point moving up
change(P, point3d(G, 1, 1, 5))

// New distance after animation
d2 = distance3d(P, Plane)
label(G, d2, 0, 2)
```

## Formulas

- **Point to point:** `d = sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2)`
- **Point to plane:** `d = |u . n - p| / ||n||` where plane equation is `r . n = p`
- **Point to line:** `d = ||PQ x u|| / ||u||` where u is line direction
- **Skew lines:** `d = |AC . (b x d)| / ||b x d||`
- **Parallel lines:** `d = ||AC x b|| / ||b||`
- **Parallel planes:** `d = |d1 - d2| / ||n||`

## Notes

- Returns a numeric value that can be used in arithmetic expressions
- No visualization is created (use `dm` for distance markers)
- For intersecting planes, returns 0
- Works with both `line3d` and `vector3d` objects
