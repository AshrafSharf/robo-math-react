# reflect3d

Reflects a 3D shape across a plane.

## Visual

```
           A (3, 4, 5)
           *
           |
           | d
    -------+-------  plane (z = 0)
           | d       mirror plane
           |
           *
        A' (3, 4, -5)
        (reflected point)
```

The reflected point is at equal distance on the opposite side of the plane.

## API

```
reflect3d(plane, shape)
            |      |
            |      +-- shape to reflect (point3d, line3d, vector3d, polygon3d)
            +--------- plane3d to reflect across
```

## Code

```
g = g3d(5, 5, 25, 25)

// Create xy-plane (z = 0) as mirror
P = plane3d(g, 0, 0, 1, 0)

// Reflect a point
A = point3d(g, 3, 4, 5)
A_refl = reflect3d(P, A)     // Result: (3, 4, -5)

// Reflect a line
L = line3d(g, 1, 1, 2, 4, 4, 5)
L_refl = reflect3d(P, L)     // Both endpoints reflected

// Reflect a vector
V = vector3d(g, 0, 0, 1, 2, 3, 4)
V_refl = reflect3d(P, V)     // Arrowhead preserved

// Reflect a polygon
poly = polygon3d(g, point3d(g, 0,0,1), point3d(g, 1,0,2), point3d(g, 0,1,3))
poly_refl = reflect3d(P, poly)
```

## Comments

| Line | Explanation |
|------|-------------|
| `plane3d(g, 0, 0, 1, 0)` | xy-plane as mirror surface |
| `reflect3d(P, A)` | Reflects point: z-coordinate negated |
| `reflect3d(P, L)` | Reflects line: both start and end points |
| `reflect3d(P, V)` | Reflects vector: direction reversed across plane |
| `reflect3d(P, poly)` | Reflects polygon: all vertices transformed |

## Supported Shape Types

| Shape | Result |
|-------|--------|
| point3d | Reflected point3d |
| line3d | Reflected line3d |
| vector3d | Reflected vector3d (with arrowhead) |
| polygon3d | Reflected polygon3d (all vertices) |

## More Examples

```
g = g3d(5, 5, 25, 25)

// Reflect across tilted plane
P = plane3d(g, 1, 1, 0, 0)   // plane where x + y = 0

A = point3d(g, 3, 0, 0)
A_refl = reflect3d(P, A)      // Swaps x and y, negates both

// Create symmetric pattern
V = vector3d(g, 0, 0, 0, 2, 1, 3)
mirror = plane3d(g, 1, 0, 0, 0)  // yz-plane
V_sym = reflect3d(mirror, V)      // Mirror image across yz-plane
```

## Animation

The reflected shape animates using its native animation:
- point3d: fadein with pen
- line3d: draws progressively
- vector3d: draws with arrowhead
- polygon3d: sweeps to fill
