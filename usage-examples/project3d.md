# project3d

Projects a 3D point onto a plane, returning the foot of perpendicular.

## Visual

```
           A (3, 4, 5)
           *
           |
           | perpendicular
           | distance
           |
    -------*-------  plane (z = 0)
        A' (3, 4, 0)
        (projected point)
```

The projection finds the closest point on the plane to the given point.

## API

```
project3d(plane, point)
            |      |
            |      +-- point3d to project
            +--------- plane3d to project onto
```

## Code

```
g = g3d(0, 0, 20, 20)

// Create xy-plane (z = 0)
P = plane3d(g, 0, 0, 1, 0)

// Point above the plane
A = point3d(g, 3, 4, 5)

// Project point onto plane
A_proj = project3d(P, A)
```

## Comments

| Line | Explanation |
|------|-------------|
| `plane3d(g, 0, 0, 1, 0)` | xy-plane where z = 0 (normal is [0,0,1]) |
| `point3d(g, 3, 4, 5)` | Point 5 units above the xy-plane |
| `project3d(P, A)` | Returns point3d at (3, 4, 0) |

## More Examples

```
g = g3d(0, 0, 20, 20)

// Project onto xz-plane (y = 0)
P1 = plane3d(g, 0, 1, 0, 0)
B = point3d(g, 2, 5, 3)
B_proj = project3d(P1, B)    // Result: (2, 0, 3)

// Project onto tilted plane x + y + z = 6
P2 = plane3d(g, 1, 1, 1, -6)
C = point3d(g, 0, 0, 0)
C_proj = project3d(P2, C)    // Result: (2, 2, 2)
```

## Animation

The projected point appears with fadein animation and pen tracing, same as point3d.
