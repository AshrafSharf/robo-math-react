# plane3d

Creates a 3D plane with sweep animation.

## Visual

```
        normal
           ^
           |
    +------+------+
   /      /|     /|
  /------/-+----/ |
  |      | |    | |
  |  plane (filled surface)
  |      |      |
  +------+------+
         center
```

A plane is an infinite flat surface, rendered as a finite square centered at a point.

## API

```
// Point + Normal vector
plane3d(g, point, normalVector)
        |    |         |
        |    |         +-- vector3d defining perpendicular direction
        |    +------------ point3d on the plane
        +----------------- 3D graph

// Three points (defines plane through all three)
plane3d(g, p1, p2, p3)
        |   |   |   +-- third point3d
        |   |   +------ second point3d
        |   +---------- first point3d
        +-------------- 3D graph

// Equation coefficients: ax + by + cz + d = 0
plane3d(g, a, b, c, d)
        |  |  |  |  +-- constant term
        |  |  |  +---- z coefficient
        |  |  +------- y coefficient
        |  +---------- x coefficient
        +------------- 3D graph

// Two spanning vectors + point
plane3d(g, vec1, vec2, point)
        |    |     |      +-- point3d on the plane
        |    |     +--------- second spanning vector3d
        |    +--------------- first spanning vector3d
        +-------------------- 3D graph

// Equation string (mathjs parsed)
plane3d(g, "x + 2*y - z = 5")
        |         |
        |         +-- plane equation string
        +------------ 3D graph
```

## Code

```
g = g3d(5, 5, 25, 25)

// Method 1: Point + Normal
P = point3d(g, 0, 0, 0)
N = vector3d(g, 0, 0, 0, 0, 0, 1)
plane1 = plane3d(g, P, N)

// Method 2: Three points
A = point3d(g, 1, 0, 0)
B = point3d(g, 0, 1, 0)
C = point3d(g, 0, 0, 1)
plane2 = plane3d(g, A, B, C)

// Method 3: Equation coefficients
plane3 = plane3d(g, 1, 1, 1, -3)

// Method 4: Two vectors + point
V1 = vector3d(g, 0, 0, 0, 1, 0, 0)
V2 = vector3d(g, 0, 0, 0, 0, 1, 0)
O = point3d(g, 0, 0, 2)
plane4 = plane3d(g, V1, V2, O)

// Method 5: Equation string
plane5 = plane3d(g, "2*x - y + 3*z = 6")

// With variables for animation
a = 1
b = 2
c = -1
d = 5
plane6 = plane3d(g, a, b, c, d)
```

## Comments

| Line | Explanation |
|------|-------------|
| `plane3d(g, P, N)` | Plane through point P, perpendicular to vector N |
| `plane3d(g, A, B, C)` | Plane passing through three points |
| `plane3d(g, 1, 1, 1, -3)` | Plane x + y + z = 3 |
| `plane3d(g, V1, V2, O)` | Plane spanned by V1, V2, passing through O |
| `plane3d(g, "2*x - y + 3*z = 6")` | Plane from equation string |
| `plane3d(g, a, b, c, d)` | Coefficients as variables (supports fromTo) |

## Animation

The plane animates with a sweep effect. Sweep direction options:
- `h` - Horizontal sweep (left to right)
- `v` - Vertical sweep (bottom to top)
- `d` - Diagonal sweep
- `r` - Radial sweep from center (default)

## Style Options

| Option | Default | Description |
|--------|---------|-------------|
| color | 0x00ffff | Plane fill color (cyan) |
| opacity | 0.5 | Transparency (0-1) |
| size | 12 | Plane size in units |
| sweepDirection | 'r' | Animation direction (h/v/d/r) |
