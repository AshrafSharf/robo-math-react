# FromTo Animation Examples

## Basic: Point Animation
```
G = g2d(0, 0, 20, 20)
A = 3
P = point(G, A, A)
fromTo(A, 3, 8)
```
Point moves from (3,3) to (8,8).

## Cascading: Multiple Dependent Shapes
```
G = g2d(0, 0, 20, 20)
A = 3
P1 = point(G, -3, A)
P2 = point(G, A, 2)
L = line(G, P1, P2)
C = circle(G, 1, ed(G, L))
fromTo(A, 3, 8)
```
All shapes update together as A changes.

## Plot: Animated Sine Wave Amplitude
```
G = g2d(0, 0, 20, 8, -10, 10, -5, 5, 1)
a = 1
P = plot(G, "a * sin(x)")
fromTo(a, 1, 5)
```
Sine wave amplitude animates from 1 to 5.

## Plot: Animated Frequency
```
G = g2d(0, 0, 20, 20)
f = 1
P = plot(G, "sin(f * x)")
fromTo(f, 1, 3)
```
Sine wave frequency animates from 1 to 3.

## Plot: Multiple Parameters
```
G = g2d(0, 0, 20, 8, -10, 10, -5, 5, 1)
a = 1
b = 1
P = plot(G, "a * sin(b * x)")
fromTo(a, 1, 3)
```
Amplitude changes while frequency stays constant.

## Plot: Phase Shift
```
G = g2d(0, 0, 20, 8, -10, 10, -2, 2, 1)
p = 0
P = plot(G, "sin(x + p)")
fromTo(p, 0, 6.28)
```
Sine wave shifts one full period.

## Paraplot: Animated Circle Radius
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
r = 1
P = paraplot(G, "r * cos(t)", "r * sin(t)")
fromTo(r, 1, 4)
```
Circle expands from radius 1 to 4.

## Paraplot: Animated Ellipse
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
a = 1
b = 2
P = paraplot(G, "a * cos(t)", "b * sin(t)")
fromTo(a, 1, 4)
```
Ellipse width animates while height stays constant.

## Paraplot: Lissajous Curve
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
n = 1
P = paraplot(G, "3 * cos(t)", "3 * sin(n * t)", 0, 6.28)
fromTo(n, 1, 5)
```
Lissajous pattern morphs as frequency ratio changes.