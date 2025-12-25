# seq

Runs multiple effects sequentially (one after another). Each effect completes before the next one starts.

## API

```
seq(effect1, effect2, ...)
       └── effects to run in sequence
```

## Code

```
g1 = g2d(2, 2, 30, 30)
pt1 = point(g1, -4, 2)
pt2 = point(g1, -2, 2)
l1 = line(g1, pt1, pt2)
c1 = circle(g1, -3, 0, 1)
tri1 = polygon(g1, -5, -2, -3, -2, -4, -1)

// Run translate, then rotate, then scale in sequence
seq(
  translate(g1, pt1, pt2, l1, c1, tri1, 6, 0),
  rotate(g1, pt1, pt2, l1, c1, tri1, 45),
  scale(g1, pt1, pt2, l1, c1, tri1, 0.5, -3, 1)
)
```

## Text Animation Example

```
eq1 = "x^2 + y^2 = 20"
m1 = mtext(5, 12, eq1)
write(m1)

// Fade out then replace
sel1 = select(m1, "x^2")
seq(fadeout(sel1), replace("a^2", sel1))
```

## Comparison with para

| Function | Behavior |
|----------|----------|
| `seq(a, b, c)` | a finishes, then b, then c |
| `para(a, b, c)` | All run at the same time |

## Use Cases

- Step-by-step transformations
- Ordered animations where timing matters
- Building up complex effects progressively
- Text replacement with fade transitions

## Related

- `para` - Run effects in parallel
- `fadeout` - Fade out animation
- `fadein` - Fade in animation
- `replace` - Replace text content
