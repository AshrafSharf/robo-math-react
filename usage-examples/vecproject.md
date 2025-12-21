# vecproject

Projects one vector onto another, returning the parallel component.

## Visual

```
              B (2,2)
             /|
            / |
           /  |  perpendicular
          /   |  component
         /    |
    *---/-----+-----> A (4,0)
        projection
        (vecproject)
```

The projection is the "shadow" of B onto the direction of A.

## API

```
vecproject(g, vectorToProject, vectorTarget)
           │        │               └── vector to project onto
           │        └─────────────────── vector being projected
           └──────────────────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

A = vector(g, 0, 0, 4, 0)
B = vector(g, 0, 0, 2, 2)

proj = vecproject(g, B, A)
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = vector(g, 0, 0, 4, 0)` | Horizontal target vector |
| `B = vector(g, 0, 0, 2, 2)` | Diagonal vector to project |
| `proj = vecproject(g, B, A)` | Projection of B onto A: (0,0) to (2,0) |

## Animation

The vector draws progressively from tail to tip.
An arrowhead appears at the end as the drawing completes.
