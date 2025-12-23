# Change Animation Examples

The `change` function animates any coordinate-based value to a target, automatically updating all dependent shapes.

## Scalar Animation

### Basic: Animate Variable
```
G = g2d(0, 0, 20, 20)
A = 3
P = point(G, A, 6)
change(A, 8)
```
Point moves from (3,3) to (8,8) as A animates from 3 to 8.

### Cascading: Multiple Dependent Shapes
```
G = g2d(0, 0, 20, 20)
A = 3
P1 = point(G, -3, A)
P2 = point(G, A, 2)
L = line(G, P1, P2)
C = circle(G, 1, ed(G, L))
change(A, 8)
```
All shapes update together as A changes.

### Rotation Animation
```
G = g2d(2, 3, 20, 20)
A = 40
P1 = point(G, 2, 3)
rotate(G, P1, A)
change(A, 200)
```
Point rotates as angle A animates from 40 to 200 degrees.

---

## Point Animation

### 2D Point
```
G = g2d(0, 0, 20, 20)
P = point(G, 2, 3)
L = line(G, P, point(G, 7,7))
change(P,point(G, -2,3))
```
Point P animates to (8,7), line L updates automatically.

### 3D Point
```
G = g3d(0, 0, 20, 20)
P = point3d(G, 1, 2, 3)
L = line3d(G, P, point3d(G, 5, 5, 5))
change(P, point3d(G, 4, 5, 6))
```
3D point animates, dependent line updates.

---

## Line Animation

### 2D Line
```
G = g2d(0, 0, 20, 20)
L = line(G, 0, 0, 5, 5)
P = point(G, mid(L))
change(L, line(G, 2, 2, 8, 8))
```
Line animates to new position, midpoint updates.

### 3D Line
```
G = g3d(0, 0, 20, 20)
L = line3d(G, 0, 0, 0, 3, 3, 3)
change(L, line3d(G, 1, 1, 1, 5, 5, 5))
```
3D line animates to new position.

---

## Vector Animation

### 2D Vector
```
G = g2d(0, 0, 20, 20)
V = vector(G, 0, 0, 3, 4)
change(V, vector(G, 1, 1, 6, 8))
```
Vector animates from one position to another.

### 3D Vector
```
G = g3d(0, 0, 20, 20)
V = vector3d(G, 0, 0, 0, 2, 3, 4)
change(V, vector3d(G, 1, 1, 1, 5, 6, 7))
```
3D vector animates to new position.

---

## Plot Animation

### Animated Sine Wave Amplitude
```
G = g2d(0, 0, 20, 8, -10, 10, -5, 5, 1)
a = 1
P = plot(G, "a * sin(x)")
change(a, 5)
```
Sine wave amplitude animates from 1 to 5.

### Animated Frequency
```
G = g2d(0, 0, 20, 20)
f = 1
P = plot(G, "sin(f * x)")
change(f, 3)
```
Sine wave frequency animates from 1 to 3.

### Phase Shift
```
G = g2d(0, 0, 20, 8, -10, 10, -2, 2, 1)
p = 0
P = plot(G, "sin(x + p)")
change(p, 6.28)
```
Sine wave shifts one full period.

---

## Parametric Plot Animation

### Animated Circle Radius
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
r = 1
P = paraplot(G, "r * cos(t)", "r * sin(t)")
change(r, 4)
```
Circle expands from radius 1 to 4.

### Animated Ellipse
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
a = 1
b = 2
P = paraplot(G, "a * cos(t)", "b * sin(t)")
change(a, 4)
```
Ellipse width animates while height stays constant.

### Lissajous Curve
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
n = 1
P = paraplot(G, "3 * cos(t)", "3 * sin(n * t)", 0, 6.28)
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
