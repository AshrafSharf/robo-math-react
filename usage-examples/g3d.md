# g3d - 3D Graph Container

Create a 3D coordinate graph with customizable axes, ranges, grid styling, and coordinate system.

## Basic Syntax

```
g3d(row1, col1, row2, col2)
g3d(row1, col1, row2, col2, axes3d)
g3d(row1, col1, row2, col2, xRange, yRange, zRange)
```

## Examples

### Basic Graph (default range -10 to 10)

```
G = g3d(5, 5, 25, 25)
point3d(G, 3, 4, 2)
```

### Graph with Axes3d Configuration

```
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-5, 5)))
G = g3d(5, 5, 25, 25, ax)
point3d(G, 3, 4, 2)
```

### Graph with Direct Ranges

```
G = g3d(5, 5, 25, 25, range(-5, 5), range(-5, 5), range(-2, 2))
sphere(G, 0, 0, 0, 1)
```

---

## range3d() Expression

Bundle three range expressions for x, y, and z axes.

```
range3d(xRange, yRange, zRange)
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| xRange | range() expression for x-axis |
| yRange | range() expression for y-axis |
| zRange | range() expression for z-axis |

### Examples

```
range3d(range(-10, 10), range(-10, 10), range(-5, 5))
range3d(range(-5, 5, 1), range(-5, 5, 1), range(0, 10, 2))
range3d(range(-2*pi, 2*pi, pi/4, "trig"), range(-10, 10), range(-1, 1))
```

---

## grid3d() Expression

Configure 3D grid line styling. Use with `"gridlines"` option to show styled gridlines.

```
grid3d(c(color))
grid3d(c(color), s(strokeWidth))
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| c(color) | Grid line color |
| s(width) | Grid line stroke width |

### Examples

```
// Styled gridlines (requires "gridlines" option to be visible)
ax = axes3d(range3d(...), grid3d(c(gray)), "gridlines")
ax = axes3d(range3d(...), grid3d(c(lightblue), s(0.5)), "gridlines")
ax = axes3d(range3d(...), grid3d(c(red), s(2)), "gridlines")
```

---

## axes3d() Expression

Bundle x/y/z ranges, grid styling, visibility options, and coordinate system.

```
axes3d(range3d)
axes3d(range3d, grid3d)
axes3d(range3d, "option")
axes3d(range3d, grid3d, "option1", "option2")
```

### Grid Visibility Options

By default, only axes are shown (gridlines are hidden). Use string options to control visibility:

| Option | Description |
|--------|-------------|
| `"gridlines"` | Show gridlines (default: hidden) |
| `"nogrid"` | Hide everything including axes |

### Coordinate System Options

| Option | Description |
|--------|-------------|
| `"lhs"` | Left-hand system (default) - X right, Y forward, Z up |
| `"rhs"` | Right-hand system - native Three.js (X right, Y up, Z towards viewer) |

Options can appear in any order within axes3d().

### Examples

```
// Axes only - no gridlines (default, LHS coordinate system)
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-5, 5)))
G = g3d(5, 5, 25, 25, ax)

// With gridlines
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-5, 5)), "gridlines")
G = g3d(5, 5, 25, 25, ax)

// No grid at all (blank 3D space)
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-5, 5)), "nogrid")
G = g3d(5, 5, 25, 25, ax)

// Right-hand coordinate system
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-5, 5)), "rhs")
G = g3d(5, 5, 25, 25, ax)

// Styled gridlines
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-5, 5)), grid3d(c(lightgray), s(0.5)), "gridlines")
G = g3d(5, 5, 25, 25, ax)

// Combine options: RHS with gridlines
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-5, 5)), "rhs", "gridlines")
G = g3d(5, 5, 25, 25, ax)
```

---

## Complete Examples

### Basic 3D Point

```
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-10, 10)))
G = g3d(5, 5, 25, 25, ax)
point3d(G, 3, 4, 5)
```

### 3D Vector with Gridlines

```
ax = axes3d(range3d(range(-5, 5), range(-5, 5), range(-5, 5)), "gridlines")
G = g3d(5, 5, 25, 25, ax)
vector3d(G, 0, 0, 0, 3, 2, 4)
```

### Sphere in RHS Coordinate System

```
ax = axes3d(range3d(range(-5, 5), range(-5, 5), range(-5, 5)), "rhs")
G = g3d(5, 5, 25, 25, ax)
sphere(G, 0, 0, 0, 2)
```

### Surface Plot with Custom Range

```
ax = axes3d(range3d(range(-3, 3), range(-3, 3), range(0, 10)))
G = g3d(5, 5, 25, 25, ax)
plot3d(G, "x^2 + y^2")
```

### Parametric Curve with Styled Grid

```
ax = axes3d(range3d(range(-5, 5), range(-5, 5), range(-2, 2)), grid3d(c(gray)), "gridlines")
G = g3d(5, 5, 25, 25, ax)
curve3d(G, "cos(t)", "sin(t)", "t/10", 0, 6*pi)
```

### Clean 3D Space (No Axes)

```
ax = axes3d(range3d(range(-5, 5), range(-5, 5), range(-5, 5)), "nogrid")
G = g3d(5, 5, 25, 25, ax)
cube(G, 0, 0, 0, 2)
cylinder(G, 3, 0, 0, 1, 3)
```

### Multiple Shapes with LHS (Default)

```
ax = axes3d(range3d(range(-10, 10), range(-10, 10), range(-10, 10)))
G = g3d(5, 5, 25, 25, ax)
point3d(G, 5, 0, 0, c(red))
point3d(G, 0, 5, 0, c(green))
point3d(G, 0, 0, 5, c(blue))
vector3d(G, 0, 0, 0, 5, 0, 0, c(red))
vector3d(G, 0, 0, 0, 0, 5, 0, c(green))
vector3d(G, 0, 0, 0, 0, 0, 5, c(blue))
```

### Trig Scale on X-Axis

```
ax = axes3d(range3d(range(-2*pi, 2*pi, pi/2, "trig"), range(-5, 5), range(-1, 1)))
G = g3d(5, 5, 25, 25, ax)
curve3d(G, "t", "0", "sin(t)", -2*pi, 2*pi)
```
