# intersect3d

Finds the intersection of 3D geometric objects.

## Visual

```
Line + Plane = Point          Plane + Plane = Line

       L                           P1
      /                           /
     /                           /
----*----  P                 ---/---  intersection line
   /                           /
  /  intersection             / P2
     point
```

## API

```
intersect3d(obj1, obj2)
              |     |
              |     +-- second object (line3d or plane3d)
              +-------- first object (line3d or plane3d)
```

## Supported Combinations

| obj1 | obj2 | Result |
|------|------|--------|
| line3d | line3d | point3d (if lines intersect) |
| line3d | plane3d | point3d (if line not parallel) |
| plane3d | plane3d | line3d (if planes not parallel) |

## Code

```
g = g3d(0, 0, 20, 20)

// Line-Plane intersection
L = line3d(g, 0, 0, 0, 1, 1, 1)
P = plane3d(g, 0, 0, 1, -5)       // z = 5 plane
pt = intersect3d(L, P)            // Point where line crosses z=5

// Line-Line intersection
L1 = line3d(g, 0, 0, 0, 4, 4, 4)
L2 = line3d(g, 4, 0, 0, 0, 4, 4)
pt2 = intersect3d(L1, L2)         // Point where lines cross

// Plane-Plane intersection
P1 = plane3d(g, 0, 0, 1, 0)       // xy-plane (z = 0)
P2 = plane3d(g, 0, 1, 0, 0)       // xz-plane (y = 0)
axis = intersect3d(P1, P2)        // x-axis as line3d
```

## Comments

| Line | Explanation |
|------|-------------|
| `line3d(g, 0,0,0, 1,1,1)` | Line from origin along (1,1,1) direction |
| `plane3d(g, 0, 0, 1, -5)` | Horizontal plane at z = 5 |
| `intersect3d(L, P)` | Returns point3d at (5, 5, 5) |
| `intersect3d(P1, P2)` | Returns line3d along x-axis |

## No Intersection Cases

When objects don't intersect, the result is not rendered:

```
g = g3d(0, 0, 20, 20)

// Parallel lines (skew in 3D)
L1 = line3d(g, 0, 0, 0, 1, 0, 0)
L2 = line3d(g, 0, 1, 0, 1, 1, 0)
pt = intersect3d(L1, L2)          // No intersection (skew lines)

// Line parallel to plane
L = line3d(g, 0, 0, 5, 1, 1, 5)   // Horizontal line at z=5
P = plane3d(g, 0, 0, 1, -5)       // z = 5 plane
pt = intersect3d(L, P)            // No intersection (line in plane)

// Parallel planes
P1 = plane3d(g, 0, 0, 1, 0)       // z = 0
P2 = plane3d(g, 0, 0, 1, -5)      // z = 5
line = intersect3d(P1, P2)        // No intersection (parallel)
```

## Animation

- Point result: fadein with pen animation
- Line result: draws progressively from start to end
