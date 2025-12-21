# pll

Creates a parallel line or vector through a point, parallel to a reference.

## Visual

```
    P *----------->  result (parallel)


    *------------->  reference
    (0,0)        (4,0)
```

Returns a line if input is a line, or a vector if input is a vector.

## API

```
pll(g, reference, point)
    │      │        └── point the parallel passes through
    │      └─────────── reference line or vector
    └────────────────── graph

pll(g, reference, point, length)
    │      │        │      └── custom length for parallel
    │      │        └───────── point the parallel passes through
    │      └────────────────── reference line or vector
    └───────────────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

L = line(g, 0, 0, 4, 0)
V = vector(g, 0, 0, 4, 0)
P = point(g, 0, 2)

pllLine = pll(g, L, P)
pllVec = pll(g, V, P)
pllCustom = pll(g, L, P, 6)
```

## Comments

| Line | Explanation |
|------|-------------|
| `L = line(g, 0, 0, 4, 0)` | Horizontal reference line |
| `V = vector(g, 0, 0, 4, 0)` | Horizontal reference vector |
| `pllLine = pll(g, L, P)` | Parallel line through P |
| `pllVec = pll(g, V, P)` | Parallel vector through P |
| `pllCustom = pll(g, L, P, 6)` | Parallel with length 6 |

## Animation

The shape draws progressively from start to end.
Lines draw as strokes, vectors include an arrowhead at the tip.
