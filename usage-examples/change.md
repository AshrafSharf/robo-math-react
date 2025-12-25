# Change Animation Examples

The `change` function animates any coordinate-based value to a target, automatically updating all dependent shapes.

## Scalar Animation

### Basic: Animate Variable
```
g1 = g2d(0, 0, 20, 20)
a = 3
pt1 = point(g1, a, 6)
change(a, 8)
```
Point moves from (3,3) to (8,8) as a animates from 3 to 8.

### Cascading: Multiple Dependent Shapes
```
g1 = g2d(0, 0, 20, 20)
a = 3
pt1 = point(g1, -3, a)
pt2 = point(g1, a, 2)
l1 = line(g1, pt1, pt2)
c1 = circle(g1, 1, end(g1, l1))
change(a, 8)
```
All shapes update together as a changes.

### Rotation Animation
```
g1 = g2d(2, 3, 20, 20)
a = 40
pt1 = point(g1, 2, 3)
rotate(g1, pt1, a)
change(a, 200)
```
Point rotates as angle a animates from 40 to 200 degrees.

---

## Point Animation

### 2D Point
```
g1 = g2d(0, 0, 20, 20)
pt1 = point(g1, 2, 3)
l1 = line(g1, pt1, point(g1, 7, 7))
change(pt1, point(g1, -2, 3))
```
Point pt1 animates to (-2,3), line l1 updates automatically.

### 3D Point
```
g1 = g3d(0, 0, 20, 20)
pt1 = point3d(g1, 1, 2, 3)
l1 = line3d(g1, pt1, point3d(g1, 5, 5, 5))
change(pt1, point3d(g1, 4, 5, 6))
```
3D point animates, dependent line updates.

---

## Line Animation

### 2D Line
```
g1 = g2d(0, 0, 20, 20)
l1 = line(g1, 0, 0, 5, 5)
pt1 = point(g1, mid(l1))
change(l1, line(g1, 2, 2, 8, 8))
```
Line animates to new position, midpoint updates.

### 3D Line
```
g1 = g3d(0, 0, 20, 20)
l1 = line3d(g1, 0, 0, 0, 3, 3, 3)
change(l1, line3d(g1, 1, 1, 1, 5, 5, 5))
```
3D line animates to new position.

---

## Vector Animation

### 2D Vector
```
g1 = g2d(0, 0, 20, 20)
v1 = vector(g1, 0, 0, 3, 4)
change(v1, vector(g1, 1, 1, 6, 8))
```
Vector animates from one position to another.

### 3D Vector
```
g1 = g3d(0, 0, 20, 20)
v1 = vector3d(g1, 0, 0, 0, 2, 3, 4)
change(v1, vector3d(g1, 1, 1, 1, 5, 6, 7))
```
3D vector animates to new position.

---

## Plot Animation

### Animated Sine Wave Amplitude
```
g1 = g2d(0, 0, 20, 8, -10, 10, -5, 5, 1)
a = 1
plt1 = plot(g1, "a * sin(x)")
change(a, 5)
```
Sine wave amplitude animates from 1 to 5.

### Animated Frequency
```
g1 = g2d(0, 0, 20, 20)
f = 1
plt1 = plot(g1, "sin(f * x)")
change(f, 3)
```
Sine wave frequency animates from 1 to 3.

### Phase Shift
```
g1 = g2d(0, 0, 20, 8, -10, 10, -2, 2, 1)
p = 0
plt1 = plot(g1, "sin(x + p)")
change(p, 6.28)
```
Sine wave shifts one full period.

---

## Parametric Plot Animation

### Animated Circle Radius
```
g1 = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
r = 1
plt1 = paraplot(g1, "r * cos(t)", "r * sin(t)")
change(r, 4)
```
Circle expands from radius 1 to 4.

### Animated Ellipse
```
g1 = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
a = 1
b = 2
plt1 = paraplot(g1, "a * cos(t)", "b * sin(t)")
change(a, 4)
```
Ellipse width animates while height stays constant.

### Lissajous Curve
```
g1 = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
n = 1
plt1 = paraplot(g1, "3 * cos(t)", "3 * sin(n * t)", 0, 6.28)
change(n, 5)
```
Lissajous pattern morphs as frequency ratio changes.

---

## Type Safety

Source and target must be the same type:
```
// Valid
change(point, point)
change(line, line)
change(vector, vector)
change(scalar, scalar)

// Invalid - will throw error
change(point, line)   // Error: types don't match
change(point, scalar) // Error: types don't match
```
