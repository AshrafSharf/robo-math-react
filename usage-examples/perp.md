# perp

Creates a perpendicular line or vector through a point, orthogonal to a reference.

## Visual

```
                  ^
                  |  result (perpendicular)
                  |
    *-------------*----------->  l1 (reference)
    (0,0)         pt1 (2,0)     (4,0)
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
g1 = g2d(0, 0, 10, 10)

l1 = line(g1, 0, 0, 4, 0)
v1 = vector(g1, 0, 0, 4, 0)
pt1 = point(g1, 2, 0)

perpline = perp(g1, l1, pt1)
perpvec = perp(g1, v1, pt1)
perpcustom = perp(g1, l1, pt1, 3)
```

## Comments

| Line | Explanation |
|------|-------------|
| `l1 = line(g1, 0, 0, 4, 0)` | Horizontal reference line |
| `v1 = vector(g1, 0, 0, 4, 0)` | Horizontal reference vector |
| `perpline = perp(g1, l1, pt1)` | Perpendicular line through pt1 |
| `perpvec = perp(g1, v1, pt1)` | Perpendicular vector through pt1 |
| `perpcustom = perp(g1, l1, pt1, 3)` | Perpendicular with length 3 |

## Animation

The shape draws progressively from start to end.
Lines draw as strokes, vectors include an arrowhead at the tip.
