# Math Functions

Mathematical functions powered by mathjs. All trigonometric functions use radians - use `rad()` to convert degrees.

## Degree/Radian Conversion

### rad - Degrees to Radians
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
ang = 0
v1 = polarvector(g1, 3, ang)
arc(g1, 0, 0, 1.5, 0, ang)
label(g1, ang, 2, 2)
mtext("\\theta = ", 5, 1)
change(ang, 120)
```
Vector rotates with arc and label showing angle in degrees.

### deg - Radians to Degrees
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
O = point(g1, 0, 0)
A = point(g1, 3, 2)
radians = atan2(y(A), x(A))
degrees = deg(radians)
line(g1, O, A)
angle(g1, point(g1, 3, 0), O, A)
label(g1, degrees, 3.5, 2.5)
```
Shows angle measurement converted from radians.

---

## Trigonometric Functions

### sin, cos - Rotating Vector
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
ang = 0
v1 = vector(g1, 0, 0, 3*cos(rad(ang)), 3*sin(rad(ang)))
circle(g1, 3, 0, 0)
// Projections
dashedline(g1, end(g1, v1), point(g1, x(end(g1, v1)), 0))
dashedline(g1, end(g1, v1), point(g1, 0, y(end(g1, v1))))
change(ang, 360)
```
Vector rotates showing x=cos, y=sin projections.

### sin, cos - Regular Hexagon Construction
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
r = 3
// 6 vertices at 60° intervals
p1 = point(g1, r*cos(rad(0)), r*sin(rad(0)))
p2 = point(g1, r*cos(rad(60)), r*sin(rad(60)))
p3 = point(g1, r*cos(rad(120)), r*sin(rad(120)))
p4 = point(g1, r*cos(rad(180)), r*sin(rad(180)))
p5 = point(g1, r*cos(rad(240)), r*sin(rad(240)))
p6 = point(g1, r*cos(rad(300)), r*sin(rad(300)))
polygon(g1, p1, p2, p3, p4, p5, p6)
circle(g1, r, 0, 0)
// Radii to each vertex
seq(line(g1, point(g1,0,0), p1), line(g1, point(g1,0,0), p2), line(g1, point(g1,0,0), p3), line(g1, point(g1,0,0), p4), line(g1, point(g1,0,0), p5), line(g1, point(g1,0,0), p6))
```

### tan - Tangent Visualization
```
g1 = g2d(0, 0, 16, 8, -4, 4, -4, 4, 1)
ang = 30
O = point(g1, 0, 0)
// Unit circle
circle(g1, 1, O)
// Radius at angle
v1 = polarvector(g1, 1, ang)
// Tangent line at x=1
tanHeight = tan(rad(ang))
vector(g1, 1, 0, 1, tanHeight)
dashedline(g1, end(g1, v1), point(g1, 1, tanHeight))
label(g1, tanHeight, 1.3, tanHeight/2)
change(ang, 70)
```
Shows tangent as vertical segment at x=1.

### atan2 - Angle Between Vectors
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
v1 = vector(g1, 0, 0, 4, 0)
v2 = vector(g1, 0, 0, 3, 3)
ang = deg(atan2(3, 3))
angle(g1, end(g1, v1), point(g1, 0, 0), end(g1, v2))
label(g1, ang, 2, 1)
```

---

## Exponential & Logarithmic

### exp - Exponential Growth with Plot
```
g1 = g2d(0, 0, 16, 8, -1, 3, -1, 10, 1)
plot(g1, "exp(x)")
t = 0
// Animated tangent line showing derivative = function
pt = point(g1, t, exp(t))
slope = exp(t)
tangent(g1, pt, plot(g1, "exp(x)"))
label(g1, slope, t + 0.5, exp(t))
change(t, 2)
```

### sqrt - Geometric Mean
```
g1 = g2d(0, 0, 16, 8, -1, 10, -1, 6, 1)
a = 2
b = 8
// Semicircle with diameter a+b
r = (a + b) / 2
circle(g1, r, r, 0)
// Altitude at point a from left
h = sqrt(a * b)
pt = point(g1, a, h)
line(g1, 0, 0, a + b, 0)
vector(g1, a, 0, a, h)
label(g1, h, a + 0.5, h/2)
mtext("\\sqrt{ab}", 12, 3)
```
Geometric mean as altitude in semicircle.

### log - Logarithmic Spiral
```
g1 = g2d(0, 0, 16, 8, -10, 10, -10, 10, 1)
t = 0.1
k = 0.15
r = exp(k * t)
pt = point(g1, r*cos(rad(t*30)), r*sin(rad(t*30)))
line(g1, point(g1, 0, 0), pt)
change(t, 30)
```

---

## Rounding Functions

### abs - Reflection Distance
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
// Mirror line
mirror = line(g1, 0, -4, 0, 4)
stroke(mirror, "#999")
x = -3
pt1 = point(g1, x, 2)
pt2 = point(g1, -x, 2)
dashedline(g1, pt1, pt2)
dist = abs(x) * 2
label(g1, dist, 0, 2.5)
change(x, 3)
```

