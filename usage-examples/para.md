# para

Runs multiple effects in parallel (simultaneously). All effects start at the same time.

## API

```
para(effect1, effect2, ...)
        └── effects to run simultaneously
```

## Code

```
# Parallel rotation of point and line
g1 = g2d(1, 2, 20, 30)
pt1 = point(g1, 2, 3)
l1 = line(g1, 4, 5, pt1)
para(rotate(g1, pt1, 40, 0, 0), rotate(g1, l1, 40, 0, 0))

# Parallel fade-in of plot and label
g2 = g2d(1, 2, 20, 30)
eq1 = "\\frac{\\sin(\\theta)}{\\cos(\\theta)}"
lbl1 = label(g2, eq1, -2, 4)
fn1 = def(x, "x^2")
plt1 = plot(g2, fn1)
para(fadein(plt1), fadein(lbl1))

# Parallel translation
g3 = g2d(2, 2, 30, 30)
pt2 = point(g3, -4, 2)
pt3 = point(g3, -2, 2)
l2 = line(g3, pt2, pt3)
c1 = circle(g3, -3, 0, 1)
tri1 = polygon(g3, -5, -2, -3, -2, -4, -1)
para(
  translate(g3, pt2, 6, 0),
  translate(g3, l2, 6, 0),
  translate(g3, c1, 6, 0),
  translate(g3, tri1, 6, 0)
)
```

## Comments

| Line | Explanation |
|------|-------------|
| `para(rotate(...), rotate(...))` | Both rotations happen at the same time |
| `para(fadein(plt1), fadein(lbl1))` | Plot and label fade in together |
| `para(translate(...), ...)` | Multiple shapes translate simultaneously |

## Comparison with seq

| Function | Behavior |
|----------|----------|
| `para(a, b, c)` | All run at the same time |
| `seq(a, b, c)` | a finishes, then b, then c |

## Use Cases

- Coordinated animations of related shapes
- Simultaneous transformations
- Synchronized reveals
- Keeping related elements in sync

## Related

- `seq` - Run effects sequentially
- `fadein` - Fade in animation
- `rotate` - Rotation effect
- `translate` - Translation effect
