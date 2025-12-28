# polygon3d

Creates a 3D polygon from 3 or more vertices.

## Visual

```
        P3
       /  \
      /    \
     /      \
    /   fill \
   /          \
  P1----------P2
```

A polygon is a closed shape with vertices connected by edges. The interior is filled.

## API

```
polygon3d(g, p1, p2, p3, ...)
          |   |   |   |
          |   |   |   +-- additional point3d vertices (3+ required)
          |   |   +------ third vertex point3d
          |   +---------- second vertex point3d
          |   +---------- first vertex point3d
          +-------------- 3D graph
```

All vertices must be point3d expressions. Minimum 3 vertices required.

## Code

```
g = g3d(5, 5, 25, 25)
A = point3d(g, 0, 0, 0)
B = point3d(g, 3, 0, 0)
C = point3d(g, 1.5, 2, 1)
triangle = polygon3d(g, A, B, C)

// Quadrilateral (4 vertices)
P1 = point3d(g, 0, 0, 0)
P2 = point3d(g, 4, 0, 0)
P3 = point3d(g, 4, 3, 0)
P4 = point3d(g, 0, 3, 0)
quad = polygon3d(g, P1, P2, P3, P4)

// Pentagon (5 vertices)
V1 = point3d(g, 2, 0, 0)
V2 = point3d(g, 4, 1.5, 0)
V3 = point3d(g, 3, 4, 0)
V4 = point3d(g, 1, 4, 0)
V5 = point3d(g, 0, 1.5, 0)
pentagon = polygon3d(g, V1, V2, V3, V4, V5)

// Inline point creation
poly = polygon3d(g, point3d(g, 0, 0, 2), point3d(g, 3, 0, 2), point3d(g, 1.5, 3, 2))
```

## Comments

| Line | Explanation |
|------|-------------|
| `polygon3d(g, A, B, C)` | Triangle with 3 vertices |
| `polygon3d(g, P1, P2, P3, P4)` | Quadrilateral with 4 vertices |
| `polygon3d(g, V1, V2, V3, V4, V5)` | Pentagon with 5 vertices |
| Inline points | Points can be created inline within polygon3d call |

## Animation

The polygon animates with a pen-tracking effect:
- Starts at polygon centroid
- Scales from center (0 to full size)
- Pen traces along vertices as polygon expands

## Style Options

| Option | Default | Description |
|--------|---------|-------------|
| color | 0x4444ff | Fill color (blue) |
| opacity | 0.7 | Transparency (0-1) |
| showEdges | false | Show edge lines |
| edgeColor | 0x000000 | Edge line color (if showEdges=true) |