### floor, ceil - Step Functions with Plot
```
g1 = g2d(0, 0, 16, 8, -1, 6, -1, 6, 1)
// Continuous line
plot(g1, "x")
// Step approximations shown as points
x = 0.5
pt1 = point(g1, x, floor(x))
pt2 = point(g1, x, ceil(x))
label(g1, floor(x), x - 0.5, floor(x))
label(g1, ceil(x), x - 0.5, ceil(x))
stroke(pt1, "blue")
stroke(pt2, "red")
change(x, 5)
```

### min, max - Bounding Box
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
// Three points
p1 = point(g1, 1, 3)
p2 = point(g1, -2, 1)
p3 = point(g1, 3, -1)
// Bounding box using min/max
xMin = min(x(p1), x(p2), x(p3))
xMax = max(x(p1), x(p2), x(p3))
yMin = min(y(p1), y(p2), y(p3))
yMax = max(y(p1), y(p2), y(p3))
// Draw bounding rectangle
polygon(g1, point(g1, xMin, yMin), point(g1, xMax, yMin), point(g1, xMax, yMax), point(g1, xMin, yMax))
stroke(polygon(g1, point(g1, xMin, yMin), point(g1, xMax, yMin), point(g1, xMax, yMax), point(g1, xMin, yMax)), "#999")
```

---

## Hyperbolic Functions

### sinh, cosh - Hyperbola Parametric
```
g1 = g2d(0, 0, 16, 8, -5, 5, -5, 5, 1)
// Hyperbola x² - y² = 1
t = -2
pt = point(g1, cosh(t), sinh(t))
// Asymptotes
dashedline(g1, -4, -4, 4, 4)
dashedline(g1, -4, 4, 4, -4)
// Trace the hyperbola
vector(g1, 0, 0, cosh(t), sinh(t))
change(t, 2)
```

### cosh - Catenary Curve
```
g1 = g2d(0, 0, 16, 8, -4, 4, 0, 6, 1)
a = 1
plot(g1, "a * cosh(x / a)")
// Hanging chain endpoints
p1 = point(g1, -3, a * cosh(-3/a))
p2 = point(g1, 3, a * cosh(3/a))
// Support structure
line(g1, -3, 6, -3, y(p1))
line(g1, 3, 6, 3, y(p2))
change(a, 2)
```
Catenary (hanging chain) with adjustable parameter.

### tanh - Sigmoid-like Activation
```
g1 = g2d(0, 0, 16, 8, -5, 5, -2, 2, 1)
plot(g1, "tanh(x)")
// Asymptotes
dashedline(g1, -5, 1, 5, 1)
dashedline(g1, -5, -1, 5, -1)
// Animated point on curve
x = -4
pt = point(g1, x, tanh(x))
label(g1, tanh(x), x + 0.5, tanh(x))
change(x, 4)
```

---

## Combined Geometric Examples

### Epicycloid (Spirograph)
```
g1 = g2d(0, 0, 16, 8, -6, 6, -6, 6, 1)
R = 3
r = 1
t = 0
// Large circle
circle(g1, R, 0, 0)
// Rolling circle center
cx = (R + r) * cos(rad(t))
cy = (R + r) * sin(rad(t))
// Point on rolling circle
px = cx + r * cos(rad(t * (R + r) / r))
py = cy + r * sin(rad(t * (R + r) / r))
circle(g1, r, cx, cy)
pt = point(g1, px, py)
line(g1, point(g1, cx, cy), pt)
change(t, 360)
```

### Polar Rose with Vectors
```
g1 = g2d(0, 0, 16, 8, -4, 4, -4, 4, 1)
n = 3
t = 0
r = 3 * cos(rad(n * t))
v1 = vector(g1, 0, 0, r*cos(rad(t)), r*sin(rad(t)))
arc(g1, 0, 0, 1, 0, t)
label(g1, t, 1.5, 0.5)
change(t, 360)
```
Three-petal rose with rotating vector.

### Cycloid with Rolling Circle
```
g1 = g2d(0, 0, 16, 8, -1, 14, -1, 5, 1)
r = 1
t = 0
// Ground line
line(g1, 0, 0, 14, 0)
// Rolling circle
cx = r * rad(t)
cy = r
circle(g1, r, cx, cy)
// Point on circle (cycloid)
px = r * (rad(t) - sin(rad(t)))
py = r * (1 - cos(rad(t)))
pt = point(g1, px, py)
// Radius to point
line(g1, point(g1, cx, cy), pt)
change(t, 720)
```

### Ellipse with Foci
```
g1 = g2d(0, 0, 16, 8, -5, 5, -4, 4, 1)
a = 4
b = 2
// Ellipse parametric
t = 0
pt = point(g1, a*cos(rad(t)), b*sin(rad(t)))
// Foci at c = sqrt(a² - b²)
c = sqrt(a*a - b*b)
f1 = point(g1, c, 0)
f2 = point(g1, -c, 0)
// Lines to foci
dashedline(g1, pt, f1)
dashedline(g1, pt, f2)
// Sum of distances (constant = 2a)
d1 = distance(pt, f1)
d2 = distance(pt, f2)
label(g1, d1 + d2, 0, 3)
change(t, 360)
```
Demonstrates ellipse focal property.

### Damped Pendulum
```
g1 = g2d(0, 0, 16, 8, -4, 4, -5, 1, 1)
t = 0
// Damped oscillation
theta = 60 * exp(-t/10) * cos(rad(t * 120))
// Pendulum
length = 4
px = length * sin(rad(theta))
py = -length * cos(rad(theta))
pivot = point(g1, 0, 0)
bob = point(g1, px, py)
line(g1, pivot, bob)
circle(g1, 0.3, bob)
// Angle arc
arc(g1, 0, 0, 1, -90, theta - 90)
change(t, 20)
```

### Fourier Square Wave Approximation
```
g1 = g2d(0, 0, 16, 8, -4, 4, -2, 2, 1)
// Square wave approximated by first 3 odd harmonics
n = 1
plot(g1, "sin(x)")
plot(g1, "sin(x) + sin(3*x)/3")
plot(g1, "sin(x) + sin(3*x)/3 + sin(5*x)/5")
stroke(plot(g1, "sin(x)"), "#ccc")
stroke(plot(g1, "sin(x) + sin(3*x)/3"), "#999")
```

### 3D Helix Projection
```
g1 = g2d(0, 0, 16, 8, -4, 4, -4, 4, 1)
t = 0
r = 2
// Helix projected to 2D (isometric-ish)
px = r * cos(rad(t * 2)) - t * 0.05
py = r * sin(rad(t * 2)) + t * 0.1
pt = point(g1, px, py)
// Shadow on ground
shadow = point(g1, px, -3)
dashedline(g1, pt, shadow)
change(t, 360)
```

---

## Function Reference

| Function | Description | Example |
|----------|-------------|---------|
| `rad(x)` | Degrees → radians | `rad(180)` → π |
| `deg(x)` | Radians → degrees | `deg(3.14)` → 180 |
| `sin(x)` | Sine (radians) | `sin(rad(30))` → 0.5 |
| `cos(x)` | Cosine (radians) | `cos(rad(60))` → 0.5 |
| `tan(x)` | Tangent (radians) | `tan(rad(45))` → 1 |
| `asin(x)` | Arc sine → radians | `deg(asin(0.5))` → 30 |
| `acos(x)` | Arc cosine → radians | `deg(acos(0.5))` → 60 |
| `atan(x)` | Arc tangent → radians | `deg(atan(1))` → 45 |
| `atan2(y,x)` | Angle from coordinates | `deg(atan2(1,1))` → 45 |
| `sinh(x)` | Hyperbolic sine | `sinh(1)` → 1.175 |
| `cosh(x)` | Hyperbolic cosine | `cosh(0)` → 1 |
| `tanh(x)` | Hyperbolic tangent | `tanh(1)` → 0.762 |
| `exp(x)` | e^x | `exp(1)` → 2.718 |
| `sqrt(x)` | Square root | `sqrt(16)` → 4 |
| `cbrt(x)` | Cube root | `cbrt(27)` → 3 |
| `log(x)` | Natural log (ln) | `log(2.718)` → 1 |
| `log10(x)` | Base-10 log | `log10(100)` → 2 |
| `log2(x)` | Base-2 log | `log2(8)` → 3 |
| `abs(x)` | Absolute value | `abs(-5)` → 5 |
| `floor(x)` | Round down | `floor(3.7)` → 3 |
| `ceil(x)` | Round up | `ceil(3.2)` → 4 |
| `round(x)` | Round nearest | `round(3.5)` → 4 |
| `sign(x)` | Sign (-1, 0, 1) | `sign(-5)` → -1 |
| `min(a,b,...)` | Minimum value | `min(3, 1, 4)` → 1 |
| `max(a,b,...)` | Maximum value | `max(3, 1, 4)` → 4 |
| `mean(a,b,...)` | Average | `mean(2, 4, 6)` → 4 |
