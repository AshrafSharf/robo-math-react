# pll

Creates a parallel line or vector through a point, parallel to a reference.

## Visual

```
    pt1 *----------->  result (parallel)


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
g1 = g2d(0, 0, 10, 10)

l1 = line(g1, 0, 0, 4, 0)
v1 = vector(g1, 0, 0, 4, 0)
pt1 = point(g1, 0, 2)

pllline = pll(g1, l1, pt1)
pllvec = pll(g1, v1, pt1)
pllcustom = pll(g1, l1, pt1, 6)
```

## Comments

| Line | Explanation |
|------|-------------|
| `l1 = line(g1, 0, 0, 4, 0)` | Horizontal reference line |
| `v1 = vector(g1, 0, 0, 4, 0)` | Horizontal reference vector |
| `pllline = pll(g1, l1, pt1)` | Parallel line through pt1 |
| `pllvec = pll(g1, v1, pt1)` | Parallel vector through pt1 |
| `pllcustom = pll(g1, l1, pt1, 6)` | Parallel with length 6 |

## Animation

The shape draws progressively from start to end.
Lines draw as strokes, vectors include an arrowhead at the tip.
