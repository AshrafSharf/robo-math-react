# g2d - 2D Graph Container

Create a 2D coordinate graph with customizable axes, ranges, and grid styling.

## Basic Syntax

```
g2d(row1, col1, row2, col2)
g2d(row1, col1, row2, col2, axes)
g2d(row1, col1, row2, col2, xRange, yRange)
```

## Examples

### Basic Graph (default range -10 to 10)

```
G = g2d(4, 4, 25, 25)
point(G, 3, 4)
```

### Graph with Axes Configuration

```
ax = axes(range(-10, 10), range(-5, 5))
G = g2d(4, 4, 25, 25, ax)
plot(G, "sin(x)")
```

### Graph with Direct Ranges

```
G = g2d(4, 4, 25, 25, range(-5, 5), range(-2, 2))
plot(G, "x^2")
```

---

## range() Expression

Configure axis range, tick interval, and scale type.

```
range(min, max)
range(min, max, step)
range(min, max, step, "scaleType")
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| min | Minimum value of the axis |
| max | Maximum value of the axis |
| step | Tick interval (optional) |
| scaleType | Scale type string (optional, default: "linear") |

### Examples

```
range(-10, 10)                    // basic range
range(-10, 10, 2)                 // ticks every 2 units
range(-2*pi, 2*pi, pi/4, "trig")  // trig scale with pi/4 ticks
range(0.1, 1000, 10, "log")       // logarithmic scale
```

---

## Scale Types

### "linear" (default)

Standard linear scale with numeric labels.

```
ax = axes(range(-10, 10, 1), range(-5, 5, 1))
G = g2d(4, 4, 25, 25, ax)
```

### "trig"

Trigonometric scale with pi-based labels (pi/6, pi/4, pi/3, pi/2, pi, etc.)

```
ax = axes(range(-2*pi, 2*pi, pi/4, "trig"), range(-1.5, 1.5, 0.5))
G = g2d(4, 4, 25, 25, ax)
plot(G, "sin(x)")
plot(G, "cos(x)")
```

```
ax = axes(range(-3*pi, 3*pi, pi/2, "trig"), range(-2, 2, 0.5))
G = g2d(4, 4, 25, 25, ax)
plot(G, "tan(x)")
```

### "log"

Logarithmic scale base 10 with exponent labels (10^0, 10^1, 10^2, etc.)

```
ax = axes(range(0.1, 1000, 10, "log"), range(-5, 5, 1))
G = g2d(4, 4, 25, 25, ax)
plot(G, "log10(x)")
```

### "ln"

Natural logarithmic scale base e with exponent labels (e^0, e^1, e^2, etc.)

```
ax = axes(range(0.1, 100, 10, "ln"), range(-5, 5, 1))
G = g2d(4, 4, 25, 25, ax)
plot(G, "ln(x)")
```

### "im"

Imaginary scale with i-based labels for complex plane y-axis (-2i, -i, 0, i, 2i, etc.)

```
ax = axes(range(-5, 5, 1), range(-5, 5, 1, "im"))
G = g2d(4, 4, 25, 25, ax)
```

---

## grid() Expression

Configure grid line styling. Use with `"gridlines"` option to show styled gridlines.

```
grid(c(color))
grid(c(color), s(strokeWidth))
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| c(color) | Grid line color |
| s(width) | Grid line stroke width |

### Examples

```
// Styled gridlines (requires "gridlines" option to be visible)
ax = axes(range(-10, 10), range(-5, 5), grid(c(gray)), "gridlines")
ax = axes(range(-10, 10), range(-5, 5), grid(c(lightblue), s(0.5)), "gridlines")
ax = axes(range(-10, 10), range(-5, 5), grid(c(red), s(2)), "gridlines")
```

---

## axes() Expression

Bundle x/y ranges, grid styling, and visibility options.

```
axes(xRange, yRange)
axes(xRange, yRange, grid)
axes(xRange, yRange, "option")
axes(xRange, yRange, grid, "option")
```

### Grid Visibility Options

By default, only axes are shown (gridlines are hidden). Use string options to control visibility:

| Option | Description |
|--------|-------------|
| `"gridlines"` | Show gridlines (default: hidden) |
| `"nogrid"` | Hide everything including axes |

Options can appear in any order within axes().

### Examples

```
// Axes only - no gridlines (default)
ax = axes(range(-10, 10), range(-5, 5))
G = g2d(4, 4, 25, 25, ax)

// With gridlines
ax = axes(range(-10, 10), range(-5, 5), "gridlines")
G = g2d(4, 4, 25, 25, ax)

// No grid at all (blank canvas)
ax = axes(range(-10, 10), range(-5, 5), "nogrid")
G = g2d(4, 4, 25, 25, ax)

// With step intervals
ax = axes(range(-10, 10, 2), range(-5, 5, 1))
G = g2d(4, 4, 25, 25, ax)

// Styled gridlines
ax = axes(range(-10, 10, 1), range(-5, 5, 0.5), grid(c(lightgray), s(0.5)), "gridlines")
G = g2d(4, 4, 25, 25, ax)

// Trig scale with gridlines
ax = axes(range(-2*pi, 2*pi, pi/4, "trig"), range(-1.5, 1.5, 0.5), "gridlines")
G = g2d(4, 4, 25, 25, ax)
plot(G, "sin(x)")
```

---

## Complete Examples

### Sine and Cosine

```
ax = axes(range(-2*pi, 2*pi, pi/2, "trig"), range(-1.5, 1.5, 0.5))
G = g2d(4, 4, 25, 25, ax)
plot(G, "sin(x)", c(blue))
plot(G, "cos(x)", c(red))
```

### Exponential Function

```
ax = axes(range(-3, 3, 1), range(0, 10, 2))
G = g2d(4, 4, 25, 25, ax)
plot(G, "exp(x)")
```

### Logarithmic Function

```
ax = axes(range(0.1, 10, 1), range(-3, 3, 1))
G = g2d(4, 4, 25, 25, ax)
plot(G, "ln(x)")
```

### Complex Plane

```
ax = axes(range(-5, 5, 1), range(-5, 5, 1, "im"))
G = g2d(4, 4, 25, 25, ax)
point(G, 3, 2)   // represents 3 + 2i
point(G, -1, 4)  // represents -1 + 4i
```

### Quadratic with Custom Grid

```
ax = axes(range(-5, 5, 1), range(-2, 10, 2), grid(c(lightblue), s(0.3)), "gridlines")
G = g2d(4, 4, 25, 25, ax)
plot(G, "x^2")
```

### Multiple Trig Functions

```
ax = axes(range(-pi, pi, pi/4, "trig"), range(-2, 2, 0.5), grid(c(gray)), "gridlines")
G = g2d(4, 4, 25, 25, ax)
plot(G, "sin(x)", c(blue))
plot(G, "cos(x)", c(red))
plot(G, "sin(2*x)", c(green))
```

### Clean Graph (No Grid)

```
ax = axes(range(-5, 5), range(-5, 5), "nogrid")
G = g2d(4, 4, 25, 25, ax)
point(G, 2, 3)
vector(G, 0, 0, 2, 3)
```
