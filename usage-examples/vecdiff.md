# vecdiff

Creates the result vector of subtracting two vectors (A - B).

## Visual

```
    A = (3, 2)
    B = (1, 1)

    A - B = (2, 1)

         A
        /
       /
      /    A - B (result)
     *------>
    / \
   /   B
  *
```

Vector subtraction: A - B is equivalent to A + (-B).

## API

```
vecdiff(g, vectorA, vectorB)
        │     │        └── vector to subtract (B)
        │     └─────────── vector to subtract from (A)
        └──────────────── graph

vecdiff(g, vectorA, vectorB, point)
        │     │        │      └── result starting point expression
        │     │        └───────── vector to subtract
        │     └────────────────── vector to subtract from
        └──────────────────────── graph

vecdiff(g, vectorA, vectorB, x, y)
        │     │        │     │  └── result start y-coordinate
        │     │        │     └───── result start x-coordinate
        │     │        └──────────── vector to subtract
        │     └───────────────────── vector to subtract from
        └────────────────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

A = vector(g, 0, 0, 3, 2)
B = vector(g, 0, 0, 1, 1)

diff = vecdiff(g, A, B)
diff2 = vecdiff(g, A, B, 1, 1)
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = vector(g, 0, 0, 3, 2)` | Vector to (3,2) |
| `B = vector(g, 0, 0, 1, 1)` | Vector to (1,1) |
| `diff = vecdiff(g, A, B)` | Result: (0,0) to (2,1) since (3-1, 2-1) |
| `diff2 = vecdiff(g, A, B, 1, 1)` | Result starting at (1,1): (1,1) to (3,2) |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
