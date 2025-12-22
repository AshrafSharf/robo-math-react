# angle3d

Creates 3D angle arcs, sectors, and right-angle markers.

## Visual

```
              P2
             /
            /  arc
           / __)
          V--------P1

V = vertex (center point)
P1, P2 = points defining the two rays
arc = angle arc between rays
```

## Expressions

| Expression | Type | Description |
|------------|------|-------------|
| `angle3d` | Interior | Smaller angle arc (<180 degrees) |
| `angle3d2` | Reflex | Larger angle arc (>180 degrees) |
| `sector3d` | Sector | Filled pie-slice shape |
| `rightangle3d` | Right | 90-degree square marker |

## API

```
// Interior angle arc (smaller angle)
angle3d(g, vertex, point1, point2)
        |    |       |       +-- point3d defining second ray
        |    |       +---------- point3d defining first ray
        |    +------------------ vertex point3d (angle center)
        +----------------------- 3D graph

angle3d(g, vertex, point1, point2, radius)
                                     +-- arc radius (default: 0.8)

angle3d(g, vector1, vector2)
        |    |        +-- second vector3d
        |    +----------- first vector3d (shared start = vertex)
        +---------------- 3D graph

// Reflex angle arc (larger angle, >180 degrees)
angle3d2(g, vertex, point1, point2)
angle3d2(g, vertex, point1, point2, radius)
angle3d2(g, vector1, vector2)

// Filled angle sector (pie slice)
sector3d(g, vertex, point1, point2)
         |    |       |       +-- point3d defining second ray
         |    |       +---------- point3d defining first ray
         |    +------------------ vertex point3d
         +----------------------- 3D graph

sector3d(g, vertex, point1, point2, radius)
                                      +-- sector radius (default: 1.0)

// Right angle marker (90-degree square)
rightangle3d(g, vertex, point1, point2)
             |    |       |       +-- point3d on second ray
             |    |       +---------- point3d on first ray
             |    +------------------ vertex point3d
             +----------------------- 3D graph

rightangle3d(g, vertex, point1, point2, size)
                                          +-- marker size (default: 0.4)
```

## Code

```
g = g3d(0, 0, 20, 20)

// Create three points forming an angle
O = point3d(g, 0, 0, 0)
A = point3d(g, 3, 0, 0)
B = point3d(g, 0, 3, 0)

// Interior angle arc (smaller angle)
arc1 = angle3d(g, O, A, B)

// Interior angle with custom radius
arc2 = angle3d(g, O, A, B, 1.2)

// Reflex angle (larger angle, going the long way)
C = point3d(g, 2, 0, 0)
D = point3d(g, 0, 0, 2)
reflex = angle3d2(g, O, C, D)

// Filled sector (pie slice)
E = point3d(g, 4, 0, 0)
F = point3d(g, 2, 3, 0)
pie = sector3d(g, O, E, F)

// Sector with custom radius
pie2 = sector3d(g, O, E, F, 2.0)

// Right angle marker (90-degree square)
P = point3d(g, 0, 0, 0)
Q = point3d(g, 2, 0, 0)
R = point3d(g, 0, 2, 0)
right = rightangle3d(g, P, Q, R)

// Right angle with custom size
right2 = rightangle3d(g, P, Q, R, 0.6)

// Using vectors (shared start point = vertex)
V1 = vector3d(g, 0, 0, 0, 3, 0, 0)
V2 = vector3d(g, 0, 0, 0, 0, 3, 0)
arcFromVectors = angle3d(g, V1, V2)
```

## Comments

| Line | Explanation |
|------|-------------|
| `angle3d(g, O, A, B)` | Interior angle arc at vertex O, between rays OA and OB |
| `angle3d(g, O, A, B, 1.2)` | Same angle with radius 1.2 (default is 0.8) |
| `angle3d2(g, O, C, D)` | Reflex angle (the larger angle, >180 degrees) |
| `sector3d(g, O, E, F)` | Filled pie-slice sector at O between OE and OF |
| `sector3d(g, O, E, F, 2.0)` | Sector with radius 2.0 (default is 1.0) |
| `rightangle3d(g, P, Q, R)` | Right angle (90-degree) square marker |
| `rightangle3d(g, P, Q, R, 0.6)` | Right angle with size 0.6 (default is 0.4) |
| `angle3d(g, V1, V2)` | Angle between two vectors sharing origin |

## Animation

Each expression type has its own animation behavior:

- **angle3d / angle3d2**: Arc grows from zero radius to target radius (1.5s, power2.out easing)
- **sector3d**: Scales from center with fade-in (1.5s, power2.out easing)
- **rightangle3d**: Scales from center with bounce effect (1.0s, back.out easing)

## Style Options

| Option | Default | Description |
|--------|---------|-------------|
| color | 0x00ff00 | Arc/sector color (green for arcs, blue for sectors) |
| opacity | 0.5 | Transparency for sectors (0-1) |
| tubeRadius | 0.04 | Thickness of arc tube |
| segments | 32 | Arc smoothness |
| filled | true | Fill the right angle marker |
| fillOpacity | 0.3 | Right angle fill transparency |
