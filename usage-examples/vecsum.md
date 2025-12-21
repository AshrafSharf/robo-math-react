# vecsum

Creates the result vector of adding two vectors (A + B).

## Visual

```
              B
              ^
             /|
            / |
    A      /  |
    *---->*   |
          |   |
          +---+ A + B (result)
          |      \
          *-------\-->
                   result = vecsum
```

The result vector represents the diagonal of the parallelogram formed by A and B.

## API

```
vecsum(g, vectorA, vectorB)
       │     │        └── second vector
       │     └─────────── first vector
       └──────────────── graph

vecsum(g, vectorA, vectorB, point)
       │     │        │      └── result starting point expression
       │     │        └───────── second vector
       │     └────────────────── first vector
       └──────────────────────── graph

vecsum(g, vectorA, vectorB, x, y)
       │     │        │     │  └── result start y-coordinate
       │     │        │     └───── result start x-coordinate
       │     │        └──────────── second vector
       │     └───────────────────── first vector
       └────────────────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

A = vector(g, 0, 0, 3, 0)
B = vector(g, 0, 0, 0, 2)

sum = vecsum(g, A, B)
sum2 = vecsum(g, A, B, 1, 1)
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = vector(g, 0, 0, 3, 0)` | Horizontal vector (3,0) |
| `B = vector(g, 0, 0, 0, 2)` | Vertical vector (0,2) |
| `sum = vecsum(g, A, B)` | Result: (0,0) to (3,2) |
| `sum2 = vecsum(g, A, B, 1, 1)` | Result starting at (1,1): (1,1) to (4,3) |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
