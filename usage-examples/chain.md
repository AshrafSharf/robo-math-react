# chain

Positions vector B so its tail is at vector A's tip (tail-to-tip method).

## Visual

```
    Before:
    A: *------->
       (0,0)  (3,0)

    B: *
       |\
       | \
       |  v
       (0,0)

    After chain(g, A, B):
           A's tip
              v
    *-------->*
    A         |\
              | \
              |  v  B chained
              (3,0)
```

Essential for vector addition visualization using the tip-to-tail method.

## API

```
chain(g, vectorA, vectorB)
      │     │        └── vector to be moved (its tail goes to A's tip)
      │     └─────────── target vector (defines attachment point)
      └──────────────── graph
```

## Code

```
g = g2d(0, 0, 10, 10)

A = vector(g, 0, 0, 3, 0)
B = vector(g, 0, 0, 0, 2)

chained = chain(g, A, B)
```

## Comments

| Line | Explanation |
|------|-------------|
| `A = vector(g, 0, 0, 3, 0)` | Horizontal vector |
| `B = vector(g, 0, 0, 0, 2)` | Vertical vector |
| `chained = chain(g, A, B)` | B positioned at A's tip: (3,0) to (3,2) |

## Animation

A ghost copy of B slides from its original position to A's tip.
The translation animates smoothly showing the tail-to-tip connection.
