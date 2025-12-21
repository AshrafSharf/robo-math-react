# perp

Creates a perpendicular line or vector through a point, orthogonal to a reference.

## Visual

```
                  ^
                  |  result (perpendicular)
                  |
    *-------------*----------->  L (reference)
    (0,0)         P (2,0)     (4,0)
```

Returns a line if input is a line, or a vector if input is a vector.

## API

```
perp(g, reference, point)
     │      │        └── point the perpendicular passes through
     │      └─────────── reference line or vector
     └────────────────── graph

perp(g, reference, point, length)
     │      │        │      └── custom length for perpendicular
     │      │        └───────── point the perpendicular passes through
     │      └────────────────── reference line or vector
     └───────────────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

L = line(g, 0, 0, 4, 0)
V = vector(g, 0, 0, 4, 0)
P = point(g, 2, 0)

perpLine = perp(g, L, P)
perpVec = perp(g, V, P)
perpCustom = perp(g, L, P, 3)
```

## Comments

| Line | Explanation |
|------|-------------|
| `L = line(g, 0, 0, 4, 0)` | Horizontal reference line |
| `V = vector(g, 0, 0, 4, 0)` | Horizontal reference vector |
| `perpLine = perp(g, L, P)` | Perpendicular line through P |
| `perpVec = perp(g, V, P)` | Perpendicular vector through P |
| `perpCustom = perp(g, L, P, 3)` | Perpendicular with length 3 |

## Animation

The shape draws progressively from start to end.
Lines draw as strokes, vectors include an arrowhead at the tip.
